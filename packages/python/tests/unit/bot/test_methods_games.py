"""Unit tests for the games Bot method group (T051; parity with games.go)."""

from __future__ import annotations

from typing import Any

import httpx

from telebot_py.types import GameHighScore, Message
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestSendGame:
    async def test_sends_game_message(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=30, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_game("@gamechannel", "lucas")
        assert isinstance(message, Message)
        assert message.message_id == 30
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendGame"
        assert sent_payload(seen[0]) == {
            "chat_id": "@gamechannel",
            "game_short_name": "lucas",
        }


class TestSetGameScore:
    async def test_chat_message_target_returns_message(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=30, text=None)), seen)
        bot = make_bot(bot_transport, step)
        result = await bot.set_game_score(1, 42, chat_id=2, message_id=30)
        assert isinstance(result, Message)
        assert result.message_id == 30
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setGameScore"
        assert sent_payload(seen[0]) == {
            "user_id": 1,
            "score": 42,
            "chat_id": 2,
            "message_id": 30,
        }

    async def test_inline_target_returns_true(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        result = await bot.set_game_score(1, 10, inline_message_id="im1")
        assert result is True
        assert sent_payload(seen[0]) == {
            "user_id": 1,
            "score": 10,
            "inline_message_id": "im1",
        }

    async def test_serializes_force_flags(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        await bot.set_game_score(
            1, 5, inline_message_id="im1", force=True, disable_edit_message=True
        )
        assert sent_payload(seen[0]) == {
            "user_id": 1,
            "score": 5,
            "inline_message_id": "im1",
            "force": True,
            "disable_edit_message": True,
        }


class TestGetGameHighScores:
    async def test_returns_typed_scores(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = [
            {"position": 1, "user": {"id": 1, "is_bot": False, "first_name": "Alice"}, "score": 42},
        ]
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        scores = await bot.get_game_high_scores(1, chat_id=2, message_id=30)
        assert len(scores) == 1
        assert isinstance(scores[0], GameHighScore)
        assert scores[0].score == 42
        assert scores[0].user.first_name == "Alice"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getGameHighScores"
        assert sent_payload(seen[0]) == {"user_id": 1, "chat_id": 2, "message_id": 30}
