"""HTTP core of the Telegram Bot API client."""

from __future__ import annotations

import asyncio
import typing as t
from collections.abc import Sequence

import httpx

from telebot_py.bot.base import clean_payload, parse_list_result, parse_result
from telebot_py.bot.bulk import BulkMixin
from telebot_py.bot.chat_management import ChatManagementMixin
from telebot_py.bot.chats import ChatsMixin
from telebot_py.bot.edits import EditsMixin
from telebot_py.bot.errors import InvalidTokenError, NetworkError, TelegramApiError
from telebot_py.bot.files import FilesMixin
from telebot_py.bot.games import GamesMixin
from telebot_py.bot.inline import InlineMixin
from telebot_py.bot.invite_links import InviteLinksMixin
from telebot_py.bot.media import MediaMixin
from telebot_py.bot.members import MembersMixin
from telebot_py.bot.messages import MessagesMixin
from telebot_py.bot.payments import PaymentsMixin
from telebot_py.bot.profile import ProfileMixin
from telebot_py.bot.reactions import ReactionsMixin
from telebot_py.bot.retry import RetryPolicy
from telebot_py.bot.stickers import StickersMixin
from telebot_py.bot.stories_gifts import StoriesGiftsMixin
from telebot_py.bot.topics import TopicsMixin
from telebot_py.bot.verification import VerificationMixin
from telebot_py.bot.webhook import WebhookMixin
from telebot_py.types.update import Update
from telebot_py.types.user import User

DEFAULT_BASE_URL = "https://api.telegram.org"

SleepFn = t.Callable[[float], t.Awaitable[None]]


def _parse_envelope(response: httpx.Response) -> object:
    try:
        return response.json()
    except ValueError:
        return None


def _retry_after_from(envelope: object) -> float | None:
    if not isinstance(envelope, dict):
        return None
    parameters = envelope.get("parameters")
    if not isinstance(parameters, dict):
        return None
    retry_after = parameters.get("retry_after")
    if isinstance(retry_after, int | float) and not isinstance(retry_after, bool):
        return float(retry_after)
    return None


def _api_error(method: str, response: httpx.Response, envelope: object) -> TelegramApiError:
    """Map a failing HTTP response onto the typed error hierarchy."""
    data = envelope if isinstance(envelope, dict) else {}
    error_code = data.get("error_code")
    description = data.get("description")
    code = error_code if isinstance(error_code, int) else response.status_code
    text = description if isinstance(description, str) else f"HTTP {response.status_code}"
    error_cls = InvalidTokenError if response.status_code == 401 else TelegramApiError
    return error_cls(code, text, method=method, retry_after=_retry_after_from(envelope))


class Bot(
    MessagesMixin,
    MediaMixin,
    StickersMixin,
    InlineMixin,
    PaymentsMixin,
    GamesMixin,
    StoriesGiftsMixin,
    ChatsMixin,
    ChatManagementMixin,
    VerificationMixin,
    InviteLinksMixin,
    MembersMixin,
    TopicsMixin,
    ReactionsMixin,
    ProfileMixin,
    FilesMixin,
    BulkMixin,
    EditsMixin,
    WebhookMixin,
):
    """Telegram Bot API HTTP client.

    Owns a single ``httpx.AsyncClient`` and performs response-envelope
    unwrapping, typed error mapping, and retry with exponential backoff
    (FR-012). The transport is injectable so tests can run fully offline.
    Typed Bot API methods (messages, media, stickers, inline, payments, games,
    stories, chats, chat management, verification, invite links, members,
    topics, reactions, profile, files, bulk operations, edits, webhook) are
    composed onto this class via mixins.

    Example:
        >>> bot = Bot("123456:ABC...")
        >>> me = await bot.get_me()
        >>> await bot.shutdown()

    Attributes:
        token: The bot token issued by BotFather.
        base_url: Bot API server base URL.
    """

    def __init__(
        self,
        token: str,
        *,
        base_url: str = DEFAULT_BASE_URL,
        transport: httpx.AsyncBaseTransport | None = None,
        retry_policy: RetryPolicy | None = None,
        sleep: SleepFn | None = None,
        timeout: float = 30.0,
    ) -> None:
        """Initialize the client.

        Args:
            token: Bot token from BotFather.
            base_url: Bot API server base URL.
            transport: Optional transport override (e.g. ``httpx.MockTransport``)
                replacing only the wire layer; retry and error mapping stay active.
            retry_policy: Retry/backoff configuration; defaults to 4 retries
                with delays 1s, 2s, 4s, 8s capped at 30s.
            sleep: Injectable async sleep used between retries (for tests).
            timeout: Per-request timeout in seconds.

        Raises:
            ValueError: If ``token`` is empty.
        """
        if not token:
            msg = "token must not be empty"
            raise ValueError(msg)
        self.token = token
        self.base_url = base_url
        self._retry_policy = retry_policy if retry_policy is not None else RetryPolicy()
        self._sleep: SleepFn = sleep if sleep is not None else asyncio.sleep
        self._client = httpx.AsyncClient(
            base_url=base_url,
            transport=transport,
            timeout=httpx.Timeout(timeout),
        )

    async def request(
        self,
        method: str,
        payload: t.Mapping[str, object] | None = None,
    ) -> object:
        """Call a Bot API method and return the unwrapped ``result``.

        Args:
            method: The Bot API method name (e.g. ``sendMessage``).
            payload: Method parameters keyed by Telegram field names.

        Returns:
            The ``result`` field of Telegram's response envelope.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok, or when retries are
                exhausted on 429/5xx responses.
            NetworkError: If the transport keeps failing after retries are
                exhausted.
        """
        url = f"/bot{self.token}/{method}"
        body: dict[str, object] = dict(payload) if payload is not None else {}
        attempts = self._retry_policy.max_retries + 1
        for attempt in range(attempts):
            try:
                response = await self._client.post(url, json=body)
            except httpx.HTTPError as exc:
                if attempt >= attempts - 1:
                    raise NetworkError(f"transport failure calling '{method}': {exc}") from exc
                await self._sleep(self._retry_policy.delay_for(attempt + 1))
                continue

            envelope = _parse_envelope(response)
            if 200 <= response.status_code < 300 and isinstance(envelope, dict):
                if envelope.get("ok"):
                    return envelope.get("result")
                # A not-ok envelope on a success status is never retryable.
                raise _api_error(method, response, envelope)

            if response.status_code == 401:
                raise _api_error(method, response, envelope)

            if (
                self._retry_policy.is_retryable_status(response.status_code)
                and attempt < attempts - 1
            ):
                await self._sleep(
                    self._retry_policy.delay_for(attempt + 1, _retry_after_from(envelope))
                )
                continue

            raise _api_error(method, response, envelope)

        raise NetworkError(f"transport failure calling '{method}': retry budget exhausted")

    async def get_me(self) -> User:
        """Get basic information about the bot in form of a User object.

        This is the startup identity check: a 401 here raises
        ``InvalidTokenError`` so misconfigured bots fail fast.

        Example:
            >>> me = await bot.get_me()

        Returns:
            The User object representing the bot itself.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        return parse_result(User, await self.request("getMe"))

    async def get_updates(
        self,
        *,
        offset: int | None = None,
        limit: int | None = None,
        timeout: int = 0,
        allowed_updates: Sequence[str] | None = None,
    ) -> list[Update]:
        """Retrieve incoming updates using long polling.

        Example:
            >>> updates = await bot.get_updates(offset=1001, timeout=30)

        Args:
            offset: Identifier of the first update to return; usually the last
                processed ``update_id`` plus one.
            limit: Maximum number of updates to retrieve, 1-100.
            timeout: Long-poll timeout in seconds, 0 for a normal short poll.
                Zero is omitted from the wire payload since Telegram's own
                default is also 0.
            allowed_updates: Update types to receive; defaults to all except
                ``chat_member``.

        Returns:
            A list of parsed Update objects, oldest first.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(
            offset=offset,
            limit=limit,
            timeout=timeout or None,
            allowed_updates=list(allowed_updates) if allowed_updates is not None else None,
        )
        return parse_list_result(Update, await self.request("getUpdates", payload))

    async def shutdown(self) -> None:
        """Close the underlying HTTP client and release its connections."""
        await self._client.aclose()
