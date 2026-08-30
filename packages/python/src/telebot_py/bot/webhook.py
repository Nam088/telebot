"""Webhook configuration Bot API methods (used by the application lifecycle)."""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    Requester,
    clean_payload,
    parse_flag,
    parse_result,
)
from telebot_py.types.common import WebhookInfo


class WebhookMixin(Requester):
    """Bot methods managing webhook delivery of updates."""

    async def get_webhook_info(self) -> WebhookInfo:
        """Get the current webhook status.

        Example:
            >>> info = await bot.get_webhook_info()

        Returns:
            A WebhookInfo object; its ``url`` is empty when no webhook is set.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        return parse_result(WebhookInfo, await self.request("getWebhookInfo"))

    async def set_webhook(
        self,
        url: str,
        *,
        secret_token: str | None = None,
        max_connections: int | None = None,
        allowed_updates: Sequence[str] | None = None,
        drop_pending_updates: bool | None = None,
    ) -> bool:
        """Configure a URL to receive incoming updates via an outgoing webhook.

        Example:
            >>> await bot.set_webhook("https://example.com/hook", secret_token="s3cret")

        Args:
            url: HTTPS URL Telegram posts updates to.
            secret_token: Sent back in the ``X-Telegram-Bot-Api-Secret-Token``
                header of every delivery so the endpoint can verify origin.
            max_connections: Maximum simultaneous connections for deliveries.
            allowed_updates: Update types to receive; defaults to all except
                ``chat_member``.
            drop_pending_updates: Discard all undelivered updates on switch.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            url=url,
            secret_token=secret_token,
            max_connections=max_connections,
            allowed_updates=list(allowed_updates) if allowed_updates is not None else None,
            drop_pending_updates=drop_pending_updates,
        )
        return parse_flag(await self.request("setWebhook", payload))

    async def delete_webhook(self, *, drop_pending_updates: bool | None = None) -> bool:
        """Remove the webhook integration, reverting to getUpdates polling.

        Example:
            >>> await bot.delete_webhook(drop_pending_updates=True)

        Args:
            drop_pending_updates: Discard all undelivered updates on removal.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(drop_pending_updates=drop_pending_updates)
        return parse_flag(await self.request("deleteWebhook", payload))
