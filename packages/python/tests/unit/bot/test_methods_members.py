"""Unit tests for the chat member Bot method group (T051; parity with members.go)."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import ChatMember
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


class TestGetChatMember:
    async def test_returns_typed_member(
        self, bot_transport: Any, ok_response: Any, make_user: Any
    ) -> None:
        seen: list[httpx.Request] = []
        result = {"status": "administrator", "user": make_user(id=42, first_name="Alice")}
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        member = await bot.get_chat_member("@supergroup", 42)
        assert isinstance(member, ChatMember)
        assert member.status == "administrator"
        assert member.user.id == 42
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getChatMember"
        assert sent_payload(seen[0]) == {"chat_id": "@supergroup", "user_id": 42}


class TestPromoteChatMember:
    async def test_promotes_with_rights(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.promote_chat_member(
            -1001234567890, 42, can_delete_messages=True, can_invite_users=True
        )
        assert ok is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/promoteChatMember"
        assert sent_payload(seen[0]) == {
            "chat_id": -1001234567890,
            "user_id": 42,
            "can_delete_messages": True,
            "can_invite_users": True,
        }


class TestRestrictChatMember:
    async def test_restricts_with_permissions(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        ok = await bot.restrict_chat_member(
            -1001234567890,
            42,
            {"can_send_polls": True},
            use_independent_chat_permissions=True,
            until_date=1_700_000_000,
        )
        assert ok is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/restrictChatMember"
        assert sent_payload(seen[0]) == {
            "chat_id": -1001234567890,
            "user_id": 42,
            "permissions": {"can_send_polls": True},
            "use_independent_chat_permissions": True,
            "until_date": 1_700_000_000,
        }


class TestSetChatAdministratorCustomTitle:
    async def test_sets_custom_title(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_chat_administrator_custom_title("@supergroup", 42, "Moderator")
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setChatAdministratorCustomTitle"
        assert sent_payload(seen[0]) == {
            "chat_id": "@supergroup",
            "user_id": 42,
            "custom_title": "Moderator",
        }


class TestSenderChatBans:
    async def test_ban_chat_sender_chat(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.ban_chat_sender_chat(-1001234567890, -1009876543210)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/banChatSenderChat"
        assert sent_payload(seen[0]) == {
            "chat_id": -1001234567890,
            "sender_chat_id": -1009876543210,
        }

    async def test_unban_chat_sender_chat(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.unban_chat_sender_chat(-1001234567890, -1009876543210)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/unbanChatSenderChat"
        assert sent_payload(seen[0]) == {
            "chat_id": -1001234567890,
            "sender_chat_id": -1009876543210,
        }


class TestChatJoinRequests:
    async def test_approve_chat_join_request(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.approve_chat_join_request("@my_channel", 42)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/approveChatJoinRequest"
        assert sent_payload(seen[0]) == {"chat_id": "@my_channel", "user_id": 42}

    async def test_decline_chat_join_request(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.decline_chat_join_request("@my_channel", 42)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/declineChatJoinRequest"
        assert sent_payload(seen[0]) == {"chat_id": "@my_channel", "user_id": 42}


class TestMembersApiError:
    async def test_get_chat_member_error(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(
            error_response(403, 403, "Forbidden: bot is not a member of the chat"), []
        )
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.get_chat_member(1, 2)
        assert excinfo.value.error_code == 403

    async def test_promote_chat_member_error(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(
            error_response(403, 403, "Forbidden: bot is not a member of the chat"), []
        )
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.promote_chat_member(1, 2)
