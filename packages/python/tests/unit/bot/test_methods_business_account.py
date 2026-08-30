"""Unit tests for the business-account Bot method group.

Ported from node ``client/methods/business/stories-boosts.ts`` (getBusinessConnection,
readBusinessMessage, deleteBusinessMessages) and
``client/methods/business/gifts.ts`` (the ``*BusinessAccount*`` methods).
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import AcceptedGiftTypes, BusinessConnection, StarAmount
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

RAW_CONNECTION = {
    "id": "bc1",
    "user": {"id": 7, "is_bot": False, "first_name": "Ada"},
    "user_chat_id": 42,
    "date": 1_700_000_000,
    "can_reply": True,
    "is_enabled": True,
}


class TestGetBusinessConnection:
    async def test_returns_typed_connection(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_CONNECTION), seen)
        bot = make_bot(bot_transport, step)
        connection = await bot.get_business_connection("bc1")
        assert isinstance(connection, BusinessConnection)
        assert connection.id == "bc1"
        assert connection.user.first_name == "Ada"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getBusinessConnection"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1"}

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: connection not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.get_business_connection("missing")
        assert excinfo.value.error_code == 400


class TestReadBusinessMessage:
    async def test_marks_message_read(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.read_business_message("bc1", 100) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/readBusinessMessage"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1", "message_id": 100}


class TestDeleteBusinessMessages:
    async def test_deletes_message_id_list(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_business_messages("bc1", [100, 101]) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteBusinessMessages"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "message_ids": [100, 101],
        }

    async def test_sends_empty_list_as_is(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_business_messages("bc1", []) is True
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1", "message_ids": []}


class TestGetBusinessAccountStarBalance:
    async def test_returns_typed_star_amount(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"amount": 50, "nanostar_amount": 5}), seen)
        bot = make_bot(bot_transport, step)
        balance = await bot.get_business_account_star_balance("bc1")
        assert isinstance(balance, StarAmount)
        assert balance.amount == 50
        assert balance.nanostar_amount == 5
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getBusinessAccountStarBalance"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1"}

    async def test_omits_absent_nanostar_amount(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response({"amount": 12}), [])
        bot = make_bot(bot_transport, step)
        balance = await bot.get_business_account_star_balance("bc1")
        assert balance.amount == 12
        assert balance.nanostar_amount is None


class TestSetBusinessAccountName:
    async def test_sets_name(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_business_account_name("bc1", "Acme") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setBusinessAccountName"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1", "name": "Acme"}


class TestSetBusinessAccountUsername:
    async def test_sets_username(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_business_account_username("bc1", "acme") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setBusinessAccountUsername"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1", "username": "acme"}

    async def test_omits_unset_username_clears_it(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_business_account_username("bc1") is True
        payload = sent_payload(seen[0])
        assert payload == {"business_connection_id": "bc1"}
        assert "username" not in payload


class TestSetBusinessAccountBio:
    async def test_sets_bio(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_business_account_bio("bc1", "We build bots") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setBusinessAccountBio"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1", "bio": "We build bots"}

    async def test_omits_unset_bio(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_business_account_bio("bc1") is True
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1"}


class TestSetBusinessAccountGiftSettings:
    async def test_serializes_accepted_gift_types(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        accepted = AcceptedGiftTypes(
            unlimited_gifts=True,
            limited_gifts=False,
            unique_gifts=True,
            premium_subscription=False,
            gifts_from_channels=True,
        )
        assert (
            await bot.set_business_account_gift_settings(
                "bc1", show_gift_button=True, accepted_gift_types=accepted
            )
            is True
        )
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setBusinessAccountGiftSettings"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "show_gift_button": True,
            "accepted_gift_types": {
                "unlimited_gifts": True,
                "limited_gifts": False,
                "unique_gifts": True,
                "premium_subscription": False,
                "gifts_from_channels": True,
            },
        }

    async def test_accepts_plain_dict_accepted_gift_types(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        settings = {"unlimited_gifts": False, "limited_gifts": False, "unique_gifts": False}
        assert (
            await bot.set_business_account_gift_settings(
                "bc1", show_gift_button=False, accepted_gift_types=settings
            )
            is True
        )
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "show_gift_button": False,
            "accepted_gift_types": settings,
        }

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(403, 403, "Forbidden: not connected"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.set_business_account_gift_settings(
                "bc1", show_gift_button=True, accepted_gift_types={}
            )


class TestSetBusinessAccountProfilePhoto:
    async def test_serializes_input_profile_photo(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        photo = {"type": "photo", "photo": "file-id-1"}
        assert await bot.set_business_account_profile_photo("bc1", photo) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setBusinessAccountProfilePhoto"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1", "photo": photo}


class TestRemoveBusinessAccountProfilePhoto:
    async def test_removes_photo(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.remove_business_account_profile_photo("bc1") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/removeBusinessAccountProfilePhoto"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1"}


class TestTransferBusinessAccountStars:
    async def test_transfers_stars(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.transfer_business_account_stars("bc1", 50) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/transferBusinessAccountStars"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1", "star_count": 50}

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(422, 422, "Unprocessable: insufficient balance"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.transfer_business_account_stars("bc1", 10_000)
        assert excinfo.value.error_code == 422
