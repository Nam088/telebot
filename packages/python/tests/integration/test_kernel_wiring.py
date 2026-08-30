"""Integration tests for the US3 kernel wiring (T043).

Covers the JobQueue attached to ``Application`` via the builder
(``job_queue()`` opt-in, started once the bot is ready, stopped cleanly),
``context.job_queue`` population on every dispatch, a job firing with
``context.bot`` access through a MockTransport, and the plugin hook
dispatch stage: response hooks fire in declared order around successful
handler results (node parity: plugins hook the handler-processing stage),
error hooks fire inside the error-handler flow, and removal stops hooks.
"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
from typing import Any

import httpx
import pytest

from telebot_py import (
    Application,
    ApplicationBuilder,
    CallbackContext,
    MessageHandler,
    filters,
)
from telebot_py.bot.errors import ApplicationError
from telebot_py.kernel.lifecycle import ApplicationState
from telebot_py.plugins import Plugin
from telebot_py.scheduler import Job, JobQueue
from telebot_py.types import Update

ME_PAYLOAD = {"id": 999, "is_bot": True, "first_name": "EchoBot", "username": "echo_bot"}
MESSAGE_PAYLOAD = {
    "message_id": 7,
    "date": 1_700_000_000,
    "chat": {"id": 100, "type": "private"},
    "text": "ok",
}

MakeUpdate = Callable[..., dict[str, Any]]
RecordedTransport = tuple[httpx.MockTransport, list[httpx.Request]]


def text_update(make_update: MakeUpdate, update_id: int, text: str) -> Update:
    """Build a typed private-chat text-message update."""
    return Update.from_dict(
        make_update(
            update_id,
            message={
                "message_id": update_id,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "private"},
                "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
                "text": text,
            },
        )
    )


def recording_transport(ok_response: Any) -> RecordedTransport:
    """Transport answering getMe first, then canned sendMessage replies.

    Every request is recorded so tests can assert which Bot API calls a
    handler or a job actually made.

    Args:
        ok_response: The conftest canned-success response builder.

    Returns:
        The transport and the request it has served, in order.
    """
    requests: list[httpx.Request] = []

    def dispatch(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        if len(requests) == 1:
            return ok_response(ME_PAYLOAD)
        return ok_response(MESSAGE_PAYLOAD)

    return httpx.MockTransport(dispatch), requests


async def wait_for(predicate: Callable[[], bool], timeout: float = 2.0) -> None:
    """Poll ``predicate`` until true, failing the test on timeout."""
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    while not predicate():
        if loop.time() > deadline:
            msg = "timed out waiting for condition"
            raise AssertionError(msg)
        await asyncio.sleep(0.001)


@pytest.fixture()
def recorded(ok_response: Any) -> RecordedTransport:
    """A recording MockTransport plus its request log."""
    return recording_transport(ok_response)


@pytest.fixture()
async def app(recorded: RecordedTransport) -> AsyncIterator[Application]:
    """A started application with an enabled JobQueue and recording transport."""
    transport, _ = recorded
    application = ApplicationBuilder().token("123456:TEST").transport(transport).job_queue().build()
    await application.initialize()
    await application.start()
    yield application
    try:
        if application.state is ApplicationState.RUNNING:
            await application.stop()
        if application.state is ApplicationState.STOPPED:
            await application.shutdown()
    except ApplicationError:
        pass
    await asyncio.sleep(0)  # let cancelled job tasks finish before the loop closes


class TestBuilderJobQueueOption:
    def test_enabling_creates_a_stopped_queue(self, recorded: RecordedTransport) -> None:
        transport, _ = recorded
        app = ApplicationBuilder().token("123:ABC").transport(transport).job_queue().build()
        assert isinstance(app.job_queue, JobQueue)
        assert app.job_queue.running is False

    def test_build_without_the_call_has_no_queue(self, recorded: RecordedTransport) -> None:
        transport, _ = recorded
        app = ApplicationBuilder().token("123:ABC").transport(transport).build()
        assert app.job_queue is None

    def test_disabled_queue_is_none(self, recorded: RecordedTransport) -> None:
        transport, _ = recorded
        app = ApplicationBuilder().token("123:ABC").transport(transport).job_queue(False).build()
        assert app.job_queue is None

    def test_enabled_must_be_a_bool(self) -> None:
        with pytest.raises(ValueError, match="job_queue"):
            ApplicationBuilder().job_queue("yes")  # type: ignore[arg-type]

    def test_setting_the_option_twice_raises(self) -> None:
        builder = ApplicationBuilder().job_queue()
        with pytest.raises(ValueError, match="job_queue"):
            builder.job_queue(False)


class TestJobQueueLifecycle:
    async def test_queue_starts_after_bot_ready_and_stops_with_lifecycle(
        self, recorded: RecordedTransport
    ) -> None:
        transport, _ = recorded
        app = ApplicationBuilder().token("123456:TEST").transport(transport).job_queue().build()
        assert app.job_queue is not None
        fired: list[str] = []
        job = app.job_queue.run_repeating(lambda job: fired.append("tick"), 0.005)
        assert app.job_queue.running is False  # pending until the bot is ready

        await app.initialize()
        assert app.job_queue.running is True  # started after getMe succeeded
        await app.start()
        try:
            await wait_for(lambda: len(fired) >= 2)
        finally:
            await app.stop()
        assert app.job_queue.running is False
        assert job.cancelled is True
        assert app.job_queue.jobs() == []
        await app.shutdown()

    async def test_context_job_queue_populated_on_every_dispatch(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        seen: list[JobQueue | None] = []

        async def callback(update: Update, context: CallbackContext) -> None:
            seen.append(context.job_queue)

        app.add_handler(MessageHandler(filters.TEXT, callback))
        await app.process_update(text_update(make_update, 1, "one"))
        await app.process_update(text_update(make_update, 2, "two"))

        assert len(seen) == 2
        for queue in seen:
            assert queue is app.job_queue
        assert app.job_queue is not None
        assert app.job_queue.running is True

    async def test_job_fires_and_reaches_the_bot_api_through_context_bot(
        self,
        app: Application,
        make_update: MakeUpdate,
        recorded: RecordedTransport,
    ) -> None:
        _, requests = recorded

        async def schedule(update: Update, context: CallbackContext) -> None:
            assert context.job_queue is not None
            bot = context.bot
            chat_id = update.effective_chat.id if update.effective_chat is not None else 0

            async def fire(job: Job[Any]) -> None:
                await bot.send_message(chat_id=chat_id, text="reminder!")

            context.job_queue.run_once(fire, 0.005, name="reminder")

        app.add_handler(MessageHandler(filters.TEXT, schedule))
        await app.process_update(text_update(make_update, 1, "remind me"))

        await wait_for(lambda: len(requests) == 2)  # getMe + the job's sendMessage
        sent = requests[1]
        assert sent is not None
        assert sent.url.path.endswith("/sendMessage")
        assert b"reminder!" in sent.content
        assert b"100" in sent.content


class RecordingResponsePlugin(Plugin):
    """Records response-hook invocations and appends a marker to the result."""

    def __init__(self, name: str, marker: str, sink: list[str]) -> None:
        self.name = name
        self.marker = marker
        self.sink = sink

    async def on_response(self, context: CallbackContext, response: object) -> object:
        self.sink.append(f"{self.name}:{response}")
        return f"{response}{self.marker}"


class RecordingErrorPlugin(Plugin):
    """Records error-hook invocations with the received exception."""

    def __init__(self, name: str, sink: list[tuple[str, Exception]]) -> None:
        self.name = name
        self.sink = sink

    async def on_error(self, context: CallbackContext, error: Exception) -> None:
        self.sink.append((self.name, error))


class TestPluginHookDispatch:
    async def test_response_hooks_fire_in_order_around_the_handler_result(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        events: list[str] = []

        async def handler(update: Update, context: CallbackContext) -> str:
            events.append("handler")
            return "base"

        # Registered out of order on purpose: ``order`` decides hook order.
        app.add_plugin(RecordingResponsePlugin("p2", "[p2]", events), order=2)
        app.add_plugin(RecordingResponsePlugin("p1", "[p1]", events), order=1)
        app.add_handler(MessageHandler(filters.TEXT, handler))

        await app.process_update(text_update(make_update, 1, "hello"))

        assert events == ["handler", "p1:base", "p2:base[p1]"]

    async def test_response_hooks_skip_failed_updates(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        events: list[str] = []
        errors: list[tuple[str, Exception]] = []

        async def raising(update: Update, context: CallbackContext) -> None:
            raise RuntimeError("boom")

        app.add_plugin(RecordingResponsePlugin("p1", "[p1]", events))
        app.add_plugin(RecordingErrorPlugin("e1", errors))
        app.add_handler(MessageHandler(filters.TEXT, raising))

        await app.process_update(text_update(make_update, 1, "hello"))

        assert events == []  # no handler result, no response hooks
        assert [name for name, _ in errors] == ["e1"]

    async def test_error_hooks_fire_after_error_handlers(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        events: list[str] = []
        seen_errors: list[Exception] = []
        boom = RuntimeError("boom")

        async def raising(update: Update, context: CallbackContext) -> None:
            raise boom

        async def error_handler(update: Update | None, context: CallbackContext) -> None:
            events.append("error_handler")
            assert context.error is boom
            seen_errors.append(context.error)

        class OrderCheckingErrorPlugin(Plugin):
            name = "e1"

            async def on_error(self, context: CallbackContext, error: Exception) -> None:
                events.append("plugin")
                seen_errors.append(error)

        app.add_plugin(OrderCheckingErrorPlugin())
        app.add_handler(MessageHandler(filters.TEXT, raising))
        app.add_error_handler(error_handler)

        await app.process_update(text_update(make_update, 1, "hello"))

        assert events == ["error_handler", "plugin"]  # plugins observe after handlers
        assert seen_errors == [boom, boom]

    async def test_removing_a_plugin_stops_its_hooks(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        events: list[str] = []

        def handler(update: Update, context: CallbackContext) -> str:
            return "base"

        app.add_plugin(RecordingResponsePlugin("p1", "[p1]", events))
        app.add_handler(MessageHandler(filters.TEXT, handler))

        await app.process_update(text_update(make_update, 1, "one"))
        assert events == ["p1:base"]

        app.remove_plugin("p1")
        await app.process_update(text_update(make_update, 2, "two"))
        assert events == ["p1:base"]  # unchanged: removed hooks no longer fire

    async def test_non_blocking_handlers_also_fire_response_hooks(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        events: list[str] = []

        def handler(update: Update, context: CallbackContext) -> str:
            return "base"

        non_blocking = MessageHandler(filters.TEXT, handler)
        non_blocking.block = False
        app.add_plugin(RecordingResponsePlugin("p1", "[p1]", events))
        app.add_handler(non_blocking)

        await app.process_update(text_update(make_update, 1, "hello"))
        await wait_for(lambda: events == ["p1:base"])
