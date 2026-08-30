"""Handlers for message reaction updates."""

from __future__ import annotations

from collections.abc import Callable, Sequence

from telebot_py.routing.handlers.base import BaseHandler, HandlerCallback
from telebot_py.types import (
    ReactionTypeCustomEmoji,
    ReactionTypeEmoji,
    ReactionTypePaid,
    Update,
)

#: Filter selecting which reaction changes match: an emoji string, a sequence
#: of emoji strings, a reaction type instance (emoji, custom emoji, or paid),
#: or a predicate receiving the whole update.
ReactionFilter = (
    str
    | Sequence[str]
    | ReactionTypeEmoji
    | ReactionTypeCustomEmoji
    | ReactionTypePaid
    | Callable[[Update], bool]
)


class MessageReactionHandler(BaseHandler):
    """Handler for user message reaction changes.

    Matches ``message_reaction`` updates. Without a filter every reaction
    change matches; otherwise the reaction must satisfy the filter, which is
    tested against the update's ``new_reaction`` list — mirroring the node
    ``MessageReactionHandler`` filter semantics.

    Attributes:
        filter: Optional filter matching specific emojis, custom emoji IDs,
            paid reactions, or an arbitrary predicate.
    """

    def __init__(
        self,
        callback: HandlerCallback,
        filter: ReactionFilter | None = None,  # noqa: A002 - mirrors node's option name
        *,
        block: bool = True,
    ) -> None:
        """Initialize the handler.

        Args:
            callback: Callable invoked when a matching reaction arrives.
            filter: Optional filter matching specific emojis, custom emoji
                IDs, paid reactions, or a predicate over the update.
            block: Whether dispatch awaits the callback before moving on.
        """
        super().__init__(callback, block=block)
        self.filter = filter

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a matching reaction change.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a ``message_reaction`` payload
            that satisfies the configured filter, ``False`` otherwise.
        """
        if not isinstance(update, Update):
            return False
        reaction = update.message_reaction
        if reaction is None:
            return False
        filter_ = self.filter
        if filter_ is None:
            return True
        new_reactions = reaction.new_reaction
        if isinstance(filter_, str):
            return _has_emoji(new_reactions, filter_)
        if isinstance(filter_, ReactionTypeEmoji):
            return _has_emoji(new_reactions, filter_.emoji)
        if isinstance(filter_, ReactionTypeCustomEmoji):
            return any(
                isinstance(r, ReactionTypeCustomEmoji)
                and r.custom_emoji_id == filter_.custom_emoji_id
                for r in new_reactions
            )
        if isinstance(filter_, ReactionTypePaid):
            return any(isinstance(r, ReactionTypePaid) for r in new_reactions)
        if callable(filter_):
            return bool(filter_(update))
        return any(isinstance(r, ReactionTypeEmoji) and r.emoji in filter_ for r in new_reactions)


def _has_emoji(
    reactions: Sequence[ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid],
    emoji: str,
) -> bool:
    """Return whether ``reactions`` contains an emoji reaction equal to ``emoji``."""
    return any(isinstance(r, ReactionTypeEmoji) and r.emoji == emoji for r in reactions)


class MessageReactionCountHandler(BaseHandler):
    """Handler for anonymous reaction count updates on messages.

    Matches ``message_reaction_count`` updates, mirroring the node
    ``MessageReactionCountHandler``.
    """

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a reaction count update.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a ``message_reaction_count``
            payload.
        """
        return isinstance(update, Update) and update.message_reaction_count is not None
