"""Paginated inline keyboard builder (parity with node pagination.ts)."""

from __future__ import annotations

import math
import typing as t
from collections.abc import Callable, Mapping, Sequence

from telebot_py.types import InlineKeyboardButton, InlineKeyboardMarkup

T = t.TypeVar("T")

NavAction = t.Literal["prev", "next", "noop"]
NavLabel = str | Callable[[int, int], str]


class PaginationNavigation(t.TypedDict, total=False):
    """Customization of pagination control labels and formatting.

    Attributes:
        prev: Label of the previous-page button; static or a formatter
            ``(current_page, total_pages) -> label``. Defaults to 'Previous'.
        next: Label of the next-page button, same shapes. Defaults to 'Next'.
        page_indicator: Label of the middle indicator button. Defaults to
            ``"{current} / {total}"``.
        disabled: Placeholder shown for a disabled navigation button.
            Defaults to '-'.
        hide_disabled: Hide disabled navigation buttons entirely instead of
            the placeholder. Defaults to False.
    """

    prev: NavLabel
    next: NavLabel
    page_indicator: NavLabel
    disabled: str
    hide_disabled: bool


def _default_callback_data(action: NavAction, page: int) -> str:
    return f"pagination:{action}:{page}"


def _resolve_label(label: NavLabel | None, fallback: NavLabel, current: int, total: int) -> str:
    target = label if label is not None else fallback
    return target(current, total) if callable(target) else target


class PaginationKeyboard(t.Generic[T]):
    """Fluent builder for paginated inline keyboard menus.

    Example:
        >>> keyboard = PaginationKeyboard(
        ...     items=products,
        ...     page=1,
        ...     page_size=3,
        ...     item_button=lambda item, index: InlineKeyboardButton(
        ...         text=item, callback_data=f"buy:{item}"
        ...     ),
        ... )
        >>> await bot.send_message(chat_id, "Catalog:", reply_markup=keyboard.build())

    Attributes:
        total_pages: Number of pages after chunking ``items`` by page size.
        current_page: The active page, clamped into ``1..total_pages``.
    """

    def __init__(
        self,
        *,
        items: Sequence[T],
        page: int = 1,
        page_size: int = 5,
        item_button: Callable[[T, int], InlineKeyboardButton],
        callback_data: Callable[[NavAction, int], str] | None = None,
        navigation: Mapping[str, t.Any] | None = None,
    ) -> None:
        """Configure the pagination.

        Args:
            items: Total item list to paginate over.
            page: Current active page index (1-indexed).
            page_size: Number of items displayed per page; at least 1.
            item_button: Builds one button per item; receives the item and
                its global index.
            callback_data: Generator for navigation callback data; defaults
                to ``pagination:{action}:{page}``.
            navigation: Custom labels/formatting per
                :class:`PaginationNavigation`.
        """
        self._items = list(items)
        self._page_size = max(1, page_size)
        self._page = max(1, page)
        self._item_button = item_button
        self._callback_data = callback_data if callback_data is not None else _default_callback_data
        self._navigation: Mapping[str, t.Any] = navigation if navigation is not None else {}

    @property
    def total_pages(self) -> int:
        """Number of pages; at least one even for an empty item list."""
        return max(1, math.ceil(len(self._items) / self._page_size))

    @property
    def current_page(self) -> int:
        """The active page clamped between 1 and total_pages."""
        return min(self._page, self.total_pages)

    def build(self) -> InlineKeyboardMarkup:
        """Build the markup with item buttons and the navigation row.

        Returns:
            The constructed InlineKeyboardMarkup; the navigation row is only
            present when there is more than one page.
        """
        total = self.total_pages
        current = self.current_page

        start = (current - 1) * self._page_size
        page_items = self._items[start : start + self._page_size]

        inline_keyboard: list[list[InlineKeyboardButton]] = [
            [self._item_button(item, start + idx)] for idx, item in enumerate(page_items)
        ]

        if total > 1:
            inline_keyboard.append(self._navigation_row(current, total))
        return InlineKeyboardMarkup(inline_keyboard=inline_keyboard)

    def _navigation_row(self, current: int, total: int) -> list[InlineKeyboardButton]:
        """Compose the prev / indicator / next control row.

        Args:
            current: The clamped current page.
            total: Total number of pages.

        Returns:
            The navigation button row.
        """
        nav = self._navigation
        placeholder = t.cast("str", nav.get("disabled", "-"))
        hide_disabled = bool(nav.get("hide_disabled", False))
        row: list[InlineKeyboardButton] = []

        if current > 1:
            row.append(
                InlineKeyboardButton(
                    text=_resolve_label(nav.get("prev"), "Previous", current, total),
                    callback_data=self._callback_data("prev", current - 1),
                )
            )
        elif not hide_disabled:
            row.append(
                InlineKeyboardButton(
                    text=placeholder, callback_data=self._callback_data("noop", current)
                )
            )

        row.append(
            InlineKeyboardButton(
                text=_resolve_label(
                    nav.get("page_indicator"),
                    lambda curr, tot: f"{curr} / {tot}",
                    current,
                    total,
                ),
                callback_data=self._callback_data("noop", current),
            )
        )

        if current < total:
            row.append(
                InlineKeyboardButton(
                    text=_resolve_label(nav.get("next"), "Next", current, total),
                    callback_data=self._callback_data("next", current + 1),
                )
            )
        elif not hide_disabled:
            row.append(
                InlineKeyboardButton(
                    text=placeholder, callback_data=self._callback_data("noop", current)
                )
            )
        return row
