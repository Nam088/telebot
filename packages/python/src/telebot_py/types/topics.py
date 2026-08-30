"""Bot profile and forum-topic types: names, commands, topics, menu buttons."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.keyboards import WebAppInfo


@dataclasses.dataclass(frozen=True, slots=True)
class BotName(TelegramObject):
    """The bot's name.

    Attributes:
        name: The bot's name.
    """

    name: str


@dataclasses.dataclass(frozen=True, slots=True)
class BotDescription(TelegramObject):
    """The bot's description shown on its profile page.

    Attributes:
        description: The bot's description.
    """

    description: str


@dataclasses.dataclass(frozen=True, slots=True)
class BotShortDescription(TelegramObject):
    """The bot's short description shown in chats.

    Attributes:
        short_description: The bot's short description.
    """

    short_description: str


@dataclasses.dataclass(frozen=True, slots=True)
class ForumTopic(TelegramObject):
    """A forum topic.

    Attributes:
        message_thread_id: Unique identifier of the forum topic.
        name: Name of the topic.
        icon_color: Color of the topic icon in RGB format.
        icon_custom_emoji_id: Unique identifier of the custom emoji shown as
            the topic icon.
    """

    message_thread_id: int
    name: str
    icon_color: int
    icon_custom_emoji_id: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class BotCommand(TelegramObject):
    """A bot command shown in the menu.

    Attributes:
        command: Text of the command; 1-32 characters, lowercase English
            letters, digits and underscores only.
        description: Description of the command; 1-256 characters.
    """

    command: str
    description: str


@dataclasses.dataclass(frozen=True, slots=True)
class MenuButtonDefault(TelegramObject):
    """Describes that no specific value for the menu button was set.

    Attributes:
        type: Type of the menu button, always ``default``.
    """

    type: str

    _DISCRIMINATOR: t.ClassVar[tuple[str, str] | None] = ("type", "default")


@dataclasses.dataclass(frozen=True, slots=True)
class MenuButtonCommands(TelegramObject):
    """A menu button that opens the bot's list of commands.

    Attributes:
        type: Type of the menu button, always ``commands``.
    """

    type: str

    _DISCRIMINATOR: t.ClassVar[tuple[str, str] | None] = ("type", "commands")


@dataclasses.dataclass(frozen=True, slots=True)
class MenuButtonWebApp(TelegramObject):
    """A menu button that launches a Web App.

    Attributes:
        type: Type of the menu button, always ``web_app``.
        text: Text on the button.
        web_app: Description of the Web App that will be launched when the
            user presses the button.
    """

    type: str
    text: str
    web_app: WebAppInfo

    _DISCRIMINATOR: t.ClassVar[tuple[str, str] | None] = ("type", "web_app")


#: Union of the menu button variants returned by ``getChatMenuButton``.
MenuButton = MenuButtonDefault | MenuButtonCommands | MenuButtonWebApp
