import type { RRuleOptions, RRuleFrequency, RRuleWeekday } from "./types.js";

/**
 * Parses an RFC 5545 string into structured {@link RRuleOptions}.
 *
 * @param str - Standard RFC 5545 string.
 * @returns Structured options object.
 */
export function parseRRuleString(str: string): RRuleOptions {
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
      case "DTSTART":
        options.dtstart = new Date(val);
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
      case "WKST":
        options.wkst = val.toUpperCase() as RRuleWeekday;
        break;
    }
  }

  if (options.freq === undefined) {
    throw new Error(`Invalid RRule string: missing FREQ attribute in "${str}"`);
  }

  return options as RRuleOptions;
}
