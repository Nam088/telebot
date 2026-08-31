"""Managed-bot access and token Bot API methods.

Ported from node ``client/methods/business/gifts.ts``
(getManagedBotAccessSettings, setManagedBotAccessSettings, getManagedBotToken,
replaceManagedBotToken).
"""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    Requester,
    clean_payload,
    parse_flag,
    parse_result,
    parse_string,
)
from telebot_py.types.topics import BotAccessSettings


class ManagedBotMixin(Requester):
    """Bot methods for the bots the caller manages on behalf of their owners."""

    async def get_managed_bot_access_settings(self, user_id: int) -> BotAccessSettings:
        """Get the access settings of a managed bot.

        Remarks:
            The managed bot is identified by its ``user_id``, not by a token or
            a ``bot_id``. Requires the caller to manage the bot.

        Example:
            >>> settings = await bot.get_managed_bot_access_settings(42)
            >>> settings.is_access_restricted
            True

        Args:
            user_id: User identifier of the managed bot whose access settings
                will be returned.

        Returns:
            The BotAccessSettings of the managed bot.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#getmanagedbotaccesssettings
        """
        payload = clean_payload(user_id=user_id)
        return parse_result(
            BotAccessSettings, await self.request("getManagedBotAccessSettings", payload)
        )

    async def set_managed_bot_access_settings(
        self,
        user_id: int,
        is_access_restricted: bool,
        *,
        added_user_ids: Sequence[int] | None = None,
    ) -> bool:
        """Change the access settings of a managed bot.

        Remarks:
            ``is_access_restricted`` is required and always sent, including when
            it is False. ``added_user_ids`` is ignored by Telegram when
            ``is_access_restricted`` is False.

        Example:
            >>> ok = await bot.set_managed_bot_access_settings(42, True, added_user_ids=[7, 8])

        Args:
            user_id: User identifier of the managed bot whose access settings
                will be changed.
            is_access_restricted: Pass True if only selected users can access
                the bot. The bot's owner can always access it.
            added_user_ids: Identifiers of up to 10 users who will have access
                to the bot in addition to its owner.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setmanagedbotaccesssettings
        """
        payload = clean_payload(
            user_id=user_id,
            is_access_restricted=is_access_restricted,
            added_user_ids=list(added_user_ids) if added_user_ids is not None else None,
        )
        return parse_flag(await self.request("setManagedBotAccessSettings", payload))

    async def get_managed_bot_token(self, user_id: int) -> str:
        """Get the token of a managed bot.

        Example:
            >>> token = await bot.get_managed_bot_token(42)

        Args:
            user_id: User identifier of the managed bot whose token will be
                returned.

        Returns:
            The managed bot's token.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#getmanagedbottoken
        """
        payload = clean_payload(user_id=user_id)
        return parse_string(await self.request("getManagedBotToken", payload))

    async def replace_managed_bot_token(self, user_id: int) -> str:
        """Revoke the current token of a managed bot and generate a new one.

        Remarks:
            The old token stops working immediately, so any process still using
            it must be restarted with the returned token.

        Example:
            >>> new_token = await bot.replace_managed_bot_token(42)

        Args:
            user_id: User identifier of the managed bot whose token will be
                replaced.

        Returns:
            The newly generated token.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#replacemanagedbottoken
        """
        payload = clean_payload(user_id=user_id)
        return parse_string(await self.request("replaceManagedBotToken", payload))
