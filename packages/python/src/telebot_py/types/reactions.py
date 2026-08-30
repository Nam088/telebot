"""Telegram reaction types."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class ReactionTypeEmoji(TelegramObject):
    """A reaction that uses a regular emoji.

    Attributes:
        type: Type of the reaction, always 'emoji'.
        emoji: Reaction emoji.

    Telegram API: https://core.telegram.org/bots/api#reactiontypeemoji
    """

    type: str
    emoji: str

    _DISCRIMINATOR = ("type", "emoji")


@dataclasses.dataclass(frozen=True, slots=True)
class ReactionTypeCustomEmoji(TelegramObject):
    """A reaction that uses a custom emoji.

    Attributes:
        type: Type of the reaction, always 'custom_emoji'.
        custom_emoji_id: Custom emoji identifier.

    Telegram API: https://core.telegram.org/bots/api#reactiontypecustomemoji
    """

    type: str
    custom_emoji_id: str

    _DISCRIMINATOR = ("type", "custom_emoji")


@dataclasses.dataclass(frozen=True, slots=True)
class ReactionTypePaid(TelegramObject):
    """A paid reaction.

    Attributes:
        type: Type of the reaction, always 'paid'.

    Telegram API: https://core.telegram.org/bots/api#reactiontypepaid
    """

    type: str

    _DISCRIMINATOR = ("type", "paid")


@dataclasses.dataclass(frozen=True, slots=True)
class ReactionCount(TelegramObject):
    """A reaction type and its total count on a message.

    Attributes:
        type: Type of the reaction.
        total_count: Number of times the reaction was added.

    Telegram API: https://core.telegram.org/bots/api#reactioncount
    """

    type: ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid
    total_count: int


@dataclasses.dataclass(frozen=True, slots=True)
class MessageReactionUpdated(TelegramObject):
    """A change of a reaction on a message performed by a user.

    Attributes:
        chat: The chat containing the message the user reacted to.
        message_id: Unique identifier of the message inside the chat.
        date: Date of the change in Unix time.
        old_reaction: Previous list of reaction types set by the user.
        new_reaction: New list of reaction types set by the user.
        user: The user that changed the reaction, if not anonymous.
        actor_chat: The chat on behalf of which the reaction was changed, if
            the user is anonymous.

    Telegram API: https://core.telegram.org/bots/api#messagereactionupdated
    """

    chat: Chat
    message_id: int
    date: int
    old_reaction: list[ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid]
    new_reaction: list[ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid]
    user: User | None = None
    actor_chat: Chat | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class MessageReactionCountUpdated(TelegramObject):
    """Reaction changes on a message with anonymous reactions.

    Attributes:
        chat: The chat containing the message.
        message_id: Unique message identifier inside the chat.
        date: Date of the change in Unix time.
        reactions: List of reactions that are present on the message.

    Telegram API: https://core.telegram.org/bots/api#messagereactioncountupdated
    """

    chat: Chat
    message_id: int
    date: int
    reactions: list[ReactionCount]
