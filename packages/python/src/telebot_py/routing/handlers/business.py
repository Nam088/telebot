"""Handlers for Telegram Business connection and business message updates."""

from __future__ import annotations

from telebot_py.routing.handlers.base import BaseHandler
from telebot_py.types import Update


class BusinessConnectionHandler(BaseHandler):
    """Handler for Telegram Business account connection changes.

    Matches ``business_connection`` updates, mirroring the node
    ``BusinessConnectionHandler``.
    """

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a business connection change.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a ``business_connection``
            payload.
        """
        return isinstance(update, Update) and update.business_connection is not None


class BusinessMessagesHandler(BaseHandler):
    """Handler for messages in connected Telegram Business accounts.

    Matches ``business_message``, ``edited_business_message``, and
    ``deleted_business_messages`` updates, mirroring the node
    ``BusinessMessagesHandler``.
    """

    def check_update(self, update: object) -> bool:
        """Return whether the update is a business message event.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries any business message payload.
        """
        if not isinstance(update, Update):
            return False
        return (
            update.business_message is not None
            or update.edited_business_message is not None
            or update.deleted_business_messages is not None
        )
