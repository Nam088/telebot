"""HTML widget and widget query types for Telegram Bot API 10.4+."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.common import MessageEntity
from telebot_py.types.ton_wallet import TonWalletCard
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class Widget(TelegramObject):
    """Represents an HTML widget in a message.

    Attributes:
        html: HTML content of the widget.
        id: Unique identifier of the shared widget, if shared.
        width: Width of the widget in pixels.
        height: Height of the widget in pixels.
        public_data: Public data of the widget, if any.
        chat_data: Chat-specific data of the widget, if any.

    Telegram API: https://core.telegram.org/bots/api#widget
    """

    html: str
    id: str | None = None
    width: int | None = None
    height: int | None = None
    public_data: str | None = None
    chat_data: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class WidgetQueryWallet(TelegramObject):
    """Describes a TON wallet in a widget query.

    Attributes:
        address: Address of the TON wallet.
        amount: Balance of the wallet in nanoton.
        public_key: Public key of the wallet, if available.
        state_init: Base64-encoded state init of the wallet, if available.

    Telegram API: https://core.telegram.org/bots/api#widgetquerywallet
    """

    address: str
    amount: str
    public_key: str | None = None
    state_init: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class WidgetQueryTypeData(TelegramObject):
    """Represents a widget query containing data for the bot.

    Attributes:
        type: Type of the query, always ``"data"``.
        wallet_card: TON wallet card of the user, if requested.

    Telegram API: https://core.telegram.org/bots/api#widgetquerytypedata
    """

    type: str
    wallet_card: TonWalletCard | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class WidgetQueryTypeSignData(TelegramObject):
    """Represents a widget query containing data signed by a TON wallet.

    Attributes:
        type: Type of the query, always ``"sign_data"``.
        wallet: TON wallet that signed the data.
        sign_data: Signed data payload.

    Telegram API: https://core.telegram.org/bots/api#widgetquerytypesigndata
    """

    type: str
    wallet: WidgetQueryWallet
    sign_data: str


@dataclasses.dataclass(frozen=True, slots=True)
class WidgetQueryTypeSentTransaction(TelegramObject):
    """Represents a widget query notifying about a sent TON transaction.

    Attributes:
        type: Type of the query, always ``"sent_transaction"``.
        wallet: TON wallet that sent the transaction.
        msg_hash: Hash of the external message sent to the blockchain.

    Telegram API: https://core.telegram.org/bots/api#widgetquerytypesenttransaction
    """

    type: str
    wallet: WidgetQueryWallet
    msg_hash: str


WidgetQueryType: t.TypeAlias = (
    WidgetQueryTypeData | WidgetQueryTypeSignData | WidgetQueryTypeSentTransaction
)


@dataclasses.dataclass(frozen=True, slots=True)
class WidgetQuery(TelegramObject):
    """Represents an incoming query from a widget.

    Attributes:
        id: Unique identifier for this query.
        from_user: Sender of the query.
        chat_instance: Global identifier uniquely corresponding to the chat.
        type: Type of the widget query.
        data: Data payload sent by the widget.
        chat: Chat where the widget message was sent, if available.
        message_id: Identifier of the message with the widget, if available.
        inline_message_id: Identifier of the inline message with the widget.
        chat_type: Type of the chat, if available.
        widget_id: Identifier of the shared widget, if applicable.

    Telegram API: https://core.telegram.org/bots/api#widgetquery
    """

    id: str
    from_user: User
    chat_instance: str
    type: WidgetQueryType
    data: str
    chat: Chat | None = None
    message_id: int | None = None
    inline_message_id: str | None = None
    chat_type: str | None = None
    widget_id: str | None = None

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


@dataclasses.dataclass(frozen=True, slots=True)
class SharedWidgetQuery(TelegramObject):
    """Represents an incoming query from a forwarded message with a shared widget.

    Attributes:
        id: Unique identifier for this query.
        from_user: Sender of the query.
        type: Type of the widget query.
        data: Data payload sent by the widget.
        widget_id: Unique identifier of the shared widget.

    Telegram API: https://core.telegram.org/bots/api#sharedwidgetquery
    """

    id: str
    from_user: User
    type: WidgetQueryType
    data: str
    widget_id: str

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


@dataclasses.dataclass(frozen=True, slots=True)
class InputWidgetMessageContent(TelegramObject):
    """Represents HTML widget content for an inline query result.

    Attributes:
        html: HTML content of the widget.
        width: Width of the widget in pixels.
        height: Height of the widget in pixels.
        public_data: Public data of the widget.
        chat_data: Chat-specific data of the widget.
        caption: Caption of the widget message.
        parse_mode: Mode for parsing entities in the caption.
        caption_entities: List of special entities that appear in the caption.
        show_caption_above_media: Pass True to show caption above the widget.
        allow_queries: Pass True to allow the widget to send queries.
        is_shared: Pass True if the widget is shared.

    Telegram API: https://core.telegram.org/bots/api#inputwidgetmessagecontent
    """

    html: str
    width: int | None = None
    height: int | None = None
    public_data: str | None = None
    chat_data: str | None = None
    caption: str | None = None
    parse_mode: str | None = None
    caption_entities: list[MessageEntity] | None = None
    show_caption_above_media: bool | None = None
    allow_queries: bool | None = None
    is_shared: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class InputSharedWidgetMessageContent(TelegramObject):
    """Represents shared widget content for an inline query result.

    Attributes:
        widget_id: Unique identifier of the shared widget.
        chat_data: Chat-specific data of the widget.
        caption: Caption of the widget message.
        parse_mode: Mode for parsing entities in the caption.
        caption_entities: List of special entities that appear in the caption.
        show_caption_above_media: Pass True to show caption above the widget.

    Telegram API: https://core.telegram.org/bots/api#inputsharedwidgetmessagecontent
    """

    widget_id: str
    chat_data: str | None = None
    caption: str | None = None
    parse_mode: str | None = None
    caption_entities: list[MessageEntity] | None = None
    show_caption_above_media: bool | None = None
