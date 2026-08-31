"""Unit tests for the core Bot method surface via MockTransport (T016, US1)."""

from __future__ import annotations

import json
from collections.abc import Callable
from typing import Any

import httpx
import pytest

from telebot_py.bot import Bot
from telebot_py.bot.errors import InvalidTokenError, TelegramApiError
from telebot_py.types import (
    AcceptedGiftTypes,
    ChatFullInfo,
    ChatMember,
    ChatPhoto,
    Community,
    Message,
    MessageId,
    ReplyParameters,
    Update,
    User,
    UserRating,
    WebhookInfo,
)
from telebot_py.types.common import MessageEntity

TEST_TOKEN = "123456:TEST"

ResponseFactory = Callable[..., httpx.Response]


def make_bot(bot_transport: Any, *steps: Any) -> Bot:
    return Bot(TEST_TOKEN, transport=bot_transport(*steps))


def record_into(
    response: httpx.Response, seen: list[httpx.Request]
) -> Callable[[httpx.Request], httpx.Response]:
    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return response

    return handler


def sent_payload(request: httpx.Request) -> dict[str, Any]:
    payload: dict[str, Any] = json.loads(request.content)
    return payload


class Keyboard:
    """Minimal reply-markup stand-in exposing ``to_dict`` like typed objects."""

    def __init__(self, data: dict[str, Any]) -> None:
        self._data = data

    def to_dict(self) -> dict[str, object]:
        return dict(self._data)


class TestSendMessage:
    async def test_returns_message(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7, text="hi there")), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_message(100, "hi there")
        assert isinstance(message, Message)
        assert message.message_id == 7
        assert message.text == "hi there"
        assert message.chat.id == 100
        assert message.chat.type == "private"
        assert message.from_user is not None
        assert message.from_user.id == 42
        assert seen[0].url.path == f"/bot{TEST_TOKEN}/sendMessage"

    async def test_minimal_payload_omits_unset_optionals(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_message(100, "hello")
        assert sent_payload(seen[0]) == {"chat_id": 100, "text": "hello"}

    async def test_serializes_optional_kwargs_with_snake_case_keys(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        markup = {"inline_keyboard": [[{"text": "Go", "url": "https://example.com"}]]}
        await bot.send_message(
            -100_500,
            "hello",
            parse_mode="Markdown",
            disable_notification=True,
            protect_content=False,
            reply_parameters={"message_id": 5, "allow_sending_without_reply": True},
            reply_markup=markup,
        )
        assert sent_payload(seen[0]) == {
            "chat_id": -100_500,
            "text": "hello",
            "parse_mode": "Markdown",
            "disable_notification": True,
            "protect_content": False,
            "reply_parameters": {"message_id": 5, "allow_sending_without_reply": True},
            "reply_markup": markup,
        }

    async def test_reply_markup_accepts_to_dict_objects(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        markup = Keyboard({"inline_keyboard": [[{"text": "Ok", "callback_data": "ok"}]]})
        await bot.send_message(100, "pick", reply_markup=markup)
        assert sent_payload(seen[0])["reply_markup"] == markup.to_dict()

    async def test_accepts_string_chat_id(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_message("@mychannel", "broadcast")
        assert sent_payload(seen[0])["chat_id"] == "@mychannel"


class TestGetMe:
    async def test_returns_user(
        self, bot_transport: Any, ok_response: ResponseFactory, make_user: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(
            ok_response(make_user(id=42, is_bot=True, first_name="EchoBot", username="echo_bot")),
            seen,
        )
        bot = make_bot(bot_transport, step)
        me = await bot.get_me()
        assert isinstance(me, User)
        assert me.id == 42
        assert me.is_bot is True
        assert me.first_name == "EchoBot"
        assert me.username == "echo_bot"
        assert seen[0].url.path == f"/bot{TEST_TOKEN}/getMe"

    async def test_401_on_startup_check_raises_invalid_token(
        self, bot_transport: Any, error_response: ResponseFactory
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(error_response(401, 401, "Unauthorized"), seen)
        bot = make_bot(bot_transport, step)
        with pytest.raises(InvalidTokenError) as excinfo:
            await bot.get_me()
        assert isinstance(excinfo.value, TelegramApiError)
        assert excinfo.value.error_code == 401
        assert excinfo.value.description == "Unauthorized"
        assert excinfo.value.method == "getMe"
        assert len(seen) == 1


class TestGetUpdates:
    async def test_parses_update_list(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_update: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response([make_update(1), make_update(2)]), seen)
        bot = make_bot(bot_transport, step)
        updates = await bot.get_updates()
        assert all(isinstance(update, Update) for update in updates)
        assert [update.update_id for update in updates] == [1, 2]
        assert updates[0].message is not None
        assert updates[0].message.text == "hello world"
        assert updates[0].effective_user is not None
        assert updates[0].effective_user.id == 42
        assert seen[0].url.path == f"/bot{TEST_TOKEN}/getUpdates"
        assert sent_payload(seen[0]) == {}

    async def test_serializes_polling_options(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response([]), seen)
        bot = make_bot(bot_transport, step)
        updates = await bot.get_updates(
            offset=5,
            limit=100,
            timeout=30,
            allowed_updates=["message", "callback_query"],
        )
        assert updates == []
        assert sent_payload(seen[0]) == {
            "offset": 5,
            "limit": 100,
            "timeout": 30,
            "allowed_updates": ["message", "callback_query"],
        }


class TestErrorMapping:
    async def test_error_envelope_raises_typed_error(
        self, bot_transport: Any, error_response: ResponseFactory
    ) -> None:
        bot = make_bot(bot_transport, error_response(400, 400, "Bad Request: chat not found"))
        with pytest.raises(TelegramApiError) as excinfo:
            await bot.send_message(999, "nope")
        assert excinfo.value.error_code == 400
        assert excinfo.value.description == "Bad Request: chat not found"
        assert excinfo.value.method == "sendMessage"


class TestMessagesSurface:
    async def test_send_chat_action(self, bot_transport: Any, ok_response: ResponseFactory) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.send_chat_action(100, "typing") is True
        assert seen[0].url.path == f"/bot{TEST_TOKEN}/sendChatAction"
        assert sent_payload(seen[0]) == {"chat_id": 100, "action": "typing"}

    async def test_forward_message(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=9)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.forward_message(200, 100, 9, disable_notification=True)
        assert isinstance(message, Message)
        assert message.message_id == 9
        assert sent_payload(seen[0]) == {
            "chat_id": 200,
            "from_chat_id": 100,
            "message_id": 9,
            "disable_notification": True,
        }

    async def test_copy_message_returns_message_id(
        self, bot_transport: Any, ok_response: ResponseFactory
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response({"message_id": 11}), seen)
        bot = make_bot(bot_transport, step)
        copied = await bot.copy_message(200, 100, 9, caption="copy")
        assert isinstance(copied, MessageId)
        assert copied.message_id == 11
        assert sent_payload(seen[0]) == {
            "chat_id": 200,
            "from_chat_id": 100,
            "message_id": 9,
            "caption": "copy",
        }

    async def test_send_photo(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_photo(100, "https://example.com/cat.jpg", caption="Cute cat!")
        assert isinstance(message, Message)
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "photo": "https://example.com/cat.jpg",
            "caption": "Cute cat!",
        }

    async def test_send_document(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(text=None)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.send_document(100, "https://example.com/report.pdf")
        assert isinstance(message, Message)
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "document": "https://example.com/report.pdf",
        }

    async def test_answer_callback_query_minimal(
        self, bot_transport: Any, ok_response: ResponseFactory
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.answer_callback_query("cb_1") is True
        assert seen[0].url.path == f"/bot{TEST_TOKEN}/answerCallbackQuery"
        assert sent_payload(seen[0]) == {"callback_query_id": "cb_1"}

    async def test_answer_callback_query_serializes_options(
        self, bot_transport: Any, ok_response: ResponseFactory
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.answer_callback_query(
            "cb_1",
            text="Saved!",
            show_alert=True,
            url="https://t.me/Bot?start=123",
            cache_time=60,
        )
        assert sent_payload(seen[0]) == {
            "callback_query_id": "cb_1",
            "text": "Saved!",
            "show_alert": True,
            "url": "https://t.me/Bot?start=123",
            "cache_time": 60,
        }


class TestChatsSurface:
    async def test_get_chat_returns_chat_full_info(
        self, bot_transport: Any, ok_response: ResponseFactory
    ) -> None:
        seen: list[httpx.Request] = []
        payload = {
            "id": -100_500,
            "type": "supergroup",
            "title": "devs",
            "accent_color_id": 3,
            "max_reaction_count": 3,
            "accepted_gift_types": {
                "unlimited_gifts": True,
                "limited_gifts": False,
                "unique_gifts": False,
                "premium_subscription": False,
                "gifts_from_channels": False,
            },
            "photo": {
                "small_file_id": "ps",
                "small_file_unique_id": "psu",
                "big_file_id": "pb",
                "big_file_unique_id": "pbu",
            },
            "bio": "Engineer",
            "rating": {"level": 4, "rating": 120, "current_level_rating": 100},
            "community": {"id": 77, "name": "Telebot"},
            "guard_bot": {"id": 9, "is_bot": True, "first_name": "Guard"},
        }
        step = record_into(ok_response(payload), seen)
        bot = make_bot(bot_transport, step)
        chat = await bot.get_chat(-100_500)
        assert isinstance(chat, ChatFullInfo)
        assert chat.id == -100_500
        assert chat.type == "supergroup"
        assert chat.title == "devs"
        assert chat.max_reaction_count == 3
        assert chat.bio == "Engineer"
        assert isinstance(chat.photo, ChatPhoto)
        assert isinstance(chat.accepted_gift_types, AcceptedGiftTypes)
        assert isinstance(chat.rating, UserRating)
        assert chat.rating.next_level_rating is None
        assert isinstance(chat.community, Community)
        assert isinstance(chat.guard_bot, User)
        assert sent_payload(seen[0]) == {"chat_id": -100_500}

    async def test_get_chat_administrators(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_user: Any,
    ) -> None:
        step = record_into(ok_response([{"status": "creator", "user": make_user(id=1)}]), [])
        bot = make_bot(bot_transport, step)
        admins = await bot.get_chat_administrators(-100_500)
        assert all(isinstance(admin, ChatMember) for admin in admins)
        assert admins[0].status == "creator"
        assert admins[0].user.id == 1

    async def test_get_chat_member_count(
        self, bot_transport: Any, ok_response: ResponseFactory
    ) -> None:
        bot = make_bot(bot_transport, record_into(ok_response(42), []))
        assert await bot.get_chat_member_count(-100_500) == 42

    async def test_ban_chat_member_payload(
        self, bot_transport: Any, ok_response: ResponseFactory
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        result = await bot.ban_chat_member(
            -100_500, 7, until_date=1_700_000_100, revoke_messages=True
        )
        assert result is True
        assert sent_payload(seen[0]) == {
            "chat_id": -100_500,
            "user_id": 7,
            "until_date": 1_700_000_100,
            "revoke_messages": True,
        }

    async def test_unban_chat_member_payload(
        self, bot_transport: Any, ok_response: ResponseFactory
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.unban_chat_member(-100_500, 7, only_if_banned=True)
        assert sent_payload(seen[0]) == {
            "chat_id": -100_500,
            "user_id": 7,
            "only_if_banned": True,
        }

    async def test_leave_chat(self, bot_transport: Any, ok_response: ResponseFactory) -> None:
        bot = make_bot(bot_transport, record_into(ok_response(True), []))
        assert await bot.leave_chat(-100_500) is True


class TestEditsSurface:
    async def test_edit_message_text_returns_message(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7, text="new")), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.edit_message_text("new", chat_id=100, message_id=7, parse_mode="HTML")
        assert isinstance(message, Message)
        assert message.text == "new"
        assert sent_payload(seen[0]) == {
            "text": "new",
            "chat_id": 100,
            "message_id": 7,
            "parse_mode": "HTML",
        }

    async def test_edit_message_text_inline_returns_true(
        self, bot_transport: Any, ok_response: ResponseFactory
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.edit_message_text("new", inline_message_id="abc") is True
        assert sent_payload(seen[0]) == {"text": "new", "inline_message_id": "abc"}

    async def test_edit_message_caption(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7)), seen)
        bot = make_bot(bot_transport, step)
        message = await bot.edit_message_caption(chat_id=100, message_id=7, caption="new cap")
        assert isinstance(message, Message)
        assert sent_payload(seen[0]) == {"chat_id": 100, "message_id": 7, "caption": "new cap"}

    async def test_edit_message_reply_markup(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=7)), seen)
        bot = make_bot(bot_transport, step)
        markup = {"inline_keyboard": []}
        message = await bot.edit_message_reply_markup(
            chat_id=100, message_id=7, reply_markup=markup
        )
        assert isinstance(message, Message)
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "message_id": 7,
            "reply_markup": markup,
        }

    async def test_delete_message(self, bot_transport: Any, ok_response: ResponseFactory) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_message(100, 7) is True
        assert seen[0].url.path == f"/bot{TEST_TOKEN}/deleteMessage"
        assert sent_payload(seen[0]) == {"chat_id": 100, "message_id": 7}


class TestWebhookSurface:
    async def test_get_webhook_info(self, bot_transport: Any, ok_response: ResponseFactory) -> None:
        step = record_into(
            ok_response(
                {
                    "url": "https://example.com/hook",
                    "has_custom_certificate": False,
                    "pending_update_count": 3,
                    "max_connections": 40,
                    "allowed_updates": ["message"],
                }
            ),
            [],
        )
        bot = make_bot(bot_transport, step)
        info = await bot.get_webhook_info()
        assert isinstance(info, WebhookInfo)
        assert info.url == "https://example.com/hook"
        assert info.has_custom_certificate is False
        assert info.pending_update_count == 3
        assert info.max_connections == 40
        assert info.allowed_updates == ["message"]

    async def test_set_webhook_payload(
        self, bot_transport: Any, ok_response: ResponseFactory
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.set_webhook(
            "https://example.com/hook",
            secret_token="s3cret",
            max_connections=40,
            allowed_updates=["message"],
            drop_pending_updates=True,
        )
        assert seen[0].url.path == f"/bot{TEST_TOKEN}/setWebhook"
        assert sent_payload(seen[0]) == {
            "url": "https://example.com/hook",
            "secret_token": "s3cret",
            "max_connections": 40,
            "allowed_updates": ["message"],
            "drop_pending_updates": True,
        }

    async def test_delete_webhook(self, bot_transport: Any, ok_response: ResponseFactory) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        assert await bot.delete_webhook(drop_pending_updates=True) is True
        assert sent_payload(seen[0]) == {"drop_pending_updates": True}


class TestSendMessageReplyParametersObject:
    """send_message accepts the typed ReplyParameters dataclass, not just a dict."""

    async def test_serializes_dataclass_snake_case_omitting_none(
        self,
        bot_transport: Any,
        ok_response: ResponseFactory,
        make_message: Any,
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_message(
            -100_500,
            "hello",
            reply_parameters=ReplyParameters(
                message_id=5,
                quote="hi",
                quote_entities=[MessageEntity(type="bold", offset=0, length=2)],
                checklist_task_id=9,
            ),
        )
        assert sent_payload(seen[0]) == {
            "chat_id": -100_500,
            "text": "hello",
            "reply_parameters": {
                "message_id": 5,
                "quote": "hi",
                "quote_entities": [{"type": "bold", "offset": 0, "length": 2}],
                "checklist_task_id": 9,
            },
        }
