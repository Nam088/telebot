"""Telegram CallbackQuery type."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.message import Message
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class CallbackQuery(TelegramObject):
    """An incoming callback query from an inline keyboard button.

    Attributes:
        id: Unique identifier for this query.
        from_user: Sender of the query.
        chat_instance: Global identifier, uniquely corresponding to the chat
            to which the message with the callback button was sent.
        message: Message sent by the bot with the callback button that
            originated the query, when it is not too old.
        inline_message_id: Identifier of the message sent via the bot in
            inline mode that originated the query.
        data: Data associated with the callback button.
        game_short_name: Short name of the Game to be returned, which serves
            as the unique identifier for the game.

    Telegram API: https://core.telegram.org/bots/api#callbackquery
    """

    id: str
    from_user: User
    chat_instance: str
    message: Message | None = None
    inline_message_id: str | None = None
    data: str | None = None
    game_short_name: str | None = None

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}
