"""Fluent builder for inline keyboards (parity with node keyboard/inline.ts).

Produces the framework's :class:`telebot_py.types.InlineKeyboardMarkup` /
:class:`telebot_py.types.InlineKeyboardButton` types directly; no component
specific button classes exist in Python (the node classes duplicate the wire
types, which telebot_py.types already provides).
"""

from __future__ import annotations

from telebot_py.types import (
    CopyTextButton,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    WebAppInfo,
)


class InlineKeyboard:
    """Fluent builder for creating inline keyboards.

    Example:
        >>> keyboard = (
        ...     InlineKeyboard()
        ...     .text("Option 1", "opt_1")
        ...     .text("Option 2", "opt_2")
        ...     .row()
        ...     .url("Website", "https://example.com")
        ... )
        >>> await bot.send_message(chat_id, "Choose:", reply_markup=keyboard.build())
    """

    def __init__(self) -> None:
        """Start a builder with a single empty row."""
        self._rows: list[list[InlineKeyboardButton]] = [[]]

    def text(self, text: str, callback_data: str) -> InlineKeyboard:
        """Append a callback button to the current row.

        Args:
            text: Label text on the button.
            callback_data: Data sent in a callback query when pressed.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(InlineKeyboardButton(text=text, callback_data=callback_data))
        return self

    def url(self, text: str, url: str) -> InlineKeyboard:
        """Append an HTTP or tg:// URL button to the current row.

        Args:
            text: Label text on the button.
            url: URL opened when the button is pressed.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(InlineKeyboardButton(text=text, url=url))
        return self

    def web_app(self, text: str, url: str) -> InlineKeyboard:
        """Append a Web App button to the current row.

        Args:
            text: Label text on the button.
            url: HTTPS URL of the Web App to open.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(InlineKeyboardButton(text=text, web_app=WebAppInfo(url=url)))
        return self

    def switch_inline_query(self, text: str, query: str = "") -> InlineKeyboard:
        """Append an inline-query button to the current row.

        Args:
            text: Label text on the button.
            query: Inline query inserted in the chat input field.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(InlineKeyboardButton(text=text, switch_inline_query=query))
        return self

    def switch_inline_query_current_chat(self, text: str, query: str = "") -> InlineKeyboard:
        """Append an inline-query button targeting the current chat.

        Args:
            text: Label text on the button.
            query: Inline query inserted in the current chat.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(
            InlineKeyboardButton(text=text, switch_inline_query_current_chat=query)
        )
        return self

    def copy_text(self, text: str, copy_text: str) -> InlineKeyboard:
        """Append a copy-to-clipboard button to the current row.

        Args:
            text: Label text on the button.
            copy_text: Text copied to the clipboard when pressed.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(
            InlineKeyboardButton(text=text, copy_text=CopyTextButton(text=copy_text))
        )
        return self

    def row(self) -> InlineKeyboard:
        """Advance the builder to start a new keyboard row.

        A no-op when the current row is already empty (node parity).

        Returns:
            This builder, for chaining.
        """
        if self._rows[-1]:
            self._rows.append([])
        return self

    def build(self) -> InlineKeyboardMarkup:
        """Build the final markup, dropping empty rows.

        Returns:
            The constructed InlineKeyboardMarkup.
        """
        return InlineKeyboardMarkup(inline_keyboard=[row for row in self._rows if row])
