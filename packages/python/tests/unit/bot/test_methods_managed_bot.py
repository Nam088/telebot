"""Unit tests for the managed-bot access/token methods and join-request queries.

Ports the node ``client/methods/business/gifts.ts`` and
``client/methods/business/ephemeral.ts`` cases for
``getManagedBotAccessSettings``, ``setManagedBotAccessSettings``,
``getManagedBotToken``, ``replaceManagedBotToken``, and
``answerChatJoinRequestQuery``.
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import BotAccessSettings, TypeParseError, User
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

RAW_OWNER = {"id": 42, "is_bot": False, "first_name": "Owner"}
RAW_ADDED = {"id": 43, "is_bot": False, "first_name": "Helper"}


class TestGetManagedBotAccessSettings:
    async def test_returns_typed_access_settings(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response({"is_access_restricted": True, "added_users": [RAW_ADDED]}), seen
        )
        bot = make_bot(bot_transport, step)
        settings = await bot.get_managed_bot_access_settings(42)
        assert isinstance(settings, BotAccessSettings)
        assert settings.is_access_restricted is True
        assert isinstance(settings.added_users, list)
        assert settings.added_users[0].first_name == "Helper"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getManagedBotAccessSettings"
        assert sent_payload(seen[0]) == {"user_id": 42}

    async def test_accepts_keyword_user_id(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"is_access_restricted": False}), seen)
        bot = make_bot(bot_transport, step)
        settings = await bot.get_managed_bot_access_settings(user_id=42)
        assert settings.added_users is None
        assert sent_payload(seen[0]) == {"user_id": 42}

    async def test_user_id_is_required(self, bot_transport: Any, ok_response: Any) -> None:
        bot = make_bot(bot_transport, record_into(ok_response({}), []))
        with pytest.raises(TypeError):
            await bot.get_managed_bot_access_settings()

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: user not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.get_managed_bot_access_settings(42)


class TestSetManagedBotAccessSettings:
    async def test_sends_restriction_and_added_users(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_managed_bot_access_settings(42, True, added_user_ids=[7, 8]) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setManagedBotAccessSettings"
        assert sent_payload(seen[0]) == {
            "user_id": 42,
            "is_access_restricted": True,
            "added_user_ids": [7, 8],
        }

    async def test_sends_false_restriction_flag(self, bot_transport: Any, ok_response: Any) -> None:
        """is_access_restricted is required, so False must still reach the wire."""
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_managed_bot_access_settings(42, False) is True
        payload = sent_payload(seen[0])
        assert payload == {"user_id": 42, "is_access_restricted": False}
        assert "added_user_ids" not in payload

    async def test_sends_empty_added_user_ids(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_managed_bot_access_settings(42, True, added_user_ids=[]) is True
        assert sent_payload(seen[0]) == {
            "user_id": 42,
            "is_access_restricted": True,
            "added_user_ids": [],
        }

    async def test_restriction_flag_is_required(self, bot_transport: Any, ok_response: Any) -> None:
        bot = make_bot(bot_transport, record_into(ok_response(True), []))
        with pytest.raises(TypeError):
            await bot.set_managed_bot_access_settings(42)

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(
            error_response(403, 403, "Forbidden: bot is not managed by the caller"), []
        )
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.set_managed_bot_access_settings(42, True)
        assert excinfo.value.error_code == 403


class TestManagedBotToken:
    async def test_get_managed_bot_token_returns_string(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response("42:ABC-TOKEN"), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.get_managed_bot_token(42) == "42:ABC-TOKEN"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getManagedBotToken"
        assert sent_payload(seen[0]) == {"user_id": 42}

    async def test_replace_managed_bot_token_returns_string(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response("42:NEW-TOKEN"), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.replace_managed_bot_token(user_id=42) == "42:NEW-TOKEN"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/replaceManagedBotToken"
        assert sent_payload(seen[0]) == {"user_id": 42}

    async def test_rejects_non_string_result(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response(True), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeParseError):
            await bot.get_managed_bot_token(42)

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(403, 403, "Forbidden: access denied"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.replace_managed_bot_token(42)


class TestAnswerChatJoinRequestQuery:
    async def test_approves_join_request_query(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.answer_chat_join_request_query("join-1", "approve") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/answerChatJoinRequestQuery"
        assert sent_payload(seen[0]) == {
            "chat_join_request_query_id": "join-1",
            "result": "approve",
        }

    @pytest.mark.parametrize("result", ["approve", "decline", "queue"])
    async def test_accepts_documented_results(
        self, bot_transport: Any, ok_response: Any, result: str
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.answer_chat_join_request_query("join-1", result) is True
        assert sent_payload(seen[0])["result"] == result

    async def test_omits_nothing_and_errors(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: query is too old"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.answer_chat_join_request_query("join-1", "queue")


class TestBotAccessSettingsType:
    def test_hydrates_added_users(self) -> None:
        settings = BotAccessSettings.from_dict(
            {"is_access_restricted": True, "added_users": [RAW_OWNER], "unknown": 1}
        )
        assert settings.is_access_restricted is True
        assert isinstance(settings.added_users, list)
        assert isinstance(settings.added_users[0], User)
        assert settings.added_users[0].id == 42

    def test_round_trips(self) -> None:
        settings = BotAccessSettings(is_access_restricted=False, added_users=None)
        assert settings.to_dict() == {"is_access_restricted": False}
        assert settings.added_users is None
