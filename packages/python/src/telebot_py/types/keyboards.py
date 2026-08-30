"""Telegram keyboard and reply markup types."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject


@dataclasses.dataclass(frozen=True, slots=True)
class WebAppInfo(TelegramObject):
    """Describes a Web App that can be launched from a button.

    Attributes:
        url: An HTTPS URL of a Web App to be opened.
    """

    url: str


@dataclasses.dataclass(frozen=True, slots=True)
class LoginUrl(TelegramObject):
    """Parameter of the inline keyboard button used to authorize a user.

    Attributes:
        url: An HTTPS URL used to automatically authorize the user.
        forward_text: New text of the button in forwarded messages.
        bot_username: Username of a bot which will be used for authorization.
        request_write_access: Whether to request permission for the bot to
            send messages to the user.
    """

    url: str
    forward_text: str | None = None
    bot_username: str | None = None
    request_write_access: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class SwitchInlineQueryChosenChat(TelegramObject):
    """An inline button switching the user to inline mode in a chosen chat.

    Attributes:
        query: The default inline query inserted in the input field.
        allow_user_chats: Whether private chats with users can be chosen.
        allow_bot_chats: Whether private chats with bots can be chosen.
        allow_group_chats: Whether group and supergroup chats can be chosen.
        allow_channel_chats: Whether channel chats can be chosen.
    """

    query: str | None = None
    allow_user_chats: bool | None = None
    allow_bot_chats: bool | None = None
    allow_group_chats: bool | None = None
    allow_channel_chats: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class CopyTextButton(TelegramObject):
    """An inline keyboard button copying specified text to the clipboard.

    Attributes:
        text: The text to be copied to the clipboard; 1-256 characters.
    """

    text: str


@dataclasses.dataclass(frozen=True, slots=True)
class InlineKeyboardButton(TelegramObject):
    """One button of an inline keyboard.

    Attributes:
        text: Label text on the button.
        icon_custom_emoji_id: Unique identifier of the custom emoji shown
            before the text of the button.
        style: Style of the button ('danger', 'success', 'primary').
        url: HTTP or tg:// URL opened when the button is pressed.
        callback_data: Data sent in a callback query when pressed (1-64 bytes).
        web_app: Description of the Web App launched when pressed.
        login_url: An HTTPS URL used to automatically authorize the user.
        switch_inline_query: If set, prompts chat selection and inserts the
            bot's username and this inline query.
        switch_inline_query_current_chat: If set, inserts the bot's username
            and this inline query in the current chat's input field.
        switch_inline_query_chosen_chat: If set, prompts chat selection of the
            specified types.
        copy_text: Description of the button copying text to the clipboard.
        callback_game: Description of the game launched when pressed
            (payload kept raw; the node CallbackGame is a placeholder map).
        pay: Whether to send a Pay button.
        disabled: If set, the button is disabled and does nothing
            (Bot API 10.3+; the node DisabledButton is an empty object).
    """

    text: str
    icon_custom_emoji_id: str | None = None
    style: str | None = None
    url: str | None = None
    callback_data: str | None = None
    web_app: WebAppInfo | None = None
    login_url: LoginUrl | None = None
    switch_inline_query: str | None = None
    switch_inline_query_current_chat: str | None = None
    switch_inline_query_chosen_chat: SwitchInlineQueryChosenChat | None = None
    copy_text: CopyTextButton | None = None
    callback_game: object | None = None
    pay: bool | None = None
    disabled: object | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class InlineKeyboardMarkup(TelegramObject):
    """An inline keyboard appearing right next to the message it belongs to.

    Attributes:
        inline_keyboard: Array of button rows, each an array of
            InlineKeyboardButton objects.
        force_reply: Whether the reply interface must be shown to the user
            (Bot API 10.3+).
    """

    inline_keyboard: list[list[InlineKeyboardButton]]
    force_reply: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class KeyboardButtonPollType(TelegramObject):
    """Type of poll that can be created with a keyboard button.

    Attributes:
        type: If 'quiz', the user can only create a poll in quiz mode.
    """

    type: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class KeyboardButtonRequestUsers(TelegramObject):
    """Defines the criteria used to request suitable users.

    Attributes:
        request_id: Signed 32-bit identifier of the request, received back in
            the UsersShared object.
        user_is_bot: Pass True to request bots, False for regular users.
        user_is_premium: Pass True to request premium users, False otherwise.
        max_quantity: Maximum number of users to be selected; 1-10.
        request_name: Whether to request the users' first and last name.
        request_username: Whether to request the users' username.
        request_photo: Whether to request the users' photo.
    """

    request_id: int
    user_is_bot: bool | None = None
    user_is_premium: bool | None = None
    max_quantity: int | None = None
    request_name: bool | None = None
    request_username: bool | None = None
    request_photo: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class KeyboardButtonRequestChat(TelegramObject):
    """Defines the criteria used to request a suitable chat.

    Attributes:
        request_id: Signed 32-bit identifier of the request, received back in
            the ChatShared object.
        chat_is_channel: True to request a channel chat, False for a group or
            supergroup chat.
        chat_is_forum: True to request a forum supergroup.
        chat_has_username: True to request a chat with a username.
        chat_is_created: True to request a chat owned by the user.
        user_administrator_rights: JSON-serialized required administrator
            rights of the user in the chat (kept raw per node typing).
        bot_administrator_rights: JSON-serialized required administrator
            rights of the bot in the chat (kept raw per node typing).
        bot_is_member: True to request a chat with the bot as a member.
        request_title: Whether to request the chat's title.
        request_username: Whether to request the chat's username.
        request_photo: Whether to request the chat's photo.
    """

    request_id: int
    chat_is_channel: bool
    chat_is_forum: bool | None = None
    chat_has_username: bool | None = None
    chat_is_created: bool | None = None
    user_administrator_rights: object | None = None
    bot_administrator_rights: object | None = None
    bot_is_member: bool | None = None
    request_title: bool | None = None
    request_username: bool | None = None
    request_photo: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class KeyboardButton(TelegramObject):
    """One button of the reply keyboard.

    Attributes:
        text: Text of the button; sent as a message when pressed if none of
            the optional fields are used.
        request_users: If specified, opens a list of suitable users.
        request_chat: If specified, opens a list of suitable chats.
        request_contact: If True, the user's phone number will be sent as a
            contact when pressed. Available in private chats only.
        request_location: If True, the user's current location will be sent
            when pressed. Available in private chats only.
        request_poll: If specified, the user is asked to create a poll.
            Available in private chats only.
        web_app: If specified, the described Web App launches when pressed.
    """

    text: str
    request_users: KeyboardButtonRequestUsers | None = None
    request_chat: KeyboardButtonRequestChat | None = None
    request_contact: bool | None = None
    request_location: bool | None = None
    request_poll: KeyboardButtonPollType | None = None
    web_app: WebAppInfo | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ReplyKeyboardMarkup(TelegramObject):
    """A custom keyboard with reply options.

    Attributes:
        keyboard: Array of button rows, each an array of KeyboardButton
            objects.
        is_persistent: Whether to always show the keyboard when the regular
            keyboard is hidden.
        resize_keyboard: Whether to resize the keyboard vertically for
            optimal fit.
        one_time_keyboard: Whether to hide the keyboard as soon as it has
            been used.
        input_field_placeholder: Placeholder shown in the input field when the
            keyboard is active; 1-64 characters.
        selective: Whether to show the keyboard to specific users only.
        force_reply: Whether the reply interface must be shown to the user
            (Bot API 10.3+).
    """

    keyboard: list[list[KeyboardButton]]
    is_persistent: bool | None = None
    resize_keyboard: bool | None = None
    one_time_keyboard: bool | None = None
    input_field_placeholder: str | None = None
    selective: bool | None = None
    force_reply: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ReplyKeyboardRemove(TelegramObject):
    """Requests clients to remove the custom keyboard.

    Attributes:
        remove_keyboard: Requests clients to remove the custom keyboard;
            always True on the wire.
        selective: Whether to remove the keyboard for specific users only.
    """

    remove_keyboard: bool = True
    selective: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class ForceReply(TelegramObject):
    """Shows reply interface to the user, as if they tapped 'Reply'.

    Attributes:
        force_reply: Shows the reply interface; always True on the wire.
        input_field_placeholder: Placeholder shown in the input field when the
            reply is active; 1-64 characters.
        selective: Whether to force reply from specific users only.
    """

    force_reply: bool = True
    input_field_placeholder: str | None = None
    selective: bool | None = None
