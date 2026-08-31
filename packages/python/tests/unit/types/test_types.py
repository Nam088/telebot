"""Unit tests for core Telegram types (T007)."""

from __future__ import annotations

import dataclasses
from typing import Any

import pytest

from telebot_py.types import (
    CallbackQuery,
    Chat,
    ChatMemberUpdated,
    InlineQuery,
    Message,
    PreCheckoutQuery,
    ReplyParameters,
    Update,
    User,
)
from telebot_py.types.base import TypeParseError
from telebot_py.types.common import MessageEntity


class TestUser:
    def test_snake_case_attributes(self) -> None:
        user = User.from_dict(
            {
                "id": 7,
                "is_bot": False,
                "first_name": "Ada",
                "last_name": "Lovelace",
                "username": "ada",
                "language_code": "en",
            }
        )
        assert user.id == 7
        assert user.is_bot is False
        assert user.first_name == "Ada"
        assert user.last_name == "Lovelace"
        assert user.username == "ada"
        assert user.language_code == "en"

    def test_optional_fields_default_to_none(self) -> None:
        user = User.from_dict({"id": 1, "is_bot": True, "first_name": "Bot"})
        assert user.last_name is None
        assert user.username is None
        assert user.language_code is None

    def test_frozen_dataclass_semantics(self) -> None:
        user = User(id=1, is_bot=False, first_name="Ada")
        with pytest.raises(dataclasses.FrozenInstanceError):
            user.first_name = "Grace"  # type: ignore[misc]

    def test_round_trip(self) -> None:
        data = {"id": 7, "is_bot": False, "first_name": "Ada", "username": "ada"}
        assert User.from_dict(data).to_dict() == data

    def test_unknown_fields_ignored(self) -> None:
        user = User.from_dict(
            {"id": 7, "is_bot": False, "first_name": "Ada", "premium_badge": {"x": 1}}
        )
        assert user.to_dict() == {"id": 7, "is_bot": False, "first_name": "Ada"}

    def test_missing_required_field_raises_typed_error(self) -> None:
        with pytest.raises(TypeParseError):
            User.from_dict({"id": 7, "is_bot": False})
        with pytest.raises(TypeError):
            User.from_dict({"id": 7, "is_bot": False})


class TestChat:
    def test_snake_case_attributes(self) -> None:
        chat = Chat.from_dict({"id": -100, "type": "supergroup", "title": "Dev"})
        assert chat.id == -100
        assert chat.type == "supergroup"
        assert chat.title == "Dev"

    def test_type_restricted_to_known_values(self) -> None:
        for chat_type in ("private", "group", "supergroup", "channel"):
            assert Chat(id=1, type=chat_type).type == chat_type
        with pytest.raises(ValueError, match="type"):
            Chat(id=1, type="bogus")


class TestMessage:
    def test_nested_hydration_and_from_wire_key(self) -> None:
        message = Message.from_dict(
            {
                "message_id": 5,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "private"},
                "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
                "text": "hi",
            }
        )
        assert isinstance(message.chat, Chat)
        assert message.chat.id == 100
        assert isinstance(message.from_user, User)
        assert message.from_user.id == 7
        assert message.text == "hi"

    def test_to_dict_emits_telegram_keys(self) -> None:
        message = Message.from_dict(
            {
                "message_id": 5,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "private"},
                "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
                "text": "hi",
            }
        )
        data = message.to_dict()
        assert data["from"] == {"id": 7, "is_bot": False, "first_name": "Ada"}
        assert "from_user" not in data

    def test_round_trip_with_nested_reply(self) -> None:
        data: dict[str, Any] = {
            "message_id": 6,
            "date": 1_700_000_001,
            "chat": {"id": 100, "type": "group", "title": "Dev"},
            "text": "reply",
            "reply_to_message": {
                "message_id": 5,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "group", "title": "Dev"},
                "text": "original",
            },
        }
        message = Message.from_dict(data)
        assert message.reply_to_message is not None
        assert message.reply_to_message.text == "original"
        assert message.to_dict() == data

    def test_entities_round_trip(self) -> None:
        data: dict[str, Any] = {
            "message_id": 7,
            "date": 1_700_000_000,
            "chat": {"id": 100, "type": "private"},
            "text": "/start",
            "entities": [{"type": "bot_command", "offset": 0, "length": 6}],
        }
        message = Message.from_dict(data)
        assert message.entities is not None
        assert message.entities[0].type == "bot_command"
        assert message.to_dict() == data

    def test_frozen(self) -> None:
        message = Message.from_dict(
            {"message_id": 1, "date": 0, "chat": {"id": 1, "type": "private"}}
        )
        with pytest.raises(dataclasses.FrozenInstanceError):
            message.text = "mutated"  # type: ignore[misc]


class TestCallbackQuery:
    def test_from_dict(self) -> None:
        query = CallbackQuery.from_dict(
            {
                "id": "cb-1",
                "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
                "message": {
                    "message_id": 5,
                    "date": 1_700_000_000,
                    "chat": {"id": 100, "type": "private"},
                },
                "chat_instance": "ci",
                "data": "press_me",
            }
        )
        assert query.id == "cb-1"
        assert query.from_user.id == 7
        assert query.message is not None
        assert query.message.message_id == 5
        assert query.data == "press_me"

    def test_missing_from_raises(self) -> None:
        with pytest.raises(TypeParseError):
            CallbackQuery.from_dict({"id": "cb-1", "chat_instance": "ci"})


class TestUpdate:
    def test_exactly_one_payload_required(self) -> None:
        chat = Chat(id=1, type="private")
        message = Message(message_id=1, date=0, chat=chat)
        query = CallbackQuery(
            id="cb",
            from_user=User(id=7, is_bot=False, first_name="Ada"),
            chat_instance="ci",
        )
        with pytest.raises(ValueError, match="exactly one"):
            Update(update_id=1)
        with pytest.raises(ValueError, match="exactly one"):
            Update(update_id=1, message=message, callback_query=query)
        assert Update(update_id=1, message=message).message is message

    def test_from_dict_round_trip(self, make_update: Any) -> None:
        data = make_update(update_id=9)
        update = Update.from_dict(data)
        assert update.update_id == 9
        assert update.message is not None
        assert update.message.text == "hello world"
        assert update.to_dict() == data

    def test_from_dict_unknown_fields_ignored(self, make_update: Any) -> None:
        data = make_update(update_id=9, future_field={"x": 1})
        update = Update.from_dict(data)
        assert update.to_dict() == make_update(update_id=9)

    def test_from_dict_without_payload_raises(self) -> None:
        with pytest.raises(ValueError):
            Update.from_dict({"update_id": 1})

    def test_effective_accessors(self, make_update: Any) -> None:
        update = Update.from_dict(make_update(update_id=3))
        assert update.effective_message is update.message
        assert update.effective_chat is update.message.chat
        assert update.effective_user is update.message.from_user

    def test_effective_accessors_from_callback_query(self) -> None:
        query = CallbackQuery.from_dict(
            {
                "id": "cb-1",
                "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
                "message": {
                    "message_id": 5,
                    "date": 1_700_000_000,
                    "chat": {"id": 100, "type": "private"},
                },
                "chat_instance": "ci",
            }
        )
        update = Update(update_id=2, callback_query=query)
        assert update.effective_message is query.message
        assert update.effective_user is query.from_user
        assert update.effective_chat is not None
        assert update.effective_chat.id == 100

    def test_effective_user_from_inline_query(self) -> None:
        query = InlineQuery.from_dict(
            {
                "id": "iq-1",
                "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
                "query": "search",
                "offset": "",
            }
        )
        update = Update(update_id=3, inline_query=query)
        assert update.effective_user is query.from_user
        assert update.effective_message is None
        assert update.effective_chat is None

    def test_effective_user_from_pre_checkout_query(self) -> None:
        query = PreCheckoutQuery.from_dict(
            {
                "id": "pc-1",
                "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
                "currency": "USD",
                "total_amount": 100,
                "invoice_payload": "order-1",
            }
        )
        update = Update(update_id=4, pre_checkout_query=query)
        assert update.effective_user is query.from_user

    def test_effective_accessors_from_chat_member(self) -> None:
        updated = ChatMemberUpdated.from_dict(
            {
                "chat": {"id": -100, "type": "supergroup", "title": "Dev"},
                "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
                "date": 1_700_000_000,
                "old_chat_member": {
                    "status": "member",
                    "user": {"id": 8, "is_bot": False, "first_name": "Bob"},
                },
                "new_chat_member": {
                    "status": "left",
                    "user": {"id": 8, "is_bot": False, "first_name": "Bob"},
                },
            }
        )
        update = Update(update_id=5, my_chat_member=updated)
        assert update.effective_user is updated.from_user
        assert update.effective_chat is updated.chat


class TestReplyParameters:
    """ReplyParameters matches the Bot API field list and serializes snake_case."""

    def test_field_names_match_documentation(self) -> None:
        assert [field.name for field in dataclasses.fields(ReplyParameters)] == [
            "chat_id",
            "message_id",
            "allow_sending_without_reply",
            "quote",
            "quote_parse_mode",
            "quote_entities",
            "quote_position",
            "checklist_task_id",
            "poll_option_id",
            "ephemeral_message_id",
        ]

    def test_every_field_is_optional(self) -> None:
        assert ReplyParameters().to_dict() == {}

    def test_serializes_snake_case_and_omits_none(self) -> None:
        params = ReplyParameters(
            chat_id=-100_500,
            message_id=5,
            quote="hi",
            quote_position=0,
            checklist_task_id=9,
            poll_option_id="2",
            ephemeral_message_id=11,
        )
        assert params.to_dict() == {
            "chat_id": -100_500,
            "message_id": 5,
            "quote": "hi",
            "quote_position": 0,
            "checklist_task_id": 9,
            "poll_option_id": "2",
            "ephemeral_message_id": 11,
        }

    def test_hydrates_nested_quote_entities(self) -> None:
        params = ReplyParameters.from_dict(
            {
                "message_id": 5,
                "quote_entities": [{"type": "bold", "offset": 0, "length": 2}],
                "quote_parse_mode": "HTML",
            }
        )
        assert params.message_id == 5
        assert params.quote_parse_mode == "HTML"
        assert isinstance(params.quote_entities, list)
        assert params.quote_entities[0] == MessageEntity(type="bold", offset=0, length=2)

    def test_round_trip(self) -> None:
        data = {
            "message_id": 5,
            "allow_sending_without_reply": True,
            "quote_entities": [{"type": "bold", "offset": 0, "length": 2}],
        }
        assert ReplyParameters.from_dict(data).to_dict() == data
