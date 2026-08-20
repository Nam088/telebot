import { describe, it, expect, vi } from "vitest";
import { RRule } from "../../../src/scheduler/rrule.js";
import { JobQueue } from "../../../src/scheduler/queue.js";
import { Bot } from "../../../src/client/bot.js";

describe("RRule Complete RFC 5545 Spec & Timezone Tests", () => {
  const bot = new Bot("123456:MOCK_TOKEN");

  it("parses RFC 5545 string into structured options", () => {
    const rrule = new RRule(
      "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;BYHOUR=9;BYMINUTE=30;BYSETPOS=-1",
    );
    expect(rrule.options.freq).toBe("WEEKLY");
    expect(rrule.options.interval).toBe(2);
    expect(rrule.options.byweekday).toEqual(["MO", "WE", "FR"]);
    expect(rrule.options.byhour).toEqual([9]);
    expect(rrule.options.byminute).toEqual([30]);
    expect(rrule.options.bysetpos).toEqual([-1]);
  });

  it("calculates next occurrence for daily rule with hour/minute constraints", () => {
    const anchor = new Date("2026-08-20T08:00:00Z");
    const rrule = new RRule("FREQ=DAILY;BYHOUR=10;BYMINUTE=0;BYSECOND=0");

    const next = rrule.after(anchor);
    expect(next).not.toBeNull();
    expect(next?.getUTCHours()).toBe(10);
    expect(next?.getUTCMinutes()).toBe(0);
  });

  it("calculates next occurrence in specified Timezone (e.g. Asia/Ho_Chi_Minh)", () => {
    // 09:00 in Asia/Ho_Chi_Minh (UTC+7) is 02:00 UTC
    const anchor = new Date("2026-08-20T01:00:00Z");
    const rrule = new RRule("FREQ=DAILY;BYHOUR=9;BYMINUTE=0;BYSECOND=0;TZID=Asia/Ho_Chi_Minh");

    const next = rrule.after(anchor);
    expect(next).not.toBeNull();
    expect(next?.getUTCHours()).toBe(2); // 9:00 AM VN = 2:00 AM UTC
  });

  it("handles weekday filters (e.g. next Monday)", () => {
    // 2026-08-20 is a Thursday
    const anchor = new Date("2026-08-20T10:00:00Z");
    const rrule = new RRule("FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0;BYSECOND=0");

    const next = rrule.after(anchor);
    expect(next).not.toBeNull();
    expect(next?.getUTCDay()).toBe(1);
    expect(next?.getUTCDate()).toBe(24); // 2026-08-24 is next Monday
  });

  it("supports negative bymonthday (e.g. -1 for last day of month)", () => {
    // Starting in August 2026 (August has 31 days)
    const anchor = new Date("2026-08-15T00:00:00Z");
    const rrule = new RRule({
      freq: RRule.MONTHLY,
      bymonthday: -1,
      byhour: 23,
      byminute: 59,
      bysecond: 0,
    });

    const next = rrule.after(anchor);
    expect(next).not.toBeNull();
    expect(next?.getUTCDate()).toBe(31); // Aug 31st
    expect(next?.getUTCHours()).toBe(23);
    expect(next?.getUTCMinutes()).toBe(59);
  });

  it("supports nth weekday positional qualifiers (e.g. RRule.FR.nth(1) first Friday)", () => {
    // September 2026: Sept 1st is Tuesday, first Friday is Sept 4th
    const anchor = new Date("2026-09-01T00:00:00Z");
    const rrule = new RRule({
      freq: RRule.MONTHLY,
      byweekday: RRule.FR.nth(1),
      byhour: 10,
    });

    const next = rrule.after(anchor);
    expect(next).not.toBeNull();
    expect(next?.getUTCDay()).toBe(5); // Friday
    expect(next?.getUTCDate()).toBe(4); // Sept 4th
  });

  it("supports last Friday of month (RRule.FR.nth(-1))", () => {
    // August 2026: last Friday is August 28th
    const anchor = new Date("2026-08-01T00:00:00Z");
    const rrule = new RRule({
      freq: RRule.MONTHLY,
      byweekday: RRule.FR.nth(-1),
      byhour: 10,
    });

    const next = rrule.after(anchor);
    expect(next).not.toBeNull();
    expect(next?.getUTCDay()).toBe(5); // Friday
    expect(next?.getUTCDate()).toBe(28); // Aug 28th
  });

  it("stops recurrence after count limit is reached", () => {
    const anchor = new Date("2026-08-20T00:00:00Z");
    const rrule = new RRule({
      freq: RRule.DAILY,
      byhour: 12,
      count: 2,
    });

    const first = rrule.after(anchor);
    expect(first).not.toBeNull();

    const second = rrule.after(first!);
    expect(second).not.toBeNull();

    // 3rd occurrence must return null because count = 2
    const third = rrule.after(second!);
    expect(third).toBeNull();
  });

  it("returns null when UNTIL date has passed", () => {
    const anchor = new Date("2026-08-20T10:00:00Z");
    const rrule = new RRule("FREQ=DAILY;UNTIL=2026-08-19T00:00:00Z");

    expect(rrule.after(anchor)).toBeNull();
  });

  it("executes scheduled job with runRRule in JobQueue using structured Object", async () => {
    const queue = new JobQueue(bot);
    queue.start();

    const cb = vi.fn();
    const job = queue.runRRule(cb, {
      rrule: {
        freq: RRule.DAILY,
        byhour: 9,
      },
      timezone: "Asia/Ho_Chi_Minh",
      data: { topic: "standup" },
    });

    expect(job).not.toBeNull();
    expect(job?.rrule).toBeDefined();
    expect(job?.data).toEqual({ topic: "standup" });

    queue.stop();
  });
});
