"""Telegram file-download and profile-photo types."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.media import Audio, PhotoSize


@dataclasses.dataclass(frozen=True, slots=True)
class File(TelegramObject):
    """A file ready to be downloaded.

    Attributes:
        file_id: Identifier for this file, which can be used to download or
            reuse the file.
        file_unique_id: Unique identifier for this file, which is supposed to
            be the same over time and for different bots.
        file_size: File size in bytes.
        file_path: File path. Use
            ``https://api.telegram.org/file/bot<token>/<file_path>`` to get
            the file.
    """

    file_id: str
    file_unique_id: str
    file_size: int | None = None
    file_path: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class UserProfilePhotos(TelegramObject):
    """A user's profile pictures.

    Attributes:
        total_count: Total number of profile pictures the target user has.
        photos: Requested profile pictures (in up to 4 sizes each).
    """

    total_count: int
    photos: list[list[PhotoSize]]


@dataclasses.dataclass(frozen=True, slots=True)
class UserProfileAudios(TelegramObject):
    """The audios displayed on a user's profile.

    Attributes:
        total_count: Total number of profile audios for the target user.
        audios: Requested profile audios.
    """

    total_count: int
    audios: list[Audio]
