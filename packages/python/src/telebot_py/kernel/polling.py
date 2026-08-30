"""Long-polling getUpdates loop with offset management (T022)."""

from __future__ import annotations

import asyncio
import logging
import signal
import typing as t
from collections.abc import Callable, Sequence

from telebot_py.bot.client import Bot, SleepFn
from telebot_py.bot.errors import InvalidTokenError, TelebotError
from telebot_py.types import Update

logger = logging.getLogger("telebot_py.polling")

#: Polling-loop backoff after the Bot's own retries were exhausted: 1s, 2s,
#: 4s, ... capped at 30s (mirrors the HTTP retry policy shape, FR-012).
BACKOFF_BASE_SECONDS = 1.0
BACKOFF_CAP_SECONDS = 30.0


def install_stop_signal_handlers(
    loop: asyncio.AbstractEventLoop,
    stop_event: asyncio.Event,
    stop_signals: Sequence[int],
) -> list[Callable[[], None]]:
    """Install handlers setting ``stop_event`` for each signal.

    Prefers loop-level handlers; falls back to ``signal.signal`` on platforms
    where the loop does not support them (e.g. Windows proactor loops).

    Args:
        loop: The running event loop to install handlers on.
        stop_event: Event set when a stop signal arrives.
        stop_signals: Signal numbers to catch (e.g. SIGINT, SIGTERM).

    Returns:
        Cleanup callables restoring the previous handler state, in
        installation order.
    """
    cleanups: list[Callable[[], None]] = []

    def remove_loop_handler(signum: int) -> Callable[[], None]:
        def cleanup() -> None:
            loop.remove_signal_handler(signum)

        return cleanup

    def restore_previous(signum: int, previous: t.Any) -> Callable[[], None]:
        def cleanup() -> None:
            signal.signal(signum, previous)

        return cleanup

    for signum in stop_signals:
        try:
            loop.add_signal_handler(signum, stop_event.set)
            cleanups.append(remove_loop_handler(signum))
            continue
        except (NotImplementedError, RuntimeError, OSError, ValueError):
            pass
        try:
            previous = signal.signal(signum, lambda *_args: stop_event.set())
            cleanups.append(restore_previous(signum, previous))
        except (ValueError, OSError):
            logger.warning("Could not install a handler for signal %s", signum)
    return cleanups


async def poll_updates(
    *,
    bot: Bot,
    on_update: Callable[[Update], object],
    stop_event: asyncio.Event,
    allowed_updates: Sequence[str] | None = None,
    drop_pending_updates: bool = False,
    timeout: float = 10,
    poll_interval: float = 0.0,
    sleep: SleepFn | None = None,
) -> None:
    """Run the getUpdates loop until ``stop_event`` is set.

    Confirms updates by advancing ``offset`` to the last seen ``update_id``
    plus one. ``drop_pending_updates`` performs a flush call with
    ``offset=-1`` first so Telegram discards everything queued while the bot
    was offline (python-telegram-bot parity). Transport and API failures are
    logged and retried with capped exponential backoff instead of crashing;
    an ``InvalidTokenError`` is fatal and re-raised immediately.

    Example:
        >>> await poll_updates(bot=bot, on_update=spawn, stop_event=stop)

    Args:
        bot: Bot client whose ``get_updates`` feeds the loop.
        on_update: Synchronous callable invoked once per fetched update;
            expected to schedule dispatch (e.g. as a task) and return
            immediately so updates do not block each other.
        stop_event: Loop exits as soon as this event is set.
        allowed_updates: Update types to receive, passed through to Telegram.
        drop_pending_updates: Whether to discard updates queued while offline.
        timeout: Long-poll timeout in seconds handed to Telegram.
        poll_interval: Extra delay between requests when a batch was empty.
        sleep: Injectable async sleep (tests); defaults to ``asyncio.sleep``.

    Returns:
        None once the stop event is observed and the in-flight request
        completed.
    """
    do_sleep = sleep if sleep is not None else asyncio.sleep
    offset = 0

    if drop_pending_updates:
        try:
            flushed = await bot.get_updates(offset=-1, timeout=0, limit=1)
        except InvalidTokenError:
            raise
        except TelebotError as exc:
            logger.error("Could not flush pending updates, starting from the oldest: %s", exc)
            flushed = []
        if flushed:
            offset = flushed[-1].update_id + 1

    failures = 0
    while not stop_event.is_set():
        try:
            updates = await bot.get_updates(
                offset=offset, timeout=int(timeout), allowed_updates=allowed_updates
            )
        except asyncio.CancelledError:
            raise
        except InvalidTokenError:
            raise
        except Exception as exc:  # noqa: BLE001 - the loop must survive any polling error
            failures += 1
            delay = min(BACKOFF_BASE_SECONDS * 2 ** (failures - 1), BACKOFF_CAP_SECONDS)
            logger.error("getUpdates failed (%s); retrying in %.1fs", exc, delay)
            await do_sleep(delay)
            await asyncio.sleep(0)  # keep the loop responsive with an injected sleep
            continue
        failures = 0

        for update in updates:
            offset = update.update_id + 1
            on_update(update)
            if stop_event.is_set():
                break

        if not updates and poll_interval > 0 and not stop_event.is_set():
            await do_sleep(poll_interval)

        # Yield to the event loop: an instantly-resolving transport (e.g.
        # httpx.MockTransport in tests) never suspends on its own, and the
        # loop must stay responsive to the stop event and other tasks.
        await asyncio.sleep(0)
