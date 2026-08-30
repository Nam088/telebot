"""Auxiliary message types: forward origins, quotes, external replies."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.common import (
    Contact,
    Dice,
    LinkPreviewOptions,
    Location,
    MessageEntity,
    Poll,
    Venue,
)
from telebot_py.types.games import Game
from telebot_py.types.media import (
    Animation,
    Audio,
    Document,
    PhotoSize,
    Video,
    VideoNote,
    Voice,
)
from telebot_py.types.payments import Invoice
from telebot_py.types.stickers import Sticker
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class Story(TelegramObject):
    """A forwarded story.

    Attributes:
        chat: Chat that posted the story.
        id: Unique identifier of the story in the chat.

    Telegram API: https://core.telegram.org/bots/api#story
    """

    chat: Chat
    id: int


@dataclasses.dataclass(frozen=True, slots=True)
class MessageOriginUser(TelegramObject):
    """The message was originally sent by a known user.

    Attributes:
        type: Type of the message origin, always 'user'.
        date: Date the message was sent originally in Unix time.
        sender_user: User that sent the message originally.

    Telegram API: https://core.telegram.org/bots/api#messageoriginuser
    """

    type: str
    date: int
    sender_user: User

    _DISCRIMINATOR = ("type", "user")


@dataclasses.dataclass(frozen=True, slots=True)
class MessageOriginHiddenUser(TelegramObject):
    """The message was originally sent by an unknown user.

    Attributes:
        type: Type of the message origin, always 'hidden_user'.
        date: Date the message was sent originally in Unix time.
        sender_user_name: Name of the user that sent the message originally.

    Telegram API: https://core.telegram.org/bots/api#messageoriginhiddenuser
    """

    type: str
    date: int
    sender_user_name: str

    _DISCRIMINATOR = ("type", "hidden_user")


@dataclasses.dataclass(frozen=True, slots=True)
class MessageOriginChat(TelegramObject):
    """The message was originally sent on behalf of a chat.

    Attributes:
        type: Type of the message origin, always 'chat'.
        date: Date the message was sent originally in Unix time.
        sender_chat: Chat that sent the message originally.
        author_signature: For messages originally sent by an anonymous chat
            administrator, the original message author signature.

    Telegram API: https://core.telegram.org/bots/api#messageoriginchat
    """

    type: str
    date: int
    sender_chat: Chat
    author_signature: str | None = None

    _DISCRIMINATOR = ("type", "chat")


@dataclasses.dataclass(frozen=True, slots=True)
class MessageOriginChannel(TelegramObject):
    """The message was originally sent to a channel chat.

    Attributes:
        type: Type of the message origin, always 'channel'.
        date: Date the message was sent originally in Unix time.
        chat: Channel chat to which the message was originally sent.
        message_id: Identifier of the original message in the channel.
        author_signature: Signature of the original post author, if present.

    Telegram API: https://core.telegram.org/bots/api#messageoriginchannel
    """

    type: str
    date: int
    chat: Chat
    message_id: int
    author_signature: str | None = None

    _DISCRIMINATOR = ("type", "channel")


@dataclasses.dataclass(frozen=True, slots=True)
class TextQuote(TelegramObject):
    """The quoted part of a message that is replied to.

    Attributes:
        text: Text of the quoted part of a message that is replied to.
        position: Approximate quote position in the original message in
            UTF-16 code units.
        entities: Special entities that appear in the quote.
        is_manual: Whether the quote was chosen manually by the sender.

    Telegram API: https://core.telegram.org/bots/api#textquote
    """

    text: str
    position: int
    entities: list[MessageEntity] | None = None
    is_manual: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ExternalReplyInfo(TelegramObject):
    """Information about a message that is being replied to from another chat.

    Attributes:
        origin: Origin of the message replied to.
        chat: Chat the original message belongs to.
        message_id: Unique message identifier inside the original chat.
        link_preview_options: Options used for link preview generation for
            the original message, if it is a text message and includes entity
            links.
        animation: The message is an animation, information about it.
        audio: The message is an audio file, information about the file.
        document: The message is a general file, information about the file.
        photo: The message is a photo, available sizes of the photo.
        sticker: The message is a sticker, information about it.
        story: The message is a forwarded story, information about the story.
        video: The message is a video, information about the video.
        video_note: The message is a video note, information about it.
        voice: The message is a voice message, information about the file.
        has_media_spoiler: Whether the message media is covered by a spoiler
            animation.
        contact: The message is a shared contact, information about it.
        dice: The message is a dice with random value.
        game: The message is a game, information about it.
        giveaway: The message is a scheduled giveaway (kept raw).
        giveaway_winners: A giveaway with public winners was completed
            (kept raw).
        invoice: The message is an invoice for a payment.
        location: The message is a shared location, information about it.
        poll: The message is a native poll, information about the poll.
        venue: The message is a venue, information about the venue.

    Telegram API: https://core.telegram.org/bots/api#externalreplyinfo
    """

    origin: MessageOriginUser | MessageOriginHiddenUser | MessageOriginChat | MessageOriginChannel
    chat: Chat | None = None
    message_id: int | None = None
    link_preview_options: LinkPreviewOptions | None = None
    animation: Animation | None = None
    audio: Audio | None = None
    document: Document | None = None
    photo: list[PhotoSize] | None = None
    sticker: Sticker | None = None
    story: Story | None = None
    video: Video | None = None
    video_note: VideoNote | None = None
    voice: Voice | None = None
    has_media_spoiler: bool | None = None
    contact: Contact | None = None
    dice: Dice | None = None
    game: Game | None = None
    giveaway: object | None = None
    giveaway_winners: object | None = None
    invoice: Invoice | None = None
    location: Location | None = None
    poll: Poll | None = None
    venue: Venue | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class WebAppData(TelegramObject):
    """Data sent from a Web App to the bot.

    Attributes:
        data: The data. Be aware that a bad client can send arbitrary data.
        button_text: Text of the web_app keyboard button from which the Web
            App was opened.

    Telegram API: https://core.telegram.org/bots/api#webappdata
    """

    data: str
    button_text: str


@dataclasses.dataclass(frozen=True, slots=True)
class PollAnswer(TelegramObject):
    """A user changed their answer in a non-anonymous poll.

    Attributes:
        poll_id: Unique poll identifier.
        option_ids: 0-based identifiers of chosen answer options; may be
            empty if the user retracted their vote.
        voter_chat: The chat that changed the answer to the poll, if the
            voter is anonymous.
        user: The user who changed the answer to the poll, if not anonymous.

    Telegram API: https://core.telegram.org/bots/api#pollanswer
    """

    poll_id: str
    option_ids: list[int]
    voter_chat: Chat | None = None
    user: User | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class SentWebAppMessage(TelegramObject):
    """The result of an interaction with a Web App sent on behalf of a user.

    Attributes:
        inline_message_id: Identifier of the sent inline message, available
            only if there is an inline message attached to the Web App.

    Telegram API: https://core.telegram.org/bots/api#sentwebappmessage
    """

    inline_message_id: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class PreparedInlineMessage(TelegramObject):
    """A message prepared to be sent by a user of a Mini App.

    Attributes:
        id: Unique identifier of the prepared message.
        expiration_date: Expiration date of the prepared message, in Unix
            time. Expired prepared messages can no longer be used.

    Telegram API: https://core.telegram.org/bots/api#preparedinlinemessage
    """

    id: str
    expiration_date: int


@dataclasses.dataclass(frozen=True, slots=True)
class SentGuestMessage(TelegramObject):
    """An inline message sent by a guest bot in reply to a guest query.

    Attributes:
        inline_message_id: Identifier of the sent inline message, available
            only if there is an inline message attached to the guest query.

    Telegram API: https://core.telegram.org/bots/api#sentguestmessage
    """

    inline_message_id: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ReplyParameters(TelegramObject):
    """Describes a message reply to apply.

    Every field is optional on the wire; unset fields are omitted by
    ``to_dict``, so ``ReplyParameters(message_id=5)`` serializes to exactly
    ``{"message_id": 5}``.

    Attributes:
        chat_id: Unique identifier of the chat the message to reply to belongs
            to; omit when the message to reply to is in the current chat.
        message_id: Identifier of the message that will be replied to in the
            current chat, or in ``chat_id`` if it is specified.
        allow_sending_without_reply: Whether the message should be sent even if
            the specified replied-to message is not found.
        quote: Quoted part of the message to be replied to, 0-1024 characters
            after entities parsing.
        quote_parse_mode: Parse mode for the entities in the quote.
        quote_entities: Special entities that appear in the quote, which can be
            specified instead of ``quote_parse_mode``.
        quote_position: Position of the quote in the original message in UTF-16
            code units.
        checklist_task_id: Identifier of the specific checklist item that the
            message is replying to, relative to the first item in the checklist
            in the replied message.
        poll_option_id: Identifier of the specific answer option in the poll
            that the message is replying to.
        ephemeral_message_id: Identifier of the ephemeral message that will be
            replied to, with an expiration date of at least 1 hour from now and
            no more than 366 days from now. Ignored for messages having
            ``chat_id``.

    Telegram API: https://core.telegram.org/bots/api#replyparameters
    """

    chat_id: int | str | None = None
    message_id: int | None = None
    allow_sending_without_reply: bool | None = None
    quote: str | None = None
    quote_parse_mode: str | None = None
    quote_entities: list[MessageEntity] | None = None
    quote_position: int | None = None
    checklist_task_id: int | None = None
    poll_option_id: str | None = None
    ephemeral_message_id: int | None = None
