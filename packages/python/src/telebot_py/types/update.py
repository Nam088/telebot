"""Telegram Update type with the full node (Bot API 10.3) payload set."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.business import (
    BusinessConnection,
    BusinessMessagesDeleted,
    ChatBoostRemoved,
    ChatBoostUpdated,
)
from telebot_py.types.callback_query import CallbackQuery
from telebot_py.types.chat import Chat
from telebot_py.types.chat_members import ChatJoinRequest, ChatMemberUpdated
from telebot_py.types.common import ChosenInlineResult, InlineQuery, Poll
from telebot_py.types.message import Message
from telebot_py.types.message_extras import PollAnswer
from telebot_py.types.payments import (
    PreCheckoutQuery,
    PurchasedPaidMedia,
    ShippingQuery,
)
from telebot_py.types.reactions import (
    MessageReactionCountUpdated,
    MessageReactionUpdated,
)
from telebot_py.types.user import User

_PAYLOAD_FIELDS: tuple[str, ...] = (
    "message",
    "edited_message",
    "channel_post",
    "edited_channel_post",
    "business_connection",
    "business_message",
    "edited_business_message",
    "deleted_business_messages",
    "message_reaction",
    "message_reaction_count",
    "inline_query",
    "chosen_inline_result",
    "callback_query",
    "shipping_query",
    "pre_checkout_query",
    "poll",
    "poll_answer",
    "my_chat_member",
    "chat_member",
    "chat_join_request",
    "chat_boost",
    "removed_chat_boost",
    "purchased_paid_media",
    "stopped_message_generation",
)


@dataclasses.dataclass(frozen=True, slots=True)
class MessageGenerationStopped(TelegramObject):
    """A user asked the bot to stop generating a message (Bot API 10.3+).

    Attributes:
        chat: Chat in which the message is generated.
        draft_id: Unique identifier of the message draft which was stopped.
        message_thread_id: Unique identifier of the message thread in which
            the message is generated.
    """

    chat: Chat
    draft_id: int
    message_thread_id: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Update(TelegramObject):
    """An incoming update from Telegram.

    Exactly one payload field must be set; constructing an update with zero
    or more than one payload raises ``ValueError``.

    Attributes:
        update_id: The update's unique identifier, monotonically increasing.
        message: New incoming message of any kind.
        edited_message: New version of a message that is known to the bot.
        channel_post: New incoming channel post of any kind.
        edited_channel_post: New version of a channel post.
        business_connection: The bot was connected to or disconnected from a
            business account, or a user edited an existing connection.
        business_message: New message from a connected business account.
        edited_business_message: New version of a message from a connected
            business account.
        deleted_business_messages: Messages were deleted from a connected
            business account.
        message_reaction: A reaction to a message was changed by a user.
        message_reaction_count: Reactions to a message with anonymous
            reactions were changed.
        inline_query: New incoming inline query.
        chosen_inline_result: The result of an inline query that was chosen
            by a user and sent to their chat partner.
        callback_query: New incoming callback query.
        shipping_query: New incoming shipping query (flexible-price invoices).
        pre_checkout_query: New incoming pre-checkout query.
        poll: New poll state (stopped polls and polls sent by the bot only).
        poll_answer: A user changed their answer in a non-anonymous poll.
        my_chat_member: The bot's chat member status was updated in a chat.
        chat_member: A chat member's status was updated in a chat.
        chat_join_request: A request to join the chat has been sent.
        chat_boost: A chat boost was added or changed.
        removed_chat_boost: A boost was removed from a chat.
        purchased_paid_media: A user purchased paid media with Telegram Stars.
        stopped_message_generation: A user asked the bot to stop the
            generation of a message (Bot API 10.3+).
    """

    update_id: int
    message: Message | None = None
    edited_message: Message | None = None
    channel_post: Message | None = None
    edited_channel_post: Message | None = None
    business_connection: BusinessConnection | None = None
    business_message: Message | None = None
    edited_business_message: Message | None = None
    deleted_business_messages: BusinessMessagesDeleted | None = None
    message_reaction: MessageReactionUpdated | None = None
    message_reaction_count: MessageReactionCountUpdated | None = None
    inline_query: InlineQuery | None = None
    chosen_inline_result: ChosenInlineResult | None = None
    callback_query: CallbackQuery | None = None
    shipping_query: ShippingQuery | None = None
    pre_checkout_query: PreCheckoutQuery | None = None
    poll: Poll | None = None
    poll_answer: PollAnswer | None = None
    my_chat_member: ChatMemberUpdated | None = None
    chat_member: ChatMemberUpdated | None = None
    chat_join_request: ChatJoinRequest | None = None
    chat_boost: ChatBoostUpdated | None = None
    removed_chat_boost: ChatBoostRemoved | None = None
    purchased_paid_media: PurchasedPaidMedia | None = None
    stopped_message_generation: MessageGenerationStopped | None = None

    def __post_init__(self) -> None:
        count = sum(getattr(self, name) is not None for name in _PAYLOAD_FIELDS)
        if count != 1:
            msg = f"Update must contain exactly one payload field, found {count}"
            raise ValueError(msg)

    @property
    def effective_message(self) -> Message | None:
        """The message carried by this update, regardless of payload type."""
        return (
            self.message
            or self.edited_message
            or self.channel_post
            or self.edited_channel_post
            or self.business_message
            or self.edited_business_message
            or (self.callback_query.message if self.callback_query else None)
        )

    @property
    def effective_user(self) -> User | None:
        """The user who triggered this update, when known."""
        message = self.effective_message
        if message is not None and message.from_user is not None:
            return message.from_user
        if self.callback_query is not None:
            return self.callback_query.from_user
        if self.inline_query is not None:
            return self.inline_query.from_user
        if self.pre_checkout_query is not None:
            return self.pre_checkout_query.from_user
        if self.chat_member is not None:
            return self.chat_member.from_user
        if self.my_chat_member is not None:
            return self.my_chat_member.from_user
        return None

    @property
    def effective_chat(self) -> Chat | None:
        """The chat this update happened in, when known."""
        message = self.effective_message
        if message is not None:
            return message.chat
        if self.chat_member is not None:
            return self.chat_member.chat
        if self.my_chat_member is not None:
            return self.my_chat_member.chat
        return None
