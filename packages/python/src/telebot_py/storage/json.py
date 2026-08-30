"""JSON file-backed persistence with atomic writes (T033)."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from pathlib import Path

from telebot_py.storage.base import KeyValuePersistence

logger = logging.getLogger("telebot_py.storage.json")


class JSONPersistence(KeyValuePersistence):
    """Persists the whole bot state to a single JSON file.

    Every write serializes the full store to a temporary file in the target
    directory and atomically swaps it in with :func:`os.replace`, so readers
    never observe a truncated file. All file I/O runs in a worker thread via
    :func:`asyncio.to_thread` and never blocks the event loop.

    Example:
        >>> persistence = JSONPersistence("data/state.json")

    Attributes:
        file_path: The JSON file backing this persistence instance.
    """

    def __init__(self, file_path: str | Path) -> None:
        """Initialize the persistence pointing at ``file_path``.

        The file is read lazily on first access; a missing or corrupt file
        starts from an empty store (logged, never raised).

        Args:
            file_path: Where the JSON state lives; parent directories are
                created on first write.
        """
        super().__init__()
        self.file_path = Path(file_path)
        self._store: dict[str, str] | None = None
        self._write_lock = asyncio.Lock()

    async def get_raw(self, key: str) -> str | None:
        """Return the stored value for ``key``, or ``None`` when absent.

        Args:
            key: The storage key to look up.

        Returns:
            The raw JSON string, or ``None`` if the key does not exist.
        """
        store = await self._load()
        return store.get(key)

    async def set_raw(self, key: str, value: str) -> None:
        """Store ``value`` under ``key`` and rewrite the file atomically.

        Args:
            key: The storage key to write.
            value: Serialized JSON text to persist.
        """
        store = await self._load()
        store[key] = value
        await self._save()

    async def delete_raw(self, key: str) -> None:
        """Remove ``key`` and rewrite the file atomically; no-op when absent.

        Args:
            key: The storage key to delete.
        """
        store = await self._load()
        if key in store:
            del store[key]
            await self._save()

    async def flush(self) -> None:
        """Write the current store to disk, even when nothing changed."""
        if self._store is not None:
            await self._save()

    async def _load(self) -> dict[str, str]:
        """Lazily load the file into memory, tolerating missing/corrupt data."""
        if self._store is None:
            self._store = await asyncio.to_thread(self._load_sync)
        return self._store

    def _load_sync(self) -> dict[str, str]:
        """Blocking file read used via ``asyncio.to_thread``."""
        try:
            content = self.file_path.read_text(encoding="utf-8")
        except FileNotFoundError:
            return {}
        except OSError as exc:
            logger.warning("Could not read JSON persistence file %s: %s", self.file_path, exc)
            return {}
        if not content.strip():
            return {}
        try:
            parsed = json.loads(content)
        except (json.JSONDecodeError, ValueError):
            logger.warning("JSON persistence file %s is corrupt; starting empty", self.file_path)
            return {}
        if not isinstance(parsed, dict):
            logger.warning(
                "JSON persistence file %s has unexpected shape; starting empty", self.file_path
            )
            return {}
        return {str(key): str(value) for key, value in parsed.items()}

    async def _save(self) -> None:
        """Serialize and atomically write the store, one write at a time."""
        payload = json.dumps(self._store, indent=2, ensure_ascii=False)
        async with self._write_lock:
            await asyncio.to_thread(self._write_atomic, payload)

    def _write_atomic(self, payload: str) -> None:
        """Blocking tmp-file write + ``os.replace`` used via ``to_thread``."""
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self.file_path.with_name(
            f"{self.file_path.name}.{os.getpid()}.{uuid.uuid4().hex}.tmp"
        )
        try:
            tmp_path.write_text(payload, encoding="utf-8")
            os.replace(tmp_path, self.file_path)
        except BaseException:
            tmp_path.unlink(missing_ok=True)
            raise
