"""Unit tests for the ready-made components (T040).

Parity with packages/node/src/components: menu builder, keyboard builders
producing the telebot_py.types keyboard types, the pagination helper, and
inline-query result helpers.
"""

from __future__ import annotations

from typing import Any

import pytest

from telebot_py.components import (
    ArticleResultBuilder,
    InlineKeyboard,
    InlineQueryResultBuilder,
    Menu,
    PaginationKeyboard,
    ReplyKeyboard,
)
from telebot_py.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    KeyboardButtonPollType,
    KeyboardButtonRequestChat,
    KeyboardButtonRequestUsers,
    ReplyKeyboardMarkup,
    WebAppInfo,
)


class TestInlineKeyboardBuilder:
    def test_builds_typed_markup_with_rows(self) -> None:
        markup = (
            InlineKeyboard()
            .text("Option 1", "opt_1")
            .text("Option 2", "opt_2")
            .row()
            .url("Website", "https://example.com")
            .build()
        )

        assert isinstance(markup, InlineKeyboardMarkup)
        assert len(markup.inline_keyboard) == 2
        first, second = markup.inline_keyboard
        assert all(isinstance(button, InlineKeyboardButton) for button in first + second)
        assert first[0] == InlineKeyboardButton(text="Option 1", callback_data="opt_1")
        assert first[1] == InlineKeyboardButton(text="Option 2", callback_data="opt_2")
        assert second[0] == InlineKeyboardButton(text="Website", url="https://example.com")

    def test_trailing_empty_rows_are_dropped(self) -> None:
        markup = InlineKeyboard().text("Only", "x").row().row().build()
        assert [len(row) for row in markup.inline_keyboard] == [1]

    def test_empty_builder_yields_no_rows(self) -> None:
        assert InlineKeyboard().build().inline_keyboard == []

    def test_all_button_variants(self) -> None:
        markup = (
            InlineKeyboard()
            .web_app("App", "https://app.example.com")
            .switch_inline_query("Share", "query")
            .switch_inline_query_current_chat("Here", "local")
            .copy_text("Copy", "secret")
            .build()
        )
        (row,) = markup.inline_keyboard
        assert row[0] == InlineKeyboardButton(
            text="App", web_app=WebAppInfo(url="https://app.example.com")
        )
        assert row[1] == InlineKeyboardButton(text="Share", switch_inline_query="query")
        assert row[2] == InlineKeyboardButton(text="Here", switch_inline_query_current_chat="local")
        from telebot_py.types import CopyTextButton

        assert row[3] == InlineKeyboardButton(text="Copy", copy_text=CopyTextButton(text="secret"))


class TestReplyKeyboardBuilder:
    def test_builds_typed_markup_with_options(self) -> None:
        markup = (
            ReplyKeyboard(resize_keyboard=True, one_time_keyboard=True, selective=True)
            .text("Option A")
            .text("Option B")
            .row()
            .request_location("Share Location")
            .build()
        )

        assert isinstance(markup, ReplyKeyboardMarkup)
        assert markup.resize_keyboard is True
        assert markup.one_time_keyboard is True
        assert markup.selective is True
        assert len(markup.keyboard) == 2
        assert markup.keyboard[0][0] == KeyboardButton(text="Option A")
        assert markup.keyboard[1][0] == KeyboardButton(text="Share Location", request_location=True)

    def test_special_button_variants(self) -> None:
        markup = (
            ReplyKeyboard()
            .request_contact("Contact")
            .request_poll("Poll", type="quiz")
            .web_app("App", "https://web.example.com")
            .row()
            .request_users("Pick user", 7, max_quantity=2, request_name=True)
            .request_chat("Pick chat", 8, chat_is_channel=False, chat_is_forum=True)
            .build()
        )
        first_row, second_row = markup.keyboard
        assert first_row[0] == KeyboardButton(text="Contact", request_contact=True)
        assert first_row[1] == KeyboardButton(
            text="Poll", request_poll=KeyboardButtonPollType(type="quiz")
        )
        assert first_row[2] == KeyboardButton(
            text="App", web_app=WebAppInfo(url="https://web.example.com")
        )
        assert second_row[0] == KeyboardButton(
            text="Pick user",
            request_users=KeyboardButtonRequestUsers(
                request_id=7, max_quantity=2, request_name=True
            ),
        )
        assert second_row[1] == KeyboardButton(
            text="Pick chat",
            request_chat=KeyboardButtonRequestChat(
                request_id=8, chat_is_channel=False, chat_is_forum=True
            ),
        )

    def test_unset_options_stay_none(self) -> None:
        markup = ReplyKeyboard().text("A").build()
        assert markup.resize_keyboard is None
        assert markup.input_field_placeholder is None


class TestMenuBuilder:
    def test_callback_data_scheme(self) -> None:
        menu = (
            Menu("main")
            .text("Click me", lambda ctx: None)
            .text("Also", lambda ctx: None)
            .row()
            .url("Docs", "https://docs.example.com")
        )
        sub = Menu("settings").back("Go back")
        menu.submenu("Settings", sub)

        markup = menu.build()
        assert isinstance(markup, InlineKeyboardMarkup)
        row0, row1 = markup.inline_keyboard
        assert row0[0] == InlineKeyboardButton(text="Click me", callback_data="m:main:b:0:0")
        assert row0[1] == InlineKeyboardButton(text="Also", callback_data="m:main:b:0:1")
        assert row1[0] == InlineKeyboardButton(text="Docs", url="https://docs.example.com")
        assert row1[1] == InlineKeyboardButton(
            text="Settings", callback_data="m:main:s:settings:1:1"
        )

        sub_markup = sub.build()
        assert sub_markup.inline_keyboard[0][0] == InlineKeyboardButton(
            text="Go back", callback_data="m:settings:k:0:0"
        )

    def test_empty_id_raises(self) -> None:
        with pytest.raises(ValueError, match="id"):
            Menu("   ")

    def test_dynamic_sync_labels(self) -> None:
        menu = Menu("dyn").text(lambda ctx: "Count", lambda ctx: None)
        markup = menu.build()
        assert markup.inline_keyboard[0][0].text == "Count"

    async def test_render_awaits_async_labels(self) -> None:
        async def label(ctx: Any) -> str:
            return "async-label"

        menu = Menu("dyn").text(label, lambda ctx: None)
        markup = await menu.render()
        assert markup.inline_keyboard[0][0].text == "async-label"

    def test_find_menu_walks_hierarchy(self) -> None:
        root = Menu("root")
        child = Menu("child")
        grandchild = Menu("grandchild")
        root.submenu("Child", child)
        child.submenu("Grandchild", grandchild)

        assert root.find_menu("grandchild") is grandchild
        assert grandchild.find_menu("root") is root  # walks up via parent
        assert root.find_menu("missing") is None


class TestPaginationKeyboard:
    ITEMS = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"]

    def item_button(self, item: str, index: int) -> InlineKeyboardButton:
        return InlineKeyboardButton(text=item, callback_data=f"buy:{index}")

    def test_first_page_layout(self) -> None:
        keyboard = PaginationKeyboard(
            items=self.ITEMS,
            page=1,
            page_size=3,
            item_button=self.item_button,
        )
        markup = keyboard.build()

        assert keyboard.total_pages == 2
        assert keyboard.current_page == 1
        rows = markup.inline_keyboard
        assert len(rows) == 4  # three item rows + navigation row
        assert rows[0][0] == InlineKeyboardButton(text="Item 1", callback_data="buy:0")
        assert rows[2][0] == InlineKeyboardButton(text="Item 3", callback_data="buy:2")

        nav = rows[3]
        assert nav[0] == InlineKeyboardButton(text="-", callback_data="pagination:noop:1")
        assert nav[1] == InlineKeyboardButton(text="1 / 2", callback_data="pagination:noop:1")
        assert nav[2] == InlineKeyboardButton(text="Next", callback_data="pagination:next:2")

    def test_last_page_layout(self) -> None:
        keyboard = PaginationKeyboard(
            items=self.ITEMS, page=2, page_size=4, item_button=self.item_button
        )
        markup = keyboard.build()
        nav = markup.inline_keyboard[-1]

        assert nav[0] == InlineKeyboardButton(text="Previous", callback_data="pagination:prev:1")
        assert nav[1] == InlineKeyboardButton(text="2 / 2", callback_data="pagination:noop:2")
        assert nav[2] == InlineKeyboardButton(text="-", callback_data="pagination:noop:2")

    def test_hide_disabled(self) -> None:
        keyboard = PaginationKeyboard(
            items=self.ITEMS,
            page=1,
            page_size=3,
            item_button=self.item_button,
            navigation={"hide_disabled": True},
        )
        nav = keyboard.build().inline_keyboard[-1]
        assert [button.text for button in nav] == ["1 / 2", "Next"]

    def test_custom_labels_and_callback_data(self) -> None:
        keyboard = PaginationKeyboard(
            items=self.ITEMS,
            page=2,
            page_size=2,
            item_button=self.item_button,
            callback_data=lambda action, page: f"page:{page}",
            navigation={
                "prev": lambda current, total: f"Back ({current}/{total})",
                "next": "Forward",
                "page_indicator": "indicator",
            },
        )
        nav = keyboard.build().inline_keyboard[-1]
        assert nav[0].text == "Back (2/3)"
        assert nav[0].callback_data == "page:1"
        assert nav[1].text == "indicator"
        assert nav[1].callback_data == "page:2"
        assert nav[2].text == "Forward"
        assert nav[2].callback_data == "page:3"

    def test_custom_disabled_placeholder(self) -> None:
        keyboard = PaginationKeyboard(
            items=self.ITEMS,
            page=2,
            page_size=3,
            item_button=self.item_button,
            navigation={"disabled": "x"},
        )
        nav = keyboard.build().inline_keyboard[-1]
        assert nav[2] == InlineKeyboardButton(text="x", callback_data="pagination:noop:2")

    def test_single_page_has_no_navigation_row(self) -> None:
        keyboard = PaginationKeyboard(items=["a"], item_button=self.item_button)
        rows = keyboard.build().inline_keyboard
        assert len(rows) == 1

    def test_page_clamps_to_total_pages(self) -> None:
        keyboard = PaginationKeyboard(items=self.ITEMS, page=99, item_button=self.item_button)
        assert keyboard.current_page == keyboard.total_pages == 2


class TestInlineQueryResultBuilder:
    def test_article_text_result(self) -> None:
        result = InlineQueryResultBuilder.article("1", "Search Google", description="desc").text(
            "https://google.com"
        )
        assert result["type"] == "article"
        assert result["id"] == "1"
        assert result["title"] == "Search Google"
        assert result["description"] == "desc"
        assert result["input_message_content"] == {"message_text": "https://google.com"}

    def test_article_result_builder_is_exposed(self) -> None:
        builder = ArticleResultBuilder("2", "Title")
        assert builder.text("body")["type"] == "article"

    def test_photo_result_defaults_thumbnail_to_photo_url(self) -> None:
        result = InlineQueryResultBuilder.photo("2", "https://example.com/img.jpg", title="pic")
        assert result["type"] == "photo"
        assert result["photo_url"] == "https://example.com/img.jpg"
        assert result["thumbnail_url"] == "https://example.com/img.jpg"
        assert result["title"] == "pic"

    def test_video_audio_document_gif_results(self) -> None:
        video = InlineQueryResultBuilder.video(
            "3", "https://v.mp4", "video/mp4", "https://t.jpg", "Vid", caption="cap"
        )
        assert video["mime_type"] == "video/mp4"
        assert video["thumbnail_url"] == "https://t.jpg"
        assert video["caption"] == "cap"

        audio = InlineQueryResultBuilder.audio("4", "https://a.mp3", "Song", performer="Band")
        assert audio["audio_url"] == "https://a.mp3"
        assert audio["performer"] == "Band"

        document = InlineQueryResultBuilder.document(
            "5", "File", "https://f.pdf", "application/pdf"
        )
        assert document["document_url"] == "https://f.pdf"

        gif = InlineQueryResultBuilder.gif("6", "https://g.gif", "https://t.jpg", title="Anim")
        assert gif["gif_url"] == "https://g.gif"
        assert gif["title"] == "Anim"

    def test_location_venue_contact_game_results(self) -> None:
        location = InlineQueryResultBuilder.location("7", 10.5, 106.7, "HQ")
        assert location["latitude"] == 10.5
        assert location["longitude"] == 106.7

        venue = InlineQueryResultBuilder.venue("8", 10.5, 106.7, "HQ", "Street 1")
        assert venue["address"] == "Street 1"

        contact = InlineQueryResultBuilder.contact("9", "+84123", "Nam", last_name="N")
        assert contact["phone_number"] == "+84123"
        assert contact["first_name"] == "Nam"
        assert contact["last_name"] == "N"

        game = InlineQueryResultBuilder.game("10", "lumberjack")
        assert game["game_short_name"] == "lumberjack"

    def test_reply_markup_is_forwarded(self) -> None:
        markup = InlineKeyboard().text("Pick", "pick").build()
        result = InlineQueryResultBuilder.photo("11", "https://p.jpg", reply_markup=markup)
        assert result["reply_markup"] is markup
