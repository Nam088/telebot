"""Pluggable storage driver interface and persisted value types.

Python parity of ``packages/node/src/storage/driver.ts``: concrete backends
(memory, JSON file, SQLite) expose a raw asynchronous key/value surface that
:class:`~telebot_py.storage.base.KeyValuePersistence` builds the full
persistence contract on top of.
"""

from __future__ import annotations

import typing as t
from dataclasses import dataclass


@dataclass
class PersistedJob:
    """A scheduled job restored from persistence across restarts.

    Attributes:
        name: Unique name of the job.
        next_run: Epoch timestamp (seconds) of the job's next execution.
        interval: Optional recurrence interval in seconds.
        rrule: Optional RFC 5545 RRule string or options mapping.
        timezone: Optional IANA timezone name the schedule is evaluated in.
        data: Optional serializable payload handed to the job callback.
    """

    name: str
    next_run: float
    interval: float | None = None
    rrule: str | dict[str, t.Any] | None = None
    timezone: str | None = None
    data: t.Any = None


@t.runtime_checkable
class StorageDriver(t.Protocol):
    """Raw asynchronous key/value store persistence backends plug into.

    Mirrors the node ``Persistence`` driver contract in snake_case: every
    operation is awaitable so backends can keep I/O off the event loop
    (worker threads, ``asyncio.to_thread``). Keys are opaque strings; values
    are serialized JSON text.
    """

    async def get_raw(self, key: str) -> str | None:
        """Return the stored value for ``key``, or ``None`` when absent.

        Args:
            key: The storage key to look up.

        Returns:
            The raw JSON string, or ``None`` if the key does not exist.
        """
        ...

    async def set_raw(self, key: str, value: str) -> None:
        """Store ``value`` under ``key``, overwriting any previous value.

        Args:
            key: The storage key to write.
            value: Serialized JSON text to persist.
        """
        ...

    async def delete_raw(self, key: str) -> None:
        """Remove ``key`` from the store; no-op when absent.

        Args:
            key: The storage key to delete.
        """
        ...

    async def flush(self) -> None:
        """Flush buffered writes to the underlying storage."""
        ...
