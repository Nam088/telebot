"""Unit tests for the media Bot method group (T051; parity with media.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import Message
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestSendAudio:
    async def test_sends_audio_file_id_with_caption(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=1, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_audio("@channel", "audio_file_id", caption="song")
        assert isinstance(message, Message)
        assert message.message_id == 1
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendAudio"
        assert sent_payload(seen[0]) == {
            "chat_id": "@channel",
            "audio": "audio_file_id",
            "caption": "song",
        }

    async def test_serializes_optional_fields(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_audio(
            123,
            "audio_file_id",
            caption="song",
            parse_mode="HTML",
            duration=180,
            performer="Artist",
            title="Track",
            disable_notification=True,
        )
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "audio": "audio_file_id",
            "caption": "song",
            "parse_mode": "HTML",
            "duration": 180,
            "performer": "Artist",
            "title": "Track",
            "disable_notification": True,
        }


class TestSendVideo:
    async def test_sends_video_with_dimensions(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=2, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_video(
            123,
            "video_file_id",
            width=1920,
            height=1080,
            supports_streaming=True,
        )
        assert isinstance(message, Message)
        assert message.message_id == 2
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendVideo"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "video": "video_file_id",
            "width": 1920,
            "height": 1080,
            "supports_streaming": True,
        }

    async def test_error_response_raises_with_retry_after(
        self, bot_transport: Any, error_response: Any
    ) -> None:
        step = record_into(error_response(429, 429, "Too Many Requests", retry_after=42), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.send_video(123, "video_id")
        assert excinfo.value.error_code == 429
        assert excinfo.value.retry_after == 42.0
        assert excinfo.value.method == "sendVideo"


class TestSendAnimation:
    async def test_sends_animation_with_spoiler(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=3, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_animation(123, "anim_file_id", has_spoiler=True)
        assert isinstance(message, Message)
        assert message.message_id == 3
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendAnimation"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "animation": "anim_file_id",
            "has_spoiler": True,
        }


class TestSendVoice:
    async def test_sends_voice_with_duration(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=4, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_voice(123, "voice_file_id", duration=10)
        assert isinstance(message, Message)
        assert message.message_id == 4
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendVoice"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "voice": "voice_file_id",
            "duration": 10,
        }


class TestSendVideoNote:
    async def test_sends_video_note_with_length(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=5, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_video_note(123, "vn_file_id", length=240)
        assert isinstance(message, Message)
        assert message.message_id == 5
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendVideoNote"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "video_note": "vn_file_id",
            "length": 240,
        }


class TestSendMediaGroup:
    async def test_sends_album_of_media_dicts(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response(
                [make_message(message_id=11, text=None), make_message(message_id=12, text=None)]
            ),
            seen,
        )
        bot = make_bot(bot_transport, step)
        messages = await bot.send_media_group(
            123,
            [
                {"type": "photo", "media": "photo_id"},
                {"type": "video", "media": "video_id"},
            ],
        )
        assert [message.message_id for message in messages] == [11, 12]
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendMediaGroup"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "media": [
                {"type": "photo", "media": "photo_id"},
                {"type": "video", "media": "video_id"},
            ],
        }


class TestSendLocation:
    async def test_sends_location_with_live_period(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=6, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_location(123, 40.7, -74.0, live_period=60)
        assert isinstance(message, Message)
        assert message.message_id == 6
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendLocation"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "latitude": 40.7,
            "longitude": -74.0,
            "live_period": 60,
        }


class TestSendVenue:
    async def test_sends_venue_with_foursquare_id(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_venue(123, 40.7, -74.0, "Cafe", "1 Main St", foursquare_id="4sq")
        assert isinstance(message, Message)
        assert message.message_id == 7
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendVenue"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "latitude": 40.7,
            "longitude": -74.0,
            "title": "Cafe",
            "address": "1 Main St",
            "foursquare_id": "4sq",
        }


class TestSendContact:
    async def test_sends_contact_with_names(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=8, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_contact(123, "+123", "Alice", last_name="Smith")
        assert isinstance(message, Message)
        assert message.message_id == 8
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendContact"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "phone_number": "+123",
            "first_name": "Alice",
            "last_name": "Smith",
        }


class TestSendPoll:
    async def test_sends_poll_and_omits_unset_flags(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=9, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_poll(123, "Q?", ["A", "B"])
        assert isinstance(message, Message)
        assert message.message_id == 9
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendPoll"
        payload = sent_payload(seen[0])
        assert payload == {"chat_id": 123, "question": "Q?", "options": ["A", "B"]}
        assert "is_anonymous" not in payload


class TestSendDice:
    async def test_sends_dice_with_emoji(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=10, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_dice(123, emoji="🎲")
        assert isinstance(message, Message)
        assert message.message_id == 10
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendDice"
        assert sent_payload(seen[0]) == {"chat_id": 123, "emoji": "🎲"}


class TestSendPhotoAndDocument:
    async def test_send_photo_with_parse_mode(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_photo(
            123, "photo_file_id", caption="*hi*", parse_mode="MarkdownV2"
        )
        assert isinstance(message, Message)
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "photo": "photo_file_id",
            "caption": "*hi*",
            "parse_mode": "MarkdownV2",
        }

    async def test_send_document_with_caption(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_document(123, "doc_file_id", caption="report")
        assert isinstance(message, Message)
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "document": "doc_file_id",
            "caption": "report",
        }
