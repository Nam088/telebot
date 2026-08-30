"""Stateful conversation handler: a finite-state machine over updates (T029)."""

from __future__ import annotations

import logging
import time
import typing as t
from collections.abc import Callable, Mapping, Sequence

from telebot_py.routing.handlers.base import BaseHandler
from telebot_py.types import Update

logger = logging.getLogger("telebot_py.routing.conversation")

#: Sentinel state returned by a callback to close the conversation.
END: t.Final[int] = -1
#: Sentinel pseudo-state keyed handlers run when a conversation times out.
TIMEOUT: t.Final[int] = -2

#: Conversation storage key: ``(chat_id, user_id[, message_id])`` components
#: included per the handler's ``per_chat``/``per_user``/``per_message`` flags.
ConversationKey = tuple[t.Any, ...]

#: Matched handler bookkeeping kept between check_update and handle_update.
_Match = tuple[Update, BaseHandler, ConversationKey, t.Any, bool]


class ConversationHandler(BaseHandler):
    """Multi-step conversation handler (python-telegram-bot parity).

    ``entry_points`` start a conversation, ``states`` maps each state to the
    handlers routing the next update, and the state a callback returns moves
    the conversation; returning :attr:`END` closes it. ``fallbacks`` run from
    any state and reset the conversation. With ``timeout`` set, idle
    conversations are routed to the ``TIMEOUT`` pseudo-state handlers when
    present, or closed otherwise.

    Example:
        >>> handler = ConversationHandler(
        ...     entry_points=[CommandHandler("start", start)],
        ...     states={NAME: [MessageHandler(filters.TEXT, name)],
        ...             AGE: [MessageHandler(filters.TEXT, age)]},
        ...     fallbacks=[CommandHandler("cancel", cancel)],
        ... )

    Attributes:
        entry_points: Handlers that start the conversation.
        states: Handlers keyed by state (plus optional ``TIMEOUT`` entry).
        fallbacks: Handlers that reset the conversation from any state.
        conversations: In-memory state per conversation key.
    """

    END: t.ClassVar[int] = END
    TIMEOUT: t.ClassVar[int] = TIMEOUT

    def __init__(
        self,
        *,
        entry_points: Sequence[BaseHandler],
        states: Mapping[object, Sequence[BaseHandler]],
        fallbacks: Sequence[BaseHandler] | None = None,
        per_chat: bool = True,
        per_user: bool = True,
        per_message: bool = False,
        timeout: float | None = None,
        time_fn: Callable[[], float] | None = None,
        name: str | None = None,
        persistent: bool = False,
        allow_reentry: bool = False,
        map_to_parent: Mapping[object, object] | None = None,
    ) -> None:
        """Initialize the conversation handler.

        Args:
            entry_points: Handlers that initiate the conversation.
            states: Handlers per state identifier; may include a ``TIMEOUT``
                entry for expired conversations.
            fallbacks: Handlers that reset the conversation from any state.
            per_chat: Track conversations separately per chat.
            per_user: Track conversations separately per user.
            per_message: Track conversations per originating message
                (callback-query flows); mutually exclusive with per_chat/per_user.
            timeout: Seconds of inactivity before the conversation expires;
                checked lazily on the next update via ``time_fn``.
            time_fn: Injectable clock for timeout checks (tests); defaults
                to :func:`time.monotonic`.
            name: Persistence namespace; required when ``persistent``.
            persistent: Write state transitions through to the application's
                persistence backend (SC-005).
            allow_reentry: Let entry points restart an active conversation.
            map_to_parent: Child-exit states mapped to parent states for
                nested conversations; the child closes when one is returned.

        Raises:
            ValueError: On invalid combinations (FR-014 fail fast): no entry
                points, ``persistent`` without ``name``, ``per_message`` with
                ``per_chat``/``per_user``, or no key dimension at all.
        """
        super().__init__(callback=_noop_callback)
        if not entry_points:
            msg = "ConversationHandler requires at least one entry point."
            raise ValueError(msg)
        if persistent and not name:
            msg = "ConversationHandler needs a 'name' when persistent=True."
            raise ValueError(msg)
        if per_message and (per_chat or per_user):
            msg = "per_message=True requires per_chat=False and per_user=False."
            raise ValueError(msg)
        if not (per_chat or per_user or per_message):
            msg = "at least one of per_chat, per_user, per_message must be True."
            raise ValueError(msg)

        self.entry_points = list(entry_points)
        self.states: dict[object, list[BaseHandler]] = {
            state: list(handlers) for state, handlers in states.items()
        }
        self.fallbacks = list(fallbacks) if fallbacks is not None else []
        self.per_chat = per_chat
        self.per_user = per_user
        self.per_message = per_message
        self.timeout = timeout
        self._time_fn = time_fn if time_fn is not None else time.monotonic
        self.name = name
        self.persistent = persistent
        self.allow_reentry = allow_reentry
        self.map_to_parent = dict(map_to_parent) if map_to_parent is not None else None
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
        *,
        timed_out: bool = False,
    ) -> bool:
        """Record the first handler matching ``update`` and return whether one matched."""
        for handler in handlers:
            check = handler.check_update(update)
            if check is not None and check is not False:
                self._matches[id(update)] = (update, handler, key, check, timed_out)
                return True
        return False

    def check_update(self, update: object) -> bool:
        """Return True when an entry/state/fallback handler matches for this update.

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
        state = self.conversations.get(key)
        if state is None:
            return self._match_into(update, key, self.entry_points)

        if self.timeout is not None:
            idle_for = self._time_fn() - self._last_activity.get(key, self._time_fn())
            if idle_for >= self.timeout:
                timeout_handlers = self.states.get(TIMEOUT, [])
                if self._match_into(update, key, timeout_handlers, timed_out=True):
                    return True
                return self._match_into(update, key, self.entry_points, timed_out=True)

        if self.allow_reentry and self._match_into(update, key, self.entry_points):
            return True
        if self._match_into(update, key, self.states.get(state, [])):
            return True
        return self._match_into(update, key, self.fallbacks)

    async def handle_update(
        self, update: Update, context: t.Any, check_result: t.Any = None
    ) -> t.Any:
        """Dispatch to the matched handler and transition the conversation state.

        Args:
            update: The incoming update.
            context: The callback context for this dispatch.
            check_result: Ignored; the match was recorded by check_update.

        Returns:
            The new state, the mapped parent state for nested conversations,
            :attr:`END` when the conversation closed, or ``None`` when
            nothing matched or the state was unchanged.
        """
        match = self._matches.pop(id(update), None)
        if match is None or match[0] is not update:
            return None
        _, handler, key, inner_check, timed_out = match

        if timed_out:
            self.conversations.pop(key, None)
            self._last_activity.pop(key, None)
            await self._persist(context, key, None)

        new_state = await handler.handle_update(update, context, inner_check)
        return await self._apply_state(context, key, new_state)

    async def _apply_state(self, context: t.Any, key: ConversationKey, new_state: t.Any) -> t.Any:
        """Move the conversation to ``new_state``, persisting the transition."""
        if new_state == END:
            self.conversations.pop(key, None)
            self._last_activity.pop(key, None)
            await self._persist(context, key, None)
            return END
        if self.map_to_parent is not None and new_state in self.map_to_parent:
            self.conversations.pop(key, None)
            self._last_activity.pop(key, None)
            await self._persist(context, key, None)
            return self.map_to_parent[new_state]
        if new_state is not None:
            self.conversations[key] = new_state
            self._last_activity[key] = self._time_fn()
            await self._persist(context, key, new_state)
            return new_state
        if key in self.conversations:  # None keeps the current state alive
            self._last_activity[key] = self._time_fn()
            await self._persist(context, key, self.conversations[key])
        return self.conversations.get(key)

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
    """Placeholder callback; ConversationHandler routes through inner handlers."""
