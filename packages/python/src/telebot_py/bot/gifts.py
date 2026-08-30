"""Gift sending and gift-management Bot API methods.

Ported from node ``client/methods/payments.ts`` (getAvailableGifts, sendGift)
and ``client/methods/business/gifts.ts`` (giftPremiumSubscription,
convertGiftToStars, upgradeGift, transferGift).
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
from telebot_py.types.gifts import Gifts


class GiftsMixin(Requester):
    """Bot methods for sending gifts and managing owned gifts."""

    async def get_available_gifts(self) -> Gifts:
        """Get the list of gifts that can be sent by the bot to users.

        Example:
            >>> gifts = await bot.get_available_gifts()
            >>> print(len(gifts.gifts))

        Returns:
            The Gifts object carrying the available gifts.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        return parse_result(Gifts, await self.request("getAvailableGifts"))

    async def send_gift(
        self,
        user_id: int,
        gift_id: str,
        *,
        pay_for_upgrade: bool | None = None,
        text: str | None = None,
        text_parse_mode: str | None = None,
        text_entities: Sequence[MarkupLike] | None = None,
    ) -> bool:
        """Send a gift to the given user.

        Example:
            >>> ok = await bot.send_gift(
            ...     123, "gift1", text="Enjoy your gift!", pay_for_upgrade=True
            ... )

        Args:
            user_id: Unique identifier of the target user that will receive the
                gift.
            gift_id: Identifier of the gift.
            pay_for_upgrade: Pay for the gift upgrade from the bot's balance,
                making the upgrade free for the receiver.
            text: Text shown along with the gift; 0-255 characters.
            text_parse_mode: Mode for parsing entities in the text.
            text_entities: MessageEntity items as ``to_dict`` objects or dicts;
                can be specified instead of ``text_parse_mode``.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            user_id=user_id,
            gift_id=gift_id,
            pay_for_upgrade=pay_for_upgrade,
            text=text,
            text_parse_mode=text_parse_mode,
            text_entities=[to_wire(entity) for entity in text_entities]
            if text_entities is not None
            else None,
        )
        return parse_flag(await self.request("sendGift", payload))

    async def gift_premium_subscription(
        self,
        user_id: int,
        month_count: int,
        star_count: int,
        *,
        text: str | None = None,
        text_parse_mode: str | None = None,
        text_entities: Sequence[MarkupLike] | None = None,
    ) -> bool:
        """Gift a Telegram Premium subscription to a user.

        Remarks:
            ``month_count`` must be one of 3, 6, 12 and ``star_count`` must
            match the price Telegram charges for that duration (1000, 1500 and
            2500 Stars respectively).

        Example:
            >>> ok = await bot.gift_premium_subscription(123, 3, 1000)

        Args:
            user_id: Unique identifier of the target user.
            month_count: Number of months the subscription will be active;
                one of 3, 6, 12.
            star_count: Number of Telegram Stars to pay for the subscription.
            text: Text shown along with the service message about the
                subscription; 0-128 characters.
            text_parse_mode: Mode for parsing entities in the text.
            text_entities: MessageEntity items as ``to_dict`` objects or dicts;
                can be specified instead of ``text_parse_mode``.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            user_id=user_id,
            month_count=month_count,
            star_count=star_count,
            text=text,
            text_parse_mode=text_parse_mode,
            text_entities=[to_wire(entity) for entity in text_entities]
            if text_entities is not None
            else None,
        )
        return parse_flag(await self.request("giftPremiumSubscription", payload))

    async def convert_gift_to_stars(self, user_id: int, owned_gift_id: str) -> bool:
        """Convert an owned gift to Telegram Stars.

        Example:
            >>> ok = await bot.convert_gift_to_stars(123, "own1")

        Args:
            user_id: Unique identifier of the target user.
            owned_gift_id: Unique identifier of the received gift for the bot.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(user_id=user_id, owned_gift_id=owned_gift_id)
        return parse_flag(await self.request("convertGiftToStars", payload))

    async def upgrade_gift(self, user_id: int, owned_gift_id: str) -> bool:
        """Upgrade a received gift to a unique gift for a user.

        Example:
            >>> ok = await bot.upgrade_gift(123, "own1")

        Args:
            user_id: Unique identifier of the target user.
            owned_gift_id: Unique identifier of the received gift for the bot.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(user_id=user_id, owned_gift_id=owned_gift_id)
        return parse_flag(await self.request("upgradeGift", payload))

    async def transfer_gift(
        self, user_id: int, owned_gift_id: str, new_owner_chat_id: int | str
    ) -> bool:
        """Transfer an upgraded unique gift to another user or chat.

        Example:
            >>> ok = await bot.transfer_gift(123, "own1", -1001234567890)

        Args:
            user_id: Unique identifier of the target user.
            owned_gift_id: Unique identifier of the received gift for the bot.
            new_owner_chat_id: Unique identifier of the chat that will become
                the owner of the gift.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            user_id=user_id, owned_gift_id=owned_gift_id, new_owner_chat_id=new_owner_chat_id
        )
        return parse_flag(await self.request("transferGift", payload))
