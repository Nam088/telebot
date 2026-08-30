"""Application kernel: lifecycle, context, dispatcher, polling, webhook (T019-T022, T052)."""

from telebot_py.kernel.app import Application
from telebot_py.kernel.builder import ApplicationBuilder
from telebot_py.kernel.context import CallbackContext
from telebot_py.kernel.dispatcher import Dispatcher, ErrorHandler
from telebot_py.kernel.lifecycle import ApplicationState
from telebot_py.kernel.polling import poll_updates
from telebot_py.kernel.webhook import WebhookServer, serve_webhook

__all__ = [
    "Application",
    "ApplicationBuilder",
    "ApplicationState",
    "CallbackContext",
    "Dispatcher",
    "ErrorHandler",
    "WebhookServer",
    "poll_updates",
    "serve_webhook",
]
