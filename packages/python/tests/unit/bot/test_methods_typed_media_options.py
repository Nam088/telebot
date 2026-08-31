"""Bot-method wire tests for the typed InputMedia and LinkPreviewOptions params.

Asserts a typed ``InputMedia*`` / ``LinkPreviewOptions`` argument serializes to
the documented wire shape through MockTransport only — never real HTTP.
"""

from __future__ import annotations

from typing import Any

import httpx

from telebot_py.types import (
    InputMediaAnimation,
    InputMediaPhoto,
    InputMediaVideo,
    InputMediaVoiceNote,
    LinkPreviewOptions,
    Message,
    MessageEntity,
)
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestSendMediaGroupTypedInputMedia:
    async def test_typed_media_serializes_to_the_documented_shape(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response([make_message(message_id=1), make_message(message_id=2)]), seen
        )
        bot = make_bot(bot_transport, step)
        messages = await bot.send_media_group(
            123456,
            [
                InputMediaPhoto(media="photo_file_id", caption="one"),
                InputMediaVideo(
                    media="video_file_id",
                    thumbnail="thumb_file_id",
                    width=640,
                    height=360,
                    duration=42,
                    supports_streaming=True,
                    caption_entities=[MessageEntity(type="bold", offset=0, length=3)],
                ),
            ],
        )
        assert [message.message_id for message in messages] == [1, 2]
        assert all(isinstance(message, Message) for message in messages)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendMediaGroup"
        assert sent_payload(seen[0]) == {
            "chat_id": 123456,
            "media": [
                {"media": "photo_file_id", "type": "photo", "caption": "one"},
                {
                    "media": "video_file_id",
                    "type": "video",
                    "thumbnail": "thumb_file_id",
                    "caption_entities": [{"type": "bold", "offset": 0, "length": 3}],
                    "width": 640,
                    "height": 360,
                    "duration": 42,
                    "supports_streaming": True,
                },
            ],
        }

    async def test_dict_media_still_accepted(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response([make_message()]), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_media_group(123, [{"type": "photo", "media": "f1"}])
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "media": [{"type": "photo", "media": "f1"}],
        }

    async def test_voice_note_and_animation_variants(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response([make_message()]), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_media_group(
            123,
            [
                InputMediaVoiceNote(media="v1", duration=9),
                InputMediaAnimation(media="a1", has_spoiler=False),
            ],
        )
        assert sent_payload(seen[0])["media"] == [
            {"media": "v1", "type": "voice_note", "duration": 9},
            {"media": "a1", "type": "animation", "has_spoiler": False},
        ]


class TestSendMessageLinkPreviewOptions:
    async def test_typed_options_serialize(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_message(
            123456,
            "see https://example.com",
            link_preview_options=LinkPreviewOptions(
                url="https://example.com",
                is_disabled=False,
                prefer_small_media=True,
                show_above_text=True,
            ),
        )
        assert sent_payload(seen[0]) == {
            "chat_id": 123456,
            "text": "see https://example.com",
            "link_preview_options": {
                "url": "https://example.com",
                "is_disabled": False,
                "prefer_small_media": True,
                "show_above_text": True,
            },
        }

    async def test_empty_options_object_is_still_sent(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_message(123, "hi", link_preview_options=LinkPreviewOptions())
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "text": "hi",
            "link_preview_options": {},
        }

    async def test_mapping_options_still_accepted(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_message(123, "hi", link_preview_options={"is_disabled": True})
        assert sent_payload(seen[0])["link_preview_options"] == {"is_disabled": True}


class TestEditLinkPreviewOptions:
    async def test_edit_message_text_typed_options(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.edit_message_text(
            "new",
            chat_id=1,
            message_id=2,
            link_preview_options=LinkPreviewOptions(prefer_large_media=True),
        )
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editMessageText"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "message_id": 2,
            "text": "new",
            "link_preview_options": {"prefer_large_media": True},
        }

    async def test_edit_ephemeral_message_text_typed_options(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        await bot.edit_ephemeral_message_text(
            1,
            2,
            3,
            text="new",
            link_preview_options=LinkPreviewOptions(is_disabled=True),
        )
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editEphemeralMessageText"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "receiver_user_id": 2,
            "ephemeral_message_id": 3,
            "text": "new",
            "link_preview_options": {"is_disabled": True},
        }
