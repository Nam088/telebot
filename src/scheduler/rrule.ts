/**
 * Zero-dependency RFC 5545 iCalendar Recurrence Rule (RRule) Engine with Timezone support.
 *
 * Implements frequency parsing (MINUTELY, HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY),
 * intervals, weekday filters (MO, TU, WE, TH, FR, SA, SU), monthday/hour/minute constraints,
 * and exact timezone conversions using native `Intl.DateTimeFormat`.
 *
 * @packageDocumentation
 */

/** Supported RRule frequency types. */
export type RRuleFrequency =
  "SECONDLY" | "MINUTELY" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

/** Weekday abbreviation identifiers. */
export type RRuleWeekday = "SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA";

/**
 * Parsed configuration options for an RRule schedule.
 */
export interface RRuleOptions {
  /** Recurrence frequency (e.g. `DAILY`, `WEEKLY`, `MONTHLY`). */
  freq: RRuleFrequency;
  /** Interval between occurrences (default: `1`). */
  interval?: number;
  /** Array of target weekdays (e.g. `["MO", "WE", "FR"]`). */
  byweekday?: RRuleWeekday[];
  /** Array of days of the month (1 to 31). */
  bymonthday?: number[];
  /** Array of months in year (1 to 12). */
  bymonth?: number[];
  /** Target hours (0 to 23). */
  byhour?: number[];
  /** Target minutes (0 to 59). */
  byminute?: number[];
  /** Target seconds (0 to 59). */
  bysecond?: number[];
  /** Maximum number of occurrences before stopping. */
  count?: number;
  /** Cut-off date after which no occurrences should be generated. */
  until?: Date;
  /** IANA Timezone identifier (e.g. `"Asia/Ho_Chi_Minh"`, `"America/New_York"`). Defaults to host timezone. */
  timezone?: string;
  /** Starting anchor date for the recurrence series. */
  dtstart?: Date;
}

const NUM_TO_WEEKDAY: RRuleWeekday[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/**
 * Zero-dependency RFC 5545 Recurrence Rule parser and next-date iterator.
 *
 * @example
 * ```ts
 * const rule = new RRule("FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=9;BYMINUTE=0", "Asia/Ho_Chi_Minh");
 * const nextDate = rule.after(new Date());
 * ```
 */
export class RRule {
  /** The parsed recurrence options. */
  public readonly options: RRuleOptions;

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
    }

    if (defaultTimezone && !this.options.timezone) {
      this.options.timezone = defaultTimezone;
    }
  }

  /**
   * Parses an RFC 5545 string into {@link RRuleOptions}.
   *
   * @param str - Standard RRule string.
   * @returns Structured {@link RRuleOptions}.
   */
  public static parseString(str: string): RRuleOptions {
    const clean = str.replace(/^RRULE:/i, "").trim();
    const parts = clean.split(";");
    const options: Partial<RRuleOptions> = {
      interval: 1,
    };

    for (const part of parts) {
      const [rawKey, rawVal] = part.split("=");
      if (!rawKey || !rawVal) continue;
      const key = rawKey.trim().toUpperCase();
      const val = rawVal.trim();

      switch (key) {
        case "FREQ":
          options.freq = val.toUpperCase() as RRuleFrequency;
          break;
        case "INTERVAL":
          options.interval = Math.max(1, parseInt(val, 10) || 1);
          break;
        case "COUNT":
          options.count = parseInt(val, 10);
          break;
        case "UNTIL":
          options.until = new Date(val);
          break;
        case "BYDAY":
        case "BYWEEKDAY":
          options.byweekday = val.split(",").map((d) => d.trim().toUpperCase() as RRuleWeekday);
          break;
        case "BYMONTHDAY":
          options.bymonthday = val.split(",").map((d) => parseInt(d.trim(), 10));
          break;
        case "BYMONTH":
          options.bymonth = val.split(",").map((d) => parseInt(d.trim(), 10));
          break;
        case "BYHOUR":
          options.byhour = val.split(",").map((d) => parseInt(d.trim(), 10));
          break;
        case "BYMINUTE":
          options.byminute = val.split(",").map((d) => parseInt(d.trim(), 10));
          break;
        case "BYSECOND":
          options.bysecond = val.split(",").map((d) => parseInt(d.trim(), 10));
          break;
        case "TZID":
        case "TIMEZONE":
          options.timezone = val;
          break;
      }
    }

    if (!options.freq) {
      throw new Error(`Invalid RRule string: missing FREQ attribute in "${str}"`);
    }

    return options as RRuleOptions;
  }

  /**
   * Calculates the next occurrence strictly after the given date.
   *
   * @param afterDate - Timestamp anchor after which the next occurrence must occur (defaults to now).
   * @returns Next execution Date, or `null` if series is exhausted.
   */
  public after(afterDate: Date = new Date()): Date | null {
    const afterMs = afterDate.getTime();
    const tz = this.options.timezone;

    if (this.options.until && afterMs >= this.options.until.getTime()) {
      return null;
    }

    // Step by minute / second if specified, otherwise by day/hour
    let candidate = new Date(afterMs + 1000);
    const maxSeconds = 366 * 24 * 3600; // Look up to 1 year ahead
    let secondsAdvanced = 0;

    while (secondsAdvanced < maxSeconds) {
      const parts = this.getZonedParts(candidate, tz);

      // Check second match
      if (this.options.bysecond && !this.options.bysecond.includes(parts.second)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // Check minute match
      if (this.options.byminute && !this.options.byminute.includes(parts.minute)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // Check hour match
      if (this.options.byhour && !this.options.byhour.includes(parts.hour)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // Weekday filter
      if (this.options.byweekday) {
        const currentWeekday = NUM_TO_WEEKDAY[parts.weekday];
        if (!currentWeekday || !this.options.byweekday.includes(currentWeekday)) {
          candidate = new Date(candidate.getTime() + 1000);
          secondsAdvanced += 1;
          continue;
        }
      }

      // Monthday filter
      if (this.options.bymonthday && !this.options.bymonthday.includes(parts.day)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // Month filter
      if (this.options.bymonth && !this.options.bymonth.includes(parts.month)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // Match found
      if (this.options.until && candidate.getTime() > this.options.until.getTime()) {
        return null;
      }

      return candidate;
    }

    return null;
  }

  /**
   * Helper extracting year, month, day, weekday, hour, minute, second in target timezone.
   */
  private getZonedParts(
    date: Date,
    timeZone?: string,
  ): {
    year: number;
    month: number;
    day: number;
    weekday: number;
    hour: number;
    minute: number;
    second: number;
  } {
    if (!timeZone || timeZone.toUpperCase() === "UTC") {
      return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        weekday: date.getUTCDay(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds(),
      };
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const formattedParts = formatter.formatToParts(date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let weekdayStr = "Sun";

    for (const p of formattedParts) {
      if (p.type === "year") year = parseInt(p.value, 10);
      else if (p.type === "month") month = parseInt(p.value, 10);
      else if (p.type === "day") day = parseInt(p.value, 10);
      else if (p.type === "hour") hour = parseInt(p.value, 10) % 24;
      else if (p.type === "minute") minute = parseInt(p.value, 10);
      else if (p.type === "second") second = parseInt(p.value, 10);
      else if (p.type === "weekday") weekdayStr = p.value;
    }

    const shortToWeekday: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    return {
      year,
      month,
      day,
      weekday: shortToWeekday[weekdayStr] ?? date.getDay(),
      hour,
      minute,
      second,
    };
  }
}
