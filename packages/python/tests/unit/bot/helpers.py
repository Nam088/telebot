"""Shared helpers for Bot method-surface unit tests (T051).

Every extended-method test file records the outgoing request via an
httpx MockTransport, asserts the URL path and snake_case payload, and
checks the typed result — mirroring packages/go/pkg/bot/*_test.go.
"""

from __future__ import annotations

import json
from collections.abc import Callable
from typing import Any

import httpx

from telebot_py.bot import Bot
from telebot_py.bot.retry import RetryPolicy

TEST_TOKEN = "123456:TEST"


def make_bot(bot_transport: Any, *steps: Any, max_retries: int = 4) -> Bot:
    """Build a Bot wired to a canned MockTransport (no retries when asked)."""
    return Bot(
        TEST_TOKEN,
        transport=bot_transport(*steps),
        retry_policy=RetryPolicy(max_retries=max_retries),
    )


def record_into(
    response: httpx.Response, seen: list[httpx.Request]
) -> Callable[[httpx.Request], httpx.Response]:
    """Transport handler recording the request and serving ``response``."""

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return response

    return handler


def sent_payload(request: httpx.Request) -> dict[str, Any]:
    """Decode the JSON payload the client sent on the wire."""
    payload: dict[str, Any] = json.loads(request.content)
    return payload


def url_path(request: httpx.Request) -> str:
    """The request path, e.g. ``/bot<token>/sendMessage``."""
    return request.url.path
