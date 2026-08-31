"""Unit tests for the reaction Bot method group (T051; parity with reactions.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestSetMessageReaction:
    async def test_sets_emoji_reaction_with_big(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.set_message_reaction(1, 7, [{"type": "emoji", "emoji": "👍"}], is_big=True)
        assert ok is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setMessageReaction"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "message_id": 7,
            "reaction": [{"type": "emoji", "emoji": "👍"}],
            "is_big": True,
        }

    async def test_sets_custom_emoji_reaction(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.set_message_reaction(
            "@channel",
            7,
            [{"type": "custom_emoji", "custom_emoji_id": "5368324170671202286"}],
        )
        assert ok is True
        assert sent_payload(seen[0]) == {
            "chat_id": "@channel",
            "message_id": 7,
            "reaction": [{"type": "custom_emoji", "custom_emoji_id": "5368324170671202286"}],
        }

    async def test_omits_unset_reaction_and_is_big(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.set_message_reaction(1, 7)
        assert ok is True
        payload = sent_payload(seen[0])
        assert payload == {"chat_id": 1, "message_id": 7}
        assert "reaction" not in payload
        assert "is_big" not in payload

    async def test_accepts_single_reaction_mapping(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.set_message_reaction(1, 7, {"type": "emoji", "emoji": "🔥"})
        assert ok is True
        assert sent_payload(seen[0])["reaction"] == [{"type": "emoji", "emoji": "🔥"}]


class TestDeleteMessageReaction:
    async def test_calls_dedicated_endpoint(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.delete_message_reaction(1, 7)
        assert ok is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteMessageReaction"
        payload = sent_payload(seen[0])
        assert payload == {"chat_id": 1, "message_id": 7}
        assert "reaction" not in payload
        assert "is_big" not in payload

    async def test_forwards_optional_user_and_actor_chat(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.delete_message_reaction("@supergroup", 7, user_id=42, actor_chat_id=-10099)
        assert ok is True
        assert sent_payload(seen[0]) == {
            "chat_id": "@supergroup",
            "message_id": 7,
            "user_id": 42,
            "actor_chat_id": -10099,
        }

    async def test_rejects_is_big(self, bot_transport: Any, ok_response: Any) -> None:
        """is_big only exists on setMessageReaction."""
        bot = make_bot(bot_transport, record_into(ok_response(True), []))
        with pytest.raises(TypeError):
            await bot.delete_message_reaction(1, 7, is_big=True)


class TestDeleteAllMessageReactions:
    async def test_calls_dedicated_endpoint_without_message_id(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.delete_all_message_reactions("@channel")
        assert ok is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteAllMessageReactions"
        payload = sent_payload(seen[0])
        assert payload == {"chat_id": "@channel"}
        assert "message_id" not in payload
        assert "reaction" not in payload

    async def test_forwards_optional_user_and_actor_chat(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.delete_all_message_reactions(1, user_id=42)
        assert ok is True
        assert sent_payload(seen[0]) == {"chat_id": 1, "user_id": 42}

    async def test_rejects_is_big(self, bot_transport: Any, ok_response: Any) -> None:
        bot = make_bot(bot_transport, record_into(ok_response(True), []))
        with pytest.raises(TypeError):
            await bot.delete_all_message_reactions(1, is_big=True)


class TestReactionApiError:
    async def test_set_message_reaction_error(
        self, bot_transport: Any, error_response: Any
    ) -> None:
        step = record_into(error_response(400, 400, "Bad Request: message to react not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.set_message_reaction(1, 2)
        assert excinfo.value.error_code == 400

    async def test_delete_message_reaction_error(
        self, bot_transport: Any, error_response: Any
    ) -> None:
        step = record_into(error_response(400, 400, "Bad Request: not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.delete_message_reaction(1, 2)
