"""Checklist types for checklist messages (Bot API 10.2+).

Telegram documents ``Checklist``, ``ChecklistTask``, ``InputChecklist`` and
``InputChecklistTask``; the node sibling passes checklist payloads through as
untyped records, so these classes follow the Bot API field set exactly.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.common import MessageEntity
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class ChecklistTask(TelegramObject):
    """A task in a received checklist.

    Attributes:
        id: Unique identifier of the task.
        text: Text of the task.
        text_entities: Special entities that appear in the task text.
        completed_by_user: User that completed the task; absent when the task
            wasn't completed by a user.
        completed_by_chat: Chat that completed the task; absent when the task
            wasn't completed by a chat.
        completion_date: Point in time (Unix timestamp) when the task was
            completed; 0 if the task wasn't completed.

    Telegram API: https://core.telegram.org/bots/api#checklisttask
    """

    id: int
    text: str
    text_entities: list[MessageEntity] | None = None
    completed_by_user: User | None = None
    completed_by_chat: Chat | None = None
    completion_date: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Checklist(TelegramObject):
    """A checklist received in a message.

    Attributes:
        title: Title of the checklist.
        tasks: List of tasks in the checklist.
        title_entities: Special entities that appear in the checklist title.
        others_can_add_tasks: Whether users other than the creator can add
            tasks to the list.
        others_can_mark_tasks_as_done: Whether users other than the creator
            can mark tasks as done or not done.

    Telegram API: https://core.telegram.org/bots/api#checklist
    """

    title: str
    tasks: list[ChecklistTask]
    title_entities: list[MessageEntity] | None = None
    others_can_add_tasks: bool | None = None
    others_can_mark_tasks_as_done: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class InputChecklistTask(TelegramObject):
    """A task to add to a checklist.

    Attributes:
        id: Unique identifier of the task; must be positive and unique among
            all task identifiers currently present in the checklist.
        text: Text of the task; 1-100 characters after entities parsing.
        parse_mode: Mode for parsing entities in the text.
        text_entities: Special entities that appear in the text, which can be
            specified instead of ``parse_mode``.

    Telegram API: https://core.telegram.org/bots/api#inputchecklisttask
    """

    id: int
    text: str
    parse_mode: str | None = None
    text_entities: list[MessageEntity] | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class InputChecklist(TelegramObject):
    """A checklist to send or edit.

    Attributes:
        title: Title of the checklist; 1-255 characters after entities
            parsing.
        tasks: List of 1-30 tasks in the checklist.
        parse_mode: Mode for parsing entities in the title.
        title_entities: Special entities that appear in the title, which can
            be specified instead of ``parse_mode``.
        others_can_add_tasks: Whether other users can add tasks to the
            checklist.
        others_can_mark_tasks_as_done: Whether other users can mark tasks as
            done or not done in the checklist.

    Telegram API: https://core.telegram.org/bots/api#inputchecklist
    """

    title: str
    tasks: list[InputChecklistTask]
    parse_mode: str | None = None
    title_entities: list[MessageEntity] | None = None
    others_can_add_tasks: bool | None = None
    others_can_mark_tasks_as_done: bool | None = None
