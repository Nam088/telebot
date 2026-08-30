"""Telegram Message type with the full Bot API 10.3 field set."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.background import ChatBackground
from telebot_py.types.base import TelegramObject
from telebot_py.types.business import ChatBoostAdded
from telebot_py.types.chat import Chat
from telebot_py.types.chat_members import CommunityChatJoined
from telebot_py.types.checklists import Checklist
from telebot_py.types.common import (
    Contact,
    Dice,
    LinkPreviewOptions,
    Location,
    MessageEntity,
    Venue,
)
from telebot_py.types.games import Game
from telebot_py.types.gifts import GiftInfo, UniqueGiftInfo
from telebot_py.types.giveaway_types import (
    Giveaway,
    GiveawayCompleted,
    GiveawayCreated,
    GiveawayWinners,
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
from telebot_py.types.message_community import (
    ChatOwnerChanged,
    ChatOwnerLeft,
    ChecklistTasksAdded,
    ChecklistTasksDone,
    CommunityChatAdded,
    CommunityChatRemoved,
    DirectMessagePriceChanged,
    DirectMessagesTopic,
    ManagedBotCreated,
    PaidMessagePriceChanged,
    PollOptionAdded,
    PollOptionDeleted,
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
from telebot_py.types.message_service import (
    ChatShared,
    ForumTopicClosed,
    ForumTopicCreated,
    ForumTopicEdited,
    ForumTopicReopened,
    GeneralForumTopicHidden,
    GeneralForumTopicUnhidden,
    MessageAutoDeleteTimerChanged,
    ProximityAlertTriggered,
    UsersShared,
    VideoChatEnded,
    VideoChatParticipantsInvited,
    VideoChatScheduled,
    VideoChatStarted,
    WriteAccessAllowed,
)
from telebot_py.types.paid_media import PaidMediaInfo
from telebot_py.types.passport import PassportData
from telebot_py.types.payments import Invoice, RefundedPayment, SuccessfulPayment
from telebot_py.types.poll_types import Poll
from telebot_py.types.rich_blocks import RichMessage
from telebot_py.types.stickers import Sticker
from telebot_py.types.suggested_post_types import (
    SuggestedPostApprovalFailed,
    SuggestedPostApproved,
    SuggestedPostDeclined,
    SuggestedPostInfo,
    SuggestedPostPaid,
    SuggestedPostRefunded,
)
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class InaccessibleMessage(TelegramObject):
    """A message that was deleted or is otherwise inaccessible to the bot.

    The docs reach this shape through ``MaybeInaccessibleMessage`` fields such
    as ``Message.reply_to_message``; ``date`` is always 0, which is how clients
    tell an inaccessible message from a regular one.

    Attributes:
        chat: Chat the message belonged to.
        message_id: Unique message identifier inside the chat.
        date: Always 0. The field can be used to differentiate regular and
            inaccessible messages.

    Telegram API: https://core.telegram.org/bots/api#inaccessiblemessage
    """

    chat: Chat
    message_id: int
    date: int


@dataclasses.dataclass(frozen=True, slots=True)
class Message(TelegramObject):
    """A Telegram message, field-complete against Bot API 10.3.

    Every field documented on ``Message`` is modelled with a real dataclass,
    so decoding an incoming update never drops data.

    Attributes:
        message_id: Unique message identifier inside this chat.
        date: Date the message was sent in Unix time.
        chat: Chat the message belongs to.
        message_thread_id: Unique identifier of the message thread the
            message belongs to; for supergroups only.
        direct_messages_topic: Topic that contains message history shared with
            the sender of the message by direct messages.
        from_user: Sender of the message; empty for channel posts.
        sender_chat: Sender of the message, sent on behalf of a chat.
        sender_boost_count: If the sender boosted the chat, the number of
            boosts added.
        sender_business_bot: The bot that actually sent the message on behalf
            of the business account.
        sender_tag: Sender tag of the message sender.
        receiver_user: Receiver user of an ephemeral message.
        ephemeral_message_id: Identifier of the ephemeral message.
        guest_query_id: Unique identifier of the guest query the message is a
            response to.
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
        reply_to_checklist_task_id: Identifier of the specific checklist item
            that the message is replying to.
        reply_to_poll_option_id: Persistent identifier of the specific poll
            answer option that the message is replying to.
        via_bot: Bot through which the message was sent.
        guest_bot_caller_user: The user that called the bot in a chat where
            the bot isn't a member.
        guest_bot_caller_chat: The chat whose administrator called the bot.
        edit_date: Date the message was last edited in Unix time.
        has_protected_content: Whether the message cannot be forwarded.
        is_from_offline: Whether the message was sent by an implicit action,
            e.g. as an away or a greeting business message.
        is_paid_post: Whether the message is a paid post and must be paid for
            before it is visible to the recipient.
        media_group_id: The unique identifier of the media message group this
            message belongs to.
        author_signature: Signature of the post author for messages in
            channels, or the custom title of an anonymous group administrator.
        paid_star_count: Number of Telegram Stars paid for this message.
        text: For text messages, the actual UTF-8 text of the message.
        entities: For text messages, special entities like substrings that
            appear in the text.
        link_preview_options: Options used for link preview generation for the
            message, if it is a text message and includes entity links.
        suggested_post_info: Information about the suggested post; for channel
            posts only.
        effect_id: Unique identifier of the message effect added to the
            message.
        rich_message: Rich formatted message content.
        animation: Message is an animation, information about the animation.
        audio: Message is an audio file, information about the file.
        document: Message is a general file, information about the file.
        live_photo: Message is a live photo, information about it.
        paid_media: Message contains paid media, information about it.
        photo: Message is a photo, available sizes of the photo.
        sticker: Message is a sticker, information about it.
        story: Message is a forwarded story, information about the story.
        video: Message is a video, information about the video.
        video_note: Message is a video note, information about the message.
        voice: Message is a voice message, information about the file.
        caption: Caption for the animation, audio, document, live photo, paid
            media, photo, video or voice.
        caption_entities: For messages with a caption, special entities that
            appear in the caption.
        show_caption_above_media: Whether the caption must be shown above the
            message media.
        has_media_spoiler: Whether the message media is covered by a spoiler
            animation.
        checklist: Message is a checklist, information about it.
        contact: Message is a shared contact, information about the contact.
        dice: Message is a dice with random value.
        game: Message is a game, information about it.
        poll: Message is a native poll, information about the poll.
        venue: Message is a venue, information about the venue.
        location: Message is a shared location, information about it.
        new_chat_members: New members added to the group or supergroup.
        left_chat_member: A member removed from the group.
        chat_owner_left: Service message: a user who owned the chat has left
            it or was demoted.
        chat_owner_changed: Service message: the chat owner has changed.
        new_chat_title: A chat title was changed to this value.
        new_chat_photo: A chat photo was changed to this value.
        delete_chat_photo: Service message: the chat photo was deleted.
        group_chat_created: Service message: the group has been created.
        supergroup_chat_created: Service message: the supergroup has been
            created.
        channel_chat_created: Service message: the channel has been created.
        message_auto_delete_timer_changed: Service message: auto-delete timer
            settings changed in the chat.
        migrate_to_chat_id: The group has been migrated to a supergroup with
            the specified identifier.
        migrate_from_chat_id: The supergroup has been migrated from a group
            with the specified identifier.
        pinned_message: Specified message was pinned.
        invoice: Message is an invoice for a payment.
        successful_payment: Message is a service message about a successful
            payment.
        refunded_payment: Service message: a payment was refunded.
        users_shared: Service message: users were shared with the bot.
        chat_shared: Service message: a chat was shared with the bot.
        gift: The message describes a gift received by a user or a chat.
        unique_gift: The message describes a unique gift received by a user or
            a chat.
        gift_upgrade_sent: Service message: a gift was upgraded by a user.
        connected_website: The domain name of the website on which the user
            has logged in.
        write_access_allowed: Service message: the user allowed the bot to
            write messages after adding it to the attachment menu, launching a
            Web App or joining a Telegram Mini App.
        passport_data: Telegram Passport data provided by the user.
        proximity_alert_triggered: Service message: proximity alert triggered
            while sharing Live Location.
        boost_added: Service message: user boosted the chat.
        chat_background_set: Service message: the chat background was set.
        checklist_tasks_done: Service message: some tasks in a checklist were
            marked as done or not done.
        checklist_tasks_added: Service message: tasks were added to a
            checklist.
        community_chat_added: Service message: a community chat was added to
            the business chat.
        community_chat_joined: Service message: a user joined the chat from a
            community.
        community_chat_removed: Service message: a community chat was removed
            from the business chat.
        direct_message_price_changed: Service message: the price for direct
            messages in the chat was changed.
        forum_topic_created: Service message: forum topic created.
        forum_topic_edited: Service message: forum topic edited.
        forum_topic_closed: Service message: forum topic closed.
        forum_topic_reopened: Service message: forum topic reopened.
        general_forum_topic_hidden: Service message: the 'General' forum topic
            hidden.
        general_forum_topic_unhidden: Service message: the 'General' forum
            topic unhidden.
        giveaway_created: Service message: a scheduled giveaway was created.
        giveaway: The message is a scheduled giveaway message.
        giveaway_winners: A giveaway with public winners was completed.
        giveaway_completed: Service message: a giveaway without public winners
            was completed.
        managed_bot_created: Service message: the creation of a bot managed by
            the business account was initiated.
        paid_message_price_changed: Service message: the price for paid
            messages in the chat was changed.
        poll_option_added: Service message: an option was added to a poll.
        poll_option_deleted: Service message: an option was deleted from a
            poll.
        suggested_post_approved: Service message: a suggested post was
            approved for publication.
        suggested_post_approval_failed: Service message: approval of a
            suggested post has failed.
        suggested_post_declined: Service message: a suggested post was
            declined.
        suggested_post_paid: Service message: payment for a suggested post was
            received.
        suggested_post_refunded: Service message: payment for a suggested post
            was refunded.
        video_chat_scheduled: Service message: video chat scheduled.
        video_chat_started: Service message: video chat started.
        video_chat_ended: Service message: video chat ended.
        video_chat_participants_invited: Service message: new participants
            invited to a video chat.
        web_app_data: Service message: data sent by a Web App to the bot.
        reply_markup: Inline keyboard attached to the message.

    Telegram API: https://core.telegram.org/bots/api#message
    """

    message_id: int
    date: int
    chat: Chat
    message_thread_id: int | None = None
    direct_messages_topic: DirectMessagesTopic | None = None
    from_user: User | None = None
    sender_chat: Chat | None = None
    sender_boost_count: int | None = None
    sender_business_bot: User | None = None
    sender_tag: str | None = None
    receiver_user: User | None = None
    ephemeral_message_id: int | None = None
    guest_query_id: str | None = None
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
    reply_to_checklist_task_id: int | None = None
    reply_to_poll_option_id: str | None = None
    via_bot: User | None = None
    guest_bot_caller_user: User | None = None
    guest_bot_caller_chat: Chat | None = None
    edit_date: int | None = None
    has_protected_content: bool | None = None
    is_from_offline: bool | None = None
    is_paid_post: bool | None = None
    media_group_id: str | None = None
    author_signature: str | None = None
    paid_star_count: int | None = None
    text: str | None = None
    entities: list[MessageEntity] | None = None
    link_preview_options: LinkPreviewOptions | None = None
    suggested_post_info: SuggestedPostInfo | None = None
    effect_id: str | None = None
    rich_message: RichMessage | None = None
    animation: Animation | None = None
    audio: Audio | None = None
    document: Document | None = None
    live_photo: LivePhoto | None = None
    paid_media: PaidMediaInfo | None = None
    photo: list[PhotoSize] | None = None
    sticker: Sticker | None = None
    story: Story | None = None
    video: Video | None = None
    video_note: VideoNote | None = None
    voice: Voice | None = None
    caption: str | None = None
    caption_entities: list[MessageEntity] | None = None
    show_caption_above_media: bool | None = None
    has_media_spoiler: bool | None = None
    checklist: Checklist | None = None
    contact: Contact | None = None
    dice: Dice | None = None
    game: Game | None = None
    poll: Poll | None = None
    venue: Venue | None = None
    location: Location | None = None
    new_chat_members: list[User] | None = None
    left_chat_member: User | None = None
    chat_owner_left: ChatOwnerLeft | None = None
    chat_owner_changed: ChatOwnerChanged | None = None
    new_chat_title: str | None = None
    new_chat_photo: list[PhotoSize] | None = None
    delete_chat_photo: bool | None = None
    group_chat_created: bool | None = None
    supergroup_chat_created: bool | None = None
    channel_chat_created: bool | None = None
    message_auto_delete_timer_changed: MessageAutoDeleteTimerChanged | None = None
    migrate_to_chat_id: int | None = None
    migrate_from_chat_id: int | None = None
    pinned_message: Message | None = None
    invoice: Invoice | None = None
    successful_payment: SuccessfulPayment | None = None
    refunded_payment: RefundedPayment | None = None
    users_shared: UsersShared | None = None
    chat_shared: ChatShared | None = None
    gift: GiftInfo | None = None
    unique_gift: UniqueGiftInfo | None = None
    gift_upgrade_sent: GiftInfo | None = None
    connected_website: str | None = None
    write_access_allowed: WriteAccessAllowed | None = None
    passport_data: PassportData | None = None
    proximity_alert_triggered: ProximityAlertTriggered | None = None
    boost_added: ChatBoostAdded | None = None
    chat_background_set: ChatBackground | None = None
    checklist_tasks_done: ChecklistTasksDone | None = None
    checklist_tasks_added: ChecklistTasksAdded | None = None
    community_chat_added: CommunityChatAdded | None = None
    community_chat_joined: CommunityChatJoined | None = None
    community_chat_removed: CommunityChatRemoved | None = None
    direct_message_price_changed: DirectMessagePriceChanged | None = None
    forum_topic_created: ForumTopicCreated | None = None
    forum_topic_edited: ForumTopicEdited | None = None
    forum_topic_closed: ForumTopicClosed | None = None
    forum_topic_reopened: ForumTopicReopened | None = None
    general_forum_topic_hidden: GeneralForumTopicHidden | None = None
    general_forum_topic_unhidden: GeneralForumTopicUnhidden | None = None
    giveaway_created: GiveawayCreated | None = None
    giveaway: Giveaway | None = None
    giveaway_winners: GiveawayWinners | None = None
    giveaway_completed: GiveawayCompleted | None = None
    managed_bot_created: ManagedBotCreated | None = None
    paid_message_price_changed: PaidMessagePriceChanged | None = None
    poll_option_added: PollOptionAdded | None = None
    poll_option_deleted: PollOptionDeleted | None = None
    suggested_post_approved: SuggestedPostApproved | None = None
    suggested_post_approval_failed: SuggestedPostApprovalFailed | None = None
    suggested_post_declined: SuggestedPostDeclined | None = None
    suggested_post_paid: SuggestedPostPaid | None = None
    suggested_post_refunded: SuggestedPostRefunded | None = None
    video_chat_scheduled: VideoChatScheduled | None = None
    video_chat_started: VideoChatStarted | None = None
    video_chat_ended: VideoChatEnded | None = None
    video_chat_participants_invited: VideoChatParticipantsInvited | None = None
    web_app_data: WebAppData | None = None
    reply_markup: InlineKeyboardMarkup | None = None

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


# Close reference cycles with modules that annotate a Message field: their
# ``Message`` hints are lazy strings resolved against their own globals, and
# importing them from here would be circular. Binding goes through the module
# dict because mypy forbids reassigning a class name on an imported module
# ("Cannot assign to a type").
import telebot_py.types.chat as _chat_module  # noqa: E402
import telebot_py.types.chat_full_info as _chat_full_info_module  # noqa: E402
import telebot_py.types.giveaway_types as _giveaway_module  # noqa: E402
import telebot_py.types.message_community as _community_module  # noqa: E402
import telebot_py.types.suggested_post_types as _suggested_module  # noqa: E402

vars(_chat_module)["Message"] = Message
vars(_chat_full_info_module)["Message"] = Message
vars(_community_module)["Message"] = Message
vars(_giveaway_module)["Message"] = Message
vars(_suggested_module)["Message"] = Message
