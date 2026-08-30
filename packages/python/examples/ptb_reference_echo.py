"""PTB-shaped reference echo bot for the SC-001 porting proof.

This file is written against upstream ``python-telegram-bot`` v21 so the
framework's API parity can be proven mechanically: run it against
``telebot_py`` by changing ONLY the two import lines below (2 of the
allowed 5 lines; nothing else in the file changes)::

    from telegram import Update                      ->  from telebot_py.types import Update
    from telegram.ext import Application, ...        ->  from telebot_py import Application, ...

Both versions must behave identically against the same test bot:
``/start`` greets, ``/help`` explains, plain text is echoed, and handler
errors are logged without killing the polling loop.
"""

from __future__ import annotations

import logging
import os

from telegram import Update
from telegram.ext import Application, CallbackContext, CommandHandler, MessageHandler, filters

# Enable logging as suggested in the PTB docs: INFO for the bot, quiet httpx.
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)


async def start(update: Update, context: CallbackContext) -> None:
    """Send a welcome message when the user issues ``/start``."""
    user = update.effective_user
    chat = update.effective_chat
    if chat is None:
        return
    name = user.first_name if user is not None else "there"
    await context.bot.send_message(
        chat_id=chat.id,
        text=f"Welcome {name}! I echo everything you type. Try /help.",
    )


async def help_command(update: Update, context: CallbackContext) -> None:
    """Send a short usage note when the user issues ``/help``."""
    chat = update.effective_chat
    if chat is None:
        return
    await context.bot.send_message(
        chat_id=chat.id,
        text="Send me any text message and I will reply with the same text.",
    )


async def echo(update: Update, context: CallbackContext) -> None:
    """Echo the user's text message back to them."""
    message = update.effective_message
    chat = update.effective_chat
    if message is None or message.text is None or chat is None:
        return
    await context.bot.send_message(chat_id=chat.id, text=message.text)


async def error_handler(update: object, context: CallbackContext) -> None:
    """Log errors caused by updates instead of crashing the bot."""
    logger.error("Exception while handling update %s:", update, exc_info=context.error)


def main() -> None:
    """Start the bot: build the application, wire handlers, poll forever."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TEST_BOT_TOKEN")
    if not token:
        raise SystemExit("Set TELEGRAM_BOT_TOKEN to a bot token from @BotFather first.")

    application = Application.builder().token(token).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
    application.add_error_handler(error_handler)

    logger.info("Reference echo bot starting; press Ctrl+C to stop.")
    application.run_polling()


if __name__ == "__main__":
    main()
