"""Shared fixtures for the telebot_py test suite.

Provides an httpx MockTransport factory for canned Bot API responses, the
``live`` marker auto-skip for tests needing a real bot token, and factories
building raw update payloads in Telegram's Bot API JSON shape.
"""

from __future__ import annotations

import os
from collections.abc import Callable
from typing import Any

import httpx
import pytest

ResponseHandler = Callable[[httpx.Request], httpx.Response]

TestTransportFactory = Callable[..., httpx.MockTransport]


def _ok_response(result: object) -> httpx.Response:
    """Build a canned successful Bot API envelope response."""
    return httpx.Response(200, json={"ok": True, "result": result})


def _error_response(
    status_code: int,
    error_code: int,
    description: str,
    *,
    retry_after: float | None = None,
) -> httpx.Response:
    """Build a canned failing Bot API envelope response."""
    body: dict[str, Any] = {
        "ok": False,
        "error_code": error_code,
        "description": description,
    }
    if retry_after is not None:
        body["parameters"] = {"retry_after": retry_after}
    return httpx.Response(status_code, json=body)


def _raising_handler(error: Exception) -> ResponseHandler:
    """Build a transport handler that raises ``error``, simulating transport failure."""

    def handler(request: httpx.Request) -> httpx.Response:
        raise error

    return handler


@pytest.fixture()
def ok_response() -> Callable[[object], httpx.Response]:
    """Builder for canned successful Bot API envelope responses."""
    return _ok_response


@pytest.fixture()
def error_response() -> Callable[..., httpx.Response]:
    """Builder for canned failing Bot API envelope responses."""
    return _error_response


@pytest.fixture()
def raising_handler() -> Callable[[Exception], ResponseHandler]:
    """Builder for transport handlers that raise, simulating transport failures."""
    return _raising_handler


@pytest.fixture()
def bot_transport() -> TestTransportFactory:
    """Factory building an httpx MockTransport serving canned Bot API responses.

    Steps are served in order; the final step repeats once the sequence is
    exhausted. Each step is either a ready-made ``httpx.Response`` or a handler
    callable (use ``raising_handler`` to simulate transport-level failures).

    Returns:
        A callable accepting steps and returning a configured MockTransport.
    """

    def factory(*steps: httpx.Response | ResponseHandler) -> httpx.MockTransport:
        if not steps:
            msg = "bot_transport requires at least one response step"
            raise ValueError(msg)
        handlers: list[ResponseHandler] = []
        for step in steps:
            if isinstance(step, httpx.Response):
                handlers.append(lambda request, _response=step: _response)
            else:
                handlers.append(step)
        served = {"count": 0}

        def dispatch(request: httpx.Request) -> httpx.Response:
            index = min(served["count"], len(handlers) - 1)
            served["count"] += 1
            return handlers[index](request)

        return httpx.MockTransport(dispatch)

    return factory


@pytest.fixture()
def make_user() -> Callable[..., dict[str, Any]]:
    """Factory for raw Telegram ``User`` JSON payloads."""

    def factory(
        *,
        id: int = 42,
        is_bot: bool = False,
        first_name: str = "Alice",
        **overrides: Any,
    ) -> dict[str, Any]:
        user: dict[str, Any] = {"id": id, "is_bot": is_bot, "first_name": first_name}
        user.update(overrides)
        return user

    return factory


@pytest.fixture()
def make_message() -> Callable[..., dict[str, Any]]:
    """Factory for raw Telegram ``Message`` JSON payloads."""

    def factory(
        *,
        message_id: int = 1,
        date: int = 1_700_000_000,
        chat: dict[str, Any] | None = None,
        from_user: dict[str, Any] | None = None,
        text: str | None = "hello world",
        **overrides: Any,
    ) -> dict[str, Any]:
        default_from = {"id": 42, "is_bot": False, "first_name": "Alice"}
        message: dict[str, Any] = {
            "message_id": message_id,
            "date": date,
            "chat": chat if chat is not None else {"id": 100, "type": "private"},
            "from": from_user if from_user is not None else default_from,
            "text": text,
        }
        message.update(overrides)
        return message

    return factory


@pytest.fixture()
def make_update() -> Callable[..., dict[str, Any]]:
    """Factory for raw Telegram ``Update`` JSON payloads carrying a message by default."""

    def factory(update_id: int = 1, **payload_overrides: Any) -> dict[str, Any]:
        update: dict[str, Any] = {
            "update_id": update_id,
            "message": {
                "message_id": 1,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "private"},
                "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
                "text": "hello world",
            },
        }
        update.update(payload_overrides)
        return update

    return factory


def pytest_collection_modifyitems(config: pytest.Config, items: list[pytest.Item]) -> None:
    """Auto-skip tests marked ``live`` when TEST_BOT_TOKEN is unset (FR-017)."""
    if os.environ.get("TEST_BOT_TOKEN"):
        return
    skip_live = pytest.mark.skip(reason="live test requires TEST_BOT_TOKEN to be set")
    for item in items:
        if "live" in item.keywords:
            item.add_marker(skip_live)


@pytest.fixture()
def live_token() -> str:
    """The live bot token, skipping the test when TEST_BOT_TOKEN is unset."""
    token = os.environ.get("TEST_BOT_TOKEN")
    if not token:
        pytest.skip("live test requires TEST_BOT_TOKEN to be set")
    return token
