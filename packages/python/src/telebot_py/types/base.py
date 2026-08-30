"""Shared serialization base for all Telegram API types."""

from __future__ import annotations

import dataclasses
import types as pytypes
import typing as t
from collections import abc

T = t.TypeVar("T", bound="TelegramObject")


def _fields_of(instance: object) -> tuple[dataclasses.Field[t.Any], ...]:
    # dataclasses.fields only accepts dataclass instances statically; every
    # TelegramObject subclass is one at runtime.
    return dataclasses.fields(instance)  # type: ignore[arg-type]


class TypeParseError(TypeError):
    """Raised when a raw Telegram payload cannot be parsed into a type."""


def _hydrate(hint: object, value: object) -> object:
    """Convert a raw JSON value into the annotated type, ignoring unknown shapes."""
    if value is None:
        return None
    origin = t.get_origin(hint)
    if origin is t.Union or origin is pytypes.UnionType:
        args = [arg for arg in t.get_args(hint) if arg is not type(None)]
        if len(args) == 1:
            return _hydrate(args[0], value)
        if isinstance(value, t.Mapping):
            for arg in args:
                if isinstance(arg, type) and issubclass(arg, TelegramObject):
                    discriminator = arg._DISCRIMINATOR
                    if (
                        discriminator is not None
                        and value.get(discriminator[0]) == (discriminator[1])
                    ):
                        return arg.from_dict(value)
            return value
        if isinstance(value, list):
            # A union with a sequence member (e.g. RichText's plain-text array
            # form) hydrates its items through that member's inner hint.
            for arg in args:
                if t.get_origin(arg) in (list, abc.Sequence):
                    member_args = t.get_args(arg)
                    item_hint = member_args[0] if member_args else None
                    if item_hint is None:
                        return value
                    return [_hydrate(item_hint, item) for item in value]
        return value
    if origin is list:
        list_args = t.get_args(hint)
        inner = list_args[0] if list_args else None
        if isinstance(value, list) and inner is not None:
            return [_hydrate(inner, item) for item in value]
        return value
    if isinstance(hint, type) and issubclass(hint, TelegramObject):
        if isinstance(value, t.Mapping):
            return hint.from_dict(value)
        return value
    return value


def _dehydrate(value: object) -> object:
    """Convert a typed value back into plain JSON-compatible structures."""
    if isinstance(value, TelegramObject):
        return value.to_dict()
    if isinstance(value, list):
        return [_dehydrate(item) for item in value]
    return value


class TelegramObject:
    """Base class for immutable Telegram API data types.

    Subclasses are frozen dataclasses whose attributes use Telegram's
    snake_case field names. ``from_dict`` hydrates nested objects and ignores
    unknown fields; ``to_dict`` emits the Telegram wire shape again.
    """

    __slots__ = ()

    #: Attribute-name to wire-key renames (e.g. ``from_user`` -> ``from``).
    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {}

    #: ``(wire_key, literal_value)`` identifying this variant inside a
    #: discriminated union (e.g. ``("type", "user")``), or ``None``.
    _DISCRIMINATOR: t.ClassVar[tuple[str, str] | None] = None

    @classmethod
    def _wire_key(cls, name: str) -> str:
        return cls._KEY_OVERRIDES.get(name, name)

    @classmethod
    def from_dict(cls: type[T], data: t.Mapping[str, object]) -> T:
        """Build an instance from a raw Telegram JSON payload.

        Args:
            data: Decoded JSON object using Telegram's field names. Unknown
                fields are ignored.

        Returns:
            A hydrated instance of this type.

        Raises:
            TypeParseError: If a required field is missing from ``data``.
        """
        hints = t.get_type_hints(cls)
        kwargs: dict[str, t.Any] = {}
        for field in _fields_of(cls):
            wire = cls._wire_key(field.name)
            if wire in data:
                kwargs[field.name] = _hydrate(hints[field.name], data[wire])
        try:
            return cls(**kwargs)
        except TypeError as exc:
            raise TypeParseError(f"cannot parse {cls.__name__}: {exc}") from exc

    def to_dict(self) -> dict[str, object]:
        """Serialize this object back to Telegram's snake_case wire format.

        Returns:
            A plain dict suitable for JSON encoding. Fields set to ``None``
            are omitted, matching Telegram's own payloads.
        """
        output: dict[str, object] = {}
        for field in _fields_of(self):
            value = getattr(self, field.name)
            if value is None:
                continue
            output[self._wire_key(field.name)] = _dehydrate(value)
        return output
