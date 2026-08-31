"""Sticker set management Bot API methods (parity with packages/go/pkg/bot/stickers.go)."""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    UNSET,
    MarkupLike,
    Requester,
    Unset,
    clean_payload,
    optional_list,
    parse_flag,
    parse_list_result,
    parse_result,
    to_wire,
)
from telebot_py.types.files import File
from telebot_py.types.stickers import Sticker, StickerSet


class StickerSetsMixin(Requester):
    """Bot methods for managing sticker sets and their stickers.

    Sticker parameters accept ``file_id`` strings or ``attach://`` references;
    multipart file uploads are intentionally out of scope (JSON payloads only).
    """

    async def get_sticker_set(self, name: str) -> StickerSet:
        """Get a sticker set by name.

        Example:
            >>> sticker_set = await bot.get_sticker_set("TestSet")

        Args:
            name: Name of the sticker set.

        Returns:
            The StickerSet.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#getstickerset
        """
        payload = clean_payload(name=name)
        return parse_result(StickerSet, await self.request("getStickerSet", payload))

    async def get_custom_emoji_stickers(self, custom_emoji_ids: Sequence[str]) -> list[Sticker]:
        """Get stickers of custom emoji by their identifiers.

        Example:
            >>> stickers = await bot.get_custom_emoji_stickers(["5368324170671202286"])

        Args:
            custom_emoji_ids: Custom emoji identifiers; at most 200 per call.

        Returns:
            The matching Stickers.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#getcustomemojistickers
        """
        payload = clean_payload(custom_emoji_ids=list(custom_emoji_ids))
        return parse_list_result(Sticker, await self.request("getCustomEmojiStickers", payload))

    async def upload_sticker_file(self, user_id: int, sticker: str, sticker_format: str) -> File:
        """Prepare a sticker file for use in sticker set methods.

        Example:
            >>> file = await bot.upload_sticker_file(1, "attach://sticker.png", "static")

        Args:
            user_id: User identifier of the sticker file owner.
            sticker: File reference (``attach://`` style or file_id).
            sticker_format: Format of the sticker: ``static``, ``animated``,
                or ``video``.

        Returns:
            The uploaded File.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#uploadstickerfile
        """
        payload = clean_payload(user_id=user_id, sticker=sticker, sticker_format=sticker_format)
        return parse_result(File, await self.request("uploadStickerFile", payload))

    async def create_new_sticker_set(
        self,
        user_id: int,
        name: str,
        title: str,
        stickers: Sequence[MarkupLike],
        *,
        sticker_type: str | None = None,
        needs_repainting: bool | None = None,
    ) -> bool:
        """Create a new sticker set owned by a user.

        Example:
            >>> ok = await bot.create_new_sticker_set(1, "Set_by_bot", "Set", [sticker])

        Args:
            user_id: User identifier of the created sticker set owner.
            name: Short name of the set, e.g. ``myset_by_bot``.
            title: Sticker set title, 1-64 characters.
            stickers: InputSticker items as dicts or ``to_dict`` objects.
            sticker_type: Type of stickers in the set: ``regular``, ``mask``,
                or ``custom_emoji``.
            needs_repainting: Repaint stickers to the current text color.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#createnewstickerset
        """
        payload = clean_payload(
            user_id=user_id,
            name=name,
            title=title,
            stickers=[to_wire(sticker) for sticker in stickers],
            sticker_type=sticker_type,
            needs_repainting=needs_repainting,
        )
        return parse_flag(await self.request("createNewStickerSet", payload))

    async def add_sticker_to_set(self, user_id: int, name: str, sticker: MarkupLike) -> bool:
        """Add a new sticker to a set created by the bot.

        Example:
            >>> ok = await bot.add_sticker_to_set(1, "Set_by_bot", sticker)

        Args:
            user_id: User identifier of the sticker set owner.
            name: Sticker set name.
            sticker: InputSticker item as a dict or ``to_dict`` object.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#addstickertoset
        """
        payload = clean_payload(user_id=user_id, name=name, sticker=to_wire(sticker))
        return parse_flag(await self.request("addStickerToSet", payload))

    async def set_sticker_position_in_set(self, sticker: str, position: int) -> bool:
        """Move a sticker in a set to a specific position.

        Example:
            >>> ok = await bot.set_sticker_position_in_set("s1", 2)

        Args:
            sticker: File identifier of the sticker.
            position: New sticker position in the set, zero-based.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setstickerpositioninset
        """
        payload = clean_payload(sticker=sticker, position=position)
        return parse_flag(await self.request("setStickerPositionInSet", payload))

    async def delete_sticker_from_set(self, sticker: str) -> bool:
        """Delete a sticker from a set created by the bot.

        Example:
            >>> ok = await bot.delete_sticker_from_set("s1")

        Args:
            sticker: File identifier of the sticker.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#deletestickerfromset
        """
        payload = clean_payload(sticker=sticker)
        return parse_flag(await self.request("deleteStickerFromSet", payload))

    async def replace_sticker_in_set(
        self, user_id: int, name: str, old_sticker: str, sticker: MarkupLike
    ) -> bool:
        """Replace an existing sticker in a set created by the bot.

        Example:
            >>> ok = await bot.replace_sticker_in_set(1, "Set_by_bot", "old", new)

        Args:
            user_id: User identifier of the sticker set owner.
            name: Sticker set name.
            old_sticker: File identifier of the replaced sticker.
            sticker: Replacement InputSticker as a dict or ``to_dict`` object.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#replacestickerinset
        """
        payload = clean_payload(
            user_id=user_id, name=name, old_sticker=old_sticker, sticker=to_wire(sticker)
        )
        return parse_flag(await self.request("replaceStickerInSet", payload))

    async def set_sticker_emoji_list(self, sticker: str, emoji_list: Sequence[str]) -> bool:
        """Change the emoji list of a sticker created by the bot.

        Example:
            >>> ok = await bot.set_sticker_emoji_list("s1", ["😀", "😁"])

        Args:
            sticker: File identifier of the sticker.
            emoji_list: New list of emoji; 1-20 items.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setstickeremojilist
        """
        payload = clean_payload(sticker=sticker, emoji_list=list(emoji_list))
        return parse_flag(await self.request("setStickerEmojiList", payload))

    async def set_sticker_keywords(
        self, sticker: str, keywords: Sequence[str] | Unset = UNSET
    ) -> bool:
        """Change the search keywords of a sticker created by the bot.

        Example:
            >>> ok = await bot.set_sticker_keywords("s1", ["hello", "wave"])

        Args:
            sticker: File identifier of the sticker.
            keywords: New search keywords; 0-20 items, total length up to 64
                characters. Omit to leave them untouched; ``[]`` clears them.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setstickerkeywords
        """
        payload = clean_payload(sticker=sticker, keywords=optional_list(keywords))
        return parse_flag(await self.request("setStickerKeywords", payload))

    async def set_sticker_mask_position(
        self, sticker: str, mask_position: MarkupLike | Unset = UNSET
    ) -> bool:
        """Change the mask position of a sticker created by the bot.

        Example:
            >>> ok = await bot.set_sticker_mask_position("s1", {"point": "eyes", ...})

        Args:
            sticker: File identifier of the sticker.
            mask_position: New MaskPosition as a dict or ``to_dict`` object.
                Omit the parameter to remove the mask position.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setstickermaskposition
        """
        position = None if isinstance(mask_position, Unset) else mask_position
        payload = clean_payload(sticker=sticker, mask_position=to_wire(position))
        return parse_flag(await self.request("setStickerMaskPosition", payload))

    async def delete_sticker_set(self, name: str) -> bool:
        """Delete a sticker set created by the bot.

        Example:
            >>> ok = await bot.delete_sticker_set("Set_by_bot")

        Args:
            name: Sticker set name.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#deletestickerset
        """
        payload = clean_payload(name=name)
        return parse_flag(await self.request("deleteStickerSet", payload))

    async def set_custom_emoji_sticker_set_thumbnail(
        self, name: str, custom_emoji_id: str | None = None
    ) -> bool:
        """Set the thumbnail of a custom emoji sticker set.

        Omitting or emptying ``custom_emoji_id`` resets the thumbnail to the
        first sticker of the set.

        Example:
            >>> ok = await bot.set_custom_emoji_sticker_set_thumbnail("Set_by_bot", "emoji-1")

        Args:
            name: Sticker set name.
            custom_emoji_id: Custom emoji identifier from the set, or unset to
                reset the thumbnail.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setcustomemojistickersetthumbnail
        """
        payload = clean_payload(name=name, custom_emoji_id=custom_emoji_id or None)
        return parse_flag(await self.request("setCustomEmojiStickerSetThumbnail", payload))

    async def set_sticker_set_thumbnail(
        self,
        name: str,
        user_id: int,
        format: str,
        *,
        thumbnail: str | None = None,
    ) -> bool:
        """Set the thumbnail of a regular or mask sticker set.

        Example:
            >>> ok = await bot.set_sticker_set_thumbnail("Set_by_bot", 1, "static", thumbnail="t")

        Args:
            name: Sticker set name.
            user_id: User identifier of the sticker set owner.
            format: Format of the thumbnail: ``static``, ``animated``, or
                ``video``.
            thumbnail: Thumbnail file_id or URL; unset to reset to the first
                sticker.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setstickersetthumbnail
        """
        payload = clean_payload(name=name, user_id=user_id, format=format, thumbnail=thumbnail)
        return parse_flag(await self.request("setStickerSetThumbnail", payload))

    async def set_sticker_set_title(self, name: str, title: str) -> bool:
        """Change the title of a sticker set created by the bot.

        Example:
            >>> ok = await bot.set_sticker_set_title("Set_by_bot", "New Title")

        Args:
            name: Sticker set name.
            title: Sticker set title, 1-64 characters.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setstickersettitle
        """
        payload = clean_payload(name=name, title=title)
        return parse_flag(await self.request("setStickerSetTitle", payload))
