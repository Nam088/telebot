"""Unit tests for AsyncConversationHandler (T026).

The async form mirrors packages/node/src/routing/async-conversation/: a
registered ``async def`` flow receives a controller exposing ``wait`` /
``wait_for_message`` / ``wait_for_callback_query`` / ``ask`` / ``exit``,
suspends at each wait, and is resumed by the next routed update.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable
from typing import Any

import pytest

from telebot_py import CommandHandler, filters
from telebot_py.routing.async_conversation import (
    AsyncConversation,
    AsyncConversationHandler,
    AsyncConversationManager,
    ConversationContextHelper,
    ConversationExitSignal,
    ConversationTimeoutError,
)
from telebot_py.types import Update

MakeUpdate = Callable[..., dict[str, Any]]


class FakeBot:
    """Duck-typed Bot recording send_message calls instead of doing HTTP."""

    def __init__(self) -> None:
        self.sent: list[tuple[int | str, str]] = []

    async def send_message(self, chat_id: int | str, text: str, **kwargs: Any) -> None:
        self.sent.append((chat_id, text))


class StubContext:
    """Minimal duck-typed CallbackContext carrying the fake bot and update."""

    def __init__(self, update: Update | None = None, bot: FakeBot | None = None) -> None:
        self.application: Any = None
        self.bot: Any = bot or FakeBot()
        self.update: Any = update
        self.args: list[str] | None = None
        self.matches: Any = None
        self.user_data: dict[Any, Any] = {}
        self.chat_data: dict[Any, Any] = {}
        self.bot_data: dict[Any, Any] = {}
        self.error: Exception | None = None


def text_update(make_update: MakeUpdate, update_id: int, text: str, *, user_id: int = 42) -> Update:
    """Build a typed text-message update for the given user."""
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


def callback_query_update(
    make_update: MakeUpdate, update_id: int, data: str, *, user_id: int = 42
) -> Update:
    """Build a typed callback-query update for a message in chat 100."""
    return Update.from_dict(
        make_update(
            update_id,
            message=None,
            callback_query={
                "id": f"cb-{update_id}",
                "from": {"id": user_id, "is_bot": False, "first_name": "Alice"},
                "message": {
                    "message_id": 500,
                    "date": 1_700_000_000,
                    "chat": {"id": 100, "type": "private"},
                },
                "chat_instance": "ci-1",
                "data": data,
            },
        )
    )


async def wait_for(predicate: Callable[[], bool], timeout: float = 2.0) -> None:
    """Poll ``predicate`` until true, failing the test on timeout."""
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    while not predicate():
        if loop.time() > deadline:
            msg = "timed out waiting for condition"
            raise AssertionError(msg)
        await asyncio.sleep(0.001)


async def run(handler: AsyncConversationHandler, update: Update, context: StubContext) -> None:
    """Assert the update matches and dispatch it through the handler."""
    check = handler.check_update(update)
    assert check is not None and check is not False
    await handler.handle_update(update, context, check)


def build_profile_handler(events: list[str], bot: FakeBot) -> AsyncConversationHandler:
    """Ask name then age, then summarize — the canonical ask/wait flow."""

    async def profile(conv: AsyncConversation, context: Any) -> None:
        name = await conv.ask("What is your name?")
        age = await conv.ask(f"Hi {name}, how old are you?")
        await context.bot.send_message(chat_id=100, text=f"Saved {name}, {age}.")
        events.append("done")

    return AsyncConversationHandler(profile, entry_command="profile", name="profile")


class TestAskWaitFlow:
    async def test_full_ask_wait_flow(self, make_update: MakeUpdate) -> None:
        events: list[str] = []
        bot = FakeBot()
        handler = build_profile_handler(events, bot)

        await run(handler, text_update(make_update, 1, "/profile"), StubContext(bot=bot))
        await wait_for(lambda: len(bot.sent) == 1)
        assert bot.sent == [(100, "What is your name?")]

        await run(handler, text_update(make_update, 2, "Alice"), StubContext(bot=bot))
        await wait_for(lambda: len(bot.sent) == 2)
        assert bot.sent[1] == (100, "Hi Alice, how old are you?")

        await run(handler, text_update(make_update, 3, "30"), StubContext(bot=bot))
        await wait_for(lambda: "done" in events)
        assert bot.sent[2] == (100, "Saved Alice, 30.")

        # Session finished: further text is not consumed.
        assert handler.check_update(text_update(make_update, 4, "more")) is False

    async def test_entry_points_form(self, make_update: MakeUpdate) -> None:
        events: list[str] = []

        async def flow(conv: AsyncConversation, context: Any) -> None:
            update = await conv.wait()
            message = update.effective_message
            events.append(message.text if message is not None else None)

        handler = AsyncConversationHandler(
            flow, entry_points=[CommandHandler("go", lambda u, c: None)], name="flow"
        )
        bot = FakeBot()
        await run(handler, text_update(make_update, 1, "/go"), StubContext(bot=bot))
        await run(handler, text_update(make_update, 2, "answer"), StubContext(bot=bot))
        await wait_for(lambda: events == ["answer"])


class TestExit:
    async def test_exit_ends_the_flow(self, make_update: MakeUpdate) -> None:
        events: list[str] = []
        bot = FakeBot()

        async def flow(conv: AsyncConversation, context: Any) -> None:
            await conv.ask("Continue?")
            conv.exit()
            events.append("unreachable")

        handler = AsyncConversationHandler(flow, entry_command="flow", name="flow")
        await run(handler, text_update(make_update, 1, "/flow"), StubContext(bot=bot))
        await run(handler, text_update(make_update, 2, "yes"), StubContext(bot=bot))
        await wait_for(lambda: not handler.manager.has_active_session(42, 100))

        assert events == []  # code after exit() never runs
        assert handler.check_update(text_update(make_update, 3, "more")) is False

    async def test_exit_signal_is_distinct_from_timeout(self) -> None:
        assert not issubclass(ConversationExitSignal, ConversationTimeoutError)


class TestTimeout:
    async def test_wait_timeout_raises_conversation_timeout_error(
        self, make_update: MakeUpdate
    ) -> None:
        events: list[str] = []
        bot = FakeBot()

        async def flow(conv: AsyncConversation, context: Any) -> None:
            try:
                await conv.wait(timeout=0.01)
            except ConversationTimeoutError:
                events.append("timeout")

        handler = AsyncConversationHandler(flow, entry_command="flow", name="flow")
        await run(handler, text_update(make_update, 1, "/flow"), StubContext(bot=bot))
        await wait_for(lambda: events == ["timeout"])
        assert handler.check_update(text_update(make_update, 2, "late")) is False

    async def test_handler_level_default_timeout(self, make_update: MakeUpdate) -> None:
        events: list[str] = []
        bot = FakeBot()

        async def flow(conv: AsyncConversation, context: Any) -> None:
            try:
                await conv.wait()  # no explicit timeout; handler default applies
            except ConversationTimeoutError:
                events.append("timeout")

        handler = AsyncConversationHandler(flow, entry_command="flow", name="flow", timeout=0.01)
        await run(handler, text_update(make_update, 1, "/flow"), StubContext(bot=bot))
        await wait_for(lambda: events == ["timeout"])


class TestWaitVariants:
    async def test_wait_for_callback_query_pattern(self, make_update: MakeUpdate) -> None:
        events: list[str] = []
        bot = FakeBot()

        async def flow(conv: AsyncConversation, context: Any) -> None:
            query = await conv.wait_for_callback_query(pattern="yes")
            events.append(query.data)

        handler = AsyncConversationHandler(flow, entry_command="flow", name="flow")
        await run(handler, text_update(make_update, 1, "/flow"), StubContext(bot=bot))

        # Non-matching callback data is not consumed.
        assert handler.check_update(callback_query_update(make_update, 2, "no")) is False
        await run(handler, callback_query_update(make_update, 3, "yes"), StubContext(bot=bot))
        await wait_for(lambda: events == ["yes"])

    async def test_wait_for_message_with_filter(self, make_update: MakeUpdate) -> None:
        events: list[str] = []
        bot = FakeBot()

        async def flow(conv: AsyncConversation, context: Any) -> None:
            message = await conv.wait_for_message(filter=filters.Regex(r"^\d+$"))
            events.append(message.text or "")

        handler = AsyncConversationHandler(flow, entry_command="flow", name="flow")
        await run(handler, text_update(make_update, 1, "/flow"), StubContext(bot=bot))

        assert handler.check_update(text_update(make_update, 2, "not digits")) is False
        await run(handler, text_update(make_update, 3, "42"), StubContext(bot=bot))
        await wait_for(lambda: events == ["42"])


class TestManager:
    async def test_enter_unknown_conversation_raises(self) -> None:
        manager = AsyncConversationManager()
        with pytest.raises(ValueError, match="not registered"):
            await manager.enter("missing", StubContext())

    def test_register_requires_non_empty_name(self) -> None:
        manager = AsyncConversationManager()

        async def flow(conv: AsyncConversation, context: Any) -> None:
            pass

        with pytest.raises(ValueError, match="name"):
            manager.register("   ", flow)

    async def test_sessions_are_isolated_per_user(self, make_update: MakeUpdate) -> None:
        bot = FakeBot()

        async def flow(conv: AsyncConversation, context: Any) -> None:
            await conv.ask(f"Hello {conv.user_id}")

        handler = AsyncConversationHandler(flow, entry_command="flow", name="flow")
        await run(
            handler,
            text_update(make_update, 1, "/flow", user_id=42),
            StubContext(update=text_update(make_update, 1, "/flow", user_id=42), bot=bot),
        )
        await wait_for(lambda: handler.manager.has_active_session(42, 100))

        # User 77's text is not consumed by user 42's pending wait...
        assert handler.check_update(text_update(make_update, 2, "hi", user_id=77)) is False
        # ...and user 77 can start their own session via the entry command.
        entry77 = text_update(make_update, 3, "/flow", user_id=77)
        assert handler.check_update(entry77) is True
        await run(handler, entry77, StubContext(update=entry77, bot=bot))
        await wait_for(lambda: len(bot.sent) == 2)
        assert handler.manager.has_active_session(42, 100)
        assert handler.manager.has_active_session(77, 100)

    async def test_flow_exceptions_propagate_and_clear_session(
        self, make_update: MakeUpdate
    ) -> None:
        bot = FakeBot()

        async def flow(conv: AsyncConversation, context: Any) -> None:
            raise RuntimeError("flow exploded")

        handler = AsyncConversationHandler(flow, entry_command="flow", name="flow")
        update = text_update(make_update, 1, "/flow")
        assert handler.check_update(update) is True
        with pytest.raises(RuntimeError, match="exploded"):
            await handler.handle_update(update, StubContext(bot=bot))
        assert handler.manager.has_active_session(42, 100) is False


class TestContextHelper:
    async def test_helper_enters_registered_conversation(self, make_update: MakeUpdate) -> None:
        bot = FakeBot()
        events: list[str] = []

        async def flow(conv: AsyncConversation, context: Any) -> None:
            await conv.ask("Started via helper")
            events.append("waiting")
            await conv.wait()

        manager = AsyncConversationManager()
        manager.register("helper-flow", flow)

        update = text_update(make_update, 1, "anything")
        context = StubContext(update=update, bot=bot)
        helper = ConversationContextHelper(context, manager)

        assert helper.active is False
        await helper.enter("helper-flow")
        # The flow sent its prompt and suspended at the ask's wait.
        assert bot.sent == [(100, "Started via helper")]
        assert helper.active is True

        await manager.handle_update(text_update(make_update, 2, "the answer"))
        await wait_for(lambda: events == ["waiting"])
        assert helper.active is True
