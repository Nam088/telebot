"""Story/gift Bot API methods (parity with packages/go/pkg/bot/stories_gifts.go)."""

from __future__ import annotations

from collections.abc import Sequence

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
        parse_mode: str | None = None,
        caption_entities: Sequence[MarkupLike] | None = None,
        areas: Sequence[MarkupLike] | None = None,
        post_to_chat_page: bool | None = None,
        protect_content: bool | None = None,
    ) -> Story:
        """Post a story on behalf of a managed business account.

        Remarks:
            Requires the ``can_manage_stories`` business bot right. ``areas``
            takes StoryArea objects or plain dicts.

        Example:
            >>> story = await bot.post_story("bc1", {"type": "photo"}, 86400, caption="Hi")

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            content: Story content as an InputStoryContent dict (e.g.
                ``{"type": "photo", ...}``).
            active_period: Seconds after which the story is moved to the
                archive; must be one of 21600, 43200, 86400, or 172800.
            caption: Story caption; 0-2048 characters after entities parsing.
            parse_mode: Mode for parsing entities in the story caption.
            caption_entities: MessageEntity items as ``to_dict`` objects or
                dicts; can be specified instead of ``parse_mode``.
            areas: StoryArea items as ``to_dict`` objects or dicts describing
                clickable areas shown on the story.
            post_to_chat_page: Pass True to keep the story accessible after it
                expires.
            protect_content: Pass True if the content of the story must be
                protected from forwarding and screenshotting.

        Returns:
            The posted Story.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#poststory
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            content=to_wire(content),
            active_period=active_period,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[to_wire(entity) for entity in caption_entities]
            if caption_entities is not None
            else None,
            areas=[to_wire(area) for area in areas] if areas is not None else None,
            post_to_chat_page=post_to_chat_page,
            protect_content=protect_content,
        )
        return parse_result(Story, await self.request("postStory", payload))

    async def set_user_emoji_status(
        self,
        user_id: int,
        emoji_status_custom_emoji_id: str | None = None,
        *,
        emoji_status_expiration_date: int | None = None,
    ) -> bool:
        """Change the emoji status of a user who allowed the bot to do so.

        Remarks:
            The user must previously have allowed the bot to manage their emoji
            status via the Mini App method ``requestEmojiStatusAccess``. Pass an
            empty string as ``emoji_status_custom_emoji_id`` to remove the
            status.

        Example:
            >>> ok = await bot.set_user_emoji_status(42, "custom-emoji-id")

        Args:
            user_id: Unique identifier of the target user.
            emoji_status_custom_emoji_id: Custom emoji identifier of the emoji
                status to set. Pass an empty string to remove the status.
            emoji_status_expiration_date: Point in time (Unix timestamp) when
                the emoji status will be cleared.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setuseremojistatus
        """
        payload = clean_payload(
            user_id=user_id,
            emoji_status_custom_emoji_id=emoji_status_custom_emoji_id,
            emoji_status_expiration_date=emoji_status_expiration_date,
        )
        return parse_flag(await self.request("setUserEmojiStatus", payload))
