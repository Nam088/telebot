"""Per-update callback context passed to handler and error callbacks (T019)."""

from __future__ import annotations

import re
import typing as t

from telebot_py.types import Chat, Message, Update, User

if t.TYPE_CHECKING:
    from telebot_py.bot.client import Bot
    from telebot_py.kernel.app import Application
    from telebot_py.scheduler.queue import JobQueue


class CallbackContext:
    """Context object delivered as the second argument to handler callbacks.

    Created fresh for every matched handler by the dispatcher. Carries the
    update being processed, shortcuts to its effective chat/user/message, the
    per-user, per-chat, and bot-wide mutable data dicts, and slots populated
    by specific handlers (``args`` for commands, ``matches`` for regex
    patterns). Error handlers additionally find the raised exception in
    :attr:`error`.

    Example:
        >>> async def handler(update, context):
        ...     await context.bot.send_message(context.effective_chat.id, "hi")

    Attributes:
        application: The application processing the update.
        bot: The Bot client used to call the Telegram API.
        update: The update currently being processed.
        user_data: Mutable dict for the effective user, ``None`` when the
            update carries no user. Shared across updates of the same user.
        chat_data: Mutable dict for the effective chat, ``None`` when the
            update carries no chat. Shared across updates of the same chat.
        bot_data: Mutable dict shared by every update this application sees.
        job_queue: The application's JobQueue when the builder enabled it
            (``job_queue()``), otherwise ``None``.
        matches: Regex matches collected by pattern-based handlers.
        args: Command arguments collected by CommandHandler.
        error: The exception being reported, set for error handlers only.
    """

    def __init__(self, application: Application, update: Update) -> None:
        """Build a context for ``update`` against ``application``'s data stores.

        Args:
            application: The application whose bot and data dicts back this
                context.
            update: The update being processed.
        """
        self.application = application
        self.bot: Bot = application.bot
        self.update = update
        self.error: Exception | None = None
        self.args: list[str] | None = None
        self.matches: list[re.Match[str]] | None = None
        self.job_queue: JobQueue | None = application.job_queue
        user = update.effective_user
        chat = update.effective_chat
        self.user_data: dict[t.Any, t.Any] | None = (
            application.user_data[user.id] if user is not None else None
        )
        self.chat_data: dict[t.Any, t.Any] | None = (
            application.chat_data[chat.id] if chat is not None else None
        )
        self.bot_data: dict[t.Any, t.Any] = application.bot_data

    @classmethod
    def from_update(cls, update: Update, application: Application) -> CallbackContext:
        """Build a context for ``update`` (python-telegram-bot parity factory).

        Args:
            update: The update being processed.
            application: The application whose bot and data dicts back the
                context.

        Returns:
            A fresh CallbackContext bound to the update.
        """
        return cls(application, update)

    @property
    def effective_chat(self) -> Chat | None:
        """The chat this update happened in, when known."""
        return self.update.effective_chat

    @property
    def effective_user(self) -> User | None:
        """The user who triggered this update, when known."""
        return self.update.effective_user

    @property
    def message(self) -> Message | None:
        """The message carried by the update, regardless of payload type."""
        return self.update.effective_message
