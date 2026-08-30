"""SQLite-backed persistence on the stdlib sqlite3 module (T034).

A single dedicated worker thread owns the database connection; every
operation is submitted through a queue and awaited as a future, so the
event loop never blocks and concurrent callers are serialized without
corrupting state. The database runs in WAL mode for concurrent readers.
"""

from __future__ import annotations

import asyncio
import json
import logging
import queue
import sqlite3
import threading
import typing as t
from collections.abc import Callable
from pathlib import Path

from telebot_py.storage.base import BasePersistence, ConversationKey

logger = logging.getLogger("telebot_py.storage.sqlite")

T = t.TypeVar("T")

_WorkItem = tuple[
    Callable[[sqlite3.Connection], t.Any], asyncio.AbstractEventLoop, "asyncio.Future[t.Any]"
]

_CREATE_TABLES = """
CREATE TABLE IF NOT EXISTS user_data (
    user_id INTEGER PRIMARY KEY,
    data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS chat_data (
    chat_id TEXT PRIMARY KEY,
    data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bot_data (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS conversations (
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    state TEXT NOT NULL,
    PRIMARY KEY (name, key)
);
CREATE TABLE IF NOT EXISTS jobs (
    name TEXT PRIMARY KEY,
    data TEXT NOT NULL
);
"""


class SQLitePersistence(BasePersistence):
    """Durable persistence backed by a SQLite database file.

    All access happens on one worker thread (stdlib ``sqlite3`` connections
    are not safe to share across threads); awaitables handed back to callers
    resolve when the worker finishes, keeping the event loop free.

    Example:
        >>> persistence = SQLitePersistence("data/bot.sqlite3")

    Attributes:
        db_path: The database file path (or ``":memory:"``).
    """

    def __init__(self, db_path: str | Path) -> None:
        """Open (creating if needed) the database and start the worker thread.

        Args:
            db_path: Database file path; parent directories are created.
                ``":memory:"`` yields a transient in-memory database.

        Raises:
            RuntimeError: If the worker cannot open the database.
        """
        self.db_path = str(db_path)
        if self.db_path != ":memory:":
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._queue: queue.Queue[_WorkItem | None] = queue.Queue()
        self._opened = threading.Event()
        self._open_error: BaseException | None = None
        self._stopped = False
        self._thread = threading.Thread(
            target=self._worker_loop, name="telebot_py-sqlite", daemon=True
        )
        self._thread.start()
        if not self._opened.wait(timeout=10):
            msg = f"SQLite worker did not open {self.db_path} within 10s"
            raise RuntimeError(msg)
        if self._open_error is not None:
            msg = f"SQLite worker failed to open {self.db_path}"
            raise RuntimeError(msg) from self._open_error

    def _worker_loop(self) -> None:
        """Own the sole connection; drain the queue until the sentinel."""
        try:
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
        except sqlite3.Error as exc:
            self._open_error = exc
            self._opened.set()
            return
        try:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA synchronous=NORMAL")
            conn.executescript(_CREATE_TABLES)
        except sqlite3.Error as exc:
            self._open_error = exc
            conn.close()
            self._opened.set()
            return
        self._opened.set()
        while True:
            item = self._queue.get()
            if item is None:
                break
            operation, loop, future = item
            try:
                result = operation(conn)
            except BaseException as exc:  # relay every failure to the awaiter
                loop.call_soon_threadsafe(future.set_exception, exc)
            else:
                loop.call_soon_threadsafe(future.set_result, result)
        conn.close()

    async def _submit(self, operation: Callable[[sqlite3.Connection], T]) -> T:
        """Run ``operation`` on the worker thread and await its result.

        Args:
            operation: Callable receiving the worker's connection.

        Returns:
            Whatever ``operation`` returned.

        Raises:
            RuntimeError: If the persistence has been shut down.
        """
        if self._stopped:
            msg = "SQLitePersistence is shut down"
            raise RuntimeError(msg)
        loop = asyncio.get_running_loop()
        future: asyncio.Future[T] = loop.create_future()
        self._queue.put((operation, loop, future))
        return await future

    async def get_conversations(self, name: str) -> dict[ConversationKey, t.Any]:
        """Return all persisted conversation states for ``name``.

        Args:
            name: The conversation handler's persistence name.

        Returns:
            Mapping of conversation key tuples to stored states.
        """

        def operation(conn: sqlite3.Connection) -> dict[ConversationKey, t.Any]:
            rows = conn.execute(
                "SELECT key, state FROM conversations WHERE name = ?", (name,)
            ).fetchall()
            result: dict[ConversationKey, t.Any] = {}
            for encoded_key, encoded_state in rows:
                try:
                    result[tuple(json.loads(encoded_key))] = json.loads(encoded_state)
                except (json.JSONDecodeError, ValueError, TypeError):
                    logger.warning("Skipping corrupt conversation row under %r", name)
            return result

        return await self._submit(operation)

    async def update_conversation(self, name: str, key: ConversationKey, state: t.Any) -> None:
        """Persist one conversation state; ``None`` deletes the entry.

        Args:
            name: The conversation handler's persistence name.
            key: The conversation key tuple.
            state: The new state, or ``None`` to delete.
        """
        encoded_key = json.dumps(list(key))

        def operation(conn: sqlite3.Connection) -> None:
            if state is None:
                conn.execute(
                    "DELETE FROM conversations WHERE name = ? AND key = ?",
                    (name, encoded_key),
                )
            else:
                conn.execute(
                    "INSERT OR REPLACE INTO conversations (name, key, state) VALUES (?, ?, ?)",
                    (name, encoded_key, json.dumps(state)),
                )
            conn.commit()

        await self._submit(operation)

    async def get_chat_data(self) -> dict[int | str, dict[t.Any, t.Any]]:
        """Return all persisted per-chat data dicts keyed by chat id.

        Returns:
            Mapping of chat ids to their data dicts.
        """

        def operation(conn: sqlite3.Connection) -> dict[int | str, dict[t.Any, t.Any]]:
            rows = conn.execute("SELECT chat_id, data FROM chat_data").fetchall()
            result: dict[int | str, dict[t.Any, t.Any]] = {}
            for encoded_id, data in rows:
                try:
                    chat_id = json.loads(encoded_id)
                    result[chat_id] = json.loads(data)
                except (json.JSONDecodeError, ValueError, TypeError):
                    logger.warning("Skipping corrupt chat_data row %r", encoded_id)
            return result

        return await self._submit(operation)

    async def update_chat_data(self, chat_data: dict[int | str, dict[t.Any, t.Any]]) -> None:
        """Replace the stored per-chat data wholesale.

        Args:
            chat_data: The full mapping of chat ids to data dicts.
        """
        rows = [(json.dumps(chat_id), json.dumps(data)) for chat_id, data in chat_data.items()]

        def operation(conn: sqlite3.Connection) -> None:
            conn.execute("DELETE FROM chat_data")
            conn.executemany("INSERT INTO chat_data (chat_id, data) VALUES (?, ?)", rows)
            conn.commit()

        await self._submit(operation)

    async def get_user_data(self) -> dict[int, dict[t.Any, t.Any]]:
        """Return all persisted per-user data dicts keyed by user id.

        Returns:
            Mapping of user ids to their data dicts.
        """

        def operation(conn: sqlite3.Connection) -> dict[int, dict[t.Any, t.Any]]:
            rows = conn.execute("SELECT user_id, data FROM user_data").fetchall()
            result: dict[int, dict[t.Any, t.Any]] = {}
            for user_id, data in rows:
                try:
                    result[int(user_id)] = json.loads(data)
                except (json.JSONDecodeError, ValueError, TypeError):
                    logger.warning("Skipping corrupt user_data row %r", user_id)
            return result

        return await self._submit(operation)

    async def update_user_data(self, user_data: dict[int, dict[t.Any, t.Any]]) -> None:
        """Replace the stored per-user data wholesale.

        Args:
            user_data: The full mapping of user ids to data dicts.
        """
        rows = [(int(user_id), json.dumps(data)) for user_id, data in user_data.items()]

        def operation(conn: sqlite3.Connection) -> None:
            conn.execute("DELETE FROM user_data")
            conn.executemany("INSERT INTO user_data (user_id, data) VALUES (?, ?)", rows)
            conn.commit()

        await self._submit(operation)

    async def get_bot_data(self) -> dict[t.Any, t.Any]:
        """Return the persisted global bot data dict.

        Returns:
            The bot data dict; empty when none stored.
        """

        def operation(conn: sqlite3.Connection) -> dict[t.Any, t.Any]:
            row = conn.execute("SELECT data FROM bot_data WHERE id = 1").fetchone()
            if row is None:
                return {}
            try:
                parsed = json.loads(row[0])
            except (json.JSONDecodeError, ValueError, TypeError):
                return {}
            return parsed if isinstance(parsed, dict) else {}

        return await self._submit(operation)

    async def update_bot_data(self, bot_data: dict[t.Any, t.Any]) -> None:
        """Replace the stored global bot data.

        Args:
            bot_data: The new bot data dict.
        """
        payload = json.dumps(bot_data)

        def operation(conn: sqlite3.Connection) -> None:
            conn.execute("INSERT OR REPLACE INTO bot_data (id, data) VALUES (1, ?)", (payload,))
            conn.commit()

        await self._submit(operation)

    async def flush(self) -> None:
        """No-op: every operation commits before resolving."""

    async def shutdown(self) -> None:
        """Stop the worker thread and close the connection; idempotent."""
        if self._stopped:
            return
        self._stopped = True
        self._queue.put(None)
        await asyncio.to_thread(self._thread.join, 10)
