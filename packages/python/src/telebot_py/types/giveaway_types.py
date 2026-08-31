"""Giveaway payload objects carried by :class:`~telebot_py.types.Message`.

The ``Message`` fields ``giveaway``, ``giveaway_created``, ``giveaway_winners``
and ``giveaway_completed`` decode into these classes. ``GiveawayCompleted``
references ``Message`` through a lazy annotation that
:mod:`telebot_py.types.message` binds at runtime to avoid an import cycle.
"""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.user import User

if t.TYPE_CHECKING:  # annotation-only; bound at runtime by message.py
    from telebot_py.types.message import Message as Message


@dataclasses.dataclass(frozen=True, slots=True)
class GiveawayCreated(TelegramObject):
    """Service message: a scheduled giveaway was created.

    Attributes:
        prize_star_count: Number of Telegram Stars to be split between the
            winners; for Telegram Star giveaways only.

    Telegram API: https://core.telegram.org/bots/api#giveawaycreated
    """

    prize_star_count: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Giveaway(TelegramObject):
    """A scheduled giveaway message.

    Attributes:
        chats: The chats the user must join to participate in the giveaway.
        winners_selection_date: Unix time when the winners will be selected.
        winner_count: Number of users supposed to be selected as winners.
        only_new_members: Whether only users who joined the chats after the
            giveaway started are eligible to win.
        has_public_winners: Whether the list of winners is visible to everyone.
        prize_description: Description of the additional giveaway prize.
        country_codes: Two-letter ISO 3166-1 alpha-2 country codes the users
            must be from to participate in the giveaway.
        prize_star_count: Number of Telegram Stars to be split between the
            winners; for Telegram Star giveaways only.
        premium_subscription_month_count: Number of months the Telegram Premium
            subscription won from the giveaway will be active for.

    Telegram API: https://core.telegram.org/bots/api#giveaway
    """

    chats: list[Chat]
    winners_selection_date: int
    winner_count: int
    only_new_members: bool | None = None
    has_public_winners: bool | None = None
    prize_description: str | None = None
    country_codes: list[str] | None = None
    prize_star_count: int | None = None
    premium_subscription_month_count: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class GiveawayCompleted(TelegramObject):
    """Service message: a giveaway without public winners was completed.

    Attributes:
        winner_count: Number of winners in the giveaway.
        unclaimed_prize_count: Number of undistributed prizes.
        giveaway_message: Message with the giveaway that was completed, if it
            wasn't deleted.
        is_star_giveaway: Whether the giveaway is a Telegram Star giveaway;
            otherwise it is a Telegram Premium giveaway.

    Telegram API: https://core.telegram.org/bots/api#giveawaycompleted
    """

    winner_count: int
    unclaimed_prize_count: int | None = None
    giveaway_message: Message | None = None
    is_star_giveaway: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class GiveawayWinners(TelegramObject):
    """A completed giveaway with public winners.

    Attributes:
        chat: The chat that created the giveaway.
        giveaway_message_id: Identifier of the message with the giveaway in the
            chat.
        winners_selection_date: Unix time when the winners were selected.
        winner_count: Total number of winners in the giveaway.
        winners: List of up to 100 winners of the giveaway.
        additional_chat_count: Number of other chats the user had to join to be
            eligible for the giveaway.
        prize_star_count: Number of Telegram Stars that were split between the
            winners; for Telegram Star giveaways only.
        premium_subscription_month_count: Number of months the Telegram Premium
            subscription won from the giveaway will be active for.
        unclaimed_prize_count: Number of undistributed prizes.
        only_new_members: Whether only users who had joined the chats after the
            giveaway started were eligible to win.
        was_refunded: Whether the giveaway was canceled because the payment for
            it was refunded.
        prize_description: Description of the additional giveaway prize.

    Telegram API: https://core.telegram.org/bots/api#giveawaywinners
    """

    chat: Chat
    giveaway_message_id: int
    winners_selection_date: int
    winner_count: int
    winners: list[User]
    additional_chat_count: int | None = None
    prize_star_count: int | None = None
    premium_subscription_month_count: int | None = None
    unclaimed_prize_count: int | None = None
    only_new_members: bool | None = None
    was_refunded: bool | None = None
    prize_description: str | None = None
