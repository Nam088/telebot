"""Interactive nested inline menu builder (parity with node menu/menu.ts).

Callback routing uses the node scheme so buttons are wire-compatible:
``m:{menu}:b:{row}:{col}`` (text), ``m:{menu}:s:{target}:{row}:{col}``
(submenu), ``m:{menu}:k:{row}:{col}`` (back). The dispatch middleware from
the node version lands with the kernel integration pass; this module covers
the builder/render/lookup surface.
"""

from __future__ import annotations

import typing as t

from telebot_py.components.menu.renderer import build_menu_keyboard, render_menu_keyboard
from telebot_py.components.menu.types import (
    BackButton,
    MenuButtonHandler,
    MenuButtonItem,
    MenuLabel,
    MenuNavigationHandler,
    SubmenuButton,
    TextButton,
    UrlButton,
)
from telebot_py.types import InlineKeyboardMarkup

if t.TYPE_CHECKING:
    from telebot_py.kernel.context import CallbackContext

_DEFAULT_BACK_LABEL = "Back"


class Menu:
    """A nested inline menu with dynamic navigation and callback routing.

    Example:
        >>> settings = Menu("settings").back("Go back")
        >>> main = (
        ...     Menu("main")
        ...     .text("Click me", on_click)
        ...     .row()
        ...     .submenu("Settings", settings)
        ... )
        >>> await bot.send_message(chat_id, "Menu:", reply_markup=main.build())

    Attributes:
        id: Unique string identifier for this menu.
        parent: The parent menu when this instance is a submenu.
    """

    def __init__(self, id: str) -> None:  # noqa: A002 - parity with the node API
        """Create a new menu.

        Args:
            id: Unique identifier; embedded in every button's callback data.

        Raises:
            ValueError: If ``id`` is empty or whitespace-only.
        """
        if not id or not id.strip():
            msg = "Menu id must be a non-empty string."
            raise ValueError(msg)
        self.id = id.strip()
        self.parent: Menu | None = None
        self._rows: list[list[MenuButtonItem]] = [[]]
        self._submenus: dict[str, Menu] = {}

    def text(self, label: MenuLabel, handler: MenuButtonHandler) -> Menu:
        """Append an interactive callback button to the current row.

        Args:
            label: Static label or (possibly async) resolver.
            handler: Callback executed when the button is clicked.

        Returns:
            This menu, for chaining.

        Example:
            >>> menu.text("Click me", on_click)
        """
        self._rows[-1].append(TextButton(label=label, handler=handler))
        return self

    def row(self) -> Menu:
        """Advance to a new button row; no-op if the current row is empty.

        Returns:
            This menu, for chaining.
        """
        if self._rows[-1]:
            self._rows.append([])
        return self

    def submenu(
        self,
        label: MenuLabel,
        target_menu: Menu,
        on_navigate: MenuNavigationHandler | None = None,
    ) -> Menu:
        """Append a navigation button leading to a child menu.

        Args:
            label: Static label or (possibly async) resolver.
            target_menu: The destination submenu to open.
            on_navigate: Optional hook executed before switching menus.

        Returns:
            This menu, for chaining.

        Example:
            >>> menu.submenu("Preferences", preferences_menu)
        """
        target_menu.parent = self
        self._submenus[target_menu.id] = target_menu
        self._rows[-1].append(
            SubmenuButton(label=label, target_menu=target_menu, on_navigate=on_navigate)
        )
        return self

    def back(
        self,
        label: MenuLabel = _DEFAULT_BACK_LABEL,
        on_navigate: MenuNavigationHandler | None = None,
    ) -> Menu:
        """Append a back button returning to the parent menu.

        Args:
            label: Button label; defaults to 'Back'.
            on_navigate: Optional hook executed before navigating back.

        Returns:
            This menu, for chaining.

        Example:
            >>> submenu.back("Go back")
        """
        self._rows[-1].append(BackButton(label=label, on_navigate=on_navigate))
        return self

    def url(self, label: MenuLabel, url: str) -> Menu:
        """Append an external URL button to the current row.

        Args:
            label: Static label or (possibly async) resolver.
            url: HTTP or tg:// URL opened when the button is clicked.

        Returns:
            This menu, for chaining.
        """
        self._rows[-1].append(UrlButton(label=label, url=url))
        return self

    def build(self, ctx: CallbackContext | None = None) -> InlineKeyboardMarkup:
        """Synchronously build this menu's inline keyboard markup.

        Args:
            ctx: Optional context for dynamic label resolution.

        Returns:
            The constructed InlineKeyboardMarkup.

        Example:
            >>> await bot.send_message(chat_id, "Choose:", reply_markup=menu.build(ctx))
        """
        return build_menu_keyboard(self.id, self._rows, ctx)

    async def render(self, ctx: CallbackContext | None = None) -> InlineKeyboardMarkup:
        """Asynchronously build the markup, awaiting async label resolvers.

        Args:
            ctx: Optional context for dynamic label resolution.

        Returns:
            The constructed InlineKeyboardMarkup.
        """
        return await render_menu_keyboard(self.id, self._rows, ctx)

    def find_menu(self, menu_id: str, visited: set[Menu] | None = None) -> Menu | None:
        """Find a menu by identifier anywhere in this menu's hierarchy.

        Args:
            menu_id: Identifier of the menu to locate.
            visited: Internal cycle guard; omit on the first call.

        Returns:
            The matching menu, or None when not found.
        """
        seen = visited if visited is not None else set()
        if self in seen:
            return None
        seen.add(self)

        if self.id == menu_id:
            return self
        for submenu in self._submenus.values():
            found = submenu.find_menu(menu_id, seen)
            if found is not None:
                return found
        if self.parent is not None:
            return self.parent.find_menu(menu_id, seen)
        return None
