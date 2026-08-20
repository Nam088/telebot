const MAX_TIMEOUT_MS = 2147483647;
import { CallbackContext } from "../kernel/context.js";
import { JobQueue } from "./queue.js";
import { RRule } from "./rrule.js";

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
  /** Optional RFC 5545 recurrence rule engine instance. */
  public readonly rrule?: RRule;
  /** Epoch timestamp in milliseconds when the job is next scheduled to execute. */
  public next_t: number;
  /** Optional RFC 5545 rrule string or options for persistence recovery. */
  public readonly rruleOptions?: string | import("./rrule.js").RRuleOptions;
  /** Optional timezone for persistence recovery. */
  public readonly timezone?: string;
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
    rrule?: RRule;
    rruleOptions?: string | import("./rrule.js").RRuleOptions;
    timezone?: string;
    data?: Data;
    chat_id?: number | string;
    user_id?: number;
  }) {
    this.name = options.name;
    this.callback = options.callback;
    this._jobQueue = options.jobQueue;
    this.next_t = options.nextRunMs;
    this.intervalMs = options.intervalMs;
    this.rrule = options.rrule;
    this.rruleOptions = options.rruleOptions;
    this.timezone = options.timezone;
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

    if (this.rrule && !this.removed) {
      const nextDate = this.rrule.after(new Date(this.next_t));
      if (nextDate) {
        this.next_t = nextDate.getTime();
        this._schedule();
      } else {
        this.scheduleRemoval();
      }
    } else if (this.intervalMs !== undefined && !this.removed) {
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
