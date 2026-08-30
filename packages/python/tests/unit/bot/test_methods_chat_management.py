"""Unit tests for the chat management Bot method group (T051; parity with chat_management.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import (
    ChatAdministratorRights,
    MenuButtonDefault,
    MenuButtonWebApp,
)
from telebot_py.types.base import TypeParseError
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestChatTitleAndDescription:
    async def test_set_chat_title(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_chat_title(1, "New Title") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setChatTitle"
        assert sent_payload(seen[0]) == {"chat_id": 1, "title": "New Title"}

    async def test_set_chat_description(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_chat_description("@channel", "desc") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setChatDescription"
        assert sent_payload(seen[0]) == {"chat_id": "@channel", "description": "desc"}

        assert await bot.set_chat_description("@channel") is True
        assert sent_payload(seen[1]) == {"chat_id": "@channel"}

        assert await bot.set_chat_description("@channel", "") is True
        assert sent_payload(seen[2]) == {"chat_id": "@channel", "description": ""}


class TestChatPhoto:
    async def test_set_chat_photo(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_chat_photo(1, "photo_id") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setChatPhoto"
        assert sent_payload(seen[0]) == {"chat_id": 1, "photo": "photo_id"}

    async def test_delete_chat_photo(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_chat_photo(1) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteChatPhoto"
        assert sent_payload(seen[0]) == {"chat_id": 1}


class TestPinnedMessages:
    async def test_pin_chat_message(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.pin_chat_message(1, 42, disable_notification=True) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/pinChatMessage"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "message_id": 42,
            "disable_notification": True,
        }

    async def test_unpin_chat_message(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.unpin_chat_message(1, 42) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/unpinChatMessage"
        assert sent_payload(seen[0]) == {"chat_id": 1, "message_id": 42}

    async def test_unpin_all_chat_messages(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.unpin_all_chat_messages(1) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/unpinAllChatMessages"
        assert sent_payload(seen[0]) == {"chat_id": 1}


class TestSetChatPermissions:
    async def test_sets_permissions(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_chat_permissions(
            1, {"can_send_messages": True}, use_independent_chat_permissions=True
        )
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setChatPermissions"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "permissions": {"can_send_messages": True},
            "use_independent_chat_permissions": True,
        }


class TestExportChatInviteLink:
    async def test_returns_link_string(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response("https://t.me/join/test"), seen)
        bot = make_bot(bot_transport, step)
        link = await bot.export_chat_invite_link(1)
        assert link == "https://t.me/join/test"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/exportChatInviteLink"
        assert sent_payload(seen[0]) == {"chat_id": 1}


class TestChatMenuButton:
    async def test_set_chat_menu_button(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_chat_menu_button(1, {"type": "commands"}) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setChatMenuButton"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "menu_button": {"type": "commands"},
        }

    async def test_get_chat_menu_button_web_app(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = {
            "type": "web_app",
            "text": "Open",
            "web_app": {"url": "https://example.com"},
        }
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        button = await bot.get_chat_menu_button(1)
        assert isinstance(button, MenuButtonWebApp)
        assert button.text == "Open"
        assert button.web_app.url == "https://example.com"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getChatMenuButton"
        assert sent_payload(seen[0]) == {"chat_id": 1}

    async def test_get_chat_menu_button_default(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"type": "default"}), seen)
        bot = make_bot(bot_transport, step)
        button = await bot.get_chat_menu_button()
        assert isinstance(button, MenuButtonDefault)
        assert sent_payload(seen[0]) == {}

    async def test_get_chat_menu_button_unsupported(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        step = record_into(ok_response({"type": "unknown"}), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeParseError):
            await bot.get_chat_menu_button()


class TestDefaultAdministratorRights:
    async def test_set_my_default_administrator_rights(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        rights = {"is_anonymous": False, "can_manage_chat": True}
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_my_default_administrator_rights(rights, for_channels=True)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setMyDefaultAdministratorRights"
        assert sent_payload(seen[0]) == {"rights": rights, "for_channels": True}

    async def test_get_my_default_administrator_rights(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        result = {"is_anonymous": False, "can_manage_chat": True}
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        rights = await bot.get_my_default_administrator_rights(for_channels=True)
        assert isinstance(rights, ChatAdministratorRights)
        assert rights.can_manage_chat is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getMyDefaultAdministratorRights"
        assert sent_payload(seen[0]) == {"for_channels": True}


class TestChatStickerSet:
    async def test_set_chat_sticker_set(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_chat_sticker_set(-100, "test_set_by_bot") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setChatStickerSet"
        assert sent_payload(seen[0]) == {"chat_id": -100, "sticker_set_name": "test_set_by_bot"}

    async def test_delete_chat_sticker_set(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_chat_sticker_set("@supergroup") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteChatStickerSet"
        assert sent_payload(seen[0]) == {"chat_id": "@supergroup"}


class TestChatManagementApiError:
    async def test_set_chat_title_error(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: chat not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.set_chat_title(1, "x")
        assert excinfo.value.error_code == 400

    async def test_set_chat_sticker_set_error(
        self, bot_transport: Any, error_response: Any
    ) -> None:
        step = record_into(error_response(400, 400, "Bad Request: sticker set not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.set_chat_sticker_set(1, "missing_set")
