"""Shared seam and helpers for the Bot method mixins."""

from __future__ import annotations

import abc
import typing as t

from telebot_py.types.base import TelegramObject, TypeParseError
from telebot_py.types.message import Message

TObj = t.TypeVar("TObj", bound=TelegramObject)


class SupportsToDict(t.Protocol):
    """Any typed object serializable to Telegram's wire shape."""

    def to_dict(self) -> dict[str, object]:
        """Serialize this object to a plain snake_case dict."""
        ...


#: Markup-shaped parameters accept plain dicts or typed objects with ``to_dict``.
MarkupLike = t.Mapping[str, object] | SupportsToDict


class Requester(abc.ABC):
    """Abstract request seam every Bot method mixin builds on."""

    @abc.abstractmethod
    async def request(
        self,
        method: str,
        payload: t.Mapping[str, object] | None = None,
    ) -> object:
        """Call a Bot API method and return the unwrapped ``result``.

        Args:
            method: The Bot API method name (e.g. ``sendMessage``).
            payload: Method parameters keyed by Telegram field names.

        Returns:
            The ``result`` field of Telegram's response envelope.
        """


def to_wire(value: MarkupLike | None) -> dict[str, object] | None:
    """Serialize a markup-shaped parameter for the wire, ``None`` passing through."""
    if value is None:
        return None
    if isinstance(value, t.Mapping):
        return dict(value)
    return value.to_dict()


def clean_payload(**fields: object) -> dict[str, object]:
    """Build a wire payload, omitting parameters the caller left unset."""
    return {name: value for name, value in fields.items() if value is not None}


def parse_result(cls: type[TObj], result: object) -> TObj:
    """Hydrate a single JSON object result into a typed Telegram object."""
    if isinstance(result, t.Mapping):
        return cls.from_dict(t.cast("t.Mapping[str, object]", result))
    msg = f"expected JSON object for {cls.__name__}, got {type(result).__name__}"
    raise TypeParseError(msg)


def parse_list_result(cls: type[TObj], result: object) -> list[TObj]:
    """Hydrate a JSON array result into a list of typed Telegram objects."""
    if isinstance(result, list):
        return [
            cls.from_dict(t.cast("t.Mapping[str, object]", item))
            for item in result
            if isinstance(item, t.Mapping)
        ]
    msg = f"expected JSON array of {cls.__name__}, got {type(result).__name__}"
    raise TypeParseError(msg)


def parse_flag(result: object) -> bool:
    """Coerce a boolean Bot API result, rejecting unexpected shapes."""
    if isinstance(result, bool):
        return result
    msg = f"expected boolean result, got {type(result).__name__}"
    raise TypeParseError(msg)


def parse_count(result: object) -> int:
    """Coerce an integer Bot API result, rejecting unexpected shapes."""
    if isinstance(result, int) and not isinstance(result, bool):
        return result
    msg = f"expected integer result, got {type(result).__name__}"
    raise TypeParseError(msg)


def parse_string(result: object) -> str:
    """Coerce a string Bot API result, rejecting unexpected shapes."""
    if isinstance(result, str):
        return result
    msg = f"expected string result, got {type(result).__name__}"
    raise TypeParseError(msg)


def parse_message_or_true(result: object) -> Message | bool:
    """Coerce edit-method results: the edited Message, or True for inline edits."""
    if isinstance(result, bool):
        return result
    return parse_result(Message, result)
