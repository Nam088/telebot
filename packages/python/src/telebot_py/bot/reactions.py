"""Reaction Bot API methods (parity with packages/go/pkg/bot/reactions.go)."""

from __future__ import annotations

import typing as t
from collections.abc import Sequence

from telebot_py.bot.base import MarkupLike, Requester, clean_payload, parse_flag


def _normalize_reactions(
    reaction: Sequence[MarkupLike] | MarkupLike | None,
) -> list[dict[str, object]] | None:
    """Coerce a single reaction or a list of reactions to the wire list shape."""
    if reaction is None:
        return None
    items: Sequence[MarkupLike] = (
        reaction if isinstance(reaction, Sequence) and not isinstance(reaction, str) else [reaction]
    )
    return [dict(item) if isinstance(item, t.Mapping) else item.to_dict() for item in items]


class ReactionsMixin(Requester):
    """Bot methods for setting and removing message reactions."""

    async def set_message_reaction(
        self,
        chat_id: int | str,
        message_id: int,
        reaction: Sequence[MarkupLike] | MarkupLike | None = None,
        *,
        is_big: bool | None = None,
    ) -> bool:
        """Change the chosen reactions on a message.

        A single reaction dict is normalized to a one-element list. Omitting
        ``reaction`` removes the currently set one; to remove reactions added
        by other users or chats use ``delete_message_reaction``.

        Example:
            >>> ok = await bot.set_message_reaction(1, 7, [{"type": "emoji", "emoji": "👍"}])

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            message_id: Identifier of the target message.
            reaction: New list of reactions; a single reaction is also
                accepted. Omit to remove the currently set reaction.
            is_big: Pass True to set the reaction with a big animation.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setmessagereaction
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_id=message_id,
            reaction=_normalize_reactions(reaction),
            is_big=is_big,
        )
        return parse_flag(await self.request("setMessageReaction", payload))

    async def delete_message_reaction(
        self,
        chat_id: int | str,
        message_id: int,
        *,
        user_id: int | None = None,
        actor_chat_id: int | None = None,
    ) -> bool:
        """Remove a reaction from a message in a group or a supergroup chat.

        Remarks:
            The bot must have the ``can_delete_messages`` administrator right in
            the chat. Omit both ``user_id`` and ``actor_chat_id`` to remove the
            bot's own reaction; pass ``user_id`` for a reaction added by a user
            and ``actor_chat_id`` for one added by a chat.

        Example:
            >>> ok = await bot.delete_message_reaction(1, 7)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            message_id: Identifier of the target message.
            user_id: Identifier of the user whose reaction will be removed, if
                the reaction was added by a user.
            actor_chat_id: Identifier of the chat whose reaction will be
                removed, if the reaction was added by a chat.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#deletemessagereaction
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_id=message_id,
            user_id=user_id,
            actor_chat_id=actor_chat_id,
        )
        return parse_flag(await self.request("deleteMessageReaction", payload))

    async def delete_all_message_reactions(
        self,
        chat_id: int | str,
        *,
        user_id: int | None = None,
        actor_chat_id: int | None = None,
    ) -> bool:
        """Remove up to 10000 recent reactions in a chat added by a given user or chat.

        Remarks:
            The bot must have the ``can_delete_messages`` administrator right in
            the chat. Unlike ``delete_message_reaction`` this endpoint targets a
            sender across the whole chat and takes no ``message_id``.

        Example:
            >>> ok = await bot.delete_all_message_reactions("@supergroup", user_id=42)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target supergroup.
            user_id: Identifier of the user whose reactions will be removed, if
                the reactions were added by a user.
            actor_chat_id: Identifier of the chat whose reactions will be
                removed, if the reactions were added by a chat.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#deleteallmessagereactions
        """
        payload = clean_payload(chat_id=chat_id, user_id=user_id, actor_chat_id=actor_chat_id)
        return parse_flag(await self.request("deleteAllMessageReactions", payload))
