"""Chat member Bot API methods (parity with packages/go/pkg/bot/members.go)."""

from __future__ import annotations

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    parse_result,
    to_wire,
)
from telebot_py.types.business import UserChatBoosts
from telebot_py.types.chat_members import ChatMember


class MembersMixin(Requester):
    """Bot methods for inspecting and managing individual chat members."""

    async def get_chat_member(self, chat_id: int | str, user_id: int) -> ChatMember:
        """Get information about one member of a chat.

        Example:
            >>> member = await bot.get_chat_member("@supergroup", 42)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            user_id: Unique identifier of the target user.

        Returns:
            The ChatMember describing the user's membership.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, user_id=user_id)
        return parse_result(ChatMember, await self.request("getChatMember", payload))

    async def promote_chat_member(
        self,
        chat_id: int | str,
        user_id: int,
        *,
        is_anonymous: bool | None = None,
        can_manage_chat: bool | None = None,
        can_post_messages: bool | None = None,
        can_edit_messages: bool | None = None,
        can_delete_messages: bool | None = None,
        can_post_stories: bool | None = None,
        can_edit_stories: bool | None = None,
        can_delete_stories: bool | None = None,
        can_manage_video_chats: bool | None = None,
        can_restrict_members: bool | None = None,
        can_promote_members: bool | None = None,
        can_change_info: bool | None = None,
        can_invite_users: bool | None = None,
        can_pin_messages: bool | None = None,
        can_manage_topics: bool | None = None,
        can_manage_direct_messages: bool | None = None,
        can_manage_tags: bool | None = None,
        can_send_welcome_messages: bool | None = None,
    ) -> bool:
        """Promote or demote a user in a supergroup or a channel.

        To demote, pass the applicable rights as False.

        Example:
            >>> ok = await bot.promote_chat_member(-100, 42, can_delete_messages=True)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            user_id: Unique identifier of the target user.
            is_anonymous: Pass True if the administrator's presence is hidden.
            can_manage_chat: Access to chat statistics and other admin features.
            can_post_messages: Can post messages in the channel.
            can_edit_messages: Can edit messages of other users.
            can_delete_messages: Can delete messages of other users.
            can_post_stories: Can post stories.
            can_edit_stories: Can edit posted stories.
            can_delete_stories: Can delete stories posted by others.
            can_manage_video_chats: Can manage video chats.
            can_restrict_members: Can restrict, ban, or unban members.
            can_promote_members: Can add new administrators.
            can_change_info: Can change the chat title, photo, and settings.
            can_invite_users: Can invite new users to the chat.
            can_pin_messages: Can pin messages (groups only).
            can_manage_topics: Can manage forum topics.
            can_manage_direct_messages: Can manage direct messages.
            can_manage_tags: Can manage tags.
            can_send_welcome_messages: Can send welcome messages.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            user_id=user_id,
            is_anonymous=is_anonymous,
            can_manage_chat=can_manage_chat,
            can_post_messages=can_post_messages,
            can_edit_messages=can_edit_messages,
            can_delete_messages=can_delete_messages,
            can_post_stories=can_post_stories,
            can_edit_stories=can_edit_stories,
            can_delete_stories=can_delete_stories,
            can_manage_video_chats=can_manage_video_chats,
            can_restrict_members=can_restrict_members,
            can_promote_members=can_promote_members,
            can_change_info=can_change_info,
            can_invite_users=can_invite_users,
            can_pin_messages=can_pin_messages,
            can_manage_topics=can_manage_topics,
            can_manage_direct_messages=can_manage_direct_messages,
            can_manage_tags=can_manage_tags,
            can_send_welcome_messages=can_send_welcome_messages,
        )
        return parse_flag(await self.request("promoteChatMember", payload))

    async def restrict_chat_member(
        self,
        chat_id: int | str,
        user_id: int,
        permissions: MarkupLike,
        *,
        use_independent_chat_permissions: bool | None = None,
        until_date: int | None = None,
    ) -> bool:
        """Restrict a user in a supergroup.

        Example:
            >>> ok = await bot.restrict_chat_member(-100, 42, {"can_send_polls": False})

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            user_id: Unique identifier of the target user.
            permissions: New user permissions as a ChatPermissions dict or
                ``to_dict`` object.
            use_independent_chat_permissions: Pass True if permissions apply
                independently of chat-level permissions.
            until_date: Point in time (Unix timestamp) when restrictions are
                lifted.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            user_id=user_id,
            permissions=to_wire(permissions),
            use_independent_chat_permissions=use_independent_chat_permissions,
            until_date=until_date,
        )
        return parse_flag(await self.request("restrictChatMember", payload))

    async def set_chat_administrator_custom_title(
        self, chat_id: int | str, user_id: int, custom_title: str
    ) -> bool:
        """Set a custom title for a bot-promoted administrator in a supergroup.

        Example:
            >>> ok = await bot.set_chat_administrator_custom_title(-100, 42, "Moderator")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            user_id: Unique identifier of the target user.
            custom_title: New custom title; 0-16 characters, no emoji.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, user_id=user_id, custom_title=custom_title)
        return parse_flag(await self.request("setChatAdministratorCustomTitle", payload))

    async def ban_chat_sender_chat(self, chat_id: int | str, sender_chat_id: int) -> bool:
        """Ban a channel chat in a supergroup or a channel.

        Example:
            >>> ok = await bot.ban_chat_sender_chat(-100, -1009876543210)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            sender_chat_id: Unique identifier of the target sender chat.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, sender_chat_id=sender_chat_id)
        return parse_flag(await self.request("banChatSenderChat", payload))

    async def unban_chat_sender_chat(self, chat_id: int | str, sender_chat_id: int) -> bool:
        """Unban a previously banned channel chat in a supergroup or channel.

        Example:
            >>> ok = await bot.unban_chat_sender_chat(-100, -1009876543210)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            sender_chat_id: Unique identifier of the target sender chat.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, sender_chat_id=sender_chat_id)
        return parse_flag(await self.request("unbanChatSenderChat", payload))

    async def approve_chat_join_request(self, chat_id: int | str, user_id: int) -> bool:
        """Approve a chat join request.

        Example:
            >>> ok = await bot.approve_chat_join_request("@my_channel", 42)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            user_id: Unique identifier of the target user.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, user_id=user_id)
        return parse_flag(await self.request("approveChatJoinRequest", payload))

    async def decline_chat_join_request(self, chat_id: int | str, user_id: int) -> bool:
        """Decline a chat join request.

        Example:
            >>> ok = await bot.decline_chat_join_request("@my_channel", 42)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            user_id: Unique identifier of the target user.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, user_id=user_id)
        return parse_flag(await self.request("declineChatJoinRequest", payload))

    async def get_user_chat_boosts(self, chat_id: int | str, user_id: int) -> UserChatBoosts:
        """Get the list of boosts added to a chat by a user.

        Requires administrator rights in the chat.

        Example:
            >>> boosts = await bot.get_user_chat_boosts(-100, 42)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            user_id: Unique identifier of the target user.

        Returns:
            The UserChatBoosts list of boosts the user added to the chat.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, user_id=user_id)
        return parse_result(UserChatBoosts, await self.request("getUserChatBoosts", payload))

    async def set_chat_member_tag(
        self, chat_id: int | str, user_id: int, tag: str | None = None
    ) -> bool:
        """Set or remove a custom tag on a regular member of a forum supergroup.

        The bot must be an administrator with the ``can_manage_tags`` right.
        Passing an empty tag removes the current one.

        Example:
            >>> ok = await bot.set_chat_member_tag(-100, 42, "VIP")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            user_id: Unique identifier of the target user.
            tag: New tag for the member; 0-64 characters. Omit to leave the
                existing tag untouched.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, user_id=user_id, tag=tag)
        return parse_flag(await self.request("setChatMemberTag", payload))
