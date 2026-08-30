"""Unit tests for persistence backends (T027).

BasePersistence contract conformance parametrized across Memory/JSON/SQLite,
plus backend-specific guarantees: JSON atomic writes (tmp + os.replace) and
SQLite worker-thread serialization with WAL mode.
"""

from __future__ import annotations

import asyncio
import json
import os
import sqlite3
from collections.abc import AsyncIterator
from pathlib import Path

import pytest

from telebot_py.storage import JSONPersistence, MemoryPersistence, SQLitePersistence
from telebot_py.storage.base import BasePersistence


def stray_tmp_files(directory: Path) -> list[Path]:
    """Leftover ``*.tmp`` files in ``directory`` (sync; keeps async tests clean)."""
    return list(directory.glob("*.tmp"))


@pytest.fixture(params=["memory", "json", "sqlite"])
async def persistence(
    request: pytest.FixtureRequest, tmp_path: Path
) -> AsyncIterator[BasePersistence]:
    """A fresh persistence backend instance, shut down after the test."""
    backend = request.param
    store: BasePersistence
    if backend == "memory":
        store = MemoryPersistence()
    elif backend == "json":
        store = JSONPersistence(tmp_path / "state.json")
    else:
        store = SQLitePersistence(tmp_path / "state.db")
    yield store
    await store.shutdown()


class TestContractConformance:
    async def test_is_a_base_persistence(self, persistence: BasePersistence) -> None:
        assert isinstance(persistence, BasePersistence)

    async def test_conversations_roundtrip(self, persistence: BasePersistence) -> None:
        await persistence.update_conversation("survey", (100, 42), "AGE")
        await persistence.update_conversation("survey", (100, 43), 1)
        await persistence.update_conversation("other", (100, 42), "X")

        assert await persistence.get_conversations("survey") == {(100, 42): "AGE", (100, 43): 1}
        assert await persistence.get_conversations("other") == {(100, 42): "X"}
        assert await persistence.get_conversations("unknown") == {}

    async def test_conversation_state_types_survive(self, persistence: BasePersistence) -> None:
        await persistence.update_conversation("s", (1, 2), 7)
        await persistence.update_conversation("s", (3, 4), "STATE")

        data = await persistence.get_conversations("s")
        assert data[(1, 2)] == 7
        assert isinstance(data[(1, 2)], int)
        assert data[(3, 4)] == "STATE"

    async def test_update_conversation_with_none_removes(
        self, persistence: BasePersistence
    ) -> None:
        await persistence.update_conversation("survey", (100, 42), "AGE")
        await persistence.update_conversation("survey", (100, 42), None)

        assert await persistence.get_conversations("survey") == {}

    async def test_refresh_conversations_matches_get(self, persistence: BasePersistence) -> None:
        await persistence.update_conversation("survey", (1, 2), "A")
        assert await persistence.refresh_conversations("survey") == {(1, 2): "A"}

    async def test_chat_data_update_get_refresh(self, persistence: BasePersistence) -> None:
        await persistence.update_chat_data({100: {"count": 1}, -100200: {"topic": "bots"}})

        assert await persistence.get_chat_data() == {100: {"count": 1}, -100200: {"topic": "bots"}}
        assert await persistence.refresh_chat_data() == {
            100: {"count": 1},
            -100200: {"topic": "bots"},
        }

    async def test_update_chat_data_replaces_wholesale(self, persistence: BasePersistence) -> None:
        await persistence.update_chat_data({100: {"count": 1}})
        await persistence.update_chat_data({200: {"fresh": True}})

        assert await persistence.get_chat_data() == {200: {"fresh": True}}

    async def test_user_data_roundtrip(self, persistence: BasePersistence) -> None:
        await persistence.update_user_data({42: {"name": "Alice"}, 77: {"name": "Bob"}})

        assert await persistence.get_user_data() == {42: {"name": "Alice"}, 77: {"name": "Bob"}}
        assert await persistence.refresh_user_data() == {
            42: {"name": "Alice"},
            77: {"name": "Bob"},
        }

    async def test_bot_data_roundtrip(self, persistence: BasePersistence) -> None:
        await persistence.update_bot_data({"launch_count": 3, "flag": True})

        assert await persistence.get_bot_data() == {"launch_count": 3, "flag": True}
        assert await persistence.refresh_bot_data() == {"launch_count": 3, "flag": True}

    async def test_reads_before_writes_are_empty(self, persistence: BasePersistence) -> None:
        assert await persistence.get_conversations("anything") == {}
        assert await persistence.get_chat_data() == {}
        assert await persistence.get_user_data() == {}
        assert await persistence.get_bot_data() == {}

    async def test_flush_is_awaitable(self, persistence: BasePersistence) -> None:
        await persistence.update_bot_data({"x": 1})
        await persistence.flush()
        assert await persistence.get_bot_data() == {"x": 1}


class TestDurabilityAcrossInstances:
    async def test_json_reload_from_disk(self, tmp_path: Path) -> None:
        path = tmp_path / "state.json"
        first = JSONPersistence(path)
        await first.update_conversation("survey", (100, 42), "AGE")
        await first.update_chat_data({100: {"n": 1}})
        await first.update_user_data({42: {"name": "Alice"}})
        await first.update_bot_data({"seen": 5})
        await first.shutdown()

        second = JSONPersistence(path)
        assert await second.get_conversations("survey") == {(100, 42): "AGE"}
        assert await second.get_chat_data() == {100: {"n": 1}}
        assert await second.get_user_data() == {42: {"name": "Alice"}}
        assert await second.get_bot_data() == {"seen": 5}
        await second.shutdown()

    async def test_sqlite_reload_from_disk(self, tmp_path: Path) -> None:
        path = tmp_path / "state.db"
        first = SQLitePersistence(path)
        await first.update_conversation("survey", (100, 42), 1)
        await first.update_user_data({42: {"name": "Alice"}})
        await first.shutdown()

        second = SQLitePersistence(path)
        assert await second.get_conversations("survey") == {(100, 42): 1}
        assert await second.get_user_data() == {42: {"name": "Alice"}}
        await second.shutdown()


class TestJsonAtomicWrite:
    async def test_writes_go_through_os_replace(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        import telebot_py.storage.json as json_module

        path = tmp_path / "state.json"
        calls: list[tuple[str, str]] = []
        real_replace = os.replace

        def spy(src: str | os.PathLike[str], dst: str | os.PathLike[str]) -> None:
            calls.append((str(src), str(dst)))
            real_replace(src, dst)

        monkeypatch.setattr(json_module.os, "replace", spy)

        store = JSONPersistence(path)
        await store.update_bot_data({"x": 1})
        assert len(calls) == 1
        src, dst = calls[0]
        assert dst == str(path)
        assert src != dst and src.endswith(".tmp")
        assert Path(src).parent == path.parent
        # The target file holds valid JSON; no stray tmp file remains.
        assert json.loads(path.read_text(encoding="utf-8"))
        assert not stray_tmp_files(tmp_path)
        await store.shutdown()
        assert all(replaced == str(path) for _, replaced in calls)

    async def test_corrupt_file_starts_empty(self, tmp_path: Path) -> None:
        path = tmp_path / "state.json"
        path.write_text("not json at all {{{", encoding="utf-8")

        store = JSONPersistence(path)
        assert await store.get_bot_data() == {}
        await store.update_bot_data({"recovered": True})
        await store.shutdown()

        reopened = JSONPersistence(path)
        assert await reopened.get_bot_data() == {"recovered": True}
        await reopened.shutdown()


class TestSqliteWorker:
    async def test_wal_mode_enabled(self, tmp_path: Path) -> None:
        path = tmp_path / "state.db"
        store = SQLitePersistence(path)
        await store.update_bot_data({"x": 1})  # guarantees the worker opened the db

        mode = sqlite3.connect(path).execute("PRAGMA journal_mode").fetchone()
        assert mode is not None and mode[0] == "wal"
        await store.shutdown()

    async def test_concurrent_writes_do_not_corrupt(self, tmp_path: Path) -> None:
        store = SQLitePersistence(tmp_path / "state.db")
        writes = [store.update_conversation("survey", (100, i), f"state-{i}") for i in range(30)]
        writes.extend(store.update_conversation("users", (i,), {"n": i}) for i in range(10))
        await asyncio.gather(*writes)

        conversations = await store.get_conversations("survey")
        assert len(conversations) == 30
        assert conversations[(100, 7)] == "state-7"
        users = await store.get_conversations("users")
        assert len(users) == 10
        assert users[(3,)] == {"n": 3}

        await store.update_user_data({i: {"n": i} for i in range(10)})
        user_data = await store.get_user_data()
        assert len(user_data) == 10
        assert user_data[3] == {"n": 3}
        await store.shutdown()

    async def test_same_key_races_keep_one_value(self, tmp_path: Path) -> None:
        store = SQLitePersistence(tmp_path / "state.db")
        candidates = [f"value-{i}" for i in range(20)]
        await asyncio.gather(
            *(store.update_conversation("survey", (1, 2), value) for value in candidates)
        )

        data = await store.get_conversations("survey")
        assert data[(1, 2)] in candidates
        await store.shutdown()

    async def test_event_loop_stays_responsive_during_writes(self, tmp_path: Path) -> None:
        store = SQLitePersistence(tmp_path / "state.db")
        ticks = 0

        async def ticker() -> None:
            nonlocal ticks
            for _ in range(5):
                ticks += 1
                await asyncio.sleep(0)

        await asyncio.gather(
            ticker(),
            *(store.update_conversation("s", (i, i), i) for i in range(10)),
        )
        assert ticks == 5
        await store.shutdown()
