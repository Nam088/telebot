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
        """Get the list of gifts that can be sent by the bot to users and channel chats.

        Example:
            >>> gifts = await bot.get_available_gifts()
            >>> print(len(gifts.gifts))

        Returns:
            The Gifts object carrying the available gifts.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#getavailablegifts
        """
        return parse_result(Gifts, await self.request("getAvailableGifts"))

    async def send_gift(
        self,
        user_id: int | None = None,
        gift_id: str | None = None,
        *,
        chat_id: int | str | None = None,
        pay_for_upgrade: bool | None = None,
        text: str | None = None,
        text_parse_mode: str | None = None,
        text_entities: Sequence[MarkupLike] | None = None,
    ) -> bool:
        """Send a gift to the given user or channel chat.

        Remarks:
            Telegram's ``user_id`` and ``chat_id`` are mutually exclusive and
            each required only when the other is omitted; exactly one of them
            must be passed. The gift can't be converted to Telegram Stars by
            the receiver.

        Example:
            >>> ok = await bot.send_gift(
            ...     123, "gift1", text="Enjoy your gift!", pay_for_upgrade=True
            ... )
            >>> ok = await bot.send_gift(chat_id="@my_channel", gift_id="gift1")

        Args:
            user_id: Unique identifier of the target user who will receive the
                gift. Required if ``chat_id`` is not specified.
            gift_id: Identifier of the gift; limited gifts can't be sent to
                channel chats.
            chat_id: Unique identifier for the chat or username of the channel
                (in the format ``@username``) that will receive the gift.
                Required if ``user_id`` is not specified.
            pay_for_upgrade: Pass True to pay for the gift upgrade from the
                bot's balance, thereby making the upgrade free for the receiver.
            text: Text that will be shown along with the gift; 0-128 characters.
            text_parse_mode: Mode for parsing entities in the text.
            text_entities: MessageEntity items as ``to_dict`` objects or dicts;
                can be specified instead of ``text_parse_mode``.

        Returns:
            True on success.

        Raises:
            ValueError: If ``gift_id`` is missing, or if ``user_id`` and
                ``chat_id`` are both passed or both omitted.
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendgift
        """
        if gift_id is None:
            msg = "send_gift() requires gift_id"
            raise ValueError(msg)
        if (user_id is None) == (chat_id is None):
            msg = "send_gift() user_id and chat_id are mutually exclusive; pass exactly one"
            raise ValueError(msg)
        payload = clean_payload(
            user_id=user_id,
            chat_id=chat_id,
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

        Telegram API: https://core.telegram.org/bots/api#giftpremiumsubscription
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

    async def convert_gift_to_stars(self, business_connection_id: str, owned_gift_id: str) -> bool:
        """Convert a given regular gift owned by a business account to Stars.

        Remarks:
            Requires the ``can_convert_gifts_to_stars`` business bot right.

        Example:
            >>> ok = await bot.convert_gift_to_stars("bc1", "own1")

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            owned_gift_id: Unique identifier of the regular gift that should be
                converted to Telegram Stars.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#convertgifttostars
        """
        payload = clean_payload(
            business_connection_id=business_connection_id, owned_gift_id=owned_gift_id
        )
        return parse_flag(await self.request("convertGiftToStars", payload))

    async def upgrade_gift(
        self,
        business_connection_id: str,
        owned_gift_id: str,
        *,
        keep_original_details: bool | None = None,
        star_count: int | None = None,
    ) -> bool:
        """Upgrade a given regular gift to a unique gift.

        Remarks:
            Requires the ``can_transfer_and_upgrade_gifts`` business bot right,
            and additionally ``can_transfer_stars`` when the upgrade is paid
            (i.e. when ``star_count`` is positive).

        Example:
            >>> ok = await bot.upgrade_gift("bc1", "own1", star_count=100)

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            owned_gift_id: Unique identifier of the regular gift that should be
                upgraded to a unique one.
            keep_original_details: Pass True to keep the original gift text,
                sender and receiver in the upgraded gift.
            star_count: The amount of Telegram Stars that will be paid for the
                upgrade from the business account balance. If
                ``gift.prepaid_upgrade_star_count`` is positive, pass 0;
                otherwise the ``can_transfer_stars`` right is required and the
                gift's ``upgrade_star_count`` must be passed.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#upgradegift
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            owned_gift_id=owned_gift_id,
            keep_original_details=keep_original_details,
            star_count=star_count,
        )
        return parse_flag(await self.request("upgradeGift", payload))

    async def transfer_gift(
        self,
        business_connection_id: str,
        owned_gift_id: str,
        new_owner_chat_id: int,
        *,
        star_count: int | None = None,
    ) -> bool:
        """Transfer an owned unique gift to another user or chat.

        Remarks:
            Requires the ``can_transfer_and_upgrade_gifts`` business bot right,
            and additionally ``can_transfer_stars`` when ``star_count`` is
            positive.

        Example:
            >>> ok = await bot.transfer_gift("bc1", "own1", -1001234567890)

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            owned_gift_id: Unique identifier of the regular gift that should be
                transferred.
            new_owner_chat_id: Unique identifier of the chat which will own the
                gift. The chat must be active in the last 24 hours.
            star_count: The amount of Telegram Stars that will be paid for the
                transfer from the business account balance. If positive, the
                ``can_transfer_stars`` right is required.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#transfergift
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            owned_gift_id=owned_gift_id,
            new_owner_chat_id=new_owner_chat_id,
            star_count=star_count,
        )
        return parse_flag(await self.request("transferGift", payload))
