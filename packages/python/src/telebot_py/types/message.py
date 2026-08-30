"""Telegram Message type with the full node (Bot API 10.3) field set."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.business import ChatBoostAdded
from telebot_py.types.chat import Chat
from telebot_py.types.chat_members import CommunityChatJoined
from telebot_py.types.common import (
    Contact,
    Dice,
    Location,
    MessageEntity,
    Poll,
    Venue,
)
from telebot_py.types.keyboards import InlineKeyboardMarkup
from telebot_py.types.media import (
    Animation,
    Audio,
    Document,
    LivePhoto,
    PhotoSize,
    Video,
    VideoNote,
    Voice,
)
from telebot_py.types.message_extras import (
    ExternalReplyInfo,
    MessageOriginChannel,
    MessageOriginChat,
    MessageOriginHiddenUser,
    MessageOriginUser,
    Story,
    TextQuote,
    WebAppData,
)
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class Message(TelegramObject):
    """A Telegram message, field-complete against the node reference.

    Node types that are out of P1-P3 scope (Sticker, Game, Invoice,
    SuccessfulPayment, RefundedPayment, PassportData, RichMessage,
    LinkPreviewOptions, and the unknown-typed service payloads) are carried
    as raw ``object`` payloads so round-trips stay lossless.

    Attributes:
        message_id: Unique message identifier inside this chat.
        date: Date the message was sent in Unix time.
        chat: Chat the message belongs to.
        message_thread_id: Unique identifier of the message thread the
            message belongs to; for supergroups only.
        from_user: Sender of the message; empty for channel posts.
        sender_chat: Sender of the message, sent on behalf of a chat.
        sender_boost_count: If the sender boosted the chat, the number of
            boosts added.
        sender_business_bot: The bot that actually sent the message on behalf
            of the business account.
        business_connection_id: Unique identifier of the business connection
            from which the message was received.
        forward_origin: Information about the original message for forwarded
            messages.
        is_topic_message: Whether the message is sent to a forum topic.
        is_automatic_forward: Whether the message is a channel post that was
            automatically forwarded to the connected discussion group.
        reply_to_message: For replies in the same chat and message thread,
            the original message.
        external_reply: Information about the message that is being replied
            to, which may come from another chat or forum topic.
        quote: For replies that quote part of the original message, the
            quoted part of the message.
        reply_to_story: For replies to a story, the original story.
        via_bot: Bot through which the message was sent.
        edit_date: Date the message was last edited in Unix time.
        has_protected_content: Whether the message cannot be forwarded.
        is_from_offline: Whether the message was sent by an implicit action,
            e.g. as an away or a greeting business message.
        media_group_id: The unique identifier of the media message group this
            message belongs to.
        author_signature: Signature of the post author for messages in
            channels, or the custom title of an anonymous group administrator.
        text: For text messages, the actual UTF-8 text of the message.
        entities: For text messages, special entities like substrings that
            appear in the text.
        link_preview_options: Options used for link preview generation
            (kept raw per node typing).
        animation: Message is an animation, information about the animation.
        audio: Message is an audio file, information about the file.
        document: Message is a general file, information about the file.
        photo: Message is a photo, available sizes of the photo.
        sticker: Message is a sticker (payload kept raw; node Sticker is out
            of scope here).
        story: Message is a forwarded story, information about the story.
        video: Message is a video, information about the video.
        video_note: Message is a video note, information about the message.
        voice: Message is a voice message, information about the file.
        caption: Caption for the animation, audio, document, photo, video or
            voice.
        caption_entities: For messages with a caption, special entities that
            appear in the caption.
        show_caption_above_media: Whether the caption must be shown above the
            message media.
        has_media_spoiler: Whether the message media is covered by a spoiler
            animation.
        contact: Message is a shared contact, information about the contact.
        dice: Message is a dice with random value.
        game: Message is a game (payload kept raw per node scope).
        poll: Message is a native poll, information about the poll.
        venue: Message is a venue, information about the venue.
        location: Message is a shared location, information about it.
        new_chat_members: New members added to the group or supergroup.
        left_chat_member: A member removed from the group.
        new_chat_title: A chat title was changed to this value.
        new_chat_photo: A chat photo was changed to this value.
        delete_chat_photo: Service message: the chat photo was deleted.
        group_chat_created: Service message: the group has been created.
        supergroup_chat_created: Service message: the supergroup has been
            created.
        channel_chat_created: Service message: the channel has been created.
        message_auto_delete_timer_changed: Service message: auto-delete timer
            settings changed in the chat (payload kept raw).
        migrate_to_chat_id: The group has been migrated to a supergroup with
            the specified identifier.
        migrate_from_chat_id: The supergroup has been migrated from a group
            with the specified identifier.
        pinned_message: Specified message was pinned.
        invoice: Message is an invoice for a payment (payload kept raw; node
            payments models are out of scope here).
        successful_payment: Service message about a successful payment
            (payload kept raw).
        refunded_payment: Service message about a refunded payment (payload
            kept raw).
        users_shared: Service message: users were shared with the bot
            (payload kept raw).
        chat_shared: Service message: a chat was shared with the bot
            (payload kept raw).
        connected_website: The domain name of the website on which the user
            has logged in.
        write_access_allowed: Service message: the user allowed the bot to
            write messages after adding it to the attachment menu (raw).
        passport_data: Telegram Passport data (payload kept raw).
        proximity_alert_triggered: Service message: proximity alert triggered
            while sharing Live Location (payload kept raw).
        boost_added: Service message: user boosted the chat.
        chat_background_set: Service message: chat background set (raw).
        forum_topic_created: Service message: forum topic created (raw).
        forum_topic_edited: Service message: forum topic edited (raw).
        forum_topic_closed: Service message: forum topic closed (raw).
        forum_topic_reopened: Service message: forum topic reopened (raw).
        general_forum_topic_hidden: Service message: the 'General' forum
            topic hidden (raw).
        general_forum_topic_unhidden: Service message: the 'General' forum
            topic unhidden (raw).
        giveaway_created: Service message: a scheduled giveaway was created
            (raw).
        giveaway: The message is a scheduled giveaway (raw).
        giveaway_winners: A giveaway with public winners was completed (raw).
        giveaway_completed: Service message: a giveaway without public
            winners was completed (raw).
        video_chat_scheduled: Service message: video chat scheduled (raw).
        video_chat_started: Service message: video chat started (raw).
        video_chat_ended: Service message: video chat ended (raw).
        video_chat_participants_invited: Service message: new participants
            invited to a video chat (raw).
        web_app_data: Service message: data sent by a Web App to the bot.
        reply_markup: Inline keyboard attached to the message.
        community_chat_joined: Service message: a user joined the chat from a
            community (Bot API 10.3+).
        receiver_user: Receiver user of an ephemeral message.
        ephemeral_message_id: Ephemeral message identifier.
        rich_message: Rich formatted message content (payload kept raw; the
            node rich domain is out of scope here).
        live_photo: Live photo attachment.

    Telegram API: https://core.telegram.org/bots/api#message
    """

    message_id: int
    date: int
    chat: Chat
    message_thread_id: int | None = None
    from_user: User | None = None
    sender_chat: Chat | None = None
    sender_boost_count: int | None = None
    sender_business_bot: User | None = None
    business_connection_id: str | None = None
    forward_origin: (
        MessageOriginUser
        | MessageOriginHiddenUser
        | MessageOriginChat
        | MessageOriginChannel
        | None
    ) = None
    is_topic_message: bool | None = None
    is_automatic_forward: bool | None = None
    reply_to_message: Message | None = None
    external_reply: ExternalReplyInfo | None = None
    quote: TextQuote | None = None
    reply_to_story: Story | None = None
    via_bot: User | None = None
    edit_date: int | None = None
    has_protected_content: bool | None = None
    is_from_offline: bool | None = None
    media_group_id: str | None = None
    author_signature: str | None = None
    text: str | None = None
    entities: list[MessageEntity] | None = None
    link_preview_options: object | None = None
    animation: Animation | None = None
    audio: Audio | None = None
    document: Document | None = None
    photo: list[PhotoSize] | None = None
    sticker: object | None = None
    story: Story | None = None
    video: Video | None = None
    video_note: VideoNote | None = None
    voice: Voice | None = None
    caption: str | None = None
    caption_entities: list[MessageEntity] | None = None
    show_caption_above_media: bool | None = None
    has_media_spoiler: bool | None = None
    contact: Contact | None = None
    dice: Dice | None = None
    game: object | None = None
    poll: Poll | None = None
    venue: Venue | None = None
    location: Location | None = None
    new_chat_members: list[User] | None = None
    left_chat_member: User | None = None
    new_chat_title: str | None = None
    new_chat_photo: list[PhotoSize] | None = None
    delete_chat_photo: bool | None = None
    group_chat_created: bool | None = None
    supergroup_chat_created: bool | None = None
    channel_chat_created: bool | None = None
    message_auto_delete_timer_changed: object | None = None
    migrate_to_chat_id: int | None = None
    migrate_from_chat_id: int | None = None
    pinned_message: Message | None = None
    invoice: object | None = None
    successful_payment: object | None = None
    refunded_payment: object | None = None
    users_shared: object | None = None
    chat_shared: object | None = None
    connected_website: str | None = None
    write_access_allowed: object | None = None
    passport_data: object | None = None
    proximity_alert_triggered: object | None = None
    boost_added: ChatBoostAdded | None = None
    chat_background_set: object | None = None
    forum_topic_created: object | None = None
    forum_topic_edited: object | None = None
    forum_topic_closed: object | None = None
    forum_topic_reopened: object | None = None
    general_forum_topic_hidden: object | None = None
    general_forum_topic_unhidden: object | None = None
    giveaway_created: object | None = None
    giveaway: object | None = None
    giveaway_winners: object | None = None
    giveaway_completed: object | None = None
    video_chat_scheduled: object | None = None
    video_chat_started: object | None = None
    video_chat_ended: object | None = None
    video_chat_participants_invited: object | None = None
    web_app_data: WebAppData | None = None
    reply_markup: InlineKeyboardMarkup | None = None
    community_chat_joined: CommunityChatJoined | None = None
    receiver_user: User | None = None
    ephemeral_message_id: int | None = None
    rich_message: object | None = None
    live_photo: LivePhoto | None = None

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


# Close the Chat <-> Message reference cycle: Chat.pinned_message is a lazy
# string annotation resolved via chat's module globals, so bind Message there.
# Binding goes through the module dict because mypy forbids reassigning a
# class name on an imported module ("Cannot assign to a type").
import telebot_py.types.chat as _chat_module  # noqa: E402

vars(_chat_module)["Message"] = Message
