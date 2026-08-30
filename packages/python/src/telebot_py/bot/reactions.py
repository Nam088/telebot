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

        A single reaction dict is normalized to a one-element list. An empty
        reaction list (see the delete helpers) removes the reaction.

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
        self, chat_id: int | str, message_id: int, *, is_big: bool = False
    ) -> bool:
        """Remove the bot's reaction from a message.

        Implemented via ``setMessageReaction`` with an empty reaction list.

        Example:
            >>> ok = await bot.delete_message_reaction(1, 7)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            message_id: Identifier of the target message.
            is_big: Pass True to remove the reaction with a big animation.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setmessagereaction
        """
        payload: dict[str, object] = {
            "chat_id": chat_id,
            "message_id": message_id,
            "reaction": [],
        }
        if is_big:
            payload["is_big"] = True
        return parse_flag(await self.request("setMessageReaction", payload))

    async def delete_all_message_reactions(self, chat_id: int | str, message_id: int) -> bool:
        """Clear all reactions on a message.

        Implemented via ``setMessageReaction`` with an empty reaction list.

        Example:
            >>> ok = await bot.delete_all_message_reactions("@channel", 7)

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            message_id: Identifier of the target message.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#setmessagereaction
        """
        payload: dict[str, object] = {
            "chat_id": chat_id,
            "message_id": message_id,
            "reaction": [],
        }
        return parse_flag(await self.request("setMessageReaction", payload))
