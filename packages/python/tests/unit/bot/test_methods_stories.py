"""Unit tests for the story and suggested-post Bot method group.

Ported from node ``client/methods/business/stories-boosts.ts`` (editStory,
deleteStory) and ``client/methods/business/gifts.ts`` (repostStory,
approveSuggestedPost, declineSuggestedPost).
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import (
    ReactionTypeEmoji,
    Story,
    StoryArea,
    StoryAreaPosition,
    StoryAreaTypeLink,
    StoryAreaTypeSuggestedReaction,
    TypeParseError,
)
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

RAW_STORY = {"chat": {"id": 100, "type": "channel"}, "id": 7}

RAW_AREA = {
    "position": {
        "x_percentage": 25.5,
        "y_percentage": 40.0,
        "width_percentage": 30.0,
        "height_percentage": 10.0,
        "rotation_angle": 0.0,
        "corner_radius_percentage": 20.0,
    },
    "type": {"type": "link", "url": "https://example.com"},
}


class TestEditStory:
    async def test_edits_story_and_returns_typed_story(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_STORY), seen)
        bot = make_bot(bot_transport, step)
        content = {"type": "photo", "photo": "attach://photo"}
        story = await bot.edit_story("bc1", 7, content)
        assert isinstance(story, Story)
        assert story.id == 7
        assert story.chat.id == 100
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editStory"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "story_id": 7,
            "content": content,
        }

    async def test_serializes_caption_entities_and_areas(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_STORY), seen)
        bot = make_bot(bot_transport, step)
        area = StoryArea(
            position=StoryAreaPosition(
                x_percentage=25.5,
                y_percentage=40.0,
                width_percentage=30.0,
                height_percentage=10.0,
                rotation_angle=0.0,
                corner_radius_percentage=20.0,
            ),
            type=StoryAreaTypeLink(type="link", url="https://example.com"),
        )
        await bot.edit_story(
            "bc1",
            7,
            {"type": "video", "video": "attach://video"},
            caption="Take a look",
            parse_mode="HTML",
            caption_entities=[{"type": "bold", "offset": 0, "length": 4}],
            areas=[area],
        )
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "story_id": 7,
            "content": {"type": "video", "video": "attach://video"},
            "caption": "Take a look",
            "parse_mode": "HTML",
            "caption_entities": [{"type": "bold", "offset": 0, "length": 4}],
            "areas": [RAW_AREA],
        }

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: story not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.edit_story("bc1", 7, {"type": "photo"})
        assert excinfo.value.error_code == 400


class TestDeleteStory:
    async def test_deletes_story(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_story("bc1", 7) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteStory"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1", "story_id": 7}

    async def test_rejects_non_boolean_result(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response({"ok": 1}), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeParseError):
            await bot.delete_story("bc1", 7)


class TestRepostStory:
    async def test_reposts_story_with_optional_flags(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_STORY), seen)
        bot = make_bot(bot_transport, step)
        story = await bot.repost_story(
            "bc1", 200, 9, 86400, post_to_chat_page=True, protect_content=False
        )
        assert isinstance(story, Story)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/repostStory"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "from_chat_id": 200,
            "from_story_id": 9,
            "active_period": 86400,
            "post_to_chat_page": True,
            "protect_content": False,
        }

    async def test_omits_unset_optional_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_STORY), seen)
        bot = make_bot(bot_transport, step)
        await bot.repost_story("bc1", 200, 9, 86400)
        payload = sent_payload(seen[0])
        assert payload == {
            "business_connection_id": "bc1",
            "from_chat_id": 200,
            "from_story_id": 9,
            "active_period": 86400,
        }
        assert "post_to_chat_page" not in payload

    async def test_rejects_non_object_result(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response(True), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeParseError):
            await bot.repost_story("bc1", 200, 9, 86400)


class TestApproveSuggestedPost:
    async def test_approves_suggested_post(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.approve_suggested_post(-1001234, 55) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/approveSuggestedPost"
        assert sent_payload(seen[0]) == {"chat_id": -1001234, "message_id": 55}

    async def test_sends_optional_send_date(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.approve_suggested_post(-1001234, 55, send_date=1_700_000_000) is True
        assert sent_payload(seen[0]) == {
            "chat_id": -1001234,
            "message_id": 55,
            "send_date": 1_700_000_000,
        }


class TestDeclineSuggestedPost:
    async def test_declines_with_comment(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.decline_suggested_post(-1001234, 55, comment="Not now") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/declineSuggestedPost"
        assert sent_payload(seen[0]) == {
            "chat_id": -1001234,
            "message_id": 55,
            "comment": "Not now",
        }

    async def test_omits_unset_comment(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.decline_suggested_post("@channel", 55) is True
        assert sent_payload(seen[0]) == {"chat_id": "@channel", "message_id": 55}


class TestStoryAreaTypes:
    async def test_hydrates_suggested_reaction_area(self) -> None:
        raw = {
            "position": {
                "x_percentage": 10.0,
                "y_percentage": 20.0,
                "width_percentage": 30.0,
                "height_percentage": 40.0,
                "rotation_angle": 0.0,
                "corner_radius_percentage": 50.0,
            },
            "type": {
                "type": "suggested_reaction",
                "reaction_type": {"type": "emoji", "emoji": "👍"},
                "is_dark": True,
            },
        }
        area = StoryArea.from_dict(raw)
        assert isinstance(area.position, StoryAreaPosition)
        assert isinstance(area.type, StoryAreaTypeSuggestedReaction)
        assert isinstance(area.type.reaction_type, ReactionTypeEmoji)
        assert area.type.reaction_type.emoji == "👍"
        assert area.type.is_dark is True
        assert area.to_dict() == raw
