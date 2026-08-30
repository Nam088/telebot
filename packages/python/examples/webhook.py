"""telebot_py webhook mode (L5): receive updates via ``run_webhook``.

Telegram only delivers webhook updates over HTTPS, so this example serves
plain HTTP on localhost and expects a TLS-terminating reverse proxy (nginx,
Caddy, ngrok, ...) in front of it::

    export TELEGRAM_BOT_TOKEN="123456:ABC..."
    export WEBHOOK_SECRET_TOKEN="$(openssl rand -hex 16)"
    python examples/webhook.py            # serves http://127.0.0.1:8443/webhook-hook
    ngrok http 8443                       # or your own reverse proxy

Then register the webhook with Telegram, repeating the same secret token so
deliveries can be verified::

    curl "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
        --data-urlencode "url=https://<public-host>/webhook-hook" \
        --data-urlencode "secret_token=${WEBHOOK_SECRET_TOKEN}"

``run_webhook`` verifies ``X-Telegram-Bot-Api-Secret-Token`` on every
delivery (401 otherwise) and rejects malformed, truncated, or oversized
bodies with 400 — the server keeps running through all of it (V6). It never
calls ``set_webhook``/``delete_webhook`` itself: registration at Telegram is
the operator's job (packages/node parity). Press Ctrl+C for a graceful stop.
"""

from __future__ import annotations

import logging
import os

from telebot_py import Application, CallbackContext, CommandHandler, MessageHandler, filters
from telebot_py.types import Update

logging.basicConfig(format="%(asctime)s %(name)s %(levelname)s %(message)s", level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger("webhook_demo")


async def start(update: Update, context: CallbackContext) -> None:
    """Reply with a greeting when the user sends ``/start``."""
    chat = update.effective_chat
    if chat is None:
        return
    await context.bot.send_message(
        chat_id=chat.id, text="Hi! Send me any text and I will echo it back."
    )


async def echo(update: Update, context: CallbackContext) -> None:
    """Echo every non-command text message back to its chat."""
    message = update.effective_message
    chat = update.effective_chat
    if message is None or message.text is None or chat is None:
        return
    await context.bot.send_message(chat_id=chat.id, text=message.text)


async def on_error(update: Update | None, context: CallbackContext) -> None:
    """Log handler errors; the webhook server keeps serving (FR-013)."""
    logger.error("Error while processing update %r: %r", update, context.error)


def main() -> None:
    """Build the application, register handlers, and serve the webhook."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TEST_BOT_TOKEN")
    if not token:
        raise SystemExit("Set TELEGRAM_BOT_TOKEN to a bot token from @BotFather first.")
    secret_token = os.environ.get("WEBHOOK_SECRET_TOKEN")
    if not secret_token:
        logger.warning("WEBHOOK_SECRET_TOKEN is unset; deliveries will not be verified.")

    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
    app.add_error_handler(on_error)

    port = int(os.environ.get("WEBHOOK_PORT", "8443"))
    logger.info("Webhook demo serving on http://127.0.0.1:%s/webhook-hook", port)
    app.run_webhook(
        listen="127.0.0.1",
        port=port,
        url_path="webhook-hook",
        secret_token=secret_token,
    )


if __name__ == "__main__":
    main()
