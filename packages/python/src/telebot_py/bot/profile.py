"""Bot profile Bot API methods (parity with packages/go/pkg/bot/profile.go)."""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    parse_list_result,
    parse_result,
    to_wire,
)
from telebot_py.types.topics import (
    BotCommand,
    BotDescription,
    BotName,
    BotShortDescription,
)


class ProfileMixin(Requester):
    """Bot methods for the bot's own name, descriptions, commands, and lifecycle."""

    async def log_out(self) -> bool:
        """Log out from the cloud Bot API server before switching local servers.

        Example:
            >>> ok = await bot.log_out()

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        return parse_flag(await self.request("logOut", {}))

    async def close(self) -> bool:
        """Close the bot instance before moving it to another local server.

        Example:
            >>> ok = await bot.close()

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        return parse_flag(await self.request("close", {}))

    async def set_my_name(
        self, *, name: str | None = None, language_code: str | None = None
    ) -> bool:
        """Change the bot's name.

        Example:
            >>> ok = await bot.set_my_name(name="Helper", language_code="en")

        Args:
            name: New bot name; 0-64 characters. Omit to remove the name.
            language_code: User language the name applies to.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(name=name, language_code=language_code)
        return parse_flag(await self.request("setMyName", payload))

    async def get_my_name(self, *, language_code: str | None = None) -> BotName:
        """Get the bot's name in the given language.

        Example:
            >>> name = await bot.get_my_name(language_code="en")

        Args:
            language_code: User language whose name to return.

        Returns:
            The BotName.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(language_code=language_code)
        return parse_result(BotName, await self.request("getMyName", payload))

    async def set_my_description(
        self, description: str, *, language_code: str | None = None
    ) -> bool:
        """Change the bot's description shown on its profile page.

        Example:
            >>> ok = await bot.set_my_description("A helpful bot")

        Args:
            description: New bot description; 0-512 characters.
            language_code: User language the description applies to.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(description=description, language_code=language_code)
        return parse_flag(await self.request("setMyDescription", payload))

    async def get_my_description(self, *, language_code: str | None = None) -> BotDescription:
        """Get the bot's description in the given language.

        Example:
            >>> description = await bot.get_my_description(language_code="en")

        Args:
            language_code: User language whose description to return.

        Returns:
            The BotDescription.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(language_code=language_code)
        return parse_result(BotDescription, await self.request("getMyDescription", payload))

    async def set_my_short_description(
        self, short_description: str, *, language_code: str | None = None
    ) -> bool:
        """Change the bot's short description shown in chats.

        Example:
            >>> ok = await bot.set_my_short_description("Say hi!")

        Args:
            short_description: New short description; 0-120 characters.
            language_code: User language the short description applies to.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(short_description=short_description, language_code=language_code)
        return parse_flag(await self.request("setMyShortDescription", payload))

    async def get_my_short_description(
        self, *, language_code: str | None = None
    ) -> BotShortDescription:
        """Get the bot's short description in the given language.

        Example:
            >>> short = await bot.get_my_short_description(language_code="en")

        Args:
            language_code: User language whose short description to return.

        Returns:
            The BotShortDescription.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(language_code=language_code)
        return parse_result(
            BotShortDescription, await self.request("getMyShortDescription", payload)
        )

    async def set_my_commands(
        self,
        commands: Sequence[MarkupLike],
        *,
        scope: MarkupLike | None = None,
        language_code: str | None = None,
    ) -> bool:
        """Change the list of the bot's commands.

        Example:
            >>> ok = await bot.set_my_commands([{"command": "start", "description": "Begin"}])

        Args:
            commands: New command list; dicts or BotCommand objects.
            scope: BotCommandScope limiting where the commands apply.
            language_code: User language the commands apply to.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            commands=[to_wire(command) for command in commands],
            scope=to_wire(scope),
            language_code=language_code,
        )
        return parse_flag(await self.request("setMyCommands", payload))

    async def get_my_commands(
        self, *, scope: MarkupLike | None = None, language_code: str | None = None
    ) -> list[BotCommand]:
        """Get the current list of the bot's commands.

        Example:
            >>> commands = await bot.get_my_commands()

        Args:
            scope: BotCommandScope limiting where the commands apply.
            language_code: User language whose commands to return.

        Returns:
            The BotCommand list.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(scope=to_wire(scope), language_code=language_code)
        return parse_list_result(BotCommand, await self.request("getMyCommands", payload))

    async def delete_my_commands(
        self, *, scope: MarkupLike | None = None, language_code: str | None = None
    ) -> bool:
        """Delete the list of the bot's commands for the given scope.

        Example:
            >>> ok = await bot.delete_my_commands()

        Args:
            scope: BotCommandScope limiting where the commands apply.
            language_code: User language whose commands to delete.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(scope=to_wire(scope), language_code=language_code)
        return parse_flag(await self.request("deleteMyCommands", payload))
