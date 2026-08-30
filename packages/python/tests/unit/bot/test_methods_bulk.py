"""Unit tests for the bulk message Bot method group (T051; parity with bulk.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import MessageId
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestForwardMessages:
    async def test_forwards_and_returns_ids(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = [{"message_id": 101}, {"message_id": 102}, {"message_id": 103}]
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        ids = await bot.forward_messages(
            123,
            "@source",
            [11, 12, 13],
            disable_notification=True,
            protect_content=True,
            message_thread_id=4,
        )
        assert [message_id.message_id for message_id in ids] == [101, 102, 103]
        assert all(isinstance(message_id, MessageId) for message_id in ids)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/forwardMessages"
        payload = sent_payload(seen[0])
        assert payload == {
            "chat_id": 123,
            "from_chat_id": "@source",
            "message_ids": [11, 12, 13],
            "message_thread_id": 4,
            "disable_notification": True,
            "protect_content": True,
        }

    async def test_rejects_business_connection_id(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        """forwardMessages takes no business_connection_id; the kwarg must not exist."""
        bot = make_bot(bot_transport, record_into(ok_response([]), []))
        with pytest.raises(TypeError):
            await bot.forward_messages(123, 456, [1], business_connection_id="bc1")

    async def test_error_response_raises_with_retry_after(
        self, bot_transport: Any, error_response: Any
    ) -> None:
        step = record_into(
            error_response(429, 429, "Too Many Requests: retry after 7", retry_after=7), []
        )
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.forward_messages(123, 456, [1])
        assert excinfo.value.error_code == 429
        assert excinfo.value.retry_after == 7.0


class TestCopyMessages:
    async def test_copies_and_returns_ids(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = [{"message_id": 201}, {"message_id": 202}]
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        ids = await bot.copy_messages("@target", 456, [1, 2], remove_caption=True)
        assert [message_id.message_id for message_id in ids] == [201, 202]
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/copyMessages"
        payload = sent_payload(seen[0])
        assert payload == {
            "chat_id": "@target",
            "from_chat_id": 456,
            "message_ids": [1, 2],
            "remove_caption": True,
        }
        assert "business_connection_id" not in payload

    async def test_rejects_business_connection_id(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        """copyMessages takes no business_connection_id; the kwarg must not exist."""
        bot = make_bot(bot_transport, record_into(ok_response([]), []))
        with pytest.raises(TypeError):
            await bot.copy_messages(123, 456, [1], business_connection_id="bc1")

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: message to copy not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.copy_messages(123, 456, [999])
        assert excinfo.value.error_code == 400
        assert "message to copy not found" in excinfo.value.description


class TestDeleteMessages:
    async def test_deletes_multiple(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_messages(789, [5, 6]) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteMessages"
        payload = sent_payload(seen[0])
        assert payload == {"chat_id": 789, "message_ids": [5, 6]}
        assert "business_connection_id" not in payload

    async def test_rejects_business_connection_id(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        """deleteMessages takes only chat_id and message_ids."""
        bot = make_bot(bot_transport, record_into(ok_response(True), []))
        with pytest.raises(TypeError):
            await bot.delete_messages(789, [1], business_connection_id="bc1")

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: messages not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.delete_messages(789, [999])
