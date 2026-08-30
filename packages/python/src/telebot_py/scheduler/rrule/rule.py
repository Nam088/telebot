"""In-house RFC 5545 recurrence rule engine (T041).

Logic ported field for field from ``packages/go/pkg/scheduler/rrule/rrule.go``;
the Go implementation is the source of truth for the semantics, including the
iteration safety cap and Go-style calendar normalization for month/year
arithmetic (overflowing days roll into the following month, they are not
clamped).
"""

from __future__ import annotations

import calendar
from dataclasses import replace
from datetime import datetime, timedelta, timezone

from telebot_py.scheduler.rrule.types import Frequency, RRuleOptions

_SAFETY_CAP = 10_000


def _add_months(dt: datetime, months: int) -> datetime:
    """Add calendar months, normalizing day overflow the way Go's AddDate does.

    Go's ``time.Time.AddDate(0, n, 0)`` rolls overflowing days into the
    following months (January 31 + 1 month = February 31 = March 3 in a
    non-leap year) instead of clamping to the last day of the month.

    Args:
        dt: The datetime to shift.
        months: Number of months to add; may be negative.

    Returns:
        The shifted datetime with the time-of-day preserved.
    """
    total = dt.year * 12 + (dt.month - 1) + months
    year, month0 = divmod(total, 12)
    month = month0 + 1
    day = dt.day
    while day > calendar.monthrange(year, month)[1]:
        day -= calendar.monthrange(year, month)[1]
        month += 1
        if month > 12:
            month, year = 1, year + 1
    return dt.replace(year=year, month=month, day=day)


class RRule:
    """Calculates recurring timestamps based on RFC 5545 recurrence options.

    Example:
        >>> rule = RRule(RRuleOptions(freq=Frequency.DAILY, interval=2, dtstart=start))
        >>> next_run = rule.after(datetime.now(timezone.utc), inclusive=False)

    Attributes:
        options: The normalized options this engine was constructed with.
    """

    def __init__(self, options: RRuleOptions) -> None:
        """Create a new RRule engine instance.

        Args:
            options: Recurrence parameters. An ``interval`` below 1 is
                normalized to 1 and a missing ``dtstart`` defaults to now,
                matching Go's ``rrule.New``.
        """
        interval = options.interval if options.interval >= 1 else 1
        dtstart = options.dtstart
        if dtstart is None:
            dtstart = datetime.now(tz=timezone.utc)
        self.options = replace(options, interval=interval, dtstart=dtstart)

    def after(self, after: datetime, inclusive: bool = False) -> datetime | None:
        """Find the next occurrence strictly after (or inclusive of) a time.

        Args:
            after: The reference time to search past.
            inclusive: When True, an occurrence exactly at ``after`` counts.

        Returns:
            The next occurrence, or None when ``count`` is exhausted, the
            rule ends before ``after`` (per ``until``), or the safety cap of
            10,000 iterations is hit (e.g. an unknown frequency that never
            advances).
        """
        opts = self.options
        curr = opts.dtstart
        assert curr is not None  # normalized in __init__
        count = 0

        while True:
            if opts.count > 0 and count >= opts.count:
                return None
            if opts.until is not None and curr > opts.until:
                return None

            if (inclusive and not curr < after) or (not inclusive and curr > after):
                return curr

            curr = self._advance(curr)
            count += 1

            # Safety cap, mirroring Go.
            if count > _SAFETY_CAP:
                return None

    def between(self, after: datetime, before: datetime, inclusive: bool = False) -> list[datetime]:
        """Return occurrences between two times.

        Args:
            after: Lower bound of the window.
            before: Upper bound of the window; an occurrence exactly at
                ``before`` is included.
            inclusive: When True, an occurrence exactly at ``after`` is
                included.

        Returns:
            All occurrences inside the window, in chronological order.
        """
        occurrences: list[datetime] = []
        curr = after

        while True:
            nxt = self.after(curr, inclusive)
            if nxt is None or nxt > before:
                break
            occurrences.append(nxt)
            curr = nxt
            inclusive = False
        return occurrences

    def _advance(self, curr: datetime) -> datetime:
        """Step ``curr`` forward by one interval of the configured frequency.

        Unknown frequencies return ``curr`` unchanged, which makes ``after``
        exhaust its safety cap exactly like the Go switch statement does.

        Args:
            curr: The current occurrence candidate.

        Returns:
            The next occurrence candidate.
        """
        interval = self.options.interval
        freq = self.options.freq
        if freq == Frequency.SECONDLY:
            return curr + timedelta(seconds=interval)
        if freq == Frequency.MINUTELY:
            return curr + timedelta(minutes=interval)
        if freq == Frequency.HOURLY:
            return curr + timedelta(hours=interval)
        if freq == Frequency.DAILY:
            return curr + timedelta(days=interval)
        if freq == Frequency.WEEKLY:
            return curr + timedelta(days=7 * interval)
        if freq == Frequency.MONTHLY:
            return _add_months(curr, interval)
        if freq == Frequency.YEARLY:
            return _add_months(curr, 12 * interval)
        return curr
