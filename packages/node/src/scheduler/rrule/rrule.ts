/**
 * RFC 5545 Recurrence Rule evaluator engine.
 *
 * @packageDocumentation
 */

import { Frequency, Weekday, RRuleOptions } from "./types.js";
import { parseRRuleString } from "./parser.js";
import { getDayOfYear, isLeapYear, getZonedParts } from "./helpers.js";

const WEEKDAY_INTL_TO_CODE: string[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export class RRule {
  public static readonly YEARLY = Frequency.YEARLY;
  public static readonly MONTHLY = Frequency.MONTHLY;
  public static readonly WEEKLY = Frequency.WEEKLY;
  public static readonly DAILY = Frequency.DAILY;
  public static readonly HOURLY = Frequency.HOURLY;
  public static readonly MINUTELY = Frequency.MINUTELY;
  public static readonly SECONDLY = Frequency.SECONDLY;

  public static readonly MO = new Weekday(0);
  public static readonly TU = new Weekday(1);
  public static readonly WE = new Weekday(2);
  public static readonly TH = new Weekday(3);
  public static readonly FR = new Weekday(4);
  public static readonly SA = new Weekday(5);
  public static readonly SU = new Weekday(6);

  /** The normalized recurrence options. */
  public readonly options: RRuleOptions;

  private readonly normalizedWeekdays?: Array<{ code: string; nth?: number }>;
  private readonly normalizedMonths?: number[];
  private readonly normalizedMonthdays?: number[];
  private readonly normalizedHours?: number[];
  private readonly normalizedMinutes?: number[];
  private readonly normalizedSeconds?: number[];
  private readonly normalizedYeardays?: number[];
  private readonly normalizedSetpos?: number[];

  private occurrenceCount: number = 0;

  /**
   * Constructs a new {@link RRule} instance from an RFC 5545 string or options object.
   *
   * @param rule - RFC 5545 string (e.g. `"FREQ=DAILY;INTERVAL=2;BYHOUR=10"`) or {@link RRuleOptions}.
   * @param defaultTimezone - Optional default IANA timezone if not defined in string/options.
   */
  constructor(rule: string | RRuleOptions, defaultTimezone?: string) {
    if (typeof rule === "string") {
      this.options = RRule.parseString(rule);
    } else {
      this.options = { ...rule };
      if (typeof this.options.until === "string" || typeof this.options.until === "number") {
        this.options.until = new Date(this.options.until);
      }
      if (typeof this.options.dtstart === "string" || typeof this.options.dtstart === "number") {
        this.options.dtstart = new Date(this.options.dtstart);
      }
    }

    if (defaultTimezone && !this.options.tzid && !this.options.timezone) {
      this.options.tzid = defaultTimezone;
    }

    // Normalizations
    const rawDays = this.options.byweekday ?? this.options.byday;
    if (rawDays !== undefined) {
      const daysArr = Array.isArray(rawDays) ? rawDays : [rawDays];
      this.normalizedWeekdays = daysArr.map((d) => {
        if (typeof d === "string") {
          const match = d.match(/^([+-]?\d+)?([A-Z]{2})$/i);
          if (match) {
            const nth = match[1] ? parseInt(match[1], 10) : undefined;
            const code = match[2]!.toUpperCase();
            return { code, nth };
          }
          return { code: d.toUpperCase() };
        }
        if (typeof d === "number") {
          return { code: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][d] ?? "MO" };
        }
        if (d instanceof Weekday) {
          return {
            code: ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][d.weekday] ?? "MO",
            nth: d.n,
          };
        }
        return { code: "MO" };
      });
    }

    if (this.options.bymonth !== undefined) {
      this.normalizedMonths = Array.isArray(this.options.bymonth)
        ? this.options.bymonth
        : [this.options.bymonth];
    }
    if (this.options.bymonthday !== undefined) {
      this.normalizedMonthdays = Array.isArray(this.options.bymonthday)
        ? this.options.bymonthday
        : [this.options.bymonthday];
    }
    if (this.options.byhour !== undefined) {
      this.normalizedHours = Array.isArray(this.options.byhour)
        ? this.options.byhour
        : [this.options.byhour];
    }
    if (this.options.byminute !== undefined) {
      this.normalizedMinutes = Array.isArray(this.options.byminute)
        ? this.options.byminute
        : [this.options.byminute];
    }
    if (this.options.bysecond !== undefined) {
      this.normalizedSeconds = Array.isArray(this.options.bysecond)
        ? this.options.bysecond
        : [this.options.bysecond];
    }
    if (this.options.byyearday !== undefined) {
      this.normalizedYeardays = Array.isArray(this.options.byyearday)
        ? this.options.byyearday
        : [this.options.byyearday];
    }
    if (this.options.bysetpos !== undefined) {
      this.normalizedSetpos = Array.isArray(this.options.bysetpos)
        ? this.options.bysetpos
        : [this.options.bysetpos];
    }
  }

  /**
   * Parses an RFC 5545 string into structured {@link RRuleOptions}.
   *
   * @param str - Standard RFC 5545 string.
   * @returns Structured options object.
   */
  public static parseString(str: string): RRuleOptions {
    return parseRRuleString(str);
  }

  /**
   * Calculates the next occurrence strictly after the given date.
   *
   * @param afterDate - Timestamp anchor after which the next occurrence must occur (defaults to now).
   * @returns Next execution Date, or `null` if series is exhausted.
   */
  public after(afterDate: Date = new Date()): Date | null {
    let afterMs = afterDate.getTime();
    const startMs = this.options.dtstart ? this.options.dtstart.getTime() : afterMs;
    if (afterMs < startMs) {
      afterMs = startMs - 1000;
    }

    const tz = this.options.tzid ?? this.options.timezone;

    if (this.options.until && afterMs >= this.options.until.getTime()) {
      return null;
    }

    if (this.options.count !== undefined && this.occurrenceCount >= this.options.count) {
      return null;
    }

    let candidate = new Date(afterMs + 1000);
    const maxSeconds = 366 * 24 * 3600 * 5; // Look up to 5 years ahead
    let secondsAdvanced = 0;

    const interval = this.options.interval || 1;
    const freq =
      typeof this.options.freq === "string"
        ? Frequency[this.options.freq as keyof typeof Frequency]
        : this.options.freq;
    const dtstartZoned = getZonedParts(new Date(startMs), tz);

    while (secondsAdvanced < maxSeconds) {
      const parts = getZonedParts(candidate, tz);

      // Interval filter
      if (interval > 1) {
        if (freq === Frequency.YEARLY) {
          if (Math.abs(parts.year - dtstartZoned.year) % interval !== 0) {
            candidate = new Date(candidate.getTime() + 24 * 3600 * 1000);
            secondsAdvanced += 24 * 3600;
            continue;
          }
        } else if (freq === Frequency.MONTHLY) {
          const monthDiff =
            (parts.year - dtstartZoned.year) * 12 + (parts.month - dtstartZoned.month);
          if (Math.abs(monthDiff) % interval !== 0) {
            candidate = new Date(candidate.getTime() + 24 * 3600 * 1000);
            secondsAdvanced += 24 * 3600;
            continue;
          }
        } else if (freq === Frequency.WEEKLY) {
          const wkstVal =
            typeof this.options.wkst === "number"
              ? this.options.wkst
              : typeof this.options.wkst === "object"
                ? (this.options.wkst as Weekday).weekday
                : typeof this.options.wkst === "string"
                  ? WEEKDAY_INTL_TO_CODE.indexOf(this.options.wkst)
                  : 0;

          const dtStartTarget = new Date(
            Date.UTC(dtstartZoned.year, dtstartZoned.month - 1, dtstartZoned.day),
          );
          const candTarget = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

          // adjust to week start
          const dtStartDay = (dtStartTarget.getUTCDay() + 6) % 7; // 0=MO
          const candDay = (candTarget.getUTCDay() + 6) % 7;

          // distance to start of week
          const dtStartWeekStart = new Date(
            dtStartTarget.getTime() - ((dtStartDay - wkstVal + 7) % 7) * 86400000,
          );
          const candWeekStart = new Date(
            candTarget.getTime() - ((candDay - wkstVal + 7) % 7) * 86400000,
          );

          const weekDiff = Math.round(
            (candWeekStart.getTime() - dtStartWeekStart.getTime()) / (7 * 86400000),
          );
          if (Math.abs(weekDiff) % interval !== 0) {
            candidate = new Date(candidate.getTime() + 24 * 3600 * 1000);
            secondsAdvanced += 24 * 3600;
            continue;
          }
        } else if (freq === Frequency.DAILY) {
          const dtStartTarget = new Date(
            Date.UTC(dtstartZoned.year, dtstartZoned.month - 1, dtstartZoned.day),
          );
          const candTarget = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
          const dayDiff = Math.round((candTarget.getTime() - dtStartTarget.getTime()) / 86400000);
          if (Math.abs(dayDiff) % interval !== 0) {
            candidate = new Date(candidate.getTime() + 24 * 3600 * 1000);
            secondsAdvanced += 24 * 3600;
            continue;
          }
        }
      }

      // 1. Second filter: Step 1 second
      if (this.normalizedSeconds && !this.normalizedSeconds.includes(parts.second)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // 2. Minute filter: Step 1 minute
      if (this.normalizedMinutes && !this.normalizedMinutes.includes(parts.minute)) {
        candidate = new Date(candidate.getTime() + 60 * 1000);
        secondsAdvanced += 60;
        continue;
      }

      // 3. Hour filter: Step 1 hour
      if (this.normalizedHours && !this.normalizedHours.includes(parts.hour)) {
        candidate = new Date(candidate.getTime() + 3600 * 1000);
        secondsAdvanced += 3600;
        continue;
      }

      // 4. Weekday filter (including nth position matching like 1FR or -1FR)
      if (this.normalizedWeekdays) {
        const currentCode = WEEKDAY_INTL_TO_CODE[parts.weekday];
        const matchingRule = this.normalizedWeekdays.find((w) => w.code === currentCode);
        if (!matchingRule) {
          candidate = new Date(candidate.getTime() + 3600 * 1000);
          secondsAdvanced += 3600;
          continue;
        }

        // If nth qualifier is specified (e.g. 1st Friday or -1 last Friday of month)
        if (matchingRule.nth !== undefined) {
          const daysInMonth = new Date(parts.year, parts.month, 0).getDate();
          let nthMatches = false;
          if (matchingRule.nth > 0) {
            const nthDay = Math.floor((parts.day - 1) / 7) + 1;
            nthMatches = nthDay === matchingRule.nth;
          } else if (matchingRule.nth < 0) {
            const negativeNth = -Math.floor((daysInMonth - parts.day) / 7) - 1;
            nthMatches = negativeNth === matchingRule.nth;
          }

          if (!nthMatches) {
            candidate = new Date(candidate.getTime() + 3600 * 1000);
            secondsAdvanced += 3600;
            continue;
          }
        }
      }

      // 5. Monthday filter (supports positive 1..31 and negative -1..-31)
      if (this.normalizedMonthdays) {
        const daysInMonth = new Date(parts.year, parts.month, 0).getDate();
        const matchesMonthday = this.normalizedMonthdays.some((md) => {
          if (md > 0) return parts.day === md;
          if (md < 0) return parts.day === daysInMonth + md + 1;
          return false;
        });

        if (!matchesMonthday) {
          candidate = new Date(candidate.getTime() + 3600 * 1000);
          secondsAdvanced += 3600;
          continue;
        }
      }

      // 6. Yearday filter
      if (this.normalizedYeardays) {
        const dayOfYear = getDayOfYear(candidate, parts.year);
        const totalDays = isLeapYear(parts.year) ? 366 : 365;
        const matchesYearday = this.normalizedYeardays.some((yd) => {
          if (yd > 0) return dayOfYear === yd;
          if (yd < 0) return dayOfYear === totalDays + yd + 1;
          return false;
        });

        if (!matchesYearday) {
          candidate = new Date(candidate.getTime() + 3600 * 1000);
          secondsAdvanced += 3600;
          continue;
        }
      }

      // 7. Year / Month filter
      if (this.normalizedMonths && !this.normalizedMonths.includes(parts.month)) {
        candidate = new Date(candidate.getTime() + 3600 * 1000);
        secondsAdvanced += 3600;
        continue;
      }

      // Match found!

      // If BYSETPOS is used, we need to collect all matches for the period and pick the nth.
      // But we are in a lazy evaluation loop. So we can't just return it.
      // Wait, a shortcut for BYSETPOS=-1 or 1 in MONTHLY:
      if (this.normalizedSetpos) {
        // Find all matches for the current period (Month or Year depending on FREQ)
        // This is a naive but correct approach for simple queries.
        const periodMatches: Date[] = [];
        const pCandidate = new Date(
          freq === Frequency.YEARLY
            ? Date.UTC(parts.year, 0, 1)
            : Date.UTC(parts.year, parts.month - 1, 1),
        );
        const endPeriod = new Date(
          freq === Frequency.YEARLY
            ? Date.UTC(parts.year + 1, 0, 1)
            : Date.UTC(parts.year, parts.month, 1),
        );

        while (pCandidate < endPeriod) {
          const pParts = getZonedParts(pCandidate, tz);
          let match = true;
          if (this.normalizedWeekdays) {
            const currentCode = WEEKDAY_INTL_TO_CODE[pParts.weekday];
            if (!this.normalizedWeekdays.find((w) => w.code === currentCode)) {
              match = false;
            }
          }
          if (this.normalizedMonthdays && match) {
            const daysInMonth = new Date(pParts.year, pParts.month, 0).getDate();
            if (
              !this.normalizedMonthdays.some((md) =>
                md > 0 ? pParts.day === md : pParts.day === daysInMonth + md + 1,
              )
            ) {
              match = false;
            }
          }
          if (match) {
            // Add exact time matching
            const cDate = new Date(pCandidate);
            cDate.setUTCHours(parts.hour, parts.minute, parts.second, 0);
            periodMatches.push(cDate);
          }
          pCandidate.setUTCDate(pCandidate.getUTCDate() + 1);
        }

        // sort just in case
        periodMatches.sort((a, b) => a.getTime() - b.getTime());

        // Filter by setpos
        const selectedMatches: Date[] = [];
        for (const pos of this.normalizedSetpos) {
          if (pos > 0 && pos <= periodMatches.length) {
            selectedMatches.push(periodMatches[pos - 1]!);
          } else if (pos < 0 && Math.abs(pos) <= periodMatches.length) {
            selectedMatches.push(periodMatches[periodMatches.length + pos]!);
          }
        }

        selectedMatches.sort((a, b) => a.getTime() - b.getTime());

        const validMatch = selectedMatches.find((m) => m.getTime() > afterMs);
        if (validMatch) {
          if (this.options.until && validMatch.getTime() > this.options.until.getTime()) {
            return null;
          }
          this.occurrenceCount++;
          return validMatch;
        } else {
          // move to next period
          candidate = new Date(endPeriod.getTime() + 1000);
          secondsAdvanced += (endPeriod.getTime() - candidate.getTime()) / 1000;
          continue;
        }
      }

      if (this.options.until && candidate.getTime() > this.options.until.getTime()) {
        return null;
      }

      this.occurrenceCount++;
      return candidate;
    }

    return null;
  }
}
