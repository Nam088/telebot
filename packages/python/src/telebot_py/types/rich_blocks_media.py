"""Rich message blocks that carry media, plus the shared caption and cell types.

Field names, required-ness and ``type`` literals follow the official Telegram
Bot API docs for the ``RichBlock*`` classes (Bot API 10.3). Media inputs on the
sending side are untyped here because ``InputMedia*`` has no dataclasses in this
package yet, matching the ``object`` treatment ``link_preview_options`` gets in
:mod:`telebot_py.types.message_extras`.

This module holds the leaf types of the block tree: :class:`RichBlockCaption`
and :class:`RichBlockTableCell` live here because the modules describing the
text blocks import them, and :meth:`TelegramObject.from_dict` resolves
annotations through the defining module's globals, so they must not be defined
in a module that imports the block unions.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.common import Location
from telebot_py.types.media import Animation, Audio, Document, PhotoSize, Video, Voice
from telebot_py.types.rich_text import RichText


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockCaption(TelegramObject):
    """Caption of a rich formatted block.

    Attributes:
        text: Block caption.
        credit: Block credit, which corresponds to the HTML tag <cite>.

    Telegram API: https://core.telegram.org/bots/api#richblockcaption
    """

    text: RichText
    credit: RichText | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockTableCell(TelegramObject):
    """Cell in a table; used by both received and outgoing tables.

    Attributes:
        align: Horizontal cell content alignment; 'left', 'center' or 'right'.
        valign: Vertical cell content alignment; 'top', 'middle' or 'bottom'.
        text: Text in the cell; if omitted, the cell is invisible.
        is_header: True, if the cell is a header cell.
        colspan: Number of columns the cell spans, if bigger than 1.
        rowspan: Number of rows the cell spans, if bigger than 1.

    Telegram API: https://core.telegram.org/bots/api#richblocktablecell
    """

    align: str
    valign: str
    text: RichText | None = None
    is_header: bool | None = None
    colspan: int | None = None
    rowspan: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockAnimation(TelegramObject):
    """A block with an animation; ``type`` is always 'animation'.

    Attributes:
        animation: The animation.
        has_spoiler: True, if the media preview is covered by a spoiler.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockanimation
    """

    animation: Animation
    type: str = "animation"
    has_spoiler: bool | None = None
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "animation")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockAudio(TelegramObject):
    """A block with a music file; ``type`` is always 'audio'.

    Attributes:
        audio: The audio.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockaudio
    """

    audio: Audio
    type: str = "audio"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "audio")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockDocument(TelegramObject):
    """A block with a general file; ``type`` is always 'document'.

    Attributes:
        document: The document.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockdocument
    """

    document: Document
    type: str = "document"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "document")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockPhoto(TelegramObject):
    """A block with a photo; ``type`` is always 'photo'.

    Attributes:
        photo: Available sizes of the photo.
        has_spoiler: True, if the media preview is covered by a spoiler.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockphoto
    """

    photo: list[PhotoSize]
    type: str = "photo"
    has_spoiler: bool | None = None
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "photo")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockVideo(TelegramObject):
    """A block with a video; ``type`` is always 'video'.

    Attributes:
        video: The video.
        has_spoiler: True, if the media preview is covered by a spoiler.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockvideo
    """

    video: Video
    type: str = "video"
    has_spoiler: bool | None = None
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "video")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockVoiceNote(TelegramObject):
    """A block with a voice note; ``type`` is always 'voice_note'.

    Attributes:
        voice_note: The voice note.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockvoicenote
    """

    voice_note: Voice
    type: str = "voice_note"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "voice_note")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockMap(TelegramObject):
    """A block with a map; ``type`` is always 'map'.

    Attributes:
        location: Location of the center of the map.
        zoom: Map zoom level.
        width: Expected width of the map.
        height: Expected height of the map.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockmap
    """

    location: Location
    zoom: int
    width: int
    height: int
    type: str = "map"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "map")
