"""Chat information and moderation Bot API methods (parity with packages/go/pkg/bot/chats.go)."""

from __future__ import annotations

from telebot_py.bot.base import (
    Requester,
    clean_payload,
    parse_count,
    parse_flag,
    parse_list_result,
    parse_result,
)
from telebot_py.types.chat import Chat
from telebot_py.types.chat_members import ChatMember


class ChatsMixin(Requester):
    """Bot methods for chat info, membership counts, and member moderation."""

    async def get_chat(self, chat_id: int | str) -> Chat:
        """Get up-to-date information about a chat.

        Example:
            >>> chat = await bot.get_chat(-1001234567890)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup or channel.

        Returns:
            The Chat object with current chat information.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        return parse_result(Chat, await self.request("getChat", {"chat_id": chat_id}))

    async def get_chat_administrators(self, chat_id: int | str) -> list[ChatMember]:
        """Get a list of administrators in a chat.

        Example:
            >>> admins = await bot.get_chat_administrators(-1001234567890)

        Args:
            chat_id: Unique identifier for the target chat or channel username.

        Returns:
            Every administrator except other bots; empty list if the chat has
            no explicit administrators.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        result = await self.request("getChatAdministrators", {"chat_id": chat_id})
        return parse_list_result(ChatMember, result)

    async def get_chat_member_count(self, chat_id: int | str) -> int:
        """Get the number of members in a chat.

        Example:
            >>> count = await bot.get_chat_member_count(-1001234567890)

        Args:
            chat_id: Unique identifier for the target chat or channel username.

        Returns:
            The member count of the chat.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        return parse_count(await self.request("getChatMemberCount", {"chat_id": chat_id}))

    async def leave_chat(self, chat_id: int | str) -> bool:
        """Leave a group, supergroup, or channel.

        Example:
            >>> await bot.leave_chat(-1001234567890)

        Args:
            chat_id: Unique identifier for the target chat or channel username.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        return parse_flag(await self.request("leaveChat", {"chat_id": chat_id}))

    async def ban_chat_member(
        self,
        chat_id: int | str,
        user_id: int,
        *,
        until_date: int | None = None,
        revoke_messages: bool | None = None,
    ) -> bool:
        """Ban a user in a group, supergroup, or channel.

        Example:
            >>> await bot.ban_chat_member(-1001234567890, 777000)

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            user_id: Unique identifier of the target user.
            until_date: Unix time when the ban ends; ignored if less than 30
                seconds or more than 366 days from now (banned forever).
            revoke_messages: Also delete all messages from the chat for the
                user being banned. Always True for channels.

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
            until_date=until_date,
            revoke_messages=revoke_messages,
        )
        return parse_flag(await self.request("banChatMember", payload))

    async def unban_chat_member(
        self,
        chat_id: int | str,
        user_id: int,
        *,
        only_if_banned: bool | None = None,
    ) -> bool:
        """Unban a previously banned user in a supergroup or channel.

        Example:
            >>> await bot.unban_chat_member(-1001234567890, 777000)

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            user_id: Unique identifier of the target user.
            only_if_banned: Do nothing if the user is not banned.

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
            only_if_banned=only_if_banned,
        )
        return parse_flag(await self.request("unbanChatMember", payload))
