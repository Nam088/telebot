"""Unit tests for LinearConversationHandler (T026).

The linear form walks a fixed list of ordered steps: each matching update
advances exactly one step, the flow closes after the last step, and
fallbacks reset the conversation from any step.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import pytest

from telebot_py import CommandHandler, MessageHandler, filters
from telebot_py.routing.linear_conversation import LinearConversationHandler
from telebot_py.types import Update

MakeUpdate = Callable[..., dict[str, Any]]


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


def text_update(make_update: MakeUpdate, update_id: int, text: str, *, user_id: int = 42) -> Update:
    """Build a typed text-message update for the given user."""
    return Update.from_dict(
        make_update(
            update_id,
            message={
                "message_id": update_id,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "private"},
                "from": {"id": user_id, "is_bot": False, "first_name": "Alice"},
                "text": text,
            },
        )
    )


def make_recorder(calls: list[str], label: str) -> Callable[..., Any]:
    """Build a callback recording its label."""

    async def callback(update: Update, context: Any) -> None:
        calls.append(label)

    return callback


def build_survey_handler(calls: list[str]) -> LinearConversationHandler:
    """Three ordered steps after /survey: any text, digits only, any text."""
    return LinearConversationHandler(
        entry_points=[CommandHandler("survey", make_recorder(calls, "entry"))],
        steps=[
            [MessageHandler(filters.TEXT, make_recorder(calls, "step0"))],
            [MessageHandler(filters.Regex(r"^\d+$"), make_recorder(calls, "step1"))],
            [MessageHandler(filters.TEXT, make_recorder(calls, "step2"))],
        ],
        fallbacks=[CommandHandler("cancel", make_recorder(calls, "cancel"))],
    )


async def run(handler: LinearConversationHandler, update: Update) -> None:
    """Assert the update matches and dispatch it through the handler."""
    check = handler.check_update(update)
    assert check is not None and check is not False
    await handler.handle_update(update, StubContext(), check)


class TestOrderedSteps:
    async def test_steps_advance_exactly_once_each(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_survey_handler(calls)

        await run(handler, text_update(make_update, 1, "/survey"))
        await run(handler, text_update(make_update, 2, "Alice"))
        await run(handler, text_update(make_update, 3, "30"))
        await run(handler, text_update(make_update, 4, "Hanoi"))

        assert calls == ["entry", "step0", "step1", "step2"]
        # After the last step the conversation is over.
        assert handler.check_update(text_update(make_update, 5, "extra")) is False

    async def test_conversation_can_restart_after_completion(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_survey_handler(calls)

        for index, text in [(1, "/survey"), (2, "a"), (3, "1"), (4, "b")]:
            await run(handler, text_update(make_update, index, text))
        await run(handler, text_update(make_update, 5, "/survey"))
        await run(handler, text_update(make_update, 6, "c"))
        assert calls == ["entry", "step0", "step1", "step2", "entry", "step0"]

    async def test_input_not_matching_current_step_is_ignored(
        self, make_update: MakeUpdate
    ) -> None:
        calls: list[str] = []
        handler = build_survey_handler(calls)

        await run(handler, text_update(make_update, 1, "/survey"))
        await run(handler, text_update(make_update, 2, "a"))
        # Step 1 demands digits; text does not match and does not advance.
        assert handler.check_update(text_update(make_update, 3, "not digits")) is False
        await run(handler, text_update(make_update, 4, "42"))
        assert calls == ["entry", "step0", "step1"]

    async def test_step_callback_return_value_is_ignored(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []

        async def jumping(update: Update, context: Any) -> int:
            calls.append("step0")
            return 99  # linear form: return values never change the step order

        handler = LinearConversationHandler(
            entry_points=[CommandHandler("survey", make_recorder(calls, "entry"))],
            steps=[
                [MessageHandler(filters.TEXT, jumping)],
                [MessageHandler(filters.TEXT, make_recorder(calls, "step1"))],
            ],
            fallbacks=[],
        )

        await run(handler, text_update(make_update, 1, "/survey"))
        await run(handler, text_update(make_update, 2, "a"))
        await run(handler, text_update(make_update, 3, "b"))
        assert calls == ["entry", "step0", "step1"]


class TestFallbackReset:
    async def test_fallback_resets_from_any_step(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_survey_handler(calls)

        await run(handler, text_update(make_update, 1, "/survey"))
        await run(handler, text_update(make_update, 2, "a"))
        await run(handler, text_update(make_update, 3, "/cancel"))
        assert calls == ["entry", "step0", "cancel"]

        # Reset: plain text no longer matches; /survey starts from step0 again.
        assert handler.check_update(text_update(make_update, 4, "b")) is False
        await run(handler, text_update(make_update, 5, "/survey"))
        await run(handler, text_update(make_update, 6, "c"))
        assert calls == ["entry", "step0", "cancel", "entry", "step0"]

    async def test_fallback_inactive_outside_conversation(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_survey_handler(calls)

        assert handler.check_update(text_update(make_update, 1, "/cancel")) is False


class TestKeys:
    async def test_conversations_are_keyed_per_user_and_chat(self, make_update: MakeUpdate) -> None:
        calls: list[str] = []
        handler = build_survey_handler(calls)

        await run(handler, text_update(make_update, 1, "/survey", user_id=42))
        await run(handler, text_update(make_update, 2, "/survey", user_id=77))
        assert len(handler.conversations) == 2

        await run(handler, text_update(make_update, 3, "answer", user_id=42))
        assert calls == ["entry", "entry", "step0"]


class TestConstructionValidation:
    def test_requires_entry_points(self) -> None:
        with pytest.raises(ValueError, match="entry"):
            LinearConversationHandler(
                entry_points=[], steps=[[MessageHandler(filters.TEXT, lambda u, c: None)]]
            )

    def test_requires_steps(self) -> None:
        with pytest.raises(ValueError, match="step"):
            LinearConversationHandler(
                entry_points=[CommandHandler("survey", lambda u, c: None)], steps=[]
            )

    def test_persistent_requires_name(self) -> None:
        with pytest.raises(ValueError, match="name"):
            LinearConversationHandler(
                entry_points=[CommandHandler("survey", lambda u, c: None)],
                steps=[[MessageHandler(filters.TEXT, lambda u, c: None)]],
                persistent=True,
            )
