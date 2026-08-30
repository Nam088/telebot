"""Integration tests for the update dispatch flow (T015, quickstart V3).

Covers: ordered handler groups, CallbackContext population, error routing to
error handlers while other groups keep running, and bounded concurrency.
"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
from typing import Any

import pytest

from telebot_py import (
    Application,
    ApplicationBuilder,
    CallbackContext,
    CallbackQueryHandler,
    CommandHandler,
    MessageHandler,
    filters,
)
from telebot_py.bot.errors import ApplicationError
from telebot_py.kernel.lifecycle import ApplicationState
from telebot_py.types import Update

ME_PAYLOAD = {"id": 999, "is_bot": True, "first_name": "EchoBot", "username": "echo_bot"}

MakeUpdate = Callable[..., dict[str, Any]]


def text_update(make_update: MakeUpdate, update_id: int, text: str, *, user_id: int = 42) -> Update:
    """Build a typed text-message update for the given user/chat."""
    return Update.from_dict(
        make_update(
            update_id,
            message={
                "message_id": update_id,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "private"},
                "from": {"id": user_id, "is_bot": False, "first_name": "Alice"},
                "text": text,
            },
        )
    )


def callback_query_update(make_update: MakeUpdate, update_id: int, data: str) -> Update:
    """Build a typed callback-query update carrying inline button data."""
    return Update.from_dict(
        make_update(
            update_id,
            message=None,
            callback_query={
                "id": f"cb-{update_id}",
                "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
                "chat_instance": "ci-1",
                "data": data,
            },
        )
    )


@pytest.fixture()
async def app(bot_transport: Any, ok_response: Any) -> AsyncIterator[Application]:
    """An initialized and started application backed by a MockTransport getMe."""
    application = (
        ApplicationBuilder()
        .token("123456:TEST")
        .transport(bot_transport(ok_response(ME_PAYLOAD)))
        .build()
    )
    await application.initialize()
    await application.start()
    yield application
    try:
        if application.state is ApplicationState.RUNNING:
            await application.stop()
        if application.state is not ApplicationState.STOPPED:
            return
        await application.shutdown()
    except ApplicationError:
        pass


async def wait_for(predicate: Callable[[], bool], timeout: float = 2.0) -> None:
    """Poll ``predicate`` until true, failing the test on timeout."""
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    while not predicate():
        if loop.time() > deadline:
            msg = "timed out waiting for condition"
            raise AssertionError(msg)
        await asyncio.sleep(0.001)


class TestGroupOrdering:
    async def test_groups_checked_in_ascending_key_order(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        checked: list[str] = []

        def recording(label: str) -> MessageHandler:
            handler = MessageHandler(filters.PHOTO, lambda update, context: None)
            original = handler.check_update

            def check(update: object) -> Any:
                checked.append(label)
                return original(update)

            handler.check_update = check  # type: ignore[method-assign]
            return handler

        app.add_handler(recording("g1"), group=1)
        app.add_handler(recording("g0"), group=0)

        # A text update matches neither PHOTO filter, so both groups are checked.
        await app.process_update(text_update(make_update, 1, "hello"))
        assert checked == ["g0", "g1"]

    async def test_blocking_handler_stops_higher_groups(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        calls: list[str] = []

        def callback(label: str) -> Callable[..., Any]:
            def inner(update: Update, context: CallbackContext) -> None:
                calls.append(label)

            return inner

        app.add_handler(MessageHandler(filters.TEXT, callback("g0")), group=0)
        app.add_handler(MessageHandler(filters.TEXT, callback("g1")), group=1)

        await app.process_update(text_update(make_update, 1, "hello"))
        assert calls == ["g0"]

    async def test_non_blocking_handler_lets_higher_groups_run(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        calls: list[str] = []

        def callback(label: str) -> Callable[..., Any]:
            def inner(update: Update, context: CallbackContext) -> None:
                calls.append(label)

            return inner

        first = MessageHandler(filters.TEXT, callback("g0"))
        first.block = False
        app.add_handler(first, group=0)
        app.add_handler(MessageHandler(filters.TEXT, callback("g1")), group=1)

        await app.process_update(text_update(make_update, 1, "hello"))
        await asyncio.sleep(0)  # let the non-blocking background callback run
        assert set(calls) == {"g0", "g1"}

    async def test_only_first_matching_handler_per_group_runs(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        calls: list[str] = []

        def callback(label: str) -> Callable[..., Any]:
            def inner(update: Update, context: CallbackContext) -> None:
                calls.append(label)

            return inner

        app.add_handler(MessageHandler(filters.TEXT, callback("first")), group=0)
        app.add_handler(MessageHandler(filters.TEXT, callback("second")), group=0)

        await app.process_update(text_update(make_update, 1, "hello"))
        assert calls == ["first"]


class TestContextPopulation:
    async def test_message_context_fields(self, app: Application, make_update: MakeUpdate) -> None:
        seen: list[CallbackContext] = []

        async def callback(update: Update, context: CallbackContext) -> None:
            seen.append(context)

        app.add_handler(MessageHandler(filters.TEXT, callback))
        update = text_update(make_update, 1, "hello world")
        await app.process_update(update)

        assert len(seen) == 1
        context = seen[0]
        assert context is not None
        assert context.bot is app.bot
        assert context.application is app
        assert context.update is update
        assert context.effective_chat is not None
        assert context.effective_chat.id == 100
        assert context.effective_user is not None
        assert context.effective_user.id == 42
        assert context.message is not None
        assert context.message.text == "hello world"
        assert context.user_data == {}
        assert context.chat_data == {}
        assert context.bot_data is app.bot_data
        assert context.job_queue is None
        assert context.error is None
        assert context.args is None
        assert context.matches is None

    async def test_data_dicts_are_mutable_and_shared_across_updates(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        async def counter(update: Update, context: CallbackContext) -> None:
            assert context.user_data is not None
            assert context.chat_data is not None
            context.user_data["n"] = int(context.user_data.get("n", 0)) + 1
            context.chat_data["n"] = int(context.chat_data.get("n", 0)) + 1
            context.bot_data["total"] = int(context.bot_data.get("total", 0)) + 1

        app.add_handler(MessageHandler(filters.TEXT, counter))
        await app.process_update(text_update(make_update, 1, "one"))
        await app.process_update(text_update(make_update, 2, "two"))
        await app.process_update(text_update(make_update, 3, "other", user_id=77))

        assert app.user_data[42]["n"] == 2
        assert app.user_data[77]["n"] == 1
        assert app.chat_data[100]["n"] == 3
        assert app.bot_data["total"] == 3

    async def test_command_handler_populates_args(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        seen: list[list[str]] = []

        async def callback(update: Update, context: CallbackContext) -> None:
            assert context.args is not None
            seen.append(context.args)

        app.add_handler(CommandHandler("start", callback))
        await app.process_update(text_update(make_update, 1, "/start a b c"))
        await app.process_update(text_update(make_update, 2, "/start"))

        assert seen == [["a", "b", "c"], []]

    async def test_callback_query_handler_populates_matches(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        seen: list[list[str]] = []

        async def callback(update: Update, context: CallbackContext) -> None:
            assert context.matches is not None
            seen.append([m.group(1) for m in context.matches])

        app.add_handler(CallbackQueryHandler(r"item_(\d+)", callback))
        await app.process_update(callback_query_update(make_update, 1, "item_42"))
        await app.process_update(callback_query_update(make_update, 2, "other"))

        assert seen == [["42"]]


class TestErrorRouting:
    async def test_handler_exception_routes_to_every_error_handler(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        boom = RuntimeError("boom")
        seen: list[tuple[str, object, Exception | None]] = []
        group1_calls: list[int] = []

        async def raising(update: Update, context: CallbackContext) -> None:
            raise boom

        def group1(update: Update, context: CallbackContext) -> None:
            group1_calls.append(update.update_id)

        async def err_one(update: object, context: CallbackContext) -> None:
            seen.append(("one", update, context.error))

        async def err_two(update: object, context: CallbackContext) -> None:
            seen.append(("two", update, context.error))

        app.add_handler(MessageHandler(filters.TEXT, raising), group=0)
        app.add_handler(MessageHandler(filters.TEXT, group1), group=1)
        app.add_error_handler(err_one)
        app.add_error_handler(err_two)

        update = text_update(make_update, 1, "hello")
        await app.process_update(update)  # must not raise

        assert [(name, err) for name, _, err in seen] == [("one", boom), ("two", boom)]
        assert all(received is update for _, received, _ in seen)
        assert group1_calls == [1]  # other groups still ran

    async def test_raising_error_handler_does_not_break_dispatch(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        recovered: list[Exception] = []

        async def raising(update: Update, context: CallbackContext) -> None:
            raise ValueError("handler failed")

        async def bad_error_handler(update: object, context: CallbackContext) -> None:
            raise RuntimeError("error handler failed")

        async def good_error_handler(update: object, context: CallbackContext) -> None:
            assert context.error is not None
            recovered.append(context.error)

        app.add_handler(MessageHandler(filters.TEXT, raising))
        app.add_error_handler(bad_error_handler)
        app.add_error_handler(good_error_handler)

        await app.process_update(text_update(make_update, 1, "hello"))
        assert [str(err) for err in recovered] == ["handler failed"]

    async def test_dispatch_survives_and_keeps_processing(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        handled: list[int] = []

        async def raising(update: Update, context: CallbackContext) -> None:
            raise RuntimeError("boom")

        def record(update: Update, context: CallbackContext) -> None:
            handled.append(update.update_id)

        app.add_handler(MessageHandler(filters.Regex(r"^bad$"), raising))
        app.add_handler(MessageHandler(filters.TEXT, record))

        await app.process_update(text_update(make_update, 1, "bad"))
        await app.process_update(text_update(make_update, 2, "good"))

        assert handled == [2]

    async def test_exception_without_error_handlers_is_logged_not_raised(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        async def raising(update: Update, context: CallbackContext) -> None:
            raise RuntimeError("boom")

        app.add_handler(MessageHandler(filters.TEXT, raising))
        await app.process_update(text_update(make_update, 1, "hello"))  # no raise


class TestConcurrency:
    async def test_concurrent_updates_are_bounded(
        self, bot_transport: Any, ok_response: Any, make_update: MakeUpdate
    ) -> None:
        in_flight = 0
        peak = 0
        releases: list[asyncio.Event] = []

        async def gated(update: Update, context: CallbackContext) -> None:
            nonlocal in_flight, peak
            in_flight += 1
            peak = max(peak, in_flight)
            release = asyncio.Event()
            releases.append(release)
            await release.wait()
            in_flight -= 1

        application = (
            ApplicationBuilder()
            .token("123456:TEST")
            .transport(bot_transport(ok_response(ME_PAYLOAD)))
            .concurrent_updates(2)
            .build()
        )
        application.add_handler(MessageHandler(filters.TEXT, gated))
        await application.initialize()
        await application.start()
        try:
            tasks = [
                asyncio.create_task(
                    application.process_update(text_update(make_update, i, f"u{i}"))
                )
                for i in range(1, 5)
            ]
            await wait_for(lambda: len(releases) == 2)
            assert in_flight == 2

            releases[0].set()
            releases[1].set()
            await wait_for(lambda: len(releases) == 4)
            assert peak == 2  # bound held across all four updates

            for release in releases[2:]:
                release.set()
            await asyncio.gather(*tasks)
        finally:
            await application.stop()
            await application.shutdown()

    async def test_updates_do_not_block_each_other(
        self, app: Application, make_update: MakeUpdate
    ) -> None:
        entered: list[int] = []
        gates: dict[int, asyncio.Event] = {}

        async def gated(update: Update, context: CallbackContext) -> None:
            entered.append(update.update_id)
            gate = asyncio.Event()
            gates[update.update_id] = gate
            await gate.wait()

        app.add_handler(MessageHandler(filters.TEXT, gated))
        first = asyncio.create_task(app.process_update(text_update(make_update, 1, "a")))
        second = asyncio.create_task(app.process_update(text_update(make_update, 2, "b")))

        await wait_for(lambda: len(entered) == 2)  # both ran without blocking each other
        assert set(entered) == {1, 2}

        for gate in gates.values():
            gate.set()
        await asyncio.gather(first, second)
