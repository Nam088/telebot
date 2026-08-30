"""Unit tests for the media Bot method group (T051; parity with media.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import InputMediaPhoto, InputPollOption, Message, MessageEntity
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
        message = await bot.send_poll(123, "Q?", [InputPollOption("A"), InputPollOption("B")])
        assert isinstance(message, Message)
        assert message.message_id == 9
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendPoll"
        payload = sent_payload(seen[0])
        assert payload == {
            "chat_id": 123,
            "question": "Q?",
            "options": [{"text": "A"}, {"text": "B"}],
        }
        assert "is_anonymous" not in payload
        assert "question_parse_mode" not in payload
        assert "allows_revoting" not in payload
        assert "country_codes" not in payload
        assert "description" not in payload
        assert "explanation_media" not in payload
        assert "media" not in payload

    async def test_sends_quiz_correct_option_ids_as_array(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=9, text=None)), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_poll(
            123,
            "Q?",
            [InputPollOption("A"), InputPollOption("B"), InputPollOption("C")],
            type="quiz",
            correct_option_ids=[0, 2],
        )
        payload = sent_payload(seen[0])
        assert payload["type"] == "quiz"
        assert payload["correct_option_ids"] == [0, 2]
        assert "correct_option_id" not in payload

    async def test_serializes_input_poll_option_fields(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=9, text=None)), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_poll(
            123,
            "Q?",
            [
                InputPollOption("A", text_parse_mode="HTML"),
                InputPollOption(
                    "B",
                    text_entities=[MessageEntity(type="bold", offset=0, length=1)],
                    media=InputMediaPhoto("option_photo"),
                ),
            ],
        )
        assert sent_payload(seen[0])["options"] == [
            {"text": "A", "text_parse_mode": "HTML"},
            {
                "text": "B",
                "text_entities": [{"type": "bold", "offset": 0, "length": 1}],
                "media": {"type": "photo", "media": "option_photo"},
            },
        ]

    async def test_serializes_question_description_and_media_kwargs(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=9, text=None)), seen)
        bot = make_bot(bot_transport, step)
        entity = MessageEntity(type="italic", offset=2, length=3)
        await bot.send_poll(
            123,
            "Q?",
            [InputPollOption("A"), InputPollOption("B")],
            question_parse_mode="HTML",
            question_entities=[entity],
            allows_revoting=True,
            shuffle_options=True,
            allow_adding_options=True,
            hide_results_until_closes=True,
            members_only=True,
            country_codes=["US", "DE"],
            explanation_media=InputMediaPhoto("explanation_photo"),
            description="Rules",
            description_parse_mode="MarkdownV2",
            description_entities=[entity],
            media={"type": "video", "media": "poll_video"},
        )
        payload = sent_payload(seen[0])
        assert payload["question_parse_mode"] == "HTML"
        assert payload["question_entities"] == [{"type": "italic", "offset": 2, "length": 3}]
        assert payload["allows_revoting"] is True
        assert payload["shuffle_options"] is True
        assert payload["allow_adding_options"] is True
        assert payload["hide_results_until_closes"] is True
        assert payload["members_only"] is True
        assert payload["country_codes"] == ["US", "DE"]
        assert payload["explanation_media"] == {
            "type": "photo",
            "media": "explanation_photo",
        }
        assert payload["description"] == "Rules"
        assert payload["description_parse_mode"] == "MarkdownV2"
        assert payload["description_entities"] == [{"type": "italic", "offset": 2, "length": 3}]
        assert payload["media"] == {"type": "video", "media": "poll_video"}


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

    async def test_send_photo_serializes_media_kwargs(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(text=None)), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_photo(
            123,
            "photo_file_id",
            message_thread_id=7,
            caption_entities=[MessageEntity(type="italic", offset=0, length=2)],
            show_caption_above_media=True,
            has_spoiler=True,
        )
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "photo": "photo_file_id",
            "message_thread_id": 7,
            "caption_entities": [{"type": "italic", "offset": 0, "length": 2}],
            "show_caption_above_media": True,
            "has_spoiler": True,
        }

    async def test_send_photo_omits_unset_media_kwargs(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(text=None)), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_photo(123, "photo_file_id")
        payload = sent_payload(seen[0])
        assert payload == {"chat_id": 123, "photo": "photo_file_id"}
        for key in (
            "message_thread_id",
            "caption_entities",
            "show_caption_above_media",
            "has_spoiler",
        ):
            assert key not in payload

    async def test_send_document_serializes_file_kwargs(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(text=None)), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_document(
            123,
            "doc_file_id",
            message_thread_id=7,
            thumbnail="thumb_file_id",
            caption_entities=[MessageEntity(type="italic", offset=0, length=2)],
            disable_content_type_detection=True,
        )
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "document": "doc_file_id",
            "message_thread_id": 7,
            "thumbnail": "thumb_file_id",
            "caption_entities": [{"type": "italic", "offset": 0, "length": 2}],
            "disable_content_type_detection": True,
        }

    async def test_send_document_omits_unset_file_kwargs(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(text=None)), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_document(123, "doc_file_id")
        payload = sent_payload(seen[0])
        assert payload == {"chat_id": 123, "document": "doc_file_id"}
        for key in (
            "message_thread_id",
            "thumbnail",
            "caption_entities",
            "disable_content_type_detection",
        ):
            assert key not in payload
