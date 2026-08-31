"""Rich formatted text nodes and rich message buttons (Bot API 10.3).

Field names, required-ness and ``type`` literals follow the official Telegram
Bot API docs for the ``RichText*`` classes and ``RichMessageButton``.

Every node class defaults its ``type`` field to the literal the docs give
("always 'bold'"), so callers never repeat it while :meth:`to_dict` always
emits it -- the same treatment ``remove_keyboard`` and ``force_reply`` get in
:mod:`telebot_py.types.keyboards`. Formatting nodes all carry one ``text``
field, "the text"; only fields whose meaning is not the attribute name are
listed in a class's ``Attributes:`` block.

``RichText`` models Telegram's three-way text shape: a bare ``str`` for plain
text, a sequence of nodes, or one node object. Optional fields use ``None``
for "not sent" (dropped by :meth:`to_dict`); an empty string or list is sent
as-is, so the ``UNSET`` sentinel is not needed on these constructors.

Remarks:
    ``RichMessageButton`` lives here with the text nodes because
    :class:`RichTextButton` embeds a button while a button's own ``text`` is a
    ``RichText``: the two are mutually recursive, and :meth:`from_dict`
    resolves annotations through the defining module's globals, so the union
    and both classes cannot be split across modules.
"""

from __future__ import annotations

import dataclasses
from collections.abc import Sequence

from telebot_py.types.base import TelegramObject
from telebot_py.types.keyboards import (
    CopyTextButton,
    LoginUrl,
    SwitchInlineQueryChosenChat,
    WebAppInfo,
)
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class RichMessageButton(TelegramObject):
    """A button in a rich message; exactly one field other than ``text`` and
    ``style`` chooses the button's type.

    Attributes:
        text: Text of the button; plain text, RichTextCustomEmoji or
            RichTextDateTime entities only.
        style: Style of the button; 'danger', 'success', 'primary' or 'link'.
        url: HTTP or tg:// URL opened when the button is pressed.
        callback_data: Data sent in a callback query when pressed, 1-64 bytes.
        web_app: Description of the Web App launched when pressed.
        login_url: An HTTPS URL used to automatically authorize the user.
        switch_inline_query: Prompts chat selection and inserts this query.
        switch_inline_query_current_chat: Inserts this query in the current chat.
        switch_inline_query_chosen_chat: Prompts selection of chats of these types.
        copy_text: A button that copies the given text to the clipboard.
        disabled: If set, the button is disabled and does nothing; kept raw
            because the Bot API ``DisabledButton`` has no fields.

    Telegram API: https://core.telegram.org/bots/api#richmessagebutton
    """

    text: RichText
    style: str | None = None
    url: str | None = None
    callback_data: str | None = None
    web_app: WebAppInfo | None = None
    login_url: LoginUrl | None = None
    switch_inline_query: str | None = None
    switch_inline_query_current_chat: str | None = None
    switch_inline_query_chosen_chat: SwitchInlineQueryChosenChat | None = None
    copy_text: CopyTextButton | None = None
    disabled: object | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextBold(TelegramObject):
    """A bold text; ``type`` is always ``'bold'``.

    Telegram API: https://core.telegram.org/bots/api#richtextbold
    """

    text: RichText
    type: str = "bold"
    _DISCRIMINATOR = ("type", "bold")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextItalic(TelegramObject):
    """An italicized text; ``type`` is always ``'italic'``.

    Telegram API: https://core.telegram.org/bots/api#richtextitalic
    """

    text: RichText
    type: str = "italic"
    _DISCRIMINATOR = ("type", "italic")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextUnderline(TelegramObject):
    """An underlined text; ``type`` is always ``'underline'``.

    Telegram API: https://core.telegram.org/bots/api#richtextunderline
    """

    text: RichText
    type: str = "underline"
    _DISCRIMINATOR = ("type", "underline")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextStrikethrough(TelegramObject):
    """A strikethrough text; ``type`` is always ``'strikethrough'``.

    Telegram API: https://core.telegram.org/bots/api#richtextstrikethrough
    """

    text: RichText
    type: str = "strikethrough"
    _DISCRIMINATOR = ("type", "strikethrough")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextSpoiler(TelegramObject):
    """A text covered by a spoiler; ``type`` is always ``'spoiler'``.

    Telegram API: https://core.telegram.org/bots/api#richtextspoiler
    """

    text: RichText
    type: str = "spoiler"
    _DISCRIMINATOR = ("type", "spoiler")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextSubscript(TelegramObject):
    """A subscript text; ``type`` is always ``'subscript'``.

    Telegram API: https://core.telegram.org/bots/api#richtextsubscript
    """

    text: RichText
    type: str = "subscript"
    _DISCRIMINATOR = ("type", "subscript")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextSuperscript(TelegramObject):
    """A superscript text; ``type`` is always ``'superscript'``.

    Telegram API: https://core.telegram.org/bots/api#richtextsuperscript
    """

    text: RichText
    type: str = "superscript"
    _DISCRIMINATOR = ("type", "superscript")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextMarked(TelegramObject):
    """A marked text; ``type`` is always ``'marked'``.

    Telegram API: https://core.telegram.org/bots/api#richtextmarked
    """

    text: RichText
    type: str = "marked"
    _DISCRIMINATOR = ("type", "marked")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextCode(TelegramObject):
    """A monowidth text; ``type`` is always ``'code'``.

    Telegram API: https://core.telegram.org/bots/api#richtextcode
    """

    text: RichText
    type: str = "code"
    _DISCRIMINATOR = ("type", "code")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextDateTime(TelegramObject):
    """Formatted date and time; ``type`` is always ``'date_time'``.

    Attributes:
        unix_time: The Unix time associated with the entity.
        date_time_format: The string defining how the date and time are shown.

    Telegram API: https://core.telegram.org/bots/api#richtextdatetime
    """

    text: RichText
    unix_time: int
    date_time_format: str
    type: str = "date_time"
    _DISCRIMINATOR = ("type", "date_time")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextTextMention(TelegramObject):
    """A mention of a Telegram user by their identifier; ``type`` is always
    ``'text_mention'``.

    Attributes:
        user: The mentioned user.

    Telegram API: https://core.telegram.org/bots/api#richtexttextmention
    """

    text: RichText
    user: User
    type: str = "text_mention"
    _DISCRIMINATOR = ("type", "text_mention")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextCustomEmoji(TelegramObject):
    """A custom emoji; ``type`` is always ``'custom_emoji'``.

    Attributes:
        custom_emoji_id: Unique identifier of the custom emoji.
        alternative_text: Alternative emoji for the custom emoji.

    Telegram API: https://core.telegram.org/bots/api#richtextcustomemoji
    """

    custom_emoji_id: str
    alternative_text: str
    type: str = "custom_emoji"
    _DISCRIMINATOR = ("type", "custom_emoji")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextMathematicalExpression(TelegramObject):
    """A mathematical expression; ``type`` is always
    ``'mathematical_expression'``.

    Attributes:
        expression: The expression in LaTeX format.

    Telegram API: https://core.telegram.org/bots/api#richtextmathematicalexpression
    """

    expression: str
    type: str = "mathematical_expression"
    _DISCRIMINATOR = ("type", "mathematical_expression")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextUrl(TelegramObject):
    """A text with a URL; ``type`` is always ``'url'``.

    Attributes:
        url: The URL.

    Telegram API: https://core.telegram.org/bots/api#richtexturl
    """

    text: RichText
    url: str
    type: str = "url"
    _DISCRIMINATOR = ("type", "url")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextEmailAddress(TelegramObject):
    """A text with an email address; ``type`` is always ``'email_address'``.

    Attributes:
        email_address: The email address.

    Telegram API: https://core.telegram.org/bots/api#richtextemailaddress
    """

    text: RichText
    email_address: str
    type: str = "email_address"
    _DISCRIMINATOR = ("type", "email_address")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextPhoneNumber(TelegramObject):
    """A text with a phone number; ``type`` is always ``'phone_number'``.

    Attributes:
        phone_number: The phone number.

    Telegram API: https://core.telegram.org/bots/api#richtextphonenumber
    """

    text: RichText
    phone_number: str
    type: str = "phone_number"
    _DISCRIMINATOR = ("type", "phone_number")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextBankCardNumber(TelegramObject):
    """A text with a bank card number; ``type`` is always
    ``'bank_card_number'``.

    Attributes:
        bank_card_number: The bank card number.

    Telegram API: https://core.telegram.org/bots/api#richtextbankcardnumber
    """

    text: RichText
    bank_card_number: str
    type: str = "bank_card_number"
    _DISCRIMINATOR = ("type", "bank_card_number")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextMention(TelegramObject):
    """A mention by a username; ``type`` is always ``'mention'``.

    Attributes:
        username: The username.

    Telegram API: https://core.telegram.org/bots/api#richtextmention
    """

    text: RichText
    username: str
    type: str = "mention"
    _DISCRIMINATOR = ("type", "mention")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextHashtag(TelegramObject):
    """A hashtag; ``type`` is always ``'hashtag'``.

    Attributes:
        hashtag: The hashtag.

    Telegram API: https://core.telegram.org/bots/api#richtexthashtag
    """

    text: RichText
    hashtag: str
    type: str = "hashtag"
    _DISCRIMINATOR = ("type", "hashtag")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextCashtag(TelegramObject):
    """A cashtag; ``type`` is always ``'cashtag'``.

    Attributes:
        cashtag: The cashtag.

    Telegram API: https://core.telegram.org/bots/api#richtextcashtag
    """

    text: RichText
    cashtag: str
    type: str = "cashtag"
    _DISCRIMINATOR = ("type", "cashtag")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextBotCommand(TelegramObject):
    """A bot command; ``type`` is always ``'bot_command'``.

    Attributes:
        bot_command: The bot command.

    Telegram API: https://core.telegram.org/bots/api#richtextbotcommand
    """

    text: RichText
    bot_command: str
    type: str = "bot_command"
    _DISCRIMINATOR = ("type", "bot_command")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextButton(TelegramObject):
    """A button; ``type`` is always ``'button'``.

    Attributes:
        button: The button.

    Telegram API: https://core.telegram.org/bots/api#richtextbutton
    """

    button: RichMessageButton
    type: str = "button"
    _DISCRIMINATOR = ("type", "button")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextAnchor(TelegramObject):
    """An anchor; ``type`` is always ``'anchor'``.

    Attributes:
        name: The name of the anchor.

    Telegram API: https://core.telegram.org/bots/api#richtextanchor
    """

    name: str
    type: str = "anchor"
    _DISCRIMINATOR = ("type", "anchor")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextAnchorLink(TelegramObject):
    """A link to an anchor; ``type`` is always ``'anchor_link'``.

    Attributes:
        anchor_name: Name of the anchor; empty brings the reader to the top.

    Telegram API: https://core.telegram.org/bots/api#richtextanchorlink
    """

    text: RichText
    anchor_name: str
    type: str = "anchor_link"
    _DISCRIMINATOR = ("type", "anchor_link")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextReference(TelegramObject):
    """A reference; ``type`` is always ``'reference'``.

    Attributes:
        name: The name of the reference.

    Telegram API: https://core.telegram.org/bots/api#richtextreference
    """

    text: RichText
    name: str
    type: str = "reference"
    _DISCRIMINATOR = ("type", "reference")


@dataclasses.dataclass(frozen=True, slots=True)
class RichTextReferenceLink(TelegramObject):
    """A link to a reference; ``type`` is always ``'reference_link'``.

    Attributes:
        reference_name: The name of the reference.

    Telegram API: https://core.telegram.org/bots/api#richtextreferencelink
    """

    text: RichText
    reference_name: str
    type: str = "reference_link"
    _DISCRIMINATOR = ("type", "reference_link")


#: A rich text entity node, excluding plain text.
RichTextNode = (
    RichTextBold
    | RichTextItalic
    | RichTextUnderline
    | RichTextStrikethrough
    | RichTextSpoiler
    | RichTextDateTime
    | RichTextTextMention
    | RichTextSubscript
    | RichTextSuperscript
    | RichTextMarked
    | RichTextCode
    | RichTextCustomEmoji
    | RichTextMathematicalExpression
    | RichTextUrl
    | RichTextEmailAddress
    | RichTextPhoneNumber
    | RichTextBankCardNumber
    | RichTextMention
    | RichTextHashtag
    | RichTextCashtag
    | RichTextBotCommand
    | RichTextButton
    | RichTextAnchor
    | RichTextAnchorLink
    | RichTextReference
    | RichTextReferenceLink
)

#: A rich formatted text: a bare ``str`` for plain text, a sequence of nodes,
#: or a single entity node.
RichText = str | RichTextNode | Sequence[str | RichTextNode]
