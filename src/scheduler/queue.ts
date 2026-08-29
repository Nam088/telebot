/**
 * Job queue and asynchronous background task scheduler.
 *
 * @packageDocumentation
 */

import { Bot } from "../client/bot.js";
import { CallbackContext } from "../kernel/context.js";
import type { PersistedJob } from "../storage/driver.js";
import { RRule, type RRuleOptions } from "./rrule/index.js";
import { Job, JobCallback } from "./job.js";

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
 * Options for configuring an RFC 5545 RRule scheduled job.
 */
export interface RunRRuleOptions<Data = unknown> {
  /** Standard RFC 5545 RRule string (e.g. `"FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=9"`) or structured options. */
  rrule: string | RRuleOptions;
  /** Optional IANA timezone identifier (e.g. `"Asia/Ho_Chi_Minh"`). */
  timezone?: string;
  /** Optional custom data payload passed to the callback. */
  data?: Data;
  /** Optional job name identifier. */
  name?: string;
  /** Optional associated Telegram chat ID. */
  chat_id?: number | string;
  /** Optional associated Telegram user ID. */
  user_id?: number;
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
   * Schedules a job using an RFC 5545 Recurrence Rule (RRule) with full Timezone support.
   *
   * @param callback - The async function to execute.
   * @param options - Configuration options specifying `rrule`, `timezone`, `data`, and job metadata.
   * @returns The created recurring {@link Job} instance, or `null` if the rule cannot generate future occurrences.
   *
   * @example
   * ```ts
   * // Run every Monday, Wednesday, Friday at 9:00 AM in Vietnam timezone:
   * app.scheduler.runRRule(
   *   async (context) => {
   *     await context.bot.sendMessage({ chat_id: 123456, text: "Morning team update!" });
   *   },
   *   {
   *     rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=9;BYMINUTE=0",
   *     timezone: "Asia/Ho_Chi_Minh",
   *   }
   * );
   * ```
   */
  public runRRule<Data = unknown>(
    callback: JobCallback<Data>,
    options: RunRRuleOptions<Data>,
  ): Job<Data> | null {
    const jobName =
      options.name ?? `job_rrule_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.registerCallback(jobName, callback);

    const rrule = new RRule(options.rrule, options.timezone);
    const nextDate = rrule.after(new Date());
    if (!nextDate) {
      return null;
    }

    const job = new Job<Data>({
      name: jobName,
      callback,
      jobQueue: this,
      nextRunMs: nextDate.getTime(),
      rrule,
      rruleOptions: options.rrule,
      timezone: options.timezone,
      data: options.data,
      chat_id: options.chat_id,
      user_id: options.user_id,
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
          rrule: job.rruleOptions,
          timezone: job.timezone,
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
        let rrule: RRule | undefined;
        let drop = false;

        if (pj.rrule) {
          rrule = new RRule(pj.rrule, pj.timezone);
          if (nextRunMs < now) {
            const nextDate = rrule.after(new Date(now));
            if (nextDate) {
              nextRunMs = nextDate.getTime();
            } else {
              drop = true;
            }
          }
        } else if (nextRunMs < now) {
          if (pj.interval) {
            // Fast-forward next run
            const elapsed = now - nextRunMs;
            const steps = Math.ceil(elapsed / pj.interval);
            nextRunMs += steps * pj.interval;
          } else {
            nextRunMs = now;
          }
        }

        if (!drop) {
          const job = new Job({
            name: pj.name,
            callback: cb,
            jobQueue: this,
            nextRunMs,
            intervalMs: pj.interval,
            rrule,
            rruleOptions: pj.rrule,
            timezone: pj.timezone,
            data: pj.data,
          });
          this._indexJob(job);
        }
      }
    }
  }
}
