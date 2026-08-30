"""Unit tests for the standard ConversationHandler (T025).

Covers entry points, per-state routing, transitions by returned key, END,
fallbacks, per_chat/per_user/per_message key variants, timeout routing with
an injectable clock (no real sleeping), and construction validation.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import pytest

from telebot_py import CallbackQueryHandler, CommandHandler, MessageHandler, filters
from telebot_py.routing.conversation import END, TIMEOUT, ConversationHandler
from telebot_py.types import Update

MakeUpdate = Callable[..., dict[str, Any]]

NAME, AGE = range(2)


class StubContext:
    """Minimal duck-typed CallbackContext stand-in for handler-level unit tests."""

    def __init__(self) -> None:
        self.application: Any = None
        self.bot: Any = None
        self.update: Any = None
        self.args: list[str] | None = None
        self.matches: Any = None
        self.user_data: dict[Any, Any] = {}
        self.chat_data: dict[Any, Any] = {}
        self.bot_data: dict[Any, Any] = {}
        self.error: Exception | None = None


class FakeClock:
    """Injectable monotonic-ish clock so timeout tests never really sleep."""

    def __init__(self) -> None:
        self.now = 0.0

    def advance(self, seconds: float) -> None:
        self.now += seconds

    def __call__(self) -> float:
        return self.now


def text_update(
    make_update: MakeUpdate, update_id: int, text: str, *, user_id: int = 42, chat_id: int = 100
) -> Update:
    """Build a typed text-message update for the given user/chat."""
    message: dict[str, Any] = {
        "message_id": update_id,
        "date": 1_700_000_000,
        "chat": {"id": chat_id, "type": "private"},
        "from": {"id": user_id, "is_bot": False, "first_name": "Alice"},
        "text": text,
    }
    if text.startswith("/"):
        command_word = text.split()[0]
        message["entities"] = [{"type": "bot_command", "offset": 0, "length": len(command_word)}]
    return Update.from_dict(make_update(update_id, message=message))


def callback_query_update(
    make_update: MakeUpdate, update_id: int, data: str, *, message_id: int = 500
) -> Update:
    """Build a typed callback-query update attached to a specific message."""
    return Update.from_dict(
        make_update(
            update_id,
            message=None,
            callback_query={
                "id": f"cb-{update_id}",
                "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
                "chat_instance": "ci-1",
                "data": data,
                "message": {
                    "message_id": message_id,
                    "date": 1_700_000_000,
                    "chat": {"id": 100, "type": "private"},
                },
            },
        )
    )


async def run(
    handler: ConversationHandler, update: Update, context: StubContext | None = None
) -> Any:
    """Assert the update matches and dispatch it, returning the new state."""
    check = handler.check_update(update)
    assert check is not None and check is not False
    return await handler.handle_update(update, context or StubContext(), check)


def make_recorder(calls: list[str], label: str, returns: Any = None) -> Callable[..., Any]:
    """Build a callback recording its label and returning ``returns``."""

    async def callback(update: Update, context: Any) -> Any:
        calls.append(label)
        return returns

    return callback


def build_signup_handler(
    calls: list[str],
    *,
    timeout: float | None = None,
    time_fn: Callable[[], float] | None = None,
    states_extra: dict[Any, list[Any]] | None = None,
    fallbacks: list[Any] | None = None,
    **overrides: Any,
) -> ConversationHandler:
    """Standard two-step conversation: /start -> NAME (text) -> AGE (text) -> END."""
    states: dict[Any, list[Any]] = {
        NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, make_recorder(calls, "name", AGE))],
        AGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, make_recorder(calls, "age", END))],
    }
    if states_extra:
        states.update(states_extra)
    return ConversationHandler(
        entry_points=[CommandHandler("start", make_recorder(calls, "entry", NAME))],
        states=states,
        fallbacks=fallbacks
        if fallbacks is not None
        else [CommandHandler("cancel", make_recorder(calls, "cancel", END))],
        timeout=timeout,
        time_fn=time_fn,
        **overrides,
    )


class TestEntryAndStateRouting:
    async def test_entry_point_starts_conversation(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls)

        assert handler.check_update(text_update(make_update, 1, "hello")) is False
        await run(handler, text_update(make_update, 2, "/start"))
        assert calls == ["entry"]

    async def test_state_handlers_route_by_current_state(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls)

        await run(handler, text_update(make_update, 1, "/start"))
        await run(handler, text_update(make_update, 2, "Alice"))
        await run(handler, text_update(make_update, 3, "30"))

        assert calls == ["entry", "name", "age"]

    async def test_entry_point_not_rerun_mid_conversation(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls)

        await run(handler, text_update(make_update, 1, "/start"))
        # Without allow_reentry the entry point does not match mid-conversation,
        # and /start falls out of the NAME state's TEXT & ~COMMAND handler.
        assert handler.check_update(text_update(make_update, 2, "/start")) is False
        assert calls == ["entry"]

    async def test_allow_reentry_prefers_entry_points(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls, allow_reentry=True)

        await run(handler, text_update(make_update, 1, "/start"))
        await run(handler, text_update(make_update, 2, "/start"))
        assert calls == ["entry", "entry"]

    async def test_returning_none_keeps_current_state(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = ConversationHandler(
            entry_points=[CommandHandler("start", make_recorder(calls, "entry", NAME))],
            states={
                NAME: [MessageHandler(filters.TEXT, make_recorder(calls, "stay", None))],
            },
            fallbacks=[],
        )

        await run(handler, text_update(make_update, 1, "/start"))
        await run(handler, text_update(make_update, 2, "hello"))
        await run(handler, text_update(make_update, 3, "again"))
        assert calls == ["entry", "stay", "stay"]

    async def test_unmatched_update_is_not_handled(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = ConversationHandler(
            entry_points=[CommandHandler("start", make_recorder(calls, "entry", NAME))],
            states={
                NAME: [MessageHandler(filters.Regex(r"^\d+$"), make_recorder(calls, "digit", END))]
            },
            fallbacks=[],
        )

        await run(handler, text_update(make_update, 1, "/start"))
        assert handler.check_update(text_update(make_update, 2, "not a digit")) is False

    async def test_end_closes_conversation(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls)

        await run(handler, text_update(make_update, 1, "/start"))
        await run(handler, text_update(make_update, 2, "Alice"))
        await run(handler, text_update(make_update, 3, "30"))
        assert calls == ["entry", "name", "age"]

        # After END the next /start re-enters through the entry point.
        await run(handler, text_update(make_update, 4, "/start"))
        assert calls == ["entry", "name", "age", "entry"]

    async def test_map_to_parent_returns_parent_state(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        child = ConversationHandler(
            entry_points=[CommandHandler("child", make_recorder(calls, "child-entry", "done"))],
            states={},
            fallbacks=[],
            map_to_parent={"done": AGE},
        )

        result = await run(child, text_update(make_update, 1, "/child"))
        assert result == AGE
        assert child.conversations == {}


class TestFallbacks:
    async def test_fallback_resets_from_any_state(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls)

        await run(handler, text_update(make_update, 1, "/start"))
        await run(handler, text_update(make_update, 2, "Alice"))
        await run(handler, text_update(make_update, 3, "/cancel"))
        assert calls == ["entry", "name", "cancel"]

        # Conversation is closed: plain text matches nothing now.
        assert handler.check_update(text_update(make_update, 4, "more text")) is False
        await run(handler, text_update(make_update, 5, "/start"))
        assert calls[-1] == "entry"

    async def test_fallback_from_first_state(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls)

        await run(handler, text_update(make_update, 1, "/start"))
        await run(handler, text_update(make_update, 2, "/cancel"))
        assert calls == ["entry", "cancel"]


class TestKeys:
    async def test_default_keys_are_per_chat_and_user(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls)

        await run(handler, text_update(make_update, 1, "/start", user_id=42))
        await run(handler, text_update(make_update, 2, "/start", user_id=77))

        # Distinct users in the same chat hold distinct conversations.
        assert len(handler.conversations) == 2
        await run(handler, text_update(make_update, 3, "Alice", user_id=42))
        assert calls == ["entry", "entry", "name"]

    async def test_per_user_false_shares_conversation_within_chat(
        self, make_update: MakeUpdate
    ) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls, per_user=False)

        await run(handler, text_update(make_update, 1, "/start", user_id=42))
        # A different user in the same chat continues the same conversation.
        await run(handler, text_update(make_update, 2, "Alice", user_id=77))
        assert calls == ["entry", "name"]
        assert len(handler.conversations) == 1

    async def test_per_chat_false_shares_conversation_across_chats(
        self, make_update: MakeUpdate
    ) -> None:
        calls: list[str] = []
        handler = build_signup_handler(calls, per_chat=False)

        await run(handler, text_update(make_update, 1, "/start", chat_id=100))
        # Same user in a different chat continues the very same conversation.
        await run(handler, text_update(make_update, 2, "Alice", chat_id=200))
        assert calls == ["entry", "name"]
        assert len(handler.conversations) == 1

    async def test_per_message_keys_distinguish_messages(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = ConversationHandler(
            entry_points=[CallbackQueryHandler(None, make_recorder(calls, "entry", NAME))],
            states={NAME: [CallbackQueryHandler(None, make_recorder(calls, "answer", END))]},
            fallbacks=[],
            per_chat=False,
            per_user=False,
            per_message=True,
        )

        await run(handler, callback_query_update(make_update, 1, "go", message_id=500))
        await run(handler, callback_query_update(make_update, 2, "go", message_id=600))
        assert len(handler.conversations) == 2

        await run(handler, callback_query_update(make_update, 3, "a", message_id=500))
        assert calls == ["entry", "entry", "answer"]
        # Message 600's conversation is untouched.
        assert len(handler.conversations) == 1

    async def test_unresolvable_key_never_matches(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = ConversationHandler(
            entry_points=[CallbackQueryHandler(None, make_recorder(calls, "entry", NAME))],
            states={},
            fallbacks=[],
            per_chat=False,
            per_user=False,
            per_message=True,
        )
        detached = Update.from_dict(
            make_update(
                1,
                message=None,
                callback_query={
                    "id": "cb-1",
                    "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
                    "chat_instance": "ci-1",
                    "data": "x",
                },
            )
        )
        assert handler.check_update(detached) is False


class TestTimeout:
    async def test_timeout_routes_to_timeout_state(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        clock = FakeClock()
        handler = build_signup_handler(
            calls,
            timeout=60,
            time_fn=clock,
            states_extra={
                TIMEOUT: [MessageHandler(filters.TEXT, make_recorder(calls, "timed-out", END))]
            },
        )

        await run(handler, text_update(make_update, 1, "/start"))
        clock.advance(61)
        await run(handler, text_update(make_update, 2, "late reply"))
        assert calls == ["entry", "timed-out"]

    async def test_timeout_without_timeout_state_ends_conversation(
        self, make_update: MakeUpdate
    ) -> None:
        calls: list[str] = []
        clock = FakeClock()
        handler = build_signup_handler(calls, timeout=60, time_fn=clock)

        await run(handler, text_update(make_update, 1, "/start"))
        clock.advance(61)
        # The expired conversation no longer routes to the state handler.
        assert handler.check_update(text_update(make_update, 2, "late reply")) is False
        # But the entry point can start a fresh conversation.
        await run(handler, text_update(make_update, 3, "/start"))
        assert calls == ["entry", "entry"]

    async def test_activity_resets_the_timeout_clock(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        clock = FakeClock()
        handler = build_signup_handler(calls, timeout=60, time_fn=clock)

        await run(handler, text_update(make_update, 1, "/start"))
        clock.advance(30)
        await run(handler, text_update(make_update, 2, "Alice"))
        clock.advance(50)  # 80s total, but only 50s since the last activity
        await run(handler, text_update(make_update, 3, "30"))
        assert calls == ["entry", "name", "age"]

    async def test_within_timeout_stays_in_state(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        clock = FakeClock()
        handler = build_signup_handler(calls, timeout=60, time_fn=clock)

        await run(handler, text_update(make_update, 1, "/start"))
        clock.advance(59)
        await run(handler, text_update(make_update, 2, "Alice"))
        assert calls == ["entry", "name"]


class TestConstructionValidation:
    def test_persistent_requires_name(self) -> None:
        with pytest.raises(ValueError, match="name"):
            ConversationHandler(
                entry_points=[CommandHandler("start", lambda u, c: None)],
                states={},
                fallbacks=[],
                persistent=True,
            )

    def test_requires_entry_points(self) -> None:
        with pytest.raises(ValueError, match="entry"):
            ConversationHandler(entry_points=[], states={}, fallbacks=[])

    def test_requires_at_least_one_key_dimension(self) -> None:
        with pytest.raises(ValueError, match="per_"):
            ConversationHandler(
                entry_points=[CommandHandler("start", lambda u, c: None)],
                states={},
                fallbacks=[],
                per_chat=False,
                per_user=False,
                per_message=False,
            )

    def test_per_message_excludes_per_chat_and_per_user(self) -> None:
        with pytest.raises(ValueError, match="per_message"):
            ConversationHandler(
                entry_points=[CommandHandler("start", lambda u, c: None)],
                states={},
                fallbacks=[],
                per_message=True,
            )

    def test_sentinels_match_ptb_values(self) -> None:
        assert ConversationHandler.END == -1
        assert ConversationHandler.TIMEOUT == -2
        assert END == -1
        assert TIMEOUT == -2
