"""Unit tests for the HTTP retry policy (T009, quickstart V2)."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import httpx
import pytest

from telebot_py.bot.client import Bot
from telebot_py.bot.errors import (
    InvalidTokenError,
    NetworkError,
    TelegramApiError,
)
from telebot_py.bot.retry import RetryPolicy

TEST_TOKEN = "123456:TEST"

ResponseFactory = Callable[..., httpx.Response]


class SleepRecorder:
    """Injectable sleep stand-in recording requested delays without waiting."""

    def __init__(self) -> None:
        self.delays: list[float] = []

    async def __call__(self, delay: float) -> None:
        self.delays.append(delay)


def count_calls(
    response: httpx.Response, seen: list[httpx.Request]
) -> Callable[[httpx.Request], httpx.Response]:
    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return response

    return handler


@pytest.fixture()
def sleeps() -> SleepRecorder:
    return SleepRecorder()


def make_bot(
    bot_transport: Any,
    sleeps: SleepRecorder,
    *steps: Any,
    retry_policy: RetryPolicy | None = None,
) -> Bot:
    return Bot(
        TEST_TOKEN,
        transport=bot_transport(*steps),
        retry_policy=retry_policy,
        sleep=sleeps,
    )


class TestBackoffOn5xx:
    async def test_retries_then_succeeds(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        ok_response: ResponseFactory,
        error_response: ResponseFactory,
    ) -> None:
        bot = make_bot(
            bot_transport,
            sleeps,
            error_response(500, 500, "Internal Server Error"),
            error_response(502, 502, "Bad Gateway"),
            error_response(503, 503, "Service Unavailable"),
            ok_response({"ok_user": True}),
        )
        result = await bot.request("getMe")
        assert result == {"ok_user": True}
        assert sleeps.delays == [1.0, 2.0, 4.0]

    async def test_exhausts_budget_and_raises(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        error_response: ResponseFactory,
    ) -> None:
        seen: list[httpx.Request] = []
        step = count_calls(error_response(500, 500, "Internal Server Error"), seen)
        bot = make_bot(bot_transport, sleeps, step)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.request("getMe")
        assert excinfo.value.error_code == 500
        assert sleeps.delays == [1.0, 2.0, 4.0, 8.0]
        assert len(seen) == 5

    async def test_delay_capped_at_max(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        error_response: ResponseFactory,
    ) -> None:
        bot = make_bot(
            bot_transport,
            sleeps,
            error_response(500, 500, "Internal Server Error"),
            retry_policy=RetryPolicy(max_retries=6),
        )
        with pytest.raises(TelegramApiError):
            await bot.request("getMe")
        assert sleeps.delays == [1.0, 2.0, 4.0, 8.0, 16.0, 30.0]


class TestRateLimit429:
    async def test_waits_max_of_step_and_retry_after(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        ok_response: ResponseFactory,
        error_response: ResponseFactory,
    ) -> None:
        limit = error_response(429, 429, "Too Many Requests: retry after 5", retry_after=5)
        bot = make_bot(bot_transport, sleeps, limit, limit, limit, ok_response(True))
        assert await bot.request("deleteWebhook") is True
        assert sleeps.delays == [5.0, 5.0, 5.0]

    async def test_keeps_backoff_step_when_larger(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        ok_response: ResponseFactory,
        error_response: ResponseFactory,
    ) -> None:
        limit = error_response(429, 429, "Too Many Requests: retry after 1", retry_after=1)
        bot = make_bot(bot_transport, sleeps, limit, limit, limit, ok_response(True))
        assert await bot.request("deleteWebhook") is True
        assert sleeps.delays == [1.0, 2.0, 4.0]

    async def test_exhaustion_carries_retry_after(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        error_response: ResponseFactory,
    ) -> None:
        bot = make_bot(
            bot_transport,
            sleeps,
            error_response(429, 429, "Too Many Requests: retry after 7", retry_after=7),
        )
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.request("sendMessage")
        assert excinfo.value.error_code == 429
        assert excinfo.value.retry_after == 7.0


class TestClientErrorsFailFast:
    async def test_400_fails_immediately_without_retry(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        error_response: ResponseFactory,
    ) -> None:
        seen: list[httpx.Request] = []
        step = count_calls(error_response(400, 400, "Bad Request: chat not found"), seen)
        bot = make_bot(bot_transport, sleeps, step)
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.request("sendMessage")
        assert excinfo.value.error_code == 400
        assert excinfo.value.description == "Bad Request: chat not found"
        assert sleeps.delays == []
        assert len(seen) == 1

    async def test_403_fails_immediately_without_retry(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        error_response: ResponseFactory,
    ) -> None:
        bot = make_bot(
            bot_transport, sleeps, error_response(403, 403, "Forbidden: bot was blocked")
        )
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.request("sendMessage")
        assert excinfo.value.error_code == 403
        assert sleeps.delays == []

    async def test_401_raises_invalid_token(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        error_response: ResponseFactory,
    ) -> None:
        seen: list[httpx.Request] = []
        step = count_calls(error_response(401, 401, "Unauthorized"), seen)
        bot = make_bot(bot_transport, sleeps, step)
        with pytest.raises(InvalidTokenError) as excinfo:
            await bot.request("getMe")
        assert excinfo.value.error_code == 401
        assert sleeps.delays == []
        assert len(seen) == 1


class TestTransportAndEnvelope:
    async def test_transport_failure_retries_then_network_error(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        raising_handler: Callable[[Exception], Any],
    ) -> None:
        bot = make_bot(bot_transport, sleeps, raising_handler(httpx.ConnectError("boom")))
        with pytest.raises(NetworkError, match="boom"):
            await bot.request("getMe")
        assert sleeps.delays == [1.0, 2.0, 4.0, 8.0]

    async def test_transport_failure_then_success(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        ok_response: ResponseFactory,
        raising_handler: Callable[[Exception], Any],
    ) -> None:
        bot = make_bot(
            bot_transport,
            sleeps,
            raising_handler(httpx.ConnectError("boom")),
            raising_handler(httpx.ReadTimeout("slow")),
            ok_response({"id": 1}),
        )
        assert await bot.request("getMe") == {"id": 1}
        assert sleeps.delays == [1.0, 2.0]

    async def test_unwraps_ok_envelope(
        self, bot_transport: Any, sleeps: SleepRecorder, ok_response: ResponseFactory
    ) -> None:
        bot = make_bot(bot_transport, sleeps, ok_response({"id": 1, "is_bot": True}))
        result = await bot.request("getMe")
        assert result == {"id": 1, "is_bot": True}
        assert sleeps.delays == []

    async def test_ok_false_envelope_raises(
        self, bot_transport: Any, sleeps: SleepRecorder
    ) -> None:
        bot = make_bot(
            bot_transport,
            sleeps,
            httpx.Response(200, json={"ok": False, "error_code": 418, "description": "Teapot"}),
        )
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.request("getMe")
        assert excinfo.value.error_code == 418
        assert sleeps.delays == []

    async def test_non_json_error_body(self, bot_transport: Any, sleeps: SleepRecorder) -> None:
        seen: list[httpx.Request] = []
        bot = make_bot(
            bot_transport, sleeps, count_calls(httpx.Response(502, text="Bad Gateway"), seen)
        )
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.request("getMe")
        assert excinfo.value.error_code == 502
        assert len(seen) == 5
        assert sleeps.delays == [1.0, 2.0, 4.0, 8.0]


class TestClientConstruction:
    def test_empty_token_raises(self) -> None:
        with pytest.raises(ValueError, match="token"):
            Bot("")


class TestClientLifecycle:
    async def test_shutdown_closes_client(
        self, bot_transport: Any, sleeps: SleepRecorder, ok_response: ResponseFactory
    ) -> None:
        bot = make_bot(bot_transport, sleeps, ok_response(True))
        assert await bot.request("deleteWebhook") is True
        await bot.shutdown()
        with pytest.raises(RuntimeError, match="closed"):
            await bot.request("getMe")

    async def test_429_without_retry_after_uses_backoff_step(
        self,
        bot_transport: Any,
        sleeps: SleepRecorder,
        ok_response: ResponseFactory,
        error_response: ResponseFactory,
    ) -> None:
        limit = error_response(429, 429, "Too Many Requests")
        bot = make_bot(bot_transport, sleeps, limit, limit, ok_response(True))
        assert await bot.request("deleteWebhook") is True
        assert sleeps.delays == [1.0, 2.0]
