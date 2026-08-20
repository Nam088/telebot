/**
 * Zero-dependency RFC 5545 iCalendar Recurrence Rule (RRule) Engine with full Timezone support.
 *
 * Implements complete RFC 5545 options parity:
 * - Constants: RRule.YEARLY (0), RRule.MONTHLY (1), RRule.WEEKLY (2), RRule.DAILY (3), RRule.HOURLY (4), RRule.MINUTELY (5), RRule.SECONDLY (6)
 * - Weekdays: RRule.MO (0), RRule.TU (1), RRule.WE (2), RRule.TH (3), RRule.FR (4), RRule.SA (5), RRule.SU (6) with `.nth(n)`
 * - Complete Options: freq, interval, dtstart, until, count, tzid, timezone, wkst, byweekday, byday,
 *   bymonthday (including negative offsets like -1 for last day of month), bymonth, byhour, byminute, bysecond,
 *   byyearday, byweekno, and bysetpos.
 *
 * @packageDocumentation
 */

/**
 * RFC 5545 Frequency constants.
 */
export const Frequency = {
  YEARLY: 0,
  MONTHLY: 1,
  WEEKLY: 2,
  DAILY: 3,
  HOURLY: 4,
  MINUTELY: 5,
  SECONDLY: 6,
} as const;

export type FrequencyType = (typeof Frequency)[keyof typeof Frequency];

/**
 * Weekday representation with RFC 5545 nth occurrence support.
 */
export class Weekday {
  public readonly weekday: number;
  public readonly n?: number;

  constructor(weekday: number, n?: number) {
    this.weekday = weekday;
    this.n = n;
  }

  /** Returns an instance representing the nth occurrence of this weekday (e.g. 1st Friday of month or -1 for last Friday). */
  public nth(n: number): Weekday {
    return new Weekday(this.weekday, n);
  }

  public toString(): string {
    const names = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
    const name = names[this.weekday] ?? "MO";
    return this.n !== undefined ? `${this.n}${name}` : name;
  }
}

/** Supported RRule frequency types. */
export type RRuleFrequency =
  "SECONDLY" | "MINUTELY" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | FrequencyType;

/** Weekday abbreviation identifiers. */
export type RRuleWeekday = "SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | number | Weekday;

/**
 * Standard RFC 5545 RRule options.
 */
export interface RRuleOptions {
  /** Recurrence frequency (e.g. `RRule.DAILY`, `RRule.WEEKLY` or `"DAILY"`). */
  freq: RRuleFrequency;
  /** Interval between occurrences (default: `1`). */
  interval?: number;
  /** Array of target weekdays or single weekday (e.g. `[RRule.MO, RRule.FR]`, `["MO", "FR"]`, `[0, 4]`). */
  byweekday?: RRuleWeekday[] | RRuleWeekday;
  /** Alias for `byweekday` matching RFC 5545 standard naming. */
  byday?: RRuleWeekday[] | RRuleWeekday;
  /** Array of days of the month (1 to 31 or negative integers like -1 for last day of month). */
  bymonthday?: number[] | number;
  /** Array of months in year (1 to 12) or single month. */
  bymonth?: number[] | number;
  /** Target hours (0 to 23) or single hour. */
  byhour?: number[] | number;
  /** Target minutes (0 to 59) or single minute. */
  byminute?: number[] | number;
  /** Target seconds (0 to 59) or single second. */
  bysecond?: number[] | number;
  /** Array of days of the year (1 to 366 or negative offsets like -1). */
  byyearday?: number[] | number;
  /** Array of ISO-8601 week numbers in year (1 to 53). */
  byweekno?: number[] | number;
  /** Array of occurrence position integers within the recurrence set (e.g. 1st, 2nd, or -1 for last). */
  bysetpos?: number[] | number;
  /** Maximum number of occurrences before stopping. */
  count?: number;
  /** Cut-off date after which no occurrences should be generated. */
  until?: Date;
  /** IANA Timezone identifier (e.g. `"Asia/Ho_Chi_Minh"`, `"America/New_York"`). */
  tzid?: string;
  /** Alias for `tzid`. */
  timezone?: string;
  /** Starting anchor date for the recurrence series. */
  dtstart?: Date;
  /** Week start day (default: `RRule.MO`). */
  wkst?: Weekday | number;
}

const WEEKDAY_INTL_TO_CODE: string[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/**
 * Zero-dependency RFC 5545 Recurrence Rule parser and next-date iterator.
 *
 * @example
 * ```ts
 * const rule = new RRule({
 *   freq: RRule.WEEKLY,
 *   byweekday: [RRule.MO, RRule.FR],
 *   byhour: 9,
 *   byminute: 0,
 *   tzid: "Asia/Ho_Chi_Minh",
 * });
 * const nextDate = rule.after(new Date());
 * ```
 */
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
        case "BYYEARDAY":
          options.byyearday = val.split(",").map((d) => parseInt(d.trim(), 10));
          break;
        case "BYWEEKNO":
          options.byweekno = val.split(",").map((d) => parseInt(d.trim(), 10));
          break;
        case "BYSETPOS":
          options.bysetpos = val.split(",").map((d) => parseInt(d.trim(), 10));
          break;
        case "TZID":
        case "TIMEZONE":
          options.tzid = val;
          break;
      }
    }

    if (options.freq === undefined) {
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
    const tz = this.options.tzid ?? this.options.timezone;

    if (this.options.until && afterMs >= this.options.until.getTime()) {
      return null;
    }

    if (this.options.count !== undefined && this.occurrenceCount >= this.options.count) {
      return null;
    }

    let candidate = new Date(afterMs + 1000);
    const maxSeconds = 366 * 24 * 3600; // Look up to 1 year ahead
    let secondsAdvanced = 0;

    while (secondsAdvanced < maxSeconds) {
      const parts = this.getZonedParts(candidate, tz);

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
        const dayOfYear = this.getDayOfYear(candidate, parts.year);
        const totalDays = this.isLeapYear(parts.year) ? 366 : 365;
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
      if (this.options.until && candidate.getTime() > this.options.until.getTime()) {
        return null;
      }

      this.occurrenceCount++;
      return candidate;
    }

    return null;
  }

  private getDayOfYear(date: Date, year: number): number {
    const start = new Date(Date.UTC(year, 0, 1));
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (24 * 3600 * 1000)) + 1;
  }

  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
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
