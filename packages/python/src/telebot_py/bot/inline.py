"""Inline-mode Bot API methods (parity with packages/go/pkg/bot/inline.go)."""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    parse_result,
    to_wire,
)
from telebot_py.types.message_extras import PreparedInlineMessage, SentWebAppMessage


class InlineMixin(Requester):
    """Bot methods for answering inline queries from search results."""

    async def answer_inline_query(
        self,
        inline_query_id: str,
        results: Sequence[MarkupLike],
        *,
        cache_time: int | None = None,
        is_personal: bool | None = None,
        next_offset: str | None = None,
        button: MarkupLike | None = None,
    ) -> bool:
        """Send answers to an inline query.

        Example:
            >>> ok = await bot.answer_inline_query(query.id, [result.to_dict()])

        Args:
            inline_query_id: Unique identifier of the answered query.
            results: Inline query results; dicts or ``to_dict`` objects.
            cache_time: Seconds the result may be cached on the server.
            is_personal: Pass True if results may be cached only for the
                querying user; by default results are public.
            next_offset: Offset the client should use in the next query.
            button: Inline query results button (InlineQueryResultsButton).

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#answerinlinequery
        """
        payload = clean_payload(
            inline_query_id=inline_query_id,
            results=[to_wire(result) for result in results],
            cache_time=cache_time,
            is_personal=is_personal,
            next_offset=next_offset,
            button=to_wire(button),
        )
        return parse_flag(await self.request("answerInlineQuery", payload))

    async def answer_web_app_query(
        self, web_app_query_id: str, result: MarkupLike
    ) -> SentWebAppMessage:
        """Set the result of an interaction with a Web App.

        Example:
            >>> message = await bot.answer_web_app_query(query_id, result)

        Args:
            web_app_query_id: Unique identifier of the Web App query.
            result: The result description as an InlineQueryResult dict.

        Returns:
            A SentWebAppMessage with the sent message identifier.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#answerwebappquery
        """
        payload = clean_payload(
            web_app_query_id=web_app_query_id,
            result=to_wire(result),
        )
        return parse_result(SentWebAppMessage, await self.request("answerWebAppQuery", payload))

    async def save_prepared_inline_message(
        self,
        user_id: int,
        result: MarkupLike,
        *,
        allow_user_chats: bool | None = None,
        allow_bot_chats: bool | None = None,
        allow_group_chats: bool | None = None,
        allow_channel_chats: bool | None = None,
    ) -> PreparedInlineMessage:
        """Store a message a Mini App user can send to a chat later.

        Example:
            >>> prepared = await bot.save_prepared_inline_message(42, result)

        Args:
            user_id: Unique identifier of the user who may send the message.
            result: The message description as an InlineQueryResult dict.
            allow_user_chats: Allow sending to private chats with users.
            allow_bot_chats: Allow sending to private chats with bots.
            allow_group_chats: Allow sending to group and supergroup chats.
            allow_channel_chats: Allow sending to channel chats.

        Returns:
            The stored PreparedInlineMessage.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#savepreparedinlinemessage
        """
        payload = clean_payload(
            user_id=user_id,
            result=to_wire(result),
            allow_user_chats=allow_user_chats,
            allow_bot_chats=allow_bot_chats,
            allow_group_chats=allow_group_chats,
            allow_channel_chats=allow_channel_chats,
        )
        return parse_result(
            PreparedInlineMessage,
            await self.request("savePreparedInlineMessage", payload),
        )
