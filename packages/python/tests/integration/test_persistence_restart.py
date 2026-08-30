"""Integration test: conversations survive an application restart (T028).

Quickstart V4 / SC-005: an Application with SQLitePersistence and a
persistent ConversationHandler advances two steps, stops and shuts down; a
fresh Application on the same database restores the conversation and the
next update continues from the persisted step.
"""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path
from typing import Any

from telebot_py import Application, ApplicationBuilder, CommandHandler, MessageHandler, filters
from telebot_py.routing.conversation import ConversationHandler
from telebot_py.storage import SQLitePersistence
from telebot_py.types import Update

ME_PAYLOAD = {"id": 999, "is_bot": True, "first_name": "ConvBot", "username": "conv_bot"}
MESSAGE_PAYLOAD = {
    "message_id": 1,
    "date": 1_700_000_000,
    "chat": {"id": 100, "type": "private"},
}

NAME, AGE = range(2)

MakeUpdate = Callable[..., dict[str, Any]]


def text_update(make_update: MakeUpdate, update_id: int, text: str) -> Update:
    """Build a typed text-message update for user 42 in chat 100."""
    return Update.from_dict(
        make_update(
            update_id,
            message={
                "message_id": update_id,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "private"},
                "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
                "text": text,
            },
        )
    )


def build_signup_handler(events: list[str]) -> ConversationHandler:
    """Persistent two-step conversation: /start -> NAME -> AGE -> END."""

    async def entry(update: Update, context: Any) -> int:
        events.append("entry")
        chat = update.effective_chat
        assert chat is not None
        await context.bot.send_message(chat.id, "What is your name?")
        return NAME

    async def name_step(update: Update, context: Any) -> int:
        events.append("name")
        message = update.effective_message
        assert context.user_data is not None and message is not None
        context.user_data["name"] = message.text
        await context.bot.send_message(chat_id=100, text="And your age?")
        return AGE

    async def age_step(update: Update, context: Any) -> int:
        events.append("age")
        message = update.effective_message
        assert context.user_data is not None and message is not None
        context.user_data["age"] = message.text
        await context.bot.send_message(chat_id=100, text="Thanks, done!")
        return ConversationHandler.END

    async def cancel(update: Update, context: Any) -> int:
        events.append("cancel")
        return ConversationHandler.END

    return ConversationHandler(
        entry_points=[CommandHandler("start", entry)],
        states={
            NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, name_step)],
            AGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, age_step)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
        name="signup",
        persistent=True,
    )


def build_app(
    db_path: Path, bot_transport: Any, ok_response: Any
) -> tuple[Application, ConversationHandler, list[str]]:
    """Build a STOPPED application with SQLite persistence and the signup flow."""
    events: list[str] = []
    handler = build_signup_handler(events)
    application = (
        ApplicationBuilder()
        .token("123456:TEST")
        .transport(bot_transport(ok_response(ME_PAYLOAD), ok_response(MESSAGE_PAYLOAD)))
        .persistence(SQLitePersistence(db_path))
        .build()
    )
    application.add_handler(handler)
    return application, handler, events


async def test_conversation_resumes_from_persisted_step_after_restart(
    tmp_path: Path, bot_transport: Any, ok_response: Any, make_update: MakeUpdate
) -> None:
    db_path = tmp_path / "conversation.db"

    # --- First run: advance the conversation two steps, then stop. ---
    first, first_handler, first_events = build_app(db_path, bot_transport, ok_response)
    await first.initialize()
    await first.start()
    await first.process_update(text_update(make_update, 1, "/start"))
    await first.process_update(text_update(make_update, 2, "Alice"))
    assert first_events == ["entry", "name"]
    assert first_handler.conversations == {(100, 42): AGE}
    await first.stop()
    await first.shutdown()

    # --- Second run: fresh Application on the same db restores the state. ---
    second, second_handler, second_events = build_app(db_path, bot_transport, ok_response)
    await second.initialize()
    assert second_handler.conversations == {(100, 42): AGE}
    assert second.user_data[42]["name"] == "Alice"  # chat/user data flushed on stop

    await second.start()
    await second.process_update(text_update(make_update, 3, "30"))
    # The third update hit the AGE step directly — not the entry point again.
    assert second_events == ["age"]
    assert second.user_data[42]["age"] == "30"
    assert second_handler.conversations == {}  # END closed the conversation
    await second.stop()
    await second.shutdown()


async def test_restart_without_persistence_starts_fresh(
    bot_transport: Any, ok_response: Any, make_update: MakeUpdate
) -> None:
    """Acceptance scenario 3: no backend configured -> state defaults to memory."""
    events: list[str] = []
    handler = build_signup_handler(events)
    application = (
        ApplicationBuilder()
        .token("123456:TEST")
        .transport(bot_transport(ok_response(ME_PAYLOAD), ok_response(MESSAGE_PAYLOAD)))
        .build()
    )
    application.add_handler(handler)
    await application.initialize()
    await application.start()
    await application.process_update(text_update(make_update, 1, "/start"))
    assert events == ["entry"]
    # Without persistence an in-flight text update still routes by state...
    await application.process_update(text_update(make_update, 2, "Alice"))
    assert events == ["entry", "name"]
    await application.stop()
    await application.shutdown()
