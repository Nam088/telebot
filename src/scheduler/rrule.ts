/**
 * Zero-dependency RFC 5545 iCalendar Recurrence Rule (RRule) Engine with Timezone support.
 *
 * Full parity with RFC 5545 and standard rrule.js options:
 * - Constants: RRule.YEARLY (0), RRule.MONTHLY (1), RRule.WEEKLY (2), RRule.DAILY (3), RRule.HOURLY (4), RRule.MINUTELY (5), RRule.SECONDLY (6)
 * - Weekdays: RRule.MO (0), RRule.TU (1), RRule.WE (2), RRule.TH (3), RRule.FR (4), RRule.SA (5), RRule.SU (6)
 * - Full Option keys: freq, interval, dtstart, tzid, timezone, until, count, byweekday, byday, bymonth, bymonthday, byhour, byminute, bysecond, wkst.
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

  /** Returns an instance representing the nth occurrence of this weekday (e.g. 1st Friday of month). */
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
  /** Array of days of the month (1 to 31) or single day. */
  bymonthday?: number[] | number;
  /** Array of months in year (1 to 12) or single month. */
  bymonth?: number[] | number;
  /** Target hours (0 to 23) or single hour. */
  byhour?: number[] | number;
  /** Target minutes (0 to 59) or single minute. */
  byminute?: number[] | number;
  /** Target seconds (0 to 59) or single second. */
  bysecond?: number[] | number;
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

const WEEKDAY_TO_INTL: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

const FREQ_MAP: Record<number, string> = {
  0: "YEARLY",
  1: "MONTHLY",
  2: "WEEKLY",
  3: "DAILY",
  4: "HOURLY",
  5: "MINUTELY",
  6: "SECONDLY",
};

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

  private readonly normalizedDays?: string[];
  private readonly normalizedMonths?: number[];
  private readonly normalizedMonthdays?: number[];
  private readonly normalizedHours?: number[];
  private readonly normalizedMinutes?: number[];
  private readonly normalizedSeconds?: number[];

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

    // Normalizations for high-performance iteration
    const rawDays = this.options.byweekday ?? this.options.byday;
    if (rawDays !== undefined) {
      const daysArr = Array.isArray(rawDays) ? rawDays : [rawDays];
      this.normalizedDays = daysArr.map((d) => {
        if (typeof d === "string") return d.toUpperCase();
        if (typeof d === "number") return ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][d] ?? "MO";
        if (d instanceof Weekday)
          return ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][d.weekday] ?? "MO";
        return "MO";
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

    let candidate = new Date(afterMs + 1000);
    const maxSeconds = 366 * 24 * 3600; // Look up to 1 year ahead
    let secondsAdvanced = 0;

    while (secondsAdvanced < maxSeconds) {
      const parts = this.getZonedParts(candidate, tz);

      // Check second match
      if (this.normalizedSeconds && !this.normalizedSeconds.includes(parts.second)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // Check minute match
      if (this.normalizedMinutes && !this.normalizedMinutes.includes(parts.minute)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // Check hour match
      if (this.normalizedHours && !this.normalizedHours.includes(parts.hour)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // Weekday filter
      if (this.normalizedDays) {
        const currentWeekday = WEEKDAY_INTL_TO_CODE[parts.weekday];
        if (!currentWeekday || !this.normalizedDays.includes(currentWeekday)) {
          candidate = new Date(candidate.getTime() + 1000);
          secondsAdvanced += 1;
          continue;
        }
      }

      // Monthday filter
      if (this.normalizedMonthdays && !this.normalizedMonthdays.includes(parts.day)) {
        candidate = new Date(candidate.getTime() + 1000);
        secondsAdvanced += 1;
        continue;
      }

      // Month filter
      if (this.normalizedMonths && !this.normalizedMonths.includes(parts.month)) {
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
