"""Story management and suggested-post Bot API methods.

Ported from node ``client/methods/business/stories-boosts.ts`` (editStory,
deleteStory) and ``client/methods/business/gifts.ts`` (repostStory,
approveSuggestedPost, declineSuggestedPost). Posting stories lives in
:mod:`telebot_py.bot.stories_gifts`.
"""

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


class StoriesMixin(Requester):
    """Bot methods for editing business-account stories and suggested posts."""

    async def edit_story(
        self,
        business_connection_id: str,
        story_id: int,
        content: MarkupLike,
        *,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MarkupLike] | None = None,
        areas: Sequence[MarkupLike] | None = None,
    ) -> Story:
        """Edit a story previously posted by the bot on behalf of a business account.

        Remarks:
            Requires the ``can_manage_stories`` business bot right. ``content``
            must be an InputStoryContent object (``StoryArea`` /
            ``InputStoryContentPhoto`` / ``InputStoryContentVideo`` instances or
            plain dicts); ``areas`` carries the clickable overlays.

        Example:
            >>> story = await bot.edit_story(
            ...     "bc1", 7, {"type": "photo", "photo": "attach://photo"}
            ... )

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            story_id: Unique identifier of the story to edit.
            content: New content of the story.
            caption: New caption of the story; 0-2048 characters after entity
                parsing.
            parse_mode: Mode for parsing entities in the story caption.
            caption_entities: MessageEntity items as ``to_dict`` objects or
                dicts; can be specified instead of ``parse_mode``.
            areas: StoryArea items as ``to_dict`` objects or dicts describing
                the clickable areas of the story.

        Returns:
            The edited Story.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            story_id=story_id,
            content=to_wire(content),
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[to_wire(entity) for entity in caption_entities]
            if caption_entities is not None
            else None,
            areas=[to_wire(area) for area in areas] if areas is not None else None,
        )
        return parse_result(Story, await self.request("editStory", payload))

    async def delete_story(self, business_connection_id: str, story_id: int) -> bool:
        """Delete a story previously posted on behalf of a connected business account.

        Remarks:
            Requires the ``can_manage_stories`` business bot right.

        Example:
            >>> ok = await bot.delete_story("bc1", 7)

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            story_id: Unique identifier of the story to delete.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(business_connection_id=business_connection_id, story_id=story_id)
        return parse_flag(await self.request("deleteStory", payload))

    async def repost_story(
        self,
        business_connection_id: str,
        from_chat_id: int,
        from_story_id: int,
        active_period: int,
        *,
        post_to_chat_page: bool | None = None,
        protect_content: bool | None = None,
    ) -> Story:
        """Repost a story from one managed business account to another.

        Remarks:
            Both business accounts must be managed by the same bot, and the
            source story must have been posted (or reposted) by the bot.
            ``active_period`` must be one of 21600, 43200, 86400, or 172800.

        Example:
            >>> story = await bot.repost_story("bc1", 200, 9, 86400)

        Args:
            business_connection_id: Unique identifier of the business
                connection owning the reposted story.
            from_chat_id: Unique identifier of the chat that posted the source
                story.
            from_story_id: Unique identifier of the source story.
            active_period: Seconds after which the story moves to the archive.
            post_to_chat_page: Whether the story stays accessible on the chat
                page after it expires.
            protect_content: Whether the story content is protected from
                forwarding and screenshotting.

        Returns:
            The reposted Story.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            from_chat_id=from_chat_id,
            from_story_id=from_story_id,
            active_period=active_period,
            post_to_chat_page=post_to_chat_page,
            protect_content=protect_content,
        )
        return parse_result(Story, await self.request("repostStory", payload))

    async def approve_suggested_post(
        self, chat_id: int | str, message_id: int, *, send_date: int | None = None
    ) -> bool:
        """Approve a suggested post in a direct messages chat.

        Remarks:
            The bot needs the ``can_post_messages`` administrator right in the
            corresponding channel chat. ``send_date`` may only be supplied when
            the suggested post didn't already carry one, and must be at most
            30 days in the future.

        Example:
            >>> ok = await bot.approve_suggested_post(-1001234, 55)

        Args:
            chat_id: Unique identifier of the target direct messages chat.
            message_id: Identifier of the suggested post message to approve.
            send_date: Point in time (Unix timestamp) when the post is expected
                to be published.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, message_id=message_id, send_date=send_date)
        return parse_flag(await self.request("approveSuggestedPost", payload))

    async def decline_suggested_post(
        self, chat_id: int | str, message_id: int, *, comment: str | None = None
    ) -> bool:
        """Decline a suggested post in a direct messages chat.

        Remarks:
            The bot needs the ``can_manage_direct_messages`` administrator
            right in the corresponding channel chat.

        Example:
            >>> ok = await bot.decline_suggested_post(-1001234, 55, comment="Not now")

        Args:
            chat_id: Unique identifier of the target direct messages chat.
            message_id: Identifier of the suggested post message to decline.
            comment: Comment shown to the creator of the suggested post;
                0-128 characters.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, message_id=message_id, comment=comment)
        return parse_flag(await self.request("declineSuggestedPost", payload))
