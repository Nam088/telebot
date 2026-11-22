"""HTML widget and widget query Bot API methods for Bot API 10.4+."""

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
from telebot_py.types.common import MessageEntity
from telebot_py.types.message import Message
from telebot_py.types.message_extras import ReplyParameters


class WidgetsMixin(Requester):
    """Bot methods for sending, querying, and editing HTML widgets."""

    async def send_widget(
        self,
        chat_id: int | str,
        html: str,
        *,
        message_thread_id: int | None = None,
        width: int | None = None,
        height: int | None = None,
        public_data: str | None = None,
        chat_data: str | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MessageEntity] | None = None,
        show_caption_above_media: bool | None = None,
        allow_queries: bool | None = None,
        is_shared: bool | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a message with an HTML widget.

        Example:
            >>> msg = await bot.send_widget(123456, "<div>Hello</div>")

        Args:
            chat_id: Unique identifier for the target chat or username.
            html: HTML content of the widget.
            message_thread_id: Unique identifier for the target message thread.
            width: Width of the widget in pixels.
            height: Height of the widget in pixels.
            public_data: Public data of the widget.
            chat_data: Chat-specific data of the widget.
            caption: Caption of the widget message.
            parse_mode: Mode for parsing entities in the caption.
            caption_entities: Special entities that appear in the caption.
            show_caption_above_media: Pass True to show caption above widget.
            allow_queries: Pass True to allow the widget to send queries.
            is_shared: Pass True if the widget is shared.
            disable_notification: Sends the message silently.
            protect_content: Protects the contents from forwarding/saving.
            allow_paid_broadcast: Pass True to allow up to 1000 msgs/sec.
            message_effect_id: Unique identifier of the message effect.
            reply_parameters: Description of the message to reply to.
            reply_markup: Additional interface options.

        Returns:
            The sent :class:`Message`.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendwidget
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_thread_id=message_thread_id,
            html=html,
            width=width,
            height=height,
            public_data=public_data,
            chat_data=chat_data,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[to_wire(e) for e in caption_entities]
            if caption_entities is not None
            else None,
            show_caption_above_media=show_caption_above_media,
            allow_queries=allow_queries,
            is_shared=is_shared,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters) if reply_parameters is not None else None,
            reply_markup=to_wire(reply_markup) if reply_markup is not None else None,
        )
        return parse_result(Message, await self.request("sendWidget", payload))

    async def send_shared_widget(
        self,
        chat_id: int | str,
        widget_id: str,
        *,
        message_thread_id: int | None = None,
        chat_data: str | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MessageEntity] | None = None,
        show_caption_above_media: bool | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send again a shared widget created by the bot.

        Example:
            >>> msg = await bot.send_shared_widget(123456, "shared_1")

        Args:
            chat_id: Unique identifier for the target chat or username.
            widget_id: Unique identifier of the shared widget.
            message_thread_id: Unique identifier for the target message thread.
            chat_data: Chat-specific data of the widget.
            caption: Caption of the widget message.
            parse_mode: Mode for parsing entities in the caption.
            caption_entities: Special entities that appear in the caption.
            show_caption_above_media: Pass True to show caption above widget.
            disable_notification: Sends the message silently.
            protect_content: Protects the contents from forwarding/saving.
            allow_paid_broadcast: Pass True to allow up to 1000 msgs/sec.
            message_effect_id: Unique identifier of the message effect.
            reply_parameters: Description of the message to reply to.
            reply_markup: Additional interface options.

        Returns:
            The sent :class:`Message`.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendsharedwidget
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_thread_id=message_thread_id,
            widget_id=widget_id,
            chat_data=chat_data,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[to_wire(e) for e in caption_entities]
            if caption_entities is not None
            else None,
            show_caption_above_media=show_caption_above_media,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters) if reply_parameters is not None else None,
            reply_markup=to_wire(reply_markup) if reply_markup is not None else None,
        )
        return parse_result(Message, await self.request("sendSharedWidget", payload))

    async def answer_widget_query(
        self,
        widget_query_id: str,
        *,
        data: str | None = None,
    ) -> bool:
        """Send an answer to a query from a widget.

        Example:
            >>> ok = await bot.answer_widget_query("wq_1", data="ok")

        Args:
            widget_query_id: Unique identifier for the query to be answered.
            data: Data to be returned to the widget.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#answerwidgetquery
        """
        payload = clean_payload(widget_query_id=widget_query_id, data=data)
        return parse_flag(await self.request("answerWidgetQuery", payload))

    async def edit_message_widget_data(
        self,
        *,
        chat_id: int | str | None = None,
        message_id: int | None = None,
        inline_message_id: str | None = None,
        public_data: str | None = None,
        chat_data: str | None = None,
    ) -> bool:
        """Edit data of a widget in a message sent by or via the bot.

        Example:
            >>> ok = await bot.edit_message_widget_data(
            ...     chat_id=123, message_id=42, public_data="{}"
            ... )

        Args:
            chat_id: Unique identifier for the target chat.
            message_id: Identifier of the message to edit.
            inline_message_id: Identifier of the inline message.
            public_data: New public data of the widget.
            chat_data: New chat-specific data of the widget.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#editmessagewidgetdata
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_id=message_id,
            inline_message_id=inline_message_id,
            public_data=public_data,
            chat_data=chat_data,
        )
        return parse_flag(await self.request("editMessageWidgetData", payload))

    async def edit_shared_widget_data(
        self,
        widget_id: str,
        public_data: str,
        *,
        cache_time: int | None = None,
    ) -> bool:
        """Edit public data of a shared widget created by the bot.

        Example:
            >>> ok = await bot.edit_shared_widget_data("w1", '{"v":2}', cache_time=60)

        Args:
            widget_id: Unique identifier of the shared widget.
            public_data: New public data of the widget, 0-1024 bytes.
            cache_time: Maximum cache time in seconds.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#editsharedwidgetdata
        """
        payload = clean_payload(
            widget_id=widget_id,
            public_data=public_data,
            cache_time=cache_time,
        )
        return parse_flag(await self.request("editSharedWidgetData", payload))
