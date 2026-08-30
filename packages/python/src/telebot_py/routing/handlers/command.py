"""Handler for Telegram bot commands such as ``/start``."""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

from telebot_py.filters.base import MessageFilter
from telebot_py.routing.handlers.base import BaseHandler, HandlerCallback
from telebot_py.types import Update


class CommandHandler(BaseHandler):
    """Handler for bot commands like ``/start``.

    Command names are compared against the message text with the leading
    ``/`` and any ``@BotName`` mention suffix stripped, case-insensitively.
    The words following the command are exposed on the callback context as
    ``context.args``.

    Attributes:
        commands: Normalized (lower-cased, slash-less) command names.
        filters: Optional message filter gating the match after the command
            name matched.
    """

    def __init__(
        self,
        command: str | Sequence[str],
        callback: HandlerCallback,
        *,
        filters: MessageFilter | None = None,
    ) -> None:
        """Initialize the handler.

        Args:
            command: One command name (with or without leading ``/``) or a
                sequence of aliases.
            callback: Callable invoked when a matching command arrives.
            filters: Optional additional message filter.

        Raises:
            ValueError: If ``command`` is empty or contains a blank entry
                (FR-014 fail-fast on programmer errors).
        """
        super().__init__(callback)
        names = [command] if isinstance(command, str) else list(command)
        if not names:
            msg = "CommandHandler requires at least one command."
            raise ValueError(msg)
        normalized: list[str] = []
        for name in names:
            cleaned = name.strip().removeprefix("/")
            if not cleaned:
                msg = "CommandHandler requires non-empty command strings."
                raise ValueError(msg)
            normalized.append(cleaned.lower())
        self.commands: frozenset[str] = frozenset(normalized)
        self.filters = filters

    def check_update(self, update: object) -> list[str] | None:
        """Return the command's argument list when the update matches.

        Args:
            update: The incoming update.

        Returns:
            The argument words following the command (possibly empty) on a
            match, ``None`` otherwise.
        """
        if not isinstance(update, Update):
            return None
        message = update.effective_message
        if message is None or not message.text or not message.text.startswith("/"):
            return None
        parts = message.text.split()
        command = parts[0][1:]
        if "@" in command:
            command = command.split("@", 1)[0]
        if not command or command.lower() not in self.commands:
            return None
        if self.filters is not None and not self.filters(message):
            return None
        return parts[1:]

    def collect_additional_context(self, context: Any, update: Update, check_result: Any) -> None:
        """Store the parsed command arguments on ``context.args``.

        Args:
            context: The callback context being populated.
            update: The update being processed.
            check_result: The argument list :meth:`check_update` returned.
        """
        if check_result is not None:
            context.args = check_result
