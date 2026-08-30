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
from telebot_py.types import AcceptedGiftTypes, BusinessBotRights, BusinessConnection, StarAmount
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

RAW_CONNECTION = {
    "id": "bc1",
    "user": {"id": 7, "is_bot": False, "first_name": "Ada"},
    "user_chat_id": 42,
    "date": 1_700_000_000,
    "rights": {
        "can_reply": True,
        "can_read_messages": True,
        "can_transfer_and_upgrade_gifts": True,
    },
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
        assert isinstance(connection.rights, BusinessBotRights)
        assert connection.rights is not None
        assert connection.rights.can_reply is True
        assert connection.rights.can_read_messages is True
        assert connection.rights.can_edit_bio is None
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getBusinessConnection"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1"}
        assert connection.to_dict() == RAW_CONNECTION

    async def test_omitted_rights_parse_as_none(self, bot_transport: Any, ok_response: Any) -> None:
        raw = {key: value for key, value in RAW_CONNECTION.items() if key != "rights"}
        step = record_into(ok_response(raw), [])
        bot = make_bot(bot_transport, step)
        connection = await bot.get_business_connection("bc1")
        assert connection.rights is None

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
        assert await bot.read_business_message("bc1", 42, 100) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/readBusinessMessage"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "chat_id": 42,
            "message_id": 100,
        }

    async def test_chat_id_is_required(self, bot_transport: Any, ok_response: Any) -> None:
        bot = make_bot(bot_transport, record_into(ok_response(True), []))
        with pytest.raises(TypeError):
            await bot.read_business_message("bc1")  # type: ignore[call-arg]


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
    async def test_sets_first_and_last_name(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_business_account_name("bc1", "Acme", last_name="Parts") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/setBusinessAccountName"
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "first_name": "Acme",
            "last_name": "Parts",
        }

    async def test_omits_unset_last_name(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_business_account_name("bc1", "Acme") is True
        payload = sent_payload(seen[0])
        assert payload == {"business_connection_id": "bc1", "first_name": "Acme"}
        assert "last_name" not in payload
        assert "name" not in payload


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

    async def test_sends_optional_is_public(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        photo = {"type": "photo", "photo": "file-id-1"}
        assert await bot.set_business_account_profile_photo("bc1", photo, is_public=True) is True
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "photo": photo,
            "is_public": True,
        }

    async def test_omits_unset_is_public(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        await bot.set_business_account_profile_photo("bc1", {"type": "photo", "photo": "f"})
        assert "is_public" not in sent_payload(seen[0])


class TestRemoveBusinessAccountProfilePhoto:
    async def test_removes_photo(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.remove_business_account_profile_photo("bc1") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/removeBusinessAccountProfilePhoto"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1"}

    async def test_sends_optional_is_public(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.remove_business_account_profile_photo("bc1", is_public=True) is True
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "is_public": True,
        }


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
