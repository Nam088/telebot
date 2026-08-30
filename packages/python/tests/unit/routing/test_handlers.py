"""Unit tests for routing handlers (T014)."""

from __future__ import annotations

import re
from typing import Any

import pytest

from telebot_py.filters import TEXT, ChatType, Regex
from telebot_py.routing import CallbackQueryHandler, CommandHandler, MessageHandler
from telebot_py.routing.handlers import BaseHandler
from telebot_py.types import CallbackQuery, Chat, Message, Update, User


class StubContext:
    """Minimal context stub standing in for the kernel's CallbackContext."""

    def __init__(self) -> None:
        self.args: list[str] | None = None
        self.matches: list[Any] | None = None


def _user() -> User:
    return User(id=42, is_bot=False, first_name="Alice")


def message_update(text: str) -> Update:
    """Build an Update carrying a private-chat text message."""
    return Update(
        update_id=1,
        message=Message(
            message_id=1,
            date=1_700_000_000,
            chat=Chat(id=100, type="private"),
            from_user=_user(),
            text=text,
        ),
    )


def callback_query_update(data: str | None) -> Update:
    """Build an Update carrying a callback query."""
    return Update(
        update_id=1,
        callback_query=CallbackQuery(
            id="cb1",
            from_user=_user(),
            chat_instance="ci-1",
            data=data,
        ),
    )


async def ok_callback(update: Update, context: Any) -> None:
    return None


class TestCommandHandlerConstruction:
    def test_empty_string_raises(self) -> None:
        with pytest.raises(ValueError, match="command"):
            CommandHandler("", ok_callback)

    def test_blank_string_raises(self) -> None:
        with pytest.raises(ValueError, match="command"):
            CommandHandler("   ", ok_callback)

    def test_empty_list_raises(self) -> None:
        with pytest.raises(ValueError, match="command"):
            CommandHandler([], ok_callback)

    def test_list_with_empty_entry_raises(self) -> None:
        with pytest.raises(ValueError, match="command"):
            CommandHandler(["start", ""], ok_callback)

    def test_accepts_command_with_and_without_leading_slash(self) -> None:
        handler = CommandHandler(["start", "/help"], ok_callback)
        assert handler.check_update(message_update("/start")) is not None
        assert handler.check_update(message_update("/help")) is not None


class TestCommandHandlerCheckUpdate:
    def test_matches_plain_command(self) -> None:
        assert (
            CommandHandler("start", ok_callback).check_update(message_update("/start")) is not None
        )

    def test_command_parsing_strips_leading_slash(self) -> None:
        handler = CommandHandler("/start", ok_callback)
        assert handler.check_update(message_update("/start")) is not None

    def test_returns_split_args(self) -> None:
        result = CommandHandler("start", ok_callback).check_update(
            message_update("/start arg1 arg2")
        )
        assert result == ["arg1", "arg2"]

    def test_no_args_returns_empty_list(self) -> None:
        result = CommandHandler("start", ok_callback).check_update(message_update("/start"))
        assert result == []

    def test_bot_mention_suffix_is_stripped(self) -> None:
        assert (
            CommandHandler("start", ok_callback).check_update(message_update("/start@AnyBot"))
            is not None
        )
        assert CommandHandler("start", ok_callback).check_update(
            message_update("/start@AnyBot go now")
        ) == ["go", "now"]

    def test_command_matching_is_case_insensitive(self) -> None:
        assert (
            CommandHandler("Start", ok_callback).check_update(message_update("/START")) is not None
        )

    def test_non_matching_command_rejected(self) -> None:
        assert not CommandHandler("start", ok_callback).check_update(message_update("/help"))

    def test_plain_text_rejected(self) -> None:
        assert not CommandHandler("start", ok_callback).check_update(message_update("hello"))

    def test_leading_whitespace_rejected(self) -> None:
        assert not CommandHandler("start", ok_callback).check_update(message_update(" /start"))

    def test_update_without_message_rejected(self) -> None:
        assert not CommandHandler("start", ok_callback).check_update(callback_query_update("data"))

    def test_non_update_object_rejected(self) -> None:
        assert not CommandHandler("start", ok_callback).check_update(object())

    def test_optional_filter_gates_match(self) -> None:
        in_private = CommandHandler("start", ok_callback, filters=ChatType.PRIVATE)
        in_channel = CommandHandler("start", ok_callback, filters=ChatType.CHANNEL)
        assert in_private.check_update(message_update("/start")) is not None
        assert in_channel.check_update(message_update("/start")) is None


class TestCommandHandlerContext:
    def test_collect_additional_context_sets_args(self) -> None:
        handler = CommandHandler("start", ok_callback)
        update = message_update("/start a b")
        check_result = handler.check_update(update)
        context = StubContext()
        handler.collect_additional_context(context, update, check_result)
        assert context.args == ["a", "b"]

    def test_collect_additional_context_ignores_falsy_result(self) -> None:
        handler = CommandHandler("start", ok_callback)
        update = message_update("/start a b")
        context = StubContext()
        handler.collect_additional_context(context, update, None)
        assert context.args is None


class TestMessageHandler:
    def test_filter_pass_returns_match(self) -> None:
        handler = MessageHandler(TEXT, ok_callback)
        assert handler.check_update(message_update("hello"))

    def test_filter_reject_returns_falsy(self) -> None:
        handler = MessageHandler(TEXT, ok_callback)
        assert not handler.check_update(callback_query_update("data"))

    def test_filter_gating_on_message_content(self) -> None:
        handler = MessageHandler(filters=ChatType.CHANNEL, callback=ok_callback)
        assert not handler.check_update(message_update("hello"))

    def test_update_without_message_rejected(self) -> None:
        assert not MessageHandler(TEXT, ok_callback).check_update(callback_query_update("x"))

    def test_non_update_object_rejected(self) -> None:
        assert not MessageHandler(TEXT, ok_callback).check_update(object())

    def test_data_filter_result_is_check_result(self) -> None:
        handler = MessageHandler(Regex(r"^hi (\w+)$"), ok_callback)
        result = handler.check_update(message_update("hi bob"))
        assert result
        assert result["matches"][0].group(1) == "bob"

    def test_collect_additional_context_merges_data_filter_result(self) -> None:
        handler = MessageHandler(Regex(r"^hi (\w+)$"), ok_callback)
        update = message_update("hi bob")
        context = StubContext()
        handler.collect_additional_context(context, update, handler.check_update(update))
        assert context.matches
        assert context.matches[0].group(1) == "bob"


class TestCallbackQueryHandler:
    def test_no_pattern_matches_any_query(self) -> None:
        assert CallbackQueryHandler(None, ok_callback).check_update(
            callback_query_update("anything")
        )

    def test_string_pattern_fullmatch(self) -> None:
        handler = CallbackQueryHandler("yes", ok_callback)
        assert handler.check_update(callback_query_update("yes"))
        assert not handler.check_update(callback_query_update("yes please"))

    def test_regex_pattern_matches(self) -> None:
        handler = CallbackQueryHandler(re.compile(r"^btn_(\d+)$"), ok_callback)
        assert handler.check_update(callback_query_update("btn_42"))
        assert not handler.check_update(callback_query_update("nope"))

    def test_callable_pattern(self) -> None:
        handler = CallbackQueryHandler(lambda data: data.startswith("x_"), ok_callback)
        assert handler.check_update(callback_query_update("x_1"))
        assert not handler.check_update(callback_query_update("y_1"))

    def test_none_data_rejected_by_patterns(self) -> None:
        assert not CallbackQueryHandler("yes", ok_callback).check_update(
            callback_query_update(None)
        )

    def test_none_data_matches_patternless_handler(self) -> None:
        assert CallbackQueryHandler(None, ok_callback).check_update(callback_query_update(None))

    def test_message_update_rejected(self) -> None:
        assert not CallbackQueryHandler(None, ok_callback).check_update(message_update("/start"))

    def test_collect_additional_context_sets_matches(self) -> None:
        handler = CallbackQueryHandler(re.compile(r"^btn_(\d+)$"), ok_callback)
        update = callback_query_update("btn_42")
        context = StubContext()
        handler.collect_additional_context(context, update, handler.check_update(update))
        assert context.matches
        assert context.matches[0].group(1) == "42"


class TestBaseHandlerContract:
    def test_stores_callback_and_block_flag(self) -> None:
        handler = CommandHandler("start", ok_callback)
        assert handler.callback is ok_callback
        assert handler.block is True
        assert isinstance(handler, BaseHandler)

    async def test_handle_update_collects_context_then_awaits_callback(self) -> None:
        seen: list[tuple[Update, Any]] = []

        async def record(update: Update, context: Any) -> None:
            seen.append((update, context))

        handler = CommandHandler("start", record)
        update = message_update("/start go")
        context = StubContext()
        await handler.handle_update(update, context, handler.check_update(update))
        assert seen == [(update, context)]
        assert context.args == ["go"]

    async def test_handle_update_supports_sync_callbacks(self) -> None:
        def record(update: Update, context: Any) -> str:
            return "done"

        handler = MessageHandler(TEXT, record)
        update = message_update("hello")
        context = StubContext()
        result = await handler.handle_update(update, context, handler.check_update(update))
        assert result == "done"
