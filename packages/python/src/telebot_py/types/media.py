"""Telegram media file types (photos, audio, video, documents)."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject


@dataclasses.dataclass(frozen=True, slots=True)
class PhotoSize(TelegramObject):
    """One size of a photo or a file / sticker thumbnail.

    Attributes:
        file_id: Identifier for this file, usable for downloading or reuse.
        file_unique_id: Unique, persistent identifier of this file.
        width: Photo width.
        height: Photo height.
        file_size: File size in bytes, when known.

    Telegram API: https://core.telegram.org/bots/api#photosize
    """

    file_id: str
    file_unique_id: str
    width: int
    height: int
    file_size: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Audio(TelegramObject):
    """An audio file to be treated as music by the Telegram clients.

    Attributes:
        file_id: Identifier for this file, usable for downloading or reuse.
        file_unique_id: Unique, persistent identifier of this file.
        duration: Duration of the audio in seconds as defined by sender.
        performer: Performer of the audio as defined by sender or tags.
        title: Title of the audio as defined by sender or tags.
        file_name: Original filename as defined by sender.
        mime_type: MIME type of the file as defined by sender.
        file_size: File size in bytes, when known.
        thumbnail: Thumbnail of the album cover the music file belongs to.

    Telegram API: https://core.telegram.org/bots/api#audio
    """

    file_id: str
    file_unique_id: str
    duration: int
    performer: str | None = None
    title: str | None = None
    file_name: str | None = None
    mime_type: str | None = None
    file_size: int | None = None
    thumbnail: PhotoSize | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Document(TelegramObject):
    """A general file (as opposed to photos, audio or video files).

    Attributes:
        file_id: Identifier for this file, usable for downloading or reuse.
        file_unique_id: Unique, persistent identifier of this file.
        thumbnail: Document thumbnail as defined by sender.
        file_name: Original filename as defined by sender.
        mime_type: MIME type of the file as defined by sender.
        file_size: File size in bytes, when known.

    Telegram API: https://core.telegram.org/bots/api#document
    """

    file_id: str
    file_unique_id: str
    thumbnail: PhotoSize | None = None
    file_name: str | None = None
    mime_type: str | None = None
    file_size: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class VideoQuality(TelegramObject):
    """A video file of one specific quality.

    Attributes:
        file_id: Identifier for this file, usable for downloading or reuse.
        file_unique_id: Unique, persistent identifier of this file.
        width: Video width.
        height: Video height.
        codec: Codec used to encode the video, e.g. "h264", "h265" or "av01".
        file_size: File size in bytes, when known.

    Telegram API: https://core.telegram.org/bots/api#videoquality
    """

    file_id: str
    file_unique_id: str
    width: int
    height: int
    codec: str
    file_size: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Video(TelegramObject):
    """A video file.

    Attributes:
        file_id: Identifier for this file, usable for downloading or reuse.
        file_unique_id: Unique, persistent identifier of this file.
        width: Video width as defined by sender.
        height: Video height as defined by sender.
        duration: Duration of the video in seconds as defined by sender.
        thumbnail: Video thumbnail.
        cover: Available sizes of the cover of the video.
        start_timestamp: Timestamp in seconds from which the video plays in the
            message.
        qualities: List of available qualities of the video.
        file_name: Original filename as defined by sender.
        mime_type: MIME type of the file as defined by sender.
        file_size: File size in bytes, when known.

    Telegram API: https://core.telegram.org/bots/api#video
    """

    file_id: str
    file_unique_id: str
    width: int
    height: int
    duration: int
    thumbnail: PhotoSize | None = None
    cover: list[PhotoSize] | None = None
    start_timestamp: int | None = None
    qualities: list[VideoQuality] | None = None
    file_name: str | None = None
    mime_type: str | None = None
    file_size: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Animation(TelegramObject):
    """An animation file (GIF or H.264/MPEG-4 AVC video without sound).

    Attributes:
        file_id: Identifier for this file, usable for downloading or reuse.
        file_unique_id: Unique, persistent identifier of this file.
        width: Video width as defined by sender.
        height: Video height as defined by sender.
        duration: Duration of the video in seconds as defined by sender.
        thumbnail: Animation thumbnail.
        file_name: Original animation filename as defined by sender.
        mime_type: MIME type of the file as defined by sender.
        file_size: File size in bytes, when known.

    Telegram API: https://core.telegram.org/bots/api#animation
    """

    file_id: str
    file_unique_id: str
    width: int
    height: int
    duration: int
    thumbnail: PhotoSize | None = None
    file_name: str | None = None
    mime_type: str | None = None
    file_size: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Voice(TelegramObject):
    """A voice note.

    Attributes:
        file_id: Identifier for this file, usable for downloading or reuse.
        file_unique_id: Unique, persistent identifier of this file.
        duration: Duration of the audio in seconds as defined by sender.
        mime_type: MIME type of the audio as defined by sender.
        file_size: File size in bytes, when known.

    Telegram API: https://core.telegram.org/bots/api#voice
    """

    file_id: str
    file_unique_id: str
    duration: int
    mime_type: str | None = None
    file_size: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class VideoNote(TelegramObject):
    """A video message (round video).

    Attributes:
        file_id: Identifier for this file, usable for downloading or reuse.
        file_unique_id: Unique, persistent identifier of this file.
        length: Video width and height (diameter) as defined by sender.
        duration: Duration of the video in seconds as defined by sender.
        thumbnail: Video thumbnail.
        file_size: File size in bytes, when known.

    Telegram API: https://core.telegram.org/bots/api#videonote
    """

    file_id: str
    file_unique_id: str
    length: int
    duration: int
    thumbnail: PhotoSize | None = None
    file_size: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class LivePhoto(TelegramObject):
    """A live photo: a still photo paired with the video it animates into.

    Attributes:
        file_id: Identifier for the video file, usable for downloading or
            reuse.
        file_unique_id: Unique, persistent identifier of the video file.
        width: Video width as defined by sender.
        height: Video height as defined by sender.
        duration: Duration of the video in seconds as defined by sender.
        photo: Available sizes of the corresponding static photo.
        mime_type: MIME type of the video file as defined by sender.
        file_size: File size of the video in bytes, when known.

    Telegram API: https://core.telegram.org/bots/api#livephoto
    """

    file_id: str
    file_unique_id: str
    width: int
    height: int
    duration: int
    photo: list[PhotoSize] | None = None
    mime_type: str | None = None
    file_size: int | None = None
