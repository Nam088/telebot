"""Handlers for chat membership changes and poll answers."""

from __future__ import annotations

from telebot_py.routing.handlers.base import BaseHandler, HandlerCallback
from telebot_py.types import Update


class ChatMemberHandler(BaseHandler):
    """Handler for chat membership changes.

    Matches ``chat_member`` and/or ``my_chat_member`` updates depending on
    the :attr:`chat_member_types` filter mask, mirroring the node
    ``ChatMemberHandler`` constants.

    Attributes:
        chat_member_types: Filter mask selecting which chat member updates
            to handle (:attr:`CHAT_MEMBER`, :attr:`MY_CHAT_MEMBER`, or
            :attr:`ANY`).
    """

    #: Target only member updates of other users (``chat_member``).
    CHAT_MEMBER = 1
    #: Target only updates for the bot itself (``my_chat_member``).
    MY_CHAT_MEMBER = 2
    #: Target any chat member update.
    ANY = 3

    def __init__(
        self,
        callback: HandlerCallback,
        chat_member_types: int = ANY,
        *,
        block: bool = True,
    ) -> None:
        """Initialize the handler.

        Args:
            callback: Callable invoked when a matching member update arrives.
            chat_member_types: Filter mask (`CHAT_MEMBER`, `MY_CHAT_MEMBER`,
                or `ANY`). Defaults to `ChatMemberHandler.ANY`.
            block: Whether dispatch awaits the callback before moving on.
        """
        super().__init__(callback, block=block)
        self.chat_member_types = chat_member_types

    def check_update(self, update: object) -> bool:
        """Return whether the update matches the requested member types.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a chat member update allowed by
            the configured mask, ``False`` otherwise.
        """
        if not isinstance(update, Update):
            return False
        if self.chat_member_types == ChatMemberHandler.CHAT_MEMBER:
            return update.chat_member is not None
        if self.chat_member_types == ChatMemberHandler.MY_CHAT_MEMBER:
            return update.my_chat_member is not None
        return update.chat_member is not None or update.my_chat_member is not None


class PollAnswerHandler(BaseHandler):
    """Handler for user responses to non-anonymous polls.

    Matches ``poll_answer`` updates, mirroring the node ``PollAnswerHandler``.
    """

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a poll answer.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a ``poll_answer`` payload.
        """
        return isinstance(update, Update) and update.poll_answer is not None
