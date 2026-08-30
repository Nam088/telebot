"""telebot_py conversations demo (L2): all three conversation forms, one bot.

Run with a bot token from @BotFather::

    export TELEGRAM_BOT_TOKEN="123456:ABC..."
    python examples/conversation.py

Commands:
    /signup   State-machine conversation (ConversationHandler): name -> age ->
              confirm, persisted in SQLite; restart the bot mid-flow and it
              resumes where it left off (SC-005).
    /survey   Linear conversation (LinearConversationHandler): three ordered
              steps that advance automatically, one matching reply per step.
    /profile  Async conversation (AsyncConversationHandler): one ``async def``
              flow reading answers with ``await conv.ask(...)``.
    /cancel   Aborts the signup/survey conversations from any step.

Press Ctrl+C for a graceful shutdown; conversation state survives in
``conversation_demo.db``.
"""

from __future__ import annotations

import logging
import os

from telebot_py import (
    Application,
    AsyncConversationHandler,
    CallbackContext,
    CommandHandler,
    ConversationHandler,
    LinearConversationHandler,
    MessageHandler,
    filters,
)
from telebot_py.routing import END, AsyncConversation
from telebot_py.storage import SQLitePersistence
from telebot_py.types import Update

logging.basicConfig(format="%(asctime)s %(name)s %(levelname)s %(message)s", level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger("conversation_demo")

NAME, AGE, CONFIRM = range(3)


async def signup_entry(update: Update, context: CallbackContext) -> int:
    """Start the signup conversation by asking for a name."""
    chat = update.effective_chat
    if chat is not None:
        await context.bot.send_message(chat_id=chat.id, text="What is your name?")
    return NAME


async def signup_name(update: Update, context: CallbackContext) -> int:
    """Store the name and move on to the age question."""
    message = update.effective_message
    chat = update.effective_chat
    if message is None or message.text is None or chat is None or context.user_data is None:
        return NAME
    context.user_data["name"] = message.text
    await context.bot.send_message(chat_id=chat.id, text=f"Nice to meet you, {message.text}! Age?")
    return AGE


async def signup_age(update: Update, context: CallbackContext) -> int:
    """Store the age and ask for confirmation."""
    message = update.effective_message
    chat = update.effective_chat
    if message is None or message.text is None or chat is None or context.user_data is None:
        return AGE
    context.user_data["age"] = message.text
    await context.bot.send_message(chat_id=chat.id, text="Save this? Reply yes or no.")
    return CONFIRM


async def signup_confirm_yes(update: Update, context: CallbackContext) -> int:
    """Confirm and close the conversation."""
    chat = update.effective_chat
    data = context.user_data or {}
    if chat is not None:
        await context.bot.send_message(
            chat_id=chat.id,
            text=f"Saved: {data.get('name')}, age {data.get('age')}. Thanks!",
        )
    return END


async def signup_confirm_no(update: Update, context: CallbackContext) -> int:
    """Reject the entered data and ask for the age again."""
    chat = update.effective_chat
    if chat is not None:
        await context.bot.send_message(chat_id=chat.id, text="Alright, how old are you?")
    return AGE


async def signup_cancel(update: Update, context: CallbackContext) -> int:
    """Abort the conversation from any state."""
    chat = update.effective_chat
    if chat is not None:
        await context.bot.send_message(chat_id=chat.id, text="Cancelled. Send /signup to retry.")
    return END


def build_signup_handler() -> ConversationHandler:
    """Persistent state-machine conversation: name -> age -> confirm."""
    return ConversationHandler(
        entry_points=[CommandHandler("signup", signup_entry)],
        states={
            NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, signup_name)],
            AGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, signup_age)],
            CONFIRM: [
                MessageHandler(filters.Regex(r"(?i)^yes$"), signup_confirm_yes),
                MessageHandler(filters.Regex(r"(?i)^no$"), signup_confirm_no),
            ],
        },
        fallbacks=[CommandHandler("cancel", signup_cancel)],
        name="signup",
        persistent=True,
    )


async def survey_intro(update: Update, context: CallbackContext) -> None:
    """Announce the survey before the first step runs."""
    chat = update.effective_chat
    if chat is not None:
        await context.bot.send_message(chat_id=chat.id, text="Survey time! Favourite colour?")


async def survey_colour(update: Update, context: CallbackContext) -> None:
    """Record the colour answer; the step index advances automatically."""
    message = update.effective_message
    chat = update.effective_chat
    if message is None or message.text is None or chat is None or context.user_data is None:
        return
    context.user_data["colour"] = message.text
    await context.bot.send_message(chat_id=chat.id, text="Rate this bot from 1 to 5:")


async def survey_rating(update: Update, context: CallbackContext) -> None:
    """Record the numeric rating answer."""
    message = update.effective_message
    chat = update.effective_chat
    if message is None or message.text is None or chat is None or context.user_data is None:
        return
    context.user_data["rating"] = message.text
    await context.bot.send_message(chat_id=chat.id, text="Any final words?")


async def survey_comment(update: Update, context: CallbackContext) -> None:
    """Record the closing comment; the flow ends after this last step."""
    message = update.effective_message
    chat = update.effective_chat
    if message is None or message.text is None or chat is None or context.user_data is None:
        return
    context.user_data["comment"] = message.text
    await context.bot.send_message(chat_id=chat.id, text="Thanks for taking the survey!")


def build_survey_handler() -> LinearConversationHandler:
    """Persistent linear conversation advancing exactly one step per reply."""
    return LinearConversationHandler(
        entry_points=[CommandHandler("survey", survey_intro)],
        steps=[
            [MessageHandler(filters.TEXT & ~filters.COMMAND, survey_colour)],
            [MessageHandler(filters.Regex(r"^[1-5]$"), survey_rating)],
            [MessageHandler(filters.TEXT & ~filters.COMMAND, survey_comment)],
        ],
        fallbacks=[CommandHandler("cancel", signup_cancel)],
        name="survey",
        persistent=True,
    )


async def profile_flow(conv: AsyncConversation, context: CallbackContext) -> None:
    """Ask-and-wait conversation written as one straight-line coroutine."""
    name = await conv.ask("What should I call you?")
    age = await conv.ask(f"Hi {name}! How old are you?")
    chat_id = conv.chat_id if conv.chat_id is not None else conv.user_id
    if chat_id is not None:
        await context.bot.send_message(chat_id=chat_id, text=f"Saved {name}, {age}.")


async def on_error(update: Update | None, context: CallbackContext) -> None:
    """Log handler errors; the polling loop keeps running (FR-013)."""
    logger.error("Error while processing update %r: %r", update, context.error)


def main() -> None:
    """Build the application with SQLite persistence and poll until Ctrl+C."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TEST_BOT_TOKEN")
    if not token:
        raise SystemExit("Set TELEGRAM_BOT_TOKEN to a bot token from @BotFather first.")

    app = (
        Application.builder()
        .token(token)
        .persistence(SQLitePersistence("conversation_demo.db"))
        .build()
    )
    app.add_handler(build_signup_handler())
    app.add_handler(build_survey_handler())
    app.add_handler(AsyncConversationHandler(profile_flow, entry_command="profile", name="profile"))
    app.add_error_handler(on_error)

    logger.info("Conversation demo is up; try /signup, /survey, or /profile.")
    app.run_polling()


if __name__ == "__main__":
    main()
