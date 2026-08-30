"""Telegram Business connection types and chat boost types."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class BusinessBotRights(TelegramObject):
    """Represents the rights of a business bot.

    Every field is optional and only present when Telegram grants it; the set
    of rights a bot actually holds is reported by the ``rights`` field of a
    :class:`BusinessConnection` since Bot API 10.3.

    Attributes:
        can_reply: True, if the bot can send and edit messages in the private
            chats that had incoming messages in the last 24 hours.
        can_read_messages: True, if the bot can mark incoming private messages
            as read.
        can_delete_sent_messages: True, if the bot can delete messages sent by
            the bot.
        can_delete_all_messages: True, if the bot can delete all private
            messages in managed chats.
        can_edit_name: True, if the bot can edit the first and last name of the
            business account.
        can_edit_bio: True, if the bot can edit the bio of the business
            account.
        can_edit_profile_photo: True, if the bot can edit the profile photo of
            the business account.
        can_edit_username: True, if the bot can edit the username of the
            business account.
        can_change_gift_settings: True, if the bot can change the privacy
            settings pertaining to gifts for the business account.
        can_view_gifts_and_stars: True, if the bot can view gifts and the amount
            of Telegram Stars owned by the business account.
        can_convert_gifts_to_stars: True, if the bot can convert regular gifts
            owned by the business account to Telegram Stars.
        can_transfer_and_upgrade_gifts: True, if the bot can transfer and
            upgrade gifts owned by the business account.
        can_transfer_stars: True, if the bot can transfer Telegram Stars
            received by the business account to its own account, or use them to
            upgrade and transfer gifts.
        can_manage_stories: True, if the bot can post, edit and delete stories
            on behalf of the business account.
    """

    can_reply: bool | None = None
    can_read_messages: bool | None = None
    can_delete_sent_messages: bool | None = None
    can_delete_all_messages: bool | None = None
    can_edit_name: bool | None = None
    can_edit_bio: bool | None = None
    can_edit_profile_photo: bool | None = None
    can_edit_username: bool | None = None
    can_change_gift_settings: bool | None = None
    can_view_gifts_and_stars: bool | None = None
    can_convert_gifts_to_stars: bool | None = None
    can_transfer_and_upgrade_gifts: bool | None = None
    can_transfer_stars: bool | None = None
    can_manage_stories: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class BusinessConnection(TelegramObject):
    """The bot's connection to a Telegram Business account.

    Attributes:
        id: Unique identifier of the business connection.
        user: Business account user that created the business connection.
        user_chat_id: Identifier of a private chat with the user who created
            the business connection.
        date: Date the connection was established in Unix time.
        rights: Rights of the business bot, if Telegram reported any.
        is_enabled: Whether the connection is active.
    """

    id: str
    user: User
    user_chat_id: int
    date: int
    is_enabled: bool
    rights: BusinessBotRights | None = None


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
