"""Connected business account Bot API methods.

Ported from node ``client/methods/business/stories-boosts.ts``
(getBusinessConnection, readBusinessMessage, deleteBusinessMessages) and
``client/methods/business/gifts.ts`` (the ``*BusinessAccount*`` methods).
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
from telebot_py.types.business import BusinessConnection
from telebot_py.types.payments import StarAmount


class BusinessAccountMixin(Requester):
    """Bot methods for acting on behalf of a connected business account."""

    async def get_business_connection(self, business_connection_id: str) -> BusinessConnection:
        """Get information about the connection of the bot with a business account.

        Example:
            >>> connection = await bot.get_business_connection("bc1")

        Args:
            business_connection_id: Unique identifier of the business
                connection.

        Returns:
            The BusinessConnection object.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(business_connection_id=business_connection_id)
        return parse_result(
            BusinessConnection, await self.request("getBusinessConnection", payload)
        )

    async def read_business_message(
        self, business_connection_id: str, chat_id: int, message_id: int
    ) -> bool:
        """Mark an incoming message in a business account as read.

        Example:
            >>> ok = await bot.read_business_message("bc1", 42, 100)

        Args:
            business_connection_id: Unique identifier of the business
                connection on behalf of which to read the message.
            chat_id: Unique identifier of the chat in which the message was
                received. The chat must have been active in the last 24 hours.
            message_id: Identifier of the message to mark as read.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id, chat_id=chat_id, message_id=message_id
        )
        return parse_flag(await self.request("readBusinessMessage", payload))

    async def delete_business_messages(
        self, business_connection_id: str, message_ids: Sequence[int]
    ) -> bool:
        """Delete messages on behalf of a connected business account.

        Example:
            >>> ok = await bot.delete_business_messages("bc1", [100, 101])

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            message_ids: Identifiers of the messages to delete, 1-100 items.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id, message_ids=list(message_ids)
        )
        return parse_flag(await self.request("deleteBusinessMessages", payload))

    async def get_business_account_star_balance(self, business_connection_id: str) -> StarAmount:
        """Get the current amount of Telegram Stars owned by a business account.

        Example:
            >>> balance = await bot.get_business_account_star_balance("bc1")
            >>> print(balance.amount)

        Args:
            business_connection_id: Unique identifier of the business
                connection.

        Returns:
            The StarAmount held by the business account.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(business_connection_id=business_connection_id)
        return parse_result(
            StarAmount, await self.request("getBusinessAccountStarBalance", payload)
        )

    async def set_business_account_name(
        self,
        business_connection_id: str,
        first_name: str,
        *,
        last_name: str | None = None,
    ) -> bool:
        """Change the first and last name of a connected business account.

        Remarks:
            Requires the ``can_edit_name`` business bot right.

        Example:
            >>> ok = await bot.set_business_account_name("bc1", "Acme", last_name="Parts")

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            first_name: The new value of the first name for the business
                account; 1-64 characters.
            last_name: The new value of the last name for the business account;
                0-64 characters. Omit to leave it unset.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            first_name=first_name,
            last_name=last_name,
        )
        return parse_flag(await self.request("setBusinessAccountName", payload))

    async def set_business_account_username(
        self, business_connection_id: str, username: str | None = None
    ) -> bool:
        """Change the username of a connected business account.

        Remarks:
            Omitting ``username`` sends no username field, matching node's
            pass-through behaviour; Telegram then removes the current username.

        Example:
            >>> ok = await bot.set_business_account_username("bc1", "acme")

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            username: New username for the business account; pass ``None`` or
                an empty value to remove it.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(business_connection_id=business_connection_id, username=username)
        return parse_flag(await self.request("setBusinessAccountUsername", payload))

    async def set_business_account_bio(
        self, business_connection_id: str, bio: str | None = None
    ) -> bool:
        """Change the bio description of a connected business account.

        Example:
            >>> ok = await bot.set_business_account_bio("bc1", "We build bots")

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            bio: New bio for the business account; 0-140 characters. Omit to
                remove the current bio.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(business_connection_id=business_connection_id, bio=bio)
        return parse_flag(await self.request("setBusinessAccountBio", payload))

    async def set_business_account_gift_settings(
        self,
        business_connection_id: str,
        *,
        show_gift_button: bool,
        accepted_gift_types: MarkupLike,
    ) -> bool:
        """Change the gift settings of a connected business account.

        Example:
            >>> ok = await bot.set_business_account_gift_settings(
            ...     "bc1", show_gift_button=True, accepted_gift_types={"unique_gifts": True}
            ... )

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            show_gift_button: Whether the gifts button should be shown on the
                business profile.
            accepted_gift_types: AcceptedGiftTypes as a ``to_dict`` object or a
                plain dict of Telegram's field names.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            show_gift_button=show_gift_button,
            accepted_gift_types=to_wire(accepted_gift_types),
        )
        return parse_flag(await self.request("setBusinessAccountGiftSettings", payload))

    async def set_business_account_profile_photo(
        self,
        business_connection_id: str,
        photo: MarkupLike,
        *,
        is_public: bool | None = None,
    ) -> bool:
        """Change the profile photo of a connected business account.

        Remarks:
            ``photo`` must be an InputProfilePhoto object (dict or ``to_dict``
            object) referencing an already-uploaded ``file_id`` or a URL;
            multipart uploads are out of scope for the JSON-only client.
            Requires the ``can_edit_profile_photo`` business bot right.

        Example:
            >>> ok = await bot.set_business_account_profile_photo(
            ...     "bc1", {"type": "photo", "photo": "file-id-1"}
            ... )

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            photo: InputProfilePhoto describing the new profile photo.
            is_public: Pass True to set the public photo, which will be visible
                even if the main photo is hidden by the business account's
                privacy settings. An account can have only one public photo.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            photo=to_wire(photo),
            is_public=is_public,
        )
        return parse_flag(await self.request("setBusinessAccountProfilePhoto", payload))

    async def remove_business_account_profile_photo(
        self, business_connection_id: str, *, is_public: bool | None = None
    ) -> bool:
        """Remove the current profile photo of a connected business account.

        Remarks:
            Requires the ``can_edit_profile_photo`` business bot right.

        Example:
            >>> ok = await bot.remove_business_account_profile_photo("bc1")

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            is_public: Pass True to remove the public photo, which is visible
                even if the main photo is hidden by the business account's
                privacy settings. After the main photo is removed, the previous
                profile photo (if present) becomes the main photo.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(business_connection_id=business_connection_id, is_public=is_public)
        return parse_flag(await self.request("removeBusinessAccountProfilePhoto", payload))

    async def transfer_business_account_stars(
        self, business_connection_id: str, star_count: int
    ) -> bool:
        """Transfer Telegram Stars from the balance of a business account.

        Example:
            >>> ok = await bot.transfer_business_account_stars("bc1", 50)

        Args:
            business_connection_id: Unique identifier of the business
                connection.
            star_count: Number of Telegram Stars to transfer; 1-10000.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            business_connection_id=business_connection_id, star_count=star_count
        )
        return parse_flag(await self.request("transferBusinessAccountStars", payload))
