"""Community, ownership, poll-option and checklist service-message payloads.

Docs types that arrive nested inside a ``Message`` (or, for
:class:`ManagedBotUpdated`, inside an ``Update``). Several of them carry a
partial copy of another message; the ``Message`` annotation on those fields is
resolved at runtime by :mod:`telebot_py.types.message`, which binds its own
class into this module's namespace to avoid an import cycle.
"""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat_members import Community
from telebot_py.types.checklists import ChecklistTask
from telebot_py.types.common import MessageEntity
from telebot_py.types.user import User

if t.TYPE_CHECKING:  # annotation-only; bound at runtime by message.py
    from telebot_py.types.message import Message as Message


@dataclasses.dataclass(frozen=True, slots=True)
class ChatOwnerChanged(TelegramObject):
    """Service message: the owner of the chat has changed.

    Attributes:
        new_owner: The new owner of the chat.

    Telegram API: https://core.telegram.org/bots/api#chatownerchanged
    """

    new_owner: User


@dataclasses.dataclass(frozen=True, slots=True)
class ChatOwnerLeft(TelegramObject):
    """Service message: the owner of the chat has left.

    Attributes:
        new_owner: The user who will become the new owner of the chat if the
            previous owner doesn't return within one month.

    Telegram API: https://core.telegram.org/bots/api#chatownerleft
    """

    new_owner: User | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class CommunityChatAdded(TelegramObject):
    """Service message: a chat or bot was added to a Community.

    Attributes:
        community: The new community to which the chat or the bot belongs.

    Telegram API: https://core.telegram.org/bots/api#communitychatadded
    """

    community: Community


@dataclasses.dataclass(frozen=True, slots=True)
class CommunityChatRemoved(TelegramObject):
    """Service message: a chat or bot was removed from a Community.

    Currently holds no information.

    Telegram API: https://core.telegram.org/bots/api#communitychatremoved
    """


@dataclasses.dataclass(frozen=True, slots=True)
class DirectMessagesTopic(TelegramObject):
    """Information about the direct messages chat topic of a message.

    Attributes:
        topic_id: Unique identifier of the topic.
        user: Information about the user that created the topic. Currently,
            always present.

    Telegram API: https://core.telegram.org/bots/api#directmessagestopic
    """

    topic_id: int
    user: User | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class DirectMessagePriceChanged(TelegramObject):
    """Service message: the price for direct messages of a channel changed.

    Attributes:
        are_direct_messages_enabled: Whether direct messages are enabled for
            the channel chat.
        direct_message_star_count: New number of Telegram Stars that must be
            paid by users for each direct message sent to the channel; omitted
            when direct messages are disabled or are free.

    Telegram API: https://core.telegram.org/bots/api#directmessagepricechanged
    """

    are_direct_messages_enabled: bool
    direct_message_star_count: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class PaidMessagePriceChanged(TelegramObject):
    """Service message: the price for paid messages in the chat changed.

    Attributes:
        paid_message_star_count: New number of Telegram Stars that must be paid
            by non-administrator users of the supergroup chat for each sent
            message.

    Telegram API: https://core.telegram.org/bots/api#paidmessagepricechanged
    """

    paid_message_star_count: int


@dataclasses.dataclass(frozen=True, slots=True)
class ManagedBotCreated(TelegramObject):
    """Service message: a user created a bot managed by the current bot.

    Attributes:
        bot: Information about the created bot. Its token can be fetched with
            ``getManagedBotToken``.

    Telegram API: https://core.telegram.org/bots/api#managedbotcreated
    """

    bot: User


@dataclasses.dataclass(frozen=True, slots=True)
class ManagedBotUpdated(TelegramObject):
    """A new bot was created to be managed by the current bot.

    Attributes:
        user: User that created the bot.
        bot: Information about the created bot. Its token can be fetched with
            ``getManagedBotToken``.

    Telegram API: https://core.telegram.org/bots/api#managedbotupdated
    """

    user: User
    bot: User


@dataclasses.dataclass(frozen=True, slots=True)
class PollOptionAdded(TelegramObject):
    """Service message: an answer option was added to a poll.

    Attributes:
        option_persistent_id: Unique identifier of the added option.
        option_text: Text of the added option.
        option_text_entities: Special entities that appear in ``option_text``.
        poll_message: Message containing the poll to which the option was
            added, if known. The docs type is ``MaybeInaccessibleMessage``; an
            :class:`~telebot_py.types.InaccessibleMessage` payload keeps its
            ``date`` at 0.

    Telegram API: https://core.telegram.org/bots/api#polloptionadded
    """

    option_persistent_id: str
    option_text: str
    option_text_entities: list[MessageEntity] | None = None
    poll_message: Message | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class PollOptionDeleted(TelegramObject):
    """Service message: an answer option was deleted from a poll.

    Attributes:
        option_persistent_id: Unique identifier of the deleted option.
        option_text: Text of the deleted option.
        option_text_entities: Special entities that appear in ``option_text``.
        poll_message: Message containing the poll from which the option was
            deleted, if known. The docs type is ``MaybeInaccessibleMessage``.

    Telegram API: https://core.telegram.org/bots/api#polloptiondeleted
    """

    option_persistent_id: str
    option_text: str
    option_text_entities: list[MessageEntity] | None = None
    poll_message: Message | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ChecklistTasksAdded(TelegramObject):
    """Service message: tasks were added to a checklist.

    Attributes:
        tasks: List of tasks added to the checklist.
        checklist_message: Message containing the checklist the tasks were
            added to, if available.

    Telegram API: https://core.telegram.org/bots/api#checklisttasksadded
    """

    tasks: list[ChecklistTask]
    checklist_message: Message | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ChecklistTasksDone(TelegramObject):
    """Service message: tasks in a checklist were marked as done or not done.

    Attributes:
        checklist_message: Message containing the checklist whose tasks were
            marked, if available.
        marked_as_done_task_ids: Identifiers of the tasks marked as done.
        marked_as_not_done_task_ids: Identifiers of the tasks marked as not
            done.

    Telegram API: https://core.telegram.org/bots/api#checklisttasksdone
    """

    checklist_message: Message | None = None
    marked_as_done_task_ids: list[int] | None = None
    marked_as_not_done_task_ids: list[int] | None = None
