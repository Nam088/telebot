"""Async conversation session manager and context helper (T031)."""

from __future__ import annotations

import asyncio
import contextlib
import typing as t

from telebot_py.routing.async_conversation.conversation import AsyncConversation, SessionKey
from telebot_py.routing.async_conversation.types import (
    AsyncConversationFn,
    ConversationExitSignal,
    UpdatePredicate,
)
from telebot_py.types import Update


class _PendingWait:
    """A registered wait: the predicate gating it and the future resolving it."""

    __slots__ = ("future", "predicate")

    def __init__(self, predicate: UpdatePredicate | None, future: asyncio.Future[Update]) -> None:
        self.predicate = predicate
        self.future = future


class _Session:
    """One active conversation flow: its task, controller, and pending wait."""

    __slots__ = ("conversation", "name", "pending_wait", "ready_event", "step_event", "task")

    def __init__(self, name: str, conversation: AsyncConversation) -> None:
        self.name = name
        self.conversation = conversation
        self.pending_wait: _PendingWait | None = None
        self.ready_event = asyncio.Event()
        self.step_event: asyncio.Event | None = None
        self.task: asyncio.Task[None] | None = None


class AsyncConversationManager:
    """Registers named flows and routes updates into their active sessions.

    Python parity of the node ``AsyncConversationManager``: ``register`` a
    flow under a name, ``enter`` it (the runner task suspends at the first
    wait), and each subsequent update is delivered through
    :meth:`handle_update` until the flow finishes.

    Example:
        >>> manager = AsyncConversationManager()
        >>> manager.register("survey", survey_flow)
        >>> await manager.enter("survey", context)
    """

    def __init__(self) -> None:
        """Initialize an empty manager with no registered flows."""
        self._handlers: dict[str, AsyncConversationFn] = {}
        self._default_timeouts: dict[str, float | None] = {}
        self._sessions: dict[SessionKey, _Session] = {}

    def register(
        self, name: str, handler: AsyncConversationFn, *, default_timeout: float | None = None
    ) -> None:
        """Register a flow under ``name``, replacing any previous entry.

        Args:
            name: Non-empty conversation identifier.
            handler: The coroutine function implementing the flow.
            default_timeout: Wait timeout applied when flow waits omit one.

        Raises:
            ValueError: If ``name`` is blank.
        """
        if not name or not name.strip():
            msg = "Conversation name must be a non-empty string."
            raise ValueError(msg)
        self._handlers[name.strip()] = handler
        self._default_timeouts[name.strip()] = default_timeout

    def get_session_key(
        self, user_id: int | None = None, chat_id: int | str | None = None
    ) -> SessionKey:
        """Return the ``(chat_id, user_id)`` session key for the ids.

        Args:
            user_id: The user id, when known.
            chat_id: The chat id, when known.

        Returns:
            The session key tuple; components may be ``None``.
        """
        return (chat_id, user_id)

    def has_active_session(
        self, user_id: int | None = None, chat_id: int | str | None = None
    ) -> bool:
        """Return whether a session is active for the given user/chat.

        Args:
            user_id: The user id, when known.
            chat_id: The chat id, when known.

        Returns:
            True when a registered flow session is in flight.
        """
        return self.get_session_key(user_id, chat_id) in self._sessions

    def matches_pending(
        self, user_id: int | None, chat_id: int | str | None, update: Update
    ) -> bool:
        """Return whether the session for this user/chat awaits ``update``.

        Args:
            user_id: The user id, when known.
            chat_id: The chat id, when known.
            update: The incoming update to test against the pending predicate.

        Returns:
            True when a pending wait exists and its predicate accepts the update.
        """
        session = self._sessions.get(self.get_session_key(user_id, chat_id))
        if session is None or session.pending_wait is None:
            return False
        predicate = session.pending_wait.predicate
        return predicate(update) if predicate is not None else True

    async def enter(
        self,
        name: str,
        context: t.Any,
        user_id: int | None = None,
        chat_id: int | str | None = None,
    ) -> None:
        """Start a registered flow, resolving once it suspends or finishes.

        Args:
            name: The registered conversation name.
            context: The callback context handed to the flow.
            user_id: Override the session's user id (defaults to the
                context update's effective user).
            chat_id: Override the session's chat id (defaults to the
                context update's effective chat).

        Raises:
            ValueError: If ``name`` is not registered.
            Exception: Whatever the flow raises before its first wait.
        """
        handler = self._handlers.get(name)
        if handler is None:
            msg = f"Conversation '{name}' is not registered."
            raise ValueError(msg)

        update = getattr(context, "update", None)
        if user_id is None and update is not None and update.effective_user is not None:
            user_id = update.effective_user.id
        if chat_id is None and update is not None and update.effective_chat is not None:
            chat_id = update.effective_chat.id
        key = self.get_session_key(user_id, chat_id)

        existing = self._sessions.get(key)
        if (
            existing is not None
            and existing.pending_wait is not None
            and not existing.pending_wait.future.done()
        ):
            existing.pending_wait.future.set_exception(ConversationExitSignal())

        conversation = AsyncConversation(
            name,
            context,
            key,
            self,
            user_id=user_id,
            chat_id=chat_id,
            default_timeout=self._default_timeouts.get(name),
        )
        session = _Session(name, conversation)

        async def runner() -> None:
            try:
                await handler(conversation, context)
            except ConversationExitSignal:
                pass
            finally:
                session.ready_event.set()
                if session.step_event is not None:
                    session.step_event.set()
                if self._sessions.get(key) is session:
                    del self._sessions[key]

        session.task = asyncio.create_task(runner(), name=f"telebot_py-conversation-{name}")
        self._sessions[key] = session

        ready_waiter = asyncio.create_task(session.ready_event.wait())
        await asyncio.wait({ready_waiter, session.task}, return_when=asyncio.FIRST_COMPLETED)
        ready_waiter.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await ready_waiter
        if session.task.done():
            exc = session.task.exception()
            if exc is not None:
                raise exc

    def register_pending_wait(
        self,
        session_key: SessionKey,
        predicate: UpdatePredicate | None,
        future: asyncio.Future[Update],
    ) -> None:
        """Record a flow's pending wait so the next update can resolve it.

        Args:
            session_key: The session registering the wait.
            predicate: Optional predicate gating which update resolves it.
            future: The future resolved with the matching update.
        """
        session = self._sessions.get(session_key)
        if session is None:
            if not future.done():
                future.set_exception(ConversationExitSignal())
            return
        session.pending_wait = _PendingWait(predicate, future)
        session.ready_event.set()
        if session.step_event is not None:
            session.step_event.set()

    def clear_pending_wait(self, session_key: SessionKey) -> None:
        """Drop the session's pending wait (timeout path).

        Args:
            session_key: The session whose wait is cleared.
        """
        session = self._sessions.get(session_key)
        if session is not None:
            session.pending_wait = None
            if session.step_event is not None:
                session.step_event.set()

    async def handle_update(self, update: Update) -> bool:
        """Deliver ``update`` to the matching session's pending wait.

        Awaits the flow until it suspends at its next wait or finishes, so
        sequential updates never overtake an in-progress resume.

        Args:
            update: The incoming update.

        Returns:
            True when a session consumed the update.

        Raises:
            Exception: Whatever the resumed flow raises.
        """
        user = update.effective_user
        chat = update.effective_chat
        user_id = user.id if user is not None else None
        chat_id = chat.id if chat is not None else None
        key = self.get_session_key(user_id, chat_id)
        session = self._sessions.get(key)
        if session is None or session.pending_wait is None or session.task is None:
            return False
        predicate = session.pending_wait.predicate
        if predicate is not None and not predicate(update):
            return False

        pending = session.pending_wait
        session.pending_wait = None
        session.step_event = asyncio.Event()
        if not pending.future.done():
            pending.future.set_result(update)

        step_waiter = asyncio.create_task(session.step_event.wait())
        await asyncio.wait({step_waiter, session.task}, return_when=asyncio.FIRST_COMPLETED)
        step_waiter.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await step_waiter
        if session.task.done():
            exc = session.task.exception()
            if exc is not None:
                raise exc
        return True


class ConversationContextHelper:
    """Convenience wrapper entering conversations from within callbacks.

    Example:
        >>> helper = ConversationContextHelper(context, handler.manager)
        >>> if not helper.active:
        ...     await helper.enter("survey")
    """

    def __init__(self, context: t.Any, manager: AsyncConversationManager) -> None:
        """Initialize the helper.

        Args:
            context: The callback context whose user/chat scopes sessions.
            manager: The manager holding the registered flows.
        """
        self._context = context
        self._manager = manager

    async def enter(self, name: str) -> None:
        """Enter the registered conversation ``name`` for this context.

        Args:
            name: The registered conversation name.

        Raises:
            ValueError: If ``name`` is not registered.
        """
        await self._manager.enter(name, self._context)

    @property
    def active(self) -> bool:
        """Whether this context's user/chat currently has an active session."""
        update = getattr(self._context, "update", None)
        user_id: int | None = None
        chat_id: int | str | None = None
        if update is not None:
            if update.effective_user is not None:
                user_id = update.effective_user.id
            if update.effective_chat is not None:
                chat_id = update.effective_chat.id
        return self._manager.has_active_session(user_id, chat_id)
