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
from telebot_py.types.common import LinkPreviewOptions, MessageEntity, MessageId
from telebot_py.types.message import Message
from telebot_py.types.message_extras import EphemeralMessageParameters, ReplyParameters
from telebot_py.types.suggested_post_types import SuggestedPostParameters


class MessagesMixin(Requester):
    """Bot methods for sending text messages, chat actions, forwards, and copies."""

    async def send_message(
        self,
        chat_id: int | str,
        text: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        ephemeral_message_parameters: EphemeralMessageParameters | MarkupLike | None = None,
        parse_mode: str | None = None,
        entities: Sequence[MessageEntity] | None = None,
        link_preview_options: LinkPreviewOptions | MarkupLike | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
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
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread
                (topic) of a forum supergroup.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            ephemeral_message_parameters: EphemeralMessageParameters as a
                ``to_dict`` object or dict.
            parse_mode: Parse mode for text entities (``HTML``, ``Markdown``,
                ``MarkdownV2``).
            entities: Special entities that appear in the text, as an
                alternative to ``parse_mode``.
            link_preview_options: Link preview generation options, as a
                ``LinkPreviewOptions`` object or a mapping.
            disable_notification: Send silently; users get a notification with
                no sound.
            protect_content: Protect the message content from forwarding and
                saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
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
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
            ephemeral_message_parameters=to_wire(ephemeral_message_parameters),
            parse_mode=parse_mode,
            entities=[entity.to_dict() for entity in entities] if entities is not None else None,
            link_preview_options=to_wire(link_preview_options),
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendMessage", payload))

    async def send_chat_action(
        self,
        chat_id: int | str,
        action: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
    ) -> bool:
        """Broadcast a chat action (typing, upload_photo, ...) to the chat.

        Example:
            >>> await bot.send_chat_action(123456, "typing")

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            action: Type of action to broadcast, e.g. ``typing``,
                ``upload_photo``, ``find_location``.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
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
            business_connection_id=business_connection_id,
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
        direct_messages_topic_id: int | None = None,
        video_start_timestamp: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
    ) -> Message:
        """Forward a message of any kind to another chat.

        Example:
            >>> msg = await bot.forward_message(target_chat, source_chat, 123)

        Args:
            chat_id: Unique identifier for the destination chat.
            from_chat_id: Chat where the original message was sent.
            message_id: Message identifier in ``from_chat_id``.
            message_thread_id: Unique identifier for the target message thread.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            video_start_timestamp: New start timestamp for the forwarded video in seconds.
            disable_notification: Forward silently.
            protect_content: Protect the forwarded content.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.

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
            direct_messages_topic_id=direct_messages_topic_id,
            video_start_timestamp=video_start_timestamp,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
        )
        return parse_result(Message, await self.request("forwardMessage", payload))

    async def copy_message(
        self,
        chat_id: int | str,
        from_chat_id: int | str,
        message_id: int,
        *,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MessageEntity] | None = None,
        show_caption_above_media: bool | None = None,
        video_start_timestamp: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
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
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            caption: New caption for the copy, 0-1024 characters.
            parse_mode: Parse mode for the new caption.
            caption_entities: Special entities for the new caption.
            show_caption_above_media: Pass True, if the caption must be
                shown above the message media.
            video_start_timestamp: New start timestamp for the copied video in seconds.
            disable_notification: Send the copy silently.
            protect_content: Protect the copied content.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
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
            direct_messages_topic_id=direct_messages_topic_id,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[entity.to_dict() for entity in caption_entities]
            if caption_entities is not None
            else None,
            show_caption_above_media=show_caption_above_media,
            video_start_timestamp=video_start_timestamp,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(MessageId, await self.request("copyMessage", payload))

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
