"""Unit tests for the stories/gifts Bot method group (T051; parity with stories_gifts.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import Story
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestPostStory:
    async def test_posts_story_with_caption_and_privacy(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        content = {"type": "photo", "photo": "https://example.com/pic.jpg"}
        result = {"chat": {"id": 1, "type": "channel"}, "id": 5}
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        story = await bot.post_story("bc1", content, 86400, caption="Hello", privacy="contacts")
        assert isinstance(story, Story)
        assert story.id == 5
        assert story.chat.id == 1
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/postStory"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "content": content,
            "active_period": 86400,
            "caption": "Hello",
            "privacy": "contacts",
        }

    async def test_omits_unset_caption_and_privacy(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        result = {"chat": {"id": 1, "type": "channel"}, "id": 7}
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        story = await bot.post_story("bc1", {"type": "photo"}, 3600)
        assert story.id == 7
        payload = sent_payload(seen[0])
        assert payload == {
            "business_connection_id": "bc1",
            "content": {"type": "photo"},
            "active_period": 3600,
        }
        assert "caption" not in payload
        assert "privacy" not in payload

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(403, 403, "Forbidden: business connection not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.post_story("bc1", {"type": "photo"}, 3600)
        assert excinfo.value.error_code == 403


class TestSetUserEmojiStatus:
    async def test_sets_custom_emoji_and_expiration(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert (
            await bot.set_user_emoji_status(
                42, "emoji-1", emoji_status_expiration_date=1_700_000_000
            )
            is True
        )
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setUserEmojiStatus"
        assert sent_payload(seen[0]) == {
            "user_id": 42,
            "custom_emoji_id": "emoji-1",
            "emoji_status_expiration_date": 1_700_000_000,
        }

    async def test_omits_unset_optional_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_user_emoji_status(42) is True
        payload = sent_payload(seen[0])
        assert payload == {"user_id": 42}
        assert "custom_emoji_id" not in payload
        assert "emoji_status_expiration_date" not in payload

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: user has no permission"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.set_user_emoji_status(42)
        assert excinfo.value.error_code == 400
