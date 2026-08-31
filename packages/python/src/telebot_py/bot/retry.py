"""Retry policy for Bot API requests (FR-012)."""

from __future__ import annotations

import dataclasses


@dataclasses.dataclass(frozen=True, slots=True)
class RetryPolicy:
    """Exponential-backoff retry configuration for Bot API requests.

    Retries fire only on HTTP 429, 5xx responses, and transport failures;
    every other 4xx response fails immediately.

    Attributes:
        max_retries: Number of retries after the initial attempt.
        base_delay: First backoff delay in seconds; each further delay doubles.
        max_delay: Upper bound in seconds for any single backoff delay.
    """

    max_retries: int = 3
    base_delay: float = 1.0
    max_delay: float = 30.0

    def is_retryable_status(self, status_code: int) -> bool:
        """Whether an HTTP status code should be retried.

        Args:
            status_code: The HTTP status code returned by Telegram.

        Returns:
            True for 429, 500, 502, 503, or 504; False otherwise.
        """
        return status_code in (429, 500, 502, 503, 504)

    def delay_for(self, attempt: int, retry_after: float | None = None) -> float:
        """Backoff delay to wait before retry number ``attempt``.

        Args:
            attempt: 1-based retry index (1 = delay before the first retry).
            retry_after: Telegram's flood-control hint, for 429 responses.

        Returns:
            The larger of the exponential step (1s, 2s, 4s, 8s, ... capped at
            ``max_delay``) and ``retry_after`` when provided.
        """
        step = min(self.max_delay, self.base_delay * 2.0 ** (attempt - 1))
        if retry_after is not None and retry_after >= 0:
            return max(step, retry_after)
        return step
