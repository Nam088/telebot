"""Outgoing rich message blocks that carry media, and embedded media references.

Field names, required-ness and ``type`` literals follow the official Telegram
Bot API docs for the ``InputRichBlock*`` classes and ``InputRichMessageMedia``
(Bot API 10.3).

Remarks:
    ``InputMedia*`` has no dataclasses in this package, so the media fields
    Telegram types that way are annotated ``object`` and passed through as a
    mapping or any object exposing ``to_dict``; the bot methods accept both.
    Telegram ignores the caption inside these media objects in favour of the
    block's own ``caption``.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.common import Location
from telebot_py.types.rich_blocks_media import RichBlockCaption


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockAnimation(TelegramObject):
    """An animation block to send; ``type`` is always 'animation'.

    Attributes:
        animation: The InputMediaAnimation to send; its caption is ignored.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockanimation
    """

    animation: object
    type: str = "animation"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "animation")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockAudio(TelegramObject):
    """A music file block to send; ``type`` is always 'audio'.

    Attributes:
        audio: The InputMediaAudio to send; its caption is ignored.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockaudio
    """

    audio: object
    type: str = "audio"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "audio")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockDocument(TelegramObject):
    """A general file block to send; ``type`` is always 'document'.

    Attributes:
        document: The InputMediaDocument to send; its caption is ignored.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockdocument
    """

    document: object
    type: str = "document"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "document")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockPhoto(TelegramObject):
    """A photo block to send; ``type`` is always 'photo'.

    Attributes:
        photo: The InputMediaPhoto to send; its caption is ignored.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockphoto
    """

    photo: object
    type: str = "photo"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "photo")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockVideo(TelegramObject):
    """A video block to send; ``type`` is always 'video'.

    Attributes:
        video: The InputMediaVideo to send; its caption is ignored.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockvideo
    """

    video: object
    type: str = "video"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "video")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockVoiceNote(TelegramObject):
    """A voice note block to send; ``type`` is always 'voice_note'.

    Attributes:
        voice_note: The InputMediaVoiceNote to send; its caption is ignored.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockvoicenote
    """

    voice_note: object
    type: str = "voice_note"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "voice_note")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockMap(TelegramObject):
    """A map block to send; ``type`` is always 'map'.

    The map's width and height must not exceed 10000 in total, and their ratio
    must be at most 20.

    Attributes:
        location: Location of the center of the map.
        zoom: Map zoom level; 0-24.
        width: Map width; 0-10000.
        height: Map height; 0-10000.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockmap
    """

    location: Location
    type: str = "map"
    zoom: int | None = None
    width: int | None = None
    height: int | None = None
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "map")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichMessageMedia(TelegramObject):
    """A media element embedded in an outgoing rich message.

    Attributes:
        id: Unique identifier used in a tg://photo?id=, tg://video?id=,
            tg://document?id= or tg://audio?id= link; 1-64 characters of
            A-Z, a-z, 0-9, '_' and '-'.
        media: The media to send; everything except the media itself and its
            properties is ignored.

    Telegram API: https://core.telegram.org/bots/api#inputrichmessagemedia
    """

    id: str
    media: object
