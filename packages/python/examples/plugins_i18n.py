"""telebot_py plugins + i18n demo (L4): ordered hooks and per-user locales.

Run with a bot token from @BotFather::

    export TELEGRAM_BOT_TOKEN="123456:ABC..."
    python examples/plugins_i18n.py

What to watch for:
    * Two logging plugins wrap every successful handler result. The console
      log shows ``audit`` hooking before ``metrics`` even though ``metrics``
      is registered first — hook order comes from ``order=`` (and
      ``depends_on``), not insertion order.
    * ``I18nPlugin`` resolves each user's locale (stored preference, then
      Telegram ``language_code``, then the default) and translates through
      per-update sessions.
    * ``/lang vi`` switches the reply language to Vietnamese; ``/lang en``
      switches back. The preference persists in ``context.user_data``.

Commands:
    /start        Greeting plus usage in the current locale.
    /lang <code>  Switch language (``vi`` or ``en``).
    <any text>    Greet again in the resolved locale.
"""

from __future__ import annotations

import logging
import os
from collections.abc import Sequence

from telebot_py import Application, CallbackContext, CommandHandler, MessageHandler, filters
from telebot_py.plugins import I18nPlugin, Plugin
from telebot_py.types import Update

logging.basicConfig(format="%(asctime)s %(name)s %(levelname)s %(message)s", level=logging.INFO)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger("plugins_i18n_demo")

LOCALES: dict[str, dict[str, str]] = {
    "en": {
        "greeting": "Hello, {name}! Send any text and I greet you in your language.",
        "help": "Use /lang vi for Vietnamese or /lang en for English.",
        "lang_set": "Language switched to English.",
        "unknown_lang": "Unknown locale '{code}'. Available: {locales}.",
    },
    "vi": {
        "greeting": "Xin chào, {name}! Gửi tin nhắn bất kỳ để được chào bằng ngôn ngữ của bạn.",
        "help": "Dùng /lang vi để chuyển sang tiếng Việt hoặc /lang en cho tiếng Anh.",
        "lang_set": "Đã chuyển ngôn ngữ sang tiếng Việt.",
        "unknown_lang": "Không rõ ngôn ngữ '{code}'. Có sẵn: {locales}.",
    },
}


class AuditPlugin(Plugin):
    """First response hook: logs every successful handler result."""

    name = "audit"
    depends_on: Sequence[str] = ()

    async def on_response(self, context: CallbackContext, response: object) -> object:
        """Log the handled update, passing the result through unchanged."""
        logger.info("[audit] update %s handled; result: %r", context.update.update_id, response)
        return response


class MetricsPlugin(Plugin):
    """Second response hook (runs after audit) plus an error observer."""

    name = "metrics"
    depends_on: Sequence[str] = ("audit",)  # audit always hooks first

    async def on_response(self, context: CallbackContext, response: object) -> object:
        """Count the handled update in plugin state, then pass through."""
        state = context.application.plugin_manager.state(self.name)
        state["handled"] = int(state.get("handled", 0)) + 1
        logger.info(
            "[metrics] update %s handled (total %s)",
            context.update.update_id,
            state["handled"],
        )
        return response

    async def on_error(self, context: CallbackContext, error: Exception) -> None:
        """Observe handler failures after the error handlers ran."""
        logger.warning("[metrics] update %s failed: %r", context.update.update_id, error)


async def on_error(update: Update | None, context: CallbackContext) -> None:
    """Log handler errors; the polling loop keeps running (FR-013)."""
    logger.error("Error while processing update %r: %r", update, context.error)


def main() -> None:
    """Build the app with two ordered plugins plus i18n, polling until Ctrl+C."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TEST_BOT_TOKEN")
    if not token:
        raise SystemExit("Set TELEGRAM_BOT_TOKEN to a bot token from @BotFather first.")

    app = Application.builder().token(token).build()
    i18n = I18nPlugin(default_locale="en", locales=LOCALES)
    # Registered out of order on purpose: ``order`` (and ``depends_on``)
    # decides hook order, so ``audit`` logs before ``metrics`` regardless.
    app.add_plugin(MetricsPlugin(), order=2)
    app.add_plugin(AuditPlugin(), order=1)
    app.add_plugin(i18n)

    async def greet(update: Update, context: CallbackContext) -> None:
        """Greet in the user's resolved locale (also for /start)."""
        chat = update.effective_chat
        if chat is None:
            return
        session = i18n.session_for(context)
        user = update.effective_user
        name = user.first_name if user is not None else "there"
        await context.bot.send_message(
            chat_id=chat.id,
            text=f"{session.t('greeting', {'name': name})}\n{session.t('help')}",
        )

    async def lang(update: Update, context: CallbackContext) -> None:
        """Switch the user's locale with /lang <code>."""
        chat = update.effective_chat
        if chat is None:
            return
        code = context.args[0].lower() if context.args else ""
        if code not in LOCALES:
            session = i18n.session_for(context)
            text = session.t("unknown_lang", {"code": code, "locales": ", ".join(LOCALES)})
            await context.bot.send_message(chat_id=chat.id, text=text)
            return
        session = i18n.session_for(context)
        session.set_locale(code)  # persisted in context.user_data
        await context.bot.send_message(chat_id=chat.id, text=i18n.translate(code, "lang_set"))

    app.add_handler(CommandHandler("start", greet))
    app.add_handler(CommandHandler("lang", lang))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, greet))
    app.add_error_handler(on_error)

    logger.info("Plugins + i18n demo is up; try /lang vi, then send any text.")
    app.run_polling()


if __name__ == "__main__":
    main()
