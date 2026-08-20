/**
 * Job queue and asynchronous background task scheduler.
 *
 * @packageDocumentation
 */

import { Bot } from "../client/bot.js";
import { CallbackContext } from "../kernel/context.js";
import type { PersistedJob } from "../storage/driver.js";

/**
 * Signature for job callback functions executed by the {@link JobQueue}.
 *
 * @remarks
 * The `Data` type parameter is not part of the callback's own signature (job data is read
 * via `context.job?.data`, matching {@link Job.data}); it exists so `JobCallback<Data>` stays
 * paired with the `Data` used by {@link Job}, {@link JobQueue.runOnce}, and its siblings.
 */
export type JobCallback<_Data = unknown, C extends CallbackContext = CallbackContext> = (
  context: C,
) => Promise<void> | void;

/**
 * Represents a time specification for daily recurring jobs.
 */
export interface TimeOfDay {
  /** Hour (0-23) */
  hour: number;
  /** Minute (0-59) */
  minute?: number;
  /** Second (0-59) */
  second?: number;
}

/**
 * Maximum delay supported by Node.js 32-bit signed integer `setTimeout` (~24.85 days).
 */
const MAX_TIMEOUT_MS = 2_147_483_647;

/**
 * Represents an individual scheduled task managed by {@link JobQueue}.
 *
 * @typeParam Data - Type of custom data payload attached to this job.
 */
export class Job<Data = unknown> {
  /** The unique name of the scheduled job. */
  public readonly name: string;
  /** The callback function to execute. */
  public readonly callback: JobCallback<Data>;
  /** Optional custom data payload passed to the job callback. */
  public readonly data?: Data;
  /** Optional Telegram chat ID associated with this job. */
  public readonly chat_id?: number | string;
  /** Optional Telegram user ID associated with this job. */
  public readonly user_id?: number;
  /** Whether the job is enabled for execution. When `false`, the timer fires but the callback is skipped. */
  public enabled: boolean = true;
  /** Whether the job has been removed or canceled. */
  public removed: boolean = false;
  /** Interval in milliseconds between runs (for repeating jobs). */
  public readonly intervalMs?: number;
  /** Epoch timestamp in milliseconds when the job is next scheduled to execute. */
  public next_t: number;

  private _timer?: NodeJS.Timeout;
  private readonly _jobQueue: JobQueue;

  /**
   * Constructs a new {@link Job} instance.
   */
  constructor(options: {
    name: string;
    callback: JobCallback<Data>;
    jobQueue: JobQueue;
    nextRunMs: number;
    intervalMs?: number;
    data?: Data;
    chat_id?: number | string;
    user_id?: number;
  }) {
    this.name = options.name;
    this.callback = options.callback;
    this._jobQueue = options.jobQueue;
    this.next_t = options.nextRunMs;
    this.intervalMs = options.intervalMs;
    this.data = options.data;
    this.chat_id = options.chat_id;
    this.user_id = options.user_id;

    this._schedule();
  }

  /**
   * Internal scheduler that handles long delays > 24.8 days safely by chunking.
   *
   * @internal
   */
  public _schedule(): void {
    if (this.removed || !this._jobQueue.isRunning) return;

    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }

    const totalDelay = Math.max(0, this.next_t - Date.now());

    // If delay exceeds Node's 32-bit signed int max (24.8 days), wait MAX_TIMEOUT_MS and re-evaluate
    if (totalDelay > MAX_TIMEOUT_MS) {
      this._timer = setTimeout(() => {
        this._schedule();
      }, MAX_TIMEOUT_MS);
      return;
    }

    this._timer = setTimeout(() => {
      this._execute();
    }, totalDelay);
  }

  private async _execute(): Promise<void> {
    if (this.removed) return;

    if (this.enabled) {
      const context = new CallbackContext({
        bot: this._jobQueue.bot,
        job_queue: this._jobQueue,
        job: this,
      });

      try {
        await this.callback(context);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (this._jobQueue.errorHandler) {
          try {
            await this._jobQueue.errorHandler(error, context);
          } catch (ehErr) {
            console.error(
              `Error in Application errorHandler while processing job "${this.name}":`,
              ehErr,
            );
          }
        } else {
          console.error(`Error in job "${this.name}":`, error);
        }
      }
    }

    if (this.intervalMs !== undefined && !this.removed) {
      // Drift compensation: calculate next target run based on previous next_t
      const now = Date.now();
      let nextTarget = this.next_t + this.intervalMs;
      if (nextTarget <= now) {
        const missedSteps = Math.ceil((now - nextTarget) / this.intervalMs);
        nextTarget += missedSteps * this.intervalMs;
      }
      this.next_t = nextTarget;
      this._schedule();
    } else {
      this.scheduleRemoval();
    }
  }

  /**
   * Permanently cancels and removes this job from the {@link JobQueue}.
   */
  public scheduleRemoval(): void {
    this.removed = true;
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = undefined;
    }
    this._jobQueue._removeJob(this);
  }

  /**
   * Alias for {@link Job.scheduleRemoval}.
   */
  public remove(): void {
    this.scheduleRemoval();
  }
}

/**
 * Central scheduler for managing and executing background timers, intervals, and persistent jobs.
 */
export class JobQueue {
  /** The {@link Bot} client instance associated with this scheduler. */
  public readonly bot: Bot;
  /** Whether the job queue is currently active. */
  public isRunning: boolean = false;
  /** Optional centralized error handler callback delegate. */
  public errorHandler?: (error: Error, context: CallbackContext) => Promise<void> | void;

  private _jobs: Set<Job> = new Set();
  private _jobsByName: Map<string, Set<Job>> = new Map();
  private _jobsByChatId: Map<string, Set<Job>> = new Map();
  private _registeredCallbacks: Map<string, JobCallback<any>> = new Map();

  /**
   * Creates a new {@link JobQueue} instance.
   *
   * @param bot - The {@link Bot} client.
   */
  constructor(bot: Bot) {
    this.bot = bot;
  }

  private _indexJob(job: Job): void {
    this._jobs.add(job);

    // Index by name
    let byName = this._jobsByName.get(job.name);
    if (!byName) {
      byName = new Set();
      this._jobsByName.set(job.name, byName);
    }
    byName.add(job);

    // Index by chat_id
    if (job.chat_id !== undefined) {
      const chatKey = String(job.chat_id);
      let byChat = this._jobsByChatId.get(chatKey);
      if (!byChat) {
        byChat = new Set();
        this._jobsByChatId.set(chatKey, byChat);
      }
      byChat.add(job);
    }
  }

  /**
   * Starts the job queue and activates all scheduled jobs.
   */
  public start(): void {
    this.isRunning = true;
    for (const job of this._jobs) {
      if (!job.removed) {
        job._schedule();
      }
    }
  }

  /**
   * Stops the job queue and cancels all pending timeouts.
   */
  public stop(): void {
    this.isRunning = false;
    for (const job of this._jobs) {
      job.scheduleRemoval();
    }
    this._jobs.clear();
    this._jobsByName.clear();
    this._jobsByChatId.clear();
  }

  /**
   * Registers a named callback so persisted jobs can re-bind on application restart.
   *
   * @param name - The job name.
   * @param callback - The handler function.
   */
  public registerCallback<Data = unknown>(name: string, callback: JobCallback<Data>): void {
    this._registeredCallbacks.set(name, callback);
  }

  /**
   * Schedules a one-off job to run after a specified duration or at a specific date.
   *
   * @param callback - The async function to execute.
   * @param when - Number of seconds in the future or a `Date` object.
   * @param data - Optional data payload passed to the job callback.
   * @param name - Optional job name (defaults to anonymous identifier).
   * @param chat_id - Optional associated chat ID.
   * @param user_id - Optional associated user ID.
   * @returns The created {@link Job} instance.
   */
  public runOnce<Data = unknown>(
    callback: JobCallback<Data>,
    when: number | Date,
    data?: Data,
    name?: string,
    chat_id?: number | string,
    user_id?: number,
  ): Job<Data> {
    const jobName = name ?? `job_once_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.registerCallback(jobName, callback);

    const nextRunMs = typeof when === "number" ? Date.now() + when * 1000 : when.getTime();

    const job = new Job<Data>({
      name: jobName,
      callback,
      jobQueue: this,
      nextRunMs,
      data,
      chat_id,
      user_id,
    });

    this._indexJob(job);
    return job;
  }

  /**
   * Schedules a recurring job that executes repeatedly at a fixed interval.
   *
   * @param callback - The async function to execute.
   * @param interval - Interval in seconds between executions.
   * @param first - Optional delay (seconds) or `Date` before the first run.
   * @param data - Optional custom data payload.
   * @param name - Optional job name.
   * @param chat_id - Optional associated chat ID.
   * @param user_id - Optional associated user ID.
   * @returns The created recurring {@link Job} instance.
   */
  public runRepeating<Data = unknown>(
    callback: JobCallback<Data>,
    interval: number,
    first?: number | Date,
    data?: Data,
    name?: string,
    chat_id?: number | string,
    user_id?: number,
  ): Job<Data> {
    const jobName = name ?? `job_repeat_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.registerCallback(jobName, callback);

    const intervalMs = interval * 1000;
    let nextRunMs: number;
    if (first !== undefined) {
      nextRunMs = typeof first === "number" ? Date.now() + first * 1000 : first.getTime();
    } else {
      nextRunMs = Date.now() + intervalMs;
    }

    const job = new Job<Data>({
      name: jobName,
      callback,
      jobQueue: this,
      nextRunMs,
      intervalMs,
      data,
      chat_id,
      user_id,
    });

    this._indexJob(job);
    return job;
  }

  /**
   * Schedules a job to run daily at a specified time and optional days of the week.
   *
   * @param callback - The async function to execute.
   * @param time - Specific hour, minute, and second of execution.
   * @param days - Array of weekday numbers (0 = Sunday, 6 = Saturday) when the job runs.
   * @param data - Optional custom data payload.
   * @param name - Optional job name.
   * @param chat_id - Optional associated chat ID.
   * @param user_id - Optional associated user ID.
   * @returns The created daily recurring {@link Job} instance.
   */
  public runDaily<Data = unknown>(
    callback: JobCallback<Data>,
    time: TimeOfDay,
    days: number[] = [0, 1, 2, 3, 4, 5, 6],
    data?: Data,
    name?: string,
    chat_id?: number | string,
    user_id?: number,
  ): Job<Data> {
    const jobName = name ?? `job_daily_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.registerCallback(jobName, callback);

    const target = new Date();
    target.setHours(time.hour, time.minute ?? 0, time.second ?? 0, 0);

    if (target.getTime() <= Date.now() || !days.includes(target.getDay())) {
      // Find next matching day
      do {
        target.setDate(target.getDate() + 1);
      } while (!days.includes(target.getDay()));
    }

    // Daily recurring check every 24 hours
    const intervalMs = 24 * 60 * 60 * 1000;
    const job = new Job<Data>({
      name: jobName,
      callback,
      jobQueue: this,
      nextRunMs: target.getTime(),
      intervalMs,
      data,
      chat_id,
      user_id,
    });

    this._indexJob(job);
    return job;
  }

  /**
   * Returns all active scheduled jobs currently managed by this queue.
   *
   * @returns Array of active {@link Job} instances.
   *
   * @example
   * ```ts
   * const allJobs = app.scheduler.jobs();
   * console.log(`Active jobs: ${allJobs.length}`);
   * ```
   */
  public jobs(): Job[] {
    return Array.from(this._jobs);
  }

  /**
   * Finds all jobs matching a given name in O(1) time complexity.
   *
   * @param name - The job identifier name to filter by.
   * @returns Array of matching {@link Job} instances.
   *
   * @example
   * ```ts
   * const reminderJobs = app.scheduler.getJobsByName("daily_reminder");
   * ```
   */
  public getJobsByName(name: string): Job[] {
    const set = this._jobsByName.get(name);
    return set ? Array.from(set) : [];
  }

  /**
   * Finds all jobs associated with a specific chat ID in O(1) time complexity.
   *
   * @param chat_id - Telegram chat ID.
   * @returns Array of matching {@link Job} instances.
   *
   * @example
   * ```ts
   * const chatJobs = app.scheduler.getJobsByChatId(123456);
   * ```
   */
  public getJobsByChatId(chat_id: number | string): Job[] {
    const set = this._jobsByChatId.get(String(chat_id));
    return set ? Array.from(set) : [];
  }

  /**
   * Internal helper to remove a job from tracking and indexes.
   *
   * @param job - Job instance to remove.
   * @internal
   */
  public _removeJob(job: Job): void {
    this._jobs.delete(job);

    const byName = this._jobsByName.get(job.name);
    if (byName) {
      byName.delete(job);
      if (byName.size === 0) this._jobsByName.delete(job.name);
    }

    if (job.chat_id !== undefined) {
      const chatKey = String(job.chat_id);
      const byChat = this._jobsByChatId.get(chatKey);
      if (byChat) {
        byChat.delete(job);
        if (byChat.size === 0) this._jobsByChatId.delete(chatKey);
      }
    }
  }

  /**
   * Serializes all active jobs into {@link PersistedJob} descriptors for persistence.
   *
   * @returns Array of {@link PersistedJob} records.
   */
  public toPersistedJobs(): PersistedJob[] {
    const list: PersistedJob[] = [];
    for (const job of this._jobs) {
      if (!job.removed) {
        list.push({
          name: job.name,
          nextRun: job.next_t,
          interval: job.intervalMs,
          data: job.data,
        });
      }
    }
    return list;
  }

  /**
   * Restores jobs from persistence using registered named callbacks.
   *
   * @param persistedList - Array of stored {@link PersistedJob} records.
   */
  public restoreFromPersistedJobs(persistedList: PersistedJob[]): void {
    const now = Date.now();
    for (const pj of persistedList) {
      const cb = this._registeredCallbacks.get(pj.name);
      if (cb) {
        let nextRunMs = pj.nextRun;
        if (nextRunMs < now) {
          if (pj.interval) {
            // Fast-forward next run
            const elapsed = now - nextRunMs;
            const steps = Math.ceil(elapsed / pj.interval);
            nextRunMs += steps * pj.interval;
          } else {
            nextRunMs = now;
          }
        }

        const job = new Job({
          name: pj.name,
          callback: cb,
          jobQueue: this,
          nextRunMs,
          intervalMs: pj.interval,
          data: pj.data,
        });
        this._indexJob(job);
      }
    }
  }
}
