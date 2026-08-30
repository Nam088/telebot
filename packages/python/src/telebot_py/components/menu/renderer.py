"""Menu keyboard rendering engine (parity with node menu/renderer.ts)."""

from __future__ import annotations

import inspect
import typing as t

from telebot_py.components.menu.types import (
    BackButton,
    MenuButtonItem,
    SubmenuButton,
    TextButton,
    UrlButton,
)
from telebot_py.types import InlineKeyboardButton, InlineKeyboardMarkup

if t.TYPE_CHECKING:
    from telebot_py.kernel.context import CallbackContext


def _resolve_label_sync(item: MenuButtonItem, ctx: CallbackContext | None) -> str:
    """Resolve a possibly-dynamic label to a string without awaiting."""
    label = item.label
    if callable(label):
        try:
            result = label(ctx)
        except Exception:  # noqa: BLE001 - node parity: label errors render ""
            return ""
        return result if isinstance(result, str) else ""
    return label


async def _resolve_label_async(item: MenuButtonItem, ctx: CallbackContext | None) -> str:
    """Resolve a possibly-dynamic label, awaiting async resolvers."""
    label = item.label
    if callable(label):
        try:
            result = label(ctx)
            if inspect.isawaitable(result):
                result = await result
        except Exception:  # noqa: BLE001 - node parity: label errors render ""
            return ""
        return result if isinstance(result, str) else ""
    return label


def _to_button(
    item: MenuButtonItem, menu_id: str, row: int, col: int, text: str
) -> InlineKeyboardButton:
    """Map one menu item to a wire InlineKeyboardButton with its routing data."""
    if isinstance(item, TextButton):
        return InlineKeyboardButton(text=text, callback_data=f"m:{menu_id}:b:{row}:{col}")
    if isinstance(item, SubmenuButton):
        return InlineKeyboardButton(
            text=text, callback_data=f"m:{menu_id}:s:{item.target_menu.id}:{row}:{col}"
        )
    if isinstance(item, BackButton):
        return InlineKeyboardButton(text=text, callback_data=f"m:{menu_id}:k:{row}:{col}")
    if isinstance(item, UrlButton):
        return InlineKeyboardButton(text=text, url=item.url)
    msg = f"unknown menu button item: {item!r}"  # pragma: no cover
    raise TypeError(msg)  # pragma: no cover


def build_menu_keyboard(
    menu_id: str,
    rows: list[list[MenuButtonItem]],
    ctx: CallbackContext | None = None,
) -> InlineKeyboardMarkup:
    """Synchronously build a menu's inline keyboard markup.

    Args:
        menu_id: Identifier embedded in each button's callback data.
        rows: The menu's button grid.
        ctx: Optional context for dynamic label resolution.

    Returns:
        The constructed InlineKeyboardMarkup (empty rows dropped).
    """
    inline_keyboard: list[list[InlineKeyboardButton]] = []
    for r, row in enumerate(rows):
        keyboard_row: list[InlineKeyboardButton] = []
        for c, item in enumerate(row):
            text = _resolve_label_sync(item, ctx)
            keyboard_row.append(_to_button(item, menu_id, r, c, text))
        if keyboard_row:
            inline_keyboard.append(keyboard_row)
    return InlineKeyboardMarkup(inline_keyboard=inline_keyboard)


async def render_menu_keyboard(
    menu_id: str,
    rows: list[list[MenuButtonItem]],
    ctx: CallbackContext | None = None,
) -> InlineKeyboardMarkup:
    """Asynchronously build a menu's markup, awaiting async labels.

    Args:
        menu_id: Identifier embedded in each button's callback data.
        rows: The menu's button grid.
        ctx: Optional context for dynamic label resolution.

    Returns:
        The constructed InlineKeyboardMarkup (empty rows dropped).
    """
    inline_keyboard: list[list[InlineKeyboardButton]] = []
    for r, row in enumerate(rows):
        keyboard_row: list[InlineKeyboardButton] = []
        for c, item in enumerate(row):
            text = await _resolve_label_async(item, ctx)
            keyboard_row.append(_to_button(item, menu_id, r, c, text))
        if keyboard_row:
            inline_keyboard.append(keyboard_row)
    return InlineKeyboardMarkup(inline_keyboard=inline_keyboard)
