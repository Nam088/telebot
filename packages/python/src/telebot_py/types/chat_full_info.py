"""The :class:`ChatFullInfo` object ``getChat`` returns, plus what only it uses.

Bot API 7.0 split the documented ``Chat`` object in two: ``Chat`` keeps the
eight identity fields that travel inside every payload, and ``ChatFullInfo``
carries the 53 fields that only the ``getChat`` method (and the chat-management
methods echoing it) returns. Python models both; a payload parsed as ``Chat``
silently drops the 45 fields that only exist on this type.
"""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import (
    CHAT_TYPES,
    Birthdate,
    BusinessIntro,
    BusinessLocation,
    BusinessOpeningHours,
    Chat,
    ChatLocation,
    ChatPermissions,
    ChatPhoto,
)
from telebot_py.types.chat_members import Community
from telebot_py.types.gifts import AcceptedGiftTypes, UniqueGiftColors
from telebot_py.types.media import Audio
from telebot_py.types.reactions import (
    ReactionTypeCustomEmoji,
    ReactionTypeEmoji,
    ReactionTypePaid,
)
from telebot_py.types.user import User

if t.TYPE_CHECKING:  # annotation-only; bound at runtime by message.py
    # The ``as Message`` alias documents this as an explicit re-export: the
    # message module injects the class into this module's globals at runtime
    # so the lazy ``pinned_message`` annotation below can resolve.
    from telebot_py.types.message import Message as Message


@dataclasses.dataclass(frozen=True, slots=True)
class UserRating(TelegramObject):
    """The rating of a user based on their Telegram Star spendings.

    Attributes:
        level: Current level of the user, indicating their reliability when
            purchasing digital goods and services. A higher level suggests a
            more trustworthy customer.
        rating: Numerical value of the user's rating; the higher the rating,
            the better.
        current_level_rating: The rating value required to get the current
            level.
        next_level_rating: The rating value required to get to the next level;
            omitted if the maximum level was reached.

    Telegram API: https://core.telegram.org/bots/api#userrating
    """

    level: int
    rating: int
    current_level_rating: int
    next_level_rating: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ChatFullInfo(TelegramObject):
    """Full information about a chat, as returned by the ``getChat`` method.

    Extends :class:`~telebot_py.types.Chat` with the fields that only the
    ``getChat`` response carries. The five fields the docs mark as required
    (``id``, ``type``, ``accent_color_id``, ``max_reaction_count`` and
    ``accepted_gift_types``) are declared first because Python dataclasses
    cannot interleave defaulted fields with required ones; the remaining
    fields keep their documented order.

    Attributes:
        id: Unique identifier for this chat. This number may have more than 32
            significant bits, but it has at most 52 significant bits, so a
            signed 64-bit integer type is safe for storing it.
        type: Type of the chat, can be either "private", "group", "supergroup"
            or "channel".
        accent_color_id: Identifier of the accent color for the chat name and
            backgrounds of the chat photo, reply header, and link preview.
        max_reaction_count: The maximum number of reactions that can be set on
            a message in the chat.
        accepted_gift_types: Information about types of gifts that are accepted
            by the chat or by the corresponding user for private chats.
        title: Title, for supergroups, channels and group chats.
        username: Username, for private chats, supergroups and channels if
            available.
        first_name: First name of the other party in a private chat.
        last_name: Last name of the other party in a private chat.
        is_forum: True, if the supergroup chat is a forum (has topics enabled).
        is_direct_messages: True, if the chat is the direct messages chat of a
            channel.
        photo: Chat photo.
        active_usernames: If non-empty, the list of all active chat usernames;
            for private chats, supergroups and channels.
        birthdate: For private chats, the date of birth of the user.
        business_intro: For private chats with business accounts, the intro of
            the business.
        business_location: For private chats with business accounts, the
            location of the business.
        business_opening_hours: For private chats with business accounts, the
            opening hours of the business.
        personal_chat: For private chats, the personal channel of the user.
        parent_chat: For direct messages chats only, information about the
            corresponding channel chat.
        available_reactions: List of available reactions allowed in the chat.
            If omitted, then all emoji reactions are allowed.
        background_custom_emoji_id: Custom emoji identifier of the emoji chosen
            by the chat for the reply header and link preview background.
        profile_accent_color_id: Identifier of the accent color for the chat's
            profile background.
        profile_background_custom_emoji_id: Custom emoji identifier of the
            emoji chosen by the chat for its profile background.
        emoji_status_custom_emoji_id: Custom emoji identifier of the emoji
            status of the chat or the other party in a private chat.
        emoji_status_expiration_date: Expiration date of the emoji status of
            the chat or the other party in a private chat, in Unix time, if
            any.
        bio: Bio of the other party in a private chat.
        has_private_forwards: True, if privacy settings of the other party in
            the private chat allows to use ``t.me/userid?id=<chat_id>`` links
            only in chats with the user.
        has_restricted_voice_and_video_messages: True, if the privacy settings
            of the other party restrict sending voice and video note messages
            in the private chat.
        join_to_send_messages: True, if users need to join the supergroup
            before they can send messages.
        join_by_request: True, if all users directly joining the supergroup
            without using an invite link need to be approved by supergroup
            administrators.
        description: Description, for groups, supergroups and channel chats.
        invite_link: Primary invite link, for groups, supergroups and channel
            chats.
        pinned_message: The most recent pinned message (by sending date).
        permissions: Default chat member permissions, for groups and
            supergroups.
        can_send_paid_media: True, if paid media messages can be sent or
            forwarded to the channel chat. The field is currently only
            applicable to direct messages chats.
        slow_mode_delay: For supergroups, the minimum allowed delay between
            consecutive messages sent by each unprivileged user, in seconds.
        unrestrict_boost_count: For supergroups, the minimum number of boosts
            that a non-administrator user needs to receive to be allowed to
            bypass slow mode.
        message_auto_delete_time: The time after which all messages sent to the
            chat will be automatically deleted, in seconds.
        has_aggressive_anti_spam_enabled: True, if aggressive anti-spam checks
            are enabled in the supergroup.
        has_hidden_members: True, if non-administrators can only get the list
            of bots and administrators in the chat.
        has_protected_content: True, if messages from the chat can't be
            forwarded to other chats.
        has_visible_history: True, if new chat members will have access to old
            messages; available only to chat administrators.
        sticker_set_name: For supergroups, name of the group sticker set.
        can_set_sticker_set: True, if the bot can change the group sticker set.
        custom_emoji_sticker_set_name: For supergroups, the name of the group's
            custom emoji sticker set.
        linked_chat_id: Unique identifier for the linked chat, i.e. the
            discussion group identifier for a channel and vice versa; for
            supergroups and channel chats.
        location: For supergroups, the location to which the supergroup is
            connected.
        rating: For private chats, the rating of the user if any.
        first_profile_audio: For private chats, the first audio added to the
            profile of the user.
        unique_gift_colors: The color scheme based on a unique gift that must
            be used for the chat's name, members, and messages.
        paid_message_star_count: The number of Telegram Stars a general user
            has to pay to send a message to the chat; for channels and direct
            messages chats only.
        guard_bot: The bot that processes join request queries in the chat.
        community: The Community to which the chat belongs.

    Telegram API: https://core.telegram.org/bots/api#chatfullinfo
    """

    id: int
    type: str
    accent_color_id: int
    max_reaction_count: int
    accepted_gift_types: AcceptedGiftTypes
    title: str | None = None
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    is_forum: bool | None = None
    is_direct_messages: bool | None = None
    photo: ChatPhoto | None = None
    active_usernames: list[str] | None = None
    birthdate: Birthdate | None = None
    business_intro: BusinessIntro | None = None
    business_location: BusinessLocation | None = None
    business_opening_hours: BusinessOpeningHours | None = None
    personal_chat: Chat | None = None
    parent_chat: Chat | None = None
    available_reactions: (
        list[ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid] | None
    ) = None
    background_custom_emoji_id: str | None = None
    profile_accent_color_id: int | None = None
    profile_background_custom_emoji_id: str | None = None
    emoji_status_custom_emoji_id: str | None = None
    emoji_status_expiration_date: int | None = None
    bio: str | None = None
    has_private_forwards: bool | None = None
    has_restricted_voice_and_video_messages: bool | None = None
    join_to_send_messages: bool | None = None
    join_by_request: bool | None = None
    description: str | None = None
    invite_link: str | None = None
    pinned_message: Message | None = None
    permissions: ChatPermissions | None = None
    can_send_paid_media: bool | None = None
    slow_mode_delay: int | None = None
    unrestrict_boost_count: int | None = None
    message_auto_delete_time: int | None = None
    has_aggressive_anti_spam_enabled: bool | None = None
    has_hidden_members: bool | None = None
    has_protected_content: bool | None = None
    has_visible_history: bool | None = None
    sticker_set_name: str | None = None
    can_set_sticker_set: bool | None = None
    custom_emoji_sticker_set_name: str | None = None
    linked_chat_id: int | None = None
    location: ChatLocation | None = None
    rating: UserRating | None = None
    first_profile_audio: Audio | None = None
    unique_gift_colors: UniqueGiftColors | None = None
    paid_message_star_count: int | None = None
    guard_bot: User | None = None
    community: Community | None = None

    def __post_init__(self) -> None:
        if self.type not in CHAT_TYPES:
            msg = f"invalid chat type: {self.type!r}"
            raise ValueError(msg)
