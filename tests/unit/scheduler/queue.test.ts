import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JobQueue, Job } from "../../../src/scheduler/queue.js";
import { Bot } from "../../../src/client/bot.js";
import { CallbackContext } from "../../../src/kernel/context.js";
import { MemoryPersistence } from "../../../src/storage/memory.js";

describe("JobQueue and Job", () => {
  let bot: Bot;
  let jobQueue: JobQueue;

  beforeEach(() => {
    bot = new Bot("TEST_TOKEN");
    jobQueue = new JobQueue(bot);
    jobQueue.start();
  });

  afterEach(() => {
    jobQueue.stop();
  });

  it("schedules and runs a one-off job via runOnce", async () => {
    const callback = vi.fn();
    const job = jobQueue.runOnce(callback, 0.02, { foo: "bar" }, "one_off_job", 123, 456);

    expect(job).toBeInstanceOf(Job);
    expect(job.name).toBe("one_off_job");
    expect(job.chat_id).toBe(123);
    expect(job.user_id).toBe(456);
    expect(job.data).toEqual({ foo: "bar" });
    expect(job.enabled).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(callback).toHaveBeenCalledTimes(1);
    const ctx = callback.mock.calls[0][0] as CallbackContext;
    expect(ctx.job).toBe(job);
    expect(ctx.job_queue).toBe(jobQueue);
    expect(jobQueue.jobs().length).toBe(0); // Removed after runOnce completes
  });

  it("schedules and runs a repeating job via runRepeating", async () => {
    const callback = vi.fn();
    const job = jobQueue.runRepeating(callback, 0.02, 0.01, { count: 1 }, "repeating_job");

    expect(job.name).toBe("repeating_job");

    await new Promise((resolve) => setTimeout(resolve, 65));

    expect(callback.mock.calls.length).toBeGreaterThanOrEqual(2);

    job.scheduleRemoval();
    expect(job.removed).toBe(true);

    const callCountAfterRemoval = callback.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(callback.mock.calls.length).toBe(callCountAfterRemoval);
  });

  it("schedules a daily job via runDaily", async () => {
    const callback = vi.fn();
    // Daily job with immediate target time today or tomorrow
    const now = new Date();
    now.setSeconds(now.getSeconds() + 1);
    const job = jobQueue.runDaily(callback, { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() }, [0, 1, 2, 3, 4, 5, 6], undefined, "daily_job");

    expect(job.name).toBe("daily_job");
    expect(jobQueue.getJobsByName("daily_job")).toContain(job);
  });

  it("can disable and re-enable a job", async () => {
    const callback = vi.fn();
    const job = jobQueue.runRepeating(callback, 0.02, 0.01, undefined, "disabled_test");

    job.enabled = false;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callback).not.toHaveBeenCalled();

    job.enabled = true;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callback).toHaveBeenCalled();
  });

  it("retrieves jobs by name and by chat_id", () => {
    const cb = vi.fn();
    const j1 = jobQueue.runOnce(cb, 10, undefined, "alpha", 111);
    const j2 = jobQueue.runOnce(cb, 10, undefined, "alpha", 222);
    const j3 = jobQueue.runOnce(cb, 10, undefined, "beta", 111);

    expect(jobQueue.getJobsByName("alpha")).toEqual([j1, j2]);
    expect(jobQueue.getJobsByChatId(111)).toEqual([j1, j3]);
  });
});
