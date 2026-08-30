"""Unit tests for the in-house RRule engine (T037).

Ports every case from ``packages/go/pkg/scheduler/rrule/rrule_test.go`` and
``rrule_extra_test.go``; the Go implementation is the source of truth for the
recurrence semantics (FR-008, research R6).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from telebot_py.scheduler.rrule import Frequency, RRule, RRuleOptions

UTC = timezone.utc


def dt(
    year: int,
    month: int,
    day: int,
    hour: int = 0,
    minute: int = 0,
    second: int = 0,
) -> datetime:
    """Build a timezone-aware UTC datetime for test expectations."""
    return datetime(year, month, day, hour, minute, second, tzinfo=UTC)


class TestRRuleDaily:
    """Port of TestRRule_Daily from rrule_test.go."""

    def test_daily_interval_two(self) -> None:
        start = dt(2026, 1, 1, 12)
        rule = RRule(RRuleOptions(freq=Frequency.DAILY, interval=2, dtstart=start))

        after = dt(2026, 1, 2)
        next_ = rule.after(after, inclusive=False)
        assert next_ is not None
        assert next_ == dt(2026, 1, 3, 12)


class TestRRuleConstruction:
    """Ports of the TestRRule_New_* cases from rrule_extra_test.go."""

    def test_default_dtstart_is_now(self) -> None:
        start = datetime.now(tz=UTC)
        rule = RRule(RRuleOptions(freq=Frequency.DAILY))

        next_ = rule.after(start - timedelta(seconds=2), inclusive=False)
        assert next_ is not None, "expected an occurrence when dtstart defaults to now"
        assert next_ >= start - timedelta(seconds=1)
        assert next_ <= datetime.now(tz=UTC) + timedelta(seconds=2)

    def test_interval_normalized_to_one(self) -> None:
        start = dt(2026, 1, 1)
        rule = RRule(RRuleOptions(freq=Frequency.HOURLY, interval=0, dtstart=start))

        next_ = rule.after(start, inclusive=False)
        assert next_ is not None, "expected occurrence; interval 0 must normalize to 1"
        assert next_ == start + timedelta(hours=1)


class TestRRuleAfterAllFrequencies:
    """Port of TestRRule_After_AllFrequencies from rrule_extra_test.go."""

    @pytest.mark.parametrize(
        ("freq", "interval", "after", "want"),
        [
            (
                Frequency.SECONDLY,
                3,
                dt(2026, 1, 1) + timedelta(seconds=4),
                dt(2026, 1, 1) + timedelta(seconds=6),
            ),
            (
                Frequency.MINUTELY,
                5,
                dt(2026, 1, 1) + timedelta(minutes=6),
                dt(2026, 1, 1) + timedelta(minutes=10),
            ),
            (
                Frequency.HOURLY,
                2,
                dt(2026, 1, 1) + timedelta(hours=3),
                dt(2026, 1, 1) + timedelta(hours=4),
            ),
            (
                Frequency.DAILY,
                1,
                dt(2026, 1, 1) + timedelta(hours=12),
                dt(2026, 1, 2),
            ),
            (
                Frequency.WEEKLY,
                1,
                dt(2026, 1, 9),
                dt(2026, 1, 15),
            ),
            (
                Frequency.MONTHLY,
                1,
                dt(2026, 1, 15),
                dt(2026, 2, 1),
            ),
            (
                Frequency.YEARLY,
                1,
                dt(2027, 3, 1),
                dt(2028, 1, 1),
            ),
        ],
        ids=["secondly", "minutely", "hourly", "daily", "weekly", "monthly", "yearly"],
    )
    def test_frequency(
        self,
        freq: Frequency,
        interval: int,
        after: datetime,
        want: datetime,
    ) -> None:
        start = dt(2026, 1, 1)
        rule = RRule(RRuleOptions(freq=freq, interval=interval, dtstart=start))

        next_ = rule.after(after, inclusive=False)
        assert next_ is not None, f"expected occurrence after {after}"
        assert next_ == want


class TestRRuleAfterBoundaries:
    """Ports of the inclusive/count/until/safety-cap cases."""

    def test_inclusive_returns_dtstart_itself(self) -> None:
        start = dt(2026, 1, 1)
        rule = RRule(RRuleOptions(freq=Frequency.DAILY, dtstart=start))

        next_ = rule.after(start, inclusive=True)
        assert next_ == start, "inclusive after() should return dtstart itself"

        exclusive = rule.after(start, inclusive=False)
        assert exclusive == dt(2026, 1, 2), "exclusive after() should skip dtstart"

    def test_count_exhausted_returns_none(self) -> None:
        start = dt(2026, 1, 1)
        rule = RRule(RRuleOptions(freq=Frequency.DAILY, dtstart=start, count=2))

        assert rule.after(dt(2026, 1, 11), inclusive=False) is None

    def test_count_limits_total_occurrences(self) -> None:
        start = dt(2026, 1, 1)
        rule = RRule(RRuleOptions(freq=Frequency.DAILY, dtstart=start, count=3))

        # dtstart itself is the first of the three allowed occurrences.
        assert rule.after(start, inclusive=True) == start
        assert rule.after(start, inclusive=False) == dt(2026, 1, 2)
        assert rule.after(dt(2026, 1, 2), inclusive=False) == dt(2026, 1, 3)
        assert rule.after(dt(2026, 1, 3), inclusive=False) is None

    def test_until_boundary_is_inclusive(self) -> None:
        start = dt(2026, 1, 1)
        until = dt(2026, 1, 3)
        rule = RRule(RRuleOptions(freq=Frequency.DAILY, dtstart=start, until=until))

        # The occurrence exactly at until is still valid.
        next_ = rule.after(dt(2026, 1, 2), inclusive=False)
        assert next_ == until

        # Anything beyond until yields None.
        assert rule.after(until, inclusive=False) is None

    def test_unknown_frequency_hits_safety_cap(self) -> None:
        start = dt(2026, 1, 1)
        rule = RRule(RRuleOptions(freq=99, dtstart=start))

        assert rule.after(start + timedelta(seconds=1), inclusive=False) is None


class TestRRuleBetween:
    """Ports of the TestRRule_Between_* cases."""

    def test_between_inclusive(self) -> None:
        start = dt(2026, 1, 1)
        rule = RRule(RRuleOptions(freq=Frequency.DAILY, dtstart=start))

        got = rule.between(start, dt(2026, 1, 4), inclusive=True)
        assert len(got) == 4
        for i, occurrence in enumerate(got):
            assert occurrence == start + timedelta(days=i)

    def test_between_exclusive(self) -> None:
        start = dt(2026, 1, 1)
        rule = RRule(RRuleOptions(freq=Frequency.DAILY, dtstart=start))

        got = rule.between(start, dt(2026, 1, 3), inclusive=False)
        assert len(got) == 2
        assert got[0] == dt(2026, 1, 2)

    def test_between_no_occurrences(self) -> None:
        start = dt(2026, 1, 1)
        rule = RRule(
            RRuleOptions(freq=Frequency.DAILY, dtstart=start, until=start + timedelta(days=1))
        )

        got = rule.between(dt(2027, 1, 1), dt(2028, 1, 1), inclusive=True)
        assert got == []


class TestRRuleDateNormalization:
    """Month/year arithmetic normalizes overflow exactly like Go's AddDate.

    Go's ``time.Time.AddDate`` rolls overflowing days into the following
    month (November 31 -> December 1) instead of clamping; the Python port
    must reproduce that field for field.
    """

    def test_monthly_overflow_rolls_into_following_month(self) -> None:
        # Jan 31 + 1 month = Feb 31 -> Mar 3, 2026 (February has 28 days).
        rule = RRule(RRuleOptions(freq=Frequency.MONTHLY, dtstart=dt(2026, 1, 31)))

        assert rule.after(dt(2026, 1, 31), inclusive=False) == dt(2026, 3, 3)

    def test_yearly_leap_day_normalizes(self) -> None:
        # Feb 29, 2024 + 1 year = Feb 29, 2025 -> Mar 1, 2025.
        rule = RRule(RRuleOptions(freq=Frequency.YEARLY, dtstart=dt(2024, 2, 29)))

        assert rule.after(dt(2024, 2, 29), inclusive=False) == dt(2025, 3, 1)
