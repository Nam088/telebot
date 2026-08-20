import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JobQueue } from "../../../src/scheduler/queue.js";
import { Job } from "../../../src/scheduler/job.js";
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
    const job = jobQueue.runDaily(
      callback,
      { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() },
      [0, 1, 2, 3, 4, 5, 6],
      undefined,
      "daily_job",
    );

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

  it("handles job callback throwing error without crashing queue", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const throwingCallback = vi.fn().mockImplementation(() => {
      throw new Error("Job failed catastrophically");
    });

    const job = jobQueue.runOnce(throwingCallback, 0.01, undefined, "error_job");
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(throwingCallback).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("handles Date objects for runOnce and runRepeating", async () => {
    const cb1 = vi.fn();
    const targetDate = new Date(Date.now() + 20);
    const j1 = jobQueue.runOnce(cb1, targetDate, undefined, "date_once");

    const cb2 = vi.fn();
    const firstDate = new Date(Date.now() + 20);
    const j2 = jobQueue.runRepeating(cb2, 0.05, firstDate, undefined, "date_repeat");

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalled();
    j2.scheduleRemoval();
  });

  it("serializes to persisted jobs and restores them with named callbacks", async () => {
    const cb = vi.fn();
    jobQueue.registerCallback("persisted_task", cb);

    const now = Date.now();
    const persistedJobs = [
      {
        name: "persisted_task",
        nextRun: now - 5000, // In past
        interval: 1000, // 1 second interval
        data: { payload: 42 },
      },
      {
        name: "unregistered_task",
        nextRun: now + 5000,
        interval: 5000,
      },
    ];

    jobQueue.restoreFromPersistedJobs(persistedJobs);

    const restoredJobs = jobQueue.getJobsByName("persisted_task");
    expect(restoredJobs.length).toBe(1);
    expect(restoredJobs[0]?.data).toEqual({ payload: 42 });
    expect(restoredJobs[0]?.next_t).toBeGreaterThanOrEqual(now);

    // Unregistered callback is ignored safely
    expect(jobQueue.getJobsByName("unregistered_task").length).toBe(0);

    // Test toPersistedJobs
    const serialized = jobQueue.toPersistedJobs();
    expect(serialized.length).toBeGreaterThanOrEqual(1);
    expect(serialized.find((j) => j.name === "persisted_task")?.data).toEqual({ payload: 42 });
  });

  it("handles daily job scheduling with specific day filters and past hour calculations", () => {
    const cb = vi.fn();
    const now = new Date();

    // Schedule for an hour in the past today -> must roll over to tomorrow
    const pastHour = (now.getHours() - 1 + 24) % 24;
    const dailyJob = jobQueue.runDaily(
      cb,
      { hour: pastHour, minute: 0, second: 0 },
      [0, 1, 2, 3, 4, 5, 6],
      undefined,
      "past_hour_job",
    );

    expect(dailyJob.next_t).toBeGreaterThan(Date.now());
  });

  it("activates pre-created jobs when jobQueue.start() is called later", async () => {
    const freshQueue = new JobQueue(bot);
    expect(freshQueue.isRunning).toBe(false);

    const cb = vi.fn();
    freshQueue.runOnce(cb, 0.01, undefined, "pre_start_job");

    // Before start(): job timer was not scheduled
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(cb).not.toHaveBeenCalled();

    // After start(): job should activate and run
    freshQueue.start();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(cb).toHaveBeenCalledTimes(1);
    freshQueue.stop();
  });

  it("compensates for callback execution drift in repeating jobs", async () => {
    const executionTimes: number[] = [];
    const cb = vi.fn().mockImplementation(async () => {
      executionTimes.push(Date.now());
      // Simulate heavy callback delay (20ms)
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    const intervalSeconds = 0.05; // 50ms interval
    const job = jobQueue.runRepeating(cb, intervalSeconds, 0.01, undefined, "drift_job");

    await new Promise((resolve) => setTimeout(resolve, 160));
    job.scheduleRemoval();

    expect(executionTimes.length).toBeGreaterThanOrEqual(2);
  });

  it("handles long delays greater than Node 24.8 day 32-bit integer limit without overflow", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    const cb = vi.fn();
    const thirtyDaysSeconds = 30 * 24 * 60 * 60; // 30 days > 24.85 days

    const job = jobQueue.runOnce(cb, thirtyDaysSeconds, undefined, "long_delay_job");
    expect(job).toBeDefined();

    // Verify setTimeout was called with capped MAX_TIMEOUT_MS (2147483647) instead of overflowing/1ms
    const calls = setTimeoutSpy.mock.calls;
    const hasMaxTimeoutCall = calls.some((call) => call[1] === 2_147_483_647);
    expect(hasMaxTimeoutCall).toBe(true);

    job.scheduleRemoval();
    setTimeoutSpy.mockRestore();
  });

  it("routes job errors through centralized errorHandler when configured", async () => {
    const errorSpy = vi.fn();
    jobQueue.errorHandler = errorSpy;

    const failingCb = vi.fn().mockImplementation(() => {
      throw new Error("Job runtime error");
    });

    jobQueue.runOnce(failingCb, 0.01, undefined, "failing_job");
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(failingCb).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0]?.[0]?.message).toBe("Job runtime error");
  });

  it("stops all timers cleanly on jobQueue.stop()", async () => {
    const cb = vi.fn();
    const j1 = jobQueue.runRepeating(cb, 0.01, 0.01);
    const j2 = jobQueue.runOnce(cb, 0.01);

    expect(jobQueue.jobs().length).toBe(2);

    jobQueue.stop();
    expect(jobQueue.isRunning).toBe(false);
    expect(jobQueue.jobs().length).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(cb).not.toHaveBeenCalled();
  });
});
