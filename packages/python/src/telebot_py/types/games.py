"""Telegram game types: CallbackGame, Game and GameHighScore."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.common import MessageEntity
from telebot_py.types.media import Animation, PhotoSize
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class CallbackGame(TelegramObject):
    """A placeholder, empty response sent when a game button is pressed.

    Telegram API: https://core.telegram.org/bots/api#callbackgame
    """


@dataclasses.dataclass(frozen=True, slots=True)
class Game(TelegramObject):
    """A game offered by a bot.

    Attributes:
        title: Title of the game.
        description: Description of the game.
        photo: Photo that will be displayed in the game message in chats.
        text: Brief description of the game or high scores.
        text_entities: Special entities that appear in ``text``.
        animation: Animation that will be displayed in the game message in
            chats.

    Telegram API: https://core.telegram.org/bots/api#game
    """

    title: str
    description: str
    photo: list[PhotoSize]
    text: str | None = None
    text_entities: list[MessageEntity] | None = None
    animation: Animation | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class GameHighScore(TelegramObject):
    """One row of the high scores table for a game.

    Attributes:
        position: Position in the high score table for the game.
        user: User who scored the points.
        score: Score value.

    Telegram API: https://core.telegram.org/bots/api#gamehighscore
    """

    position: int
    user: User
    score: int
