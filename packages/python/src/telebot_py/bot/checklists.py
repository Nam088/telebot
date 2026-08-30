"""Checklist message Bot API methods.

Ported from node ``client/methods/messages/edit.ts`` (sendChecklist,
editMessageChecklist).
"""

from __future__ import annotations

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_message_or_true,
    parse_result,
    to_wire,
)
from telebot_py.types.message import Message


class ChecklistsMixin(Requester):
    """Bot methods for sending and editing checklist messages."""

    async def send_checklist(
        self,
        business_connection_id: str,
        chat_id: int | str,
        checklist: MarkupLike,
        *,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a checklist on behalf of a connected business account.

        Remarks:
            ``checklist`` is an InputChecklist object — either an
            :class:`~telebot_py.types.InputChecklist` instance or a plain dict
            using Telegram's field names (``title``, ``tasks``, ``parse_mode``,
            ``title_entities``, ``others_can_add_tasks``,
            ``others_can_mark_tasks_as_done``).

        Example:
            >>> from telebot_py.types import InputChecklist, InputChecklistTask
            >>> message = await bot.send_checklist(
            ...     "bc1",
            ...     123,
            ...     InputChecklist(
            ...         title="Shopping",
            ...         tasks=[InputChecklistTask(id=1, text="Buy milk")],
            ...     ),
            ... )

        Args:
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            chat_id: Unique identifier for the target chat or username of the
                target bot.
            checklist: InputChecklist describing the checklist to send.
            disable_notification: Sends the message silently.
            protect_content: Protects the contents from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: ReplyParameters object describing the message to
                reply to.
            reply_markup: InlineKeyboardMarkup for the message.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            chat_id=chat_id,
            checklist=to_wire(checklist),
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendChecklist", payload))

    async def edit_message_checklist(
        self,
        business_connection_id: str,
        chat_id: int | str,
        message_id: int,
        checklist: MarkupLike,
        *,
        reply_markup: MarkupLike | None = None,
    ) -> Message | bool:
        """Edit a checklist on behalf of a connected business account.

        Remarks:
            ``checklist`` follows the same InputChecklist shape as
            :meth:`send_checklist`. Node declares the return as
            ``Message | boolean``; ``True`` is returned when Telegram replies
            with a bare flag instead of the edited message.

        Example:
            >>> result = await bot.edit_message_checklist(
            ...     "bc1", 123, 45, {"title": "Todo", "tasks": [{"id": 1, "text": "Ship"}]}
            ... )

        Args:
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message was sent.
            chat_id: Unique identifier for the target chat or username of the
                target bot.
            message_id: Unique identifier of the target message.
            checklist: InputChecklist describing the new checklist content.
            reply_markup: InlineKeyboardMarkup replacing the message keyboard.

        Returns:
            The edited Message, or True when Telegram returned a bare flag.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            chat_id=chat_id,
            message_id=message_id,
            checklist=to_wire(checklist),
            reply_markup=to_wire(reply_markup),
        )
        return parse_message_or_true(await self.request("editMessageChecklist", payload))
