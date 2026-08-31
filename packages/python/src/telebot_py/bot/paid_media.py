"""Paid media and live photo Bot API methods.

Ported from node ``client/methods/messages/send-media.ts`` (sendPaidMedia,
sendLivePhoto).
"""

from __future__ import annotations

from collections.abc import Sequence

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


class PaidMediaMixin(Requester):
    """Bot methods for sending paid media and live photos."""

    async def send_paid_media(
        self,
        chat_id: int | str,
        star_count: int,
        media: Sequence[MarkupLike],
        *,
        payload: str | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MarkupLike] | None = None,
        show_caption_above_media: bool | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
    ) -> Message:
        """Send paid media that users unlock by paying Telegram Stars.

        Remarks:
            ``media`` holds InputPaidMedia objects (``InputPaidMediaPhoto`` /
            ``InputPaidMediaVideo`` instances or plain dicts), up to 10 items.
            Sending media groups with 2-10 items requires all items to share a
            type; the JSON-only client can't attach new files, so pass a
            ``file_id`` or an HTTP URL.

        Example:
            >>> from telebot_py.types import InputPaidMediaPhoto
            >>> message = await bot.send_paid_media(
            ...     123, 50, [InputPaidMediaPhoto(type="photo", media="file-id-1")]
            ... )

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            star_count: Number of Telegram Stars that must be paid to buy
                access to the media; 1-25000.
            media: InputPaidMedia items describing the media to send; up to 10
                items.
            payload: Bot-defined paid media payload, 0-128 bytes, not shown to
                the user.
            caption: Media caption, 0-1024 characters after entities parsing.
            parse_mode: Mode for parsing entities in the media caption.
            caption_entities: MessageEntity items as ``to_dict`` objects or
                dicts; can be specified instead of ``parse_mode``.
            show_caption_above_media: Whether the caption must be shown above
                the message media.
            disable_notification: Sends the message silently.
            protect_content: Protects the contents from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
            reply_parameters: ReplyParameters object describing the message to
                reply to.
            reply_markup: InlineKeyboardMarkup for the message.
            business_connection_id: Unique identifier of the business connection
                on behalf of which the message will be sent.
            message_thread_id: Unique identifier of the target message thread
                (topic) of a forum.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendpaidmedia
        """
        body: dict[str, object] = clean_payload(
            chat_id=chat_id,
            star_count=star_count,
            media=[to_wire(item) for item in media],
            payload=payload,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[to_wire(entity) for entity in caption_entities]
            if caption_entities is not None
            else None,
            show_caption_above_media=show_caption_above_media,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
        )
        return parse_result(Message, await self.request("sendPaidMedia", body))

    async def send_live_photo(
        self,
        chat_id: int | str,
        live_photo: str,
        photo: str,
        *,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MarkupLike] | None = None,
        show_caption_above_media: bool | None = None,
        has_spoiler: bool | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        ephemeral_message_parameters: EphemeralMessageParameters | MarkupLike | None = None,
    ) -> Message:
        """Send a live photo (a short video plus its static photo).

        Remarks:
            ``live_photo`` and ``photo`` are ``file_id`` references to already
            uploaded files; the video must be no longer than 10 seconds and must
            not exceed 10 MB. Sending live photos by a URL is unsupported.

        Example:
            >>> message = await bot.send_live_photo(123, "video-file-id", "photo-file-id")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            live_photo: Live photo video to send.
            photo: The static photo to send.
            caption: Live photo caption, 0-1024 characters after entities
                parsing.
            parse_mode: Mode for parsing entities in the caption.
            caption_entities: MessageEntity items as ``to_dict`` objects or
                dicts; can be specified instead of ``parse_mode``.
            show_caption_above_media: Whether the caption must be shown above
                the message media.
            has_spoiler: Whether the photo is covered by a spoiler animation.
            disable_notification: Sends the message silently.
            protect_content: Protects the contents from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
            reply_parameters: ReplyParameters object describing the message to
                reply to.
            reply_markup: InlineKeyboardMarkup for the message.
            business_connection_id: Unique identifier of the business connection
                on behalf of which the message will be sent.
            message_thread_id: Unique identifier of the target message thread
                (topic) of a forum.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            ephemeral_message_parameters: EphemeralMessageParameters as a
                ``to_dict`` object or dict.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendlivephoto
        """
        payload = clean_payload(
            chat_id=chat_id,
            live_photo=live_photo,
            photo=photo,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[to_wire(entity) for entity in caption_entities]
            if caption_entities is not None
            else None,
            show_caption_above_media=show_caption_above_media,
            has_spoiler=has_spoiler,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
            ephemeral_message_parameters=to_wire(ephemeral_message_parameters),
        )
        return parse_result(Message, await self.request("sendLivePhoto", payload))
