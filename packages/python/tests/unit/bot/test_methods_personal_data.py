"""Unit tests for the user personal-data read methods.

Covers ``Bot.get_user_personal_chat_messages`` (node
``client/methods/messages/send-basic.ts``) and
``Bot.get_user_profile_audios`` (node ``client/methods/business/gifts.ts``).
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import Message, TypeParseError, UserProfileAudios
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

RAW_AUDIO = {"file_id": "a1", "file_unique_id": "au1", "duration": 120, "title": "Track"}


class TestGetUserPersonalChatMessages:
    async def test_returns_typed_messages(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response([make_message(message_id=3), make_message(message_id=4)]), seen
        )
        bot = make_bot(bot_transport, step)
        messages = await bot.get_user_personal_chat_messages(42, 10)
        assert [m.message_id for m in messages] == [3, 4]
        assert all(isinstance(m, Message) for m in messages)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getUserPersonalChatMessages"
        assert sent_payload(seen[0]) == {"user_id": 42, "limit": 10}

    async def test_accepts_keyword_arguments(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response([]), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.get_user_personal_chat_messages(user_id=42, limit=1) == []
        assert sent_payload(seen[0]) == {"user_id": 42, "limit": 1}

    async def test_limit_is_required(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response([]), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeError):
            await bot.get_user_personal_chat_messages(42)  # type: ignore[call-arg]

    async def test_rejects_non_array_result(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response({"message_id": 1}), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeParseError):
            await bot.get_user_personal_chat_messages(42, 10)

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: user not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.get_user_personal_chat_messages(42, 10)


class TestGetUserProfileAudios:
    async def test_returns_typed_audios(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"total_count": 1, "audios": [RAW_AUDIO]}), seen)
        bot = make_bot(bot_transport, step)
        audios = await bot.get_user_profile_audios(42, 0, 20)
        assert isinstance(audios, UserProfileAudios)
        assert audios.total_count == 1
        assert audios.audios[0].title == "Track"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getUserProfileAudios"
        assert sent_payload(seen[0]) == {"user_id": 42, "offset": 0, "limit": 20}

    async def test_omits_unset_pagination(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"total_count": 0, "audios": []}), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.get_user_profile_audios(42) == UserProfileAudios(total_count=0, audios=[])
        assert sent_payload(seen[0]) == {"user_id": 42}

    async def test_round_trips_nested_audio(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response({"total_count": 1, "audios": [RAW_AUDIO]}), [])
        bot = make_bot(bot_transport, step)
        assert (await bot.get_user_profile_audios(42)).to_dict() == {
            "total_count": 1,
            "audios": [RAW_AUDIO],
        }
