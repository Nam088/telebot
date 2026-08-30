"""Fluent ApplicationBuilder with fail-fast validation at build() (T021, FR-014)."""

from __future__ import annotations

import typing as t

import httpx

from telebot_py.bot.client import Bot

if t.TYPE_CHECKING:
    from telebot_py.kernel.app import Application
    from telebot_py.storage import BasePersistence

#: Default bound on concurrently dispatched updates (python-telegram-bot style).
DEFAULT_CONCURRENT_UPDATES = 32

PostLifecycleCallback = t.Callable[["Application"], t.Awaitable[None]]
SleepFn = t.Callable[[float], t.Awaitable[None]]


class ApplicationBuilder:
    """Fluent builder assembling a configured :class:`Application`.

    Collects the bot token, an optional transport override (the offline test
    seam), lifecycle hooks, and the concurrency bound, validating the
    combination at :meth:`build` rather than deep inside the runtime
    (FR-014).

    Example:
        >>> app = ApplicationBuilder().token("123:ABC...").build()
    """

    def __init__(self) -> None:
        """Initialize the builder with all options unset."""
        self._token: str | None = None
        self._transport: httpx.AsyncBaseTransport | None = None
        self._persistence: BasePersistence | None = None
        self._job_queue_enabled: bool | None = None
        self._sleep: SleepFn | None = None
        self._post_init: PostLifecycleCallback | None = None
        self._post_shutdown: PostLifecycleCallback | None = None
        self._concurrent_updates: int = DEFAULT_CONCURRENT_UPDATES

    def token(self, token: str) -> ApplicationBuilder:
        """Set the bot token issued by BotFather.

        Args:
            token: Bot token string; validated non-empty at build time.

        Returns:
            This builder for chaining.

        Raises:
            ValueError: If a token was already set.
        """
        if self._token is not None:
            msg = "token already set on this builder"
            raise ValueError(msg)
        self._token = token
        return self

    def transport(self, transport: httpx.AsyncBaseTransport) -> ApplicationBuilder:
        """Inject a transport replacing only the wire layer (test seam).

        Retry policy and error mapping stay active even with a custom
        transport, e.g. ``httpx.MockTransport`` serving canned responses.

        Args:
            transport: An httpx async transport instance.

        Returns:
            This builder for chaining.
        """
        self._transport = transport
        return self

    def persistence(self, persistence: BasePersistence) -> ApplicationBuilder:
        """Attach the persistence backend for conversation and data durability.

        The application loads bot/user/chat data and restores persistent
        conversation handlers during ``initialize()``, writes everything back
        on ``stop()``, and shuts the backend down in ``shutdown()`` (SC-005).

        Args:
            persistence: A :class:`~telebot_py.storage.BasePersistence` instance.

        Returns:
            This builder for chaining.

        Raises:
            ValueError: If a persistence backend was already set.
        """
        if self._persistence is not None:
            msg = "persistence already set on this builder"
            raise ValueError(msg)
        self._persistence = persistence
        return self

    def job_queue(self, enabled: bool = True) -> ApplicationBuilder:
        """Enable or disable the application's JobQueue (FR-008).

        When enabled, :meth:`build` attaches a fresh
        :class:`~telebot_py.scheduler.JobQueue` that ``initialize()`` starts
        once the bot is ready and ``stop()``/``shutdown()`` stop cleanly.
        Without this call the application has no job queue and
        ``context.job_queue`` stays ``None``.

        Args:
            enabled: Whether the built application owns a JobQueue.

        Returns:
            This builder for chaining.

        Raises:
            ValueError: If ``enabled`` is not a bool, or the option was
                already set on this builder.
        """
        if not isinstance(enabled, bool):
            msg = f"job_queue enabled must be a bool, got {enabled!r}"
            raise ValueError(msg)
        if self._job_queue_enabled is not None:
            msg = "job_queue already set on this builder"
            raise ValueError(msg)
        self._job_queue_enabled = enabled
        return self

    def sleep(self, sleep: SleepFn) -> ApplicationBuilder:
        """Inject an async sleep used for retry and polling backoff (test seam).

        Args:
            sleep: Coroutine function accepting a delay in seconds.

        Returns:
            This builder for chaining.
        """
        self._sleep = sleep
        return self

    def post_init(self, callback: PostLifecycleCallback) -> ApplicationBuilder:
        """Register a coroutine run at the end of ``Application.initialize()``.

        Args:
            callback: Awaited with the application once initialization and
                the startup ``get_me`` check succeeded.

        Returns:
            This builder for chaining.
        """
        self._post_init = callback
        return self

    def post_shutdown(self, callback: PostLifecycleCallback) -> ApplicationBuilder:
        """Register a coroutine run during ``Application.shutdown()``.

        Args:
            callback: Awaited with the application before the Bot client is
                closed.

        Returns:
            This builder for chaining.
        """
        self._post_shutdown = callback
        return self

    def concurrent_updates(self, count: int) -> ApplicationBuilder:
        """Set the maximum number of updates dispatched concurrently.

        Args:
            count: Positive concurrency bound; defaults to 32 when unset.

        Returns:
            This builder for chaining.

        Raises:
            ValueError: If ``count`` is not a positive integer.
        """
        if not isinstance(count, int) or isinstance(count, bool) or count < 1:
            msg = f"concurrent_updates must be a positive integer, got {count!r}"
            raise ValueError(msg)
        self._concurrent_updates = count
        return self

    def build(self) -> Application:
        """Validate the collected configuration and construct the Application.

        Returns:
            The configured application in the STOPPED state.

        Raises:
            ValueError: If no (or an empty) token was set, or any combination
                of options is invalid (FR-014).
        """
        if not self._token:
            msg = "bot token is required: call ApplicationBuilder.token() first"
            raise ValueError(msg)
        from telebot_py.kernel.app import Application  # late import: builder <-> app cycle

        bot = Bot(self._token, transport=self._transport, sleep=self._sleep)
        return Application(
            bot,
            post_init=self._post_init,
            post_shutdown=self._post_shutdown,
            concurrent_updates=self._concurrent_updates,
            sleep=self._sleep,
            persistence=self._persistence,
            job_queue_enabled=self._job_queue_enabled is True,
        )
