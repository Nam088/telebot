import { describe, it, expect, vi } from "vitest";
import { RRule } from "../../../src/scheduler/rrule.js";
import { JobQueue } from "../../../src/scheduler/queue.js";
import { Bot } from "../../../src/client/bot.js";

describe("RRule Recurrence Rule Engine & Timezone Tests", () => {
  const bot = new Bot("123456:MOCK_TOKEN");

  it("parses RFC 5545 string into structured options", () => {
    const rrule = new RRule("FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;BYHOUR=9;BYMINUTE=30");
    expect(rrule.options.freq).toBe("WEEKLY");
    expect(rrule.options.interval).toBe(2);
    expect(rrule.options.byweekday).toEqual(["MO", "WE", "FR"]);
    expect(rrule.options.byhour).toEqual([9]);
    expect(rrule.options.byminute).toEqual([30]);
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
    // Monday is day 1
    expect(next?.getUTCDay()).toBe(1);
    expect(next?.getUTCDate()).toBe(24); // 2026-08-24 is next Monday
  });

  it("returns null when UNTIL date has passed", () => {
    const anchor = new Date("2026-08-20T10:00:00Z");
    const rrule = new RRule("FREQ=DAILY;UNTIL=2026-08-19T00:00:00Z");

    expect(rrule.after(anchor)).toBeNull();
  });

  it("supports standard rrule.js object syntax with RRule constants (RRule.WEEKLY, RRule.MO, RRule.FR)", () => {
    const rrule = new RRule({
      freq: RRule.WEEKLY,
      interval: 2,
      byweekday: [RRule.MO, RRule.FR],
      byhour: 14,
      byminute: 30,
      tzid: "America/New_York",
    });

    expect(rrule.options.freq).toBe(RRule.WEEKLY);
    expect(rrule.options.interval).toBe(2);
    expect(rrule.options.tzid).toBe("America/New_York");
  });

  it("supports nth weekday representation (e.g. RRule.FR.nth(1))", () => {
    const firstFriday = RRule.FR.nth(1);
    expect(firstFriday.weekday).toBe(4);
    expect(firstFriday.n).toBe(1);
    expect(firstFriday.toString()).toBe("1FR");
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
