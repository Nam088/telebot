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
