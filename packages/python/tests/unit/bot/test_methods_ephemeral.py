"""Unit tests for the ephemeral-message Bot method group.

Ported from node ``client/methods/business/ephemeral.ts``
(editEphemeralMessageText/Caption/Media/ReplyMarkup, deleteEphemeralMessage).
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import Message
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

RAW_MESSAGE = {
    "message_id": 5,
    "date": 1_700_000_000,
    "chat": {"id": 100, "type": "private"},
    "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
    "text": "edited",
}


class TestEditEphemeralMessageText:
    async def test_edits_text_and_returns_message(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_MESSAGE), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.edit_ephemeral_message_text(
            100,
            42,
            7,
            text="edited",
            parse_mode="HTML",
            entities=[{"type": "bold", "offset": 0, "length": 6}],
            reply_markup={"inline_keyboard": [[{"text": "Open", "url": "https://t.me"}]]},
        )
        assert isinstance(message, Message)
        assert message.message_id == 5
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editEphemeralMessageText"
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "text": "edited",
            "parse_mode": "HTML",
            "entities": [{"type": "bold", "offset": 0, "length": 6}],
            "reply_markup": {"inline_keyboard": [[{"text": "Open", "url": "https://t.me"}]]},
        }

    async def test_sends_only_required_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_MESSAGE), seen)
        bot = make_bot(bot_transport, step)
        await bot.edit_ephemeral_message_text("@channel", 42, 7, text="hi")
        assert sent_payload(seen[0]) == {
            "chat_id": "@channel",
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "text": "hi",
        }

    async def test_accepts_true_for_unmodified_result(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        step = record_into(ok_response(True), [])
        bot = make_bot(bot_transport, step)
        assert await bot.edit_ephemeral_message_text(100, 42, 7, text="hi") is True


class TestEditEphemeralMessageCaption:
    async def test_edits_caption_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_MESSAGE), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.edit_ephemeral_message_caption(
            100,
            42,
            7,
            caption="new caption",
            parse_mode="MarkdownV2",
            caption_entities=[{"type": "italic", "offset": 0, "length": 3}],
            show_caption_above_media=True,
        )
        assert isinstance(message, Message)
        assert message.message_id == 5
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editEphemeralMessageCaption"
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "caption": "new caption",
            "parse_mode": "MarkdownV2",
            "caption_entities": [{"type": "italic", "offset": 0, "length": 3}],
            "show_caption_above_media": True,
        }

    async def test_omits_unset_caption_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_MESSAGE), seen)
        bot = make_bot(bot_transport, step)
        await bot.edit_ephemeral_message_caption(100, 42, 7)
        payload = sent_payload(seen[0])
        assert payload == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
        }
        assert "caption" not in payload
        assert "show_caption_above_media" not in payload


class TestEditEphemeralMessageMedia:
    async def test_serializes_media_object(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_MESSAGE), seen)
        bot = make_bot(bot_transport, step)
        media = {"type": "photo", "media": "file-id-1"}
        message = await bot.edit_ephemeral_message_media(100, 42, 7, media)
        assert isinstance(message, Message)
        assert message.message_id == 5
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editEphemeralMessageMedia"
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "media": media,
        }

    async def test_includes_reply_markup(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_MESSAGE), seen)
        bot = make_bot(bot_transport, step)
        markup = {"inline_keyboard": [[{"text": "Go", "url": "https://t.me"}]]}
        await bot.edit_ephemeral_message_media(100, 42, 7, {"type": "photo"}, reply_markup=markup)
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "media": {"type": "photo"},
            "reply_markup": markup,
        }

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: message not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.edit_ephemeral_message_media(100, 42, 7, {"type": "photo"})
        assert excinfo.value.error_code == 400


class TestEditEphemeralMessageReplyMarkup:
    async def test_replaces_markup(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_MESSAGE), seen)
        bot = make_bot(bot_transport, step)
        markup = {"inline_keyboard": [[{"text": "Go", "url": "https://t.me"}]]}
        await bot.edit_ephemeral_message_reply_markup(100, 42, 7, reply_markup=markup)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editEphemeralMessageReplyMarkup"
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "reply_markup": markup,
        }

    async def test_omits_unset_markup_to_remove_it(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_MESSAGE), seen)
        bot = make_bot(bot_transport, step)
        await bot.edit_ephemeral_message_reply_markup(100, 42, 7)
        payload = sent_payload(seen[0])
        assert payload == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
        }
        assert "reply_markup" not in payload


class TestDeleteEphemeralMessage:
    async def test_deletes_message(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_ephemeral_message(100, 42, 7) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteEphemeralMessage"
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
        }

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(403, 403, "Forbidden: not the recipient"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.delete_ephemeral_message(100, 42, 7)
        assert excinfo.value.error_code == 403
