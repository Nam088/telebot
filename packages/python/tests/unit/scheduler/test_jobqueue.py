"""Unit tests for Job and JobQueue (T038).

Uses an injected fake clock + sleep so schedule semantics are deterministic;
one test exercises the real ``asyncio.sleep`` path with tiny intervals to
prove the defaults work.
"""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from datetime import datetime, time, timedelta, timezone
from typing import Any

import pytest

from telebot_py.bot.errors import ApplicationError
from telebot_py.scheduler import Job, JobQueue

UTC = timezone.utc
START = datetime(2026, 1, 1, tzinfo=UTC)  # a Thursday


class FakeClock:
    """Deterministic clock whose time advances only via the fake sleep."""

    def __init__(self, start: datetime = START) -> None:
        self.now = start

    def __call__(self) -> datetime:
        return self.now

    def advance(self, seconds: float) -> None:
        self.now += timedelta(seconds=seconds)


def make_sleep(clock: FakeClock) -> Callable[[float], Awaitable[None]]:
    """Build a fake async sleep advancing ``clock`` and yielding control."""

    async def sleep(delay: float) -> None:
        clock.advance(delay)
        await asyncio.sleep(0)

    return sleep


def make_queue(start: datetime = START) -> tuple[JobQueue, FakeClock]:
    clock = FakeClock(start)
    return JobQueue(clock=clock, sleep=make_sleep(clock)), clock


async def spin(n: int = 10) -> None:
    """Yield control ``n`` times so ready job tasks can progress."""
    for _ in range(n):
        await asyncio.sleep(0)


class TestRunOnce:
    async def test_fires_after_delay_with_data(self) -> None:
        queue, clock = make_queue()
        events: list[tuple[datetime, Any]] = []

        async def callback(job: Job[Any]) -> None:
            events.append((clock.now, job.data))

        queue.start()
        queue.run_once(callback, 5.0, data={"chat_id": 100})
        await spin()

        assert events == [(START + timedelta(seconds=5), {"chat_id": 100})]
        assert queue.jobs() == []  # one-shot job removes itself after firing

    async def test_accepts_absolute_datetime(self) -> None:
        queue, clock = make_queue()
        events: list[datetime] = []
        queue.start()
        queue.run_once(lambda job: events.append(clock.now), START + timedelta(seconds=3))
        await spin()

        assert events == [START + timedelta(seconds=3)]

    async def test_naive_datetime_is_treated_as_utc(self) -> None:
        queue, clock = make_queue()
        events: list[datetime] = []
        queue.start()
        queue.run_once(lambda job: events.append(clock.now), datetime(2026, 1, 1, 0, 0, 2))
        await spin()

        assert events == [START + timedelta(seconds=2)]

    async def test_does_not_fire_again_after_firing(self) -> None:
        queue, clock = make_queue()
        calls = 0

        def callback(job: Job[Any]) -> None:
            nonlocal calls
            calls += 1

        queue.start()
        queue.run_once(callback, 1.0)
        await spin()
        clock.advance(1000)
        await spin()

        assert calls == 1

    async def test_scheduled_before_start_fires_after_start(self) -> None:
        queue, clock = make_queue()
        events: list[datetime] = []
        queue.run_once(lambda job: events.append(clock.now), 2.0)
        await spin()
        assert events == []

        queue.start()
        await spin()
        assert events == [START + timedelta(seconds=2)]


class TestRunRepeating:
    async def test_fires_on_every_interval(self) -> None:
        queue, clock = make_queue()
        events: list[datetime] = []
        queue.start()
        job = queue.run_repeating(lambda job: events.append(clock.now), 2.0)
        await spin(20)

        assert events[:3] == [
            START + timedelta(seconds=2),
            START + timedelta(seconds=4),
            START + timedelta(seconds=6),
        ]
        job.cancel()
        frozen = list(events)
        clock.advance(100)
        await spin()
        assert events == frozen

    async def test_first_delay_overrides_first_fire(self) -> None:
        queue, clock = make_queue()
        events: list[datetime] = []
        queue.start()
        job = queue.run_repeating(lambda job: events.append(clock.now), 1.0, first=3.0)
        await spin(20)

        assert events[:3] == [
            START + timedelta(seconds=3),
            START + timedelta(seconds=4),
            START + timedelta(seconds=5),
        ]
        job.cancel()

    async def test_delivers_data(self) -> None:
        queue, _clock = make_queue()
        seen: list[Any] = []
        queue.start()
        job = queue.run_repeating(lambda job: seen.append(job.data), 1.0, data="payload")
        await spin()

        assert seen, "repeating job should have fired"
        assert set(seen) == {"payload"}
        job.cancel()

    async def test_non_positive_interval_raises(self) -> None:
        queue, _clock = make_queue()
        with pytest.raises(ValueError, match="interval"):
            queue.run_repeating(lambda job: None, 0.0)


class TestRunDaily:
    async def test_fires_at_time_today_then_next_day(self) -> None:
        queue, clock = make_queue(datetime(2026, 1, 1, 10, 0, tzinfo=UTC))
        events: list[datetime] = []
        queue.start()
        job = queue.run_daily(lambda job: events.append(clock.now), time(12, 30))
        await spin(20)

        assert events[:2] == [
            datetime(2026, 1, 1, 12, 30, tzinfo=UTC),
            datetime(2026, 1, 2, 12, 30, tzinfo=UTC),
        ]
        job.cancel()

    async def test_time_already_passed_today_rolls_to_tomorrow(self) -> None:
        queue, clock = make_queue(datetime(2026, 1, 1, 10, 0, tzinfo=UTC))
        events: list[datetime] = []
        queue.start()
        job = queue.run_daily(lambda job: events.append(clock.now), time(9, 0))
        await spin()

        assert events[0] == datetime(2026, 1, 2, 9, 0, tzinfo=UTC)
        job.cancel()

    async def test_days_filter_skips_non_matching_days(self) -> None:
        # 2026-01-01 is a Thursday (weekday() == 3); only Fridays (4) allowed.
        queue, clock = make_queue(datetime(2026, 1, 1, 10, 0, tzinfo=UTC))
        events: list[datetime] = []
        queue.start()
        job = queue.run_daily(lambda job: events.append(clock.now), time(9, 0), days=(4,))
        await spin()

        assert events[0] == datetime(2026, 1, 2, 9, 0, tzinfo=UTC)  # Friday
        job.cancel()


class TestRunCustom:
    async def test_fires_per_rrule_and_stops_when_exhausted(self) -> None:
        from telebot_py.scheduler.rrule import Frequency, RRule, RRuleOptions

        queue, clock = make_queue()
        events: list[datetime] = []
        rule = RRule(
            RRuleOptions(
                freq=Frequency.HOURLY,
                dtstart=START + timedelta(minutes=30),
                count=2,
            )
        )
        queue.start()
        job = queue.run_custom(rule, lambda job: events.append(clock.now), name="rrule-job")
        await spin(20)

        assert events == [
            START + timedelta(minutes=30),
            START + timedelta(minutes=90),
        ]
        assert job.cancelled
        assert queue.get_jobs_by_name("rrule-job") == []

    async def test_invalid_when_type_raises(self) -> None:
        queue, _clock = make_queue()
        with pytest.raises(TypeError, match="when"):
            queue.run_once(lambda job: None, "soon")  # type: ignore[arg-type]


class TestCancel:
    async def test_cancel_is_idempotent_and_stops_firing(self) -> None:
        queue, clock = make_queue()
        events: list[datetime] = []
        queue.start()
        job = queue.run_repeating(lambda job: events.append(clock.now), 1.0)
        await spin()

        job.cancel()
        job.cancel()  # second call must be a harmless no-op
        assert job.cancelled
        frozen = list(events)
        clock.advance(10)
        await spin()
        assert events == frozen
        assert queue.jobs() == []

    async def test_cancel_before_start_prevents_firing(self) -> None:
        queue, clock = make_queue()
        events: list[datetime] = []
        job = queue.run_once(lambda job: events.append(clock.now), 1.0)
        job.cancel()

        queue.start()
        clock.advance(10)
        await spin()
        assert events == []


class TestLifecycle:
    async def test_double_start_raises(self) -> None:
        queue, _clock = make_queue()
        queue.start()
        with pytest.raises(ApplicationError, match="already running"):
            queue.start()

    async def test_stop_without_start_raises(self) -> None:
        queue, _clock = make_queue()
        with pytest.raises(ApplicationError, match="not running"):
            queue.stop()

    async def test_stop_cancels_all_jobs(self) -> None:
        queue, clock = make_queue()
        events: list[datetime] = []
        queue.start()
        queue.run_repeating(lambda job: events.append(clock.now), 1.0)
        await spin()

        queue.stop()
        assert queue.jobs() == []
        frozen = list(events)
        clock.advance(10)
        await spin()
        assert events == frozen

    async def test_callback_error_does_not_stop_repeating_job(self) -> None:
        queue, _clock = make_queue()
        calls: list[int] = []

        def callback(job: Job[Any]) -> None:
            calls.append(len(calls))
            if len(calls) == 1:
                raise RuntimeError("boom")

        queue.start()
        job = queue.run_repeating(callback, 1.0)
        await spin(20)

        assert len(calls) >= 2, "a throwing callback must not kill the job loop"
        job.cancel()


class TestNaming:
    async def test_explicit_name_and_lookup(self) -> None:
        queue, _clock = make_queue()
        job = queue.run_once(lambda job: None, 10.0, name="reminder")

        assert job.name == "reminder"
        assert queue.get_jobs_by_name("reminder") == [job]
        assert queue.get_jobs_by_name("missing") == []

    async def test_auto_generated_names_are_unique(self) -> None:
        queue, _clock = make_queue()
        first = queue.run_once(lambda job: None, 10.0)
        second = queue.run_once(lambda job: None, 10.0)

        assert first.name
        assert second.name
        assert first.name != second.name


class TestRealClockDefaults:
    async def test_default_clock_and_sleep_fire_a_tiny_interval(self) -> None:
        queue = JobQueue()
        calls = 0

        def callback(job: Job[Any]) -> None:
            nonlocal calls
            calls += 1

        queue.start()
        job = queue.run_repeating(callback, 0.005)
        await asyncio.sleep(0.05)

        assert calls >= 1
        job.cancel()
        queue.stop()
