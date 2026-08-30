"""Unit tests for the remaining edit Bot API methods (T055 parity completion).

Mirrors packages/go/pkg/bot/edits_test.go cases for EditMessageMedia,
EditMessageLiveLocation, StopMessageLiveLocation, and StopPoll.
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.types import Message
from telebot_py.types.common import Poll
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestEditMessageMedia:
    async def test_edits_media_and_returns_message(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.edit_message_media(
            {"type": "photo", "media": "https://example.com/new.jpg"},
            chat_id=1,
            message_id=7,
        )
        assert isinstance(message, Message)
        assert message.message_id == 7
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editMessageMedia"
        assert sent_payload(seen[0]) == {
            "media": {"type": "photo", "media": "https://example.com/new.jpg"},
            "chat_id": 1,
            "message_id": 7,
        }

    async def test_inline_message_returns_true(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        media = {"type": "video", "media": "video_file_id"}
        assert await bot.edit_message_media(media, inline_message_id="abc") is True
        assert sent_payload(seen[0]) == {
            "media": media,
            "inline_message_id": "abc",
        }

    async def test_media_accepts_to_dict_objects(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        class InputMedia:
            def to_dict(self) -> dict[str, object]:
                return {"type": "photo", "media": "photo_file_id"}

        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7, text=None)), seen)
        bot = make_bot(bot_transport, step)
        await bot.edit_message_media(InputMedia(), chat_id=1, message_id=7)
        assert sent_payload(seen[0])["media"] == {"type": "photo", "media": "photo_file_id"}


class TestEditMessageLiveLocation:
    async def test_edits_live_location_with_heading(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.edit_message_live_location(
            37.5,
            -122.5,
            chat_id=1,
            message_id=7,
            heading=90,
        )
        assert isinstance(message, Message)
        assert message.message_id == 7
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editMessageLiveLocation"
        assert sent_payload(seen[0]) == {
            "latitude": 37.5,
            "longitude": -122.5,
            "chat_id": 1,
            "message_id": 7,
            "heading": 90,
        }

    async def test_serializes_accuracy_and_live_period(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7, text=None)), seen)
        bot = make_bot(bot_transport, step)
        await bot.edit_message_live_location(
            1.5,
            2.5,
            chat_id="@channel",
            message_id=7,
            live_period=600,
            horizontal_accuracy=12.5,
            proximity_alert_radius=500,
        )
        assert sent_payload(seen[0]) == {
            "latitude": 1.5,
            "longitude": 2.5,
            "chat_id": "@channel",
            "message_id": 7,
            "live_period": 600,
            "horizontal_accuracy": 12.5,
            "proximity_alert_radius": 500,
        }

    async def test_rejects_vertical_accuracy(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        """No Bot API method carries vertical_accuracy; the kwarg must not exist."""
        step = record_into(ok_response(make_message(message_id=7, text=None)), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeError):
            await bot.edit_message_live_location(
                1.5, 2.5, chat_id=1, message_id=7, vertical_accuracy=4.0
            )


class TestEditMessageText:
    async def test_edits_text_without_message_thread_id(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.edit_message_text(
            "new text", chat_id=1, message_id=7, parse_mode="HTML"
        )
        assert isinstance(message, Message)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editMessageText"
        payload = sent_payload(seen[0])
        assert payload == {
            "text": "new text",
            "chat_id": 1,
            "message_id": 7,
            "parse_mode": "HTML",
        }
        assert "message_thread_id" not in payload

    async def test_rejects_message_thread_id(self, bot_transport: Any, ok_response: Any) -> None:
        """editMessageText's documented parameter set has no message_thread_id."""
        step = record_into(ok_response(True), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeError):
            await bot.edit_message_text("t", chat_id=1, message_id=7, message_thread_id=3)


class TestStopMessageLiveLocation:
    async def test_stops_live_location(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.stop_message_live_location(chat_id="@channel", message_id=7)
        assert isinstance(message, Message)
        assert message.message_id == 7
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/stopMessageLiveLocation"
        assert sent_payload(seen[0]) == {"chat_id": "@channel", "message_id": 7}

    async def test_inline_message_returns_true(self, bot_transport: Any, ok_response: Any) -> None:
        bot = make_bot(bot_transport, record_into(ok_response(True), []))
        assert await bot.stop_message_live_location(inline_message_id="abc") is True


class TestStopPoll:
    async def test_stops_poll_and_returns_poll(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response(
                {
                    "id": "poll_1",
                    "question": "Favorite color?",
                    "options": [
                        {"text": "Red", "voter_count": 2},
                        {"text": "Blue", "voter_count": 1},
                    ],
                    "total_voter_count": 3,
                    "is_closed": True,
                    "is_anonymous": True,
                    "type": "regular",
                    "allows_multiple_answers": False,
                }
            ),
            seen,
        )
        bot = make_bot(bot_transport, step)
        poll = await bot.stop_poll(1, 7)
        assert isinstance(poll, Poll)
        assert poll.id == "poll_1"
        assert poll.question == "Favorite color?"
        assert poll.total_voter_count == 3
        assert poll.is_closed is True
        assert poll.options[0].text == "Red"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/stopPoll"
        assert sent_payload(seen[0]) == {"chat_id": 1, "message_id": 7}

    async def test_serializes_reply_markup(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response(
                {
                    "id": "p",
                    "question": "q",
                    "options": [],
                    "total_voter_count": 0,
                    "is_closed": True,
                    "is_anonymous": True,
                    "type": "regular",
                    "allows_multiple_answers": False,
                }
            ),
            seen,
        )
        bot = make_bot(bot_transport, step)
        markup = {"inline_keyboard": []}
        await bot.stop_poll("@channel", 9, reply_markup=markup)
        assert sent_payload(seen[0]) == {
            "chat_id": "@channel",
            "message_id": 9,
            "reply_markup": markup,
        }


class TestSendMessageDraft:
    async def test_sends_required_fields_only(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.send_message_draft(123, 1) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendMessageDraft"
        assert sent_payload(seen[0]) == {"chat_id": 123, "draft_id": 1}

    async def test_keeps_empty_text_on_the_wire(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.send_message_draft(123, 2, text="", can_stop=True) is True
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "draft_id": 2,
            "text": "",
            "can_stop": True,
        }

    async def test_serializes_entities_and_options(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_message_draft(
            123,
            3,
            message_thread_id=7,
            text="Working",
            parse_mode="HTML",
            entities=[{"type": "bold", "offset": 0, "length": 7}],
            can_stop=True,
            keep_on_stop=False,
        )
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "draft_id": 3,
            "message_thread_id": 7,
            "text": "Working",
            "parse_mode": "HTML",
            "entities": [{"type": "bold", "offset": 0, "length": 7}],
            "can_stop": True,
            "keep_on_stop": False,
        }
