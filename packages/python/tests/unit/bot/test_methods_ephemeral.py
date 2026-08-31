"""Unit tests for the ephemeral-message Bot method group.

Ported from node ``client/methods/business/ephemeral.ts``
(editEphemeralMessageText/Caption/Media/ReplyMarkup, deleteEphemeralMessage).

The Bot API docs state that every ``editEphemeralMessage*`` method returns
``True`` on success — unlike the ``editMessage*`` family, they never return the
edited Message — so these tests assert a plain boolean result.
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestEditEphemeralMessageText:
    async def test_edits_text(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert (
            await bot.edit_ephemeral_message_text(
                100,
                42,
                7,
                text="edited",
                parse_mode="HTML",
                entities=[{"type": "bold", "offset": 0, "length": 6}],
                reply_markup={"inline_keyboard": [[{"text": "Open", "url": "https://t.me"}]]},
            )
            is True
        )
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
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.edit_ephemeral_message_text("@channel", 42, 7, text="hi") is True
        assert sent_payload(seen[0]) == {
            "chat_id": "@channel",
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "text": "hi",
        }

    async def test_serializes_rich_message(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        rich = {"content": [{"type": "paragraph", "text": [{"type": "text", "text": "hi"}]}]}
        assert await bot.edit_ephemeral_message_text(100, 42, 7, rich_message=rich) is True
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "rich_message": rich,
        }

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: message not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.edit_ephemeral_message_text(100, 42, 7, text="hi")
        assert excinfo.value.error_code == 400


class TestEditEphemeralMessageCaption:
    async def test_edits_caption_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert (
            await bot.edit_ephemeral_message_caption(
                100,
                42,
                7,
                caption="new caption",
                parse_mode="MarkdownV2",
                caption_entities=[{"type": "italic", "offset": 0, "length": 3}],
                show_caption_above_media=True,
            )
            is True
        )
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
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.edit_ephemeral_message_caption(100, 42, 7) is True
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
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        media = {"type": "photo", "media": "file-id-1"}
        assert await bot.edit_ephemeral_message_media(100, 42, 7, media) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editEphemeralMessageMedia"
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "media": media,
        }

    async def test_includes_reply_markup(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        markup = {"inline_keyboard": [[{"text": "Go", "url": "https://t.me"}]]}
        assert (
            await bot.edit_ephemeral_message_media(
                100, 42, 7, {"type": "photo"}, reply_markup=markup
            )
            is True
        )
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
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        markup = {"inline_keyboard": [[{"text": "Go", "url": "https://t.me"}]]}
        assert (
            await bot.edit_ephemeral_message_reply_markup(100, 42, 7, reply_markup=markup) is True
        )
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
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.edit_ephemeral_message_reply_markup(100, 42, 7) is True
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
