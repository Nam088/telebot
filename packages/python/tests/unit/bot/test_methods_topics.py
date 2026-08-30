"""Unit tests for the forum topic Bot method group (T051; parity with topics.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import ForumTopic
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestCreateForumTopic:
    async def test_creates_topic_with_icon(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = {
            "message_thread_id": 4,
            "name": "General",
            "icon_color": 0x3FB549,
            "icon_custom_emoji_id": "emoji-1",
        }
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        topic = await bot.create_forum_topic(
            -100, "General", icon_color=0x3FB549, icon_custom_emoji_id="emoji-1"
        )
        assert isinstance(topic, ForumTopic)
        assert topic.message_thread_id == 4
        assert topic.name == "General"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/createForumTopic"
        assert sent_payload(seen[0]) == {
            "chat_id": -100,
            "name": "General",
            "icon_color": 0x3FB549,
            "icon_custom_emoji_id": "emoji-1",
        }

    async def test_omits_unset_icon_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response({"message_thread_id": 5, "name": "Plain", "icon_color": 7322096}),
            seen,
        )
        bot = make_bot(bot_transport, step)
        topic = await bot.create_forum_topic(-100, "Plain")
        assert topic.message_thread_id == 5
        assert sent_payload(seen[0]) == {"chat_id": -100, "name": "Plain"}


class TestCloseForumTopic:
    async def test_closes_topic(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.close_forum_topic(-100, 4) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/closeForumTopic"
        assert sent_payload(seen[0]) == {"chat_id": -100, "message_thread_id": 4}


class TestEditForumTopic:
    async def test_edits_name_and_icon(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert (
            await bot.edit_forum_topic(-100, 4, name="Renamed", icon_custom_emoji_id="emoji-1")
            is True
        )
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editForumTopic"
        assert sent_payload(seen[0]) == {
            "chat_id": -100,
            "message_thread_id": 4,
            "name": "Renamed",
            "icon_custom_emoji_id": "emoji-1",
        }

    async def test_omits_unset_optional_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.edit_forum_topic(-100, 4) is True
        payload = sent_payload(seen[0])
        assert payload == {"chat_id": -100, "message_thread_id": 4}
        assert "name" not in payload
        assert "icon_custom_emoji_id" not in payload


class TestReopenAndDeleteForumTopic:
    async def test_reopens_topic(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.reopen_forum_topic(-100, 4) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/reopenForumTopic"
        assert sent_payload(seen[0]) == {"chat_id": -100, "message_thread_id": 4}

    async def test_deletes_topic(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_forum_topic("@supergroup", 4) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteForumTopic"
        assert sent_payload(seen[0]) == {"chat_id": "@supergroup", "message_thread_id": 4}

    async def test_unpins_all_topic_messages(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.unpin_all_forum_topic_messages(-100, 4) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/unpinAllForumTopicMessages"
        assert sent_payload(seen[0]) == {"chat_id": -100, "message_thread_id": 4}


class TestGeneralForumTopic:
    async def test_edits_general_topic_name(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.edit_general_forum_topic(-100, "General Chat") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editGeneralForumTopic"
        assert sent_payload(seen[0]) == {"chat_id": -100, "name": "General Chat"}

    @pytest.mark.parametrize(
        ("wire_name", "call"),
        [
            ("closeGeneralForumTopic", "close_general_forum_topic"),
            ("reopenGeneralForumTopic", "reopen_general_forum_topic"),
            ("hideGeneralForumTopic", "hide_general_forum_topic"),
            ("unhideGeneralForumTopic", "unhide_general_forum_topic"),
            ("unpinAllGeneralForumTopicMessages", "unpin_all_general_forum_topic_messages"),
        ],
    )
    async def test_chat_id_only_methods(
        self, bot_transport: Any, ok_response: Any, wire_name: str, call: str
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        method = getattr(bot, call)
        assert await method(-100) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/{wire_name}"
        assert sent_payload(seen[0]) == {"chat_id": -100}


class TestTopicApiError:
    async def test_create_forum_topic_error(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: chat not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.create_forum_topic(1, "n")
        assert excinfo.value.error_code == 400

    async def test_close_forum_topic_error(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: chat not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.close_forum_topic(1, 2)

    async def test_edit_forum_topic_error(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(
            error_response(400, 400, "Bad Request: can't edit the topic message"), []
        )
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.edit_forum_topic(1, 2)
        assert excinfo.value.error_code == 400

    async def test_hide_general_forum_topic_error(
        self, bot_transport: Any, error_response: Any
    ) -> None:
        step = record_into(error_response(400, 400, "Bad Request: chat not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.hide_general_forum_topic(1)
