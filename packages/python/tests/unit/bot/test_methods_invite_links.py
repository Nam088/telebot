"""Unit tests for the invite link Bot method group (T051; parity with invite_links.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import ChatInviteLink
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestCreateChatInviteLink:
    async def test_creates_link_with_limits(
        self, bot_transport: Any, ok_response: Any, make_user: Any
    ) -> None:
        seen: list[httpx.Request] = []
        result = {
            "invite_link": "https://t.me/join/vip",
            "creator": make_user(),
            "creates_join_request": True,
            "is_primary": False,
            "is_revoked": False,
            "name": "VIP",
            "member_limit": 10,
        }
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        link = await bot.create_chat_invite_link(
            1, name="VIP", member_limit=10, creates_join_request=True
        )
        assert isinstance(link, ChatInviteLink)
        assert link.invite_link == "https://t.me/join/vip"
        assert link.member_limit == 10
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/createChatInviteLink"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "name": "VIP",
            "member_limit": 10,
            "creates_join_request": True,
        }

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(403, 403, "Forbidden: bot is not an administrator"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.create_chat_invite_link(1)
        assert excinfo.value.error_code == 403


class TestEditChatInviteLink:
    async def test_edits_link_member_limit(
        self, bot_transport: Any, ok_response: Any, make_user: Any
    ) -> None:
        seen: list[httpx.Request] = []
        result = {
            "invite_link": "https://t.me/join/old",
            "creator": make_user(),
            "creates_join_request": False,
            "is_primary": False,
            "is_revoked": False,
            "member_limit": 20,
        }
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        link = await bot.edit_chat_invite_link("@channel", "https://t.me/join/old", member_limit=20)
        assert link.member_limit == 20
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editChatInviteLink"
        assert sent_payload(seen[0]) == {
            "chat_id": "@channel",
            "invite_link": "https://t.me/join/old",
            "member_limit": 20,
        }


class TestRevokeChatInviteLink:
    async def test_revokes_link(self, bot_transport: Any, ok_response: Any, make_user: Any) -> None:
        seen: list[httpx.Request] = []
        result = {
            "invite_link": "https://t.me/join/old",
            "creator": make_user(),
            "creates_join_request": False,
            "is_primary": True,
            "is_revoked": True,
        }
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        link = await bot.revoke_chat_invite_link(1, "https://t.me/join/old")
        assert link.is_revoked is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/revokeChatInviteLink"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "invite_link": "https://t.me/join/old",
        }
