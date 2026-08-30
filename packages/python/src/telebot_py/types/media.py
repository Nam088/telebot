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
    """

    file_id: str
    file_unique_id: str
    thumbnail: PhotoSize | None = None
    file_name: str | None = None
    mime_type: str | None = None
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
        file_name: Original filename as defined by sender.
        mime_type: MIME type of the file as defined by sender.
        file_size: File size in bytes, when known.
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
    """

    file_id: str
    file_unique_id: str
    length: int
    duration: int
    thumbnail: PhotoSize | None = None
    file_size: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class LivePhoto(TelegramObject):
    """A Live Photo message object (Bot API 10.3+).

    Attributes:
        file_id: Identifier for this file, usable for downloading or reuse.
        file_unique_id: Unique identifier for this file.
        width: Photo width.
        height: Photo height.
        photo: Available sizes of the photo.
        video: Video file associated with the live photo.
    """

    file_id: str
    file_unique_id: str
    width: int
    height: int
    photo: list[PhotoSize]
    video: Video
