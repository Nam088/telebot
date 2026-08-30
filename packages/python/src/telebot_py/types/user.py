"""Telegram User type."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject


@dataclasses.dataclass(frozen=True, slots=True)
class User(TelegramObject):
    """A Telegram user or bot.

    Attributes:
        id: Unique identifier for this user or bot.
        is_bot: Whether this user is a bot.
        first_name: User's or bot's first name.
        last_name: User's or bot's last name, when present.
        username: User's or bot's username without leading '@', when present.
        language_code: IETF language tag of the user's language, when present.
        is_premium: Whether this user is a Telegram Premium user.
        added_to_attachment_menu: Whether this user added the bot to the
            attachment menu.
        can_join_groups: Whether the bot can be invited to groups (getMe only).
        can_read_all_group_messages: Whether privacy mode is disabled for the
            bot in groups (getMe only).
        supports_guest_queries: Whether the bot supports guest queries from
            chats it is not a member of (getMe only).
        supports_inline_queries: Whether the bot supports inline queries
            (getMe only).
        can_connect_to_business: Whether the bot can be connected to a
            Telegram Business account (getMe only).
        has_main_web_app: Whether the bot has a main Web App (getMe only).
        has_topics_enabled: Whether the bot has forum topic mode enabled in
            private chats (getMe only).
        allows_users_to_create_topics: Whether the bot allows users to create
            and delete topics in private chats (getMe only).
        can_manage_bots: Whether other bots can be created to be controlled by
            this bot (getMe only).
        supports_join_request_queries: Whether the bot supports join request
            queries and can be assigned to process them (getMe only).

    Telegram API: https://core.telegram.org/bots/api#user
    """

    id: int
    is_bot: bool
    first_name: str
    last_name: str | None = None
    username: str | None = None
    language_code: str | None = None
    is_premium: bool | None = None
    added_to_attachment_menu: bool | None = None
    can_join_groups: bool | None = None
    can_read_all_group_messages: bool | None = None
    supports_guest_queries: bool | None = None
    supports_inline_queries: bool | None = None
    can_connect_to_business: bool | None = None
    has_main_web_app: bool | None = None
    has_topics_enabled: bool | None = None
    allows_users_to_create_topics: bool | None = None
    can_manage_bots: bool | None = None
    supports_join_request_queries: bool | None = None
