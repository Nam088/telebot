"""Chat background types reported by ``ChatFullInfo`` and service messages.

Field names, required-ness and ``type`` literals follow the official Telegram
Bot API docs for the ``BackgroundFill*``, ``BackgroundType*`` and
``ChatBackground`` classes (Bot API 10.3).

Remarks:
    The docs define ``BackgroundFill`` and ``BackgroundType`` as abstract
    unions, so each is exposed as an alias over its concrete variants and
    ``from_dict`` picks the variant through the ``type`` discriminator. The
    ``type`` literal follows the required payload fields so it can carry its
    variant default, which keeps ``BackgroundTypeChatTheme(theme_name='…')``
    valid.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.media import Document


@dataclasses.dataclass(frozen=True, slots=True)
class BackgroundFillSolid(TelegramObject):
    """A chat background filled with a single color.

    Attributes:
        color: Fill color in the RGB24 format.
        type: Type of the fill, always ``solid``.

    Telegram API: https://core.telegram.org/bots/api#backgroundfillsolid
    """

    color: int
    type: str = "solid"

    _DISCRIMINATOR = ("type", "solid")


@dataclasses.dataclass(frozen=True, slots=True)
class BackgroundFillGradient(TelegramObject):
    """A chat background filled with a linear gradient.

    Attributes:
        top_color: Top color of the gradient in the RGB24 format.
        rotation_angle: Clockwise rotation angle of the background fill in
            degrees; 0-359.
        bottom_color: Bottom color of the gradient in the RGB24 format.
        type: Type of the fill, always ``gradient``.

    Telegram API: https://core.telegram.org/bots/api#backgroundfillgradient
    """

    top_color: int
    rotation_angle: int
    bottom_color: int
    type: str = "gradient"

    _DISCRIMINATOR = ("type", "gradient")


@dataclasses.dataclass(frozen=True, slots=True)
class BackgroundFillFreeformGradient(TelegramObject):
    """A chat background filled with a freeform gradient.

    Attributes:
        colors: A list of the 3 or 4 base colors used to generate the freeform
            gradient, each in the RGB24 format.
        type: Type of the fill, always ``freeform_gradient``.

    Telegram API: https://core.telegram.org/bots/api#backgroundfillfreeformgradient
    """

    colors: list[int]
    type: str = "freeform_gradient"

    _DISCRIMINATOR = ("type", "freeform_gradient")


#: The background fill accepted by ``BackgroundTypeFill`` and
#: ``BackgroundTypePattern``; the docs define it as an abstract union.
BackgroundFill = BackgroundFillSolid | BackgroundFillGradient | BackgroundFillFreeformGradient


@dataclasses.dataclass(frozen=True, slots=True)
class BackgroundTypeFill(TelegramObject):
    """A chat background filled with a color or a gradient.

    Attributes:
        fill: The background fill.
        dark_theme_dimming: Dimming of the background in dark themes, as a
            percentage; 0-100.
        type: Type of the background, always ``fill``.

    Telegram API: https://core.telegram.org/bots/api#backgroundtypefill
    """

    fill: BackgroundFill
    dark_theme_dimming: int
    type: str = "fill"

    _DISCRIMINATOR = ("type", "fill")


@dataclasses.dataclass(frozen=True, slots=True)
class BackgroundTypeWallpaper(TelegramObject):
    """A chat background with a wallpaper.

    Attributes:
        document: Document with the wallpaper.
        dark_theme_dimming: Dimming of the background in dark themes, as a
            percentage; 0-100.
        type: Type of the background, always ``wallpaper``.
        is_blurred: ``True``, if the wallpaper is downscaled to fit in a
            450x450 square and then box-blurred with radius 12 pixels.
        is_moving: ``True``, if the background moves slightly according to the
            device orientation.

    Telegram API: https://core.telegram.org/bots/api#backgroundtypewallpaper
    """

    document: Document
    dark_theme_dimming: int
    type: str = "wallpaper"
    is_blurred: bool | None = None
    is_moving: bool | None = None

    _DISCRIMINATOR = ("type", "wallpaper")


@dataclasses.dataclass(frozen=True, slots=True)
class BackgroundTypePattern(TelegramObject):
    """A chat background with a pattern.

    Attributes:
        document: Document with the pattern.
        fill: The background fill that is combined with the pattern.
        intensity: Overall intensity of the pattern image blurring; 0-100 for
            blurring, -100-0 for sharpening.
        type: Type of the background, always ``pattern``.
        is_inverted: ``True``, if the background colors must be inverted.
        is_moving: ``True``, if the background moves slightly according to the
            device orientation.

    Telegram API: https://core.telegram.org/bots/api#backgroundtypepattern
    """

    document: Document
    fill: BackgroundFill
    intensity: int
    type: str = "pattern"
    is_inverted: bool | None = None
    is_moving: bool | None = None

    _DISCRIMINATOR = ("type", "pattern")


@dataclasses.dataclass(frozen=True, slots=True)
class BackgroundTypeChatTheme(TelegramObject):
    """A chat background using one of the built-in Telegram chat themes.

    Attributes:
        theme_name: Name of the theme for the background.
        type: Type of the background, always ``chat_theme``.

    Telegram API: https://core.telegram.org/bots/api#backgroundtypechattheme
    """

    theme_name: str
    type: str = "chat_theme"

    _DISCRIMINATOR = ("type", "chat_theme")


#: The type of a chat background; the docs define it as an abstract union.
BackgroundType = (
    BackgroundTypeFill | BackgroundTypeWallpaper | BackgroundTypePattern | BackgroundTypeChatTheme
)


@dataclasses.dataclass(frozen=True, slots=True)
class ChatBackground(TelegramObject):
    """A chat background.

    Attributes:
        type: The background type.

    Telegram API: https://core.telegram.org/bots/api#chatbackground
    """

    type: BackgroundType
