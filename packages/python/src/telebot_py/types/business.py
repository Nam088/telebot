"""Telegram Business connection types and chat boost types."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class BusinessConnection(TelegramObject):
    """The bot's connection to a Telegram Business account.

    Attributes:
        id: Unique identifier of the business connection.
        user: Business account user that created the business connection.
        user_chat_id: Identifier of a private chat with the user who created
            the business connection.
        date: Date the connection was established in Unix time.
        can_reply: Whether the bot can act on behalf of the business account
            in chats that were active in the last 24 hours.
        is_enabled: Whether the connection is active.
    """

    id: str
    user: User
    user_chat_id: int
    date: int
    can_reply: bool
    is_enabled: bool


@dataclasses.dataclass(frozen=True, slots=True)
class BusinessMessagesDeleted(TelegramObject):
    """Messages deleted from a connected business account.

    Attributes:
        business_connection_id: Unique identifier of the business connection.
        chat: Information about a chat in the business account in which
            messages were deleted.
        message_ids: The list of identifiers of deleted messages in the chat
            of the business account.
    """

    business_connection_id: str
    chat: Chat
    message_ids: list[int]


@dataclasses.dataclass(frozen=True, slots=True)
class ChatBoostAdded(TelegramObject):
    """Service message: a user boosted the chat.

    Attributes:
        boost_count: Number of boosts added by the user.
    """

    boost_count: int


@dataclasses.dataclass(frozen=True, slots=True)
class ChatBoostSourcePremium(TelegramObject):
    """The boost was obtained by subscribing to Telegram Premium.

    Attributes:
        source: Source of the boost, always 'premium'.
        user: User that boosted the chat.
    """

    source: str
    user: User

    _DISCRIMINATOR = ("source", "premium")


@dataclasses.dataclass(frozen=True, slots=True)
class ChatBoostSourceGiftCode(TelegramObject):
    """The boost was obtained by the creation of a gift code.

    Attributes:
        source: Source of the boost, always 'gift_code'.
        user: User for which the gift code was created.
    """

    source: str
    user: User

    _DISCRIMINATOR = ("source", "gift_code")


@dataclasses.dataclass(frozen=True, slots=True)
class ChatBoostSourceGiveaway(TelegramObject):
    """The boost was obtained by the creation of a giveaway.

    Attributes:
        source: Source of the boost, always 'giveaway'.
        giveaway_message_id: Identifier of a message in the chat with the
            giveaway; the message could have been deleted.
        user: User that won the prize in the giveaway, if any.
        prize_star_count: Number of Telegram Stars to be split among giveaway
            winners.
        is_unclaimed: Whether the giveaway was completed but no user won.
    """

    source: str
    giveaway_message_id: int
    user: User | None = None
    prize_star_count: int | None = None
    is_unclaimed: bool | None = None

    _DISCRIMINATOR = ("source", "giveaway")


@dataclasses.dataclass(frozen=True, slots=True)
class ChatBoost(TelegramObject):
    """A boost added to a chat by a user.

    Attributes:
        boost_id: Unique identifier of the boost.
        add_date: Unix time when the chat was boosted.
        expiration_date: Unix time when the boost will automatically expire.
        source: Source of the added boost.
    """

    boost_id: str
    add_date: int
    expiration_date: int
    source: ChatBoostSourcePremium | ChatBoostSourceGiftCode | ChatBoostSourceGiveaway


@dataclasses.dataclass(frozen=True, slots=True)
class ChatBoostUpdated(TelegramObject):
    """A chat boost was added or changed.

    Attributes:
        chat: Chat which was boosted.
        boost: Information about the chat boost.
    """

    chat: Chat
    boost: ChatBoost


@dataclasses.dataclass(frozen=True, slots=True)
class ChatBoostRemoved(TelegramObject):
    """A boost was removed from a chat.

    Attributes:
        chat: Chat which was boosted.
        boost_id: Unique identifier of the boost.
        remove_date: Unix time when the boost was removed.
        source: Source of the removed boost.
    """

    chat: Chat
    boost_id: str
    remove_date: int
    source: ChatBoostSourcePremium | ChatBoostSourceGiftCode | ChatBoostSourceGiveaway


@dataclasses.dataclass(frozen=True, slots=True)
class UserChatBoosts(TelegramObject):
    """A list of boosts added to a chat by a user.

    Returned by ``Bot.get_user_chat_boosts``.

    Attributes:
        boosts: The list of boosts added to the chat by the user.
    """

    boosts: list[ChatBoost]
