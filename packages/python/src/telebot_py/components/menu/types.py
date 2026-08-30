"""Menu button item model and label/handler type aliases (parity with node)."""

from __future__ import annotations

import dataclasses
import typing as t
from collections.abc import Awaitable, Callable

if t.TYPE_CHECKING:
    from telebot_py.components.menu.menu import Menu
    from telebot_py.kernel.context import CallbackContext

# A label is a static string or a (possibly async) resolver receiving the context.
MenuLabel: t.TypeAlias = (
    str
    | Callable[["CallbackContext | None"], str]
    | Callable[["CallbackContext | None"], Awaitable[str]]
)

# Click / navigation handlers receive the context and return nothing.
MenuButtonHandler: t.TypeAlias = Callable[["CallbackContext | None"], Awaitable[None] | None]
MenuNavigationHandler: t.TypeAlias = Callable[["CallbackContext | None"], Awaitable[None] | None]


@dataclasses.dataclass(frozen=True, slots=True)
class TextButton:
    """Interactive callback button with a click handler.

    Attributes:
        label: Static or dynamic button label.
        handler: Callback executed when the button is clicked.
    """

    label: MenuLabel
    handler: MenuButtonHandler


@dataclasses.dataclass(frozen=True, slots=True)
class SubmenuButton:
    """Navigation button leading to a child menu.

    Attributes:
        label: Static or dynamic button label.
        target_menu: Destination submenu to open.
        on_navigate: Optional hook executed before switching menus.
    """

    label: MenuLabel
    target_menu: Menu
    on_navigate: MenuNavigationHandler | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class BackButton:
    """Navigation button returning to the parent menu.

    Attributes:
        label: Static or dynamic button label.
        on_navigate: Optional hook executed before navigating back.
    """

    label: MenuLabel
    on_navigate: MenuNavigationHandler | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class UrlButton:
    """External URL button.

    Attributes:
        label: Static or dynamic button label.
        url: HTTP or tg:// URL opened when clicked.
    """

    label: MenuLabel
    url: str


MenuButtonItem: t.TypeAlias = TextButton | SubmenuButton | BackButton | UrlButton
