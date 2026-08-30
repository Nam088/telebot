"""Pluggable persistence backends: memory, JSON file, SQLite (FR-009)."""

from telebot_py.storage.base import BasePersistence, ConversationKey, KeyValuePersistence
from telebot_py.storage.driver import PersistedJob, StorageDriver
from telebot_py.storage.json import JSONPersistence
from telebot_py.storage.memory import MemoryPersistence
from telebot_py.storage.sqlite import SQLitePersistence

__all__ = [
    "BasePersistence",
    "ConversationKey",
    "JSONPersistence",
    "KeyValuePersistence",
    "MemoryPersistence",
    "PersistedJob",
    "SQLitePersistence",
    "StorageDriver",
]
