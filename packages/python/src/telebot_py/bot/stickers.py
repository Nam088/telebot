"""Sticker Bot API methods (parity with packages/go/pkg/bot/stickers.go)."""

from __future__ import annotations

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_list_result,
    parse_result,
    to_wire,
)
from telebot_py.types.message import Message
from telebot_py.types.message_extras import EphemeralMessageParameters, ReplyParameters
from telebot_py.types.stickers import Sticker
from telebot_py.types.suggested_post_types import SuggestedPostParameters


class StickersMixin(Requester):
    """Bot methods for sending stickers and fetching forum topic icon stickers.

    Sticker parameters accept ``file_id`` strings or ``attach://`` references;
    multipart file uploads are intentionally out of scope (JSON payloads only).
    """

    async def send_sticker(
        self,
        chat_id: int | str,
        sticker: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        ephemeral_message_parameters: EphemeralMessageParameters | MarkupLike | None = None,
        emoji: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a static, animated, or video sticker.

        Example:
            >>> msg = await bot.send_sticker(123456, "sticker-file-id", emoji="😀")

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            sticker: Sticker to send as a ``file_id`` string.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            ephemeral_message_parameters: EphemeralMessageParameters as a
                ``to_dict`` object or dict.
            emoji: Emoji associated with the sticker.
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

        Telegram API: https://core.telegram.org/bots/api#sendsticker
        """
        payload = clean_payload(
            chat_id=chat_id,
            sticker=sticker,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
            ephemeral_message_parameters=to_wire(ephemeral_message_parameters),
            emoji=emoji,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendSticker", payload))

    async def get_forum_topic_icon_stickers(self) -> list[Sticker]:
        """Get the custom emoji stickers usable as forum topic icons.

        Example:
            >>> stickers = await bot.get_forum_topic_icon_stickers()

        Returns:
            The available forum topic icon Stickers.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#getforumtopiciconstickers
        """
        return parse_list_result(Sticker, await self.request("getForumTopicIconStickers", {}))
