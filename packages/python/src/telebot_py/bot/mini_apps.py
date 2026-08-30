"""Mini App guest-query and join-request Bot API methods.

Ported from node ``client/methods/business/stories-boosts.ts``
(answerGuestQuery), ``client/methods/business/ephemeral.ts``
(sendChatJoinRequestWebApp), and ``client/methods/business/gifts.ts``
(savePreparedKeyboardButton).
"""

from __future__ import annotations

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    parse_result,
    to_wire,
)
from telebot_py.types.keyboards import PreparedKeyboardButton
from telebot_py.types.message_extras import SentGuestMessage


class MiniAppsMixin(Requester):
    """Bot methods for replying to Mini App and join-request queries."""

    async def answer_guest_query(self, guest_query_id: str, result: MarkupLike) -> SentGuestMessage:
        """Reply to a received guest message from a mini app.

        Remarks:
            ``result`` is an InlineQueryResult object describing the message to
            send; the JSON-only client takes it as a dict or ``to_dict`` object
            rather than modelling every inline result type.

        Example:
            >>> sent = await bot.answer_guest_query(
            ...     "guest-1",
            ...     {
            ...         "type": "article",
            ...         "id": "art_1",
            ...         "title": "Result",
            ...         "input_message_content": {"message_text": "Hello"},
            ...     },
            ... )

        Args:
            guest_query_id: Unique identifier for the query to be answered.
            result: InlineQueryResult describing the message to be sent.

        Returns:
            The SentGuestMessage carrying the sent inline message identifier.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#answerguestquery
        """
        payload = clean_payload(guest_query_id=guest_query_id, result=to_wire(result))
        return parse_result(SentGuestMessage, await self.request("answerGuestQuery", payload))

    async def send_chat_join_request_web_app(
        self, chat_join_request_query_id: str, web_app_url: str
    ) -> bool:
        """Show a Mini App to a user before they decide on a join request.

        Remarks:
            Resolve the join request itself with Telegram's
            ``answerChatJoinRequestQuery`` once the user interacts with the
            Mini App.

        Example:
            >>> ok = await bot.send_chat_join_request_web_app(
            ...     "join-1", "https://example.com/app?start=abc"
            ... )

        Args:
            chat_join_request_query_id: Unique identifier of the join request
                query.
            web_app_url: An HTTPS URL of the Web App to open, as specified in
                "Initializing Web Apps".

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendchatjoinrequestwebapp
        """
        payload = clean_payload(
            chat_join_request_query_id=chat_join_request_query_id, web_app_url=web_app_url
        )
        return parse_flag(await self.request("sendChatJoinRequestWebApp", payload))

    async def save_prepared_keyboard_button(
        self, user_id: int, button: MarkupLike
    ) -> PreparedKeyboardButton:
        """Store a keyboard button a user of a Mini App can send later.

        Remarks:
            ``button`` must be a KeyboardButton of the type ``request_users``,
            ``request_chat``, or ``request_managed_bot``.

        Example:
            >>> prepared = await bot.save_prepared_keyboard_button(
            ...     42,
            ...     {"text": "Share team", "request_users": {"user_is_bot": True}},
            ... )

        Args:
            user_id: Unique identifier of the target user that can use the
                button.
            button: KeyboardButton as a ``to_dict`` object or a plain dict
                describing the button to save.

        Returns:
            The PreparedKeyboardButton carrying the stored button identifier.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#savepreparedkeyboardbutton
        """
        payload = clean_payload(user_id=user_id, button=to_wire(button))
        return parse_result(
            PreparedKeyboardButton, await self.request("savePreparedKeyboardButton", payload)
        )
