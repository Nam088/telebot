"""Persistence contract and the key/value adapter it can be built on (T032).

``BasePersistence`` is the python-telegram-bot-shaped contract the kernel and
persistent ConversationHandlers consume (contracts/public-api.md section 7).
``KeyValuePersistence`` implements that whole contract on top of the raw
:class:`~telebot_py.storage.driver.StorageDriver` key/value surface, so new
backends only provide ``get_raw``/``set_raw``/``delete_raw``.
"""

from __future__ import annotations

import abc
import json
import logging
import typing as t
from dataclasses import asdict

from telebot_py.storage.driver import PersistedJob, StorageDriver

logger = logging.getLogger("telebot_py.storage")

#: Conversation storage key: a tuple of chat/user/message ids depending on
#: the handler's per_chat/per_user/per_message flags.
ConversationKey = tuple[t.Any, ...]

_CHAT_PREFIX = "chat:"
_USER_PREFIX = "user:"
_BOT_KEY = "bot:global_data"
_CHAT_INDEX_KEY = "chat:index"
_USER_INDEX_KEY = "user:index"
_JOBS_KEY = "bot:jobs"


class BasePersistence(abc.ABC):
    """Contract every persistence backend implements (FR-009).

    All methods are awaitable so backends can keep I/O off the event loop.
    ``update_*`` replaces the stored data wholesale (python-telegram-bot
    semantics); ``refresh_*`` returns a fresh snapshot. Passing ``None`` as a
    conversation state deletes that conversation entry.

    Example:
        >>> app = Application.builder().token(token).persistence(backend).build()
    """

    @abc.abstractmethod
    async def get_conversations(self, name: str) -> dict[ConversationKey, t.Any]:
        """Return all persisted conversation states for ``name``.

        Args:
            name: The conversation handler's persistence name.

        Returns:
            Mapping of conversation key tuples to stored states; empty when
            the name is unknown.
        """

    @abc.abstractmethod
    async def update_conversation(self, name: str, key: ConversationKey, state: t.Any) -> None:
        """Persist one conversation state (write-through on every transition).

        Args:
            name: The conversation handler's persistence name.
            key: The conversation key tuple, e.g. ``(chat_id, user_id)``.
            state: The new state; ``None`` deletes the entry.
        """

    async def refresh_conversations(self, name: str) -> dict[ConversationKey, t.Any]:
        """Return a fresh snapshot of the conversations stored under ``name``.

        Args:
            name: The conversation handler's persistence name.

        Returns:
            Mapping of conversation key tuples to stored states.
        """
        return await self.get_conversations(name)

    @abc.abstractmethod
    async def get_chat_data(self) -> dict[int | str, dict[t.Any, t.Any]]:
        """Return all persisted per-chat data dicts keyed by chat id.

        Returns:
            Mapping of chat ids to their data dicts; empty when none stored.
        """

    @abc.abstractmethod
    async def update_chat_data(self, chat_data: dict[int | str, dict[t.Any, t.Any]]) -> None:
        """Replace the stored per-chat data wholesale.

        Args:
            chat_data: The full mapping of chat ids to data dicts.
        """

    async def refresh_chat_data(self) -> dict[int | str, dict[t.Any, t.Any]]:
        """Return a fresh snapshot of the stored per-chat data.

        Returns:
            Mapping of chat ids to their data dicts.
        """
        return await self.get_chat_data()

    @abc.abstractmethod
    async def get_user_data(self) -> dict[int, dict[t.Any, t.Any]]:
        """Return all persisted per-user data dicts keyed by user id.

        Returns:
            Mapping of user ids to their data dicts; empty when none stored.
        """

    @abc.abstractmethod
    async def update_user_data(self, user_data: dict[int, dict[t.Any, t.Any]]) -> None:
        """Replace the stored per-user data wholesale.

        Args:
            user_data: The full mapping of user ids to data dicts.
        """

    async def refresh_user_data(self) -> dict[int, dict[t.Any, t.Any]]:
        """Return a fresh snapshot of the stored per-user data.

        Returns:
            Mapping of user ids to their data dicts.
        """
        return await self.get_user_data()

    @abc.abstractmethod
    async def get_bot_data(self) -> dict[t.Any, t.Any]:
        """Return the persisted global bot data dict.

        Returns:
            The bot data dict; empty when none stored.
        """

    @abc.abstractmethod
    async def update_bot_data(self, bot_data: dict[t.Any, t.Any]) -> None:
        """Replace the stored global bot data.

        Args:
            bot_data: The new bot data dict.
        """

    async def refresh_bot_data(self) -> dict[t.Any, t.Any]:
        """Return a fresh snapshot of the stored global bot data.

        Returns:
            The bot data dict.
        """
        return await self.get_bot_data()

    async def flush(self) -> None:  # noqa: B027 — concrete optional hook, not an abstract method
        """Flush any buffered state to the underlying storage."""

    async def shutdown(self) -> None:
        """Flush and release backend resources."""
        await self.flush()


def _loads_dict(raw: str | None) -> dict[t.Any, t.Any]:
    """Parse a JSON object from ``raw``, tolerating missing/corrupt values."""
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        logger.warning("Ignoring corrupt persisted value: %.60s", raw)
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _loads_list(raw: str | None) -> list[t.Any]:
    """Parse a JSON array from ``raw``, tolerating missing/corrupt values."""
    if not raw:
        return []
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        logger.warning("Ignoring corrupt persisted value: %.60s", raw)
        return []
    return parsed if isinstance(parsed, list) else []


class KeyValuePersistence(BasePersistence):
    """Adapter building the full contract on a raw key/value store.

    Subclasses override :meth:`get_raw`, :meth:`set_raw`, and
    :meth:`delete_raw` (or inject a
    :class:`~telebot_py.storage.driver.StorageDriver`) and inherit
    conversations, chat/user/bot data, and jobs for free.

    Example:
        >>> class DictPersistence(KeyValuePersistence):
        ...     async def get_raw(self, key): return self.store.get(key)
        ...     async def set_raw(self, key, value): self.store[key] = value
        ...     async def delete_raw(self, key): self.store.pop(key, None)
    """

    def __init__(self, driver: StorageDriver | None = None) -> None:
        """Initialize the adapter, optionally delegating to ``driver``.

        Args:
            driver: Raw key/value store; when omitted the subclass must
                override the raw methods directly.
        """
        self._driver = driver

    async def get_raw(self, key: str) -> str | None:
        """Return the raw value for ``key`` from the backing driver.

        Args:
            key: The storage key to look up.

        Returns:
            The raw JSON string, or ``None`` when absent.

        Raises:
            NotImplementedError: When no driver was injected and the subclass
                does not override this method.
        """
        if self._driver is not None:
            return await self._driver.get_raw(key)
        msg = "KeyValuePersistence subclasses must override get_raw or inject a driver"
        raise NotImplementedError(msg)

    async def set_raw(self, key: str, value: str) -> None:
        """Store ``value`` under ``key`` in the backing driver.

        Args:
            key: The storage key to write.
            value: Serialized JSON text to persist.

        Raises:
            NotImplementedError: When no driver was injected and the subclass
                does not override this method.
        """
        if self._driver is not None:
            await self._driver.set_raw(key, value)
            return
        msg = "KeyValuePersistence subclasses must override set_raw or inject a driver"
        raise NotImplementedError(msg)

    async def delete_raw(self, key: str) -> None:
        """Remove ``key`` from the backing driver; no-op when absent.

        Args:
            key: The storage key to delete.

        Raises:
            NotImplementedError: When no driver was injected and the subclass
                does not override this method.
        """
        if self._driver is not None:
            await self._driver.delete_raw(key)
            return
        msg = "KeyValuePersistence subclasses must override delete_raw or inject a driver"
        raise NotImplementedError(msg)

    async def flush(self) -> None:
        """Flush the backing driver when one was injected."""
        if self._driver is not None:
            await self._driver.flush()

    async def get_conversations(self, name: str) -> dict[ConversationKey, t.Any]:
        """Return all persisted conversation states for ``name``.

        Args:
            name: The conversation handler's persistence name.

        Returns:
            Mapping of conversation key tuples to stored states.
        """
        raw = await self.get_raw(f"conv:{name}")
        result: dict[ConversationKey, t.Any] = {}
        for encoded_key, encoded_state in _loads_dict(raw).items():
            try:
                key = tuple(json.loads(encoded_key))
                state = json.loads(str(encoded_state))
            except (json.JSONDecodeError, ValueError, TypeError):
                logger.warning("Skipping corrupt conversation entry under %r", name)
                continue
            result[key] = state
        return result

    async def update_conversation(self, name: str, key: ConversationKey, state: t.Any) -> None:
        """Persist one conversation state; ``None`` deletes the entry.

        Args:
            name: The conversation handler's persistence name.
            key: The conversation key tuple.
            state: The new state, or ``None`` to delete.
        """
        storage_key = f"conv:{name}"
        conversations = _loads_dict(await self.get_raw(storage_key))
        encoded_key = json.dumps(list(key))
        if state is None:
            conversations.pop(encoded_key, None)
        else:
            conversations[encoded_key] = json.dumps(state)
        await self.set_raw(storage_key, json.dumps(conversations))

    async def _get_indexed_dicts(
        self, prefix: str, index_key: str
    ) -> dict[t.Any, dict[t.Any, t.Any]]:
        """Collect every ``prefix:<id>`` value listed in the index blob."""
        result: dict[t.Any, dict[t.Any, t.Any]] = {}
        for entry_id in _loads_list(await self.get_raw(index_key)):
            data = _loads_dict(await self.get_raw(f"{prefix}{json.dumps(entry_id)}"))
            result[entry_id] = data
        return result

    async def _replace_indexed_dicts(
        self, prefix: str, index_key: str, data: dict[t.Any, dict[t.Any, t.Any]]
    ) -> None:
        """Wholesale-replace ``prefix:<id>`` entries and their index."""
        previous = _loads_list(await self.get_raw(index_key))
        for entry_id in previous:
            if entry_id not in data:
                await self.delete_raw(f"{prefix}{json.dumps(entry_id)}")
        for entry_id, value in data.items():
            await self.set_raw(f"{prefix}{json.dumps(entry_id)}", json.dumps(value))
        await self.set_raw(index_key, json.dumps(list(data)))

    async def get_chat_data(self) -> dict[int | str, dict[t.Any, t.Any]]:
        """Return all persisted per-chat data dicts keyed by chat id.

        Returns:
            Mapping of chat ids to their data dicts.
        """
        data = await self._get_indexed_dicts(_CHAT_PREFIX, _CHAT_INDEX_KEY)
        return t.cast("dict[int | str, dict[t.Any, t.Any]]", data)

    async def update_chat_data(self, chat_data: dict[int | str, dict[t.Any, t.Any]]) -> None:
        """Replace the stored per-chat data wholesale.

        Args:
            chat_data: The full mapping of chat ids to data dicts.
        """
        await self._replace_indexed_dicts(_CHAT_PREFIX, _CHAT_INDEX_KEY, chat_data)

    async def get_user_data(self) -> dict[int, dict[t.Any, t.Any]]:
        """Return all persisted per-user data dicts keyed by user id.

        Returns:
            Mapping of user ids to their data dicts.
        """
        data = await self._get_indexed_dicts(_USER_PREFIX, _USER_INDEX_KEY)
        return t.cast("dict[int, dict[t.Any, t.Any]]", data)

    async def update_user_data(self, user_data: dict[int, dict[t.Any, t.Any]]) -> None:
        """Replace the stored per-user data wholesale.

        Args:
            user_data: The full mapping of user ids to data dicts.
        """
        await self._replace_indexed_dicts(_USER_PREFIX, _USER_INDEX_KEY, user_data)

    async def get_bot_data(self) -> dict[t.Any, t.Any]:
        """Return the persisted global bot data dict.

        Returns:
            The bot data dict; empty when none stored.
        """
        return _loads_dict(await self.get_raw(_BOT_KEY))

    async def update_bot_data(self, bot_data: dict[t.Any, t.Any]) -> None:
        """Replace the stored global bot data.

        Args:
            bot_data: The new bot data dict.
        """
        await self.set_raw(_BOT_KEY, json.dumps(bot_data))

    async def get_jobs(self) -> list[PersistedJob]:
        """Return persisted job definitions, skipping corrupt rows.

        Returns:
            The list of persisted jobs, possibly empty.
        """
        jobs: list[PersistedJob] = []
        for entry in _loads_list(await self.get_raw(_JOBS_KEY)):
            if not isinstance(entry, dict) or "name" not in entry or "next_run" not in entry:
                continue
            jobs.append(
                PersistedJob(
                    name=str(entry["name"]),
                    next_run=float(entry["next_run"]),
                    interval=entry.get("interval"),
                    rrule=entry.get("rrule"),
                    timezone=entry.get("timezone"),
                    data=entry.get("data"),
                )
            )
        return jobs

    async def set_jobs(self, jobs: list[PersistedJob]) -> None:
        """Overwrite the persisted job definitions.

        Args:
            jobs: The full list of jobs to persist.
        """
        await self.set_raw(_JOBS_KEY, json.dumps([asdict(job) for job in jobs]))
