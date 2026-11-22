"""Chat share theme types for Telegram Bot API 10.4+."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.gifts import UniqueGift, UniqueGiftBackdropColors


@dataclasses.dataclass(frozen=True, slots=True)
class EmojiTypeEmoji(TelegramObject):
    """Describes a standard Unicode emoji.

    Attributes:
        type: Type of the emoji, always ``"emoji"``.
        emoji: The Unicode emoji string.

    Telegram API: https://core.telegram.org/bots/api#emojitypeemoji
    """

    type: str
    emoji: str


@dataclasses.dataclass(frozen=True, slots=True)
class EmojiTypeCustomEmoji(TelegramObject):
    """Describes a custom emoji.

    Attributes:
        type: Type of the emoji, always ``"custom_emoji"``.
        custom_emoji_id: Unique identifier of the custom emoji.

    Telegram API: https://core.telegram.org/bots/api#emojitypecustomemoji
    """

    type: str
    custom_emoji_id: str


EmojiType: t.TypeAlias = EmojiTypeEmoji | EmojiTypeCustomEmoji


@dataclasses.dataclass(frozen=True, slots=True)
class ChatShareThemeEmoji(TelegramObject):
    """Describes a chat share theme based on emojis.

    Attributes:
        type: Type of the theme, always ``"emoji"``.
        emojis: List of emojis in the theme.
        background_backdrop_id: Identifier of the background backdrop.

    Telegram API: https://core.telegram.org/bots/api#chatsharethemeemoji
    """

    type: str
    emojis: list[EmojiType]
    background_backdrop_id: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ChatShareThemeUniqueGift(TelegramObject):
    """Describes a chat share theme based on a unique gift.

    Attributes:
        type: Type of the theme, always ``"unique_gift"``.
        gift: The unique gift defining the theme.

    Telegram API: https://core.telegram.org/bots/api#chatsharethemeuniquegift
    """

    type: str
    gift: UniqueGift


ChatShareTheme: t.TypeAlias = ChatShareThemeEmoji | ChatShareThemeUniqueGift


@dataclasses.dataclass(frozen=True, slots=True)
class ChatShareThemeBackdrop(TelegramObject):
    """Describes a backdrop for a chat share theme.

    Attributes:
        id: Unique identifier of the backdrop.
        name: Name of the backdrop.
        colors: Colors of the backdrop.

    Telegram API: https://core.telegram.org/bots/api#chatsharethemebackdrop
    """

    id: int
    name: str
    colors: UniqueGiftBackdropColors


@dataclasses.dataclass(frozen=True, slots=True)
class ChatShareThemeBackdrops(TelegramObject):
    """Contains a list of chat share theme backdrops.

    Attributes:
        backdrops: List of available chat share theme backdrops.

    Telegram API: https://core.telegram.org/bots/api#chatsharethemebackdrops
    """

    backdrops: list[ChatShareThemeBackdrop]
