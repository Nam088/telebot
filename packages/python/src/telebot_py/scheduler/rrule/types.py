"""Value types for the in-house RFC 5545 recurrence rule engine.

Field-for-field port of ``packages/go/pkg/scheduler/rrule/types.go``; the Go
implementation is the source of truth for the semantics (FR-008).
"""

from __future__ import annotations

import dataclasses
import enum
from datetime import datetime


class Frequency(enum.IntEnum):
    """Recurrence frequency of an :class:`RRuleOptions` rule.

    Attributes mirror the Go ``rrule.Frequency`` constants, whose values are
    plain ints; :class:`RRuleOptions.freq` is therefore typed ``int`` so
    unknown values can be constructed and hit the engine's safety cap exactly
    like Go.
    """

    SECONDLY = 0
    MINUTELY = 1
    HOURLY = 2
    DAILY = 3
    WEEKLY = 4
    MONTHLY = 5
    YEARLY = 6


@dataclasses.dataclass(frozen=True, slots=True)
class RRuleOptions:
    """Parameters for an RFC 5545 recurrence rule.

    Mirrors Go's ``rrule.Options`` field for field. ``by_hour``,
    ``by_minute``, and ``by_second`` are carried for parity with the Go type
    but the Go engine (and therefore this port) does not expand them when
    computing occurrences; they are reserved for a future release.

    Attributes:
        freq: Recurrence frequency; one of the :class:`Frequency` values.
        interval: Gap between occurrences in units of ``freq``; values below
            1 are normalized to 1 at engine construction.
        dtstart: First occurrence of the rule; defaults to "now" when
            omitted.
        until: Inclusive upper bound; occurrences after it are not returned.
        count: Maximum number of occurrences (including ``dtstart``); ``0``
            means unlimited.
        by_hour: Reserved; unused by the engine (Go parity).
        by_minute: Reserved; unused by the engine (Go parity).
        by_second: Reserved; unused by the engine (Go parity).

    Example:
        >>> options = RRuleOptions(
        ...     freq=Frequency.DAILY,
        ...     interval=2,
        ...     dtstart=datetime(2026, 1, 1, 12, tzinfo=timezone.utc),
        ... )
    """

    freq: int
    interval: int = 1
    dtstart: datetime | None = None
    until: datetime | None = None
    count: int = 0
    by_hour: tuple[int, ...] = ()
    by_minute: tuple[int, ...] = ()
    by_second: tuple[int, ...] = ()
