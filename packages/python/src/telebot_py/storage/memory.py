"""In-memory persistence backend (T032)."""

from __future__ import annotations

from telebot_py.storage.base import KeyValuePersistence


class MemoryPersistence(KeyValuePersistence):
    """Default in-memory persistence; state is lost when the process exits.

    Used implicitly when no backend is configured on the builder: data dicts
    live for the application's lifetime and conversations start fresh on each
    run (documented behavior, no crash).

    Example:
        >>> app = Application.builder().token(token).persistence(MemoryPersistence()).build()
    """

    def __init__(self) -> None:
        """Initialize an empty in-memory store."""
        super().__init__()
        self._store: dict[str, str] = {}

    async def get_raw(self, key: str) -> str | None:
        """Return the stored value for ``key``, or ``None`` when absent.

        Args:
            key: The storage key to look up.

        Returns:
            The raw JSON string, or ``None`` if the key does not exist.
        """
        return self._store.get(key)

    async def set_raw(self, key: str, value: str) -> None:
        """Store ``value`` under ``key``, overwriting any previous value.

        Args:
            key: The storage key to write.
            value: Serialized JSON text to persist.
        """
        self._store[key] = value

    async def delete_raw(self, key: str) -> None:
        """Remove ``key`` from the store; no-op when absent.

        Args:
            key: The storage key to delete.
        """
        self._store.pop(key, None)
