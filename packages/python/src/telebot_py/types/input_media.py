"""Outgoing media payloads for ``send*``, ``send_media_group`` and rich blocks.

Field names, required-ness and ``type`` literals follow the official Telegram
Bot API docs for the ``InputMedia*`` classes (Bot API 10.3). These objects
describe *what to upload or reuse*, so unlike the received media types in
:mod:`telebot_py.types.media` every file reference here is a string: a
``file_id``, an HTTP URL, or an ``attach://<file_attach_name>`` reference.

Remarks:
    The docs model ``InputMedia`` as an abstract union; this module exposes the
    matching :data:`InputMedia` alias plus one frozen dataclass per variant.
    ``media`` and ``type`` are required on the wire, so ``media`` is the only
    positional field and ``type`` carries its variant literal as a default.
    The remaining documented variants (``InputMediaLink``,
    ``InputMediaLivePhoto``, ``InputMediaLocation``, ``InputMediaSticker`` and
    ``InputMediaVenue``) belong to other send methods and are not modeled here.
"""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.common import MessageEntity


@dataclasses.dataclass(frozen=True, slots=True)
class InputMediaPhoto(TelegramObject):
    """A photo to send.

    Attributes:
        media: File to send: a ``file_id`` of a photo settled on the Telegram
            servers, an HTTP URL for Telegram to fetch, or
            ``attach://<file_attach_name>`` for a file uploaded in this request.
        type: Type of the media, always ``photo``.
        caption: Photo caption, 0-1024 characters after entities parsing.
        parse_mode: Mode for parsing entities in the caption.
        caption_entities: Caption entities, giving more control than
            ``parse_mode``; up to 50 entities.
        show_caption_above_media: Whether the caption must be shown above the
            message media.
        has_spoiler: Pass ``True`` if the photo needs to be covered by a
            spoiler.

    Telegram API: https://core.telegram.org/bots/api#inputmediaphoto
    """

    media: str
    type: str = "photo"
    caption: str | None = None
    parse_mode: str | None = None
    caption_entities: list[MessageEntity] | None = None
    show_caption_above_media: bool | None = None
    has_spoiler: bool | None = None

    _DISCRIMINATOR = ("type", "photo")


@dataclasses.dataclass(frozen=True, slots=True)
class InputMediaVideo(TelegramObject):
    """A video to send.

    Attributes:
        media: File to send: a ``file_id`` of a video settled on the Telegram
            servers, an HTTP URL for Telegram to fetch, or
            ``attach://<file_attach_name>`` for a file uploaded in this request.
        type: Type of the media, always ``video``.
        thumbnail: Thumbnail sent along with the video, as a ``file_id`` or an
            ``attach://<file_attach_name>`` reference.
        cover: Cover for the video in the message; a ``file_id`` or an
            ``attach://<file_attach_name>`` reference.
        start_timestamp: Start timestamp for the cover image.
        caption: Video caption, 0-1024 characters after entities parsing.
        parse_mode: Mode for parsing entities in the caption.
        caption_entities: Caption entities, giving more control than
            ``parse_mode``; up to 50 entities.
        show_caption_above_media: Whether the caption must be shown above the
            message media.
        width: Video width.
        height: Video height.
        duration: Video duration in seconds.
        supports_streaming: Whether the uploaded video is suitable for
            streaming.
        has_spoiler: Pass ``True`` if the video needs to be covered by a
            spoiler.

    Telegram API: https://core.telegram.org/bots/api#inputmediavideo
    """

    media: str
    type: str = "video"
    thumbnail: str | None = None
    cover: str | None = None
    start_timestamp: int | None = None
    caption: str | None = None
    parse_mode: str | None = None
    caption_entities: list[MessageEntity] | None = None
    show_caption_above_media: bool | None = None
    width: int | None = None
    height: int | None = None
    duration: int | None = None
    supports_streaming: bool | None = None
    has_spoiler: bool | None = None

    _DISCRIMINATOR = ("type", "video")


@dataclasses.dataclass(frozen=True, slots=True)
class InputMediaAudio(TelegramObject):
    """An audio file to send, treated as music by Telegram clients.

    Attributes:
        media: File to send: a ``file_id`` of an audio file settled on the
            Telegram servers, an HTTP URL for Telegram to fetch, or
            ``attach://<file_attach_name>`` for a file uploaded in this request.
        type: Type of the media, always ``audio``.
        thumbnail: Thumbnail sent along with the audio, as a ``file_id`` or an
            ``attach://<file_attach_name>`` reference; ignored by clients.
        caption: Audio caption, 0-1024 characters after entities parsing.
        parse_mode: Mode for parsing entities in the caption.
        caption_entities: Caption entities, giving more control than
            ``parse_mode``; up to 50 entities.
        duration: Duration of the audio in seconds.
        performer: Performer.
        title: Track name.

    Telegram API: https://core.telegram.org/bots/api#inputmediaaudio
    """

    media: str
    type: str = "audio"
    thumbnail: str | None = None
    caption: str | None = None
    parse_mode: str | None = None
    caption_entities: list[MessageEntity] | None = None
    duration: int | None = None
    performer: str | None = None
    title: str | None = None

    _DISCRIMINATOR = ("type", "audio")


@dataclasses.dataclass(frozen=True, slots=True)
class InputMediaDocument(TelegramObject):
    """A general file to send (as opposed to a photo, audio or video).

    Attributes:
        media: File to send: a ``file_id`` of a document settled on the
            Telegram servers, an HTTP URL for Telegram to fetch, or
            ``attach://<file_attach_name>`` for a file uploaded in this request.
        type: Type of the media, always ``document``.
        thumbnail: Thumbnail sent along with the document, as a ``file_id`` or
            an ``attach://<file_attach_name>`` reference; only for JPEG or GIF.
        caption: Document caption, 0-1024 characters after entities parsing.
        parse_mode: Mode for parsing entities in the caption.
        caption_entities: Caption entities, giving more control than
            ``parse_mode``; up to 50 entities.
        disable_content_type_detection: Whether automatic content type
            detection must be disabled; may prevent the document from being
            sent at all.

    Telegram API: https://core.telegram.org/bots/api#inputmediadocument
    """

    media: str
    type: str = "document"
    thumbnail: str | None = None
    caption: str | None = None
    parse_mode: str | None = None
    caption_entities: list[MessageEntity] | None = None
    disable_content_type_detection: bool | None = None

    _DISCRIMINATOR = ("type", "document")


@dataclasses.dataclass(frozen=True, slots=True)
class InputMediaAnimation(TelegramObject):
    """An animation file (GIF or H.264/MPEG-4 AVC video without sound) to send.

    Attributes:
        media: File to send: a ``file_id`` of an animation settled on the
            Telegram servers, an HTTP URL for Telegram to fetch, or
            ``attach://<file_attach_name>`` for a file uploaded in this request.
        type: Type of the media, always ``animation``.
        thumbnail: Thumbnail sent along with the animation, as a ``file_id`` or
            an ``attach://<file_attach_name>`` reference.
        caption: Animation caption, 0-1024 characters after entities parsing.
        parse_mode: Mode for parsing entities in the caption.
        caption_entities: Caption entities, giving more control than
            ``parse_mode``; up to 50 entities.
        show_caption_above_media: Whether the caption must be shown above the
            message media.
        width: Animation width.
        height: Animation height.
        duration: Animation duration in seconds.
        has_spoiler: Pass ``True`` if the animation needs to be covered by a
            spoiler.

    Telegram API: https://core.telegram.org/bots/api#inputmediaanimation
    """

    media: str
    type: str = "animation"
    thumbnail: str | None = None
    caption: str | None = None
    parse_mode: str | None = None
    caption_entities: list[MessageEntity] | None = None
    show_caption_above_media: bool | None = None
    width: int | None = None
    height: int | None = None
    duration: int | None = None
    has_spoiler: bool | None = None

    _DISCRIMINATOR = ("type", "animation")


@dataclasses.dataclass(frozen=True, slots=True)
class InputMediaVoiceNote(TelegramObject):
    """A voice note to send as part of a rich message.

    Attributes:
        media: File to send: a ``file_id`` of a voice note settled on the
            Telegram servers, an HTTP URL for Telegram to fetch, or
            ``attach://<file_attach_name>`` for a file uploaded in this request.
        type: Type of the media, always ``voice_note``.
        caption: Voice note caption, 0-1024 characters after entities parsing.
        parse_mode: Mode for parsing entities in the caption.
        caption_entities: Caption entities, giving more control than
            ``parse_mode``; up to 50 entities.
        duration: Duration of the voice note in seconds.

    Telegram API: https://core.telegram.org/bots/api#inputmediavoicenote
    """

    media: str
    type: str = "voice_note"
    caption: str | None = None
    parse_mode: str | None = None
    caption_entities: list[MessageEntity] | None = None
    duration: int | None = None

    _DISCRIMINATOR = ("type", "voice_note")


#: The media payload accepted where Telegram documents an ``InputMedia``.
#:
#: The docs describe ``InputMedia`` as an abstract union, so this alias is what
#: callers annotate; it covers every variant modeled here, matching the set
#: ``InputRichMessageMedia`` documents. Each member serializes its own ``type``
#: literal.
InputMedia = (
    InputMediaPhoto
    | InputMediaVideo
    | InputMediaAudio
    | InputMediaDocument
    | InputMediaAnimation
    | InputMediaVoiceNote
)

#: An :data:`InputMedia` given either as a typed object or as a raw mapping.
InputMediaLike = InputMedia | t.Mapping[str, object]
