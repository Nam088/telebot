"""Handler for callback queries from inline keyboards."""

from __future__ import annotations

import re
from collections.abc import Callable
from typing import Any

from telebot_py.routing.handlers.base import BaseHandler, HandlerCallback
from telebot_py.types import Update

#: A pattern tested against ``callback_query.data``: a string or compiled
#: regular expression (matched with ``fullmatch``), or a predicate callable.
CallbackQueryPattern = str | re.Pattern[str] | Callable[[str], bool]


class CallbackQueryHandler(BaseHandler):
    """Handler for incoming callback queries.

    With no pattern every callback query matches. Otherwise the query's
    ``data`` must satisfy the pattern: ``re.fullmatch`` semantics for string
    and compiled patterns, a plain call for callable patterns. A regex match
    is exposed on the callback context as ``context.matches``.

    Attributes:
        pattern: The pattern constraining which callback queries match.
    """

    def __init__(
        self,
        pattern: CallbackQueryPattern | None,
        callback: HandlerCallback,
        block: bool = True,
    ) -> None:
        """Initialize the handler.

        Args:
            pattern: Pattern constraining ``callback_query.data``, or ``None``
                to match every callback query.
            callback: Callable invoked when a query matches.
            block: Whether dispatch awaits the callback before moving on.
        """
        super().__init__(callback, block=block)
        self.pattern = pattern

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a matching callback query.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the callback query satisfies the pattern.
        """
        if not isinstance(update, Update) or update.callback_query is None:
            return False
        data = update.callback_query.data
        if self.pattern is None:
            return True
        if data is None:
            return False
        if isinstance(self.pattern, str):
            return re.fullmatch(self.pattern, data) is not None
        if isinstance(self.pattern, re.Pattern):
            return self.pattern.fullmatch(data) is not None
        return bool(self.pattern(data))

    def collect_additional_context(self, context: Any, update: Update, check_result: Any) -> None:
        """Store the regex match on ``context.matches`` when applicable.

        Args:
            context: The callback context being populated.
            update: The update being processed.
            check_result: The value :meth:`check_update` returned.
        """
        if not check_result or not isinstance(update, Update):
            return
        query = update.callback_query
        if query is None or query.data is None:
            return
        match: re.Match[str] | None = None
        if isinstance(self.pattern, str):
            match = re.fullmatch(self.pattern, query.data)
        elif isinstance(self.pattern, re.Pattern):
            match = self.pattern.fullmatch(query.data)
        if match is not None:
            context.matches = [match]
