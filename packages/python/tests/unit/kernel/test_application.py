"""Unit tests for ApplicationBuilder validation and the Application lifecycle (T021)."""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from typing import Any

import httpx
import pytest

from telebot_py import Application, ApplicationBuilder, CallbackContext, MessageHandler, filters
from telebot_py.bot.errors import ApplicationError, InvalidTokenError
from telebot_py.kernel.lifecycle import ApplicationState
from telebot_py.types import Update

ME_PAYLOAD = {"id": 999, "is_bot": True, "first_name": "EchoBot", "username": "echo_bot"}


def build_app(
    bot_transport: Any,
    ok_response: Any,
    *,
    steps: list[Any] | None = None,
    me: Any = None,
) -> Application:
    """Build an app whose transport first answers getMe, then serves ``steps``."""
    me_step = me if me is not None else ok_response(ME_PAYLOAD)
    return (
        ApplicationBuilder()
        .token("123456:TEST")
        .transport(bot_transport(me_step, *(steps or [])))
        .build()
    )


class TestBuilderValidation:
    def test_build_without_token_raises(self) -> None:
        with pytest.raises(ValueError, match="token"):
            ApplicationBuilder().build()

    def test_build_with_empty_token_raises(self) -> None:
        with pytest.raises(ValueError, match="token"):
            ApplicationBuilder().token("").build()

    def test_setting_token_twice_raises(self) -> None:
        builder = ApplicationBuilder().token("123:ABC")
        with pytest.raises(ValueError, match="token"):
            builder.token("456:DEF")

    def test_invalid_concurrent_updates_raises(self) -> None:
        with pytest.raises(ValueError, match="concurrent_updates"):
            ApplicationBuilder().concurrent_updates(0)

    def test_fluent_methods_return_the_builder(self) -> None:
        builder = ApplicationBuilder()
        assert builder.token("123:ABC") is builder
        assert (
            builder.transport(httpx.MockTransport(lambda request: httpx.Response(200))) is builder
        )
        assert builder.post_init(lambda app: None) is builder  # type: ignore[arg-type]
        assert builder.post_shutdown(lambda app: None) is builder  # type: ignore[arg-type]
        assert builder.concurrent_updates(8) is builder
        assert builder.sleep(asyncio.sleep) is builder

    def test_build_wires_token_and_transport(self, bot_transport: Any, ok_response: Any) -> None:
        transport = bot_transport(ok_response(ME_PAYLOAD))
        app = ApplicationBuilder().token("123:ABC").transport(transport).build()
        assert app.bot.token == "123:ABC"
        assert app.state is ApplicationState.STOPPED
        assert app.job_queue is None

    def test_application_builder_classmethod(self) -> None:
        builder = Application.builder()
        assert isinstance(builder, ApplicationBuilder)


class TestLifecycleStateMachine:
    async def test_happy_path_transitions(self, bot_transport: Any, ok_response: Any) -> None:
        app = build_app(bot_transport, ok_response)
        assert app.state is ApplicationState.STOPPED

        await app.initialize()
        assert app.state is ApplicationState.INITIALIZING

        await app.start()
        assert app.state is ApplicationState.RUNNING

        await app.stop()
        assert app.state is ApplicationState.STOPPED

        await app.shutdown()
        assert app.state is ApplicationState.STOPPED
        assert app.bot._client.is_closed

    async def test_initialize_surfaces_invalid_token(
        self, bot_transport: Any, ok_response: Any, error_response: Any
    ) -> None:
        app = build_app(bot_transport, ok_response, me=error_response(401, 401, "Unauthorized"))
        with pytest.raises(InvalidTokenError):
            await app.initialize()
        assert app.state is ApplicationState.STOPPED

    async def test_double_initialize_raises(self, bot_transport: Any, ok_response: Any) -> None:
        app = build_app(bot_transport, ok_response)
        await app.initialize()
        with pytest.raises(ApplicationError, match="initialize"):
            await app.initialize()

    async def test_start_before_initialize_raises(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        app = build_app(bot_transport, ok_response)
        with pytest.raises(ApplicationError, match="initialize"):
            await app.start()

    async def test_stop_before_start_raises(self, bot_transport: Any, ok_response: Any) -> None:
        app = build_app(bot_transport, ok_response)
        with pytest.raises(ApplicationError):
            await app.stop()

    async def test_shutdown_requires_stop_first(self, bot_transport: Any, ok_response: Any) -> None:
        app = build_app(bot_transport, ok_response)
        await app.initialize()
        with pytest.raises(ApplicationError, match="stop"):
            await app.shutdown()

    async def test_shutdown_without_initialize_raises(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        app = build_app(bot_transport, ok_response)
        with pytest.raises(ApplicationError, match="initialize"):
            await app.shutdown()

    async def test_double_shutdown_raises(self, bot_transport: Any, ok_response: Any) -> None:
        app = build_app(bot_transport, ok_response)
        await app.initialize()
        await app.start()
        await app.stop()
        await app.shutdown()
        with pytest.raises(ApplicationError, match="shut down"):
            await app.shutdown()

    async def test_process_update_requires_running_state(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        app = build_app(bot_transport, ok_response)
        update = Update.from_dict(
            {
                "update_id": 1,
                "message": {
                    "message_id": 1,
                    "date": 1_700_000_000,
                    "chat": {"id": 100, "type": "private"},
                    "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
                    "text": "hi",
                },
            }
        )
        with pytest.raises(ApplicationError, match="process"):
            await app.process_update(update)

    async def test_post_init_runs_during_initialize_and_post_shutdown_during_shutdown(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        hooks: list[str] = []

        async def post_init(app: Application) -> None:
            hooks.append("init")

        async def post_shutdown(app: Application) -> None:
            hooks.append("shutdown")

        app = (
            ApplicationBuilder()
            .token("123456:TEST")
            .transport(bot_transport(ok_response(ME_PAYLOAD)))
            .post_init(post_init)
            .post_shutdown(post_shutdown)
            .build()
        )
        await app.initialize()
        assert hooks == ["init"]
        await app.start()
        await app.stop()
        await app.shutdown()
        assert hooks == ["init", "shutdown"]


class TestRunModeGuards:
    async def test_run_polling_rejects_non_stopped_state(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        app = build_app(bot_transport, ok_response)
        await app.initialize()
        await app.start()
        with pytest.raises(ApplicationError):
            app.run_polling()

    async def test_run_webhook_rejects_running_event_loop(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        app = build_app(bot_transport, ok_response)
        with pytest.raises(ApplicationError, match="event loop"):
            app.run_webhook()

    async def test_second_run_mode_is_rejected(self, scripted_run: Any) -> None:
        app = await scripted_run()
        with pytest.raises(ApplicationError):
            app.run_polling()
        with pytest.raises(ApplicationError):
            app.run_webhook()


@pytest.fixture()
async def scripted_run(bot_transport: Any, ok_response: Any) -> Callable[[], Any]:
    """Runs one full polling cycle against a single update, returning the app."""

    async def run() -> Application:
        update = {
            "update_id": 1,
            "message": {
                "message_id": 1,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "private"},
                "from": {"id": 42, "is_bot": False, "first_name": "Alice"},
                "text": "hi",
            },
        }
        app = build_app(
            bot_transport,
            ok_response,
            steps=[ok_response([update]), ok_response([])],
        )
        task = asyncio.create_task(app._run_polling(timeout=0, stop_signals=()))
        deadline = asyncio.get_running_loop().time() + 2.0
        while app.state is not ApplicationState.RUNNING:
            if asyncio.get_running_loop().time() > deadline:
                msg = "app never reached RUNNING"
                raise AssertionError(msg)
            await asyncio.sleep(0.001)
        await asyncio.sleep(0.01)
        await app.stop()
        await task
        return app

    return run


class TestHandlerRegistration:
    def test_add_handler_delegates_to_dispatcher(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        app = build_app(bot_transport, ok_response)

        def noop(update: Update, context: CallbackContext) -> None:
            pass

        handler = MessageHandler(filters.TEXT, noop)
        app.add_handler(handler, group=2)
        assert handler in app.dispatcher.handlers[2]

        app.remove_handler(handler, group=2)
        assert handler not in app.dispatcher.handlers.get(2, [])

    def test_add_error_handler_delegates_to_dispatcher(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        app = build_app(bot_transport, ok_response)

        async def on_error(update: object, context: CallbackContext) -> None:
            pass

        app.add_error_handler(on_error)
        assert on_error in app.dispatcher.error_handlers

    def test_remove_missing_handler_raises(self, bot_transport: Any, ok_response: Any) -> None:
        app = build_app(bot_transport, ok_response)

        def noop(update: Update, context: CallbackContext) -> None:
            pass

        with pytest.raises(ValueError):
            app.remove_handler(MessageHandler(filters.TEXT, noop))
