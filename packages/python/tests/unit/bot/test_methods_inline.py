"""Unit tests for the inline Bot method group (T051; parity with inline.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import PreparedInlineMessage, SentWebAppMessage
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestAnswerInlineQuery:
    async def test_answers_with_results(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        results = [{"type": "article", "id": "1", "title": "A"}]
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.answer_inline_query(
            "q1", results, cache_time=60, is_personal=True, next_offset="off"
        )
        assert ok is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/answerInlineQuery"
        assert sent_payload(seen[0]) == {
            "inline_query_id": "q1",
            "results": results,
            "cache_time": 60,
            "is_personal": True,
            "next_offset": "off",
        }

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: invalid result"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.answer_inline_query("q1", [])
        assert excinfo.value.error_code == 400


class TestAnswerWebAppQuery:
    async def test_returns_sent_web_app_message(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"inline_message_id": "im1"}), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.answer_web_app_query("w1", {"type": "article", "id": "2"})
        assert isinstance(message, SentWebAppMessage)
        assert message.inline_message_id == "im1"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/answerWebAppQuery"
        assert sent_payload(seen[0]) == {
            "web_app_query_id": "w1",
            "result": {"type": "article", "id": "2"},
        }


class TestSavePreparedInlineMessage:
    async def test_returns_prepared_message(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"id": "prep1", "expiration_date": 123_456_789}), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.save_prepared_inline_message(
            123,
            {"type": "article", "id": "3"},
            allow_user_chats=True,
            allow_channel_chats=True,
        )
        assert isinstance(message, PreparedInlineMessage)
        assert message.id == "prep1"
        assert message.expiration_date == 123_456_789
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/savePreparedInlineMessage"
        assert sent_payload(seen[0]) == {
            "user_id": 123,
            "result": {"type": "article", "id": "3"},
            "allow_user_chats": True,
            "allow_channel_chats": True,
        }
