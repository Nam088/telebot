"""Story posting types: content inputs and clickable story areas.

Modelled on the Telegram Bot API story classes and the node sibling's
``client/types/business/models.ts`` declarations (StoryArea,
StoryAreaPosition, InputStoryContentPhoto, InputStoryContentVideo).
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.reactions import (
    ReactionTypeCustomEmoji,
    ReactionTypeEmoji,
    ReactionTypePaid,
)


@dataclasses.dataclass(frozen=True, slots=True)
class StoryAreaPosition(TelegramObject):
    """The position of a clickable area within a story.

    Attributes:
        x_percentage: The abscissa of the area's center, as a percentage of
            the media width.
        y_percentage: The ordinate of the area's center, as a percentage of
            the media height.
        width_percentage: The width of the area's rectangle, as a percentage
            of the media width.
        height_percentage: The height of the area's rectangle, as a percentage
            of the media height.
        rotation_angle: The clockwise rotation angle of the rectangle, in
            degrees; 0-360.
        corner_radius_percentage: The radius of the rectangle corner rounding,
            as a percentage of the media width.

    Telegram API: https://core.telegram.org/bots/api#storyareaposition
    """

    x_percentage: float
    y_percentage: float
    width_percentage: float
    height_percentage: float
    rotation_angle: float
    corner_radius_percentage: float


@dataclasses.dataclass(frozen=True, slots=True)
class StoryAreaTypeLocation(TelegramObject):
    """A story area pointing to a location; up to 10 per story.

    Attributes:
        type: Type of the area, always 'location'.
        latitude: Location latitude in degrees.
        longitude: Location longitude in degrees.
        address: Address of the location, kept as a raw mapping (node leaves
            ``LocationAddress`` untyped).

    Telegram API: https://core.telegram.org/bots/api#storyareatypelocation
    """

    type: str
    latitude: float
    longitude: float
    address: object | None = None

    _DISCRIMINATOR = ("type", "location")


@dataclasses.dataclass(frozen=True, slots=True)
class StoryAreaTypeSuggestedReaction(TelegramObject):
    """A story area pointing to a suggested reaction; up to 5 per story.

    Attributes:
        type: Type of the area, always 'suggested_reaction'.
        reaction_type: Type of the reaction.
        is_dark: Whether the reaction area has a dark background.
        is_flipped: Whether the reaction area corner is flipped.

    Telegram API: https://core.telegram.org/bots/api#storyareatypesuggestedreaction
    """

    type: str
    reaction_type: ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid
    is_dark: bool | None = None
    is_flipped: bool | None = None

    _DISCRIMINATOR = ("type", "suggested_reaction")


@dataclasses.dataclass(frozen=True, slots=True)
class StoryAreaTypeLink(TelegramObject):
    """A story area pointing to an HTTP or tg:// link; up to 3 per story.

    Attributes:
        type: Type of the area, always 'link'.
        url: HTTP or tg:// URL opened when the area is clicked.

    Telegram API: https://core.telegram.org/bots/api#storyareatypelink
    """

    type: str
    url: str

    _DISCRIMINATOR = ("type", "link")


@dataclasses.dataclass(frozen=True, slots=True)
class StoryAreaTypeWeather(TelegramObject):
    """A story area containing weather information; up to 3 per story.

    Remarks:
        Telegram names the temperature field ``temperature``; the node
        sibling's inline type calls it ``temperature_c``, which is why node
        never round-trips weather areas. This class follows Telegram's wire
        name so payloads parse.

    Attributes:
        type: Type of the area, always 'weather'.
        temperature: Temperature, in degrees Celsius.
        emoji: Emoji representing the weather.
        background_color: A color of the area background in the ARGB format.

    Telegram API: https://core.telegram.org/bots/api#storyareatypeweather
    """

    type: str
    temperature: float
    emoji: str
    background_color: int

    _DISCRIMINATOR = ("type", "weather")


@dataclasses.dataclass(frozen=True, slots=True)
class StoryAreaTypeUniqueGift(TelegramObject):
    """A story area pointing to a unique gift; at most 1 per story.

    Attributes:
        type: Type of the area, always 'unique_gift'.
        name: Unique name of the gift.

    Telegram API: https://core.telegram.org/bots/api#storyareatypeuniquegift
    """

    type: str
    name: str

    _DISCRIMINATOR = ("type", "unique_gift")


#: The type of a clickable area on a story.
StoryAreaType = (
    StoryAreaTypeLocation
    | StoryAreaTypeSuggestedReaction
    | StoryAreaTypeLink
    | StoryAreaTypeWeather
    | StoryAreaTypeUniqueGift
)


@dataclasses.dataclass(frozen=True, slots=True)
class StoryArea(TelegramObject):
    """A clickable area on a story media.

    Attributes:
        position: Position of the area.
        type: Type of the area.

    Telegram API: https://core.telegram.org/bots/api#storyarea
    """

    position: StoryAreaPosition
    type: StoryAreaType


@dataclasses.dataclass(frozen=True, slots=True)
class InputStoryContentPhoto(TelegramObject):
    """A photo to post as a story.

    Attributes:
        type: Type of the content, always 'photo'.
        photo: Photo to post; 1080x1920 and at most 10 MB. Accepts an
            ``attach://<file_attach_name>`` reference for multipart uploads.

    Telegram API: https://core.telegram.org/bots/api#inputstorycontentphoto
    """

    type: str
    photo: str

    _DISCRIMINATOR = ("type", "photo")


@dataclasses.dataclass(frozen=True, slots=True)
class InputStoryContentVideo(TelegramObject):
    """A video to post as a story.

    Remarks:
        Node's ``InputStoryContentVideo`` names the cover fields ``cover`` and
        ``timestamp``; Telegram's wire fields are ``cover`` and
        ``cover_frame_timestamp``. This class keeps Telegram's spelling so
        posted stories parse server-side.

    Attributes:
        type: Type of the content, always 'video'.
        video: Video to post; 720x1280, H.265, at most 30 MB.
        duration: Precise duration of the video in seconds; 0-60.
        cover: Cover for the video in the story.
        cover_frame_timestamp: Timestamp in seconds of the frame used as the
            static cover; defaults to 0.
        is_animation: Whether the video has no sound.

    Telegram API: https://core.telegram.org/bots/api#inputstorycontentvideo
    """

    type: str
    video: str
    duration: float | None = None
    cover: str | None = None
    cover_frame_timestamp: float | None = None
    is_animation: bool | None = None

    _DISCRIMINATOR = ("type", "video")


#: Content of a story to post or edit.
InputStoryContent = InputStoryContentPhoto | InputStoryContentVideo
