"""Forum topic Bot API methods (parity with packages/go/pkg/bot/topics.go)."""

from __future__ import annotations

from telebot_py.bot.base import Requester, clean_payload, parse_flag, parse_result
from telebot_py.types.topics import ForumTopic


class TopicsMixin(Requester):
    """Bot methods for creating and closing forum topics."""

    async def create_forum_topic(
        self,
        chat_id: int | str,
        name: str,
        *,
        icon_color: int | None = None,
        icon_custom_emoji_id: str | None = None,
    ) -> ForumTopic:
        """Create a topic in a forum supergroup chat.

        The bot must have the ``can_manage_topics`` administrator right.

        Example:
            >>> topic = await bot.create_forum_topic(-100, "General")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            name: Topic name; 1-128 characters.
            icon_color: Color of the topic icon in RGB format.
            icon_custom_emoji_id: Unique identifier of the custom emoji shown
                as the topic icon.

        Returns:
            The created ForumTopic.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            name=name,
            icon_color=icon_color,
            icon_custom_emoji_id=icon_custom_emoji_id,
        )
        return parse_result(ForumTopic, await self.request("createForumTopic", payload))

    async def edit_forum_topic(
        self,
        chat_id: int | str,
        message_thread_id: int,
        *,
        name: str | None = None,
        icon_custom_emoji_id: str | None = None,
    ) -> bool:
        """Edit the name and icon of a topic in a forum supergroup chat.

        The bot must have the ``can_manage_topics`` administrator right, unless
        it is the creator of the topic.

        Example:
            >>> ok = await bot.edit_forum_topic(-100, 4, name="Announcements")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            message_thread_id: Unique identifier of the target message thread
                of the forum topic; must be positive.
            name: New topic name; 1-128 characters.
            icon_custom_emoji_id: New unique identifier of the custom emoji
                shown as the topic icon.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_thread_id=message_thread_id,
            name=name,
            icon_custom_emoji_id=icon_custom_emoji_id,
        )
        return parse_flag(await self.request("editForumTopic", payload))

    async def close_forum_topic(self, chat_id: int | str, message_thread_id: int) -> bool:
        """Close an open topic in a forum supergroup chat.

        Example:
            >>> ok = await bot.close_forum_topic(-100, 4)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            message_thread_id: Unique identifier of the target message thread.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, message_thread_id=message_thread_id)
        return parse_flag(await self.request("closeForumTopic", payload))

    async def reopen_forum_topic(self, chat_id: int | str, message_thread_id: int) -> bool:
        """Reopen a closed topic in a forum supergroup chat.

        The bot must have the ``can_manage_topics`` administrator right, unless
        it is the creator of the topic.

        Example:
            >>> ok = await bot.reopen_forum_topic(-100, 4)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            message_thread_id: Unique identifier of the target message thread
                of the forum topic.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, message_thread_id=message_thread_id)
        return parse_flag(await self.request("reopenForumTopic", payload))

    async def delete_forum_topic(self, chat_id: int | str, message_thread_id: int) -> bool:
        """Delete a forum topic along with all its messages.

        The bot must have the ``can_manage_topics`` administrator right, unless
        it is the creator of the topic. Implies closing the topic first.

        Example:
            >>> ok = await bot.delete_forum_topic(-100, 4)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            message_thread_id: Unique identifier of the target message thread
                of the forum topic.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, message_thread_id=message_thread_id)
        return parse_flag(await self.request("deleteForumTopic", payload))

    async def unpin_all_forum_topic_messages(
        self, chat_id: int | str, message_thread_id: int
    ) -> bool:
        """Clear the list of pinned messages in a forum topic.

        The bot must have the ``can_pin_messages`` administrator right in the
        topic to do this.

        Example:
            >>> ok = await bot.unpin_all_forum_topic_messages(-100, 4)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            message_thread_id: Unique identifier of the target message thread
                of the forum topic.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, message_thread_id=message_thread_id)
        return parse_flag(await self.request("unpinAllForumTopicMessages", payload))

    async def edit_general_forum_topic(self, chat_id: int | str, name: str) -> bool:
        """Edit the name of the 'General' topic in a forum supergroup chat.

        The bot must have the ``can_manage_topics`` administrator right. The
        name of the 'General' topic can never be empty.

        Example:
            >>> ok = await bot.edit_general_forum_topic(-100, "General Chat")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            name: New topic name; 1-128 characters.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, name=name)
        return parse_flag(await self.request("editGeneralForumTopic", payload))

    async def close_general_forum_topic(self, chat_id: int | str) -> bool:
        """Close an open 'General' topic in a forum supergroup chat.

        The bot must have the ``can_manage_topics`` administrator right.

        Example:
            >>> ok = await bot.close_general_forum_topic(-100)

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
        return parse_flag(await self.request("closeGeneralForumTopic", payload))

    async def reopen_general_forum_topic(self, chat_id: int | str) -> bool:
        """Reopen a closed 'General' topic in a forum supergroup chat.

        The bot must have the ``can_manage_topics`` administrator right.

        Example:
            >>> ok = await bot.reopen_general_forum_topic(-100)

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
        return parse_flag(await self.request("reopenGeneralForumTopic", payload))

    async def hide_general_forum_topic(self, chat_id: int | str) -> bool:
        """Hide the 'General' topic in a forum supergroup chat.

        The bot must be a member of the group with the ``can_manage_topics``
        administrator right. The 'General' topic is automatically unhidden when
        the chat is opened by other members.

        Example:
            >>> ok = await bot.hide_general_forum_topic(-100)

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
        return parse_flag(await self.request("hideGeneralForumTopic", payload))

    async def unhide_general_forum_topic(self, chat_id: int | str) -> bool:
        """Unhide the 'General' topic in a forum supergroup chat.

        The bot must have the ``can_manage_topics`` administrator right.

        Example:
            >>> ok = await bot.unhide_general_forum_topic(-100)

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
        return parse_flag(await self.request("unhideGeneralForumTopic", payload))

    async def unpin_all_general_forum_topic_messages(self, chat_id: int | str) -> bool:
        """Clear the list of pinned messages in a 'General' forum topic.

        The bot must have the ``can_pin_messages`` administrator right in the
        supergroup to do this.

        Example:
            >>> ok = await bot.unpin_all_general_forum_topic_messages(-100)

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
        return parse_flag(await self.request("unpinAllGeneralForumTopicMessages", payload))
