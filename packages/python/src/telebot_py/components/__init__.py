"""Reusable UI components: keyboards, menus, pagination, inline queries (US3).

All builders emit the existing ``telebot_py.types`` keyboard dataclasses, so
the output can be attached directly to outgoing messages.
"""

from telebot_py.components.inline_query import (
    ArticleResultBuilder,
    InlineQueryResultBuilder,
    ResultDict,
)
from telebot_py.components.keyboard import InlineKeyboard, ReplyKeyboard
from telebot_py.components.menu import (
    BackButton,
    Menu,
    MenuButtonHandler,
    MenuButtonItem,
    MenuLabel,
    MenuNavigationHandler,
    SubmenuButton,
    TextButton,
    UrlButton,
)
from telebot_py.components.pagination import (
    NavAction,
    NavLabel,
    PaginationKeyboard,
    PaginationNavigation,
)

__all__ = [
    "ArticleResultBuilder",
    "BackButton",
    "InlineKeyboard",
    "InlineQueryResultBuilder",
    "Menu",
    "MenuButtonItem",
    "MenuButtonHandler",
    "MenuLabel",
    "MenuNavigationHandler",
    "NavAction",
    "NavLabel",
    "PaginationKeyboard",
    "PaginationNavigation",
    "ReplyKeyboard",
    "ResultDict",
    "SubmenuButton",
    "TextButton",
    "UrlButton",
]
