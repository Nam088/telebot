"""Chat membership types: members, administrators, invites, join requests."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class ChatInviteLink(TelegramObject):
    """An invite link for a chat.

    Attributes:
        invite_link: The invite link as a string.
        creator: Creator of the link.
        creates_join_request: Whether users joining via the link need to be
            approved by chat administrators.
        is_primary: Whether the link is primary.
        is_revoked: Whether the link is revoked.
        name: Invite link name.
        expire_date: Unix time when the link will expire or has expired.
        member_limit: Maximum number of users that can be members via this
            link simultaneously; 1-99999.
        pending_join_request_count: Number of pending join requests created
            using this link.
        subscription_period: Seconds the subscription will be active for.
        subscription_price: Telegram Stars a user must pay initially and
            after each subscription period.

    Telegram API: https://core.telegram.org/bots/api#chatinvitelink
    """

    invite_link: str
    creator: User
    creates_join_request: bool
    is_primary: bool
    is_revoked: bool
    name: str | None = None
    expire_date: int | None = None
    member_limit: int | None = None
    pending_join_request_count: int | None = None
    subscription_period: int | None = None
    subscription_price: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ChatMember(TelegramObject):
    """Information about one member of a chat.

    The node reference models ChatMember as one generic interface covering all
    six statuses (``creator``, ``administrator``, ``member``, ``restricted``,
    ``left``, ``kicked``) with status-specific fields optional; Python mirrors
    that shape exactly, plus :class:`ChatMemberAdministrator`.

    Attributes:
        status: The member's status in the chat.
        user: Information about the user.
        custom_title: Custom title for this user (administrators only).
        is_anonymous: Whether the user's presence in the chat is hidden
            (administrators only).
        can_be_edited: Whether the bot is allowed to edit administrator
            privileges of that user.
        can_manage_chat: Whether the administrator can access the chat event
            log, get the boost list, etc.
        can_delete_messages: Whether the administrator can delete messages of
            other users.
        can_manage_video_chats: Whether the administrator can manage video
            chats.
        can_restrict_members: Whether the administrator can restrict, ban or
            unban chat members.
        can_promote_members: Whether the administrator can add new
            administrators.
        can_change_info: Whether the user may change the chat title, photo
            and other settings.
        can_invite_users: Whether the user may invite new users to the chat.
        can_post_stories: Whether the administrator can post stories.
        can_edit_stories: Whether the administrator can edit stories posted
            by other users.
        can_delete_stories: Whether the administrator can delete stories
            posted by other users.
        can_post_messages: Whether the administrator can post messages in the
            channel.
        can_edit_messages: Whether the administrator can edit messages of
            other users.
        can_pin_messages: Whether the user may pin messages.
        can_manage_topics: Whether the user may create, rename, close, and
            reopen forum topics.
        can_send_welcome_messages: Whether the administrator can manage chat
            welcome messages (Bot API 10.3+).
        until_date: Unix time when restrictions will be lifted for this user.

    Telegram API: https://core.telegram.org/bots/api#chatmember
    """

    status: str
    user: User
    custom_title: str | None = None
    is_anonymous: bool | None = None
    can_be_edited: bool | None = None
    can_manage_chat: bool | None = None
    can_delete_messages: bool | None = None
    can_manage_video_chats: bool | None = None
    can_restrict_members: bool | None = None
    can_promote_members: bool | None = None
    can_change_info: bool | None = None
    can_invite_users: bool | None = None
    can_post_stories: bool | None = None
    can_edit_stories: bool | None = None
    can_delete_stories: bool | None = None
    can_post_messages: bool | None = None
    can_edit_messages: bool | None = None
    can_pin_messages: bool | None = None
    can_manage_topics: bool | None = None
    can_send_welcome_messages: bool | None = None
    until_date: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ChatMemberAdministrator(TelegramObject):
    """A chat member that has some additional privileges.

    Attributes:
        status: The member's status in the chat, always 'administrator'.
        user: Information about the user.
        can_be_edited: Whether the bot is allowed to edit administrator
            privileges of that user.
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
        can_change_info: Whether the user may change the chat title, photo
            and other settings.
        can_invite_users: Whether the user may invite new users to the chat.
        can_post_stories: Whether the administrator can post stories.
        can_edit_stories: Whether the administrator can edit stories posted
            by other users.
        can_delete_stories: Whether the administrator can delete stories
            posted by other users.
        can_post_messages: Whether the administrator can post messages in the
            channel.
        can_edit_messages: Whether the administrator can edit messages of
            other users.
        can_pin_messages: Whether the user may pin messages.
        can_manage_topics: Whether the user may create, rename, close, and
            reopen forum topics.
        can_manage_direct_messages: Whether the administrator can manage
            direct messages of the channel.
        can_manage_tags: Whether the administrator can edit the tags of
            regular members.
        can_send_welcome_messages: Whether the administrator can manage chat
            welcome messages (Bot API 10.3+).
        custom_title: Custom title for this user.

    Telegram API: https://core.telegram.org/bots/api#chatmemberadministrator
    """

    status: str
    user: User
    can_be_edited: bool
    is_anonymous: bool
    can_manage_chat: bool
    can_delete_messages: bool
    can_manage_video_chats: bool
    can_restrict_members: bool
    can_promote_members: bool
    can_change_info: bool
    can_invite_users: bool
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
    custom_title: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ChatMemberUpdated(TelegramObject):
    """A change in the status of a chat member.

    Attributes:
        chat: Chat, which member status was updated.
        from_user: Performer of the action which resulted in the change.
        date: Date the change was done in Unix time.
        old_chat_member: Previous information about the chat member.
        new_chat_member: New information about the chat member.
        invite_link: Chat invite link which was used by the user to join the
            chat.
        via_join_request: Whether the user joined the chat after sending a
            direct join request and being approved.
        via_chat_folder_invite_link: Whether the user joined the chat via a
            chat folder invite link.

    Telegram API: https://core.telegram.org/bots/api#chatmemberupdated
    """

    chat: Chat
    from_user: User
    date: int
    old_chat_member: ChatMember
    new_chat_member: ChatMember
    invite_link: ChatInviteLink | None = None
    via_join_request: bool | None = None
    via_chat_folder_invite_link: bool | None = None

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


@dataclasses.dataclass(frozen=True, slots=True)
class ChatJoinRequest(TelegramObject):
    """A join request sent to a chat.

    Attributes:
        chat: Chat to which the request was sent.
        from_user: User that sent the join request.
        user_chat_id: Identifier of a private chat with the user who sent the
            join request.
        date: Date the request was sent in Unix time.
        bio: Bio of the user.
        invite_link: Chat invite link that was used by the user to send the
            join request.
        query_id: Identifier of the join request query; for bots assigned to
            process join requests only.

    Telegram API: https://core.telegram.org/bots/api#chatjoinrequest
    """

    chat: Chat
    from_user: User
    user_chat_id: int
    date: int
    bio: str | None = None
    invite_link: ChatInviteLink | None = None
    query_id: str | None = None

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


@dataclasses.dataclass(frozen=True, slots=True)
class Community(TelegramObject):
    """A community (a group of chats).

    Attributes:
        id: Unique identifier for this community.
        name: Name of the community.

    Telegram API: https://core.telegram.org/bots/api#community
    """

    id: int
    name: str


@dataclasses.dataclass(frozen=True, slots=True)
class CommunityChatJoined(TelegramObject):
    """Service message about a chat being joined by a user from a community.

    Attributes:
        community: The community from which the chat was joined.

    Telegram API: https://core.telegram.org/bots/api#communitychatjoined
    """

    community: Community
