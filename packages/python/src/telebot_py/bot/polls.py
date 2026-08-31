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
from telebot_py.types.input_media import InputMediaLike
from telebot_py.types.message import Message
from telebot_py.types.message_extras import ReplyParameters
from telebot_py.types.poll_types import InputPollOption


class PollsMixin(Requester):
    """Bot method for sending native polls."""

    async def send_poll(
        self,
        chat_id: int | str,
        question: str,
        options: Sequence[InputPollOption],
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        question_parse_mode: str | None = None,
        question_entities: Sequence[MessageEntity] | None = None,
        is_anonymous: bool | None = None,
        type: str | None = None,
        allows_multiple_answers: bool | None = None,
        allows_revoting: bool | None = None,
        shuffle_options: bool | None = None,
        allow_adding_options: bool | None = None,
        hide_results_until_closes: bool | None = None,
        members_only: bool | None = None,
        country_codes: Sequence[str] | None = None,
        correct_option_ids: Sequence[int] | None = None,
        explanation: str | None = None,
        explanation_parse_mode: str | None = None,
        explanation_entities: Sequence[MessageEntity] | None = None,
        explanation_media: InputMediaLike | None = None,
        open_period: int | None = None,
        close_date: int | None = None,
        is_closed: bool | None = None,
        description: str | None = None,
        description_parse_mode: str | None = None,
        description_entities: Sequence[MessageEntity] | None = None,
        media: InputMediaLike | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a native poll.

        Example:
            >>> options = [InputPollOption("A"), InputPollOption("B")]
            >>> msg = await bot.send_poll(123456, "Q?", options)

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            question: Poll question, 1-300 characters.
            options: List of answer options, 2-10 ``InputPollOption`` objects
                whose text is 1-100 characters.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            question_parse_mode: Parse mode for the poll question.
            question_entities: Special entities for the poll question.
            is_anonymous: Whether the poll is anonymous; omitted by default.
            type: Poll type, ``quiz`` or ``regular``.
            allows_multiple_answers: Whether multiple answers can be chosen.
            allows_revoting: Whether users may change their chosen answers.
            shuffle_options: Whether the option order must be shuffled before
                the poll is sent.
            allow_adding_options: Whether users other than the poll creator
                may add new options to the poll.
            hide_results_until_closes: Whether vote results must stay hidden
                until the poll closes.
            members_only: Whether voting is limited to users who have been
                members of the chat where the poll was originally sent.
            country_codes: Two-letter ISO 3166-1 alpha-2 country codes the
                users must be from to vote in the poll.
            correct_option_ids: 0-based identifiers of the correct answer
                options (quiz mode).
            explanation: Text shown when a user gives a wrong answer.
            explanation_parse_mode: Parse mode for the explanation.
            explanation_entities: Special entities for the explanation.
            explanation_media: Media to show when a user chooses an incorrect
                answer; a typed input media object or a raw mapping. The docs
                model ``InputPollMedia`` as an abstract union.
            open_period: Seconds the poll stays active, 5-600.
            close_date: Unix time when the poll is closed automatically.
            is_closed: Create an immediately closed poll.
            description: Poll description, 0-255 characters.
            description_parse_mode: Parse mode for the description.
            description_entities: Special entities for the description.
            media: Media to attach to the poll description; a typed input
                media object or a raw mapping. The docs model
                ``InputPollMedia`` as an abstract union.
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
            options=[to_wire(option) for option in options],
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            question_parse_mode=question_parse_mode,
            question_entities=[entity.to_dict() for entity in question_entities]
            if question_entities is not None
            else None,
            is_anonymous=is_anonymous,
            type=type,
            allows_multiple_answers=allows_multiple_answers,
            allows_revoting=allows_revoting,
            shuffle_options=shuffle_options,
            allow_adding_options=allow_adding_options,
            hide_results_until_closes=hide_results_until_closes,
            members_only=members_only,
            country_codes=list(country_codes) if country_codes is not None else None,
            correct_option_ids=list(correct_option_ids) if correct_option_ids is not None else None,
            explanation=explanation,
            explanation_parse_mode=explanation_parse_mode,
            explanation_entities=[entity.to_dict() for entity in explanation_entities]
            if explanation_entities is not None
            else None,
            explanation_media=to_wire(explanation_media),
            open_period=open_period,
            close_date=close_date,
            is_closed=is_closed,
            description=description,
            description_parse_mode=description_parse_mode,
            description_entities=[entity.to_dict() for entity in description_entities]
            if description_entities is not None
            else None,
            media=to_wire(media),
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendPoll", payload))
