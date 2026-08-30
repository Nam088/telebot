"""Async timer-loop job queue (T042).

Parity with the ``run_once``/``run_repeating``/``run_daily``/``run_custom``
surface from contracts/public-api.md section 6. The kernel wiring (T043)
attaches one queue per application via ``ApplicationBuilder.job_queue()``
and drives :meth:`JobQueue.start` / :meth:`JobQueue.stop` with the
``initialize()``/``stop()`` lifecycle.
"""

from __future__ import annotations

import asyncio
import typing as t
import uuid
from collections.abc import Awaitable, Callable
from datetime import datetime, time, timedelta, timezone

from telebot_py.bot.errors import ApplicationError
from telebot_py.scheduler.job import Data, Job, _Kind, _next_daily
from telebot_py.scheduler.rrule import RRule

Clock = Callable[[], datetime]
SleepFn = Callable[[float], Awaitable[None]]

_ALL_DAYS: tuple[int, ...] = (0, 1, 2, 3, 4, 5, 6)


def _utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


class JobQueue:
    """Manages background one-shot and recurring jobs on the event loop.

    Jobs scheduled while the queue is stopped wait for :meth:`start`; jobs
    scheduled while it is running start immediately. :meth:`stop` cancels
    every job. Timekeeping is injectable for deterministic tests: ``clock``
    supplies "now" and ``sleep`` replaces ``asyncio.sleep``.

    Example:
        >>> queue = JobQueue()
        >>> queue.start()
        >>> job = queue.run_once(callback, 60.0, data={"chat_id": 1})
        >>> job.cancel()
        >>> queue.stop()
    """

    def __init__(self, *, clock: Clock | None = None, sleep: SleepFn | None = None) -> None:
        """Create an idle queue bound to no event loop yet.

        Args:
            clock: Callable returning the current time; defaults to UTC now.
            sleep: Async sleep used for waits; defaults to ``asyncio.sleep``.
        """
        self._clock: Clock = clock if clock is not None else _utc_now
        self._sleep: SleepFn = sleep if sleep is not None else asyncio.sleep
        self._running = False
        self._jobs: list[Job[t.Any]] = []
        self._jobs_by_name: dict[str, list[Job[t.Any]]] = {}

    @property
    def running(self) -> bool:
        """Whether the queue's timer loop is active."""
        return self._running

    def start(self) -> None:
        """Activate the queue, arming every pending job's timer.

        Must be called from inside a running event loop. Raises:
            ApplicationError: If the queue is already running.
        """
        if self._running:
            msg = "job queue is already running"
            raise ApplicationError(msg)
        self._running = True
        for job in self._jobs:
            self._arm(job)

    def stop(self) -> None:
        """Stop the queue and cancel every job it manages.

        Raises:
            ApplicationError: If the queue is not running.
        """
        if not self._running:
            msg = "job queue is not running"
            raise ApplicationError(msg)
        self._running = False
        for job in list(self._jobs):
            job.cancel()

    def jobs(self) -> list[Job[t.Any]]:
        """All jobs currently managed, in scheduling order.

        Returns:
            A snapshot list; mutating it does not affect the queue.
        """
        return list(self._jobs)

    def get_jobs_by_name(self, name: str) -> list[Job[t.Any]]:
        """Find all active jobs with the given name.

        Args:
            name: Job identifier to look up.

        Returns:
            Matching jobs (empty list when none).
        """
        return list(self._jobs_by_name.get(name, ()))

    def run_once(
        self,
        callback: Callable[[Job[Data]], Awaitable[None] | None],
        when: float | datetime,
        *,
        data: Data | None = None,
        name: str | None = None,
    ) -> Job[Data]:
        """Schedule a one-off job.

        Args:
            callback: Sync or async callable invoked with the fired job.
            when: Delay in seconds, or an absolute datetime (naive values
                are treated as UTC).
            data: Optional payload delivered as ``job.data``.
            name: Optional identifier; auto-generated when omitted.

        Returns:
            The scheduled job.

        Raises:
            TypeError: If ``when`` is neither a number nor a datetime.
        """
        target = self._resolve_when(when)
        return self._add(
            Job(
                name=self._name(name, "job_once"),
                callback=callback,
                queue=self,
                clock=self._clock,
                sleep=self._sleep,
                kind=_Kind.ONCE,
                next_t=target,
                data=data,
            )
        )

    def run_repeating(
        self,
        callback: Callable[[Job[Data]], Awaitable[None] | None],
        interval: float,
        *,
        first: float | datetime | None = None,
        data: Data | None = None,
        name: str | None = None,
    ) -> Job[Data]:
        """Schedule a job repeating at a fixed interval.

        Args:
            callback: Sync or async callable invoked with the fired job.
            interval: Seconds between successive fires; must be positive.
            first: Delay or absolute datetime of the first fire; defaults
                to one ``interval``.
            data: Optional payload delivered as ``job.data``.
            name: Optional identifier; auto-generated when omitted.

        Returns:
            The scheduled job.

        Raises:
            ValueError: If ``interval`` is not positive.
            TypeError: If ``first`` is neither a number nor a datetime.
        """
        if interval <= 0:
            msg = f"interval must be positive, got {interval}"
            raise ValueError(msg)
        gap = timedelta(seconds=interval)
        target = self._resolve_when(first) if first is not None else self._clock() + gap
        return self._add(
            Job(
                name=self._name(name, "job_repeat"),
                callback=callback,
                queue=self,
                clock=self._clock,
                sleep=self._sleep,
                kind=_Kind.REPEATING,
                next_t=target,
                data=data,
                interval=gap,
            )
        )

    def run_daily(
        self,
        callback: Callable[[Job[Data]], Awaitable[None] | None],
        time: time,  # noqa: A002 - python-telegram-bot parity name
        *,
        days: tuple[int, ...] = _ALL_DAYS,
        data: Data | None = None,
        name: str | None = None,
    ) -> Job[Data]:
        """Schedule a job firing every day at a wall-clock time.

        Args:
            callback: Sync or async callable invoked with the fired job.
            time: Time of day to fire at.
            days: Allowed weekdays as ``datetime.weekday()`` values
                (Monday=0); defaults to every day.
            data: Optional payload delivered as ``job.data``.
            name: Optional identifier; auto-generated when omitted.

        Returns:
            The scheduled job.

        Raises:
            ValueError: If ``days`` is empty.
        """
        if not days:
            msg = "days must contain at least one weekday"
            raise ValueError(msg)
        target = _next_daily(self._clock(), time, days)
        return self._add(
            Job(
                name=self._name(name, "job_daily"),
                callback=callback,
                queue=self,
                clock=self._clock,
                sleep=self._sleep,
                kind=_Kind.DAILY,
                next_t=target,
                data=data,
                daily_time=time,
                daily_days=days,
            )
        )

    def run_custom(
        self,
        rrule: RRule,
        callback: Callable[[Job[Data]], Awaitable[None] | None],
        *,
        data: Data | None = None,
        name: str | None = None,
    ) -> Job[Data]:
        """Schedule a job following an RFC 5545 recurrence rule.

        The job fires at every future occurrence of ``rrule`` and finishes
        (marking itself cancelled and leaving the queue) once the rule is
        exhausted.

        Args:
            rrule: The recurrence engine driving the schedule.
            callback: Sync or async callable invoked with the fired job.
            data: Optional payload delivered as ``job.data``.
            name: Optional identifier; auto-generated when omitted.

        Returns:
            The scheduled job.

        Raises:
            ValueError: If the rule yields no future occurrence.
        """
        nxt = rrule.after(self._clock(), inclusive=False)
        if nxt is None:
            msg = "rrule yields no future occurrence; nothing to schedule"
            raise ValueError(msg)
        return self._add(
            Job(
                name=self._name(name, "job_rrule"),
                callback=callback,
                queue=self,
                clock=self._clock,
                sleep=self._sleep,
                kind=_Kind.RRULE,
                next_t=nxt,
                data=data,
                rrule=rrule,
            )
        )

    def _name(self, name: str | None, prefix: str) -> str:
        if name is not None:
            return name
        return f"{prefix}_{uuid.uuid4().hex[:12]}"

    def _resolve_when(self, when: float | datetime) -> datetime:
        if isinstance(when, datetime):
            return when if when.tzinfo is not None else when.replace(tzinfo=timezone.utc)
        if isinstance(when, (int, float)):
            return self._clock() + timedelta(seconds=when)
        msg = f"when must be a number of seconds or a datetime, got {type(when).__name__}"
        raise TypeError(msg)

    def _add(self, job: Job[t.Any]) -> Job[t.Any]:
        self._jobs.append(job)
        self._jobs_by_name.setdefault(job.name, []).append(job)
        if self._running:
            self._arm(job)
        return job

    def _arm(self, job: Job[t.Any]) -> None:
        if job._task is None and not job.cancelled:
            job._task = asyncio.create_task(job._run(), name=f"telebot_py-job-{job.name}")

    def _remove_job(self, job: Job[t.Any]) -> None:
        if job in self._jobs:
            self._jobs.remove(job)
        bucket = self._jobs_by_name.get(job.name)
        if bucket is not None:
            if job in bucket:
                bucket.remove(job)
            if not bucket:
                del self._jobs_by_name[job.name]
