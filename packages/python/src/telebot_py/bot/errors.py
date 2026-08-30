"""Typed error hierarchy for the framework (FR-012, contracts §9)."""

from __future__ import annotations


class TelebotError(Exception):
    """Base class for all telebot-py errors."""


class NetworkError(TelebotError):
    """Transport-level failure communicating with the Telegram servers."""


class TelegramApiError(TelebotError):
    """The Telegram Bot API responded with an error.

    Attributes:
        error_code: Telegram's ``error_code`` (typically the HTTP status).
        description: Telegram's human-readable ``description``.
        method: The Bot API method that failed, when known.
        retry_after: Telegram's flood-control hint in seconds, when provided.
    """

    def __init__(
        self,
        error_code: int,
        description: str,
        *,
        method: str | None = None,
        retry_after: float | None = None,
    ) -> None:
        """Initialize the error.

        Args:
            error_code: Telegram's ``error_code``.
            description: Telegram's ``description``.
            method: The Bot API method that failed, when known.
            retry_after: Telegram's flood-control hint in seconds.
        """
        super().__init__(f"Telegram API error {error_code}: {description}")
        self.error_code = error_code
        self.description = description
        self.method = method
        self.retry_after = retry_after


class InvalidTokenError(TelegramApiError):
    """The bot token was rejected by Telegram (HTTP 401)."""


class ApplicationError(TelebotError):
    """Misuse of the application kernel lifecycle."""
