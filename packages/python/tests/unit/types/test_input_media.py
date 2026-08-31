"""Unit tests for the typed InputMedia family and LinkPreviewOptions.

Covers ``from_dict``/``to_dict`` round-trips, the ``type`` literal defaults
Telegram requires on every input-media variant, discriminated hydration of
``InputRichBlock*`` media fields, and the wire shape of ``LinkPreviewOptions``.
"""

from __future__ import annotations

import dataclasses
import typing as t

import pytest

from telebot_py.types import (
    InputMedia,
    InputMediaAnimation,
    InputMediaAudio,
    InputMediaDocument,
    InputMediaPhoto,
    InputMediaVideo,
    InputMediaVoiceNote,
    InputRichBlockPhoto,
    InputRichBlockVideo,
    InputRichMessageMedia,
    LinkPreviewOptions,
    Message,
    MessageEntity,
)

VARIANTS: dict[str, type[t.Any]] = {
    "photo": InputMediaPhoto,
    "video": InputMediaVideo,
    "audio": InputMediaAudio,
    "document": InputMediaDocument,
    "animation": InputMediaAnimation,
    "voice_note": InputMediaVoiceNote,
}


class TestInputMediaShape:
    @pytest.mark.parametrize(
        ("wire_type", "cls"),
        sorted(VARIANTS.items()),
    )
    def test_type_literal_defaults_to_the_variant(self, wire_type: str, cls: type[t.Any]) -> None:
        item = cls(media="file-id")
        assert item.type == wire_type
        assert item.to_dict()["type"] == wire_type

    def test_media_is_the_only_required_field(self) -> None:
        for cls in VARIANTS.values():
            with pytest.raises(TypeError):
                cls()  # type: ignore[call-arg]

    @pytest.mark.parametrize("cls", sorted(VARIANTS.values(), key=lambda c: c.__name__))
    def test_frozen(self, cls: type[t.Any]) -> None:
        assert cls.__dataclass_params__.frozen
        item = cls(media="file-id")
        with pytest.raises(dataclasses.FrozenInstanceError):
            item.media = "other"  # type: ignore[misc]

    def test_input_media_alias_lists_every_variant(self) -> None:
        assert set(t.get_args(InputMedia)) == set(VARIANTS.values())

    def test_caption_entities_hydrate_to_message_entities(self) -> None:
        raw = {
            "type": "photo",
            "media": "f1",
            "caption": "hello *world*",
            "parse_mode": "Markdown",
            "caption_entities": [
                {"type": "bold", "offset": 7, "length": 5},
                {"type": "italic", "offset": 1, "length": 2},
            ],
            "show_caption_above_media": True,
            "has_spoiler": False,
        }
        photo = InputMediaPhoto.from_dict(raw)
        assert photo.caption_entities == [
            MessageEntity(type="bold", offset=7, length=5),
            MessageEntity(type="italic", offset=1, length=2),
        ]
        assert photo.has_spoiler is False
        assert photo.to_dict() == raw

    def test_omitted_optionals_are_absent_from_the_wire(self) -> None:
        assert InputMediaVideo(media="v1").to_dict() == {"media": "v1", "type": "video"}


class TestInputMediaPhoto:
    """Docs fields: type, media, caption, parse_mode, caption_entities,
    show_caption_above_media, has_spoiler."""

    def test_declared_fields_match_the_docs(self) -> None:
        assert {f.name for f in dataclasses.fields(InputMediaPhoto)} == {
            "type",
            "media",
            "caption",
            "parse_mode",
            "caption_entities",
            "show_caption_above_media",
            "has_spoiler",
        }

    def test_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "type": "photo",
            "media": "https://example.com/a.jpg",
            "caption": "sun",
            "parse_mode": "HTML",
        }
        photo = InputMediaPhoto.from_dict(raw)
        assert photo == InputMediaPhoto(
            media="https://example.com/a.jpg", caption="sun", parse_mode="HTML"
        )
        assert photo.to_dict() == raw


class TestInputMediaVideo:
    """Docs fields: type, media, thumbnail, cover, start_timestamp, caption,
    parse_mode, caption_entities, show_caption_above_media, width, height,
    duration, supports_streaming, has_spoiler."""

    def test_declared_fields_match_the_docs(self) -> None:
        assert {f.name for f in dataclasses.fields(InputMediaVideo)} == {
            "type",
            "media",
            "thumbnail",
            "cover",
            "start_timestamp",
            "caption",
            "parse_mode",
            "caption_entities",
            "show_caption_above_media",
            "width",
            "height",
            "duration",
            "supports_streaming",
            "has_spoiler",
        }

    def test_round_trip(self) -> None:
        video = InputMediaVideo(
            media="v1",
            thumbnail="t1",
            cover="c1",
            start_timestamp=12,
            caption="clip",
            width=640,
            height=360,
            duration=90,
            supports_streaming=True,
            has_spoiler=True,
        )
        assert video.to_dict() == {
            "media": "v1",
            "type": "video",
            "thumbnail": "t1",
            "cover": "c1",
            "start_timestamp": 12,
            "caption": "clip",
            "width": 640,
            "height": 360,
            "duration": 90,
            "supports_streaming": True,
            "has_spoiler": True,
        }
        assert InputMediaVideo.from_dict(video.to_dict()) == video

    def test_unknown_fields_ignored(self) -> None:
        video = InputMediaVideo.from_dict({"type": "video", "media": "v", "future": 1})
        assert video == InputMediaVideo(media="v")


class TestInputMediaAudio:
    """Docs fields: type, media, thumbnail, caption, parse_mode,
    caption_entities, duration, performer, title."""

    def test_declared_fields_match_the_docs(self) -> None:
        assert {f.name for f in dataclasses.fields(InputMediaAudio)} == {
            "type",
            "media",
            "thumbnail",
            "caption",
            "parse_mode",
            "caption_entities",
            "duration",
            "performer",
            "title",
        }

    def test_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "type": "audio",
            "media": "a1",
            "thumbnail": "t1",
            "caption": "track",
            "parse_mode": "MarkdownV2",
            "caption_entities": [{"type": "underline", "offset": 0, "length": 5}],
            "duration": 210,
            "performer": "Artist",
            "title": "Song",
        }
        audio = InputMediaAudio.from_dict(raw)
        assert audio.duration == 210
        assert audio.caption_entities == [MessageEntity(type="underline", offset=0, length=5)]
        assert audio.to_dict() == raw


class TestInputMediaDocument:
    """Docs fields: type, media, thumbnail, caption, parse_mode,
    caption_entities, disable_content_type_detection."""

    def test_declared_fields_match_the_docs(self) -> None:
        assert {f.name for f in dataclasses.fields(InputMediaDocument)} == {
            "type",
            "media",
            "thumbnail",
            "caption",
            "parse_mode",
            "caption_entities",
            "disable_content_type_detection",
        }

    def test_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "type": "document",
            "media": "d1",
            "caption": "spec",
            "disable_content_type_detection": True,
        }
        assert InputMediaDocument.from_dict(raw).to_dict() == raw


class TestInputMediaAnimation:
    """Docs fields: type, media, thumbnail, caption, parse_mode,
    caption_entities, show_caption_above_media, width, height, duration,
    has_spoiler."""

    def test_declared_fields_match_the_docs(self) -> None:
        assert {f.name for f in dataclasses.fields(InputMediaAnimation)} == {
            "type",
            "media",
            "thumbnail",
            "caption",
            "parse_mode",
            "caption_entities",
            "show_caption_above_media",
            "width",
            "height",
            "duration",
            "has_spoiler",
        }

    def test_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "type": "animation",
            "media": "anim1",
            "width": 480,
            "height": 270,
            "duration": 4,
            "has_spoiler": False,
        }
        assert InputMediaAnimation.from_dict(raw).to_dict() == raw


class TestInputMediaVoiceNote:
    """Docs fields: type, media, caption, parse_mode, caption_entities,
    duration."""

    def test_declared_fields_match_the_docs(self) -> None:
        assert {f.name for f in dataclasses.fields(InputMediaVoiceNote)} == {
            "type",
            "media",
            "caption",
            "parse_mode",
            "caption_entities",
            "duration",
        }

    def test_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "type": "voice_note",
            "media": "v1",
            "caption": "note",
            "duration": 12,
        }
        assert InputMediaVoiceNote.from_dict(raw).to_dict() == raw


class TestRichBlockMediaFields:
    def test_rich_block_photo_accepts_typed_media(self) -> None:
        block = InputRichBlockPhoto(photo=InputMediaPhoto(media="file-id"))
        assert block.to_dict() == {
            "photo": {"media": "file-id", "type": "photo"},
            "type": "photo",
        }

    def test_rich_block_from_dict_hydrates_nested_media(self) -> None:
        raw: dict[str, t.Any] = {
            "type": "video",
            "video": {"type": "video", "media": "v1", "duration": 9},
        }
        block = InputRichBlockVideo.from_dict(raw)
        assert isinstance(block.video, InputMediaVideo)
        assert block.video.duration == 9
        assert block.to_dict() == raw

    def test_rich_block_media_still_accepts_plain_mappings(self) -> None:
        block = InputRichBlockPhoto(photo={"type": "photo", "media": "file-id"})
        assert block.to_dict()["photo"] == {"type": "photo", "media": "file-id"}

    def test_input_rich_message_media_carries_any_variant(self) -> None:
        raw: dict[str, t.Any] = {
            "id": "doc1",
            "media": {"type": "document", "media": "f1", "caption": "spec"},
        }
        media = InputRichMessageMedia.from_dict(raw)
        assert isinstance(media.media, InputMediaDocument)
        assert media.to_dict() == raw


class TestLinkPreviewOptions:
    """Docs fields: url, is_disabled, prefer_small_media, prefer_large_media,
    show_above_text — all optional."""

    def test_declared_fields_match_the_docs(self) -> None:
        assert {f.name for f in dataclasses.fields(LinkPreviewOptions)} == {
            "url",
            "is_disabled",
            "prefer_small_media",
            "prefer_large_media",
            "show_above_text",
        }

    def test_all_fields_optional(self) -> None:
        assert LinkPreviewOptions().to_dict() == {}

    def test_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "url": "https://example.com",
            "is_disabled": False,
            "prefer_small_media": True,
            "prefer_large_media": True,
            "show_above_text": True,
        }
        options = LinkPreviewOptions.from_dict(raw)
        assert options.url == "https://example.com"
        assert options.is_disabled is False
        assert options.to_dict() == raw

    def test_message_field_is_typed(self) -> None:
        hints = t.get_type_hints(Message)
        assert hints["link_preview_options"] == (LinkPreviewOptions | None)
        message = Message.from_dict(
            {
                "message_id": 1,
                "date": 1700000000,
                "chat": {"id": 1, "type": "private"},
                "link_preview_options": {"is_disabled": True},
            }
        )
        assert message.link_preview_options == LinkPreviewOptions(is_disabled=True)
