"""Telegram sticker types: Sticker, StickerSet, MaskPosition, InputSticker."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.files import File
from telebot_py.types.media import PhotoSize


@dataclasses.dataclass(frozen=True, slots=True)
class MaskPosition(TelegramObject):
    """The position where a mask sticker should be placed.

    Attributes:
        point: The part of the face relative to which the mask should be
            placed. One of ``forehead``, ``eyes``, ``mouth``, or ``chin``.
        x_shift: Shift by X-axis measured in widths of the mask scaled to the
            face size, from left to right.
        y_shift: Shift by Y-axis measured in heights of the mask scaled to the
            face size, from top to bottom.
        scale: Mask scaling coefficient.
    """

    point: str
    x_shift: float
    y_shift: float
    scale: float


@dataclasses.dataclass(frozen=True, slots=True)
class Sticker(TelegramObject):
    """A sticker in a message or sticker set.

    Attributes:
        file_id: Identifier for this file, which can be used to download or
            reuse the file.
        file_unique_id: Unique identifier for this file, which is supposed to
            be the same over time and for different bots.
        type: Type of the sticker, currently one of ``regular``, ``mask``,
            ``custom_emoji``.
        width: Sticker width in pixels.
        height: Sticker height in pixels.
        is_animated: Whether the sticker is animated.
        is_video: Whether the sticker is a video sticker.
        thumbnail: Sticker thumbnail in the .WEBP or .JPG format.
        emoji: Emoji associated with the sticker.
        set_name: Name of the sticker set to which the sticker belongs.
        premium_animation: For premium regular stickers, premium animation for
            the sticker.
        mask_position: For mask stickers, the position where the mask should
            be placed.
        custom_emoji_id: For custom emoji stickers, unique identifier of the
            custom emoji.
        needs_repainting: Whether the sticker must be repainted to a text
            color in messages.
        file_size: File size in bytes.
    """

    file_id: str
    file_unique_id: str
    type: str
    width: int
    height: int
    is_animated: bool
    is_video: bool
    thumbnail: PhotoSize | None = None
    emoji: str | None = None
    set_name: str | None = None
    premium_animation: File | None = None
    mask_position: MaskPosition | None = None
    custom_emoji_id: str | None = None
    needs_repainting: bool | None = None
    file_size: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class StickerSet(TelegramObject):
    """A sticker set.

    Attributes:
        name: Sticker set name.
        title: Sticker set title.
        sticker_type: Type of stickers in the set, currently one of
            ``regular``, ``mask``, ``custom_emoji``.
        stickers: List of all stickers in the set.
        thumbnail: Sticker set thumbnail in the .WEBP, .TGS, or .WEBM format.
    """

    name: str
    title: str
    sticker_type: str
    stickers: list[Sticker]
    thumbnail: PhotoSize | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class InputSticker(TelegramObject):
    """A sticker to be added to a sticker set.

    Example:
        >>> sticker = InputSticker(sticker="file-id", format="static", emoji_list=["😀"])

    Attributes:
        sticker: The added sticker; a file_id string or a file reference
            mapping.
        format: Format of the sticker, one of ``static``, ``animated``,
            ``video``.
        emoji_list: List of 1-20 emoji associated with the sticker.
        mask_position: Position where the mask should be placed on faces; for
            ``mask`` stickers only.
        keywords: List of 0-20 search keywords for the sticker with total
            length up to 64 characters; for ``regular`` and ``custom_emoji``
            stickers only.
    """

    sticker: str | t.Mapping[str, object]
    format: str
    emoji_list: list[str]
    mask_position: MaskPosition | None = None
    keywords: list[str] | None = None
