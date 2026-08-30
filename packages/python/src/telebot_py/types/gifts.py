"""Telegram gift, collectible-gift, and owned-gift types.

Field sets mirror the authoritative TypeScript sources
``packages/node/src/client/types/payments/models.ts`` (``Gift``, ``Gifts``,
``UniqueGift*``) extended with the owned-gift containers and
``AcceptedGiftTypes`` that the gifts Bot API methods return and accept.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.common import MessageEntity
from telebot_py.types.stickers import Sticker
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class Gift(TelegramObject):
    """This object represents a gift that can be sent by the bot.

    Attributes:
        id: Unique identifier of the gift.
        sticker: The sticker that represents the gift.
        star_count: Number of Telegram Stars that must be paid to send the
            sticker.
        upgrade_star_count: Number of Telegram Stars that must be paid to
            upgrade the gift to a unique one.
        total_count: The total number of the gifts of this type that can be
            sent; for limited gifts only.
        remaining_count: The number of remaining gifts of this type that can
            be sent; for limited gifts only.
    """

    id: str
    sticker: Sticker
    star_count: int
    upgrade_star_count: int | None = None
    total_count: int | None = None
    remaining_count: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Gifts(TelegramObject):
    """A list of gifts.

    Returned by ``Bot.get_available_gifts``.

    Attributes:
        gifts: The list of gifts.
    """

    gifts: list[Gift]


@dataclasses.dataclass(frozen=True, slots=True)
class AcceptedGiftTypes(TelegramObject):
    """Information about types of gifts accepted by a user or business account.

    Attributes:
        unlimited_gifts: True, if unlimited regular gifts are accepted.
        limited_gifts: True, if limited regular gifts are accepted.
        unique_gifts: True, if unique gifts or gifts that can be upgraded to
            unique for free are accepted.
        premium_subscription: True, if a Telegram Premium subscription is
            accepted.
        gifts_from_channels: True, if gifts from channels are accepted.
    """

    unlimited_gifts: bool
    limited_gifts: bool
    unique_gifts: bool
    premium_subscription: bool
    gifts_from_channels: bool


@dataclasses.dataclass(frozen=True, slots=True)
class UniqueGiftBackdropColors(TelegramObject):
    """Colors of a unique gift backdrop.

    Attributes:
        center_color: The color in the center of the backdrop in RGB format.
        edge_color: The color on the edges of the backdrop in RGB format.
        symbol_color: The color to be applied to the symbol in RGB format.
        text_color: The color for the text on the backdrop in RGB format.
    """

    center_color: int
    edge_color: int
    symbol_color: int
    text_color: int


@dataclasses.dataclass(frozen=True, slots=True)
class UniqueGiftBackdrop(TelegramObject):
    """The backdrop of a unique gift.

    Attributes:
        name: The name of the backdrop.
        colors: The colors of the backdrop.
        rarity_per_mille: The number of unique gifts that receive this backdrop
            for every 1000 gifts upgraded.
    """

    name: str
    colors: UniqueGiftBackdropColors
    rarity_per_mille: int


@dataclasses.dataclass(frozen=True, slots=True)
class UniqueGiftModel(TelegramObject):
    """The model of a unique gift.

    Attributes:
        name: The name of the model.
        sticker: The sticker that represents the unique gift.
        rarity_per_mille: The number of unique gifts that receive this model
            for every 1000 gifts upgraded.
        rarity: Rarity of the model if it is a crafted model, one of
            ``uncommon``, ``rare``, ``epic`` or ``legendary``.
    """

    name: str
    sticker: Sticker
    rarity_per_mille: int
    rarity: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class UniqueGiftSymbol(TelegramObject):
    """The symbol displayed on a unique gift backdrop.

    Attributes:
        name: The name of the symbol.
        sticker: The sticker that represents the unique gift.
        rarity_per_mille: The number of unique gifts that receive this model
            for every 1000 gifts upgraded.
    """

    name: str
    sticker: Sticker
    rarity_per_mille: int


@dataclasses.dataclass(frozen=True, slots=True)
class UniqueGiftColors(TelegramObject):
    """Colors representing a unique gift in the interface.

    Attributes:
        model_custom_emoji_id: Custom emoji identifier of the unique gift's
            model.
        symbol_custom_emoji_id: Custom emoji identifier of the unique gift's
            symbol.
        light_theme_main_color: Main color used in light themes, in RGB format.
        light_theme_other_colors: List of 1-3 additional colors used in light
            themes, in RGB format.
        dark_theme_main_color: Main color used in dark themes, in RGB format.
        dark_theme_other_colors: List of 1-3 additional colors used in dark
            themes, in RGB format.
    """

    model_custom_emoji_id: str
    symbol_custom_emoji_id: str
    light_theme_main_color: int
    light_theme_other_colors: list[int]
    dark_theme_main_color: int
    dark_theme_other_colors: list[int]


@dataclasses.dataclass(frozen=True, slots=True)
class UniqueGift(TelegramObject):
    """This object represents a unique gift.

    Attributes:
        gift_id: Identifier of the regular gift from which this unique gift was
            upgraded.
        base_name: Human-readable name of the regular gift; may be empty if the
            gift was not upgraded.
        name: Unique name of the gift.
        number: Unique number of the upgraded gift.
        model: The model of the gift.
        symbol: The symbol of the gift.
        backdrop: The backdrop of the gift.
        is_premium: True, if the original regular gift was exclusively
            purchaseable by Telegram Premium subscribers.
        is_burned: True, if the gift was used to craft another gift and isn't
            available anymore.
        is_from_blockchain: True, if the gift is assigned from the TON
            blockchain.
        colors: The color scheme for user's name, replies, etc.
        publisher_chat: Information about the chat that published the gift.
    """

    gift_id: str
    base_name: str
    name: str
    number: int
    model: UniqueGiftModel
    symbol: UniqueGiftSymbol
    backdrop: UniqueGiftBackdrop
    is_premium: bool | None = None
    is_burned: bool | None = None
    is_from_blockchain: bool | None = None
    colors: UniqueGiftColors | None = None
    publisher_chat: Chat | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class UniqueGiftInfo(TelegramObject):
    """Information about a unique gift attached to an owned gift.

    Attributes:
        gift: Information about the gift.
        origin: Origin of the gift, one of ``upgrade``, ``transfer``,
            ``resale``, ``gifted_upgrade`` or ``offer``.
        text: Text of the message that was added to the gift.
        entities: Special entities that appear in the text.
        is_private: True, if the sender and gift text are shown only to the
            gift receiver.
        last_resale_currency: Currency in which the payment for the gift was
            done, ``XTR`` or ``TON``.
        last_resale_amount: Price paid for the gift in either Telegram Stars or
            nanograms.
        owned_gift_id: Unique identifier of the received gift for the bot;
            only present if the bot has a relationship with the gift.
        transfer_star_count: Number of Telegram Stars that must be paid to
            transfer the gift; omitted if the bot cannot transfer the gift.
        next_transfer_date: Point in time (Unix timestamp) when the gift can be
            transferred.
    """

    gift: UniqueGift
    origin: str
    text: str | None = None
    entities: list[MessageEntity] | None = None
    is_private: bool | None = None
    last_resale_currency: str | None = None
    last_resale_amount: int | None = None
    owned_gift_id: str | None = None
    transfer_star_count: int | None = None
    next_transfer_date: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class OwnedGiftRegular(TelegramObject):
    """A regular (non-unique) gift owned by a user or chat.

    Attributes:
        type: Type of the owned gift, always ``regular``.
        gift: Information about the gift.
        send_date: Point in time (Unix timestamp) when the gift was sent.
        owned_gift_id: Unique identifier of the received gift for the bot;
            only present if the bot has a relationship with the sender.
        sender_user: Identifier of the user that sent the gift, if any.
        text: Text of the message that was added to the gift.
        entities: Special entities that appear in the text.
        is_private: True, if the sender and gift text are shown only to the
            gift receiver.
        is_saved: True, if the gift is saved by the recipient.
        can_be_upgraded: True, if the gift can be upgraded to a unique gift.
        was_refunded: True, if the gift was refunded and isn't available
            anymore.
        convert_star_count: Number of Telegram Stars that can be claimed by the
            receiver instead of sending the gift.
        prepaid_upgrade_star_count: Number of Telegram Stars that were paid by
            the sender from the bot's balance to make the upgrade free for the
            receiver.
        is_upgrade_separate: True, if the gift can be upgraded to a unique gift
            only after it is converted to stars.
        unique_gift_number: Unique number of the upgraded gift the regular gift
            was converted from.
    """

    type: str
    gift: Gift
    send_date: int
    owned_gift_id: str | None = None
    sender_user: User | None = None
    text: str | None = None
    entities: list[MessageEntity] | None = None
    is_private: bool | None = None
    is_saved: bool | None = None
    can_be_upgraded: bool | None = None
    was_refunded: bool | None = None
    convert_star_count: int | None = None
    prepaid_upgrade_star_count: int | None = None
    is_upgrade_separate: bool | None = None
    unique_gift_number: int | None = None

    _DISCRIMINATOR = ("type", "regular")


@dataclasses.dataclass(frozen=True, slots=True)
class OwnedGiftUnique(TelegramObject):
    """A unique collectible gift owned by a user or chat.

    Attributes:
        type: Type of the owned gift, always ``unique``.
        gift: Information about the gift.
        send_date: Point in time (Unix timestamp) when the gift was sent.
        owned_gift_id: Unique identifier of the received gift for the bot;
            only present if the bot has a relationship with the sender.
        sender_user: Identifier of the user that sent the gift, if any.
        is_saved: True, if the gift is saved by the recipient.
        can_be_transferred: True, if the gift can be transferred to another
            owner.
        transfer_star_count: Number of Telegram Stars that must be paid to
            transfer the gift; omitted if the bot cannot transfer the gift.
        next_transfer_date: Point in time (Unix timestamp) when the gift can be
            transferred.
    """

    type: str
    gift: UniqueGift
    send_date: int
    owned_gift_id: str | None = None
    sender_user: User | None = None
    is_saved: bool | None = None
    can_be_transferred: bool | None = None
    transfer_star_count: int | None = None
    next_transfer_date: int | None = None

    _DISCRIMINATOR = ("type", "unique")


#: A single entry of an :class:`OwnedGifts` list — regular or unique.
OwnedGift = OwnedGiftRegular | OwnedGiftUnique


@dataclasses.dataclass(frozen=True, slots=True)
class OwnedGifts(TelegramObject):
    """A list of gifts owned by a user, a chat, or a business account.

    Returned by ``Bot.get_user_gifts``, ``Bot.get_chat_gifts`` and
    ``Bot.get_business_account_gifts``.

    Attributes:
        total_count: The total number of gifts owned by the user or chat that
            these gifts belong to; may be greater than the number of gifts in
            the list.
        gifts: The list of gifts.
        next_offset: Offset for the next request; if omitted, then this is the
            final result.
    """

    total_count: int
    gifts: list[OwnedGift]
    next_offset: str | None = None
