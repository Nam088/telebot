"""Bulk message Bot API methods (parity with packages/go/pkg/bot/bulk.go)."""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import Requester, clean_payload, parse_flag, parse_list_result
from telebot_py.types.common import MessageId


class BulkMixin(Requester):
    """Bot methods for forwarding, copying, and deleting many messages at once."""

    async def forward_messages(
        self,
        chat_id: int | str,
        from_chat_id: int | str,
        message_ids: Sequence[int],
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
    ) -> list[MessageId]:
        """Forward multiple messages of any kind to a target chat.

        Example:
            >>> ids = await bot.forward_messages(123, "@source", [11, 12])

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            from_chat_id: Unique identifier of the source chat or username of
                the source channel.
            message_ids: Identifiers of the messages to forward, 1-100.
            business_connection_id: Business connection on whose behalf to act.
            message_thread_id: Target message thread identifier.
            disable_notification: Send silently.
            protect_content: Protect the forwarded content from saving.

        Returns:
            The MessageId list of the forwarded messages.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            from_chat_id=from_chat_id,
            message_ids=list(message_ids),
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            disable_notification=disable_notification,
            protect_content=protect_content,
        )
        return parse_list_result(MessageId, await self.request("forwardMessages", payload))

    async def copy_messages(
        self,
        chat_id: int | str,
        from_chat_id: int | str,
        message_ids: Sequence[int],
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        remove_caption: bool | None = None,
    ) -> list[MessageId]:
        """Copy multiple messages without linking to the originals.

        Example:
            >>> ids = await bot.copy_messages("@target", 456, [1, 2])

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            from_chat_id: Unique identifier of the source chat or username of
                the source channel.
            message_ids: Identifiers of the messages to copy, 1-100.
            business_connection_id: Business connection on whose behalf to act.
            message_thread_id: Target message thread identifier.
            disable_notification: Send silently.
            protect_content: Protect the copied content from saving.
            remove_caption: Pass True to copy messages without their captions.

        Returns:
            The MessageId list of the copied messages.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            from_chat_id=from_chat_id,
            message_ids=list(message_ids),
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            disable_notification=disable_notification,
            protect_content=protect_content,
            remove_caption=remove_caption,
        )
        return parse_list_result(MessageId, await self.request("copyMessages", payload))

    async def delete_messages(
        self,
        chat_id: int | str,
        message_ids: Sequence[int],
        *,
        business_connection_id: str | None = None,
    ) -> bool:
        """Delete multiple messages from a chat at once.

        Example:
            >>> ok = await bot.delete_messages(789, [5, 6])

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            message_ids: Identifiers of the messages to delete, 1-100.
            business_connection_id: Business connection on whose behalf to act.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_ids=list(message_ids),
            business_connection_id=business_connection_id,
        )
        return parse_flag(await self.request("deleteMessages", payload))
