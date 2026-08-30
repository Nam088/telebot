"""Message-sending Bot API methods (parity with packages/go/pkg/bot/messages.go)."""

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
from telebot_py.types.common import MessageEntity, MessageId
from telebot_py.types.message import Message
from telebot_py.types.message_extras import ReplyParameters


class MessagesMixin(Requester):
    """Bot methods for sending messages, media references, and chat actions."""

    async def send_message(
        self,
        chat_id: int | str,
        text: str,
        *,
        message_thread_id: int | None = None,
        parse_mode: str | None = None,
        entities: Sequence[MessageEntity] | None = None,
        link_preview_options: MarkupLike | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a text message to a chat.

        Example:
            >>> msg = await bot.send_message(123456, "Hello!", parse_mode="Markdown")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel (e.g. ``@channelusername``).
            text: Text of the message to be sent, 1-4096 characters.
            message_thread_id: Unique identifier for the target message thread
                (topic) of a forum supergroup.
            parse_mode: Parse mode for text entities (``HTML``, ``Markdown``,
                ``MarkdownV2``).
            entities: Special entities that appear in the text, as an
                alternative to ``parse_mode``.
            link_preview_options: Link preview generation options.
            disable_notification: Send silently; users get a notification with
                no sound.
            protect_content: Protect the message content from forwarding and
                saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.
            reply_markup: Inline keyboard, custom reply keyboard,
                remove-keyboard instruction, or force-reply instruction; a
                plain dict or any object with ``to_dict``.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendmessage
        """
        payload = clean_payload(
            chat_id=chat_id,
            text=text,
            message_thread_id=message_thread_id,
            parse_mode=parse_mode,
            entities=[entity.to_dict() for entity in entities] if entities is not None else None,
            link_preview_options=to_wire(link_preview_options),
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendMessage", payload))

    async def send_chat_action(
        self,
        chat_id: int | str,
        action: str,
        *,
        message_thread_id: int | None = None,
    ) -> bool:
        """Broadcast a chat action (typing, upload_photo, ...) to the chat.

        Example:
            >>> await bot.send_chat_action(123456, "typing")

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            action: Type of action to broadcast, e.g. ``typing``,
                ``upload_photo``, ``find_location``.
            message_thread_id: Unique identifier for the target message thread.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendchataction
        """
        payload = clean_payload(
            chat_id=chat_id,
            action=action,
            message_thread_id=message_thread_id,
        )
        return parse_flag(await self.request("sendChatAction", payload))

    async def answer_callback_query(
        self,
        callback_query_id: str,
        *,
        text: str | None = None,
        show_alert: bool | None = None,
        url: str | None = None,
        cache_time: int | None = None,
    ) -> bool:
        """Send an answer to a callback query sent by a callback keyboard.

        Example:
            >>> await bot.answer_callback_query(update.callback_query.id, text="Saved!")

        Args:
            callback_query_id: Unique identifier of the callback query to
                answer, e.g. ``update.callback_query.id``.
            text: Text of the notification, 0-200 characters; shown as an
                alert when ``show_alert`` is True.
            show_alert: If True, show the text as an alert instead of a
                notification at the top of the chat screen.
            url: URL that will be opened by the user's client; only for
                games or callback buttons that open a bot URL.
            cache_time: Maximum time the result may be cached client-side,
                in seconds.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#answercallbackquery
        """
        payload = clean_payload(
            callback_query_id=callback_query_id,
            text=text,
            show_alert=show_alert,
            url=url,
            cache_time=cache_time,
        )
        return parse_flag(await self.request("answerCallbackQuery", payload))

    async def forward_message(
        self,
        chat_id: int | str,
        from_chat_id: int | str,
        message_id: int,
        *,
        message_thread_id: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
    ) -> Message:
        """Forward a message of any kind to another chat.

        Example:
            >>> msg = await bot.forward_message(target_chat, source_chat, 123)

        Args:
            chat_id: Unique identifier for the destination chat.
            from_chat_id: Chat where the original message was sent.
            message_id: Message identifier in ``from_chat_id``.
            message_thread_id: Unique identifier for the target message thread.
            disable_notification: Forward silently.
            protect_content: Protect the forwarded content.

        Returns:
            The forwarded Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#forwardmessage
        """
        payload = clean_payload(
            chat_id=chat_id,
            from_chat_id=from_chat_id,
            message_id=message_id,
            message_thread_id=message_thread_id,
            disable_notification=disable_notification,
            protect_content=protect_content,
        )
        return parse_result(Message, await self.request("forwardMessage", payload))

    async def copy_message(
        self,
        chat_id: int | str,
        from_chat_id: int | str,
        message_id: int,
        *,
        message_thread_id: int | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MessageEntity] | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> MessageId:
        """Copy a message of any kind without linking to the original.

        Example:
            >>> copied = await bot.copy_message(target_chat, source_chat, 123)

        Args:
            chat_id: Unique identifier for the destination chat.
            from_chat_id: Chat where the source message lives.
            message_id: Message identifier to copy.
            message_thread_id: Unique identifier for the target message thread.
            caption: New caption for the copy, 0-1024 characters.
            parse_mode: Parse mode for the new caption.
            caption_entities: Special entities for the new caption.
            disable_notification: Send the copy silently.
            protect_content: Protect the copied content.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.
            reply_markup: Markup for the copied message; dict or ``to_dict``
                object.

        Returns:
            A MessageId carrying the identifier of the copied message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#copymessage
        """
        payload = clean_payload(
            chat_id=chat_id,
            from_chat_id=from_chat_id,
            message_id=message_id,
            message_thread_id=message_thread_id,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[entity.to_dict() for entity in caption_entities]
            if caption_entities is not None
            else None,
            disable_notification=disable_notification,
            protect_content=protect_content,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(MessageId, await self.request("copyMessage", payload))

    async def send_photo(
        self,
        chat_id: int | str,
        photo: str,
        *,
        caption: str | None = None,
        parse_mode: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a photo by ``file_id`` or HTTP URL (file uploads are out of scope).

        Example:
            >>> msg = await bot.send_photo(123456, "https://example.com/cat.jpg")

        Args:
            chat_id: Unique identifier for the target chat.
            photo: Photo to send as a ``file_id`` string or HTTP URL.
            caption: Photo caption, 0-1024 characters.
            parse_mode: Parse mode for the caption.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendphoto
        """
        payload = clean_payload(
            chat_id=chat_id,
            photo=photo,
            caption=caption,
            parse_mode=parse_mode,
            disable_notification=disable_notification,
            protect_content=protect_content,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendPhoto", payload))

    async def send_document(
        self,
        chat_id: int | str,
        document: str,
        *,
        caption: str | None = None,
        parse_mode: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a general file by ``file_id`` or HTTP URL (file uploads are out of scope).

        Example:
            >>> msg = await bot.send_document(123456, "https://example.com/report.pdf")

        Args:
            chat_id: Unique identifier for the target chat.
            document: Document to send as a ``file_id`` string or HTTP URL.
            caption: Document caption, 0-1024 characters.
            parse_mode: Parse mode for the caption.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#senddocument
        """
        payload = clean_payload(
            chat_id=chat_id,
            document=document,
            caption=caption,
            parse_mode=parse_mode,
            disable_notification=disable_notification,
            protect_content=protect_content,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendDocument", payload))

    async def get_user_personal_chat_messages(self, user_id: int, limit: int) -> list[Message]:
        """Get the last messages from the personal chat of a user.

        Remarks:
            The user is identified by ``user_id``, not by the identifier of
            their personal chat. ``limit`` is required and must be 1-20.

        Example:
            >>> messages = await bot.get_user_personal_chat_messages(42, 10)

        Args:
            user_id: Unique identifier of the target user.
            limit: Maximum number of messages to return; 1-20.

        Returns:
            The messages of the personal chat, oldest first.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#getuserpersonalchatmessages
        """
        payload = clean_payload(user_id=user_id, limit=limit)
        return parse_list_result(
            Message, await self.request("getUserPersonalChatMessages", payload)
        )
