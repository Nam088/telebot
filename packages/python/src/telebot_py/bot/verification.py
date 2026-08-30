"""Organizational verification Bot API methods.

Ported from node ``client/methods/chats/management.ts`` (verifyUser,
verifyChat, removeUserVerification, removeChatVerification).
"""

from __future__ import annotations

from telebot_py.bot.base import Requester, clean_payload, parse_flag


class VerificationMixin(Requester):
    """Bot methods for verifying users and chats on behalf of the owner."""

    async def verify_user(self, user_id: int, custom_description: str | None = None) -> bool:
        """Verify a user on behalf of the organization which owns the bot.

        Only available to bots owned by an organization that has been granted
        the ``can_verify_users`` right.

        Example:
            >>> ok = await bot.verify_user(42, "Official Staff")

        Args:
            user_id: Unique identifier of the target user.
            custom_description: Custom description for the verification
                status; 0-70 characters.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#verifyuser
        """
        payload = clean_payload(user_id=user_id, custom_description=custom_description)
        return parse_flag(await self.request("verifyUser", payload))

    async def verify_chat(self, chat_id: int | str, custom_description: str | None = None) -> bool:
        """Verify a chat on behalf of the organization which owns the bot.

        Example:
            >>> ok = await bot.verify_chat("@my_channel", "Verified Community")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            custom_description: Custom description for the verification
                status; 0-70 characters.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#verifychat
        """
        payload = clean_payload(chat_id=chat_id, custom_description=custom_description)
        return parse_flag(await self.request("verifyChat", payload))

    async def remove_user_verification(self, user_id: int) -> bool:
        """Remove verification from a user previously verified by this organization.

        Example:
            >>> ok = await bot.remove_user_verification(42)

        Args:
            user_id: Unique identifier of the target user.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#removeuserverification
        """
        payload = clean_payload(user_id=user_id)
        return parse_flag(await self.request("removeUserVerification", payload))

    async def remove_chat_verification(self, chat_id: int | str) -> bool:
        """Remove verification from a chat previously verified by this organization.

        Example:
            >>> ok = await bot.remove_chat_verification("@my_channel")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#removechatverification
        """
        payload = clean_payload(chat_id=chat_id)
        return parse_flag(await self.request("removeChatVerification", payload))
