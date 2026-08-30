"""Photo and document Bot API methods (parity with packages/go/pkg/bot/messages.go)."""

from __future__ import annotations

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_result,
    to_wire,
)
from telebot_py.types.message import Message
from telebot_py.types.message_extras import EphemeralMessageParameters, ReplyParameters
from telebot_py.types.suggested_post_types import SuggestedPostParameters


class AttachmentsMixin(Requester):
    """Bot methods for sending photos and general files.

    Parameters accept ``file_id`` strings or HTTP URLs; multipart file uploads
    are intentionally out of scope (JSON payloads only).
    """

    async def send_photo(
        self,
        chat_id: int | str,
        photo: str,
        *,
        business_connection_id: str | None = None,
        direct_messages_topic_id: int | None = None,
        ephemeral_message_parameters: EphemeralMessageParameters | MarkupLike | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a photo by ``file_id`` or HTTP URL (file uploads are out of scope).

        Example:
            >>> msg = await bot.send_photo(123456, "https://example.com/cat.jpg")

        Args:
            chat_id: Unique identifier for the target chat.
            photo: Photo to send as a ``file_id`` string or HTTP URL.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            ephemeral_message_parameters: EphemeralMessageParameters as a
                ``to_dict`` object or dict.
            caption: Photo caption, 0-1024 characters.
            parse_mode: Parse mode for the caption.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
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
            business_connection_id=business_connection_id,
            direct_messages_topic_id=direct_messages_topic_id,
            ephemeral_message_parameters=to_wire(ephemeral_message_parameters),
            caption=caption,
            parse_mode=parse_mode,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendPhoto", payload))

    async def send_document(
        self,
        chat_id: int | str,
        document: str,
        *,
        business_connection_id: str | None = None,
        direct_messages_topic_id: int | None = None,
        ephemeral_message_parameters: EphemeralMessageParameters | MarkupLike | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a general file by ``file_id`` or HTTP URL (file uploads are out of scope).

        Example:
            >>> msg = await bot.send_document(123456, "https://example.com/report.pdf")

        Args:
            chat_id: Unique identifier for the target chat.
            document: Document to send as a ``file_id`` string or HTTP URL.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            ephemeral_message_parameters: EphemeralMessageParameters as a
                ``to_dict`` object or dict.
            caption: Document caption, 0-1024 characters.
            parse_mode: Parse mode for the caption.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
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
            business_connection_id=business_connection_id,
            direct_messages_topic_id=direct_messages_topic_id,
            ephemeral_message_parameters=to_wire(ephemeral_message_parameters),
            caption=caption,
            parse_mode=parse_mode,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendDocument", payload))
