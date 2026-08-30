"""Handler adapter exposing async conversations to the dispatcher (T031)."""

from __future__ import annotations

import typing as t
from collections.abc import Sequence

from telebot_py.filters.base import MessageFilter
from telebot_py.routing.async_conversation.manager import AsyncConversationManager
from telebot_py.routing.async_conversation.types import AsyncConversationFn
from telebot_py.routing.handlers.base import BaseHandler
from telebot_py.types import Update

_Match = tuple[Update, BaseHandler | str, t.Any]


class AsyncConversationHandler(BaseHandler):
    """Handler running a registered async conversation flow.

    Combines the node manager architecture with the dispatcher: entry
    triggers (``entry_points``, ``entry_command``, or ``entry_filter``)
    start the flow; while the flow suspends at a ``wait``/``ask``, matching
    updates resume it instead of hitting the entry triggers again.

    Example:
        >>> async def quiz(conversation, context):
        ...     name = await conversation.ask("What is your name?")
        ...     await context.bot.send_message(100, f"Hi {name}!")
        >>> handler = AsyncConversationHandler(quiz, entry_command="quiz")

    Attributes:
        manager: The session manager owning this handler's flows.
        name: The registered flow name this handler enters.
        entry_points: Handlers whose match starts the flow.
        entry_command: Command name (without slash) starting the flow.
        entry_filter: Message filter whose match starts the flow.
        timeout: Default wait timeout in seconds for the flow.
    """

    def __init__(
        self,
        fn: AsyncConversationFn,
        *,
        entry_points: Sequence[BaseHandler] | None = None,
        entry_command: str | None = None,
        entry_filter: MessageFilter | None = None,
        name: str = "main",
        timeout: float | None = None,
    ) -> None:
        """Initialize the handler and register ``fn`` under ``name``.

        Args:
            fn: The flow coroutine receiving ``(conversation, context)``.
            entry_points: Handlers whose match starts the flow.
            entry_command: Command name starting the flow (``"quiz"`` for
                ``/quiz``).
            entry_filter: Message filter starting the flow.
            name: Registration name for the flow.
            timeout: Default wait timeout in seconds when flow waits omit one.

        Raises:
            ValueError: Without any entry trigger, or with a blank name
                (FR-014 fail fast).
        """
        super().__init__(callback=_noop_callback)
        if not entry_points and entry_command is None and entry_filter is None:
            msg = "AsyncConversationHandler requires entry_points, entry_command, or entry_filter."
            raise ValueError(msg)
        self.manager = AsyncConversationManager()
        self.manager.register(name, fn, default_timeout=timeout)
        self.name = name.strip()
        self.entry_points = list(entry_points) if entry_points is not None else []
        if entry_command:
            self.entry_command: str | None = entry_command.strip().removeprefix("/").lower()
        else:
            self.entry_command = None
        self.entry_filter = entry_filter
        self.timeout = timeout
        self._matches: dict[int, _Match] = {}

    def _command_matches(self, update: Update) -> bool:
        """Return whether the update message is this handler's entry command."""
        message = update.effective_message
        if message is None or not message.text or not message.text.startswith("/"):
            return False
        parts = message.text.split()
        command = parts[0][1:] if parts else ""
        if "@" in command:
            command = command.split("@", 1)[0]
        return command.lower() == self.entry_command if self.entry_command else False

    def check_update(self, update: object) -> bool:
        """Return True when a pending session or an entry trigger matches.

        Args:
            update: The incoming update.

        Returns:
            True when this handler will process the update.
        """
        if not isinstance(update, Update):
            return False
        user = update.effective_user
        chat = update.effective_chat
        user_id = user.id if user is not None else None
        chat_id = chat.id if chat is not None else None

        if self.manager.matches_pending(user_id, chat_id, update):
            self._matches[id(update)] = (update, "pending", None)
            return True

        for handler in self.entry_points:
            check = handler.check_update(update)
            if check is not None and check is not False:
                self._matches[id(update)] = (update, handler, check)
                return True

        if self.entry_command is not None and self._command_matches(update):
            self._matches[id(update)] = (update, "entry_command", None)
            return True

        if self.entry_filter is not None:
            message = update.effective_message
            if message is not None and self.entry_filter(message):
                self._matches[id(update)] = (update, "entry_filter", None)
                return True
        return False

    async def handle_update(
        self, update: Update, context: t.Any, check_result: t.Any = None
    ) -> None:
        """Resume the pending session or start the flow for this update.

        Args:
            update: The incoming update.
            context: The callback context for this dispatch.
            check_result: Ignored; the match was recorded by check_update.

        Raises:
            Exception: Whatever the conversation flow raises.
        """
        match = self._matches.pop(id(update), None)
        if match is None or match[0] is not update:
            return
        _, target, inner_check = match
        if target == "pending":
            await self.manager.handle_update(update)
            return
        if isinstance(target, BaseHandler):
            await target.handle_update(update, context, inner_check)
        user = update.effective_user
        chat = update.effective_chat
        await self.manager.enter(
            self.name,
            context,
            user_id=user.id if user is not None else None,
            chat_id=chat.id if chat is not None else None,
        )


def _noop_callback(update: Update, context: t.Any) -> None:
    """Placeholder callback; routing happens through the conversation flow."""
