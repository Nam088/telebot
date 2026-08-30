"""Async conversation controller handed to registered flows (T031)."""

from __future__ import annotations

import asyncio
import re
import typing as t

from telebot_py.filters.base import MessageFilter
from telebot_py.routing.async_conversation.types import (
    ConversationExitSignal,
    ConversationTimeoutError,
    UpdatePredicate,
)
from telebot_py.types import CallbackQuery, Message, Update

if t.TYPE_CHECKING:
    from telebot_py.routing.async_conversation.manager import AsyncConversationManager

#: Session key: ``(chat_id, user_id)`` tuple; components may be ``None``.
SessionKey = tuple[t.Any, t.Any]


class AsyncConversation:
    """Controller suspending and resuming a linear async/await flow.

    Every ``wait*``/``ask`` call registers a pending wait with the manager,
    suspends the flow, and resumes it when the next routed update arrives —
    mirrors the node ``AsyncConversation`` controller.

    Example:
        >>> async def flow(conversation, context):
        ...     name = await conversation.ask("What is your name?")
        ...     await context.bot.send_message(100, f"Hi {name}!")

    Attributes:
        name: The registered conversation name this session runs.
        context: The callback context that started the session.
        user_id: The user this session is scoped to, when known.
        chat_id: The chat this session is scoped to, when known.
    """

    def __init__(
        self,
        name: str,
        context: t.Any,
        session_key: SessionKey,
        manager: AsyncConversationManager,
        *,
        user_id: int | None = None,
        chat_id: int | str | None = None,
        default_timeout: float | None = None,
    ) -> None:
        """Initialize the controller; created by the manager, not bot code.

        Args:
            name: The registered conversation name.
            context: The callback context owning the session.
            session_key: The ``(chat_id, user_id)`` session key.
            manager: The manager routing updates into this session.
            user_id: The session's user id, when known.
            chat_id: The session's chat id, when known.
            default_timeout: Wait timeout applied when a call omits one.
        """
        self.name = name
        self.context = context
        self.user_id = user_id
        self.chat_id = chat_id
        self._session_key = session_key
        self._manager = manager
        self._default_timeout = default_timeout

    async def wait(
        self, filter: UpdatePredicate | None = None, timeout: float | None = None
    ) -> Update:
        """Suspend until the next update satisfying ``filter`` arrives.

        Args:
            filter: Optional predicate the incoming update must satisfy.
            timeout: Seconds to wait before raising; falls back to the
                handler-level default timeout.

        Returns:
            The update that resumed the conversation.

        Raises:
            ConversationTimeoutError: When the wait exceeds the timeout.
        """
        loop = asyncio.get_running_loop()
        future: asyncio.Future[Update] = loop.create_future()
        effective_timeout = timeout if timeout is not None else self._default_timeout
        timer: asyncio.TimerHandle | None = None
        if effective_timeout is not None and effective_timeout > 0:
            timer = loop.call_later(effective_timeout, self._fire_timeout, future)
        self._manager.register_pending_wait(self._session_key, filter, future)
        try:
            return await future
        finally:
            if timer is not None:
                timer.cancel()

    def _fire_timeout(self, future: asyncio.Future[Update]) -> None:
        """Reject the pending wait with a timeout error."""
        self._manager.clear_pending_wait(self._session_key)
        if not future.done():
            future.set_exception(ConversationTimeoutError())

    async def wait_for_message(
        self, filter: MessageFilter | None = None, timeout: float | None = None
    ) -> Message:
        """Suspend until the next message (optionally matching ``filter``).

        Args:
            filter: Optional message filter the response must satisfy.
            timeout: Seconds to wait before raising.

        Returns:
            The message that resumed the conversation.

        Raises:
            ConversationTimeoutError: When the wait exceeds the timeout.
        """

        def predicate(update: Update) -> bool:
            message = update.effective_message
            if message is None:
                return False
            return bool(filter(message)) if filter is not None else True

        update = await self.wait(predicate, timeout)
        message = update.effective_message
        assert message is not None
        return message

    async def wait_for_callback_query(
        self, pattern: str | re.Pattern[str] | None = None, timeout: float | None = None
    ) -> CallbackQuery:
        """Suspend until the next callback query (optionally matching ``pattern``).

        Args:
            pattern: Optional exact-match string or compiled regex applied
                to ``callback_query.data``.
            timeout: Seconds to wait before raising.

        Returns:
            The callback query that resumed the conversation.

        Raises:
            ConversationTimeoutError: When the wait exceeds the timeout.
        """

        def predicate(update: Update) -> bool:
            query = update.callback_query
            if query is None:
                return False
            if pattern is None:
                return True
            data = query.data or ""
            if isinstance(pattern, str):
                return data == pattern
            return pattern.fullmatch(data) is not None

        update = await self.wait(predicate, timeout)
        query = update.callback_query
        assert query is not None
        return query

    async def ask(
        self, text: str, filter: MessageFilter | None = None, timeout: float | None = None
    ) -> str:
        """Send a prompt and suspend until the user's text answer arrives.

        Args:
            text: The prompt message to send.
            filter: Optional message filter the answer must satisfy.
            timeout: Seconds to wait before raising.

        Returns:
            The text of the answering message (possibly empty).

        Raises:
            ConversationTimeoutError: When the wait exceeds the timeout.
        """
        chat_id = self.chat_id
        if chat_id is None:
            chat = self.context.update.effective_chat if self.context.update is not None else None
            chat_id = chat.id if chat is not None else self.user_id
        if chat_id is not None:
            await self.context.bot.send_message(chat_id=chat_id, text=text)
        message = await self.wait_for_message(filter, timeout)
        return message.text or ""

    def exit(self) -> t.NoReturn:
        """End the conversation flow immediately.

        Raises:
            ConversationExitSignal: Always; the runner catches it to close
                the session cleanly.
        """
        raise ConversationExitSignal
