"""telebot_py persistence demo: identical bot logic, swappable backend.

One bot, three interchangeable persistence backends — pick the backend with
a CLI argument or the ``PERSISTENCE_BACKEND`` environment variable::

    export TELEGRAM_BOT_TOKEN="123456:ABC..."
    python examples/persistence.py sqlite   # default; state in persistence_demo.db
    python examples/persistence.py json     # state in persistence_demo.json
    python examples/persistence.py memory   # in-memory only; nothing survives

Commands:
    /count   Start a persistent conversation that stores a note in chat_data.
    /stats   Show how many notes this chat has stored.

Restart the bot mid-way (Ctrl+C, run again, same backend) to see the notes
and any in-flight conversation restored from SQLite or JSON exactly where
they were left (SC-005). Swapping backends only changes where the state
lives — the bot logic is untouched (FR-009).
"""

from __future__ import annotations

import logging
import os
import sys

from telebot_py import (
    Application,
    CallbackContext,
    CommandHandler,
    ConversationHandler,
    MessageHandler,
    filters,
)
from telebot_py.routing import END
from telebot_py.storage import (
    BasePersistence,
    JSONPersistence,
    MemoryPersistence,
    SQLitePersistence,
)
from telebot_py.types import Update

logging.basicConfig(format="%(asctime)s %(name)s %(levelname)s %(message)s", level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger("persistence_demo")

WAITING_NOTE = 0

BACKENDS = ("sqlite", "json", "memory")


def build_persistence(backend: str) -> BasePersistence:
    """Create the persistence backend selected on the command line/env.

    Args:
        backend: One of ``sqlite``, ``json``, or ``memory``.

    Returns:
        The configured persistence backend.

    Raises:
        SystemExit: When the backend name is unknown.
    """
    if backend == "sqlite":
        return SQLitePersistence("persistence_demo.db")
    if backend == "json":
        return JSONPersistence("persistence_demo.json")
    if backend == "memory":
        logger.warning("memory backend selected: state will not survive a restart.")
        return MemoryPersistence()
    raise SystemExit(f"Unknown backend {backend!r}; expected one of {', '.join(BACKENDS)}.")


async def ask_for_note(update: Update, context: CallbackContext) -> int:
    """Entry point: ask the user for a note to store."""
    chat = update.effective_chat
    if chat is not None:
        await context.bot.send_message(chat_id=chat.id, text="Send me the note to store.")
    return WAITING_NOTE


async def store_note(update: Update, context: CallbackContext) -> int:
    """Store the received text in chat_data and end the conversation."""
    message = update.effective_message
    chat = update.effective_chat
    if message is None or message.text is None or chat is None or context.chat_data is None:
        return END
    notes: list[str] = context.chat_data.setdefault("notes", [])
    notes.append(message.text)
    await context.bot.send_message(
        chat_id=chat.id, text=f"Stored note {len(notes)}. /stats lists them, /count adds more."
    )
    return END


async def stats(update: Update, context: CallbackContext) -> None:
    """Show the notes persisted for this chat."""
    chat = update.effective_chat
    if chat is None:
        return
    notes: list[str] = (context.chat_data or {}).get("notes", [])
    listing = "\n".join(f"{index}. {note}" for index, note in enumerate(notes, start=1))
    text = f"{len(notes)} note(s) stored:\n{listing}" if notes else "No notes stored yet."
    await context.bot.send_message(chat_id=chat.id, text=text)


async def on_error(update: Update | None, context: CallbackContext) -> None:
    """Log handler errors; the run loop keeps running (FR-013)."""
    logger.error("Error while processing update %r: %r", update, context.error)


def main() -> None:
    """Build the app around the selected persistence backend and poll."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TEST_BOT_TOKEN")
    if not token:
        raise SystemExit("Set TELEGRAM_BOT_TOKEN to a bot token from @BotFather first.")
    backend = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("PERSISTENCE_BACKEND", "sqlite")
    persistence = build_persistence(backend)

    app = Application.builder().token(token).persistence(persistence).build()
    app.add_handler(
        ConversationHandler(
            entry_points=[CommandHandler("count", ask_for_note)],
            states={WAITING_NOTE: [MessageHandler(filters.TEXT & ~filters.COMMAND, store_note)]},
            fallbacks=[],
            name="note",
            persistent=True,
        )
    )
    app.add_handler(CommandHandler("stats", stats))
    app.add_error_handler(on_error)

    logger.info("Persistence demo running with the %r backend; press Ctrl+C to stop.", backend)
    app.run_polling()


if __name__ == "__main__":
    main()
