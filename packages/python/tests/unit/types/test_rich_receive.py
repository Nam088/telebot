"""Received rich messages hydrate into typed blocks on Message."""

from __future__ import annotations

from typing import Any

from telebot_py.types import (
    Message,
    RichBlockCollage,
    RichBlockDivider,
    RichBlockParagraph,
    RichMessage,
    RichTextBold,
)

NESTED_RAW: dict[str, Any] = {
    "blocks": [
        {"type": "paragraph", "text": ["Hi ", {"type": "bold", "text": "there"}]},
        {"type": "collage", "blocks": [{"type": "divider"}]},
        {"type": "quantum_flux", "novel_field": 42},
    ],
    "is_rtl": True,
}


def _message_with_rich() -> Message:
    return Message.from_dict(
        {
            "message_id": 5,
            "date": 1700000000,
            "chat": {"id": 1, "type": "private"},
            "rich_message": NESTED_RAW,
        }
    )


def test_message_rich_message_hydrates_by_discriminator() -> None:
    message = _message_with_rich()

    assert isinstance(message.rich_message, RichMessage)
    assert message.rich_message.is_rtl is True
    paragraph, collage = message.rich_message.blocks[0], message.rich_message.blocks[1]
    assert isinstance(paragraph, RichBlockParagraph)
    assert paragraph.text[0] == "Hi "
    assert isinstance(paragraph.text[1], RichTextBold)
    assert paragraph.text[1].text == "there"
    assert isinstance(collage, RichBlockCollage)
    assert isinstance(collage.blocks[0], RichBlockDivider)


def test_unported_block_variant_does_not_break_decoding() -> None:
    """A discriminator newer than this build stays on the wire instead of raising."""
    message = _message_with_rich()

    assert message.rich_message is not None
    assert message.rich_message.blocks[2] == {"type": "quantum_flux", "novel_field": 42}


def test_rich_message_survives_a_wire_round_trip() -> None:
    message = _message_with_rich()

    assert Message.from_dict(message.to_dict()).to_dict() == message.to_dict()
