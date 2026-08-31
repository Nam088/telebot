"""Unit tests for the paid-media and live-photo Bot method group.

Ported from node ``client/methods/messages/send-media.ts`` (sendPaidMedia,
sendLivePhoto) and the duplicated declarations in ``messages/edit.ts``.
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import (
    InputPaidMediaPhoto,
    InputPaidMediaVideo,
    Message,
    PaidMediaInfo,
    PaidMediaPhoto,
    PaidMediaPreview,
    PaidMediaVideo,
    TypeParseError,
)
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestSendPaidMedia:
    async def test_sends_required_fields_only(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=11)), seen)
        bot = make_bot(bot_transport, step)
        media = [InputPaidMediaPhoto(type="photo", media="file-id-1")]
        message = await bot.send_paid_media(123, 50, media)
        assert isinstance(message, Message)
        assert message.message_id == 11
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendPaidMedia"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "star_count": 50,
            "media": [{"type": "photo", "media": "file-id-1"}],
        }

    async def test_serializes_video_items_and_options(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        video = InputPaidMediaVideo(
            type="video",
            media="attach://video",
            width=720,
            height=1280,
            duration=12,
            supports_streaming=True,
        )
        await bot.send_paid_media(
            "@channel",
            100,
            [video],
            payload="internal-payload",
            caption="Paid content",
            parse_mode="Markdown",
            show_caption_above_media=True,
            disable_notification=True,
            protect_content=True,
            allow_paid_broadcast=False,
            reply_parameters={"message_id": 4},
            reply_markup={"inline_keyboard": []},
            business_connection_id="bc1",
            message_thread_id=7,
        )
        assert sent_payload(seen[0]) == {
            "chat_id": "@channel",
            "star_count": 100,
            "media": [
                {
                    "type": "video",
                    "media": "attach://video",
                    "width": 720,
                    "height": 1280,
                    "duration": 12,
                    "supports_streaming": True,
                }
            ],
            "payload": "internal-payload",
            "caption": "Paid content",
            "parse_mode": "Markdown",
            "show_caption_above_media": True,
            "disable_notification": True,
            "protect_content": True,
            "allow_paid_broadcast": False,
            "reply_parameters": {"message_id": 4},
            "reply_markup": {"inline_keyboard": []},
            "business_connection_id": "bc1",
            "message_thread_id": 7,
        }

    async def test_omits_unset_optional_fields(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_paid_media(123, 50, [{"type": "photo", "media": "p1"}])
        payload = sent_payload(seen[0])
        assert set(payload) == {"chat_id", "star_count", "media"}

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: star_count too high"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.send_paid_media(123, 999999, [{"type": "photo", "media": "p1"}])


class TestSendLivePhoto:
    async def test_sends_live_photo_and_still(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=12)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_live_photo(123, "video-id", "photo-id")
        assert isinstance(message, Message)
        assert message.message_id == 12
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendLivePhoto"
        payload = sent_payload(seen[0])
        assert payload == {"chat_id": 123, "live_photo": "video-id", "photo": "photo-id"}
        assert "video" not in payload

    async def test_serializes_caption_entities_and_markup(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=12)), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_live_photo(
            123,
            "video-id",
            "photo-id",
            caption="Look",
            parse_mode="HTML",
            caption_entities=[{"type": "italic", "offset": 0, "length": 4}],
            show_caption_above_media=True,
            has_spoiler=False,
            message_effect_id="effect1",
            reply_markup={"inline_keyboard": []},
            business_connection_id="bc1",
            message_thread_id=3,
        )
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "live_photo": "video-id",
            "photo": "photo-id",
            "caption": "Look",
            "parse_mode": "HTML",
            "caption_entities": [{"type": "italic", "offset": 0, "length": 4}],
            "show_caption_above_media": True,
            "has_spoiler": False,
            "message_effect_id": "effect1",
            "reply_markup": {"inline_keyboard": []},
            "business_connection_id": "bc1",
            "message_thread_id": 3,
        }

    async def test_rejects_non_object_result(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response(True), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeParseError):
            await bot.send_live_photo(123, "video-id", "photo-id")


class TestPaidMediaTypes:
    def test_hydrates_paid_media_info(self) -> None:
        raw = {
            "star_count": 50,
            "paid_media": [
                {"type": "preview", "width": 100, "height": 200},
                {
                    "type": "photo",
                    "photo": [{"file_id": "f", "file_unique_id": "u", "width": 1, "height": 2}],
                },
                {
                    "type": "video",
                    "video": {
                        "file_id": "v",
                        "file_unique_id": "vu",
                        "width": 4,
                        "height": 5,
                        "duration": 6,
                    },
                },
            ],
        }
        info = PaidMediaInfo.from_dict(raw)
        assert info.star_count == 50
        assert isinstance(info.paid_media[0], PaidMediaPreview)
        assert isinstance(info.paid_media[1], PaidMediaPhoto)
        assert isinstance(info.paid_media[2], PaidMediaVideo)
        assert info.to_dict() == raw
