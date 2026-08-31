"""Unit tests for the stories/gifts Bot method group (T051; parity with stories_gifts.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import Story, StoryArea, StoryAreaPosition, StoryAreaTypeLink
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestPostStory:
    async def test_posts_story_with_all_optionals(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        content = {"type": "photo", "photo": "https://example.com/pic.jpg"}
        result = {"chat": {"id": 1, "type": "channel"}, "id": 5}
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        area = {"position": {"x": 0.5, "y": 0.5, "width": 0.2, "height": 0.2}, "type": "link"}
        story = await bot.post_story(
            "bc1",
            content,
            86400,
            caption="Hello",
            parse_mode="Markdown",
            caption_entities=[{"type": "bold", "offset": 0, "length": 5}],
            areas=[area],
            post_to_chat_page=True,
            protect_content=True,
        )
        assert isinstance(story, Story)
        assert story.id == 5
        assert story.chat.id == 1
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/postStory"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "content": content,
            "active_period": 86400,
            "caption": "Hello",
            "parse_mode": "Markdown",
            "caption_entities": [{"type": "bold", "offset": 0, "length": 5}],
            "areas": [area],
            "post_to_chat_page": True,
            "protect_content": True,
        }

    async def test_accepts_typed_story_area(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"chat": {"id": 1, "type": "channel"}, "id": 6}), seen)
        bot = make_bot(bot_transport, step)
        area = StoryArea(
            position=StoryAreaPosition(
                x_percentage=0.1,
                y_percentage=0.2,
                width_percentage=0.3,
                height_percentage=0.4,
                rotation_angle=0.0,
                corner_radius_percentage=0.0,
            ),
            type=StoryAreaTypeLink(type="link", url="https://example.com"),
        )
        assert (await bot.post_story("bc1", {"type": "photo"}, 86400, areas=[area])).id == 6
        assert sent_payload(seen[0])["areas"] == [
            {
                "position": {
                    "x_percentage": 0.1,
                    "y_percentage": 0.2,
                    "width_percentage": 0.3,
                    "height_percentage": 0.4,
                    "rotation_angle": 0.0,
                    "corner_radius_percentage": 0.0,
                },
                "type": {"type": "link", "url": "https://example.com"},
            }
        ]

    async def test_omits_unset_optionals(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = {"chat": {"id": 1, "type": "channel"}, "id": 7}
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        story = await bot.post_story("bc1", {"type": "photo"}, 86400)
        assert story.id == 7
        payload = sent_payload(seen[0])
        assert payload == {
            "business_connection_id": "bc1",
            "content": {"type": "photo"},
            "active_period": 86400,
        }
        for key in (
            "caption",
            "parse_mode",
            "caption_entities",
            "areas",
            "post_to_chat_page",
            "protect_content",
            "privacy",
        ):
            assert key not in payload

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(403, 403, "Forbidden: business connection not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.post_story("bc1", {"type": "photo"}, 86400)
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
        payload = sent_payload(seen[0])
        assert payload == {
            "user_id": 42,
            "emoji_status_custom_emoji_id": "emoji-1",
            "emoji_status_expiration_date": 1_700_000_000,
        }
        assert "custom_emoji_id" not in payload

    async def test_accepts_documented_keyword_name(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_user_emoji_status(42, emoji_status_custom_emoji_id="emoji-2") is True
        assert sent_payload(seen[0]) == {
            "user_id": 42,
            "emoji_status_custom_emoji_id": "emoji-2",
        }

    async def test_omits_unset_optional_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_user_emoji_status(42) is True
        payload = sent_payload(seen[0])
        assert payload == {"user_id": 42}
        assert "custom_emoji_id" not in payload
        assert "emoji_status_custom_emoji_id" not in payload
        assert "emoji_status_expiration_date" not in payload

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: user has no permission"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.set_user_emoji_status(42)
        assert excinfo.value.error_code == 400
