"""Integration tests for lifecycle hardening (T049).

Covers quickstart V5 (concurrent polling+webhook rejection with the typed
application error), invalid-token fail-fast on ``run_polling``/``run_webhook``
startup, and handler exceptions being logged without killing the run loop.
"""

from __future__ import annotations

import asyncio
import contextlib
import json
import logging
from collections.abc import Callable
from typing import Any

import httpx
import pytest

from telebot_py import ApplicationBuilder, CallbackContext, MessageHandler, filters
from telebot_py.bot.errors import ApplicationError, InvalidTokenError
from telebot_py.kernel.lifecycle import ApplicationState
from telebot_py.types import Update

ME_PAYLOAD = {"id": 999, "is_bot": True, "first_name": "EchoBot", "username": "echo_bot"}

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


def post_update(update: dict[str, Any]) -> bytes:
    """Raw HTTP/1.1 POST carrying an update JSON body."""
    body = json.dumps(update).encode("utf-8")
    lines = [
        "POST / HTTP/1.1",
        "Host: 127.0.0.1",
        f"Content-Length: {len(body)}",
    ]
    return ("\r\n".join(lines) + "\r\n\r\n").encode("latin-1") + body


async def post_and_get_status(port: int, request: bytes) -> int:
    """POST a raw request at the webhook server and return the status code."""
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
    return int(data.split(b" ", 2)[1])


def build_app_with_raising_handler(
    scripted: Any, ok_response: Any, *steps: Any
) -> tuple[Any, list[str]]:
    """App whose only handler raises; returns (app, recorded error messages)."""
    transport = scripted(ok_response(ME_PAYLOAD), *steps)
    app = ApplicationBuilder().token("123456:TEST").transport(transport.transport).build()
    errors: list[str] = []

    async def failing(update: Update, context: CallbackContext) -> None:
        raise RuntimeError(f"boom-{update.update_id}")

    async def on_error(update: Update | None, context: CallbackContext) -> None:
        errors.append(str(context.error))

    app.add_handler(MessageHandler(filters.TEXT, failing))
    app.add_error_handler(on_error)
    return app, errors


class TestDoubleRunRejection:
    """quickstart V5: a second run mode on the same app raises ApplicationError."""

    async def test_double_run_polling_then_webhook_raises(
        self, scripted: Any, ok_response: Any, make_update: Any
    ) -> None:
        transport = scripted(
            ok_response(ME_PAYLOAD), ok_response([make_update(1)]), ok_response([])
        )
        app = ApplicationBuilder().token("123456:TEST").transport(transport.transport).build()
        task = asyncio.create_task(app._run_polling(timeout=0, stop_signals=()))
        try:
            await wait_for(lambda: app.state is ApplicationState.RUNNING)
            with pytest.raises(ApplicationError, match="already ran"):
                app.run_webhook()
            with pytest.raises(ApplicationError, match="already ran"):
                app.run_polling()
        finally:
            await app.stop()
            await task

    async def test_double_run_webhook_then_polling_raises(
        self, scripted: Any, ok_response: Any
    ) -> None:
        transport = scripted(ok_response(ME_PAYLOAD))
        app = ApplicationBuilder().token("123456:TEST").transport(transport.transport).build()
        task = asyncio.create_task(app._run_webhook(port=0, stop_signals=()))
        try:
            await wait_for(lambda: app.state is ApplicationState.RUNNING)
            with pytest.raises(ApplicationError, match="already ran"):
                app.run_polling()
            with pytest.raises(ApplicationError, match="already ran"):
                app.run_webhook()
        finally:
            await app.stop()
            await task


class TestInvalidTokenFailFast:
    async def test_run_polling_fails_fast_on_invalid_token(
        self, scripted: Any, error_response: Any
    ) -> None:
        transport = scripted(error_response(401, 401, "Unauthorized"))
        app = ApplicationBuilder().token("1:BAD").transport(transport.transport).build()
        with pytest.raises(InvalidTokenError):
            await app._run_polling(timeout=0, stop_signals=())
        assert app.state is ApplicationState.STOPPED
        assert app.bot._client.is_closed

    async def test_run_webhook_fails_fast_on_invalid_token(
        self, scripted: Any, error_response: Any
    ) -> None:
        transport = scripted(error_response(401, 401, "Unauthorized"))
        app = ApplicationBuilder().token("1:BAD").transport(transport.transport).build()
        with pytest.raises(InvalidTokenError):
            await app._run_webhook(port=0, stop_signals=())
        assert app.state is ApplicationState.STOPPED
        assert app.bot._client.is_closed


class TestRunLoopSurvivesHandlerErrors:
    async def test_webhook_loop_survives_handler_exceptions(
        self,
        scripted: Any,
        ok_response: Any,
        make_update: Any,
        caplog: pytest.LogCaptureFixture,
    ) -> None:
        app, errors = build_app_with_raising_handler(scripted, ok_response, ok_response(True))
        task = asyncio.create_task(app._run_webhook(port=0, stop_signals=()))
        try:
            await wait_for(lambda: app._webhook_server is not None)
            port = app._webhook_server.port
            with caplog.at_level(logging.ERROR):
                for update_id in (1, 2):
                    status = await post_and_get_status(port, post_update(make_update(update_id)))
                    assert status == 200  # acknowledged even though the handler raises
                    await wait_for(lambda n=update_id: len(errors) == n)
                assert app.state is ApplicationState.RUNNING  # loop still alive
        finally:
            await app.stop()
            await task
        assert errors == ["boom-1", "boom-2"]
        assert any(
            "Error while processing update" in record.getMessage() for record in caplog.records
        )

    async def test_polling_loop_survives_handler_exceptions(
        self, scripted: Any, ok_response: Any, make_update: Any
    ) -> None:
        app, errors = build_app_with_raising_handler(
            scripted, ok_response, ok_response([make_update(1), make_update(2)]), ok_response([])
        )
        task = asyncio.create_task(app._run_polling(timeout=0, stop_signals=()))
        try:
            await wait_for(lambda: errors == ["boom-1", "boom-2"])
            assert app.state is ApplicationState.RUNNING  # loop still alive
        finally:
            await app.stop()
            await task


class TestBlockingWebhookRunner:
    def test_run_webhook_serves_updates_and_stops_on_sigint(
        self, scripted: Any, ok_response: Any, make_update: Any
    ) -> None:
        """The synchronous run_webhook runner serves deliveries and exits on SIGINT."""
        import os
        import signal
        import threading

        transport = scripted(ok_response(ME_PAYLOAD), ok_response(True))
        app = ApplicationBuilder().token("123456:TEST").transport(transport.transport).build()
        fired = threading.Event()

        def handler(update: Update, context: CallbackContext) -> None:
            fired.set()

        app.add_handler(MessageHandler(filters.TEXT, handler))

        def post_then_signal() -> None:
            loop = asyncio.new_event_loop()
            try:
                for _ in range(100):  # the server binds right after get_me
                    if app._webhook_server is not None:
                        break
                    threading.Event().wait(0.05)
                assert app._webhook_server is not None
                port = app._webhook_server.port
                loop.run_until_complete(post_and_get_status(port, post_update(make_update(1))))
                assert fired.wait(5.0)
                os.kill(os.getpid(), signal.SIGINT)
            finally:
                loop.close()

        thread = threading.Thread(target=post_then_signal, daemon=True)
        thread.start()
        app.run_webhook(port=0, listen="127.0.0.1")  # returns after SIGINT
        thread.join(5.0)

        assert fired.is_set()
        assert app.state is ApplicationState.STOPPED
