"""Unit tests for the rich-message Bot methods and types (Phase 4, Bot API 10.3).

Field sets and method parameters are asserted against a programmatic extract of
the official Telegram docs (Bot API 10.3, 2026-08-24), not against the node
sibling, which is only an idiom reference.
"""

from __future__ import annotations

import dataclasses
import typing
from typing import Any

import httpx
import pytest

import telebot_py.types as types_module
from telebot_py.bot.errors import TelegramApiError
from telebot_py.types import (
    InputRichBlock,
    InputRichBlockButtons,
    InputRichBlockDivider,
    InputRichBlockList,
    InputRichBlockListItem,
    InputRichBlockParagraph,
    InputRichBlockPhoto,
    InputRichBlockTable,
    InputRichBlockThinking,
    InputRichMessage,
    InputRichMessageContent,
    InputRichMessageMedia,
    Message,
    RichBlock,
    RichBlockBlockQuotation,
    RichBlockButtons,
    RichBlockCaption,
    RichBlockFooter,
    RichBlockList,
    RichBlockListItem,
    RichBlockParagraph,
    RichBlockPhoto,
    RichBlockTable,
    RichBlockTableCell,
    RichMessage,
    RichMessageButton,
    RichText,
    RichTextBold,
    RichTextButton,
    RichTextCode,
    RichTextCustomEmoji,
    RichTextItalic,
    RichTextNode,
    RichTextUrl,
    TelegramObject,
    TypeParseError,
)
from unit.bot.helpers import TEST_TOKEN, make_bot, record_into, sent_payload, url_path

#: Every ``Rich*``/``InputRich*`` class the official docs define (83 total).
DOCS_RICH_TYPES: tuple[str, ...] = (
    "InputRichBlockAnchor",
    "InputRichBlockAnimation",
    "InputRichBlockAudio",
    "InputRichBlockBlockQuotation",
    "InputRichBlockButtons",
    "InputRichBlockCollage",
    "InputRichBlockDetails",
    "InputRichBlockDivider",
    "InputRichBlockDocument",
    "InputRichBlockExpandableBlockQuotation",
    "InputRichBlockFooter",
    "InputRichBlockList",
    "InputRichBlockListItem",
    "InputRichBlockMap",
    "InputRichBlockMathematicalExpression",
    "InputRichBlockParagraph",
    "InputRichBlockPhoto",
    "InputRichBlockPreformatted",
    "InputRichBlockPullQuotation",
    "InputRichBlockSectionHeading",
    "InputRichBlockSlideshow",
    "InputRichBlockTable",
    "InputRichBlockThinking",
    "InputRichBlockVideo",
    "InputRichBlockVoiceNote",
    "InputRichMessage",
    "InputRichMessageContent",
    "InputRichMessageMedia",
    "RichBlockAnchor",
    "RichBlockAnimation",
    "RichBlockAudio",
    "RichBlockBlockQuotation",
    "RichBlockButtons",
    "RichBlockCaption",
    "RichBlockCollage",
    "RichBlockDetails",
    "RichBlockDivider",
    "RichBlockDocument",
    "RichBlockExpandableBlockQuotation",
    "RichBlockFooter",
    "RichBlockList",
    "RichBlockListItem",
    "RichBlockMap",
    "RichBlockMathematicalExpression",
    "RichBlockParagraph",
    "RichBlockPhoto",
    "RichBlockPreformatted",
    "RichBlockPullQuotation",
    "RichBlockSectionHeading",
    "RichBlockSlideshow",
    "RichBlockTable",
    "RichBlockTableCell",
    "RichBlockThinking",
    "RichBlockVideo",
    "RichBlockVoiceNote",
    "RichMessage",
    "RichMessageButton",
    "RichTextAnchor",
    "RichTextAnchorLink",
    "RichTextBankCardNumber",
    "RichTextBold",
    "RichTextBotCommand",
    "RichTextButton",
    "RichTextCashtag",
    "RichTextCode",
    "RichTextCustomEmoji",
    "RichTextDateTime",
    "RichTextEmailAddress",
    "RichTextHashtag",
    "RichTextItalic",
    "RichTextMarked",
    "RichTextMathematicalExpression",
    "RichTextMention",
    "RichTextPhoneNumber",
    "RichTextReference",
    "RichTextReferenceLink",
    "RichTextSpoiler",
    "RichTextStrikethrough",
    "RichTextSubscript",
    "RichTextSuperscript",
    "RichTextTextMention",
    "RichTextUnderline",
    "RichTextUrl",
)

NESTED_RAW: dict[str, Any] = {
    "blocks": [
        {
            "type": "paragraph",
            "text": [
                {"type": "bold", "text": "Hello"},
                {"type": "button", "button": {"text": "Open", "url": "https://example.com"}},
                " world",
            ],
        },
        {
            "type": "table",
            "cells": [
                [
                    {"align": "left", "valign": "top", "text": "Total", "is_header": True},
                    {"align": "right", "valign": "top", "text": "42"},
                ]
            ],
            "is_bordered": True,
            "is_compact": False,
        },
        {
            "type": "buttons",
            "buttons": [{"text": "Pay", "callback_data": "pay", "style": "success"}],
            "align": "center",
        },
        {
            "type": "list",
            "items": [
                {
                    "label": "1.",
                    "blocks": [{"type": "divider"}],
                    "has_checkbox": True,
                    "is_checked": True,
                    "value": 1,
                    "type": "1",
                }
            ],
        },
        {
            "type": "photo",
            "photo": [{"file_id": "f1", "file_unique_id": "u1", "width": 90, "height": 90}],
            "has_spoiler": False,
            "caption": {
                "text": [{"type": "italic", "text": "Shot"}],
                "credit": [{"type": "url", "text": "source", "url": "https://example.com"}],
            },
        },
    ],
    "is_rtl": False,
}


class TestSendRichMessage:
    async def test_sends_required_fields_only(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=31)), seen)
        bot = make_bot(bot_transport, step)
        rich = InputRichMessage(blocks=[InputRichBlockParagraph(text="Hello")])
        message = await bot.send_rich_message(123, rich)
        assert isinstance(message, Message)
        assert message.message_id == 31
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendRichMessage"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "rich_message": {"blocks": [{"type": "paragraph", "text": "Hello"}]},
        }

    async def test_accepts_mapping_and_serializes_all_docs_optionals(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_rich_message(
            "@botsupport",
            {"html": "<p>hi</p>"},
            business_connection_id="bc1",
            message_thread_id=7,
            direct_messages_topic_id=9,
            ephemeral_message_parameters={"expiry_seconds": 3600},
            disable_notification=True,
            protect_content=True,
            allow_paid_broadcast=True,
            message_effect_id="effect1",
            suggested_post_parameters={"chat_id": 5},
            reply_parameters={"message_id": 4},
            reply_markup={"inline_keyboard": []},
        )
        assert sent_payload(seen[0]) == {
            "business_connection_id": "bc1",
            "chat_id": "@botsupport",
            "message_thread_id": 7,
            "direct_messages_topic_id": 9,
            "ephemeral_message_parameters": {"expiry_seconds": 3600},
            "rich_message": {"html": "<p>hi</p>"},
            "disable_notification": True,
            "protect_content": True,
            "allow_paid_broadcast": True,
            "message_effect_id": "effect1",
            "suggested_post_parameters": {"chat_id": 5},
            "reply_parameters": {"message_id": 4},
            "reply_markup": {"inline_keyboard": []},
        }

    async def test_omits_unset_optional_fields(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_rich_message(123, {"markdown": "*hi*"})
        assert set(sent_payload(seen[0])) == {"chat_id", "rich_message"}

    async def test_keeps_explicitly_false_fields_on_the_wire(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        rich = InputRichMessage(blocks=[], is_rtl=False, skip_entity_detection=False)
        await bot.send_rich_message(123, rich, disable_notification=False)
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "rich_message": {"blocks": [], "is_rtl": False, "skip_entity_detection": False},
            "disable_notification": False,
        }

    async def test_nested_rich_message_serializes_children(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        rich = InputRichMessage(
            blocks=[
                InputRichBlockParagraph(
                    text=[RichTextBold(text="Total"), " ", RichTextCode(text="42")]
                ),
                InputRichBlockTable(
                    cells=[
                        [RichBlockTableCell(align="left", valign="top", text="A", is_header=True)]
                    ],
                    is_bordered=True,
                ),
                InputRichBlockButtons(
                    buttons=[RichMessageButton(text="Go", url="https://example.com")],
                    align="center",
                ),
                InputRichBlockList(
                    items=[
                        InputRichBlockListItem(
                            blocks=[InputRichBlockParagraph(text="one")], has_checkbox=True
                        )
                    ]
                ),
            ]
        )
        await bot.send_rich_message(123, rich)
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "rich_message": {
                "blocks": [
                    {
                        "type": "paragraph",
                        "text": [
                            {"type": "bold", "text": "Total"},
                            " ",
                            {"type": "code", "text": "42"},
                        ],
                    },
                    {
                        "type": "table",
                        "cells": [
                            [{"text": "A", "is_header": True, "align": "left", "valign": "top"}]
                        ],
                        "is_bordered": True,
                    },
                    {
                        "type": "buttons",
                        "buttons": [{"text": "Go", "url": "https://example.com"}],
                        "align": "center",
                    },
                    {
                        "type": "list",
                        "items": [
                            {
                                "blocks": [{"type": "paragraph", "text": "one"}],
                                "has_checkbox": True,
                            }
                        ],
                    },
                ]
            },
        }

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: rich not allowed"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.send_rich_message(123, {"html": "<p>x</p>"})


class TestSendRichMessageDraft:
    async def test_streams_draft_and_returns_true(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        emoji = RichTextCustomEmoji(custom_emoji_id="1", alternative_text="🤔")
        rich = InputRichMessage(blocks=[InputRichBlockThinking(text=[emoji])])
        assert await bot.send_rich_message_draft(123, 5, rich) is True
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/sendRichMessageDraft"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "draft_id": 5,
            "rich_message": {
                "blocks": [
                    {
                        "type": "thinking",
                        "text": [
                            {
                                "type": "custom_emoji",
                                "custom_emoji_id": "1",
                                "alternative_text": "🤔",
                            }
                        ],
                    }
                ]
            },
        }

    async def test_serializes_all_docs_optional_fields(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_rich_message_draft(
            123,
            5,
            {"markdown": "*thinking*"},
            message_thread_id=7,
            can_stop=True,
            keep_on_stop=False,
        )
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "message_thread_id": 7,
            "draft_id": 5,
            "rich_message": {"markdown": "*thinking*"},
            "can_stop": True,
            "keep_on_stop": False,
        }

    async def test_omits_unset_optional_fields(self, bot_transport: Any, ok_response: Any) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        await bot.send_rich_message_draft(123, 5, {"html": "<p>x</p>"})
        assert set(sent_payload(seen[0])) == {"chat_id", "draft_id", "rich_message"}

    async def test_api_error_raises(self, bot_transport: Any, error_response: Any) -> None:
        step = record_into(error_response(400, 400, "Bad Request: draft id must be non-zero"), [])
        bot = make_bot(bot_transport, step, max_retries=0)
        with pytest.raises(TelegramApiError):
            await bot.send_rich_message_draft(123, 0, {"html": "<p>x</p>"})


class TestEditTextRichMessage:
    async def test_edit_message_text_sends_rich_message(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message(message_id=32)), seen)
        bot = make_bot(bot_transport, step)
        rich = InputRichMessage(blocks=[InputRichBlockParagraph(text="new")])
        result = await bot.edit_message_text(chat_id=123, message_id=32, rich_message=rich)
        assert isinstance(result, Message)
        assert url_path(seen[0]) == f"/bot{TEST_TOKEN}/editMessageText"
        assert sent_payload(seen[0]) == {
            "chat_id": 123,
            "message_id": 32,
            "rich_message": {"blocks": [{"type": "paragraph", "text": "new"}]},
        }

    async def test_edit_message_text_omits_rich_message_when_unset(
        self, bot_transport: Any, ok_response: Any, make_message: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(make_message()), seen)
        bot = make_bot(bot_transport, step)
        await bot.edit_message_text("plain", chat_id=123, message_id=32)
        assert sent_payload(seen[0]) == {
            "text": "plain",
            "chat_id": 123,
            "message_id": 32,
        }

    async def test_edit_ephemeral_message_text_sends_rich_message(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        seen: list[httpx.Request] = []
        step = record_into(ok_response(True), seen)
        bot = make_bot(bot_transport, step)
        result = await bot.edit_ephemeral_message_text(
            100, 42, 7, rich_message={"blocks": [{"type": "divider"}]}
        )
        assert result is True
        assert sent_payload(seen[0]) == {
            "chat_id": 100,
            "receiver_user_id": 42,
            "ephemeral_message_id": 7,
            "rich_message": {"blocks": [{"type": "divider"}]},
        }


class TestRichTypes:
    @pytest.mark.parametrize("name", DOCS_RICH_TYPES)
    def test_every_docs_type_is_exported_as_a_frozen_dataclass(self, name: str) -> None:
        obj = getattr(types_module, name, None)
        assert obj is not None, f"{name} is not re-exported from telebot_py.types"
        assert issubclass(obj, TelegramObject)
        assert dataclasses.is_dataclass(obj)
        assert obj.__dataclass_params__.frozen  # type: ignore[union-attr]

    def test_unions_cover_the_docs_variant_lists(self) -> None:
        assert len(typing.get_args(RichTextNode)) == 26
        assert len(typing.get_args(RichBlock)) == 24
        assert len(typing.get_args(InputRichBlock)) == 24
        assert str in typing.get_args(RichText)

    def test_nested_message_hydrates_and_round_trips(self) -> None:
        message = RichMessage.from_dict(NESTED_RAW)
        assert message.is_rtl is False

        paragraph = message.blocks[0]
        assert isinstance(paragraph, RichBlockParagraph)
        assert isinstance(paragraph.text, list)
        assert paragraph.text[0] == RichTextBold(text="Hello", type="bold")
        assert paragraph.text[1] == RichTextButton(
            button=RichMessageButton(text="Open", url="https://example.com")
        )
        assert paragraph.text[2] == " world"

        table = message.blocks[1]
        assert isinstance(table, RichBlockTable)
        assert table.is_bordered is True
        assert table.is_compact is False
        assert table.cells[0][1] == RichBlockTableCell(align="right", valign="top", text="42")

        buttons = message.blocks[2]
        assert isinstance(buttons, RichBlockButtons)
        assert buttons.align == "center"
        assert buttons.buttons[0].style == "success"

        listing = message.blocks[3]
        assert isinstance(listing, RichBlockList)
        item = listing.items[0]
        assert isinstance(item, RichBlockListItem)
        assert item.label == "1."
        assert item.value == 1
        assert item.type == "1"
        assert item.blocks[0].to_dict() == {"type": "divider"}

        photo = message.blocks[4]
        assert isinstance(photo, RichBlockPhoto)
        assert photo.has_spoiler is False
        assert photo.photo[0].file_unique_id == "u1"
        caption = photo.caption
        assert isinstance(caption, RichBlockCaption)
        assert caption.text == [RichTextItalic(text="Shot", type="italic")]
        assert caption.credit == [RichTextUrl(text="source", url="https://example.com")]

        assert message.to_dict() == NESTED_RAW

    def test_input_and_received_rich_types_round_trip(self) -> None:
        raw: dict[str, Any] = {
            "blocks": [
                {
                    "type": "blockquote",
                    "blocks": [{"type": "paragraph", "text": "quoted"}],
                    "credit": "Alice",
                },
                {"type": "pre", "text": "code", "language": "python"},
                {"type": "heading", "text": "Title", "size": 2},
                {"type": "anchor", "name": "top"},
                {"type": "mathematical_expression", "expression": "e=mc^2"},
                {
                    "type": "map",
                    "location": {"latitude": 1.5, "longitude": 2.5},
                    "zoom": 10,
                    "width": 300,
                    "height": 200,
                },
                {"type": "footer", "text": "fine print"},
                {"type": "details", "summary": "More", "blocks": [], "is_open": True},
                {"type": "collage", "blocks": []},
                {"type": "slideshow", "blocks": []},
                {"type": "expandable_blockquote", "text": "deep"},
                {"type": "pullquote", "text": "aside"},
                {
                    "type": "voice_note",
                    "voice_note": {"file_id": "v", "file_unique_id": "vu", "duration": 3},
                },
                {"type": "thinking", "text": "…"},
            ],
        }
        assert RichMessage.from_dict(raw).to_dict() == raw
        message = RichMessage.from_dict(raw)
        assert isinstance(message.blocks[0], RichBlockBlockQuotation)

    def test_plain_string_rich_text_is_preserved(self) -> None:
        raw = {"blocks": [{"type": "footer", "text": "note"}]}
        message = RichMessage.from_dict(raw)
        block = message.blocks[0]
        assert isinstance(block, RichBlockFooter)
        assert block.text == "note"
        assert message.to_dict() == raw

    def test_type_discriminator_defaults_are_always_emitted(self) -> None:
        assert InputRichBlockParagraph(text="x").to_dict() == {"text": "x", "type": "paragraph"}
        assert RichTextBold(text="x").to_dict() == {"text": "x", "type": "bold"}
        assert InputRichBlockDivider().to_dict() == {"type": "divider"}
        assert RichTextButton(button=RichMessageButton(text="t", callback_data="c")).to_dict() == {
            "type": "button",
            "button": {"text": "t", "callback_data": "c"},
        }

    def test_list_item_type_is_the_label_style_not_a_discriminator(self) -> None:
        item = InputRichBlockListItem(blocks=[InputRichBlockParagraph(text="a")], type="a", value=3)
        assert item.to_dict() == {
            "blocks": [{"type": "paragraph", "text": "a"}],
            "value": 3,
            "type": "a",
        }
        assert InputRichBlockListItem(blocks=[]).to_dict() == {"blocks": []}

    def test_unknown_fields_are_ignored(self) -> None:
        raw = {
            "blocks": [{"type": "paragraph", "text": "hi", "future_field": 1}],
            "is_rtl": True,
            "another_unknown": {},
        }
        assert RichMessage.from_dict(raw).to_dict() == {
            "blocks": [{"type": "paragraph", "text": "hi"}],
            "is_rtl": True,
        }

    def test_missing_required_field_raises_typed_error(self) -> None:
        with pytest.raises(TypeParseError):
            InputRichBlockParagraph.from_dict({"type": "paragraph"})

    def test_input_rich_message_media_and_content(self) -> None:
        media = InputRichMessageMedia(id="doc1", media={"type": "document", "media": "file-id"})
        assert media.to_dict() == {"id": "doc1", "media": {"type": "document", "media": "file-id"}}
        content = InputRichMessageContent(
            rich_message=InputRichMessage(blocks=[], html="<p>x</p>", media=[media])
        )
        assert content.to_dict() == {
            "rich_message": {
                "blocks": [],
                "html": "<p>x</p>",
                "media": [{"id": "doc1", "media": {"type": "document", "media": "file-id"}}],
            }
        }
        assert InputRichMessageContent.from_dict(content.to_dict()) == content

    def test_input_photo_block_keeps_media_payload_raw(self) -> None:
        block = InputRichBlockPhoto(photo={"type": "photo", "media": "file-id"})
        assert block.to_dict() == {
            "photo": {"type": "photo", "media": "file-id"},
            "type": "photo",
        }
