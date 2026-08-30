"""Linear step-by-step conversation handler (T030)."""

from __future__ import annotations

import time
import typing as t
from collections.abc import Callable, Sequence

from telebot_py.routing.conversation import END, ConversationKey
from telebot_py.routing.handlers.base import BaseHandler
from telebot_py.types import Update

#: Matched handler bookkeeping kept between check_update and handle_update.
_MatchKind = str  # "entry" | "step" | "fallback"
_Match = tuple[Update, BaseHandler, ConversationKey, t.Any, _MatchKind, bool]


class LinearConversationHandler(BaseHandler):
    """Conversation handler walking a fixed list of ordered steps.

    Instead of a state graph, ``steps`` is an ordered sequence of handler
    lists: the entry points open the flow at step 0, each matching update
    advances exactly one step, and the flow closes after the last step.
    ``fallbacks`` reset the conversation from any step. Callback return
    values are ignored — order alone drives progress.

    Example:
        >>> handler = LinearConversationHandler(
        ...     entry_points=[CommandHandler("survey", intro)],
        ...     steps=[[MessageHandler(filters.TEXT, ask_name)],
        ...            [MessageHandler(filters.TEXT, ask_age)]],
        ...     fallbacks=[CommandHandler("cancel", cancel)],
        ... )

    Attributes:
        entry_points: Handlers that start the linear flow.
        steps: Ordered step handler lists; the index is the persisted state.
        fallbacks: Handlers that reset the conversation from any step.
        conversations: In-memory step index per conversation key.
    """

    END: t.ClassVar[int] = END

    def __init__(
        self,
        *,
        entry_points: Sequence[BaseHandler],
        steps: Sequence[Sequence[BaseHandler]],
        fallbacks: Sequence[BaseHandler] | None = None,
        per_chat: bool = True,
        per_user: bool = True,
        per_message: bool = False,
        timeout: float | None = None,
        time_fn: Callable[[], float] | None = None,
        name: str | None = None,
        persistent: bool = False,
    ) -> None:
        """Initialize the linear conversation handler.

        Args:
            entry_points: Handlers that initiate the flow at the first step.
            steps: Ordered step handler lists; every step needs at least one
                handler matching the expected input.
            fallbacks: Handlers that reset the flow from any step.
            per_chat: Track conversations separately per chat.
            per_user: Track conversations separately per user.
            per_message: Track conversations per originating message;
                mutually exclusive with per_chat/per_user.
            timeout: Seconds of inactivity before the flow expires and must
                be re-entered; checked lazily on the next update.
            time_fn: Injectable clock for timeout checks (tests); defaults
                to :func:`time.monotonic`.
            name: Persistence namespace; required when ``persistent``.
            persistent: Write step transitions through to the application's
                persistence backend.

        Raises:
            ValueError: On invalid combinations (FR-014 fail fast).
        """
        super().__init__(callback=_noop_callback)
        if not entry_points:
            msg = "LinearConversationHandler requires at least one entry point."
            raise ValueError(msg)
        if not steps or any(not step for step in steps):
            msg = "LinearConversationHandler requires at least one non-empty step."
            raise ValueError(msg)
        if persistent and not name:
            msg = "LinearConversationHandler needs a 'name' when persistent=True."
            raise ValueError(msg)
        if per_message and (per_chat or per_user):
            msg = "per_message=True requires per_chat=False and per_user=False."
            raise ValueError(msg)
        if not (per_chat or per_user or per_message):
            msg = "at least one of per_chat, per_user, per_message must be True."
            raise ValueError(msg)

        self.entry_points = list(entry_points)
        self.steps: list[list[BaseHandler]] = [list(step) for step in steps]
        self.fallbacks = list(fallbacks) if fallbacks is not None else []
        self.per_chat = per_chat
        self.per_user = per_user
        self.per_message = per_message
        self.timeout = timeout
        self._time_fn = time_fn if time_fn is not None else time.monotonic
        self.name = name
        self.persistent = persistent
        self.conversations: dict[ConversationKey, object] = {}
        self._last_activity: dict[ConversationKey, float] = {}
        self._matches: dict[int, _Match] = {}

    def _get_key(self, update: Update) -> ConversationKey | None:
        """Compute the conversation key for ``update``, or ``None`` if unresolvable."""
        chat = update.effective_chat if self.per_chat else None
        user = update.effective_user if self.per_user else None
        if self.per_chat and chat is None:
            return None
        if self.per_user and user is None:
            return None
        parts: list[t.Any] = []
        if self.per_chat and chat is not None:
            parts.append(chat.id)
        if self.per_user and user is not None:
            parts.append(user.id)
        if self.per_message:
            callback_query = update.callback_query
            message = callback_query.message if callback_query is not None else None
            if message is None:
                return None
            parts.append(message.message_id)
        return tuple(parts)

    def _match_into(
        self,
        update: Update,
        key: ConversationKey,
        handlers: Sequence[BaseHandler],
        kind: _MatchKind,
        *,
        timed_out: bool = False,
    ) -> bool:
        """Record the first handler matching ``update`` and return whether one matched."""
        for handler in handlers:
            check = handler.check_update(update)
            if check is not None and check is not False:
                self._matches[id(update)] = (update, handler, key, check, kind, timed_out)
                return True
        return False

    def check_update(self, update: object) -> bool:
        """Return True when the entry, current step, or fallbacks match.

        Args:
            update: The incoming update.

        Returns:
            True when this conversation handler will process the update.
        """
        if not isinstance(update, Update):
            return False
        key = self._get_key(update)
        if key is None:
            return False
        index = self.conversations.get(key)
        if index is None:
            return self._match_into(update, key, self.entry_points, "entry")

        if self.timeout is not None:
            idle_for = self._time_fn() - self._last_activity.get(key, self._time_fn())
            if idle_for >= self.timeout:
                return self._match_into(update, key, self.entry_points, "entry", timed_out=True)

        if (
            isinstance(index, int)
            and 0 <= index < len(self.steps)
            and self._match_into(update, key, self.steps[index], "step")
        ):
            return True
        return self._match_into(update, key, self.fallbacks, "fallback")

    async def handle_update(
        self, update: Update, context: t.Any, check_result: t.Any = None
    ) -> t.Any:
        """Dispatch to the matched handler and advance the step exactly once.

        Args:
            update: The incoming update.
            context: The callback context for this dispatch.
            check_result: Ignored; the match was recorded by check_update.

        Returns:
            The new step index, :attr:`END` when the flow finished or was
            reset, or ``None`` when nothing matched.
        """
        match = self._matches.pop(id(update), None)
        if match is None or match[0] is not update:
            return None
        _, handler, key, inner_check, kind, timed_out = match

        if timed_out:
            self.conversations.pop(key, None)
            self._last_activity.pop(key, None)
            await self._persist(context, key, None)

        await handler.handle_update(update, context, inner_check)

        if kind == "fallback":
            self.conversations.pop(key, None)
            self._last_activity.pop(key, None)
            await self._persist(context, key, None)
            return END

        current = self.conversations.get(key)
        next_index = 0 if kind == "entry" else (current + 1 if isinstance(current, int) else 0)
        if next_index >= len(self.steps):
            self.conversations.pop(key, None)
            self._last_activity.pop(key, None)
            await self._persist(context, key, None)
            return END
        self.conversations[key] = next_index
        self._last_activity[key] = self._time_fn()
        await self._persist(context, key, next_index)
        return next_index

    async def _persist(self, context: t.Any, key: ConversationKey, state: t.Any) -> None:
        """Write through to the application's persistence when configured."""
        if not (self.persistent and self.name):
            return
        application = getattr(context, "application", None)
        persistence = getattr(application, "persistence", None) if application is not None else None
        if persistence is None:
            return
        await persistence.update_conversation(self.name, key, state)


def _noop_callback(update: Update, context: t.Any) -> None:
    """Placeholder callback; routing happens through the inner step handlers."""
