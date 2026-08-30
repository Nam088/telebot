"""Unit tests for the bot profile Bot method group (T051; parity with profile.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import BotCommand, BotDescription, BotName, BotShortDescription
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestLogOutAndClose:
    async def test_log_out(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.log_out() is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/logOut"
        assert sent_payload(seen[0]) == {}

    async def test_close(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.close() is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/close"
        assert sent_payload(seen[0]) == {}


class TestBotName:
    async def test_set_my_name(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_my_name(name="Bot", language_code="en") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setMyName"
        assert sent_payload(seen[0]) == {"name": "Bot", "language_code": "en"}

    async def test_get_my_name(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"name": "Bot"}), seen)
        bot = make_bot(bot_transport, step)
        name = await bot.get_my_name(language_code="en")
        assert isinstance(name, BotName)
        assert name.name == "Bot"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getMyName"
        assert sent_payload(seen[0]) == {"language_code": "en"}


class TestBotDescription:
    async def test_set_my_description(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_my_description(description="desc", language_code="en") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setMyDescription"
        assert sent_payload(seen[0]) == {"description": "desc", "language_code": "en"}

    async def test_get_my_description(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"description": "desc"}), seen)
        bot = make_bot(bot_transport, step)
        description = await bot.get_my_description(language_code="en")
        assert isinstance(description, BotDescription)
        assert description.description == "desc"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getMyDescription"
        assert sent_payload(seen[0]) == {"language_code": "en"}


class TestBotShortDescription:
    async def test_set_my_short_description(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_my_short_description(short_description="short", language_code="en")
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setMyShortDescription"
        assert sent_payload(seen[0]) == {
            "short_description": "short",
            "language_code": "en",
        }

    async def test_get_my_short_description(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"short_description": "short"}), seen)
        bot = make_bot(bot_transport, step)
        description = await bot.get_my_short_description(language_code="en")
        assert isinstance(description, BotShortDescription)
        assert description.short_description == "short"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getMyShortDescription"
        assert sent_payload(seen[0]) == {"language_code": "en"}


class TestBotCommands:
    COMMANDS = [{"command": "start", "description": "Start the bot"}]
    SCOPE = {"type": "chat", "chat_id": 123}

    async def test_set_my_commands(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_my_commands(self.COMMANDS, scope=self.SCOPE, language_code="en")
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setMyCommands"
        assert sent_payload(seen[0]) == {
            "commands": self.COMMANDS,
            "scope": self.SCOPE,
            "language_code": "en",
        }

    async def test_get_my_commands(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(self.COMMANDS), seen)
        bot = make_bot(bot_transport, step)
        commands = await bot.get_my_commands(scope=self.SCOPE, language_code="en")
        assert len(commands) == 1
        assert isinstance(commands[0], BotCommand)
        assert commands[0].command == "start"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getMyCommands"
        assert sent_payload(seen[0]) == {
            "scope": self.SCOPE,
            "language_code": "en",
        }

    async def test_delete_my_commands(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_my_commands(scope=self.SCOPE, language_code="en")
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteMyCommands"
        assert sent_payload(seen[0]) == {
            "scope": self.SCOPE,
            "language_code": "en",
        }


class TestMyProfilePhoto:
    async def test_set_my_profile_photo(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_my_profile_photo("photo_file_id") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setMyProfilePhoto"
        assert sent_payload(seen[0]) == {"photo": "photo_file_id"}

    async def test_remove_my_profile_photo(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.remove_my_profile_photo() is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/removeMyProfilePhoto"
        assert sent_payload(seen[0]) == {}


class TestProfileApiError:
    async def test_set_my_name_error(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: invalid"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.set_my_name(name="x")
        assert excinfo.value.error_code == 400

    async def test_remove_my_profile_photo_error(
        self, bot_transport: Any, error_response: Any
    ) -> None:
        step = record_into(error_response(400, 400, "Bad Request: no photo"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.remove_my_profile_photo()
