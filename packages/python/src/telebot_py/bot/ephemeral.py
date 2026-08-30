"""Ephemeral message Bot API methods.

Ported from node ``client/methods/business/ephemeral.ts``
(editEphemeralMessageText, editEphemeralMessageCaption,
editEphemeralMessageMedia, editEphemeralMessageReplyMarkup,
deleteEphemeralMessage).
"""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    to_wire,
)


class EphemeralMixin(Requester):
    """Bot methods for editing and deleting ephemeral messages."""

    async def edit_ephemeral_message_text(
        self,
        chat_id: int | str,
        receiver_user_id: int,
        ephemeral_message_id: int,
        *,
        text: str | None = None,
        parse_mode: str | None = None,
        entities: Sequence[MarkupLike] | None = None,
        rich_message: MarkupLike | None = None,
        link_preview_options: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> bool:
        """Edit the text of an ephemeral message.

        Example:
            >>> result = await bot.edit_ephemeral_message_text(
            ...     100, 42, 7, text="new text"
            ... )

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            receiver_user_id: Identifier of the user who received the message.
            ephemeral_message_id: Identifier of the ephemeral message to edit.
            text: New text of the message, 1-4096 characters after entity
                parsing; required unless ``rich_message`` is given.
            parse_mode: Mode for parsing entities in the message text.
            entities: MessageEntity items as ``to_dict`` objects or dicts.
            rich_message: InputRichMessage with the new rich content.
            link_preview_options: LinkPreviewOptions for the message.
            reply_markup: InlineKeyboardMarkup for the message.

        Returns:
            True on success. Unlike the ``edit_message_*`` family, this method
            never returns the edited Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            receiver_user_id=receiver_user_id,
            ephemeral_message_id=ephemeral_message_id,
            text=text,
            parse_mode=parse_mode,
            entities=[to_wire(entity) for entity in entities] if entities is not None else None,
            rich_message=to_wire(rich_message),
            link_preview_options=to_wire(link_preview_options),
            reply_markup=to_wire(reply_markup),
        )
        return parse_flag(await self.request("editEphemeralMessageText", payload))

    async def edit_ephemeral_message_caption(
        self,
        chat_id: int | str,
        receiver_user_id: int,
        ephemeral_message_id: int,
        *,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MarkupLike] | None = None,
        show_caption_above_media: bool | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> bool:
        """Edit the caption of an ephemeral media message.

        Example:
            >>> result = await bot.edit_ephemeral_message_caption(
            ...     100, 42, 7, caption="new caption"
            ... )

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            receiver_user_id: Identifier of the user who received the message.
            ephemeral_message_id: Identifier of the ephemeral message to edit.
            caption: New caption of the message, 0-1024 characters after
                entities parsing.
            parse_mode: Mode for parsing entities in the caption.
            caption_entities: MessageEntity items as ``to_dict`` objects or
                dicts.
            show_caption_above_media: Whether the caption must be shown above
                the message media.
            reply_markup: InlineKeyboardMarkup for the message.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            receiver_user_id=receiver_user_id,
            ephemeral_message_id=ephemeral_message_id,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[to_wire(entity) for entity in caption_entities]
            if caption_entities is not None
            else None,
            show_caption_above_media=show_caption_above_media,
            reply_markup=to_wire(reply_markup),
        )
        return parse_flag(await self.request("editEphemeralMessageCaption", payload))

    async def edit_ephemeral_message_media(
        self,
        chat_id: int | str,
        receiver_user_id: int,
        ephemeral_message_id: int,
        media: MarkupLike,
        *,
        reply_markup: MarkupLike | None = None,
    ) -> bool:
        """Edit the media of an ephemeral message.

        Example:
            >>> result = await bot.edit_ephemeral_message_media(
            ...     100, 42, 7, {"type": "photo", "media": "file-id-1"}
            ... )

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            receiver_user_id: Identifier of the user who received the message.
            ephemeral_message_id: Identifier of the ephemeral message to edit.
            media: InputMedia object (dict or ``to_dict`` object) describing
                the new media content.
            reply_markup: InlineKeyboardMarkup for the message.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            receiver_user_id=receiver_user_id,
            ephemeral_message_id=ephemeral_message_id,
            media=to_wire(media),
            reply_markup=to_wire(reply_markup),
        )
        return parse_flag(await self.request("editEphemeralMessageMedia", payload))

    async def edit_ephemeral_message_reply_markup(
        self,
        chat_id: int | str,
        receiver_user_id: int,
        ephemeral_message_id: int,
        *,
        reply_markup: MarkupLike | None = None,
    ) -> bool:
        """Edit the inline keyboard of an ephemeral message.

        Example:
            >>> result = await bot.edit_ephemeral_message_reply_markup(
            ...     100, 42, 7, reply_markup=markup
            ... )

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            receiver_user_id: Identifier of the user who received the message.
            ephemeral_message_id: Identifier of the ephemeral message to edit.
            reply_markup: New InlineKeyboardMarkup; omit or pass ``None``
                according to Telegram's semantics to remove the keyboard.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            receiver_user_id=receiver_user_id,
            ephemeral_message_id=ephemeral_message_id,
            reply_markup=to_wire(reply_markup),
        )
        return parse_flag(await self.request("editEphemeralMessageReplyMarkup", payload))

    async def delete_ephemeral_message(
        self, chat_id: int | str, receiver_user_id: int, ephemeral_message_id: int
    ) -> bool:
        """Delete an ephemeral message.

        Example:
            >>> ok = await bot.delete_ephemeral_message(100, 42, 7)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            receiver_user_id: Identifier of the user who received the message.
            ephemeral_message_id: Identifier of the ephemeral message to
                delete.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            receiver_user_id=receiver_user_id,
            ephemeral_message_id=ephemeral_message_id,
        )
        return parse_flag(await self.request("deleteEphemeralMessage", payload))
