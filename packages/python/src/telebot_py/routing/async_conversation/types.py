"""Async conversation types, errors, and callback signatures."""

from __future__ import annotations

import typing as t
from collections.abc import Awaitable, Callable

if t.TYPE_CHECKING:
    from telebot_py.routing.async_conversation.conversation import AsyncConversation
    from telebot_py.types import Update


class ConversationTimeoutError(Exception):
    """Raised when a conversation wait exceeds its allocated timeout.

    Example:
        >>> try:
        ...     await conversation.wait(timeout=60)
        ... except ConversationTimeoutError:
        ...     print("user never answered")
    """

    def __init__(self, message: str = "Conversation wait timed out.") -> None:
        """Initialize the error.

        Args:
            message: Human-readable timeout description.
        """
        super().__init__(message)


class ConversationExitSignal(Exception):
    """Internal control signal raised by :meth:`AsyncConversation.exit`.

    Not an error condition: conversation runners catch it to end the flow
    cleanly. Distinct from :class:`ConversationTimeoutError`.
    """

    def __init__(self) -> None:
        """Initialize the signal."""
        super().__init__("Conversation exited early.")


#: Synchronous predicate deciding whether an update satisfies a wait.
UpdatePredicate = Callable[["Update"], bool]

#: Conversation flow signature: ``(conversation, context) -> None`` awaited
#: as a coroutine; suspends at each controller wait.
AsyncConversationFn = Callable[["AsyncConversation", t.Any], Awaitable[None]]
