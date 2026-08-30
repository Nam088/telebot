"""Chat management Bot API methods (parity with packages/go/pkg/bot/chat_management.go)."""

from __future__ import annotations

import typing as t

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    parse_result,
    parse_string,
    to_wire,
)
from telebot_py.types.base import TypeParseError
from telebot_py.types.chat import ChatAdministratorRights
from telebot_py.types.topics import (
    MenuButton,
    MenuButtonCommands,
    MenuButtonDefault,
    MenuButtonWebApp,
)


class ChatManagementMixin(Requester):
    """Bot methods for chat titles, photos, pins, permissions, and settings."""

    async def set_chat_title(self, chat_id: int | str, title: str) -> bool:
        """Change the title of a chat.

        Titles can't be changed for private chats; the bot must be an
        administrator.

        Example:
            >>> ok = await bot.set_chat_title(-100, "New Title")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            title: New chat title; 0-128 characters.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, title=title)
        return parse_flag(await self.request("setChatTitle", payload))

    async def set_chat_description(self, chat_id: int | str, description: str) -> bool:
        """Change the description of a group, supergroup, or channel.

        Example:
            >>> ok = await bot.set_chat_description("@channel", "New description")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            description: New chat description; 0-255 characters.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, description=description)
        return parse_flag(await self.request("setChatDescription", payload))

    async def set_chat_photo(self, chat_id: int | str, photo: str) -> bool:
        """Set a new profile photo for the chat.

        Photos can't be changed for private chats; the bot must be an
        administrator. Accepts a ``file_id`` string; multipart uploads are
        intentionally out of scope (JSON payloads only).

        Example:
            >>> ok = await bot.set_chat_photo(-100, "photo_file_id")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            photo: New chat photo ``file_id``.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, photo=photo)
        return parse_flag(await self.request("setChatPhoto", payload))

    async def delete_chat_photo(self, chat_id: int | str) -> bool:
        """Delete a chat photo.

        Photos can't be deleted for private chats; the bot must be an
        administrator.

        Example:
            >>> ok = await bot.delete_chat_photo(-100)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id)
        return parse_flag(await self.request("deleteChatPhoto", payload))

    async def pin_chat_message(
        self,
        chat_id: int | str,
        message_id: int,
        *,
        disable_notification: bool | None = None,
    ) -> bool:
        """Add a message to the list of pinned messages in a chat.

        Example:
            >>> ok = await bot.pin_chat_message(-100, 42)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            message_id: Identifier of the message to pin.
            disable_notification: Pin without sending a notification.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_id=message_id,
            disable_notification=disable_notification,
        )
        return parse_flag(await self.request("pinChatMessage", payload))

    async def unpin_chat_message(self, chat_id: int | str, message_id: int | None = None) -> bool:
        """Remove a message from the list of pinned messages in a chat.

        Example:
            >>> ok = await bot.unpin_chat_message(-100, 42)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            message_id: Identifier of the message to unpin; omit to unpin the
                most recently pinned message.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, message_id=message_id)
        return parse_flag(await self.request("unpinChatMessage", payload))

    async def unpin_all_chat_messages(self, chat_id: int | str) -> bool:
        """Clear the list of pinned messages in a chat.

        Example:
            >>> ok = await bot.unpin_all_chat_messages(-100)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id)
        return parse_flag(await self.request("unpinAllChatMessages", payload))

    async def set_chat_permissions(
        self,
        chat_id: int | str,
        permissions: MarkupLike,
        *,
        use_independent_chat_permissions: bool | None = None,
    ) -> bool:
        """Set default chat permissions for all members.

        The bot must be an administrator in the group or a supergroup.

        Example:
            >>> ok = await bot.set_chat_permissions(-100, {"can_send_messages": True})

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            permissions: New default permissions as a ChatPermissions dict or
                ``to_dict`` object.
            use_independent_chat_permissions: Pass True if permissions apply
                independently of chat-level permissions.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            permissions=to_wire(permissions),
            use_independent_chat_permissions=use_independent_chat_permissions,
        )
        return parse_flag(await self.request("setChatPermissions", payload))

    async def export_chat_invite_link(self, chat_id: int | str) -> str:
        """Generate a new primary invite link for a chat.

        Any previously generated primary link is revoked. The bot must be an
        administrator in the chat.

        Example:
            >>> link = await bot.export_chat_invite_link(-100)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.

        Returns:
            The exported invite link.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id)
        return parse_string(await self.request("exportChatInviteLink", payload))

    async def set_chat_menu_button(
        self, chat_id: int | None = None, menu_button: MarkupLike | None = None
    ) -> bool:
        """Change the bot's menu button in a private chat, or the default one.

        Example:
            >>> ok = await bot.set_chat_menu_button(42, {"type": "commands"})

        Args:
            chat_id: Unique identifier of the target private chat; omit for
                the default menu button.
            menu_button: New menu button as a MenuButton dict or ``to_dict``
                object.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, menu_button=to_wire(menu_button))
        return parse_flag(await self.request("setChatMenuButton", payload))

    async def get_chat_menu_button(self, chat_id: int | None = None) -> MenuButton:
        """Get the current value of the bot's menu button.

        Example:
            >>> button = await bot.get_chat_menu_button()

        Args:
            chat_id: Unique identifier of the target private chat; omit for
                the default menu button.

        Returns:
            The MenuButton variant currently set.

        Raises:
            TypeParseError: If Telegram returns an unsupported menu button type.
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id)
        result = await self.request("getChatMenuButton", payload)
        if not isinstance(result, t.Mapping):
            msg = f"expected JSON object for MenuButton, got {type(result).__name__}"
            raise TypeParseError(msg)
        data = t.cast("t.Mapping[str, object]", result)
        button_type = data.get("type")
        if button_type == "commands":
            return MenuButtonCommands.from_dict(data)
        if button_type == "web_app":
            return MenuButtonWebApp.from_dict(data)
        if button_type == "default":
            return MenuButtonDefault.from_dict(data)
        msg = f"unsupported menu button type: {button_type}"
        raise TypeParseError(msg)

    async def set_my_default_administrator_rights(
        self,
        rights: MarkupLike,
        *,
        for_channels: bool | None = None,
    ) -> bool:
        """Change the default administrator rights of the bot.

        Example:
            >>> ok = await bot.set_my_default_administrator_rights(rights_dict)

        Args:
            rights: New default rights as a ChatAdministratorRights dict or
                ``to_dict`` object.
            for_channels: Pass True to change rights for channel posts.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(rights=to_wire(rights), for_channels=for_channels)
        return parse_flag(await self.request("setMyDefaultAdministratorRights", payload))

    async def get_my_default_administrator_rights(
        self, *, for_channels: bool | None = None
    ) -> ChatAdministratorRights:
        """Get the current default administrator rights of the bot.

        Example:
            >>> rights = await bot.get_my_default_administrator_rights()

        Args:
            for_channels: Pass True to get rights for channel posts.

        Returns:
            The ChatAdministratorRights currently set as the default.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(for_channels=for_channels)
        return parse_result(
            ChatAdministratorRights,
            await self.request("getMyDefaultAdministratorRights", payload),
        )

    async def set_chat_sticker_set(self, chat_id: int | str, sticker_set_name: str) -> bool:
        """Set a new group sticker set for a supergroup.

        The bot must be an administrator in the chat for this to work and must
        have the ``can_change_info`` administrator right. Use the field
        ``active_sticker_set_id`` returned by ``get_chat`` to test whether the
        bot can set the sticker set.

        Example:
            >>> ok = await bot.set_chat_sticker_set(-100, "test_set_by_bot")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            sticker_set_name: Name of the sticker set to be set as the group
                sticker set.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, sticker_set_name=sticker_set_name)
        return parse_flag(await self.request("setChatStickerSet", payload))

    async def delete_chat_sticker_set(self, chat_id: int | str) -> bool:
        """Delete the group sticker set from a supergroup.

        The bot must be an administrator in the chat for this to work and must
        have the appropriate administrator rights.

        Example:
            >>> ok = await bot.delete_chat_sticker_set(-100)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id)
        return parse_flag(await self.request("deleteChatStickerSet", payload))
