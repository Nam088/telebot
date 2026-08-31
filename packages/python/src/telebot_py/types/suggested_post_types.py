"""Suggested-post payload objects carried by :class:`~telebot_py.types.Message`.

Channel bots that accept suggested posts receive these as nested objects of the
``Message`` announcing each state transition. ``suggested_post_message`` fields
are documented as ``MaybeInaccessibleMessage`` and are resolved through the
``Message`` binding that :mod:`telebot_py.types.message` installs at runtime.
"""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.payments import StarAmount

if t.TYPE_CHECKING:  # annotation-only; bound at runtime by message.py
    from telebot_py.types.message import Message as Message

#: Drives the ``import *`` re-export in :mod:`telebot_py.types`, the same way
#: :mod:`telebot_py.types.rich` fixes its own exported set.
__all__ = [
    "SuggestedPostPrice",
    "SuggestedPostInfo",
    "SuggestedPostParameters",
    "SuggestedPostApproved",
    "SuggestedPostApprovalFailed",
    "SuggestedPostDeclined",
    "SuggestedPostPaid",
    "SuggestedPostRefunded",
]


@dataclasses.dataclass(frozen=True, slots=True)
class SuggestedPostPrice(TelegramObject):
    """Price of a suggested post.

    Attributes:
        currency: Currency in which the post will be paid; one of ``XTR`` for
            Telegram Stars or ``TON`` for TON.
        amount: Price in the smallest units of ``currency`` — Telegram Stars
            for ``XTR``, nanograms for ``TON``.

    Telegram API: https://core.telegram.org/bots/api#suggestedpostprice
    """

    currency: str
    amount: int


@dataclasses.dataclass(frozen=True, slots=True)
class SuggestedPostInfo(TelegramObject):
    """Parameters of a suggested post in a channel chat.

    Attributes:
        state: State of the suggested post; one of ``pending``, ``approved``,
            ``declined``.
        price: Proposed price of the post; omitted when the post is unpaid.
        send_date: Proposed send date of the post in Unix time; omitted when
            the post can be published at any time.

    Telegram API: https://core.telegram.org/bots/api#suggestedpostinfo
    """

    state: str
    price: SuggestedPostPrice | None = None
    send_date: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class SuggestedPostParameters(TelegramObject):
    """Parameters of a post that the bot suggests to publish in a channel.

    Accepted by the ``suggested_post_parameters`` argument of the Bot API
    ``send*`` methods, which take any ``to_dict`` object.

    Attributes:
        price: Proposed price for the post. If the field is omitted, then the
            post is unpaid.
        send_date: Proposed send date of the post, in Unix time. If specified,
            the date must be between 300 and 2678400 seconds (30 days) in the
            future.

    Telegram API: https://core.telegram.org/bots/api#suggestedpostparameters
    """

    price: SuggestedPostPrice | None = None
    send_date: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class SuggestedPostApproved(TelegramObject):
    """Service message: a suggested post was approved.

    Attributes:
        send_date: Date when the post will be published, in Unix time.
        suggested_post_message: Message containing the suggested post.
        price: Amount paid for the post; omitted for unpaid posts.

    Telegram API: https://core.telegram.org/bots/api#suggestedpostapproved
    """

    send_date: int
    suggested_post_message: Message | None = None
    price: SuggestedPostPrice | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class SuggestedPostApprovalFailed(TelegramObject):
    """Service message: approval of a suggested post has failed.

    Attributes:
        price: Expected price of the post.
        suggested_post_message: Message containing the post whose approval
            failed.

    Telegram API: https://core.telegram.org/bots/api#suggestedpostapprovalfailed
    """

    price: SuggestedPostPrice
    suggested_post_message: Message | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class SuggestedPostDeclined(TelegramObject):
    """Service message: a suggested post was declined.

    Attributes:
        suggested_post_message: Message containing the suggested post.
        comment: Comment with which the post was declined.

    Telegram API: https://core.telegram.org/bots/api#suggestedpostdeclined
    """

    suggested_post_message: Message | None = None
    comment: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class SuggestedPostPaid(TelegramObject):
    """Service message: payment for a suggested post was received.

    Attributes:
        currency: Currency in which the payment was made; one of ``XTR`` for
            Telegram Stars or ``TON`` for TON.
        suggested_post_message: Message containing the suggested post.
        amount: Amount received by the channel in nanograms; for payments in
            TON only.
        star_amount: Amount of Telegram Stars received by the channel; for
            payments in Telegram Stars only.

    Telegram API: https://core.telegram.org/bots/api#suggestedpostpaid
    """

    currency: str
    suggested_post_message: Message | None = None
    amount: int | None = None
    star_amount: StarAmount | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class SuggestedPostRefunded(TelegramObject):
    """Service message: payment for a suggested post was refunded.

    Attributes:
        reason: Reason for the refund; one of ``post_deleted`` if the post was
            deleted within 24 hours of being posted or removed from scheduled
            messages without being posted, or ``payment_refunded`` if the payer
            refunded their payment.
        suggested_post_message: Message containing the suggested post.

    Telegram API: https://core.telegram.org/bots/api#suggestedpostrefunded
    """

    reason: str
    suggested_post_message: Message | None = None
