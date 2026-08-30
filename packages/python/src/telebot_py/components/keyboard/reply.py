"""Fluent builder for reply keyboards (parity with node keyboard/reply.ts)."""

from __future__ import annotations

from telebot_py.types import (
    KeyboardButton,
    KeyboardButtonPollType,
    KeyboardButtonRequestChat,
    KeyboardButtonRequestUsers,
    ReplyKeyboardMarkup,
    WebAppInfo,
)


class ReplyKeyboard:
    """Fluent builder for creating reply keyboards.

    Example:
        >>> keyboard = (
        ...     ReplyKeyboard(resize_keyboard=True)
        ...     .text("Option A")
        ...     .text("Option B")
        ...     .row()
        ...     .request_location("Share Location")
        ... )
        >>> await bot.send_message(chat_id, "Choose:", reply_markup=keyboard.build())
    """

    def __init__(
        self,
        *,
        resize_keyboard: bool | None = None,
        one_time_keyboard: bool | None = None,
        is_persistent: bool | None = None,
        input_field_placeholder: str | None = None,
        selective: bool | None = None,
    ) -> None:
        """Start a builder with a single empty row.

        Args:
            resize_keyboard: Request clients to resize the keyboard
                vertically for optimal fit.
            one_time_keyboard: Request clients to hide the keyboard as soon
                as it has been used.
            is_persistent: Request clients to always show the keyboard when
                the regular keyboard is hidden.
            input_field_placeholder: Placeholder shown in the input field when
                the keyboard is active; 1-64 characters.
            selective: Show the keyboard to specific users only.
        """
        self._rows: list[list[KeyboardButton]] = [[]]
        self._resize_keyboard = resize_keyboard
        self._one_time_keyboard = one_time_keyboard
        self._is_persistent = is_persistent
        self._input_field_placeholder = input_field_placeholder
        self._selective = selective

    def text(self, text: str) -> ReplyKeyboard:
        """Append a plain text button to the current row.

        Args:
            text: Text sent to the bot as a message when pressed.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(KeyboardButton(text=text))
        return self

    def request_contact(self, text: str) -> ReplyKeyboard:
        """Append a button prompting the user to share their contact.

        Args:
            text: Button label text.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(KeyboardButton(text=text, request_contact=True))
        return self

    def request_location(self, text: str) -> ReplyKeyboard:
        """Append a button prompting the user to share their location.

        Args:
            text: Button label text.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(KeyboardButton(text=text, request_location=True))
        return self

    def request_poll(self, text: str, *, type: str | None = None) -> ReplyKeyboard:  # noqa: A002
        """Append a button prompting the user to create a poll.

        Args:
            text: Button label text.
            type: Optional poll type restriction ('quiz' or 'regular').

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(
            KeyboardButton(text=text, request_poll=KeyboardButtonPollType(type=type))
        )
        return self

    def web_app(self, text: str, url: str) -> ReplyKeyboard:
        """Append a button launching a Telegram Mini App.

        Args:
            text: Button label text.
            url: HTTPS URL of the Web App.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(KeyboardButton(text=text, web_app=WebAppInfo(url=url)))
        return self

    def request_users(
        self,
        text: str,
        request_id: int,
        *,
        user_is_bot: bool | None = None,
        user_is_premium: bool | None = None,
        max_quantity: int | None = None,
        request_name: bool | None = None,
        request_username: bool | None = None,
        request_photo: bool | None = None,
    ) -> ReplyKeyboard:
        """Append a button prompting the user to select one or more users.

        Args:
            text: Button label text.
            request_id: Signed 32-bit identifier of the request.
            user_is_bot: Pass True to request bots, False for regular users.
            user_is_premium: Pass True to request premium users.
            max_quantity: Maximum number of users selectable; 1-10.
            request_name: Request the users' first and last name.
            request_username: Request the users' username.
            request_photo: Request the users' photo.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(
            KeyboardButton(
                text=text,
                request_users=KeyboardButtonRequestUsers(
                    request_id=request_id,
                    user_is_bot=user_is_bot,
                    user_is_premium=user_is_premium,
                    max_quantity=max_quantity,
                    request_name=request_name,
                    request_username=request_username,
                    request_photo=request_photo,
                ),
            )
        )
        return self

    def request_chat(
        self,
        text: str,
        request_id: int,
        *,
        chat_is_channel: bool,
        chat_is_forum: bool | None = None,
        chat_has_username: bool | None = None,
        chat_is_created: bool | None = None,
        bot_is_member: bool | None = None,
        request_title: bool | None = None,
        request_username: bool | None = None,
        request_photo: bool | None = None,
    ) -> ReplyKeyboard:
        """Append a button prompting the user to select a chat.

        Args:
            text: Button label text.
            request_id: Signed 32-bit identifier of the request.
            chat_is_channel: True to request a channel chat, False for a
                group or supergroup chat.
            chat_is_forum: True to request a forum supergroup.
            chat_has_username: True to request a chat with a username.
            chat_is_created: True to request a chat owned by the user.
            bot_is_member: True to request a chat with the bot as a member.
            request_title: Request the chat's title.
            request_username: Request the chat's username.
            request_photo: Request the chat's photo.

        Returns:
            This builder, for chaining.
        """
        self._rows[-1].append(
            KeyboardButton(
                text=text,
                request_chat=KeyboardButtonRequestChat(
                    request_id=request_id,
                    chat_is_channel=chat_is_channel,
                    chat_is_forum=chat_is_forum,
                    chat_has_username=chat_has_username,
                    chat_is_created=chat_is_created,
                    bot_is_member=bot_is_member,
                    request_title=request_title,
                    request_username=request_username,
                    request_photo=request_photo,
                ),
            )
        )
        return self

    def row(self) -> ReplyKeyboard:
        """Advance the builder to start a new keyboard row.

        A no-op when the current row is already empty (node parity).

        Returns:
            This builder, for chaining.
        """
        if self._rows[-1]:
            self._rows.append([])
        return self

    def build(self) -> ReplyKeyboardMarkup:
        """Build the final markup, dropping empty rows.

        Returns:
            The constructed ReplyKeyboardMarkup with the configured options.
        """
        return ReplyKeyboardMarkup(
            keyboard=[row for row in self._rows if row],
            resize_keyboard=self._resize_keyboard,
            one_time_keyboard=self._one_time_keyboard,
            is_persistent=self._is_persistent,
            input_field_placeholder=self._input_field_placeholder,
            selective=self._selective,
        )
