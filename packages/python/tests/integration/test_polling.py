"""Integration tests for the long-polling loop (T022).

A scripted MockTransport feeds update batches (then empty responses) while the
tests assert offset management, drop_pending_updates flushing, error recovery,
concurrent fan-out, and clean shutdown.
"""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator, Callable
from typing import Any

import httpx
import pytest

from telebot_py import Application, ApplicationBuilder, CallbackContext, MessageHandler, filters
from telebot_py.kernel.lifecycle import ApplicationState
from telebot_py.types import Update

ME_PAYLOAD = {"id": 999, "is_bot": True, "first_name": "EchoBot", "username": "echo_bot"}

ResponseHandler = Callable[[httpx.Request], httpx.Response]


class SleepRecorder:
    """Injectable async sleep recording delays without waiting."""

    def __init__(self) -> None:
        self.delays: list[float] = []

    async def __call__(self, delay: float) -> None:
        self.delays.append(delay)


class ScriptedTransport:
    """MockTransport serving ordered steps while recording every request."""

    def __init__(self, *steps: httpx.Response | ResponseHandler) -> None:
        if not steps:
            msg = "at least one step is required"
            raise ValueError(msg)
        self.requests: list[httpx.Request] = []
        self._handlers: list[ResponseHandler] = []
        for step in steps:
            if isinstance(step, httpx.Response):
                self._handlers.append(lambda request, _response=step: _response)
            else:
                self._handlers.append(step)
        self._served = 0
        self.transport = httpx.MockTransport(self._dispatch)

    def _dispatch(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        index = min(self._served, len(self._handlers) - 1)
        self._served += 1
        return self._handlers[index](request)

    def get_updates_bodies(self) -> list[dict[str, Any]]:
        """Parsed JSON bodies of every getUpdates call, in order."""
        return [
            json.loads(request.content)
            for request in self.requests
            if request.url.path.endswith("/getUpdates")
        ]


def update_payload(update_id: int, make_update: Any) -> dict[str, Any]:
    """Raw message update payload with a text of ``update_id``'s ordinal."""
    return make_update(
        update_id,
        message={
            "message_id": update_id,
            "date": 1_700_000_000,
            "chat": {"id": 100, "type": "private"},
            "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
            "text": f"message-{update_id}",
        },
    )


@pytest.fixture()
def ok(ok_response: Any) -> Callable[[object], httpx.Response]:
    return ok_response


@pytest.fixture()
def scripted() -> Callable[..., ScriptedTransport]:
    return ScriptedTransport


async def wait_for(predicate: Callable[[], bool], timeout: float = 2.0) -> None:
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    while not predicate():
        if loop.time() > deadline:
            msg = "timed out waiting for condition"
            raise AssertionError(msg)
        await asyncio.sleep(0.001)


@pytest.fixture()
async def polling_app(scripted: Any, ok: Any, make_update: Any) -> AsyncIterator[dict[str, Any]]:
    """Factory wiring an application to a scripted transport plus a recorder list.

    Returns a dict with the built ``app``, the ``transport``, and the
    ``processed`` list of update_ids seen by the registered handler.
    """
    built: dict[str, Any] = {}

    def factory(*steps: Any, concurrent_updates: int | None = None) -> dict[str, Any]:
        transport = scripted(ok(ME_PAYLOAD), *steps)
        builder = ApplicationBuilder().token("123456:TEST").transport(transport.transport)
        sleep = SleepRecorder()
        builder.sleep(sleep)
        if concurrent_updates is not None:
            builder.concurrent_updates(concurrent_updates)
        app = builder.build()
        processed: list[int] = []

        def handler(update: Update, context: CallbackContext) -> None:
            processed.append(update.update_id)

        app.add_handler(MessageHandler(filters.TEXT, handler))
        built["app"] = app
        built["transport"] = transport
        built["processed"] = processed
        built["sleeps"] = sleep
        return built

    yield factory
    app = built.get("app")
    if app is None:
        return
    try:
        if app.state is ApplicationState.RUNNING:
            await app.stop()
        if app.state is ApplicationState.STOPPED:
            await app.shutdown()
    except Exception:  # noqa: BLE001 - defensive teardown
        pass


class TestPollingStream:
    async def test_processes_scripted_stream_and_advances_offset(
        self, polling_app: Any, ok: Any, make_update: Any
    ) -> None:
        env = polling_app(
            ok([update_payload(1, make_update), update_payload(2, make_update)]),
            ok([]),
            ok([update_payload(3, make_update)]),
            ok([]),
        )
        task = asyncio.create_task(env["app"]._run_polling(timeout=0, stop_signals=()))
        try:
            await wait_for(lambda: env["processed"] == [1, 2, 3])
        finally:
            await env["app"].stop()
            await task

        offsets = [body.get("offset") for body in env["transport"].get_updates_bodies()]
        assert offsets[:4] == [0, 3, 3, 4]
        assert env["app"].state is ApplicationState.STOPPED

    async def test_drop_pending_updates_flushes_with_negative_offset(
        self, polling_app: Any, ok: Any, make_update: Any
    ) -> None:
        env = polling_app(ok([update_payload(7, make_update)]), ok([]))
        task = asyncio.create_task(
            env["app"]._run_polling(timeout=0, drop_pending_updates=True, stop_signals=())
        )
        try:
            await wait_for(lambda: len(env["transport"].get_updates_bodies()) >= 2)
        finally:
            await env["app"].stop()
            await task

        bodies = env["transport"].get_updates_bodies()
        assert bodies[0] == {"offset": -1, "timeout": 0} or bodies[0].get("offset") == -1
        assert bodies[1].get("offset") == 8
        assert env["processed"] == []  # flushed updates are never dispatched

    async def test_allowed_updates_passthrough(self, polling_app: Any, ok: Any) -> None:
        env = polling_app(ok([]))
        task = asyncio.create_task(
            env["app"]._run_polling(timeout=0, allowed_updates=["message"], stop_signals=())
        )
        try:
            await wait_for(lambda: len(env["transport"].get_updates_bodies()) >= 1)
        finally:
            await env["app"].stop()
            await task

        body = env["transport"].get_updates_bodies()[0]
        assert body["allowed_updates"] == ["message"]


class TestPollingErrorRecovery:
    async def test_transient_transport_error_is_retried_not_fatal(
        self, polling_app: Any, ok: Any, raising_handler: Any, make_update: Any
    ) -> None:
        env = polling_app(
            raising_handler(httpx.ConnectError("boom")),
            ok([update_payload(1, make_update)]),
            ok([]),
        )
        task = asyncio.create_task(env["app"]._run_polling(timeout=0, stop_signals=()))
        try:
            await wait_for(lambda: env["processed"] == [1])
        finally:
            await env["app"].stop()
            await task
        assert 1.0 in env["sleeps"].delays  # the Bot-level retry backoff fired

    async def test_read_timeout_is_transient(
        self, polling_app: Any, ok: Any, raising_handler: Any, make_update: Any
    ) -> None:
        env = polling_app(
            raising_handler(httpx.ReadTimeout("slow")),
            ok([update_payload(1, make_update)]),
            ok([]),
        )
        task = asyncio.create_task(env["app"]._run_polling(timeout=0, stop_signals=()))
        try:
            await wait_for(lambda: env["processed"] == [1])
        finally:
            await env["app"].stop()
            await task

    async def test_loop_survives_exhausted_retries_with_backoff(
        self, polling_app: Any, ok: Any, raising_handler: Any, make_update: Any
    ) -> None:
        failing = raising_handler(httpx.ConnectError("boom"))
        env = polling_app(
            failing,
            failing,
            failing,
            failing,
            failing,  # exhausts the Bot's retry budget
            ok([update_payload(1, make_update)]),
            ok([]),
        )
        task = asyncio.create_task(env["app"]._run_polling(timeout=0, stop_signals=()))
        try:
            await wait_for(lambda: env["processed"] == [1])
        finally:
            await env["app"].stop()
            await task
        # Bot-internal backoff (1,2,4) plus one polling-loop backoff step.
        assert env["sleeps"].delays[:3] == [1.0, 2.0, 4.0]
        assert env["sleeps"].delays[3] == 1.0


class TestPollingLifecycle:
    async def test_clean_stop_drains_and_shuts_down(
        self, polling_app: Any, ok: Any, make_update: Any
    ) -> None:
        env = polling_app(ok([update_payload(1, make_update)]), ok([]))
        task = asyncio.create_task(env["app"]._run_polling(timeout=0, stop_signals=()))
        await wait_for(lambda: env["processed"] == [1])

        await env["app"].stop()
        await task

        request_count = len(env["transport"].requests)
        await asyncio.sleep(0.05)
        assert len(env["transport"].requests) == request_count  # loop truly stopped
        assert env["app"].state is ApplicationState.STOPPED
        assert env["app"].bot._client.is_closed  # shutdown closed the client

    async def test_run_polling_drives_full_lifecycle_with_hooks(
        self, scripted: Any, ok: Any, make_update: Any
    ) -> None:
        hooks: list[str] = []

        async def post_init(app: Application) -> None:
            hooks.append("post_init")

        async def post_shutdown(app: Application) -> None:
            hooks.append("post_shutdown")

        transport = scripted(ok(ME_PAYLOAD), ok([update_payload(1, make_update)]), ok([]))
        app = (
            ApplicationBuilder()
            .token("123456:TEST")
            .transport(transport.transport)
            .post_init(post_init)
            .post_shutdown(post_shutdown)
            .build()
        )

        async def record(update: Update, context: CallbackContext) -> None:
            hooks.append(f"update-{update.update_id}")

        app.add_handler(MessageHandler(filters.TEXT, record))
        task = asyncio.create_task(app._run_polling(timeout=0, stop_signals=()))
        await wait_for(lambda: "update-1" in hooks)
        await app.stop()
        await task

        assert hooks == ["post_init", "update-1", "post_shutdown"]

    async def test_updates_in_one_batch_run_concurrently(
        self, polling_app: Any, ok: Any, make_update: Any
    ) -> None:
        env = polling_app(
            ok([update_payload(1, make_update), update_payload(2, make_update)]),
            ok([]),
        )
        gates: dict[int, asyncio.Event] = {}
        entered: list[int] = []

        async def gated(update: Update, context: CallbackContext) -> None:
            entered.append(update.update_id)
            gate = asyncio.Event()
            gates[update.update_id] = gate
            await gate.wait()

        env["app"].add_handler(MessageHandler(filters.TEXT, gated), group=-1)
        task = asyncio.create_task(env["app"]._run_polling(timeout=0, stop_signals=()))
        try:
            await wait_for(lambda: len(entered) == 2)  # both entered before either finished
        finally:
            for gate in gates.values():
                gate.set()
            await env["app"].stop()
            await task
        assert set(entered) == {1, 2}


class TestPollingSignalStop:
    def test_run_polling_stops_on_sigint(self, scripted: Any, ok: Any, make_update: Any) -> None:
        """The synchronous run_polling runner installs signal handlers and exits cleanly."""
        import os
        import signal
        import threading

        transport = scripted(ok(ME_PAYLOAD), ok([update_payload(1, make_update)]), ok([]))
        app = ApplicationBuilder().token("123456:TEST").transport(transport.transport).build()
        fired = threading.Event()

        def handler(update: Update, context: CallbackContext) -> None:
            fired.set()

        app.add_handler(MessageHandler(filters.TEXT, handler))

        def send_signal() -> None:
            assert fired.wait(5.0)
            os.kill(os.getpid(), signal.SIGINT)

        thread = threading.Thread(target=send_signal, daemon=True)
        thread.start()
        app.run_polling(timeout=0)  # returns after SIGINT
        thread.join(5.0)

        assert app.state is ApplicationState.STOPPED
