"""A single scheduled job managed by the :class:`~telebot_py.scheduler.JobQueue` (T042)."""

from __future__ import annotations

import asyncio
import enum
import inspect
import logging
import math
import typing as t
from collections.abc import Awaitable, Callable
from datetime import datetime, time, timedelta

from telebot_py.scheduler.rrule import RRule

if t.TYPE_CHECKING:
    from telebot_py.scheduler.queue import Clock, JobQueue, SleepFn

logger = logging.getLogger("telebot_py.scheduler")

Data = t.TypeVar("Data")


class _Kind(enum.Enum):
    """Internal schedule strategy of a job."""

    ONCE = "once"
    REPEATING = "repeating"
    DAILY = "daily"
    RRULE = "rrule"


class Job(t.Generic[Data]):
    """A scheduled task: one-shot, repeating, daily, or RRule-driven.

    Created through the ``run_*`` methods of
    :class:`~telebot_py.scheduler.JobQueue`, never directly.

    Example:
        >>> job = queue.run_once(send_reminder, 60.0, data={"chat_id": 1})
        >>> job.cancel()  # idempotent

    Attributes:
        name: Identifier of the job; auto-generated when not supplied.
        data: Optional payload delivered to the callback as ``job.data``.
        next_t: When the job fires next (updated after every fire).
    """

    def __init__(
        self,
        *,
        name: str,
        callback: Callable[[Job[Data]], Awaitable[None] | None],
        queue: JobQueue,
        clock: Clock,
        sleep: SleepFn,
        kind: _Kind,
        next_t: datetime,
        data: Data | None = None,
        interval: timedelta | None = None,
        daily_time: time | None = None,
        daily_days: tuple[int, ...] = (),
        rrule: RRule | None = None,
    ) -> None:
        """Assemble a job; use the queue's ``run_*`` methods instead.

        Args:
            name: Identifier of the job.
            callback: Sync or async callable invoked with this job on fire.
            queue: The queue managing this job.
            clock: Callable returning the queue's current time.
            sleep: Awaitable sleep used to wait for the next fire.
            kind: Which scheduling strategy drives ``next_t``.
            next_t: First scheduled fire time.
            data: Optional payload exposed as :attr:`data`.
            interval: Repeat gap for ``REPEATING`` jobs.
            daily_time: Wall-clock time for ``DAILY`` jobs.
            daily_days: Allowed weekdays (``datetime.weekday`` values) for
                ``DAILY`` jobs.
            rrule: Recurrence engine for ``RRULE`` jobs.
        """
        self.name = name
        self.data = data
        self.next_t = next_t
        self._callback = callback
        self._queue = queue
        self._clock = clock
        self._sleep = sleep
        self._kind = kind
        self._interval = interval
        self._daily_time = daily_time
        self._daily_days = daily_days
        self._rrule = rrule
        self._cancelled = False
        self._task: asyncio.Task[None] | None = None

    @property
    def cancelled(self) -> bool:
        """True once the job stops firing, whether by cancel() or completion."""
        return self._cancelled

    def cancel(self) -> None:
        """Cancel the job and detach it from its queue.

        Idempotent: a second call is a harmless no-op. A cancelled job never
        fires again, even if it was merely pending (not yet started).
        """
        if self._cancelled:
            return
        self._cancelled = True
        if self._task is not None:
            self._task.cancel()
            self._task = None
        self._queue._remove_job(self)

    async def _run(self) -> None:
        """Timer loop: sleep until ``next_t``, fire, reschedule, repeat."""
        while not self._cancelled:
            delay = (self.next_t - self._clock()).total_seconds()
            if delay > 0:
                await self._sleep(delay)
                if self._cancelled:
                    return
                if self._clock() < self.next_t:
                    continue  # spurious early wake; wait the remainder
            await self._fire()
            if self._cancelled:
                return
            if not self._advance():
                self._cancelled = True
                self._queue._remove_job(self)
                return

    async def _fire(self) -> None:
        """Invoke the callback, keeping exceptions from killing the loop."""
        try:
            result = self._callback(self)
            if inspect.isawaitable(result):
                await result
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Error in job %r", self.name)

    def _advance(self) -> bool:
        """Compute the next fire time after one execution.

        Returns:
            True when the job should keep running, False when it is finished
            (one-shot fired, or the RRule is exhausted).
        """
        if self._kind is _Kind.ONCE:
            return False
        if self._kind is _Kind.REPEATING:
            assert self._interval is not None
            now = self._clock()
            target = self.next_t + self._interval
            if target <= now:  # drift compensation: skip missed steps
                step = self._interval.total_seconds()
                missed = math.ceil((now - target).total_seconds() / step)
                target += missed * self._interval
            self.next_t = target
            return True
        if self._kind is _Kind.DAILY:
            assert self._daily_time is not None
            self.next_t = _next_daily(self._clock(), self._daily_time, self._daily_days)
            return True
        if self._kind is _Kind.RRULE:
            assert self._rrule is not None
            nxt = self._rrule.after(self._clock(), inclusive=False)
            if nxt is None:
                return False
            self.next_t = nxt
            return True
        return False  # pragma: no cover - _Kind is exhaustive


def _next_daily(now: datetime, spec: time, days: tuple[int, ...]) -> datetime:
    """Compute the next daily fire strictly after ``now``.

    Args:
        now: The current queue time.
        spec: Wall-clock time the job fires at.
        days: Allowed weekdays as ``datetime.weekday()`` values (Mon=0).

    Returns:
        The next matching datetime, on or after tomorrow's candidate.
    """
    candidate = now.replace(hour=spec.hour, minute=spec.minute, second=spec.second, microsecond=0)
    if candidate <= now:
        candidate += timedelta(days=1)
    while candidate.weekday() not in days:
        candidate += timedelta(days=1)
    return candidate


JobCallback: t.TypeAlias = Callable[[Job[Data]], Awaitable[None] | None]
"""Signature of job callbacks: sync or async callables receiving the fired job.

Job payloads are read from ``job.data`` inside the callback. Callbacks keep
the Job-only signature even with the kernel wiring (T043); reach the Bot
client by capturing ``context.bot`` (or ``application.bot``) in a closure.
"""
