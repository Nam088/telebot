"""Unit tests for filters (T013)."""

from __future__ import annotations

import re

import pytest

from telebot_py import filters
from telebot_py.filters import ChatType, MessageFilter, Regex, User
from telebot_py.types import Chat as ChatData
from telebot_py.types import Document, Message, PhotoSize
from telebot_py.types import User as UserData


def build_message(
    *,
    text: str | None = None,
    caption: str | None = None,
    chat_type: str = "private",
    chat_id: int = 100,
    chat_username: str | None = None,
    user_id: int = 42,
    username: str | None = None,
    with_photo: bool = False,
    with_document: bool = False,
    from_user: UserData | None = None,
) -> Message:
    """Build a Message instance for filter tests."""
    sender = (
        from_user
        if from_user is not None
        else UserData(id=user_id, is_bot=False, first_name="Alice", username=username)
    )
    return Message(
        message_id=1,
        date=1_700_000_000,
        chat=ChatData(id=chat_id, type=chat_type, username=chat_username),
        from_user=sender,
        text=text,
        caption=caption,
        photo=(
            [PhotoSize(file_id="p", file_unique_id="p", width=90, height=90)]
            if with_photo
            else None
        ),
        document=Document(file_id="d", file_unique_id="d") if with_document else None,
    )


class _Recorder(MessageFilter):
    """Filter recording how often it was evaluated, for short-circuit tests."""

    def __init__(self, result: bool) -> None:
        self.result = result
        self.calls = 0

    def filter(self, message: Message) -> bool:
        self.calls += 1
        return self.result


class TestMatchers:
    def test_text_matches_text_message(self) -> None:
        assert filters.TEXT(build_message(text="hello")) is True

    def test_text_rejects_message_without_text(self) -> None:
        assert filters.TEXT(build_message(with_photo=True)) is False

    def test_photo_matches_photo_message(self) -> None:
        assert filters.PHOTO(build_message(with_photo=True)) is True

    def test_photo_rejects_text_message(self) -> None:
        assert filters.PHOTO(build_message(text="hello")) is False

    def test_document_matches_document_message(self) -> None:
        assert filters.DOCUMENT(build_message(with_document=True)) is True

    def test_document_rejects_photo_message(self) -> None:
        assert filters.DOCUMENT(build_message(with_photo=True)) is False

    def test_all_matches_any_message(self) -> None:
        assert filters.ALL(build_message()) is True
        assert filters.ALL(build_message(with_photo=True)) is True

    def test_none_matches_nothing(self) -> None:
        assert filters.NONE(build_message(text="hello")) is False

    def test_filters_receive_message_and_return_bool(self) -> None:
        message = build_message(text="hello")
        for message_filter in (
            filters.TEXT,
            filters.PHOTO,
            filters.DOCUMENT,
            filters.ALL,
            filters.NONE,
        ):
            assert isinstance(message_filter, MessageFilter)
            result = message_filter(message)
            assert isinstance(result, bool)


class TestChatType:
    @pytest.mark.parametrize(
        ("chat_type", "expected"),
        [
            ("private", True),
            ("group", False),
            ("supergroup", False),
            ("channel", False),
        ],
    )
    def test_private(self, chat_type: str, expected: bool) -> None:
        assert ChatType.PRIVATE(build_message(chat_type=chat_type)) is expected

    def test_group(self) -> None:
        assert ChatType.GROUP(build_message(chat_type="group")) is True
        assert ChatType.GROUP(build_message(chat_type="supergroup")) is False

    def test_supergroup(self) -> None:
        assert ChatType.SUPERGROUP(build_message(chat_type="supergroup")) is True
        assert ChatType.SUPERGROUP(build_message(chat_type="group")) is False

    def test_channel(self) -> None:
        assert ChatType.CHANNEL(build_message(chat_type="channel")) is True
        assert ChatType.CHANNEL(build_message(chat_type="private")) is False


class TestRegex:
    def test_matches_text(self) -> None:
        result = filters.Regex(r"^order_(\d+)$")(build_message(text="order_42"))
        assert result
        assert isinstance(result, dict)
        assert result["matches"][0].group(1) == "42"

    def test_optional_capture_group_missing(self) -> None:
        result = filters.Regex(r"^cmd(?: (\w+))?$")(build_message(text="cmd"))
        assert result
        assert result["matches"][0].group(1) is None

    def test_matches_caption_when_no_text(self) -> None:
        result = filters.Regex(r"^a caption$")(build_message(caption="a caption"))
        assert result

    def test_no_match_returns_falsy(self) -> None:
        assert not filters.Regex(r"^nope$")(build_message(text="hello"))

    def test_no_text_or_caption_returns_falsy(self) -> None:
        assert not filters.Regex(r".*")(build_message())

    def test_is_data_filter(self) -> None:
        assert filters.Regex("x").data_filter is True

    def test_accepts_compiled_pattern(self) -> None:
        result = filters.Regex(re.compile(r"\d+"))(build_message(text="abc 123"))
        assert result


class TestUserFilter:
    def test_matches_by_id(self) -> None:
        assert User(user_id=42)(build_message(user_id=42)) is True
        assert User(user_id=42)(build_message(user_id=7)) is False

    def test_matches_by_username_case_insensitive(self) -> None:
        assert User(username="Alice")(build_message(username="alice")) is True
        assert User(username="alice")(build_message(username="bob")) is False

    def test_accepts_collections(self) -> None:
        assert User(user_id=[1, 42])(build_message(user_id=42)) is True
        assert User(username=["bob", "carol"])(build_message(username="carol")) is True

    def test_requires_id_or_username(self) -> None:
        with pytest.raises(ValueError, match="user_id or username"):
            User()


class TestChatFilter:
    def test_matches_by_id(self) -> None:
        assert filters.Chat(chat_id=100)(build_message(chat_id=100)) is True
        assert filters.Chat(chat_id=100)(build_message(chat_id=-100)) is False

    def test_matches_by_username_case_insensitive(self) -> None:
        assert filters.Chat(username="Dev")(build_message(chat_username="dev")) is True
        assert filters.Chat(username="dev")(build_message(chat_username="ops")) is False

    def test_requires_id_or_username(self) -> None:
        with pytest.raises(ValueError, match="chat_id or username"):
            filters.Chat()


class TestAlgebra:
    def test_and_requires_both(self) -> None:
        combined = filters.TEXT & ChatType.PRIVATE
        assert combined(build_message(text="hi", chat_type="private")) is True
        assert not combined(build_message(text="hi", chat_type="group"))
        assert not combined(build_message(chat_type="private"))

    def test_or_requires_either(self) -> None:
        combined = filters.PHOTO | filters.DOCUMENT
        assert combined(build_message(with_photo=True)) is True
        assert combined(build_message(with_document=True)) is True
        assert not combined(build_message(text="hi"))

    def test_invert_negates(self) -> None:
        not_text = ~filters.TEXT
        assert not_text(build_message(with_photo=True)) is True
        assert not_text(build_message(text="hi")) is False

    def test_aliases_match_operators(self) -> None:
        message = build_message(text="hi", chat_type="private")
        assert (filters.TEXT & ChatType.PRIVATE)(message) is True
        assert filters.TEXT.and_(ChatType.PRIVATE)(message) is True
        assert (filters.TEXT | filters.NONE)(message) is True
        assert filters.TEXT.or_(filters.NONE)(message) is True
        assert (~filters.NONE)(message) is True
        assert filters.NONE.not_()(message) is True

    def test_and_short_circuits_on_falsy_left(self) -> None:
        left, right = _Recorder(False), _Recorder(True)
        assert (left & right)(build_message(text="hi")) is False
        assert (left.calls, right.calls) == (1, 0)

    def test_or_short_circuits_on_truthy_left(self) -> None:
        left, right = _Recorder(True), _Recorder(False)
        assert (left | right)(build_message(text="hi")) is True
        assert (left.calls, right.calls) == (1, 0)

    def test_and_merges_data_filter_results(self) -> None:
        combined = filters.TEXT & Regex(r"^hi (?P<who>\w+)$")
        result = combined(build_message(text="hi alice"))
        assert result
        assert result["matches"][0].group("who") == "alice"

    def test_and_conflicting_data_keys_raise(self) -> None:
        combined = Regex("a") & Regex("b")
        with pytest.raises(ValueError, match="conflicting"):
            combined(build_message(text="ab"))

    def test_or_returns_first_truthy_data(self) -> None:
        combined = filters.NONE | Regex(r"^hi (\w+)$")
        result = combined(build_message(text="hi bob"))
        assert result
        assert result["matches"][0].group(1) == "bob"

    def test_invert_of_data_filter_returns_bool(self) -> None:
        result = (~Regex(r"^hi$"))(build_message(text="hi"))
        assert result is False

    def test_composite_data_filter_flag(self) -> None:
        assert (filters.TEXT & Regex("x")).data_filter is True
        assert (filters.TEXT | filters.PHOTO).data_filter is False
