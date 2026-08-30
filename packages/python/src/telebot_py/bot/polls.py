"""Poll-sending Bot API methods (parity with packages/go/pkg/bot/media.go)."""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_result,
    to_wire,
)
from telebot_py.types.common import MessageEntity
from telebot_py.types.message import Message
from telebot_py.types.message_extras import ReplyParameters


class PollsMixin(Requester):
    """Bot method for sending native polls."""

    async def send_poll(
        self,
        chat_id: int | str,
        question: str,
        options: Sequence[str],
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        is_anonymous: bool | None = None,
        type: str | None = None,
        allows_multiple_answers: bool | None = None,
        correct_option_ids: Sequence[int] | None = None,
        explanation: str | None = None,
        explanation_parse_mode: str | None = None,
        explanation_entities: Sequence[MessageEntity] | None = None,
        open_period: int | None = None,
        close_date: int | None = None,
        is_closed: bool | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a native poll.

        Example:
            >>> msg = await bot.send_poll(123456, "Q?", ["A", "B"])

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            question: Poll question, 1-300 characters.
            options: List of answer options, 2-10 strings of 1-100 characters.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            is_anonymous: Whether the poll is anonymous; omitted by default.
            type: Poll type, ``quiz`` or ``regular``.
            allows_multiple_answers: Whether multiple answers can be chosen.
            correct_option_ids: 0-based identifiers of the correct answer
                options (quiz mode).
            explanation: Text shown when a user gives a wrong answer.
            explanation_parse_mode: Parse mode for the explanation.
            explanation_entities: Special entities for the explanation.
            open_period: Seconds the poll stays active, 5-600.
            close_date: Unix time when the poll is closed automatically.
            is_closed: Create an immediately closed poll.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendpoll
        """
        payload = clean_payload(
            chat_id=chat_id,
            question=question,
            options=list(options),
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            is_anonymous=is_anonymous,
            type=type,
            allows_multiple_answers=allows_multiple_answers,
            correct_option_ids=list(correct_option_ids) if correct_option_ids is not None else None,
            explanation=explanation,
            explanation_parse_mode=explanation_parse_mode,
            explanation_entities=[entity.to_dict() for entity in explanation_entities]
            if explanation_entities is not None
            else None,
            open_period=open_period,
            close_date=close_date,
            is_closed=is_closed,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendPoll", payload))
