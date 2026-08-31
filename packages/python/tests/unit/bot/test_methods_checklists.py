"""Unit tests for the checklist Bot method group.

Ported from node ``client/methods/messages/edit.ts`` (sendChecklist,
editMessageChecklist).
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import (
    Checklist,
    ChecklistTask,
    InputChecklist,
    InputChecklistTask,
    Message,
    MessageEntity,
    TypeParseError,
)
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

RAW_TASK = {
    "id": 1,
    "text": "Buy milk",
    "text_entities": [{"type": "bold", "offset": 0, "length": 4}],
    "completed_by_user": {"id": 42, "is_bot": False, "first_name": "Alice"},
    "completion_date": 1_700_000_000,
}

RAW_CHECKLIST = {
    "title": "Shopping",
    "title_entities": [{"type": "bold", "offset": 0, "length": 8}],
    "tasks": [RAW_TASK],
    "others_can_add_tasks": True,
    "others_can_mark_tasks_as_done": False,
}


class TestSendChecklist:
    async def test_sends_required_fields_only(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=21)), seen)
        bot = make_bot(bot_transport, step)
        checklist = InputChecklist(
            title="Shopping",
            tasks=[InputChecklistTask(id=1, text="Buy milk")],
        )
        message = await bot.send_checklist("bc1", 123, checklist)
        assert isinstance(message, Message)
        assert message.message_id == 21
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendChecklist"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "chat_id": 123,
            "checklist": {"title": "Shopping", "tasks": [{"id": 1, "text": "Buy milk"}]},
        }

    async def test_accepts_plain_dicts_and_serializes_options(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        raw = {
            "title": "Todo",
            "tasks": [
                {
                    "id": 2,
                    "text": "Ship it",
                    "parse_mode": "Markdown",
                    "text_entities": [{"type": "italic", "offset": 0, "length": 4}],
                }
            ],
            "others_can_add_tasks": True,
        }
        await bot.send_checklist(
            "bc1",
            "@business",
            raw,
            disable_notification=True,
            protect_content=True,
            message_effect_id="effect1",
            reply_parameters={"message_id": 4},
            reply_markup={"inline_keyboard": []},
        )
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "chat_id": "@business",
            "checklist": raw,
            "disable_notification": True,
            "protect_content": True,
            "message_effect_id": "effect1",
            "reply_parameters": {"message_id": 4},
            "reply_markup": {"inline_keyboard": []},
        }

    async def test_omits_unset_optional_fields(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_checklist("bc1", 123, {"title": "Todo", "tasks": []})
        assert set(sent_payload(seen[0])) == {"business_connection_id", "chat_id", "checklist"}

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: no rights"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.send_checklist("bc1", 123, {"title": "Todo", "tasks": []})


class TestEditMessageChecklist:
    async def test_edits_checklist_and_returns_message(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=22)), seen)
        bot = make_bot(bot_transport, step)
        checklist = InputChecklist(
            title="Shopping",
            tasks=[
                InputChecklistTask(
                    id=1,
                    text="Buy milk",
                    text_entities=[MessageEntity(type="bold", offset=0, length=4)],
                )
            ],
            others_can_mark_tasks_as_done=True,
        )
        message = await bot.edit_message_checklist("bc1", 123, 22, checklist)
        assert isinstance(message, Message)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editMessageChecklist"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "chat_id": 123,
            "message_id": 22,
            "checklist": {
                "title": "Shopping",
                "tasks": [
                    {
                        "id": 1,
                        "text": "Buy milk",
                        "text_entities": [{"type": "bold", "offset": 0, "length": 4}],
                    }
                ],
                "others_can_mark_tasks_as_done": True,
            },
        }

    async def test_returns_true_for_inline_edit(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.edit_message_checklist("bc1", 123, 22, {"title": "T", "tasks": []}) is True

    async def test_serializes_reply_markup(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.edit_message_checklist(
            "bc1", 123, 22, {"title": "T", "tasks": []}, reply_markup={"inline_keyboard": []}
        )
        assert sent_payload(seen[0])["reply_markup"] == {"inline_keyboard": []}

    async def test_rejects_unexpected_result_shape(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        step = record_into(ok_response(42), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeParseError):
            await bot.edit_message_checklist("bc1", 123, 22, {"title": "T", "tasks": []})


class TestChecklistTypes:
    def test_hydrates_received_checklist(self) -> None:
        checklist = Checklist.from_dict(RAW_CHECKLIST)
        assert checklist.title == "Shopping"
        assert checklist.others_can_add_tasks is True
        assert checklist.others_can_mark_tasks_as_done is False
        assert checklist.title_entities == [MessageEntity(type="bold", offset=0, length=8)]
        task = checklist.tasks[0]
        assert isinstance(task, ChecklistTask)
        assert task.completed_by_user is not None
        assert task.completed_by_user.id == 42
        assert checklist.to_dict() == RAW_CHECKLIST

    def test_input_checklist_round_trips(self) -> None:
        raw = {
            "title": "Todo",
            "parse_mode": "HTML",
            "tasks": [{"id": 1, "text": "Buy milk", "parse_mode": "Markdown"}],
            "others_can_add_tasks": False,
        }
        assert InputChecklist.from_dict(raw).to_dict() == raw
