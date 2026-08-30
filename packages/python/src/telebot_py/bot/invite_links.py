"""Invite link Bot API methods (parity with packages/go/pkg/bot/invite_links.go)."""

from __future__ import annotations

from telebot_py.bot.base import Requester, clean_payload, parse_result
from telebot_py.types.chat_members import ChatInviteLink


class InviteLinksMixin(Requester):
    """Bot methods for creating, editing, and revoking chat invite links."""

    async def create_chat_invite_link(
        self,
        chat_id: int | str,
        *,
        name: str | None = None,
        expire_date: int | None = None,
        member_limit: int | None = None,
        creates_join_request: bool | None = None,
    ) -> ChatInviteLink:
        """Create an additional invite link for a chat.

        The bot must be an administrator in the chat for this to work.

        Example:
            >>> link = await bot.create_chat_invite_link(-100, member_limit=10)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            name: Invite link name; 0-32 characters.
            expire_date: Point in time (Unix timestamp) when the link expires.
            member_limit: Maximum number of users that can join via this link.
            creates_join_request: Pass True if users joining via the link must
                be approved by an administrator.

        Returns:
            The new ChatInviteLink.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            name=name,
            expire_date=expire_date,
            member_limit=member_limit,
            creates_join_request=creates_join_request,
        )
        return parse_result(ChatInviteLink, await self.request("createChatInviteLink", payload))

    async def edit_chat_invite_link(
        self,
        chat_id: int | str,
        invite_link: str,
        *,
        name: str | None = None,
        expire_date: int | None = None,
        member_limit: int | None = None,
        creates_join_request: bool | None = None,
    ) -> ChatInviteLink:
        """Edit a non-primary invite link created by the bot.

        The bot must be an administrator in the chat for this to work.

        Example:
            >>> link = await bot.edit_chat_invite_link(-100, url, member_limit=20)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            invite_link: The invite link to edit.
            name: Invite link name; 0-32 characters.
            expire_date: Point in time (Unix timestamp) when the link expires.
            member_limit: Maximum number of users that can join via this link.
            creates_join_request: Pass True if users joining via the link must
                be approved by an administrator.

        Returns:
            The edited ChatInviteLink.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            chat_id=chat_id,
            invite_link=invite_link,
            name=name,
            expire_date=expire_date,
            member_limit=member_limit,
            creates_join_request=creates_join_request,
        )
        return parse_result(ChatInviteLink, await self.request("editChatInviteLink", payload))

    async def revoke_chat_invite_link(self, chat_id: int | str, invite_link: str) -> ChatInviteLink:
        """Revoke an invite link created by the bot.

        If the primary link is revoked, a new link is automatically
        generated. The bot must be an administrator in the chat.

        Example:
            >>> link = await bot.revoke_chat_invite_link(-100, url)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            invite_link: The invite link to revoke.

        Returns:
            The revoked ChatInviteLink.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(chat_id=chat_id, invite_link=invite_link)
        return parse_result(ChatInviteLink, await self.request("revokeChatInviteLink", payload))
