"""Unit tests for the organizational verification Bot method group.

Ported from node ``client/methods/chats/management.ts`` (verifyUser,
verifyChat, removeUserVerification, removeChatVerification).
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestVerifyUser:
    async def test_verifies_user_with_description(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.verify_user(42, "Official Staff") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/verifyUser"
        assert sent_payload(seen[0]) == {"user_id": 42, "custom_description": "Official Staff"}

    async def test_omits_unset_custom_description(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.verify_user(42) is True
        payload = sent_payload(seen[0])
        assert payload == {"user_id": 42}
        assert "custom_description" not in payload


class TestVerifyChat:
    async def test_verifies_channel_by_username(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.verify_chat("@my_channel", "Verified Community") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/verifyChat"
        assert sent_payload(seen[0]) == {
            "chat_id": "@my_channel",
            "custom_description": "Verified Community",
        }

    async def test_omits_unset_custom_description(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        step = record_into(ok_response(True), [])
        bot = make_bot(bot_transport, step)
        assert await bot.verify_chat(-1001234567890) is True


class TestRemoveUserVerification:
    async def test_removes_verification(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.remove_user_verification(42) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/removeUserVerification"
        assert sent_payload(seen[0]) == {"user_id": 42}


class TestRemoveChatVerification:
    async def test_removes_verification(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.remove_chat_verification("@my_channel") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/removeChatVerification"
        assert sent_payload(seen[0]) == {"chat_id": "@my_channel"}


class TestVerificationApiError:
    async def test_verify_user_error(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(403, 403, "Forbidden: bot cannot verify users"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.verify_user(42)
        assert excinfo.value.error_code == 403

    async def test_remove_chat_verification_error(
        self, bot_transport: Any, error_response: Any
    ) -> None:
        step = record_into(error_response(400, 400, "Bad Request: chat not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.remove_chat_verification(1)
