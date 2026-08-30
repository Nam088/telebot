"""Handlers for chat join requests and chat boost updates."""

from __future__ import annotations

from telebot_py.routing.handlers.base import BaseHandler, HandlerCallback
from telebot_py.types import Update


class ChatJoinRequestHandler(BaseHandler):
    """Handler for requests to join private chats or channels.

    Matches ``chat_join_request`` updates, mirroring the node
    ``ChatJoinRequestHandler``.
    """

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a chat join request.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a ``chat_join_request`` payload.
        """
        return isinstance(update, Update) and update.chat_join_request is not None


class ChatBoostHandler(BaseHandler):
    """Handler for chat boost additions and removals.

    Matches ``chat_boost`` and/or ``removed_chat_boost`` updates depending on
    the :attr:`boost_types` filter mask, mirroring the node
    ``ChatBoostHandler`` constants.

    Attributes:
        boost_types: Filter mask selecting which boost events to handle
            (:attr:`ADDED`, :attr:`REMOVED`, or :attr:`ANY`).
    """

    #: Target only added or updated boosts (``chat_boost``).
    ADDED = 1
    #: Target only removed boosts (``removed_chat_boost``).
    REMOVED = 2
    #: Target any boost event.
    ANY = 3

    def __init__(
        self,
        callback: HandlerCallback,
        boost_types: int = ANY,
        *,
        block: bool = True,
    ) -> None:
        """Initialize the handler.

        Args:
            callback: Callable invoked when a matching boost update arrives.
            boost_types: Filter mask (`ADDED`, `REMOVED`, or `ANY`).
                Defaults to `ChatBoostHandler.ANY`.
            block: Whether dispatch awaits the callback before moving on.
        """
        super().__init__(callback, block=block)
        self.boost_types = boost_types

    def check_update(self, update: object) -> bool:
        """Return whether the update matches the configured boost filter.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a boost event allowed by the
            configured mask, ``False`` otherwise.
        """
        if not isinstance(update, Update):
            return False
        if self.boost_types == ChatBoostHandler.ADDED:
            return update.chat_boost is not None
        if self.boost_types == ChatBoostHandler.REMOVED:
            return update.removed_chat_boost is not None
        return update.chat_boost is not None or update.removed_chat_boost is not None
