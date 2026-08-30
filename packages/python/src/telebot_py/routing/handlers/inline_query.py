"""Handlers for inline queries and chosen inline results."""

from __future__ import annotations

import re
from collections.abc import Callable
from typing import Any

from telebot_py.routing.handlers.base import BaseHandler, HandlerCallback
from telebot_py.types import Update

#: A pattern tested against the inline query text (or chosen-result target):
#: a string (exact equality), a compiled regular expression (search
#: semantics), or a predicate callable. Mirrors the node pattern option.
InlineQueryPattern = str | re.Pattern[str] | Callable[[str], bool]


class InlineQueryHandler(BaseHandler):
    """Handler for inline queries triggered by typing ``@bot query``.

    With no pattern every inline query matches. Otherwise the query text must
    satisfy the pattern: exact equality for strings, ``search`` semantics for
    compiled regular expressions, a plain call for callable patterns —
    mirroring the node ``InlineQueryHandler``. A regex match is exposed on
    the callback context as ``context.matches``.

    Attributes:
        pattern: The pattern constraining which inline queries match.
    """

    def __init__(
        self,
        pattern: InlineQueryPattern | None,
        callback: HandlerCallback,
        *,
        block: bool = True,
    ) -> None:
        """Initialize the handler.

        Args:
            pattern: Pattern constraining ``inline_query.query``, or ``None``
                to match every inline query.
            callback: Callable invoked when a query matches.
            block: Whether dispatch awaits the callback before moving on.
        """
        super().__init__(callback, block=block)
        self.pattern = pattern

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a matching inline query.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the inline query satisfies the pattern.
        """
        if not isinstance(update, Update) or update.inline_query is None:
            return False
        if self.pattern is None:
            return True
        text = update.inline_query.query
        if isinstance(self.pattern, str):
            return text == self.pattern
        if isinstance(self.pattern, re.Pattern):
            return self.pattern.search(text) is not None
        return bool(self.pattern(text))

    def collect_additional_context(self, context: Any, update: Update, check_result: Any) -> None:
        """Store the regex match on ``context.matches`` when applicable.

        Args:
            context: The callback context being populated.
            update: The update being processed.
            check_result: The value :meth:`check_update` returned.
        """
        if not check_result or not isinstance(update, Update):
            return
        query = update.inline_query
        if query is None or not isinstance(self.pattern, re.Pattern):
            return
        match = self.pattern.search(query.query)
        if match is not None:
            context.matches = [match]


class ChosenInlineResultHandler(BaseHandler):
    """Handler for results chosen by users from inline queries.

    With no pattern every chosen result matches. Otherwise the target — the
    chosen result's ``query`` when non-empty, else its ``result_id`` — must
    satisfy the pattern: string patterns match either ``result_id`` or
    ``query`` exactly, compiled regular expressions use ``search`` semantics
    on the target, callable patterns receive the target — mirroring the node
    ``ChosenInlineResultHandler``. A regex match is exposed on the callback
    context as ``context.matches``.

    Attributes:
        pattern: The pattern constraining which chosen results match.
    """

    def __init__(
        self,
        pattern: InlineQueryPattern | None,
        callback: HandlerCallback,
        *,
        block: bool = True,
    ) -> None:
        """Initialize the handler.

        Args:
            pattern: Pattern constraining the chosen result's ``result_id``
                or ``query``, or ``None`` to match every chosen result.
            callback: Callable invoked when a chosen result matches.
            block: Whether dispatch awaits the callback before moving on.
        """
        super().__init__(callback, block=block)
        self.pattern = pattern

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a matching chosen result.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the chosen inline result satisfies the pattern.
        """
        if not isinstance(update, Update) or update.chosen_inline_result is None:
            return False
        chosen = update.chosen_inline_result
        if self.pattern is None:
            return True
        if isinstance(self.pattern, str):
            return chosen.result_id == self.pattern or chosen.query == self.pattern
        target = chosen.query or chosen.result_id
        if isinstance(self.pattern, re.Pattern):
            return self.pattern.search(target) is not None
        return bool(self.pattern(target))

    def collect_additional_context(self, context: Any, update: Update, check_result: Any) -> None:
        """Store the regex match on ``context.matches`` when applicable.

        Args:
            context: The callback context being populated.
            update: The update being processed.
            check_result: The value :meth:`check_update` returned.
        """
        if not check_result or not isinstance(update, Update):
            return
        chosen = update.chosen_inline_result
        if chosen is None or not isinstance(self.pattern, re.Pattern):
            return
        target = chosen.query or chosen.result_id
        match = self.pattern.search(target)
        if match is not None:
            context.matches = [match]
