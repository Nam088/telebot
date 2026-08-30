"""Game and Telegram Passport Bot API methods (parity with games-passport.ts)."""

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
from telebot_py.types.games import GameHighScore
from telebot_py.types.message import Message


class GamesMixin(Requester):
    """Bot methods for sending games, managing scores, and reporting Passport errors."""

    async def send_game(
        self,
        chat_id: int | str,
        game_short_name: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a game.

        Example:
            >>> msg = await bot.send_game("@gamechannel", "lucas")

        Args:
            chat_id: Unique identifier for the target chat (game chats only).
            game_short_name: Short name of the game set up via BotFather.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            reply_markup: Inline keyboard for the message; dict or
                ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            game_short_name=game_short_name,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            disable_notification=disable_notification,
            protect_content=protect_content,
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendGame", payload))

    async def set_game_score(
        self,
        user_id: int,
        score: int,
        *,
        force: bool | None = None,
        disable_edit_message: bool | None = None,
        chat_id: int | str | None = None,
        message_id: int | None = None,
        inline_message_id: str | None = None,
    ) -> Message | bool:
        """Set the score of a user in a game.

        Targets either a chat message (``chat_id`` + ``message_id``) or an
        inline message (``inline_message_id``).

        Example:
            >>> result = await bot.set_game_score(1, 42, chat_id=2, message_id=30)

        Args:
            user_id: User identifier of the score setter.
            score: New score, non-negative.
            force: Pass True to allow decreasing the score, even when it is
                lower than current high scores in the chat.
            disable_edit_message: Do not edit the game message to include the
                current scoreboard.
            chat_id: Chat containing the game message (chat-message target).
            message_id: Identifier of the game message (chat-message target).
            inline_message_id: Identifier of the inline message (inline
                target).

        Returns:
            The edited Message for chat-message targets, or True for inline
            targets.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            user_id=user_id,
            score=score,
            force=force,
            disable_edit_message=disable_edit_message,
            chat_id=chat_id,
            message_id=message_id,
            inline_message_id=inline_message_id,
        )
        result = await self.request("setGameScore", payload)
        if isinstance(result, bool):
            return result
        return parse_result(Message, result)

    async def get_game_high_scores(
        self,
        user_id: int,
        *,
        chat_id: int | str | None = None,
        message_id: int | None = None,
        inline_message_id: str | None = None,
    ) -> list[GameHighScore]:
        """Get the high scores of a user and their neighbors in a game.

        Example:
            >>> scores = await bot.get_game_high_scores(1, chat_id=2, message_id=30)

        Args:
            user_id: Target user identifier.
            chat_id: Chat containing the game message (chat-message target).
            message_id: Identifier of the game message (chat-message target).
            inline_message_id: Identifier of the inline message (inline
                target).

        Returns:
            The GameHighScore entries.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            user_id=user_id,
            chat_id=chat_id,
            message_id=message_id,
            inline_message_id=inline_message_id,
        )
        return parse_list_result(GameHighScore, await self.request("getGameHighScores", payload))

    async def set_passport_data_errors(self, user_id: int, errors: Sequence[MarkupLike]) -> bool:
        """Tell a user that some Telegram Passport elements they provided are invalid.

        The user will not be able to re-submit their Passport until the errors
        are fixed. Each entry may be a plain dict or any object exposing
        ``to_dict``; variant-specific keys (``field_name``, ``file_hash``,
        ``element_hash``) are only reachable through the dict shape.

        Example:
            >>> ok = await bot.set_passport_data_errors(42, [
            ...     {
            ...         "source": "data_field",
            ...         "type": "personal_details",
            ...         "field_name": "first_name",
            ...         "hash": "abc123",
            ...         "message": "First name is invalid",
            ...     }
            ... ])

        Args:
            user_id: Unique identifier of the target user.
            errors: One error per problematic Passport element, as dicts or
                ``to_dict`` objects.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            user_id=user_id,
            errors=[to_wire(error) for error in errors],
        )
        return parse_flag(await self.request("setPassportDataErrors", payload))
