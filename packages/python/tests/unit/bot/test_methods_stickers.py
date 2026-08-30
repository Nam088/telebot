"""Unit tests for the sticker Bot method group (T051; parity with stickers.go)."""

from __future__ import annotations

from typing import Any

import httpx

from telebot_py.types import File, Message, Sticker, StickerSet
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

INPUT_STICKER = {"sticker": "sticker-file-id", "format": "static", "emoji_list": ["😀"]}


class TestSendSticker:
    async def test_sends_sticker_with_emoji(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=10, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_sticker(1, "sticker-file-id", emoji="😀")
        assert isinstance(message, Message)
        assert message.message_id == 10
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendSticker"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "sticker": "sticker-file-id",
            "emoji": "😀",
        }


class TestGetStickerSet:
    async def test_returns_typed_sticker_set(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = {
            "name": "TestSet",
            "title": "Test Set",
            "sticker_type": "regular",
            "stickers": [
                {
                    "file_id": "s1",
                    "file_unique_id": "u1",
                    "type": "regular",
                    "width": 512,
                    "height": 512,
                    "is_animated": False,
                    "is_video": False,
                },
            ],
        }
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        sticker_set = await bot.get_sticker_set("TestSet")
        assert isinstance(sticker_set, StickerSet)
        assert sticker_set.name == "TestSet"
        assert len(sticker_set.stickers) == 1
        assert isinstance(sticker_set.stickers[0], Sticker)
        assert sticker_set.stickers[0].file_id == "s1"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getStickerSet"
        assert sent_payload(seen[0]) == {"name": "TestSet"}


class TestGetCustomEmojiStickers:
    async def test_returns_sticker_list(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response(
                [
                    {
                        "file_id": "s1",
                        "file_unique_id": "u1",
                        "type": "custom_emoji",
                        "width": 100,
                        "height": 100,
                        "is_animated": False,
                        "is_video": False,
                        "custom_emoji_id": "5368324170671202286",
                    },
                ]
            ),
            seen,
        )
        bot = make_bot(bot_transport, step)
        stickers = await bot.get_custom_emoji_stickers(["5368324170671202286"])
        assert len(stickers) == 1
        assert stickers[0].custom_emoji_id == "5368324170671202286"
        assert sent_payload(seen[0]) == {"custom_emoji_ids": ["5368324170671202286"]}


class TestUploadStickerFile:
    async def test_returns_file(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response(
                {
                    "file_id": "uploaded-file-id",
                    "file_unique_id": "u",
                    "file_path": "stickers/sticker.png",
                },
            ),
            seen,
        )
        bot = make_bot(bot_transport, step)
        file = await bot.upload_sticker_file(1, "attach://sticker.png", "static")
        assert isinstance(file, File)
        assert file.file_id == "uploaded-file-id"
        assert sent_payload(seen[0]) == {
            "user_id": 1,
            "sticker": "attach://sticker.png",
            "sticker_format": "static",
        }


class TestStickerSetManagement:
    async def test_create_new_sticker_set(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.create_new_sticker_set(1, "TestSet_by_bot", "Test Set", [INPUT_STICKER])
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/createNewStickerSet"
        assert sent_payload(seen[0]) == {
            "user_id": 1,
            "name": "TestSet_by_bot",
            "title": "Test Set",
            "stickers": [INPUT_STICKER],
        }

    async def test_add_sticker_to_set(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.add_sticker_to_set(1, "TestSet_by_bot", INPUT_STICKER)
        assert sent_payload(seen[0]) == {
            "user_id": 1,
            "name": "TestSet_by_bot",
            "sticker": INPUT_STICKER,
        }

    async def test_set_sticker_position_in_set(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_sticker_position_in_set("s1", 2)
        assert sent_payload(seen[0]) == {"sticker": "s1", "position": 2}

    async def test_delete_sticker_from_set(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_sticker_from_set("s1")
        assert sent_payload(seen[0]) == {"sticker": "s1"}

    async def test_replace_sticker_in_set(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        new_sticker = {"sticker": "new-file-id", "format": "static", "emoji_list": ["😀"]}
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.replace_sticker_in_set(1, "TestSet_by_bot", "old-file-id", new_sticker)
        assert sent_payload(seen[0]) == {
            "user_id": 1,
            "name": "TestSet_by_bot",
            "old_sticker": "old-file-id",
            "sticker": new_sticker,
        }

    async def test_set_sticker_emoji_list(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_sticker_emoji_list("s1", ["😀", "😁"])
        assert sent_payload(seen[0]) == {"sticker": "s1", "emoji_list": ["😀", "😁"]}

    async def test_set_sticker_keywords(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_sticker_keywords("s1", ["hello", "wave"])
        assert sent_payload(seen[0]) == {"sticker": "s1", "keywords": ["hello", "wave"]}

        assert await bot.set_sticker_keywords("s1", []) is True
        assert sent_payload(seen[1]) == {"sticker": "s1", "keywords": []}

        assert await bot.set_sticker_keywords("s1") is True
        assert sent_payload(seen[2]) == {"sticker": "s1"}

    async def test_set_sticker_mask_position(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        mask = {"point": "eyes", "x_shift": 0.1, "y_shift": 0.2, "scale": 1.5}
        assert await bot.set_sticker_mask_position("s1", mask)
        assert sent_payload(seen[0]) == {"sticker": "s1", "mask_position": mask}

        assert await bot.set_sticker_mask_position("s1") is True
        assert sent_payload(seen[1]) == {"sticker": "s1"}

    async def test_delete_sticker_set(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_sticker_set("TestSet_by_bot")
        assert sent_payload(seen[0]) == {"name": "TestSet_by_bot"}

    async def test_set_custom_emoji_sticker_set_thumbnail(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_custom_emoji_sticker_set_thumbnail("TestSet_by_bot", "emoji-1")
        assert sent_payload(seen[0]) == {
            "name": "TestSet_by_bot",
            "custom_emoji_id": "emoji-1",
        }

    async def test_set_custom_emoji_thumbnail_omits_empty_id(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_custom_emoji_sticker_set_thumbnail("TestSet_by_bot")
        assert sent_payload(seen[0]) == {"name": "TestSet_by_bot"}

    async def test_set_sticker_set_thumbnail(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_sticker_set_thumbnail(
            "TestSet_by_bot", 1, "static", thumbnail="thumb-file-id"
        )
        assert sent_payload(seen[0]) == {
            "name": "TestSet_by_bot",
            "user_id": 1,
            "format": "static",
            "thumbnail": "thumb-file-id",
        }

    async def test_set_sticker_set_title(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_sticker_set_title("TestSet_by_bot", "New Title")
        assert sent_payload(seen[0]) == {"name": "TestSet_by_bot", "title": "New Title"}

    async def test_get_forum_topic_icon_stickers(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response(
                [
                    {
                        "file_id": "icon-1",
                        "file_unique_id": "u",
                        "type": "regular",
                        "width": 512,
                        "height": 512,
                        "is_animated": False,
                        "is_video": False,
                    }
                ]
            ),
            seen,
        )
        bot = make_bot(bot_transport, step)
        stickers = await bot.get_forum_topic_icon_stickers()
        assert len(stickers) == 1
        assert stickers[0].file_id == "icon-1"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getForumTopicIconStickers"
        assert sent_payload(seen[0]) == {}
