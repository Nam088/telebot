"""Unit tests for Telegram Bot API 10.4 methods and types."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from telebot_py.types import (
    AreaPosition,
    ChatShareThemeBackdrops,
    EphemeralMessageParameters,
    Message,
    MessageEntity,
    PaidMessagesWaived,
    RichTextTonAddress,
    SharedWidgetQuery,
    TonNft,
    TonNftAttribute,
    TonWalletCard,
    TonWalletCardSticker,
    TonWalletTransfer,
    UniqueGift,
    Update,
    Widget,
    WidgetQuery,
)
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path


def _ok(result: Any) -> httpx.Response:
    return httpx.Response(200, json={"ok": True, "result": result})


@pytest.mark.asyncio
async def test_send_widget(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    raw_msg = {
        "message_id": 101,
        "date": 1700000000,
        "chat": {"id": 123, "type": "private"},
        "widget": {"id": "w1", "html": "<div>hi</div>", "width": 320, "height": 240},
    }
    bot = make_bot(bot_transport, record_into(_ok(raw_msg), seen))
    msg = await bot.send_widget(
        123,
        "<div>hi</div>",
        width=320,
        height=240,
        allow_queries=True,
    )
    assert isinstance(msg, Message)
    assert isinstance(msg.widget, Widget)
    assert msg.widget.id == "w1"
    assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendWidget"
    assert sent_payload(seen[0]) == {
        "chat_id": 123,
        "html": "<div>hi</div>",
        "width": 320,
        "height": 240,
        "allow_queries": True,
    }


@pytest.mark.asyncio
async def test_send_shared_widget(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    raw_msg = {"message_id": 102, "date": 1700000000, "chat": {"id": 123, "type": "private"}}
    bot = make_bot(bot_transport, record_into(_ok(raw_msg), seen))
    msg = await bot.send_shared_widget(123, "shared_1", chat_data='{"a":1}')
    assert msg.message_id == 102
    assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendSharedWidget"
    assert sent_payload(seen[0]) == {
        "chat_id": 123,
        "widget_id": "shared_1",
        "chat_data": '{"a":1}',
    }


@pytest.mark.asyncio
async def test_answer_widget_query(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    bot = make_bot(bot_transport, record_into(_ok(True), seen))
    ok = await bot.answer_widget_query("wq_1", data="ok")
    assert ok is True
    assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/answerWidgetQuery"
    assert sent_payload(seen[0]) == {"widget_query_id": "wq_1", "data": "ok"}


@pytest.mark.asyncio
async def test_edit_message_widget_data(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    bot = make_bot(bot_transport, record_into(_ok(True), seen))
    ok = await bot.edit_message_widget_data(chat_id=123, message_id=101, public_data='{"v":1}')
    assert ok is True
    assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editMessageWidgetData"
    assert sent_payload(seen[0]) == {"chat_id": 123, "message_id": 101, "public_data": '{"v":1}'}


@pytest.mark.asyncio
async def test_edit_shared_widget_data(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    bot = make_bot(bot_transport, record_into(_ok(True), seen))
    ok = await bot.edit_shared_widget_data("shared_1", '{"v":2}', cache_time=60)
    assert ok is True
    assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editSharedWidgetData"
    assert sent_payload(seen[0]) == {
        "widget_id": "shared_1",
        "public_data": '{"v":2}',
        "cache_time": 60,
    }


@pytest.mark.asyncio
async def test_get_chat_share_theme_backdrops(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    raw_res = {
        "backdrops": [
            {
                "id": 1,
                "name": "Emerald",
                "colors": {"center_color": 1, "edge_color": 2, "symbol_color": 3, "text_color": 4},
            }
        ]
    }
    bot = make_bot(bot_transport, record_into(_ok(raw_res), seen))
    res = await bot.get_chat_share_theme_backdrops()
    assert isinstance(res, ChatShareThemeBackdrops)
    assert len(res.backdrops) == 1
    assert res.backdrops[0].name == "Emerald"
    assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getChatShareThemeBackdrops"


@pytest.mark.asyncio
async def test_get_unique_gift(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    raw_gift = {
        "gift_id": "g1",
        "base_name": "Star",
        "name": "Star-1",
        "number": 1,
        "model": {
            "name": "M",
            "sticker": {
                "file_id": "f1",
                "file_unique_id": "u1",
                "type": "regular",
                "width": 100,
                "height": 100,
                "is_animated": False,
                "is_video": False,
            },
            "rarity_per_mille": 10,
        },
        "symbol": {
            "name": "S",
            "sticker": {
                "file_id": "f2",
                "file_unique_id": "u2",
                "type": "regular",
                "width": 100,
                "height": 100,
                "is_animated": False,
                "is_video": False,
            },
            "rarity_per_mille": 10,
        },
        "backdrop": {
            "name": "B",
            "colors": {"center_color": 1, "edge_color": 2, "symbol_color": 3, "text_color": 4},
            "rarity_per_mille": 10,
        },
    }
    bot = make_bot(bot_transport, record_into(_ok(raw_gift), seen))
    gift = await bot.get_unique_gift("Star-1")
    assert isinstance(gift, UniqueGift)
    assert gift.name == "Star-1"
    assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/getUniqueGift"
    assert sent_payload(seen[0]) == {"name": "Star-1"}


@pytest.mark.asyncio
async def test_delete_business_account_gift(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    bot = make_bot(bot_transport, record_into(_ok(True), seen))
    ok = await bot.delete_business_account_gift("bc_1", "og_1")
    assert ok is True
    assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/deleteBusinessAccountGift"
    assert sent_payload(seen[0]) == {"business_connection_id": "bc_1", "owned_gift_id": "og_1"}


@pytest.mark.asyncio
async def test_verify_user_and_chat_with_entities(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    bot = make_bot(bot_transport, record_into(_ok(True), seen), record_into(_ok(True), seen))
    entity = MessageEntity(type="bold", offset=0, length=8)
    ok1 = await bot.verify_user(
        42,
        "Verified",
        custom_description_parse_mode="HTML",
        custom_description_entities=[entity],
    )
    ok2 = await bot.verify_chat(
        -1001,
        "Official",
        custom_description_parse_mode="MarkdownV2",
        custom_description_entities=[entity],
    )
    assert ok1 is True and ok2 is True
    assert sent_payload(seen[0])["custom_description_parse_mode"] == "HTML"
    assert sent_payload(seen[1])["custom_description_parse_mode"] == "MarkdownV2"


@pytest.mark.asyncio
async def test_send_message_ephemeral_without_chat_id(bot_transport: Any) -> None:
    seen: list[httpx.Request] = []
    raw_msg = {"message_id": 1, "date": 1700000000, "chat": {"id": 1, "type": "private"}}
    bot = make_bot(bot_transport, record_into(_ok(raw_msg), seen))
    msg = await bot.send_message(
        None,
        "Ephemeral",
        ephemeral_message_parameters=EphemeralMessageParameters(callback_query_id="cq_1"),
    )
    assert msg.message_id == 1
    assert sent_payload(seen[0]) == {
        "text": "Ephemeral",
        "ephemeral_message_parameters": {"callback_query_id": "cq_1"},
    }


def test_api_10_4_types_smoke() -> None:
    pos = AreaPosition(
        x_percentage=10.0,
        y_percentage=20.0,
        width_percentage=30.0,
        height_percentage=40.0,
        rotation_angle=0.0,
        corner_radius_percentage=5.0,
    )
    nft = TonNft(
        address="EQ...",
        index="1",
        name="Gift",
        description="Desc",
        attributes=[TonNftAttribute(trait_type="Color", value="Gold")],
    )
    card = TonWalletCard(
        address="EQ...",
        amount="1000",
        stickers=[TonWalletCardSticker(position=pos, nft=nft)],
    )
    assert card.stickers[0].nft.name == "Gift"
    assert (
        RichTextTonAddress(type="ton_address", text="EQ...", address="EQ...").type == "ton_address"
    )
    assert (
        TonWalletTransfer(transaction_id="tx1", peer_address="EQ...", amount="100").transaction_id
        == "tx1"
    )
    assert PaidMessagesWaived() == PaidMessagesWaived()
    u1 = Update.from_dict(
        {
            "update_id": 1,
            "widget_query": {
                "id": "wq1",
                "from": {"id": 1, "is_bot": False, "first_name": "A"},
                "chat_instance": "ci1",
                "type": {"type": "data"},
                "data": "{}",
            },
        }
    )
    u2 = Update.from_dict(
        {
            "update_id": 2,
            "shared_widget_query": {
                "id": "swq1",
                "from": {"id": 1, "is_bot": False, "first_name": "A"},
                "type": {"type": "data"},
                "data": "{}",
                "widget_id": "w1",
            },
        }
    )
    assert isinstance(u1.widget_query, WidgetQuery)
    assert isinstance(u2.shared_widget_query, SharedWidgetQuery)
