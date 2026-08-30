"""Application kernel: lifecycle state machine, dispatch fan-out, runners (T021)."""

from __future__ import annotations

import asyncio
import logging
import signal
import typing as t
from collections import defaultdict
from collections.abc import Sequence

from telebot_py.bot.client import Bot
from telebot_py.bot.errors import ApplicationError
from telebot_py.kernel.builder import (
    DEFAULT_CONCURRENT_UPDATES,
    ApplicationBuilder,
    PostLifecycleCallback,
    SleepFn,
)
from telebot_py.kernel.dispatcher import Dispatcher, ErrorHandler
from telebot_py.kernel.lifecycle import ApplicationState
from telebot_py.kernel.runners import (
    assert_can_run,
    polling_lifecycle,
    run_in_new_loop,
    webhook_lifecycle,
)
from telebot_py.kernel.webhook import WebhookServer
from telebot_py.plugins.manager import PluginManager
from telebot_py.routing.handlers import BaseHandler
from telebot_py.scheduler.queue import JobQueue
from telebot_py.storage import BasePersistence
from telebot_py.types import Update

if t.TYPE_CHECKING:
    from telebot_py.plugins.plugin import Plugin

logger = logging.getLogger("telebot_py.app")


class Application:
    """The bot application kernel: bot client, handlers, and lifecycle.

    Drives the ``STOPPED -> INITIALIZING -> RUNNING -> STOPPING -> STOPPED``
    state machine, owns the dispatcher and the per-user/per-chat/bot data
    dicts, and fans incoming updates out as tasks bounded by a semaphore
    (``concurrent_updates``). Handler exceptions never escape dispatch; they
    are routed to the registered error handlers (FR-013).

    Example:
        >>> app = Application.builder().token("123:ABC...").build()
        >>> app.add_handler(CommandHandler("start", start_callback))
        >>> app.run_polling()  # blocks until Ctrl+C

    Attributes:
        bot: The Bot API client.
        dispatcher: The dispatcher routing updates to handler groups.
        persistence: The configured persistence backend, when any (SC-005).
        state: Current lifecycle state.
        job_queue: The scheduler when enabled via the builder, else ``None``;
            started once the bot is ready and stopped with the lifecycle.
        plugin_manager: Dispatches plugin response/error hooks around handler
            results and failures (FR-015).
        user_data: Mutable per-user dicts, created lazily per user id.
        chat_data: Mutable per-chat dicts, created lazily per chat id.
    """

    def __init__(
        self,
        bot: Bot,
        *,
        post_init: PostLifecycleCallback | None = None,
        post_shutdown: PostLifecycleCallback | None = None,
        concurrent_updates: int = DEFAULT_CONCURRENT_UPDATES,
        sleep: SleepFn | None = None,
        persistence: BasePersistence | None = None,
        job_queue_enabled: bool = False,
    ) -> None:
        """Assemble an application around an existing Bot client.

        Prefer :meth:`builder` over calling this directly.

        Args:
            bot: The Bot API client to use.
            post_init: Coroutine awaited at the end of :meth:`initialize`.
            post_shutdown: Coroutine awaited during :meth:`shutdown`.
            concurrent_updates: Maximum updates dispatched concurrently.
            sleep: Injectable async sleep for polling backoff (tests).
            persistence: Persistence backend loaded at initialize, flushed at
                stop, and shut down at shutdown (SC-005).
            job_queue_enabled: Whether to create a :class:`JobQueue` started
                during :meth:`initialize` (builder ``job_queue()`` option).
        """
        self.bot = bot
        self.dispatcher = Dispatcher(self)
        self.persistence = persistence
        self.job_queue: JobQueue | None = JobQueue() if job_queue_enabled else None
        self.plugin_manager = PluginManager()
        self.state = ApplicationState.STOPPED
        self.user_data: defaultdict[int, dict[t.Any, t.Any]] = defaultdict(dict)
        self.chat_data: defaultdict[int | str, dict[t.Any, t.Any]] = defaultdict(dict)
        self._bot_data: dict[t.Any, t.Any] = {}
        self._post_init = post_init
        self._post_shutdown = post_shutdown
        self._sleep: SleepFn = sleep if sleep is not None else asyncio.sleep
        self._update_semaphore = asyncio.Semaphore(concurrent_updates)
        self._initialized = False
        self._shutdown_done = False
        self._run_mode: str | None = None
        self._stop_event: asyncio.Event | None = None
        self._stopped_event = asyncio.Event()
        self._update_tasks: set[asyncio.Task[None]] = set()
        self._webhook_server: WebhookServer | None = None

    @property
    def bot_data(self) -> dict[t.Any, t.Any]:
        """Mutable dict shared by every update this application processes."""
        return self._bot_data

    @classmethod
    def builder(cls) -> ApplicationBuilder:
        """Create a fluent :class:`ApplicationBuilder` (python-telegram-bot parity).

        Returns:
            A fresh builder.
        """
        return ApplicationBuilder()

    def add_handler(self, handler: BaseHandler, group: int = 0) -> None:
        """Register an update handler into a dispatch group.

        Args:
            handler: The handler to register.
            group: Group number; lower groups run first.

        Example:
            >>> app.add_handler(CommandHandler("start", callback), group=0)
        """
        self.dispatcher.add_handler(handler, group)

    def remove_handler(self, handler: BaseHandler, group: int = 0) -> None:
        """Unregister a handler.

        Args:
            handler: The handler to remove.
            group: Group the handler was registered in.

        Raises:
            ValueError: If the handler is not registered in that group.
        """
        self.dispatcher.remove_handler(handler, group)

    def add_error_handler(self, callback: ErrorHandler) -> None:
        """Register a callback invoked as ``callback(update, context)`` on handler errors.

        The raised exception is available as ``context.error``.

        Args:
            callback: Sync or async error handler.
        """
        self.dispatcher.add_error_handler(callback)

    def add_plugin(self, plugin: Plugin, *, order: int = 0) -> None:
        """Install a plugin into the update pipeline (FR-015).

        Its response hook wraps every successful handler result and its
        error hook observes handler failures, both in resolved hook order.

        Example:
            >>> app.add_plugin(I18nPlugin(default_locale="en", locales=tables))

        Args:
            plugin: The plugin to register.
            order: Relative hook position; lower values hook first.

        Raises:
            ValueError: If a plugin with the same name is already registered.
            PluginOrderingError: If the dependency graph now has a cycle.
        """
        self.plugin_manager.add_plugin(plugin, order=order)

    def remove_plugin(self, name: str) -> None:
        """Uninstall a plugin; its hooks stop firing before the next update.

        Args:
            name: Name of the registered plugin to remove.

        Raises:
            ValueError: If no plugin with that name is registered.
        """
        self.plugin_manager.remove_plugin(name)

    async def process_update(self, update: Update) -> None:
        """Dispatch one update through the handler groups, bounded by the semaphore.

        Args:
            update: The incoming update.

        Returns:
            None once every matching handler finished (or its failure was
            routed to the error handlers).

        Raises:
            ApplicationError: If the application is not RUNNING.
        """
        if self.state is not ApplicationState.RUNNING:
            msg = (
                f"cannot process updates in state {self.state.value}; "
                "call initialize() and start() first"
            )
            raise ApplicationError(msg)
        async with self._update_semaphore:
            await self.dispatcher.process_update(update)

    def _spawn_update(self, update: Update) -> asyncio.Task[None]:
        """Fan an update out as a semaphore-bounded task; returns the task."""
        task = asyncio.create_task(
            self.process_update(update), name=f"telebot_py-update-{update.update_id}"
        )
        self._update_tasks.add(task)
        task.add_done_callback(self._update_tasks.discard)
        return task

    async def initialize(self) -> None:
        """Initialize the application: validate the token, run post-init hooks.

        The startup ``get_me`` call fails fast with ``InvalidTokenError`` on a
        rejected token. When a persistence backend is configured, bot/user/chat
        data and persistent conversation state are loaded here (SC-005). An
        enabled :class:`JobQueue` is started once the bot is ready. On
        success the state becomes INITIALIZING and stays there until :meth:`start`.

        Raises:
            ApplicationError: If already initialized or not STOPPED.
            InvalidTokenError: If Telegram rejects the token.
        """
        if self.state is not ApplicationState.STOPPED:
            msg = f"cannot initialize an application in state {self.state.value}"
            raise ApplicationError(msg)
        if self._initialized:
            msg = "application already initialize()d; create a new Application to start over"
            raise ApplicationError(msg)
        self.state = ApplicationState.INITIALIZING
        try:
            await self.bot.get_me()
            await self._load_persistence()
            if self._post_init is not None:
                await self._post_init(self)
            if self.job_queue is not None:
                self.job_queue.start()  # the bot is ready; arm scheduled jobs
        except Exception:
            self.state = ApplicationState.STOPPED
            raise
        self._initialized = True

    async def _load_persistence(self) -> None:
        """Load persisted bot/user/chat data and restore persistent conversations."""
        persistence = self.persistence
        if persistence is None:
            return
        self._bot_data = await persistence.get_bot_data()
        for user_id, data in (await persistence.get_user_data()).items():
            self.user_data[user_id] = data
        for chat_id, data in (await persistence.get_chat_data()).items():
            self.chat_data[chat_id] = data
        for handlers in self.dispatcher.handlers.values():
            for handler in handlers:
                if not getattr(handler, "persistent", False):
                    continue
                name = getattr(handler, "name", None)
                conversations = getattr(handler, "conversations", None)
                if not name or conversations is None:
                    continue
                conversations.update(await persistence.get_conversations(name))

    async def start(self) -> None:
        """Enter the RUNNING state so updates can be processed.

        Raises:
            ApplicationError: If initialize() has not succeeded yet.
        """
        if self.state is not ApplicationState.INITIALIZING:
            msg = f"call initialize() before start() (state is {self.state.value})"
            raise ApplicationError(msg)
        if self._stop_event is None:
            self._stop_event = asyncio.Event()
        self.state = ApplicationState.RUNNING

    async def stop(self) -> None:
        """Stop processing: signal the run loop and drain in-flight updates.

        The enabled :class:`JobQueue` is stopped before the drain so no new
        jobs fire while in-flight updates finish.

        Raises:
            ApplicationError: If the application is not RUNNING.
        """
        if self.state is not ApplicationState.RUNNING:
            msg = f"cannot stop an application in state {self.state.value}"
            raise ApplicationError(msg)
        self.state = ApplicationState.STOPPING
        logger.info("Stopping application; draining in-flight updates")
        if self._stop_event is not None:
            self._stop_event.set()
        if self.job_queue is not None and self.job_queue.running:
            self.job_queue.stop()  # no new job fires while updates drain
        pending = set(self._update_tasks) | self.dispatcher.background_tasks
        if pending:
            await asyncio.gather(*pending, return_exceptions=True)
        await self._persist_state()
        self.state = ApplicationState.STOPPED
        self._stopped_event.set()

    async def _persist_state(self) -> None:
        """Write the application's data dicts back to persistence and flush.

        Conversation state is already written through on every transition by
        persistent ConversationHandlers; this covers chat/user/bot data.
        """
        persistence = self.persistence
        if persistence is None:
            return
        await persistence.update_bot_data(dict(self._bot_data))
        await persistence.update_user_data(dict(self.user_data))
        await persistence.update_chat_data(dict(self.chat_data))
        await persistence.flush()

    async def shutdown(self) -> None:
        """Shut down: run post-shutdown hooks, close persistence and the Bot client.

        Raises:
            ApplicationError: If never initialized, not stopped yet, or
                already shut down.
        """
        if not self._initialized:
            msg = "cannot shut down before initialize() was called"
            raise ApplicationError(msg)
        if self._shutdown_done:
            msg = "application already shut down"
            raise ApplicationError(msg)
        if self.state is not ApplicationState.STOPPED:
            msg = f"call stop() before shutdown() (state is {self.state.value})"
            raise ApplicationError(msg)
        self._shutdown_done = True
        if self.job_queue is not None and self.job_queue.running:
            self.job_queue.stop()
        if self._post_shutdown is not None:
            await self._post_shutdown(self)
        if self.persistence is not None:
            await self.persistence.shutdown()
        await self.bot.shutdown()

    def run_polling(
        self,
        *,
        allowed_updates: Sequence[str] | None = None,
        drop_pending_updates: bool = False,
        poll_interval: float = 0.0,
        timeout: float = 10,
        stop_signals: Sequence[int] = (signal.SIGINT, signal.SIGTERM),
        close_loop: bool = True,
    ) -> None:
        """Run the full polling lifecycle, blocking until a stop signal arrives.

        Creates an event loop, installs the stop signal handlers (Ctrl+C by
        default), then runs ``initialize -> start -> getUpdates loop -> stop
        -> shutdown``. Only one run mode is ever allowed per application: a
        second ``run_polling``/``run_webhook`` raises.

        Example:
            >>> app.run_polling(drop_pending_updates=True)  # blocks until Ctrl+C

        Args:
            allowed_updates: Update types to receive.
            drop_pending_updates: Discard updates queued while the bot was
                offline before starting to poll.
            poll_interval: Extra delay between empty poll responses.
            timeout: Long-poll timeout in seconds handed to Telegram.
            stop_signals: Signals that trigger a graceful stop.
            close_loop: Whether to close the created loop on exit.

        Raises:
            ApplicationError: If the application already ran, is not STOPPED,
                or this is called from a running event loop.
            InvalidTokenError: If Telegram rejects the token at startup.
        """
        assert_can_run(self, "polling")
        run_in_new_loop(
            self._run_polling(
                allowed_updates=allowed_updates,
                drop_pending_updates=drop_pending_updates,
                poll_interval=poll_interval,
                timeout=timeout,
                stop_signals=stop_signals,
            ),
            close_loop=close_loop,
        )

    async def _run_polling(
        self,
        *,
        allowed_updates: Sequence[str] | None = None,
        drop_pending_updates: bool = False,
        poll_interval: float = 0.0,
        timeout: float = 10,
        stop_signals: Sequence[int] = (signal.SIGINT, signal.SIGTERM),
    ) -> None:
        """Async polling lifecycle used by :meth:`run_polling` and tests."""
        await polling_lifecycle(
            self,
            allowed_updates=allowed_updates,
            drop_pending_updates=drop_pending_updates,
            poll_interval=poll_interval,
            timeout=timeout,
            stop_signals=stop_signals,
        )

    def run_webhook(
        self,
        *,
        listen: str = "127.0.0.1",
        port: int = 8443,
        url_path: str = "",
        secret_token: str | None = None,
        stop_signals: Sequence[int] = (signal.SIGINT, signal.SIGTERM),
        close_loop: bool = True,
    ) -> None:
        """Run the full webhook lifecycle, blocking until a stop signal arrives.

        Creates an event loop, runs ``initialize -> start -> webhook server ->
        stop -> shutdown``, and serves deliveries on ``http://listen:port`` at
        ``url_path`` until a stop signal arrives. Only one run mode is ever
        allowed per application: a second ``run_polling``/``run_webhook``
        raises. TLS termination is the operator's job: bind localhost behind a
        reverse proxy. Registration at Telegram is likewise the operator's:
        ``run_webhook`` never calls ``set_webhook``/``delete_webhook``
        (packages/node parity).

        Example:
            >>> app.run_webhook(url_path="hook", secret_token="s3cret")

        Args:
            listen: Interface to bind the webhook server to.
            port: Port to serve the webhook on.
            url_path: URL path Telegram should POST updates to.
            secret_token: Token Telegram must echo in
                ``X-Telegram-Bot-Api-Secret-Token``; deliveries without it
                get a 401.
            stop_signals: Signals that trigger a graceful stop.
            close_loop: Whether to close the created loop on exit.

        Raises:
            ApplicationError: If the application already ran, is not STOPPED,
                or this is called from a running event loop.
            InvalidTokenError: If Telegram rejects the token at startup.
            OSError: If the listen address/port cannot be bound.
        """
        assert_can_run(self, "webhook")
        run_in_new_loop(
            self._run_webhook(
                listen=listen,
                port=port,
                url_path=url_path,
                secret_token=secret_token,
                stop_signals=stop_signals,
            ),
            close_loop=close_loop,
        )

    async def _run_webhook(
        self,
        *,
        listen: str = "127.0.0.1",
        port: int = 8443,
        url_path: str = "",
        secret_token: str | None = None,
        stop_signals: Sequence[int] = (signal.SIGINT, signal.SIGTERM),
    ) -> None:
        """Async webhook lifecycle used by :meth:`run_webhook` and tests."""
        await webhook_lifecycle(
            self,
            listen=listen,
            port=port,
            url_path=url_path,
            secret_token=secret_token,
            stop_signals=stop_signals,
        )
