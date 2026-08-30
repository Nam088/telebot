"""Telegram payment types used by updates and queries."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class ShippingAddress(TelegramObject):
    """A shipping address provided by the user.

    Attributes:
        country_code: Two-letter ISO 3166-1 alpha-2 country code.
        city: City.
        street_line1: First line for the address.
        post_code: Address post code.
        state: State, if applicable.
        street_line2: Second line for the address.

    Telegram API: https://core.telegram.org/bots/api#shippingaddress
    """

    country_code: str
    city: str
    street_line1: str
    post_code: str
    state: str | None = None
    street_line2: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class OrderInfo(TelegramObject):
    """Information about an order provided by the user.

    Attributes:
        name: User name.
        phone_number: User's phone number.
        email: User's email.
        shipping_address: User's shipping address.

    Telegram API: https://core.telegram.org/bots/api#orderinfo
    """

    name: str | None = None
    phone_number: str | None = None
    email: str | None = None
    shipping_address: ShippingAddress | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ShippingQuery(TelegramObject):
    """An incoming shipping query (only for invoices with flexible prices).

    Attributes:
        id: Unique query identifier.
        from_user: User who sent the query.
        invoice_payload: Bot-specified invoice payload.
        shipping_address: User-specified shipping address.

    Telegram API: https://core.telegram.org/bots/api#shippingquery
    """

    id: str
    from_user: User
    invoice_payload: str
    shipping_address: ShippingAddress

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


@dataclasses.dataclass(frozen=True, slots=True)
class PreCheckoutQuery(TelegramObject):
    """An incoming pre-checkout query containing full checkout information.

    Attributes:
        id: Unique query identifier.
        from_user: User who sent the query.
        currency: Three-letter ISO 4217 currency code or 'XTR'.
        total_amount: Total price in the smallest units of the currency.
        invoice_payload: Bot-specified invoice payload.
        shipping_option_id: Identifier of the shipping option chosen by the
            user, when applicable.
        order_info: Order info provided by the user, when applicable.

    Telegram API: https://core.telegram.org/bots/api#precheckoutquery
    """

    id: str
    from_user: User
    currency: str
    total_amount: int
    invoice_payload: str
    shipping_option_id: str | None = None
    order_info: OrderInfo | None = None

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


@dataclasses.dataclass(frozen=True, slots=True)
class PurchasedPaidMedia(TelegramObject):
    """A user purchased paid media with Telegram Stars.

    Attributes:
        from_user: User who purchased the media.
        paid_media_payload: Bot-specified paid media payload.
    """

    from_user: User
    paid_media_payload: str

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


@dataclasses.dataclass(frozen=True, slots=True)
class RefundedPayment(TelegramObject):
    """A service message about a refunded payment.

    Attributes:
        currency: Three-letter ISO 4217 currency code, or ``XTR`` for payments
            in Telegram Stars.
        total_amount: Total refunded price in the smallest units of the
            currency.
        invoice_payload: Bot-specified invoice payload.
        telegram_payment_charge_id: Telegram payment identifier.
        provider_payment_charge_id: Provider payment identifier.

    Telegram API: https://core.telegram.org/bots/api#refundedpayment
    """

    currency: str
    total_amount: int
    invoice_payload: str
    telegram_payment_charge_id: str
    provider_payment_charge_id: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class LabeledPrice(TelegramObject):
    """A portion of a price.

    Attributes:
        label: Portion label.
        amount: Price of the product in the smallest units of the currency.

    Telegram API: https://core.telegram.org/bots/api#labeledprice
    """

    label: str
    amount: int


@dataclasses.dataclass(frozen=True, slots=True)
class ShippingOption(TelegramObject):
    """One shipping option offered by the bot.

    Attributes:
        id: Shipping option identifier.
        title: Option title.
        prices: List of price portions.

    Telegram API: https://core.telegram.org/bots/api#shippingoption
    """

    id: str
    title: str
    prices: list[LabeledPrice]


@dataclasses.dataclass(frozen=True, slots=True)
class StarTransaction(TelegramObject):
    """A single Telegram Stars transaction.

    Attributes:
        id: Unique identifier of the transaction.
        amount: Number of Telegram Stars transferred.
        nanostar_amount: The number of 1/1000000000 shares of Telegram Stars
            transferred.
        date: Date the transaction took place, in Unix time.
        source: Source of the transaction; shape depends on the partner type.
        receiver: Receiver of the transaction; shape depends on the partner
            type.

    Telegram API: https://core.telegram.org/bots/api#startransaction
    """

    id: str
    amount: int
    date: int
    nanostar_amount: int | None = None
    source: t.Mapping[str, object] | None = None
    receiver: t.Mapping[str, object] | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class StarAmount(TelegramObject):
    """An amount of Telegram Stars.

    Returned by ``Bot.get_my_star_balance``.

    Attributes:
        amount: The integer number of Telegram Stars.
        nanostar_amount: The number of 1/1000000000 shares of Telegram Stars.

    Telegram API: https://core.telegram.org/bots/api#staramount
    """

    amount: int
    nanostar_amount: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class StarTransactions(TelegramObject):
    """The list of Telegram Stars transactions of a bot.

    Attributes:
        transactions: List of transactions.

    Telegram API: https://core.telegram.org/bots/api#startransactions
    """

    transactions: list[StarTransaction]
