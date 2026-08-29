/**
 * RFC 5545 Recurrence Rule types and constants.
 *
 * @packageDocumentation
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
 * Note: Numeric weekday values use 0 = MO (Monday) through 6 = SU (Sunday) per RFC 5545 / ISO 8601,
 * distinct from JavaScript's `Date.prototype.getDay()` (where 0 is Sunday).
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

/**
 * Weekday abbreviation identifiers or numbers (0=MO to 6=SU).
 * Note: Numeric weekday values use 0 = MO (Monday) through 6 = SU (Sunday) per RFC 5545 / ISO 8601,
 * distinct from JavaScript's `Date.prototype.getDay()` (where 0 is Sunday).
 */
export type RRuleWeekday = "SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | number | Weekday;

/**
 * Standard RFC 5545 RRule options.
 */
export interface RRuleOptions {
  /** Recurrence frequency (e.g. `RRule.DAILY`, `RRule.WEEKLY` or `"DAILY"`). */
  freq: RRuleFrequency;
  /** Interval between occurrences (default: `1`). */
  interval?: number;
  /**
   * Array of target weekdays or single weekday (e.g. `[RRule.MO, RRule.FR]`, `["MO", "FR"]`, `[0, 4]`).
   * Note: Numeric weekday values use 0 = MO (Monday) through 6 = SU (Sunday) per RFC 5545 / ISO 8601.
   */
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
  wkst?: RRuleWeekday;
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
