"""telebot_py quickstart (L1): a live echo bot.

Run with a bot token from @BotFather::

    export TELEGRAM_BOT_TOKEN="123456:ABC..."
    python examples/echo_bot.py

Send ``/start`` for a greeting; any other text message is echoed back.
Press Ctrl+C for a clean, graceful shutdown (run_polling installs the
SIGINT/SIGTERM handlers, drains in-flight updates, and closes the client).
"""

from __future__ import annotations

import logging
import os

from telebot_py import Application, CallbackContext, CommandHandler, MessageHandler, filters
from telebot_py.types import Update

logging.basicConfig(format="%(asctime)s %(name)s %(levelname)s %(message)s", level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger("echo_bot")


async def start(update: Update, context: CallbackContext) -> None:
    """Reply with a greeting when the user sends ``/start``."""
    user = update.effective_user
    chat = update.effective_chat
    if chat is None:
        return
    name = user.first_name if user is not None else "there"
    await context.bot.send_message(
        chat_id=chat.id,
        text=f"Hi {name}! Send me any text and I will echo it back.",
    )


async def echo(update: Update, context: CallbackContext) -> None:
    """Echo every non-command text message back to its chat."""
    message = update.effective_message
    chat = update.effective_chat
    if message is None or message.text is None or chat is None:
        return
    await context.bot.send_message(chat_id=chat.id, text=message.text)


async def on_error(update: Update | None, context: CallbackContext) -> None:
    """Log handler errors; the polling loop keeps running (FR-013)."""
    logger.error("Error while processing update %r: %r", update, context.error)


def main() -> None:
    """Build the application, register handlers, and poll until Ctrl+C."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TEST_BOT_TOKEN")
    if not token:
        raise SystemExit("Set TELEGRAM_BOT_TOKEN to a bot token from @BotFather first.")

    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
    app.add_error_handler(on_error)

    logger.info("Echo bot is up; press Ctrl+C to stop.")
    app.run_polling()


if __name__ == "__main__":
    main()
