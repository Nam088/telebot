"""Run-mode lifecycles: blocking polling and webhook runners (T022, T052).

Module-level implementations behind :meth:`Application.run_polling` and
:meth:`Application.run_webhook`, split out of ``app.py`` to keep the kernel
file focused. They deliberately drive application internals through the full
``initialize -> start -> serve -> stop -> shutdown`` cycle.
"""

from __future__ import annotations

import asyncio
import contextlib
import typing as t
from collections.abc import Callable, Sequence

from telebot_py.bot.errors import ApplicationError
from telebot_py.kernel.lifecycle import ApplicationState
from telebot_py.kernel.polling import install_stop_signal_handlers, poll_updates
from telebot_py.kernel.webhook import serve_webhook

if t.TYPE_CHECKING:
    from telebot_py.kernel.app import Application


def assert_can_run(app: Application, mode: str) -> None:
    """Fail fast on run-mode misuse before either runner starts.

    Args:
        app: The application about to run.
        mode: Runner name (``"polling"`` or ``"webhook"``) for error messages.

    Raises:
        ApplicationError: If the app already ran in any mode, is not STOPPED,
            or an event loop is already running in this thread.
    """
    if app._run_mode is not None:
        msg = (
            f"this application already ran in {app._run_mode!r} mode; "
            "create a new Application instead"
        )
        raise ApplicationError(msg)
    if app.state is not ApplicationState.STOPPED:
        msg = f"cannot run {mode} while in state {app.state.value}"
        raise ApplicationError(msg)
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        pass
    else:
        msg = f"run_{mode}() cannot be called from a running event loop"
        raise ApplicationError(msg)


def run_in_new_loop(coro: t.Coroutine[t.Any, t.Any, None], *, close_loop: bool) -> None:
    """Block on a lifecycle coroutine in a freshly created event loop.

    Args:
        coro: The run-mode lifecycle coroutine.
        close_loop: Whether to close the created loop on exit.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(coro)
    finally:
        if close_loop:
            loop.close()


async def _teardown_run(app: Application, cleanups: Sequence[Callable[[], None]]) -> None:
    """Common exit path of both run modes: restore signals, stop, drain, shut down."""
    for cleanup in cleanups:
        with contextlib.suppress(ValueError, OSError):  # platform cleanup quirks
            cleanup()
    if app.state is ApplicationState.RUNNING:
        await app.stop()
    elif app.state is ApplicationState.STOPPING:
        await app._stopped_event.wait()  # a concurrent stop() is draining
    if app._initialized and not app._shutdown_done:
        await app.shutdown()
    elif not app._initialized:
        await app.bot.shutdown()


async def polling_lifecycle(
    app: Application,
    *,
    allowed_updates: Sequence[str] | None = None,
    drop_pending_updates: bool = False,
    poll_interval: float = 0.0,
    timeout: float = 10,
    stop_signals: Sequence[int] = (),
) -> None:
    """Implementation of ``Application._run_polling``; see its docstring.

    Args:
        app: The application to run.
        allowed_updates: Update types to receive.
        drop_pending_updates: Discard updates queued while offline first.
        poll_interval: Extra delay between empty poll responses.
        timeout: Long-poll timeout in seconds handed to Telegram.
        stop_signals: Signals that trigger a graceful stop.
    """
    if app._run_mode is not None:
        msg = (
            f"this application already ran in {app._run_mode!r} mode; "
            "create a new Application instead"
        )
        raise ApplicationError(msg)
    app._run_mode = "polling"
    stop_event = asyncio.Event()
    app._stop_event = stop_event
    loop = asyncio.get_running_loop()
    cleanups = install_stop_signal_handlers(loop, stop_event, stop_signals)
    try:
        await app.initialize()
        await app.start()
        await poll_updates(
            bot=app.bot,
            on_update=app._spawn_update,
            stop_event=stop_event,
            allowed_updates=allowed_updates,
            drop_pending_updates=drop_pending_updates,
            timeout=timeout,
            poll_interval=poll_interval,
            sleep=app._sleep,
        )
    finally:
        await _teardown_run(app, cleanups)


async def webhook_lifecycle(
    app: Application,
    *,
    listen: str = "127.0.0.1",
    port: int = 8443,
    url_path: str = "",
    secret_token: str | None = None,
    stop_signals: Sequence[int] = (),
) -> None:
    """Implementation of ``Application._run_webhook``; see its docstring.

    Webhook registration at Telegram is left to the operator (node parity);
    this lifecycle only serves deliveries until the stop event fires.

    Args:
        app: The application to run.
        listen: Interface to bind the webhook server to.
        port: Port to serve the webhook on; 0 picks a free ephemeral port.
        url_path: URL path Telegram should POST updates to.
        secret_token: Token deliveries must echo, or None to skip verification.
        stop_signals: Signals that trigger a graceful stop.
    """
    if app._run_mode is not None:
        msg = (
            f"this application already ran in {app._run_mode!r} mode; "
            "create a new Application instead"
        )
        raise ApplicationError(msg)
    app._run_mode = "webhook"
    stop_event = asyncio.Event()
    app._stop_event = stop_event
    loop = asyncio.get_running_loop()
    cleanups = install_stop_signal_handlers(loop, stop_event, stop_signals)
    try:
        await app.initialize()
        await app.start()
        app._webhook_server = await serve_webhook(
            listen=listen,
            port=port,
            url_path=url_path,
            secret_token=secret_token,
            on_update=app._spawn_update,
        )
        await stop_event.wait()
    finally:
        server, app._webhook_server = app._webhook_server, None
        if server is not None:
            await server.close()
        await _teardown_run(app, cleanups)
