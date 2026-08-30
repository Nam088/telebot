"""Unit tests for the Mini App guest-query Bot method group.

Ported from node ``client/methods/business/stories-boosts.ts``
(answerGuestQuery), ``business/ephemeral.ts`` (sendChatJoinRequestWebApp),
and ``business/gifts.ts`` (savePreparedKeyboardButton).
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import (
    KeyboardButton,
    KeyboardButtonRequestChat,
    PreparedKeyboardButton,
    SentGuestMessage,
)
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestAnswerGuestQuery:
    async def test_returns_typed_sent_guest_message(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"inline_message_id": "inline-1"}), seen)
        bot = make_bot(bot_transport, step)
        sent = await bot.answer_guest_query(
            "guest-1",
            {
                "type": "article",
                "id": "art_1",
                "title": "Result",
                "input_message_content": {"message_text": "Hello"},
            },
        )
        assert isinstance(sent, SentGuestMessage)
        assert sent.inline_message_id == "inline-1"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/answerGuestQuery"
        assert sent_payload(seen[0]) == {
            "guest_query_id": "guest-1",
            "result": {
                "type": "article",
                "id": "art_1",
                "title": "Result",
                "input_message_content": {"message_text": "Hello"},
            },
        }

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: query expired"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.answer_guest_query("guest-1", {"type": "article"})
        assert excinfo.value.error_code == 400


class TestSendChatJoinRequestWebApp:
    async def test_sends_query_id_and_url(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert (
            await bot.send_chat_join_request_web_app("join-1", "https://example.com/app?start=abc")
            is True
        )
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendChatJoinRequestWebApp"
        assert sent_payload(seen[0]) == {
            "chat_join_request_query_id": "join-1",
            "web_app_url": "https://example.com/app?start=abc",
        }

    async def test_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: query not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.send_chat_join_request_web_app("join-1", "https://example.com")


class TestSavePreparedKeyboardButton:
    async def test_serializes_typed_button(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"id": "prepared-1"}), seen)
        bot = make_bot(bot_transport, step)
        button = KeyboardButton(
            text="Share team",
            request_chat=KeyboardButtonRequestChat(
                request_id=1, chat_is_channel=False, request_title=True
            ),
        )
        prepared = await bot.save_prepared_keyboard_button(42, button)
        assert isinstance(prepared, PreparedKeyboardButton)
        assert prepared.id == "prepared-1"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/savePreparedKeyboardButton"
        assert sent_payload(seen[0]) == {
            "user_id": 42,
            "button": {
                "text": "Share team",
                "request_chat": {"request_id": 1, "chat_is_channel": False, "request_title": True},
            },
        }

    async def test_accepts_plain_dict_button(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"id": "prepared-2"}), seen)
        bot = make_bot(bot_transport, step)
        prepared = await bot.save_prepared_keyboard_button(42, {"text": "Pick users"})
        assert prepared.id == "prepared-2"
        assert sent_payload(seen[0]) == {"user_id": 42, "button": {"text": "Pick users"}}

    async def test_rejects_non_object_result(self, bot_transport: Any, ok_response: Any) -> None:
        from telebot_py.types import TypeParseError

        step = record_into(ok_response(True), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeParseError):
            await bot.save_prepared_keyboard_button(42, {"text": "x"})
