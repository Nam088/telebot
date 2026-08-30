"""Message editing and deletion Bot API methods."""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    parse_message_or_true,
    parse_result,
    to_wire,
)
from telebot_py.types.common import MessageEntity, Poll
from telebot_py.types.message import Message


class EditsMixin(Requester):
    """Bot methods editing or deleting messages already sent."""

    async def edit_message_text(
        self,
        text: str,
        *,
        chat_id: int | str | None = None,
        message_id: int | None = None,
        inline_message_id: str | None = None,
        parse_mode: str | None = None,
        entities: Sequence[MessageEntity] | None = None,
        link_preview_options: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message | bool:
        """Edit the text of a message sent by the bot or via the bot.

        Example:
            >>> msg = await bot.edit_message_text("new text", chat_id=1, message_id=2)

        Args:
            text: New text of the message, 1-4096 characters.
            chat_id: Chat containing the message; required unless
                ``inline_message_id`` is given.
            message_id: Identifier of the message to edit; required unless
                ``inline_message_id`` is given.
            inline_message_id: Identifier of the inline message to edit,
                instead of ``chat_id`` and ``message_id``.
            parse_mode: Parse mode for the new text entities.
            entities: Special entities for the new text.
            link_preview_options: Link preview generation options.
            reply_markup: New inline keyboard for the message; dict or
                ``to_dict`` object.

        Returns:
            The edited Message, or True when an inline message was edited.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#editmessagetext
        """
        payload = clean_payload(
            text=text,
            chat_id=chat_id,
            message_id=message_id,
            inline_message_id=inline_message_id,
            parse_mode=parse_mode,
            entities=[entity.to_dict() for entity in entities] if entities is not None else None,
            link_preview_options=to_wire(link_preview_options),
            reply_markup=to_wire(reply_markup),
        )
        return parse_message_or_true(await self.request("editMessageText", payload))

    async def edit_message_caption(
        self,
        *,
        chat_id: int | str | None = None,
        message_id: int | None = None,
        inline_message_id: str | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MessageEntity] | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message | bool:
        """Edit the caption of a media message sent by the bot or via the bot.

        Example:
            >>> msg = await bot.edit_message_caption(chat_id=1, message_id=2, caption="new")

        Args:
            chat_id: Chat containing the message; required unless
                ``inline_message_id`` is given.
            message_id: Identifier of the message to edit; required unless
                ``inline_message_id`` is given.
            inline_message_id: Identifier of the inline message to edit,
                instead of ``chat_id`` and ``message_id``.
            caption: New caption of the message, 0-1024 characters; omit to
                remove the caption.
            parse_mode: Parse mode for the new caption entities.
            caption_entities: Special entities for the new caption.
            reply_markup: New inline keyboard for the message; dict or
                ``to_dict`` object.

        Returns:
            The edited Message, or True when an inline message was edited.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#editmessagecaption
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_id=message_id,
            inline_message_id=inline_message_id,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[entity.to_dict() for entity in caption_entities]
            if caption_entities is not None
            else None,
            reply_markup=to_wire(reply_markup),
        )
        return parse_message_or_true(await self.request("editMessageCaption", payload))

    async def edit_message_media(
        self,
        media: MarkupLike,
        *,
        chat_id: int | str | None = None,
        message_id: int | None = None,
        inline_message_id: str | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message | bool:
        """Edit the media of a media message sent by the bot or via the bot.

        Example:
            >>> msg = await bot.edit_message_media(
            ...     {"type": "photo", "media": "https://example.com/new.jpg"},
            ...     chat_id=1,
            ...     message_id=2,
            ... )

        Args:
            media: The new media content, an InputMedia-family mapping (keys
                ``type``, ``media``, and type-specific optionals) given as a
                dict or ``to_dict`` object. Only ``file_id``/HTTP URL media
                references are supported; file uploads are out of scope.
            chat_id: Chat containing the message; required unless
                ``inline_message_id`` is given.
            message_id: Identifier of the message to edit; required unless
                ``inline_message_id`` is given.
            inline_message_id: Identifier of the inline message to edit,
                instead of ``chat_id`` and ``message_id``.
            reply_markup: New inline keyboard for the message; dict or
                ``to_dict`` object.

        Returns:
            The edited Message, or True when an inline message was edited.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#editmessagemedia
        """
        payload = clean_payload(
            media=to_wire(media),
            chat_id=chat_id,
            message_id=message_id,
            inline_message_id=inline_message_id,
            reply_markup=to_wire(reply_markup),
        )
        return parse_message_or_true(await self.request("editMessageMedia", payload))

    async def edit_message_live_location(
        self,
        latitude: float,
        longitude: float,
        *,
        chat_id: int | str | None = None,
        message_id: int | None = None,
        inline_message_id: str | None = None,
        live_period: int | None = None,
        horizontal_accuracy: float | None = None,
        heading: int | None = None,
        proximity_alert_radius: int | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message | bool:
        """Edit the live location of a live-location message.

        Example:
            >>> msg = await bot.edit_message_live_location(37.5, -122.5, chat_id=1, message_id=2)

        Args:
            latitude: New latitude of the location, in degrees.
            longitude: New longitude of the location, in degrees.
            chat_id: Chat containing the message; required unless
                ``inline_message_id`` is given.
            message_id: Identifier of the message to edit; required unless
                ``inline_message_id`` is given.
            inline_message_id: Identifier of the inline message to edit,
                instead of ``chat_id`` and ``message_id``.
            live_period: New period in seconds during which the location can
                be updated, starting from the message send date.
            horizontal_accuracy: Radius of uncertainty for the location,
                in meters; 0-1500.
            heading: Direction in which the user is moving, in degrees; 1-360.
            proximity_alert_radius: Maximum distance for proximity alerts about
                approaching another chat member, in meters; 1-100000.
            reply_markup: New inline keyboard for the message; dict or
                ``to_dict`` object.

        Returns:
            The edited Message, or True when an inline message was edited.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#editmessagelivelocation
        """
        payload = clean_payload(
            latitude=latitude,
            longitude=longitude,
            chat_id=chat_id,
            message_id=message_id,
            inline_message_id=inline_message_id,
            live_period=live_period,
            horizontal_accuracy=horizontal_accuracy,
            heading=heading,
            proximity_alert_radius=proximity_alert_radius,
            reply_markup=to_wire(reply_markup),
        )
        return parse_message_or_true(await self.request("editMessageLiveLocation", payload))

    async def stop_message_live_location(
        self,
        *,
        chat_id: int | str | None = None,
        message_id: int | None = None,
        inline_message_id: str | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message | bool:
        """Stop updating a live location message before its period expires.

        Example:
            >>> msg = await bot.stop_message_live_location(chat_id=1, message_id=2)

        Args:
            chat_id: Chat containing the message; required unless
                ``inline_message_id`` is given.
            message_id: Identifier of the message to stop; required unless
                ``inline_message_id`` is given.
            inline_message_id: Identifier of the inline message to stop,
                instead of ``chat_id`` and ``message_id``.
            reply_markup: New inline keyboard for the message; dict or
                ``to_dict`` object.

        Returns:
            The stopped Message, or True when an inline message was stopped.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#stopmessagelivelocation
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_id=message_id,
            inline_message_id=inline_message_id,
            reply_markup=to_wire(reply_markup),
        )
        return parse_message_or_true(await self.request("stopMessageLiveLocation", payload))

    async def stop_poll(
        self,
        chat_id: int | str,
        message_id: int,
        *,
        reply_markup: MarkupLike | None = None,
    ) -> Poll:
        """Stop a poll which was sent by the bot.

        Example:
            >>> poll = await bot.stop_poll(123456, 7)
            >>> poll.total_voter_count
            3

        Args:
            chat_id: Chat containing the poll message.
            message_id: Identifier of the message with the poll.
            reply_markup: New inline keyboard for the message; dict or
                ``to_dict`` object.

        Returns:
            The final stopped Poll state.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#stoppoll
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_id=message_id,
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Poll, await self.request("stopPoll", payload))

    async def edit_message_reply_markup(
        self,
        *,
        chat_id: int | str | None = None,
        message_id: int | None = None,
        inline_message_id: str | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message | bool:
        """Edit only the reply markup of a message sent by the bot or via the bot.

        Example:
            >>> msg = await bot.edit_message_reply_markup(chat_id=1, message_id=2, reply_markup={})

        Args:
            chat_id: Chat containing the message; required unless
                ``inline_message_id`` is given.
            message_id: Identifier of the message to edit; required unless
                ``inline_message_id`` is given.
            inline_message_id: Identifier of the inline message to edit,
                instead of ``chat_id`` and ``message_id``.
            reply_markup: New inline keyboard for the message; pass ``{}`` to
                remove the keyboard. Dict or ``to_dict`` object.

        Returns:
            The edited Message, or True when an inline message was edited.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#editmessagereplymarkup
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_id=message_id,
            inline_message_id=inline_message_id,
            reply_markup=to_wire(reply_markup),
        )
        return parse_message_or_true(await self.request("editMessageReplyMarkup", payload))

    async def delete_message(self, chat_id: int | str, message_id: int) -> bool:
        """Delete a message in a chat.

        Telegram imposes deletion limits (age and media kind); a failed
        deletion raises rather than returning False.

        Example:
            >>> await bot.delete_message(123456, 7)

        Args:
            chat_id: Chat containing the message.
            message_id: Identifier of the message to delete.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#deletemessage
        """
        payload = {"chat_id": chat_id, "message_id": message_id}
        return parse_flag(await self.request("deleteMessage", payload))

    async def send_message_draft(
        self,
        chat_id: int | str,
        draft_id: int,
        *,
        message_thread_id: int | None = None,
        text: str | None = None,
        parse_mode: str | None = None,
        entities: Sequence[MarkupLike] | None = None,
        can_stop: bool | None = None,
        keep_on_stop: bool | None = None,
    ) -> bool:
        """Stream a partial message draft while the final answer is generated.

        Remarks:
            The draft is ephemeral: it acts as a temporary 30-second preview,
            so the bot must still call ``sendMessage`` with the complete text
            to persist the message. Passing an empty ``text`` shows a
            "Thinking..." placeholder.

        Example:
            >>> ok = await bot.send_message_draft(123, 1, text="Working on it")

        Args:
            chat_id: Unique identifier for the target private chat.
            draft_id: Unique identifier of the message draft; must be
                non-zero. Drafts sharing an identifier are animated.
            message_thread_id: Unique identifier of the target message thread.
            text: Text of the draft, 0-4096 characters after entities parsing.
            parse_mode: Mode for parsing entities in the draft text.
            entities: MessageEntity items as ``to_dict`` objects or dicts; can
                be specified instead of ``parse_mode``.
            can_stop: Whether to show the user a button stopping further
                drafts.
            keep_on_stop: Whether to keep the draft in the chat when the stop
                button is pressed.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendmessagedraft
        """
        payload = clean_payload(
            chat_id=chat_id,
            draft_id=draft_id,
            message_thread_id=message_thread_id,
            text=text,
            parse_mode=parse_mode,
            entities=[to_wire(entity) for entity in entities] if entities is not None else None,
            can_stop=can_stop,
            keep_on_stop=keep_on_stop,
        )
        return parse_flag(await self.request("sendMessageDraft", payload))
