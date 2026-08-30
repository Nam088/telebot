"""Unit tests for the file Bot method group (T051; parity with files.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import File, PhotoSize, UserProfilePhotos
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestGetFile:
    async def test_returns_typed_file(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = {
            "file_id": "file_123",
            "file_unique_id": "unique_123",
            "file_size": 1024,
            "file_path": "path/file.txt",
        }
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        file = await bot.get_file("file_123")
        assert isinstance(file, File)
        assert file.file_id == "file_123"
        assert file.file_path == "path/file.txt"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getFile"
        assert sent_payload(seen[0]) == {"file_id": "file_123"}

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(404, 404, "Not Found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.get_file("missing")
        assert excinfo.value.error_code == 404


class TestGetUserProfilePhotos:
    async def test_returns_typed_photos(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = {
            "total_count": 1,
            "photos": [
                [
                    {
                        "file_id": "photo_1",
                        "file_unique_id": "uniq_1",
                        "width": 100,
                        "height": 100,
                    }
                ]
            ],
        }
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        photos = await bot.get_user_profile_photos(42, offset=1, limit=10)
        assert isinstance(photos, UserProfilePhotos)
        assert photos.total_count == 1
        assert len(photos.photos) == 1
        assert isinstance(photos.photos[0][0], PhotoSize)
        assert photos.photos[0][0].file_id == "photo_1"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getUserProfilePhotos"
        assert sent_payload(seen[0]) == {"user_id": 42, "offset": 1, "limit": 10}
