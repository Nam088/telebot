"""Service-message payload objects carried by :class:`~telebot_py.types.Message`.

These are the docs types behind the chat-management, topic, video-chat and
contact-sharing service messages. Telegram sends them as nested objects of the
``Message`` that carries the service message, so every class here is a plain
frozen dataclass decoded through ``TelegramObject.from_dict``.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.media import PhotoSize
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class MessageAutoDeleteTimerChanged(TelegramObject):
    """Service message: auto-delete timer settings changed in the chat.

    Attributes:
        message_auto_delete_time: New auto-delete time for messages in the
            chat, in seconds.

    Telegram API: https://core.telegram.org/bots/api#messageautodeletetimerchanged
    """

    message_auto_delete_time: int


@dataclasses.dataclass(frozen=True, slots=True)
class ProximityAlertTriggered(TelegramObject):
    """Service message: a user triggered another user's proximity alert.

    Attributes:
        traveler: User that triggered the alert.
        watcher: User that set the alert.
        distance: The distance between the users, in meters.

    Telegram API: https://core.telegram.org/bots/api#proximityalerttriggered
    """

    traveler: User
    watcher: User
    distance: int


@dataclasses.dataclass(frozen=True, slots=True)
class WriteAccessAllowed(TelegramObject):
    """Service message: the user allowed the bot to write messages to them.

    Attributes:
        from_request: Whether the access was granted after the user accepted an
            explicit request from a Web App sent by ``requestWriteAccess``.
        web_app_name: Name of the Web App, if the access was granted when the
            Web App was launched from a link.
        from_attachment_menu: Whether the access was granted when the bot was
            added to the attachment or side menu.

    Telegram API: https://core.telegram.org/bots/api#writeaccessallowed
    """

    from_request: bool | None = None
    web_app_name: str | None = None
    from_attachment_menu: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class SharedUser(TelegramObject):
    """A user shared with the bot through a ``KeyboardButtonRequestUsers``.

    Attributes:
        user_id: Identifier of the shared user.
        first_name: First name of the user, if the name was requested.
        last_name: Last name of the user, if the name was requested.
        username: Username of the user, if the username was requested.
        photo: Available sizes of the chat photo, if the photo was requested.

    Telegram API: https://core.telegram.org/bots/api#shareduser
    """

    user_id: int
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    photo: list[PhotoSize] | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class UsersShared(TelegramObject):
    """Service message: users were shared with the bot.

    Attributes:
        request_id: Identifier of the request.
        users: Information about the users shared with the bot.

    Telegram API: https://core.telegram.org/bots/api#usersshared
    """

    request_id: int
    users: list[SharedUser]


@dataclasses.dataclass(frozen=True, slots=True)
class ChatShared(TelegramObject):
    """Service message: a chat was shared with the bot.

    Attributes:
        request_id: Identifier of the request.
        chat_id: Identifier of the shared chat.
        title: Title of the chat, if the title was requested by the bot.
        username: Username of the chat, if the username was requested and is
            available.
        photo: Available sizes of the chat photo, if the photo was requested.

    Telegram API: https://core.telegram.org/bots/api#chatshared
    """

    request_id: int
    chat_id: int
    title: str | None = None
    username: str | None = None
    photo: list[PhotoSize] | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ForumTopicCreated(TelegramObject):
    """Service message: a forum topic was created in the chat.

    Attributes:
        name: Name of the topic.
        icon_color: Color of the topic icon in RGB format.
        icon_custom_emoji_id: Unique identifier of the custom emoji shown as
            the topic icon.
        is_name_implicit: Whether the name of the topic wasn't specified
            explicitly by its creator and likely needs editing.

    Telegram API: https://core.telegram.org/bots/api#forumtopiccreated
    """

    name: str
    icon_color: int
    icon_custom_emoji_id: str | None = None
    is_name_implicit: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ForumTopicEdited(TelegramObject):
    """Service message: a forum topic was edited.

    Attributes:
        name: New name of the topic, if it was edited.
        icon_custom_emoji_id: New identifier of the custom emoji shown as the
            topic icon, if it was edited; an empty string means the icon was
            reset to the default.

    Telegram API: https://core.telegram.org/bots/api#forumtopicedited
    """

    name: str | None = None
    icon_custom_emoji_id: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ForumTopicClosed(TelegramObject):
    """Service message: a forum topic was closed.

    Currently holds no information.

    Telegram API: https://core.telegram.org/bots/api#forumtopicclosed
    """


@dataclasses.dataclass(frozen=True, slots=True)
class ForumTopicReopened(TelegramObject):
    """Service message: a forum topic was reopened.

    Currently holds no information.

    Telegram API: https://core.telegram.org/bots/api#forumtopicreopened
    """


@dataclasses.dataclass(frozen=True, slots=True)
class GeneralForumTopicHidden(TelegramObject):
    """Service message: the 'General' forum topic was hidden.

    Currently holds no information.

    Telegram API: https://core.telegram.org/bots/api#generalforumtopichidden
    """


@dataclasses.dataclass(frozen=True, slots=True)
class GeneralForumTopicUnhidden(TelegramObject):
    """Service message: the 'General' forum topic was unhidden.

    Currently holds no information.

    Telegram API: https://core.telegram.org/bots/api#generalforumtopicunhidden
    """


@dataclasses.dataclass(frozen=True, slots=True)
class VideoChatScheduled(TelegramObject):
    """Service message: a video chat was scheduled in the chat.

    Attributes:
        start_date: Unix time at which a chat administrator is supposed to
            start the video chat.

    Telegram API: https://core.telegram.org/bots/api#videochatscheduled
    """

    start_date: int


@dataclasses.dataclass(frozen=True, slots=True)
class VideoChatStarted(TelegramObject):
    """Service message: a video chat was started in the chat.

    Currently holds no information.

    Telegram API: https://core.telegram.org/bots/api#videochatstarted
    """


@dataclasses.dataclass(frozen=True, slots=True)
class VideoChatEnded(TelegramObject):
    """Service message: a video chat was ended in the chat.

    Attributes:
        duration: Duration of the video chat in seconds.

    Telegram API: https://core.telegram.org/bots/api#videochatended
    """

    duration: int


@dataclasses.dataclass(frozen=True, slots=True)
class VideoChatParticipantsInvited(TelegramObject):
    """Service message: new participants were invited to a video chat.

    Attributes:
        users: New members that were invited to the video chat.

    Telegram API: https://core.telegram.org/bots/api#videochatparticipantsinvited
    """

    users: list[User]
