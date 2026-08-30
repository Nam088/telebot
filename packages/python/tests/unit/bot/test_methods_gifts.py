"""Unit tests for the gifts, stars, and premium-gift Bot method group.

Ported from node ``client/methods/business/gifts.ts`` (giftPremiumSubscription,
getBusinessAccountGifts, convertGiftToStars, upgradeGift, transferGift,
getUserGifts, getChatGifts) and ``client/methods/payments.ts``
(getAvailableGifts, sendGift).
"""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import (
    Gift,
    Gifts,
    MessageEntity,
    OwnedGiftRegular,
    OwnedGifts,
    OwnedGiftUnique,
    TypeParseError,
    UniqueGift,
)
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

RAW_STICKER = {
    "file_id": "st1",
    "file_unique_id": "stu1",
    "type": "regular",
    "width": 100,
    "height": 100,
    "is_animated": False,
    "is_video": False,
}

RAW_GIFT = {
    "id": "gift1",
    "sticker": RAW_STICKER,
    "star_count": 50,
    "upgrade_star_count": 25,
    "total_count": 10,
    "remaining_count": 4,
}

RAW_UNIQUE_GIFT = {
    "gift_id": "gift1",
    "base_name": "Plush Pepcat",
    "name": "Jade",
    "number": 7,
    "model": {"name": "Bear", "sticker": RAW_STICKER, "rarity_per_mille": 50},
    "symbol": {"name": "Star", "sticker": RAW_STICKER, "rarity_per_mille": 25},
    "backdrop": {
        "name": "Aurora",
        "colors": {
            "center_color": 16711680,
            "edge_color": 65280,
            "symbol_color": 255,
            "text_color": 16777215,
        },
        "rarity_per_mille": 12,
    },
}

RAW_OWNED_GIFTS = {
    "total_count": 2,
    "gifts": [
        {
            "type": "regular",
            "gift": RAW_GIFT,
            "send_date": 1_700_000_000,
            "owned_gift_id": "own1",
            "can_be_upgraded": True,
        },
        {
            "type": "unique",
            "gift": RAW_UNIQUE_GIFT,
            "send_date": 1_700_000_001,
            "owned_gift_id": "own2",
            "can_be_transferred": True,
            "transfer_star_count": 5,
        },
    ],
    "next_offset": "2",
}


class TestGetAvailableGifts:
    async def test_returns_typed_gift_list(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"gifts": [RAW_GIFT]}), seen)
        bot = make_bot(bot_transport, step)
        gifts = await bot.get_available_gifts()
        assert isinstance(gifts, Gifts)
        assert len(gifts.gifts) == 1
        gift = gifts.gifts[0]
        assert isinstance(gift, Gift)
        assert gift.id == "gift1"
        assert gift.star_count == 50
        assert gift.upgrade_star_count == 25
        assert gift.sticker.file_id == "st1"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getAvailableGifts"
        assert sent_payload(seen[0]) == {}

    async def test_round_trips_nested_gifts(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response({"gifts": [RAW_GIFT]}), [])
        bot = make_bot(bot_transport, step)
        assert await bot.get_available_gifts() == Gifts.from_dict({"gifts": [RAW_GIFT]})

    async def test_rejects_non_object_result(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response(True), [])
        bot = make_bot(bot_transport, step)
        with pytest.raises(TypeParseError):
            await bot.get_available_gifts()


class TestSendGift:
    async def test_sends_gift_with_text_and_upgrade(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        entity = MessageEntity(type="bold", offset=0, length=5)
        assert (
            await bot.send_gift(
                123,
                "gift1",
                text="Enjoy it",
                text_parse_mode="Markdown",
                text_entities=[entity],
                pay_for_upgrade=True,
            )
            is True
        )
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendGift"
        assert sent_payload(seen[0]) == {
            "user_id": 123,
            "gift_id": "gift1",
            "text": "Enjoy it",
            "text_parse_mode": "Markdown",
            "text_entities": [{"type": "bold", "offset": 0, "length": 5}],
            "pay_for_upgrade": True,
        }

    async def test_omits_unset_optional_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.send_gift(123, "gift1") is True
        payload = sent_payload(seen[0])
        assert payload == {"user_id": 123, "gift_id": "gift1"}
        assert "text" not in payload
        assert "pay_for_upgrade" not in payload
        assert "text_entities" not in payload


class TestGiftPremiumSubscription:
    async def test_gifts_three_month_subscription(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.gift_premium_subscription(123, 3, 1000) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/giftPremiumSubscription"
        assert sent_payload(seen[0]) == {"user_id": 123, "month_count": 3, "star_count": 1000}

    async def test_serializes_optional_text_entities(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert (
            await bot.gift_premium_subscription(
                123, 6, 1500, text="Happy birthday", text_parse_mode="HTML"
            )
            is True
        )
        assert sent_payload(seen[0]) == {
            "user_id": 123,
            "month_count": 6,
            "star_count": 1500,
            "text": "Happy birthday",
            "text_parse_mode": "HTML",
        }


class TestConvertGiftToStars:
    async def test_converts_gift(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.convert_gift_to_stars(123, "own1") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/convertGiftToStars"
        assert sent_payload(seen[0]) == {"user_id": 123, "owned_gift_id": "own1"}


class TestUpgradeGift:
    async def test_upgrades_gift(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.upgrade_gift(123, "own1") is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/upgradeGift"
        assert sent_payload(seen[0]) == {"user_id": 123, "owned_gift_id": "own1"}

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: gift not upgradable"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.upgrade_gift(123, "own1")
        assert excinfo.value.error_code == 400


class TestTransferGift:
    async def test_transfers_gift_to_channel(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.transfer_gift(123, "own1", -1001234567890) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/transferGift"
        assert sent_payload(seen[0]) == {
            "user_id": 123,
            "owned_gift_id": "own1",
            "new_owner_chat_id": -1001234567890,
        }


class TestGetBusinessAccountGifts:
    async def test_returns_typed_owned_gifts(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_OWNED_GIFTS), seen)
        bot = make_bot(bot_transport, step)
        gifts = await bot.get_business_account_gifts("bc1")
        assert isinstance(gifts, OwnedGifts)
        assert gifts.total_count == 2
        assert gifts.next_offset == "2"
        assert isinstance(gifts.gifts[0], OwnedGiftRegular)
        assert isinstance(gifts.gifts[1], OwnedGiftUnique)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getBusinessAccountGifts"
        assert sent_payload(seen[0]) == {"business_connection_id": "bc1"}

    async def test_sends_optional_filters(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_OWNED_GIFTS), seen)
        bot = make_bot(bot_transport, step)
        await bot.get_business_account_gifts(
            "bc1", exclude_saved=True, sort_by_price=True, offset="10", limit=5
        )
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "exclude_saved": True,
            "sort_by_price": True,
            "offset": "10",
            "limit": 5,
        }

    async def test_round_trips_nested_gifts(self, bot_transport: Any, ok_response: Any) -> None:
        step = record_into(ok_response(RAW_OWNED_GIFTS), [])
        bot = make_bot(bot_transport, step)
        parsed = await bot.get_business_account_gifts("bc1")
        assert parsed.to_dict() == RAW_OWNED_GIFTS
        unique = parsed.gifts[1]
        assert isinstance(unique, OwnedGiftUnique)
        assert isinstance(unique.gift, UniqueGift)
        assert unique.gift.backdrop.colors.text_color == 16777215


class TestGetUserGifts:
    async def test_returns_typed_owned_gifts(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_OWNED_GIFTS), seen)
        bot = make_bot(bot_transport, step)
        gifts = await bot.get_user_gifts(123, exclude_unique=True, limit=2)
        regular = gifts.gifts[0]
        assert isinstance(regular, OwnedGiftRegular)
        assert regular.gift.id == "gift1"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getUserGifts"
        assert sent_payload(seen[0]) == {"user_id": 123, "exclude_unique": True, "limit": 2}

    async def test_omits_unset_filters(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_OWNED_GIFTS), seen)
        bot = make_bot(bot_transport, step)
        await bot.get_user_gifts(123)
        assert sent_payload(seen[0]) == {"user_id": 123}


class TestGetChatGifts:
    async def test_returns_typed_owned_gifts(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_OWNED_GIFTS), seen)
        bot = make_bot(bot_transport, step)
        gifts = await bot.get_chat_gifts(-1001234567890, offset="2")
        assert isinstance(gifts, OwnedGifts)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getChatGifts"
        assert sent_payload(seen[0]) == {"chat_id": -1001234567890, "offset": "2"}

    async def test_accepts_channel_username(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(RAW_OWNED_GIFTS), seen)
        bot = make_bot(bot_transport, step)
        await bot.get_chat_gifts("@my_channel")
        assert sent_payload(seen[0]) == {"chat_id": "@my_channel"}

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: chat not found"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.get_chat_gifts(1)
