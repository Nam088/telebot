"""Update handlers routing incoming updates to callbacks.

Handlers follow python-telegram-bot's ``BaseHandler`` contract in snake_case:
:meth:`~BaseHandler.check_update` decides whether an update matches,
:meth:`~BaseHandler.collect_additional_context` enriches the callback context,
and :meth:`~BaseHandler.handle_update` runs the callback. Group ordering is
the dispatcher's concern (see ``telebot_py.kernel``).
"""

from telebot_py.routing.handlers.base import BaseHandler, HandlerCallback
from telebot_py.routing.handlers.business import (
    BusinessConnectionHandler,
    BusinessMessagesHandler,
)
from telebot_py.routing.handlers.callback_query import (
    CallbackQueryHandler,
    CallbackQueryPattern,
)
from telebot_py.routing.handlers.chat_member import ChatMemberHandler, PollAnswerHandler
from telebot_py.routing.handlers.chat_request import ChatBoostHandler, ChatJoinRequestHandler
from telebot_py.routing.handlers.command import CommandHandler
from telebot_py.routing.handlers.inline_query import (
    ChosenInlineResultHandler,
    InlineQueryHandler,
    InlineQueryPattern,
)
from telebot_py.routing.handlers.message import MessageHandler
from telebot_py.routing.handlers.payment import (
    PreCheckoutQueryHandler,
    PurchasedPaidMediaHandler,
    ShippingQueryHandler,
)
from telebot_py.routing.handlers.reaction import (
    MessageReactionCountHandler,
    MessageReactionHandler,
    ReactionFilter,
)
from telebot_py.routing.handlers.type import TypeHandler, TypePredicate

__all__ = [
    "BaseHandler",
    "BusinessConnectionHandler",
    "BusinessMessagesHandler",
    "CallbackQueryHandler",
    "CallbackQueryPattern",
    "ChatBoostHandler",
    "ChatJoinRequestHandler",
    "ChatMemberHandler",
    "ChosenInlineResultHandler",
    "CommandHandler",
    "HandlerCallback",
    "InlineQueryHandler",
    "InlineQueryPattern",
    "MessageHandler",
    "MessageReactionCountHandler",
    "MessageReactionHandler",
    "PollAnswerHandler",
    "PreCheckoutQueryHandler",
    "PurchasedPaidMediaHandler",
    "ReactionFilter",
    "ShippingQueryHandler",
    "TypeHandler",
    "TypePredicate",
]
