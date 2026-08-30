"""Update and message filtering with boolean algebra (FR-002).

Filters compose with ``&``, ``|`` and ``~`` (or the ``and_``/``or_``/``not_``
aliases) and gate which updates reach a handler::

    from telebot_py import filters
    from telebot_py.routing import MessageHandler

    private_text = filters.TEXT & filters.ChatType.PRIVATE
    handler = MessageHandler(private_text, callback)
"""

from telebot_py.filters.base import FilterResult, MessageFilter
from telebot_py.filters.matchers import (
    ALL,
    COMMAND,
    DOCUMENT,
    NONE,
    PHOTO,
    TEXT,
    Chat,
    ChatType,
    Regex,
    User,
)

__all__ = [
    "ALL",
    "COMMAND",
    "DOCUMENT",
    "NONE",
    "PHOTO",
    "TEXT",
    "Chat",
    "ChatType",
    "FilterResult",
    "MessageFilter",
    "Regex",
    "User",
]
