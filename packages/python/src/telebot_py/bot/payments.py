"""Payment Bot API methods (parity with packages/go/pkg/bot/payments.go)."""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    parse_result,
    parse_string,
    to_wire,
)
from telebot_py.types.message import Message
from telebot_py.types.payments import StarAmount, StarTransactions


class PaymentsMixin(Requester):
    """Bot methods for invoices, checkout queries, and Telegram Stars."""

    async def send_invoice(
        self,
        chat_id: int | str,
        title: str,
        description: str,
        payload: str,
        currency: str,
        prices: Sequence[MarkupLike],
        *,
        provider_token: str | None = None,
        message_thread_id: int | None = None,
        max_tip_amount: int | None = None,
        suggested_tip_amounts: Sequence[int] | None = None,
        start_parameter: str | None = None,
        provider_data: str | None = None,
        photo_url: str | None = None,
        photo_size: int | None = None,
        photo_width: int | None = None,
        photo_height: int | None = None,
        need_name: bool | None = None,
        need_phone_number: bool | None = None,
        need_email: bool | None = None,
        need_shipping_address: bool | None = None,
        send_phone_number_to_provider: bool | None = None,
        send_email_to_provider: bool | None = None,
        is_flexible: bool | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        reply_parameters: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send an invoice.

        Example:
            >>> msg = await bot.send_invoice(1, "Coffee", "A fine coffee", "order-1", "XTR", prices)

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            title: Product name, 1-32 characters.
            description: Product description, 1-255 characters.
            payload: Bot-defined invoice payload, 1-128 bytes.
            currency: Three-letter ISO 4217 currency code, or ``XTR``.
            prices: LabeledPrice items as dicts or ``to_dict`` objects.
            provider_token: Payment provider token (omit for Telegram Stars).
            message_thread_id: Unique identifier for the target message thread.
            max_tip_amount: Maximum accepted tip amount.
            suggested_tip_amounts: Suggested tip amounts in ascending order;
                at most 4 items.
            start_parameter: Deep-linking parameter for ``/start``.
            provider_data: JSON-serialized data about the invoice for the
                provider.
            photo_url: URL of the product photo.
            photo_size: Photo size in bytes.
            photo_width: Photo width.
            photo_height: Photo height.
            need_name: Require the user's full name.
            need_phone_number: Require the user's phone number.
            need_email: Require the user's email.
            need_shipping_address: Require the user's shipping address.
            send_phone_number_to_provider: Share the phone number with the
                provider.
            send_email_to_provider: Share the email with the provider.
            is_flexible: Whether the final price depends on the shipping
                method.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            reply_parameters: Description of the message to reply to.
            reply_markup: Inline keyboard for the message; dict or
                ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        wire = clean_payload(
            chat_id=chat_id,
            title=title,
            description=description,
            payload=payload,
            currency=currency,
            prices=[to_wire(price) for price in prices],
            provider_token=provider_token,
            message_thread_id=message_thread_id,
            max_tip_amount=max_tip_amount,
            suggested_tip_amounts=list(suggested_tip_amounts)
            if suggested_tip_amounts is not None
            else None,
            start_parameter=start_parameter,
            provider_data=provider_data,
            photo_url=photo_url,
            photo_size=photo_size,
            photo_width=photo_width,
            photo_height=photo_height,
            need_name=need_name,
            need_phone_number=need_phone_number,
            need_email=need_email,
            need_shipping_address=need_shipping_address,
            send_phone_number_to_provider=send_phone_number_to_provider,
            send_email_to_provider=send_email_to_provider,
            is_flexible=is_flexible,
            disable_notification=disable_notification,
            protect_content=protect_content,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendInvoice", wire))

    async def create_invoice_link(
        self,
        title: str,
        description: str,
        payload: str,
        currency: str,
        prices: Sequence[MarkupLike],
        *,
        provider_token: str | None = None,
        subscription_period: int | None = None,
        max_tip_amount: int | None = None,
        suggested_tip_amounts: Sequence[int] | None = None,
        provider_data: str | None = None,
        photo_url: str | None = None,
        photo_size: int | None = None,
        photo_width: int | None = None,
        photo_height: int | None = None,
        need_name: bool | None = None,
        need_phone_number: bool | None = None,
        need_email: bool | None = None,
        need_shipping_address: bool | None = None,
        send_phone_number_to_provider: bool | None = None,
        send_email_to_provider: bool | None = None,
        is_flexible: bool | None = None,
    ) -> str:
        """Create a link for an invoice.

        Example:
            >>> link = await bot.create_invoice_link(
            ...     "Coffee", "A fine coffee", "order-1", "XTR", prices
            ... )

        Args:
            title: Product name, 1-32 characters.
            description: Product description, 1-255 characters.
            payload: Bot-defined invoice payload, 1-128 bytes.
            currency: Three-letter ISO 4217 currency code, or ``XTR``.
            prices: LabeledPrice items as dicts or ``to_dict`` objects.
            provider_token: Payment provider token (omit for Telegram Stars).
            subscription_period: Subscription period in seconds for recurring
                payments.
            max_tip_amount: Maximum accepted tip amount.
            suggested_tip_amounts: Suggested tip amounts in ascending order.
            provider_data: JSON-serialized data about the invoice for the
                provider.
            photo_url: URL of the product photo.
            photo_size: Photo size in bytes.
            photo_width: Photo width.
            photo_height: Photo height.
            need_name: Require the user's full name.
            need_phone_number: Require the user's phone number.
            need_email: Require the user's email.
            need_shipping_address: Require the user's shipping address.
            send_phone_number_to_provider: Share the phone number with the
                provider.
            send_email_to_provider: Share the email with the provider.
            is_flexible: Whether the final price depends on the shipping
                method.

        Returns:
            The created invoice link.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        wire = clean_payload(
            title=title,
            description=description,
            payload=payload,
            currency=currency,
            prices=[to_wire(price) for price in prices],
            provider_token=provider_token,
            subscription_period=subscription_period,
            max_tip_amount=max_tip_amount,
            suggested_tip_amounts=list(suggested_tip_amounts)
            if suggested_tip_amounts is not None
            else None,
            provider_data=provider_data,
            photo_url=photo_url,
            photo_size=photo_size,
            photo_width=photo_width,
            photo_height=photo_height,
            need_name=need_name,
            need_phone_number=need_phone_number,
            need_email=need_email,
            need_shipping_address=need_shipping_address,
            send_phone_number_to_provider=send_phone_number_to_provider,
            send_email_to_provider=send_email_to_provider,
            is_flexible=is_flexible,
        )
        return parse_string(await self.request("createInvoiceLink", wire))

    async def answer_shipping_query(
        self,
        shipping_query_id: str,
        ok: bool,
        *,
        shipping_options: Sequence[MarkupLike] | None = None,
        error_message: str | None = None,
    ) -> bool:
        """Answer a shipping query.

        Example:
            >>> await bot.answer_shipping_query("sq1", True, shipping_options=options)

        Args:
            shipping_query_id: Unique identifier of the shipping query.
            ok: Whether delivery to the specified address is possible.
            shipping_options: ShippingOption items (required when ``ok`` is
                True).
            error_message: Reason shipping is impossible (required when ``ok``
                is False).

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            shipping_query_id=shipping_query_id,
            ok=ok,
            shipping_options=[to_wire(option) for option in shipping_options]
            if shipping_options is not None
            else None,
            error_message=error_message,
        )
        return parse_flag(await self.request("answerShippingQuery", payload))

    async def answer_pre_checkout_query(
        self,
        pre_checkout_query_id: str,
        ok: bool,
        *,
        error_message: str | None = None,
    ) -> bool:
        """Answer a pre-checkout query.

        Example:
            >>> await bot.answer_pre_checkout_query("pcq1", False, error_message="out of stock")

        Args:
            pre_checkout_query_id: Unique identifier of the pre-checkout query.
            ok: Whether the order can proceed to checkout.
            error_message: Reason checkout is impossible (required when ``ok``
                is False).

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            pre_checkout_query_id=pre_checkout_query_id,
            ok=ok,
            error_message=error_message,
        )
        return parse_flag(await self.request("answerPreCheckoutQuery", payload))

    async def get_star_transactions(
        self, *, offset: int | None = None, limit: int | None = None
    ) -> StarTransactions:
        """Get the bot's Telegram Stars transactions.

        Example:
            >>> transactions = await bot.get_star_transactions(limit=10)

        Args:
            offset: Number of transactions to skip.
            limit: Maximum number of transactions to retrieve; 1-100.

        Returns:
            The StarTransactions list.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(offset=offset, limit=limit)
        return parse_result(StarTransactions, await self.request("getStarTransactions", payload))

    async def refund_star_payment(self, user_id: int, telegram_payment_charge_id: str) -> bool:
        """Refund a Telegram Stars payment.

        Example:
            >>> ok = await bot.refund_star_payment(1, "charge-1")

        Args:
            user_id: Identifier of the user whose payment will be refunded.
            telegram_payment_charge_id: Telegram payment identifier.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            user_id=user_id, telegram_payment_charge_id=telegram_payment_charge_id
        )
        return parse_flag(await self.request("refundStarPayment", payload))

    async def edit_user_star_subscription(
        self, user_id: int, telegram_payment_charge_id: str, is_canceled: bool
    ) -> bool:
        """Cancel or restore a Telegram Stars subscription.

        Example:
            >>> ok = await bot.edit_user_star_subscription(1, "charge-1", True)

        Args:
            user_id: Identifier of the user whose subscription will be edited.
            telegram_payment_charge_id: Telegram payment identifier for the
                subscription.
            is_canceled: Whether the subscription must be canceled.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            user_id=user_id,
            telegram_payment_charge_id=telegram_payment_charge_id,
            is_canceled=is_canceled,
        )
        return parse_flag(await self.request("editUserStarSubscription", payload))

    async def get_my_star_balance(self) -> StarAmount:
        """Get the current amount of Telegram Stars owned by the bot.

        Example:
            >>> balance = await bot.get_my_star_balance()
            >>> print(balance.amount)

        Returns:
            The StarAmount held by the bot.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        return parse_result(StarAmount, await self.request("getMyStarBalance"))
