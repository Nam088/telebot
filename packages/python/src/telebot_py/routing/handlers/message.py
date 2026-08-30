"""Handler routing updates whose message passes a filter."""

from __future__ import annotations

from typing import Any

from telebot_py.filters.base import MessageFilter
from telebot_py.routing.handlers.base import BaseHandler, HandlerCallback
from telebot_py.types import Update


class MessageHandler(BaseHandler):
    """Handler for updates whose message satisfies a message filter.

    ``check_update`` returns the filter's result: ``True``/``False`` for
    plain filters, or the extracted-data dict for data filters (e.g.
    :class:`~telebot_py.filters.Regex`), which is then merged onto the
    callback context.

    Attributes:
        filters: The filter gating this handler.
    """

    def __init__(self, filters: MessageFilter, callback: HandlerCallback) -> None:
        """Initialize the handler.

        Args:
            filters: The message filter deciding which updates match.
            callback: Callable invoked when the filter passes.
        """
        super().__init__(callback)
        self.filters = filters

    def check_update(self, update: object) -> Any:
        """Return the filter result for the update's effective message.

        Args:
            update: The incoming update.

        Returns:
            The filter result (bool or data-filter dict); falsy when the
            update carries no message or the filter rejects it.
        """
        if not isinstance(update, Update):
            return False
        message = update.effective_message
        if message is None:
            return False
        return self.filters(message)
