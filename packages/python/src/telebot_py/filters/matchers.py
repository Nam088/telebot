"""Built-in message filters mirroring python-telegram-bot's ``filters`` module."""

from __future__ import annotations

import re
from collections.abc import Callable, Iterable

from telebot_py.filters.base import FilterResult, MessageFilter
from telebot_py.types import Message


class _PredicateFilter(MessageFilter):
    """Filter evaluating a plain predicate over a message."""

    def __init__(self, predicate: Callable[[Message], bool]) -> None:
        self._predicate = predicate

    def filter(self, message: Message) -> bool:
        return bool(self._predicate(message))


def _has_command_entity(message: Message) -> bool:
    if not message.entities:
        return False
    first = message.entities[0]
    return first.type == "bot_command" and first.offset == 0


#: Messages that contain non-empty text.
TEXT: MessageFilter = _PredicateFilter(lambda message: bool(message.text))

#: Messages that carry a photo.
PHOTO: MessageFilter = _PredicateFilter(lambda message: bool(message.photo))

#: Messages that carry a document.
DOCUMENT: MessageFilter = _PredicateFilter(lambda message: bool(message.document))

#: Messages that start with a bot command entity.
COMMAND: MessageFilter = _PredicateFilter(_has_command_entity)

#: Matches every message unconditionally.
ALL: MessageFilter = _PredicateFilter(lambda message: True)

#: Matches no message ever.
NONE: MessageFilter = _PredicateFilter(lambda message: False)


def _chat_type_filter(chat_type: str) -> MessageFilter:
    return _PredicateFilter(lambda message: message.chat.type == chat_type)


class ChatType:
    """Filters matching the type of chat a message was sent in.

    Attributes:
        PRIVATE: Matches messages from private (1-on-1) chats.
        GROUP: Matches messages from basic group chats.
        SUPERGROUP: Matches messages from supergroup chats.
        CHANNEL: Matches messages posted to channels.
        GROUPS: Matches messages from basic groups or supergroups.
    """

    PRIVATE: MessageFilter = _chat_type_filter("private")
    GROUP: MessageFilter = _chat_type_filter("group")
    SUPERGROUP: MessageFilter = _chat_type_filter("supergroup")
    CHANNEL: MessageFilter = _chat_type_filter("channel")
    GROUPS: MessageFilter = GROUP | SUPERGROUP


class Regex(MessageFilter):
    """Data filter matching message text (or caption) against a regular expression.

    On a match the filter yields ``{"matches": [re.Match]}``, which handlers
    merge onto the callback context as ``context.matches``. The pattern is
    searched (``re.search`` semantics) against ``message.text`` falling back
    to ``message.caption``.

    Attributes:
        pattern: The compiled regular expression to search for.
        data_filter: Always ``True``; this filter extracts match data.
    """

    data_filter = True

    def __init__(self, pattern: str | re.Pattern[str]) -> None:
        """Initialize the filter.

        Args:
            pattern: Regular expression, either a string or compiled pattern.
        """
        self.pattern = re.compile(pattern) if isinstance(pattern, str) else pattern

    def filter(self, message: Message) -> FilterResult:
        text = message.text if message.text is not None else message.caption
        if not text:
            return None
        match = self.pattern.search(text)
        if match is None:
            return None
        return {"matches": [match]}


def _int_set(value: int | Iterable[int] | None) -> frozenset[int]:
    if value is None:
        return frozenset()
    if isinstance(value, int):
        return frozenset((value,))
    return frozenset(value)


def _str_set(value: str | Iterable[str] | None) -> frozenset[str]:
    if value is None:
        return frozenset()
    if isinstance(value, str):
        return frozenset((value.lower(),))
    return frozenset(item.lower() for item in value)


class User(MessageFilter):
    """Filter matching messages sent by a specific user.

    Attributes:
        user_ids: User ids accepted by this filter.
        usernames: Lower-cased usernames accepted by this filter.
    """

    def __init__(
        self,
        user_id: int | Iterable[int] | None = None,
        username: str | Iterable[str] | None = None,
    ) -> None:
        """Initialize the filter.

        Args:
            user_id: A user id or collection of user ids to match.
            username: A username or collection of usernames to match;
                compared case-insensitively.

        Raises:
            ValueError: If neither ``user_id`` nor ``username`` is given.
        """
        if user_id is None and username is None:
            msg = "User filter requires user_id or username"
            raise ValueError(msg)
        self.user_ids = _int_set(user_id)
        self.usernames = _str_set(username)

    def filter(self, message: Message) -> bool:
        user = message.from_user
        if user is None:
            return False
        if user.id in self.user_ids:
            return True
        return user.username is not None and user.username.lower() in self.usernames


class Chat(MessageFilter):
    """Filter matching messages sent in a specific chat.

    Attributes:
        chat_ids: Chat ids accepted by this filter.
        usernames: Lower-cased chat usernames accepted by this filter.
    """

    def __init__(
        self,
        chat_id: int | Iterable[int] | None = None,
        username: str | Iterable[str] | None = None,
    ) -> None:
        """Initialize the filter.

        Args:
            chat_id: A chat id or collection of chat ids to match.
            username: A chat username or collection of usernames to match;
                compared case-insensitively.

        Raises:
            ValueError: If neither ``chat_id`` nor ``username`` is given.
        """
        if chat_id is None and username is None:
            msg = "Chat filter requires chat_id or username"
            raise ValueError(msg)
        self.chat_ids = _int_set(chat_id)
        self.usernames = _str_set(username)

    def filter(self, message: Message) -> bool:
        chat = message.chat
        if chat.id in self.chat_ids:
            return True
        return chat.username is not None and chat.username.lower() in self.usernames
