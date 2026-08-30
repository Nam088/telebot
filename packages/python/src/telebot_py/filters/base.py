"""Message filter base class with boolean-algebra composition (FR-002)."""

from __future__ import annotations

import typing as t

from telebot_py.types import Message

#: Result of evaluating a filter: ``True``/``False`` for plain filters, or a
#: dict of extracted data (truthy on match) for ``data_filter`` filters.
FilterResult = bool | dict[str, t.Any] | None


class MessageFilter:
    """Base class for filters inspecting :class:`~telebot_py.types.Message` objects.

    Subclass and override :meth:`filter`, or combine instances with ``&``,
    ``|`` and ``~`` (also available as :meth:`and_`, :meth:`or_`, :meth:`not_`
    since ``and``/``or``/``not`` are Python keywords). Evaluation of combined
    filters short-circuits. Filters with :attr:`data_filter` set return a dict
    of extracted data on a match, which handlers merge into the callback
    context.

    Attributes:
        data_filter: Whether the filter yields extracted data instead of a
            plain bool.
    """

    data_filter: bool = False

    def filter(self, message: Message) -> FilterResult:
        """Evaluate this filter against ``message``.

        Args:
            message: The message to inspect.

        Returns:
            ``True`` on a match and ``False`` otherwise; for data filters a
            non-empty dict on a match and a falsy value otherwise.
        """
        raise NotImplementedError

    def __call__(self, message: Message) -> FilterResult:
        return self.filter(message)

    def __and__(self, other: MessageFilter) -> MessageFilter:
        return _AndFilter(self, other)

    def __or__(self, other: MessageFilter) -> MessageFilter:
        return _OrFilter(self, other)

    def __invert__(self) -> MessageFilter:
        return _NotFilter(self)

    def and_(self, other: MessageFilter) -> MessageFilter:
        """Combine with ``other`` via logical AND (alias of ``&``).

        Args:
            other: The filter to combine with.

        Returns:
            A new composite filter matching only when both sides match.
        """
        return self & other

    def or_(self, other: MessageFilter) -> MessageFilter:
        """Combine with ``other`` via logical OR (alias of ``|``).

        Args:
            other: The filter to combine with.

        Returns:
            A new composite filter matching when either side matches.
        """
        return self | other

    def not_(self) -> MessageFilter:
        """Invert this filter (alias of ``~``).

        Returns:
            A new filter matching when this one does not.
        """
        return ~self


class _AndFilter(MessageFilter):
    """Composite filter requiring both operands to match."""

    def __init__(self, base: MessageFilter, other: MessageFilter) -> None:
        self._base = base
        self._other = other
        self.data_filter = base.data_filter or other.data_filter

    def filter(self, message: Message) -> FilterResult:
        left = self._base(message)
        if not left:
            return False
        right = self._other(message)
        if not right:
            return False
        left_data = left if isinstance(left, dict) else {}
        right_data = right if isinstance(right, dict) else {}
        if not left_data and not right_data:
            return True
        conflicts = left_data.keys() & right_data.keys()
        if conflicts:
            msg = f"cannot merge filter data for conflicting keys: {sorted(conflicts)}"
            raise ValueError(msg)
        return {**left_data, **right_data}


class _OrFilter(MessageFilter):
    """Composite filter matching when either operand matches."""

    def __init__(self, base: MessageFilter, other: MessageFilter) -> None:
        self._base = base
        self._other = other
        self.data_filter = base.data_filter or other.data_filter

    def filter(self, message: Message) -> FilterResult:
        left = self._base(message)
        if left:
            return left if isinstance(left, dict) else True
        right = self._other(message)
        if isinstance(right, dict):
            return right
        return bool(right)


class _NotFilter(MessageFilter):
    """Composite filter inverting its operand."""

    def __init__(self, base: MessageFilter) -> None:
        self._base = base
        self.data_filter = False

    def filter(self, message: Message) -> bool:
        return not self._base(message)
