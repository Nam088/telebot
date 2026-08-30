"""telebot_py scheduler demo (L3): repeating, one-shot, and cancelled jobs.

Run with a bot token from @BotFather::

    export TELEGRAM_BOT_TOKEN="123456:ABC..."
    python examples/scheduler.py

Commands:
    /start    Explain the demo.
    /remind   Schedule a repeating reminder (first fire after 10s, then
              every 30s) carrying the chat id as job data.
    /ping     Schedule a one-shot job firing 5s from now.
    /cancel   Cancel every ``reminder`` job; calling ``job.cancel()`` again
              is a harmless no-op (idempotent).

The JobQueue is enabled through ``ApplicationBuilder.job_queue()``: it starts
once the bot is ready during ``initialize()`` and stops cleanly on Ctrl+C.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from telebot_py import Application, CallbackContext, CommandHandler
from telebot_py.scheduler import Job
from telebot_py.types import Update

logging.basicConfig(format="%(asctime)s %(name)s %(levelname)s %(message)s", level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger("scheduler_demo")

REMINDER_NAME = "reminder"


async def on_error(update: Update | None, context: CallbackContext) -> None:
    """Log handler errors; the polling loop keeps running (FR-013)."""
    logger.error("Error while processing update %r: %r", update, context.error)


def main() -> None:
    """Build the application with an enabled JobQueue and poll until Ctrl+C."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TEST_BOT_TOKEN")
    if not token:
        raise SystemExit("Set TELEGRAM_BOT_TOKEN to a bot token from @BotFather first.")

    app = Application.builder().token(token).job_queue().build()
    bot = app.bot

    async def remind_fire(job: Job[dict[str, Any]]) -> None:
        """Send the repeating reminder to the chat stored in the job data."""
        data = job.data or {}
        chat_id = data.get("chat_id")
        if chat_id is not None:
            await bot.send_message(chat_id=chat_id, text="Reminder: stand up and stretch!")

    async def ping_fire(job: Job[dict[str, Any]]) -> None:
        """Deliver the one-shot ping to the chat stored in the job data."""
        data = job.data or {}
        chat_id = data.get("chat_id")
        if chat_id is not None:
            await bot.send_message(chat_id=chat_id, text="Pong! (one-shot job fired)")

    async def start(update: Update, context: CallbackContext) -> None:
        """Explain the demo commands."""
        chat = update.effective_chat
        if chat is None:
            return
        await context.bot.send_message(
            chat_id=chat.id,
            text=(
                "Scheduler demo:\n"
                "/remind - repeating reminder (10s first, then every 30s)\n"
                "/ping - one-shot message in 5s\n"
                "/cancel - cancel the repeating reminder"
            ),
        )

    async def remind(update: Update, context: CallbackContext) -> None:
        """Schedule the repeating reminder for this chat."""
        chat = update.effective_chat
        if chat is None or context.job_queue is None:
            return
        job = context.job_queue.run_repeating(
            remind_fire,
            30.0,
            first=10.0,
            data={"chat_id": chat.id},
            name=REMINDER_NAME,
        )
        logger.info("Scheduled repeating job %r (next fire %s)", job.name, job.next_t)
        await context.bot.send_message(
            chat_id=chat.id,
            text="Reminder set: first in 10s, then every 30s. /cancel stops it.",
        )

    async def ping(update: Update, context: CallbackContext) -> None:
        """Schedule a one-shot job firing in five seconds."""
        chat = update.effective_chat
        if chat is None or context.job_queue is None:
            return
        job = context.job_queue.run_once(ping_fire, 5.0, data={"chat_id": chat.id})
        logger.info("Scheduled one-shot job %r (fires %s)", job.name, job.next_t)
        await context.bot.send_message(chat_id=chat.id, text="Pong arrives in 5 seconds.")

    async def cancel(update: Update, context: CallbackContext) -> None:
        """Cancel every reminder job; a second cancel() call is a no-op."""
        chat = update.effective_chat
        if chat is None or context.job_queue is None:
            return
        jobs = context.job_queue.get_jobs_by_name(REMINDER_NAME)
        for job in jobs:
            job.cancel()
            job.cancel()  # idempotent: the second call does nothing
        await context.bot.send_message(
            chat_id=chat.id,
            text=f"Cancelled {len(jobs)} reminder job(s)." if jobs else "No reminder running.",
        )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("remind", remind))
    app.add_handler(CommandHandler("ping", ping))
    app.add_handler(CommandHandler("cancel", cancel))
    app.add_error_handler(on_error)

    logger.info("Scheduler demo is up; try /remind, /ping, or /cancel.")
    app.run_polling()


if __name__ == "__main__":
    main()
