"""Integration tests for webhook mode (T048, quickstart V6/L5).

A real asyncio TCP client POSTs raw HTTP/1.1 requests at the webhook server
bound to ``127.0.0.1`` on an ephemeral port, asserting update dispatch,
secret-token verification, rejection of malformed/oversized requests, and
that the server keeps serving after every bad request.
"""

from __future__ import annotations

import asyncio
import contextlib
import json
from collections.abc import AsyncIterator, Callable
from typing import Any

import httpx
import pytest

from telebot_py import ApplicationBuilder, CallbackContext, MessageHandler, filters
from telebot_py.kernel.lifecycle import ApplicationState
from telebot_py.kernel.webhook import MAX_WEBHOOK_BODY_BYTES
from telebot_py.types import Update

ME_PAYLOAD = {"id": 999, "is_bot": True, "first_name": "EchoBot", "username": "echo_bot"}
SECRET = "s3cret-hook-token"

ResponseHandler = Callable[[Any], Any]


class ScriptedTransport:
    """MockTransport serving ordered steps while recording every request."""

    def __init__(self, *steps: Any) -> None:
        if not steps:
            msg = "at least one step is required"
            raise ValueError(msg)
        self.requests: list[Any] = []
        self._handlers: list[ResponseHandler] = []
        for step in steps:
            if isinstance(step, httpx.Response):
                self._handlers.append(lambda request, _response=step: _response)
            else:
                self._handlers.append(step)
        self._served = 0
        self.transport = httpx.MockTransport(self._dispatch)

    def _dispatch(self, request: Any) -> Any:
        self.requests.append(request)
        index = min(self._served, len(self._handlers) - 1)
        self._served += 1
        return self._handlers[index](request)


@pytest.fixture()
def scripted() -> Any:
    return ScriptedTransport


async def wait_for(predicate: Callable[[], bool], timeout: float = 2.0) -> None:
    """Poll ``predicate`` until true, failing the test on timeout."""
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    while not predicate():
        if loop.time() > deadline:
            msg = "timed out waiting for condition"
            raise AssertionError(msg)
        await asyncio.sleep(0.001)


def http_request(
    method: str, path: str, body: bytes = b"", headers: dict[str, str] | None = None
) -> bytes:
    """Serialize one raw HTTP/1.1 request; caller headers override defaults."""
    merged = {"Host": "127.0.0.1", "Content-Length": str(len(body)), **(headers or {})}
    lines = [f"{method} {path} HTTP/1.1", *(f"{name}: {value}" for name, value in merged.items())]
    return ("\r\n".join(lines) + "\r\n\r\n").encode("latin-1") + body


def post_update(
    update: dict[str, Any] | None,
    path: str = "/",
    *,
    secret: str | None = None,
    body_override: bytes | None = None,
) -> bytes:
    """POST request carrying an update JSON body (optionally mangled)."""
    headers = {}
    if secret is not None:
        headers["X-Telegram-Bot-Api-Secret-Token"] = secret
    body = body_override if body_override is not None else json.dumps(update).encode("utf-8")
    return http_request("POST", path, body, headers)


async def exchange(port: int, request: bytes) -> tuple[int, bytes]:
    """Send one raw request; the server answers and closes, so read to EOF."""
    reader, writer = await asyncio.open_connection("127.0.0.1", port)
    try:
        writer.write(request)
        await writer.drain()
        data = await asyncio.wait_for(reader.read(), timeout=5.0)
    finally:
        writer.close()
        with contextlib.suppress(ConnectionError, OSError):
            await writer.wait_closed()
    assert data, "server closed the connection without responding"
    head, _, body = data.partition(b"\r\n\r\n")
    status = int(head.split(b" ", 2)[1])
    return status, body


@pytest.fixture()
async def webhook_env(
    scripted: Any, ok_response: Any
) -> AsyncIterator[Callable[..., dict[str, Any]]]:
    """Factory wiring an app to a mock transport plus an update-id recorder.

    Returns a dict with ``app``, ``transport``, ``processed`` (update ids the
    registered spy handler saw), and ``task`` once the webhook is started.
    """
    built: dict[str, Any] = {}

    def factory() -> dict[str, Any]:
        transport = scripted(ok_response(ME_PAYLOAD), ok_response(True))
        app = ApplicationBuilder().token("123456:TEST").transport(transport.transport).build()
        processed: list[int] = []

        def handler(update: Update, context: CallbackContext) -> None:
            processed.append(update.update_id)

        app.add_handler(MessageHandler(filters.TEXT, handler))
        env = {"app": app, "transport": transport, "processed": processed, "task": None}
        built["env"] = env
        return env

    yield factory
    env = built.get("env")
    if env is None:
        return
    with contextlib.suppress(Exception):
        app = env["app"]
        if app.state is ApplicationState.RUNNING:
            await app.stop()
        if env["task"] is not None:
            await env["task"]


async def start_server(env: dict[str, Any], **kwargs: Any) -> int:
    """Start ``_run_webhook`` on an ephemeral port and return the bound port."""
    app = env["app"]
    env["task"] = asyncio.create_task(app._run_webhook(port=0, stop_signals=(), **kwargs))
    await wait_for(lambda: app._webhook_server is not None)
    assert app._webhook_server is not None
    return app._webhook_server.port


class TestWebhookDispatch:
    async def test_posted_update_is_dispatched_to_handler(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env)
        status, body = await exchange(port, post_update(make_update(7)))
        assert status == 200
        assert body == b"OK"
        await wait_for(lambda: env["processed"] == [7])

    async def test_dispatch_can_make_bot_calls_via_transport(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()

        async def echo(update: Update, context: CallbackContext) -> None:
            chat = update.effective_chat
            if update.effective_message is not None and chat is not None:
                await context.bot.send_message(chat_id=chat.id, text="pong")

        env["app"].add_handler(MessageHandler(filters.TEXT, echo), group=-1)
        port = await start_server(env)
        status, _ = await exchange(port, post_update(make_update(3)))
        assert status == 200
        await wait_for(
            lambda: any(
                request.url.path.endswith("/sendMessage") for request in env["transport"].requests
            )
        )
        sent = [
            json.loads(request.content)
            for request in env["transport"].requests
            if request.url.path.endswith("/sendMessage")
        ]
        assert sent == [{"chat_id": 100, "text": "pong"}]

    async def test_updates_only_served_at_configured_url_path(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env, url_path="my-hook")
        status, _ = await exchange(port, post_update(make_update(1), path="/my-hook"))
        assert status == 200
        await wait_for(lambda: env["processed"] == [1])

        status, _ = await exchange(port, post_update(make_update(2), path="/"))
        assert status == 404
        status, _ = await exchange(port, post_update(make_update(3), path="/my-hook/other"))
        assert status == 404
        assert env["processed"] == [1]  # nothing dispatched from the 404s

    async def test_multiple_updates_are_all_processed(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env)
        for update_id in (1, 2, 3):
            status, _ = await exchange(port, post_update(make_update(update_id)))
            assert status == 200
        await wait_for(lambda: env["processed"] == [1, 2, 3])


class TestSecretToken:
    async def test_matching_secret_token_is_accepted(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env, secret_token=SECRET)
        status, _ = await exchange(port, post_update(make_update(1), secret=SECRET))
        assert status == 200
        await wait_for(lambda: env["processed"] == [1])

    async def test_missing_or_wrong_secret_token_is_rejected(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env, secret_token=SECRET)
        status, _ = await exchange(port, post_update(make_update(1)))
        assert status == 401
        status, _ = await exchange(port, post_update(make_update(2), secret="wrong"))
        assert status == 401
        assert env["processed"] == []

        # the server still accepts a correctly signed delivery afterwards
        status, _ = await exchange(port, post_update(make_update(3), secret=SECRET))
        assert status == 200
        await wait_for(lambda: env["processed"] == [3])

    async def test_unsigned_requests_accepted_when_no_secret_configured(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env)
        status, _ = await exchange(port, post_update(make_update(1)))
        assert status == 200
        await wait_for(lambda: env["processed"] == [1])


class TestMalformedRequests:
    async def test_truncated_json_rejected_and_server_survives(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env)
        truncated = json.dumps(make_update(1)).encode("utf-8")[:-10]
        status, _ = await exchange(port, post_update(None, body_override=truncated))
        assert status == 400

        status, _ = await exchange(port, post_update(make_update(2)))
        assert status == 200
        await wait_for(lambda: env["processed"] == [2])

    async def test_non_object_json_rejected(self, webhook_env: Any) -> None:
        env = webhook_env()
        port = await start_server(env)
        for body in (b"[1, 2, 3]", b'"hello"', b"42"):
            status, _ = await exchange(port, post_update(None, body_override=body))
            assert status == 400

    async def test_json_without_exactly_one_payload_rejected(self, webhook_env: Any) -> None:
        env = webhook_env()
        port = await start_server(env)
        status, _ = await exchange(port, post_update({"update_id": 9}))
        assert status == 400

    async def test_oversized_body_rejected_and_server_survives(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env)
        oversized = http_request(
            "POST", "/", headers={"Content-Length": str(MAX_WEBHOOK_BODY_BYTES + 1)}
        )
        status, _ = await exchange(port, oversized)
        assert status == 400

        status, _ = await exchange(port, post_update(make_update(2)))
        assert status == 200
        await wait_for(lambda: env["processed"] == [2])

    async def test_chunked_transfer_encoding_rejected(self, webhook_env: Any) -> None:
        env = webhook_env()
        port = await start_server(env)
        chunked = (
            b"POST / HTTP/1.1\r\nHost: 127.0.0.1\r\nTransfer-Encoding: chunked\r\n\r\n"
            b"5\r\nhello\r\n0\r\n\r\n"
        )
        status, _ = await exchange(port, chunked)
        assert status == 400

    async def test_unknown_path_gets_404_and_server_survives(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env)
        status, _ = await exchange(port, post_update(make_update(1), path="/nope"))
        assert status == 404
        status, _ = await exchange(port, post_update(make_update(2)))
        assert status == 200
        await wait_for(lambda: env["processed"] == [2])

    async def test_non_post_on_webhook_path_gets_405(self, webhook_env: Any) -> None:
        env = webhook_env()
        port = await start_server(env)
        status, _ = await exchange(port, http_request("GET", "/"))
        assert status == 405
        status, _ = await exchange(port, http_request("DELETE", "/"))
        assert status == 405

    async def test_server_survives_a_barrage_of_bad_requests(
        self, webhook_env: Any, make_update: Any
    ) -> None:
        env = webhook_env()
        port = await start_server(env)
        bad_requests = [
            post_update(None, body_override=b'{"update_id": 1, "mess'),  # truncated JSON
            post_update(make_update(1), path="/unknown"),  # unknown path
            http_request("GET", "/"),  # wrong method
            post_update(None, body_override=b"[1, 2]"),  # JSON but not an object
            http_request(
                "POST", "/", headers={"Content-Length": str(MAX_WEBHOOK_BODY_BYTES + 1)}
            ),  # oversized
        ]
        for request in bad_requests:
            status, _ = await exchange(port, request)
            assert status in (400, 404, 405)

        for update_id in (5, 6):
            status, _ = await exchange(port, post_update(make_update(update_id)))
            assert status == 200
        await wait_for(lambda: env["processed"] == [5, 6])
