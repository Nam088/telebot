"""Handler matching updates via an arbitrary type predicate."""

from __future__ import annotations

from collections.abc import Callable

from telebot_py.routing.handlers.base import BaseHandler, HandlerCallback
from telebot_py.types import Update

#: Predicate deciding whether an update matches a :class:`TypeHandler`.
TypePredicate = Callable[[Update], bool]


class TypeHandler(BaseHandler):
    """Handler that matches updates based on an arbitrary type predicate.

    Any-update pass-through: the predicate receives the full update and its
    boolean result decides the match, mirroring the node ``TypeHandler``.

    Attributes:
        type_predicate: Function evaluating whether an update matches.
    """

    def __init__(
        self,
        type_predicate: TypePredicate,
        callback: HandlerCallback,
        *,
        block: bool = True,
    ) -> None:
        """Initialize the handler.

        Args:
            type_predicate: Function that evaluates whether an update
                matches.
            callback: Callable invoked when the predicate passes.
            block: Whether dispatch awaits the callback before moving on.
        """
        super().__init__(callback, block=block)
        self.type_predicate = type_predicate

    def check_update(self, update: object) -> bool:
        """Return whether the type predicate is satisfied by the update.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the predicate returns a truthy value for the
            update, ``False`` otherwise (including for non-``Update``
            objects).
        """
        if not isinstance(update, Update):
            return False
        return bool(self.type_predicate(update))
