"""Paid media types for star-purchased media messages.

Mirrors Telegram's ``PaidMedia*`` and ``InputPaidMedia*`` classes for the
Bot API field set the node sibling targets (10.3); the newer live-photo paid
media variants are deliberately out of scope until node models them.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.media import PhotoSize, Video


@dataclasses.dataclass(frozen=True, slots=True)
class PaidMediaPreview(TelegramObject):
    """Paid media that isn't available before the payment.

    Attributes:
        type: Type of the paid media, always 'preview'.
        width: Media width as defined by the sender.
        height: Media height as defined by the sender.
        duration: Duration of the media in seconds as defined by the sender.

    Telegram API: https://core.telegram.org/bots/api#paidmediapreview
    """

    type: str
    width: int | None = None
    height: int | None = None
    duration: int | None = None

    _DISCRIMINATOR = ("type", "preview")


@dataclasses.dataclass(frozen=True, slots=True)
class PaidMediaPhoto(TelegramObject):
    """Paid media that is a photo.

    Attributes:
        type: Type of the paid media, always 'photo'.
        photo: Available sizes of the photo.

    Telegram API: https://core.telegram.org/bots/api#paidmediaphoto
    """

    type: str
    photo: list[PhotoSize]

    _DISCRIMINATOR = ("type", "photo")


@dataclasses.dataclass(frozen=True, slots=True)
class PaidMediaVideo(TelegramObject):
    """Paid media that is a video.

    Attributes:
        type: Type of the paid media, always 'video'.
        video: The video.

    Telegram API: https://core.telegram.org/bots/api#paidmediavideo
    """

    type: str
    video: Video

    _DISCRIMINATOR = ("type", "video")


#: A paid media attachment carried by a message.
PaidMedia = PaidMediaPreview | PaidMediaPhoto | PaidMediaVideo


@dataclasses.dataclass(frozen=True, slots=True)
class PaidMediaInfo(TelegramObject):
    """The paid media added to a message.

    Attributes:
        star_count: Number of Telegram Stars that must be paid to buy access
            to the media.
        paid_media: Information about the paid media.

    Telegram API: https://core.telegram.org/bots/api#paidmediainfo
    """

    star_count: int
    paid_media: list[PaidMedia]


@dataclasses.dataclass(frozen=True, slots=True)
class InputPaidMediaPhoto(TelegramObject):
    """A photo to send as paid media.

    Attributes:
        type: Type of the media, always 'photo'.
        media: File to send: a ``file_id``, an HTTP URL, or an
            ``attach://<file_attach_name>`` reference.

    Telegram API: https://core.telegram.org/bots/api#inputpaidmediaphoto
    """

    type: str
    media: str

    _DISCRIMINATOR = ("type", "photo")


@dataclasses.dataclass(frozen=True, slots=True)
class InputPaidMediaVideo(TelegramObject):
    """A video to send as paid media.

    Attributes:
        type: Type of the media, always 'video'.
        media: File to send: a ``file_id``, an HTTP URL, or an
            ``attach://<file_attach_name>`` reference.
        thumbnail: Thumbnail of the file sent.
        cover: Cover for the video in the message.
        start_timestamp: Start timestamp for the video in the message.
        width: Video width.
        height: Video height.
        duration: Video duration in seconds.
        supports_streaming: Whether the uploaded video is suitable for
            streaming.

    Telegram API: https://core.telegram.org/bots/api#inputpaidmediavideo
    """

    type: str
    media: str
    thumbnail: str | None = None
    cover: str | None = None
    start_timestamp: int | None = None
    width: int | None = None
    height: int | None = None
    duration: int | None = None
    supports_streaming: bool | None = None

    _DISCRIMINATOR = ("type", "video")


#: A media item accepted by ``Bot.send_paid_media``.
InputPaidMedia = InputPaidMediaPhoto | InputPaidMediaVideo
