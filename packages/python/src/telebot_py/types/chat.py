"""Telegram Chat type plus the nested objects only Chat references."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.common import Location

if t.TYPE_CHECKING:  # annotation-only; bound at runtime by message.py
    # The ``as Message`` alias documents this as an explicit re-export: the
    # message module injects the class into this module's globals at runtime
    # so the lazy ``pinned_message`` annotation below can resolve.
    from telebot_py.types.message import Message as Message

CHAT_TYPES = frozenset({"private", "group", "supergroup", "channel"})


@dataclasses.dataclass(frozen=True, slots=True)
class ChatPhoto(TelegramObject):
    """A chat photo in two sizes.

    Attributes:
        small_file_id: File identifier of the small (160x160) chat photo.
        small_file_unique_id: Unique file identifier of the small photo.
        big_file_id: File identifier of the big (640x640) chat photo.
        big_file_unique_id: Unique file identifier of the big photo.

    Telegram API: https://core.telegram.org/bots/api#chatphoto
    """

    small_file_id: str
    small_file_unique_id: str
    big_file_id: str
    big_file_unique_id: str


@dataclasses.dataclass(frozen=True, slots=True)
class Birthdate(TelegramObject):
    """Describes the birthdate of a user.

    Attributes:
        day: Day of the user's birth; 1-31.
        month: Month of the user's birth; 1-12.
        year: Year of the user's birth, when known.

    Telegram API: https://core.telegram.org/bots/api#birthdate
    """

    day: int
    month: int
    year: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class BusinessIntro(TelegramObject):
    """The intro of a Telegram Business account.

    Attributes:
        title: Title of the intro message.
        message: Text of the intro message.
        sticker: Sticker of the intro message (node Sticker is out of scope
            here, so the payload stays raw).

    Telegram API: https://core.telegram.org/bots/api#businessintro
    """

    title: str | None = None
    message: str | None = None
    sticker: object | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class BusinessLocation(TelegramObject):
    """The location of a Telegram Business account.

    Attributes:
        address: Address of the business.
        location: Location of the business, when available.

    Telegram API: https://core.telegram.org/bots/api#businesslocation
    """

    address: str
    location: Location | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class BusinessOpeningHoursInterval(TelegramObject):
    """One interval during which a business is open.

    Attributes:
        opening_minute: The minute's sequence number in a week (0-10079) when
            the business opens in UTC+0.
        closing_minute: The minute's sequence number in a week (1-10080) when
            the business closes in UTC+0.

    Telegram API: https://core.telegram.org/bots/api#businessopeninghoursinterval
    """

    opening_minute: int
    closing_minute: int


@dataclasses.dataclass(frozen=True, slots=True)
class BusinessOpeningHours(TelegramObject):
    """The opening hours of a Telegram Business account.

    Attributes:
        time_zone_name: Unique name of the time zone.
        opening_hours: List of time intervals during which the business is
            open.

    Telegram API: https://core.telegram.org/bots/api#businessopeninghours
    """

    time_zone_name: str
    opening_hours: list[BusinessOpeningHoursInterval]


@dataclasses.dataclass(frozen=True, slots=True)
class ChatLocation(TelegramObject):
    """A physical location to which a supergroup is connected.

    Attributes:
        location: The physical location to which the supergroup is connected.
        address: Location address; 1-64 characters, as defined by the chat
            owner.

    Telegram API: https://core.telegram.org/bots/api#chatlocation
    """

    location: Location
    address: str


@dataclasses.dataclass(frozen=True, slots=True)
class ChatPermissions(TelegramObject):
    """Actions a non-administrator user is allowed to take in a chat.

    All fields are optional; an unset field means "server default".

    Attributes:
        can_send_messages: Whether the user may send text messages, contacts,
            locations and venues.
        can_send_audios: Whether the user may send audios.
        can_send_documents: Whether the user may send documents.
        can_send_photos: Whether the user may send photos.
        can_send_videos: Whether the user may send videos.
        can_send_video_notes: Whether the user may send video notes.
        can_send_voice_notes: Whether the user may send voice notes.
        can_send_polls: Whether the user may send polls.
        can_send_other_messages: Whether the user may send animations, games,
            stickers and use inline bots.
        can_add_web_page_previews: Whether the user may add web page previews
            to their messages.
        can_change_info: Whether the user may change the chat title, photo
            and other settings.
        can_invite_users: Whether the user may invite new users to the chat.
        can_pin_messages: Whether the user may pin messages.
        can_manage_topics: Whether the user may create, rename, close, and
            reopen forum topics.

    Telegram API: https://core.telegram.org/bots/api#chatpermissions
    """

    can_send_messages: bool | None = None
    can_send_audios: bool | None = None
    can_send_documents: bool | None = None
    can_send_photos: bool | None = None
    can_send_videos: bool | None = None
    can_send_video_notes: bool | None = None
    can_send_voice_notes: bool | None = None
    can_send_polls: bool | None = None
    can_send_other_messages: bool | None = None
    can_add_web_page_previews: bool | None = None
    can_change_info: bool | None = None
    can_invite_users: bool | None = None
    can_pin_messages: bool | None = None
    can_manage_topics: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ChatAdministratorRights(TelegramObject):
    """The rights of an administrator in a chat.

    Telegram may omit individual permission fields from the payload; omitted
    permissions default to ``False``.

    Attributes:
        is_anonymous: Whether the user's presence in the chat is hidden.
        can_manage_chat: Whether the administrator can access the chat event
            log, get the boost list, see hidden members, etc.
        can_delete_messages: Whether the administrator can delete messages of
            other users.
        can_manage_video_chats: Whether the administrator can manage video
            chats.
        can_restrict_members: Whether the administrator can restrict, ban or
            unban chat members.
        can_promote_members: Whether the administrator can add new
            administrators with a subset of their own privileges.
        can_change_info: Whether the user is allowed to change the chat title,
            photo and other settings.
        can_invite_users: Whether the user is allowed to invite new users to
            the chat.
        can_post_stories: Whether the administrator can post stories to the
            chat.
        can_edit_stories: Whether the administrator can edit stories posted by
            other users.
        can_delete_stories: Whether the administrator can delete stories
            posted by other users.
        can_post_messages: Whether the administrator can post messages in the
            channel, or access channel statistics.
        can_edit_messages: Whether the administrator can edit messages of
            other users.
        can_pin_messages: Whether the user is allowed to pin messages.
        can_manage_topics: Whether the user is allowed to create, rename,
            close, and reopen forum topics.
        can_manage_direct_messages: Whether the administrator can manage
            direct messages of the channel.
        can_manage_tags: Whether the administrator can edit the tags of
            regular members.
        can_send_welcome_messages: Whether the administrator can manage chat
            welcome messages (Bot API 10.3+).

    Telegram API: https://core.telegram.org/bots/api#chatadministratorrights
    """

    is_anonymous: bool
    can_manage_chat: bool
    can_delete_messages: bool = dataclasses.field(default=False)
    can_manage_video_chats: bool = dataclasses.field(default=False)
    can_restrict_members: bool = dataclasses.field(default=False)
    can_promote_members: bool = dataclasses.field(default=False)
    can_change_info: bool = dataclasses.field(default=False)
    can_invite_users: bool = dataclasses.field(default=False)
    can_post_stories: bool | None = None
    can_edit_stories: bool | None = None
    can_delete_stories: bool | None = None
    can_post_messages: bool | None = None
    can_edit_messages: bool | None = None
    can_pin_messages: bool | None = None
    can_manage_topics: bool | None = None
    can_manage_direct_messages: bool | None = None
    can_manage_tags: bool | None = None
    can_send_welcome_messages: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Chat(TelegramObject):
    """A Telegram chat.

    Attributes:
        id: Unique identifier for this chat (integer, or a channel username
            string where the Bot API allows it).
        type: Type of chat: one of ``private``, ``group``, ``supergroup``,
            or ``channel``.
        title: Title, for supergroups, channels and group chats.
        username: Username, for private chats, supergroups and channels.
        first_name: First name of the other party in a private chat.
        last_name: Last name of the other party in a private chat.
        is_forum: Whether the supergroup chat is a forum (topics enabled).
        photo: Chat photo.
        active_usernames: If non-empty, the list of all active chat usernames.
        birthdate: For private chats, the date of birth of the user.
        business_intro: For private chats with business accounts, the intro.
        business_location: For private chats with business accounts, the
            location of the business.
        business_opening_hours: For private chats with business accounts, the
            opening hours of the business.
        personal_chat: For private chats, the personal channel of the user.
        available_reactions: List of available reactions allowed in the chat
            (reaction payloads kept raw per node typing).
        accent_color_id: Identifier of the accent color for the chat name and
            backgrounds.
        background_custom_emoji_id: Custom emoji identifier chosen for the
            chat background.
        profile_accent_color_id: Identifier of the accent color for the
            chat's profile.
        profile_background_custom_emoji_id: Custom emoji identifier chosen
            for the chat profile background.
        emoji_status_custom_emoji_id: Custom emoji identifier of the emoji
            status.
        emoji_status_expiration_date: Expiration date of the emoji status of
            the chat partner in Unix time.
        bio: Bio of the other party in a private chat.
        has_private_forwards: Whether privacy settings of the other party in
            the private chat forbid forwarding messages.
        has_restricted_voice_and_video_messages: Whether privacy settings of
            the other party restrict sending voice and video notes.
        join_to_send_messages: Whether users need to join the supergroup
            before they can send messages.
        join_by_request: Whether all new members must be approved by chat
            administrators.
        description: Description, for groups, supergroups and channel chats.
        invite_link: Primary invite link, for groups, supergroups and channel
            chats.
        pinned_message: The most recent pinned message (by sending date).
        permissions: Default chat member permissions, for groups and
            supergroups.
        slow_mode_delay: For supergroups, the minimum allowed interval between
            messages in seconds.
        unrestrict_boost_count: For supergroups, the minimum number of boosts
            needed to bypass slow mode.
        message_auto_delete_time: Seconds after which messages are
            automatically deleted in the chat.
        has_aggressive_anti_spam_enabled: Whether aggressive anti-spam checks
            are enabled in the supergroup.
        has_hidden_members: Whether non-administrators can only see the list
            of bot administrators in the chat.
        has_protected_content: Whether messages from the chat cannot be
            forwarded to other chats.
        has_visible_history: Whether new chat members will see historical
            messages.
        sticker_set_name: For supergroups, name of the group sticker set.
        can_set_sticker_set: Whether the bot can change the group sticker set.
        custom_emoji_sticker_set_name: For supergroups, name of the custom
            emoji sticker set.
        linked_chat_id: Unique identifier of the linked discussion chat for
            channels.
        location: For supergroups, the location to which the supergroup is
            connected.

    Telegram API: https://core.telegram.org/bots/api#chat
    """

    id: int | str
    type: str
    title: str | None = None
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    is_forum: bool | None = None
    photo: ChatPhoto | None = None
    active_usernames: list[str] | None = None
    birthdate: Birthdate | None = None
    business_intro: BusinessIntro | None = None
    business_location: BusinessLocation | None = None
    business_opening_hours: BusinessOpeningHours | None = None
    personal_chat: Chat | None = None
    available_reactions: list[object] | None = None
    accent_color_id: int | None = None
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

    def __post_init__(self) -> None:
        if self.type not in CHAT_TYPES:
            msg = f"invalid chat type: {self.type!r}"
            raise ValueError(msg)


# ``Chat.pinned_message`` references Message, whose module imports Chat back.
# message.py closes the cycle by binding its Message class into this module's
# namespace after definition, so the string annotation resolves lazily in
# ``get_type_hints`` without any runtime import here.
