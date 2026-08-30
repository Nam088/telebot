"""Owned-gift listing Bot API methods.

Ported from node ``client/methods/business/gifts.ts``
(getBusinessAccountGifts, getUserGifts, getChatGifts). Node passes the
listing filters through an untyped options object; python spells them out as
keyword arguments so ``mypy --strict`` and the generated docs stay useful.
"""

from __future__ import annotations

from telebot_py.bot.base import Requester, clean_payload, parse_result
from telebot_py.types.gifts import OwnedGifts


def _owned_gift_filters(
    *,
    exclude_unsaved: bool | None = None,
    exclude_saved: bool | None = None,
    exclude_unlimited: bool | None = None,
    exclude_limited_upgradable: bool | None = None,
    exclude_limited_non_upgradable: bool | None = None,
    exclude_unique: bool | None = None,
    exclude_from_blockchain: bool | None = None,
    sort_by_price: bool | None = None,
    offset: str | None = None,
    limit: int | None = None,
) -> dict[str, object]:
    """Build the optional filter fields shared by the three owned-gift listings.

    Args:
        exclude_unsaved: Omit gifts saved by the recipient.
        exclude_saved: Omit gifts not saved by the recipient.
        exclude_unlimited: Omit unlimited gifts.
        exclude_limited_upgradable: Omit limited gifts upgradable to unique.
        exclude_limited_non_upgradable: Omit limited gifts not upgradable to
            unique.
        exclude_unique: Omit unique gifts.
        exclude_from_blockchain: Omit gifts and collectibles minted on the
            blockchain.
        sort_by_price: Sort the results based on the price.
        offset: Sequential offset of the first number to return.
        limit: Maximum number of gifts to return; 1-100.

    Returns:
        A payload fragment with unset filters omitted.
    """
    return clean_payload(
        exclude_unsaved=exclude_unsaved,
        exclude_saved=exclude_saved,
        exclude_unlimited=exclude_unlimited,
        exclude_limited_upgradable=exclude_limited_upgradable,
        exclude_limited_non_upgradable=exclude_limited_non_upgradable,
        exclude_unique=exclude_unique,
        exclude_from_blockchain=exclude_from_blockchain,
        sort_by_price=sort_by_price,
        offset=offset,
        limit=limit,
    )


class OwnedGiftsMixin(Requester):
    """Bot methods for listing gifts owned by users, chats, and accounts."""

    async def get_business_account_gifts(
        self,
        business_connection_id: str,
        *,
        exclude_unsaved: bool | None = None,
        exclude_saved: bool | None = None,
        exclude_unlimited: bool | None = None,
        exclude_limited_upgradable: bool | None = None,
        exclude_limited_non_upgradable: bool | None = None,
        exclude_unique: bool | None = None,
        exclude_from_blockchain: bool | None = None,
        sort_by_price: bool | None = None,
        offset: str | None = None,
        limit: int | None = None,
    ) -> OwnedGifts:
        """Get gifts received and not yet refunded by a business account.

        Example:
            >>> gifts = await bot.get_business_account_gifts("bc1", limit=10)
            >>> print(gifts.total_count)

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            exclude_unsaved: Omit gifts saved by the recipient.
            exclude_saved: Omit gifts not saved by the recipient.
            exclude_unlimited: Omit unlimited gifts.
            exclude_limited_upgradable: Omit limited gifts upgradable to unique.
            exclude_limited_non_upgradable: Omit limited gifts not upgradable to
                unique.
            exclude_unique: Omit unique gifts.
            exclude_from_blockchain: Omit gifts and collectibles minted on the
                blockchain.
            sort_by_price: Sort the results based on the price.
            offset: Sequential offset of the first number to return.
            limit: Maximum number of gifts to return; 1-100.

        Returns:
            The OwnedGifts page for the business account.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload: dict[str, object] = {
            "business_connection_id": business_connection_id,
            **_owned_gift_filters(
                exclude_unsaved=exclude_unsaved,
                exclude_saved=exclude_saved,
                exclude_unlimited=exclude_unlimited,
                exclude_limited_upgradable=exclude_limited_upgradable,
                exclude_limited_non_upgradable=exclude_limited_non_upgradable,
                exclude_unique=exclude_unique,
                exclude_from_blockchain=exclude_from_blockchain,
                sort_by_price=sort_by_price,
                offset=offset,
                limit=limit,
            ),
        }
        return parse_result(OwnedGifts, await self.request("getBusinessAccountGifts", payload))

    async def get_user_gifts(
        self,
        user_id: int,
        *,
        exclude_unlimited: bool | None = None,
        exclude_limited_upgradable: bool | None = None,
        exclude_limited_non_upgradable: bool | None = None,
        exclude_unique: bool | None = None,
        exclude_from_blockchain: bool | None = None,
        sort_by_price: bool | None = None,
        offset: str | None = None,
        limit: int | None = None,
    ) -> OwnedGifts:
        """Get gifts owned by a user that were sent by other users or bots.

        Example:
            >>> gifts = await bot.get_user_gifts(123, exclude_unique=True)

        Args:
            user_id: Unique identifier of the target user.
            exclude_unlimited: Omit unlimited gifts.
            exclude_limited_upgradable: Omit limited gifts upgradable to unique.
            exclude_limited_non_upgradable: Omit limited gifts not upgradable to
                unique.
            exclude_unique: Omit unique gifts.
            exclude_from_blockchain: Omit gifts and collectibles minted on the
                blockchain.
            sort_by_price: Sort the results based on the price.
            offset: Sequential offset of the first number to return.
            limit: Maximum number of gifts to return; 1-100.

        Returns:
            The OwnedGifts page for the user.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload: dict[str, object] = {
            "user_id": user_id,
            **_owned_gift_filters(
                exclude_unlimited=exclude_unlimited,
                exclude_limited_upgradable=exclude_limited_upgradable,
                exclude_limited_non_upgradable=exclude_limited_non_upgradable,
                exclude_unique=exclude_unique,
                exclude_from_blockchain=exclude_from_blockchain,
                sort_by_price=sort_by_price,
                offset=offset,
                limit=limit,
            ),
        }
        return parse_result(OwnedGifts, await self.request("getUserGifts", payload))

    async def get_chat_gifts(
        self,
        chat_id: int | str,
        *,
        exclude_unlimited: bool | None = None,
        exclude_limited_upgradable: bool | None = None,
        exclude_limited_non_upgradable: bool | None = None,
        exclude_unique: bool | None = None,
        exclude_from_blockchain: bool | None = None,
        sort_by_price: bool | None = None,
        offset: str | None = None,
        limit: int | None = None,
    ) -> OwnedGifts:
        """Get gifts owned by a chat that were sent by other users or bots.

        Example:
            >>> gifts = await bot.get_chat_gifts(-1001234567890, offset="20")

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target channel.
            exclude_unlimited: Omit unlimited gifts.
            exclude_limited_upgradable: Omit limited gifts upgradable to unique.
            exclude_limited_non_upgradable: Omit limited gifts not upgradable to
                unique.
            exclude_unique: Omit unique gifts.
            exclude_from_blockchain: Omit gifts and collectibles minted on the
                blockchain.
            sort_by_price: Sort the results based on the price.
            offset: Sequential offset of the first number to return.
            limit: Maximum number of gifts to return; 1-100.

        Returns:
            The OwnedGifts page for the chat.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload: dict[str, object] = {
            "chat_id": chat_id,
            **_owned_gift_filters(
                exclude_unlimited=exclude_unlimited,
                exclude_limited_upgradable=exclude_limited_upgradable,
                exclude_limited_non_upgradable=exclude_limited_non_upgradable,
                exclude_unique=exclude_unique,
                exclude_from_blockchain=exclude_from_blockchain,
                sort_by_price=sort_by_price,
                offset=offset,
                limit=limit,
            ),
        }
        return parse_result(OwnedGifts, await self.request("getChatGifts", payload))
