"""Shared seam and helpers for the Bot method mixins."""

from __future__ import annotations

import abc
import typing as t
from collections.abc import Sequence

from telebot_py.types.base import TelegramObject, TypeParseError
from telebot_py.types.message import Message

TObj = t.TypeVar("TObj", bound=TelegramObject)
_Val = t.TypeVar("_Val")


class SupportsToDict(t.Protocol):
    """Any typed object serializable to Telegram's wire shape."""

    def to_dict(self) -> dict[str, object]:
        """Serialize this object to a plain snake_case dict."""
        ...


#: Markup-shaped parameters accept plain dicts or typed objects with ``to_dict``.
MarkupLike = t.Mapping[str, object] | SupportsToDict


class _Unset:
    """Marker type for an optional parameter the caller did not pass."""

    __slots__ = ()

    def __repr__(self) -> str:
        """Return the sentinel's source-like representation."""
        return "UNSET"

    def __bool__(self) -> bool:
        """Report falsiness so the sentinel never reads as a supplied value."""
        return False


#: Sentinel marking "parameter omitted", used where an empty value is meaningful.
UNSET: t.Final[_Unset] = _Unset()

#: Annotation alias for parameters that are omitted, or set to an explicit value
#: which may itself be empty (``""``, ``[]``, ...).
Unset = _Unset


def omit_unset(value: _Val | Unset) -> _Val | None:
    """Translate the :data:`UNSET` sentinel to ``None`` for :func:`clean_payload`.

    Args:
        value: The parameter as received, either a real value or ``UNSET``.

    Returns:
        ``None`` when the caller left the parameter unset, else the value.
    """
    return None if isinstance(value, _Unset) else value


def optional_list(value: Sequence[_Val] | Unset) -> list[_Val] | None:
    """Convert an omittable sequence parameter to its JSON list wire shape.

    Args:
        value: The parameter as received: a sequence, or ``UNSET`` when the
            caller omitted it.

    Returns:
        ``None`` when unset so the field is omitted; otherwise a plain list,
        which is empty exactly when the caller passed an empty sequence.
    """
    return None if isinstance(value, _Unset) else list(value)


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
