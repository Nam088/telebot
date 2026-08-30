"""Unit tests for the payments Bot method group (T051; parity with payments.go)."""

from __future__ import annotations

from typing import Any

import httpx

from telebot_py.types import Message, StarTransactions
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

PRICES = [{"label": "base", "amount": 100}]


class TestSendInvoice:
    async def test_sends_invoice_message(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=20, text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_invoice(
            1,
            "Coffee",
            "A fine coffee",
            "order-1",
            "XTR",
            PRICES,
        )
        assert isinstance(message, Message)
        assert message.message_id == 20
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendInvoice"
        assert sent_payload(seen[0]) == {
            "chat_id": 1,
            "title": "Coffee",
            "description": "A fine coffee",
            "payload": "order-1",
            "currency": "XTR",
            "prices": PRICES,
        }


class TestCreateInvoiceLink:
    async def test_returns_link_string(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response("https://t.me/$invoice"), seen)
        bot = make_bot(bot_transport, step)
        link = await bot.create_invoice_link("Coffee", "A fine coffee", "order-1", "XTR", PRICES)
        assert link == "https://t.me/$invoice"
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/createInvoiceLink"
        assert sent_payload(seen[0]) == {
            "title": "Coffee",
            "description": "A fine coffee",
            "payload": "order-1",
            "currency": "XTR",
            "prices": PRICES,
        }


class TestAnswerShippingQuery:
    async def test_approve_with_shipping_options(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        options = [{"id": "std", "title": "Standard", "prices": [{"label": "base", "amount": 50}]}]
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.answer_shipping_query("sq1", True, shipping_options=options)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/answerShippingQuery"
        assert sent_payload(seen[0]) == {
            "shipping_query_id": "sq1",
            "ok": True,
            "shipping_options": options,
        }

    async def test_reject_with_error_message(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.answer_shipping_query("sq1", False, error_message="no shipping available")
        assert sent_payload(seen[0]) == {
            "shipping_query_id": "sq1",
            "ok": False,
            "error_message": "no shipping available",
        }


class TestAnswerPreCheckoutQuery:
    async def test_approve(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.answer_pre_checkout_query("pcq1", True)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/answerPreCheckoutQuery"
        assert sent_payload(seen[0]) == {"pre_checkout_query_id": "pcq1", "ok": True}

    async def test_reject_with_error_message(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.answer_pre_checkout_query("pcq1", False, error_message="out of stock")
        assert sent_payload(seen[0]) == {
            "pre_checkout_query_id": "pcq1",
            "ok": False,
            "error_message": "out of stock",
        }


class TestGetStarTransactions:
    async def test_returns_typed_transactions(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        result = {"transactions": [{"id": "tx1", "amount": 250, "date": 1_700_000_000}]}
        step = record_into(ok_response(result), seen)
        bot = make_bot(bot_transport, step)
        transactions = await bot.get_star_transactions(limit=10)
        assert isinstance(transactions, StarTransactions)
        assert len(transactions.transactions) == 1
        assert transactions.transactions[0].id == "tx1"
        assert sent_payload(seen[0]) == {"limit": 10}


class TestRefundStarPayment:
    async def test_refunds_payment(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.refund_star_payment(1, "charge-1")
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/refundStarPayment"
        assert sent_payload(seen[0]) == {
            "user_id": 1,
            "telegram_payment_charge_id": "charge-1",
        }


class TestEditUserStarSubscription:
    async def test_cancels_subscription(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.edit_user_star_subscription(1, "charge-1", True)
        assert sent_payload(seen[0]) == {
            "user_id": 1,
            "telegram_payment_charge_id": "charge-1",
            "is_canceled": True,
        }
