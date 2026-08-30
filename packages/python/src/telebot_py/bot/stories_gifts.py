"""Story/gift Bot API methods (parity with packages/go/pkg/bot/stories_gifts.go)."""

from __future__ import annotations

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    parse_result,
    to_wire,
)
from telebot_py.types.message_extras import Story


class StoriesGiftsMixin(Requester):
    """Bot methods for business-account stories, gifts, and user emoji status."""

    async def post_story(
        self,
        business_connection_id: str,
        content: MarkupLike,
        active_period: int,
        *,
        caption: str | None = None,
        privacy: str | None = None,
    ) -> Story:
        """Post a story on behalf of a connected business account.

        Minimal parity with the Go client: advanced story features (areas,
        privacy details, expiration scheduling) are not yet modeled.

        Example:
            >>> story = await bot.post_story("bc1", {"type": "photo"}, 86400)

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            content: Story content as an InputStoryContent dict (e.g.
                ``{"type": "photo", ...}``).
            active_period: Seconds the story will stay active, 86400-2592000.
            caption: Story caption; 0-2048 characters.
            privacy: Privacy setting: ``everybody``, ``contacts``, or
                ``close_friends``.

        Returns:
            The posted Story.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            content=to_wire(content),
            active_period=active_period,
            caption=caption,
            privacy=privacy,
        )
        return parse_result(Story, await self.request("postStory", payload))

    async def set_user_emoji_status(
        self,
        user_id: int,
        custom_emoji_id: str | None = None,
        *,
        emoji_status_expiration_date: int | None = None,
    ) -> bool:
        """Change the emoji status of a user who allowed the bot to do so.

        Remarks:
            The keyword names follow Telegram's wire fields (``custom_emoji_id``
            and ``emoji_status_expiration_date``) rather than
            python-telegram-bot's ``emoji_status_custom_emoji_id`` alias, so the
            payload stays a direct mirror of the documented parameters.

        Example:
            >>> ok = await bot.set_user_emoji_status(42, "custom-emoji-id")

        Args:
            user_id: Unique identifier of the target user.
            custom_emoji_id: Identifier of the custom emoji to show as the
                status; omit to clear the emoji while keeping the duration.
            emoji_status_expiration_date: Point in time (Unix timestamp) when
                the emoji status will be cleared.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            user_id=user_id,
            custom_emoji_id=custom_emoji_id,
            emoji_status_expiration_date=emoji_status_expiration_date,
        )
        return parse_flag(await self.request("setUserEmojiStatus", payload))
