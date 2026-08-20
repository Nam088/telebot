# Contract: `Job` / `JobQueue` (FR-7)

The scheduling surface a bot author uses to run work off the update loop — see `data-model.md`'s `Job`, `JobQueue`, `PersistedJob` entity for the field table. This contract covers the behavioral guarantees the signatures alone don't capture.

Nouns are `snake_case`, verbs are `camelCase`, per the Naming Conventions rule.

```ts
type JobCallback<C extends CallbackContext = CallbackContext> =
  (context: C) => Promise<void> | void;

interface JobOptions {
  name?: string;            // OVERRIDE only — see auto-naming below
  data?: unknown;
  chat_id?: number | string;
  user_id?: number;
}

interface DailyTime { hour: number; minute?: number; second?: number }

class Job<C extends CallbackContext = CallbackContext> {
  readonly callback: JobCallback<C>;
  name: string;             // ALWAYS populated
  data?: unknown;
  chat_id?: number | string;
  user_id?: number;
  next_t: number;           // absolute epoch ms of next execution
  interval?: number;        // ms; undefined => one-shot
  last?: number;            // absolute epoch ms upper bound; undefined => unbounded
  days?: readonly number[]; // weekday filter for daily jobs
  removed: boolean;
  enabled: boolean;
  get nextRun(): number;    // alias of next_t
  scheduleRemoval(): void;
  remove(): void;           // alias of scheduleRemoval()
  toPersisted(): PersistedJob;
  static fromPersisted<C>(p: PersistedJob, cb: JobCallback<C>, o?: JobOptions): Job<C>;
}

interface JobQueueOptions {
  bot: Bot;
  persistence?: Persistence;
  onError?: (error: Error, job: Job) => void | Promise<void>;
}

class JobQueue<C extends CallbackContext = CallbackContext> {
  constructor(options: JobQueueOptions);
  get jobs(): Set<Job<C>>;
  get running(): boolean;
  runOnce(cb: JobCallback<C>, when: number | Date, o?: JobOptions): Job<C>;
  runRepeating(cb: JobCallback<C>, interval_ms: number,
               o?: JobOptions & { first?: number | Date; last?: number | Date }): Job<C>;
  runDaily(cb: JobCallback<C>, time: DailyTime | Date,
           o?: JobOptions & { days?: readonly number[] }): Job<C>;
  getJobsByName(name: string): Job<C>[];
  registerCallback(name: string, cb: JobCallback<C>): void;
  loadFromPersistence(): Promise<Job<C>[]>;
  saveToPersistence(): Promise<void>;
  start(): void;
  stop(): void;
}
```

## Naming aliases

`data-model.md` names `nextRun` and `remove()`; the Naming Conventions rule mandates `next_t` (noun) and `scheduleRemoval()` (verb). Both are implemented: the convention-compliant names are primary, and `nextRun` / `remove()` are documented aliases so either contract can be relied on. `PersistedJob.nextRun` keeps its name as the **on-disk field** — it is already committed across all three persistence backends and their contract tests, so renaming it would break stored state.

## Behavioral guarantees

- **Auto-naming**: `name` resolves to `options.name ?? (callback.name || "job")` and is therefore always a non-empty string. Every scheduling method registers its callback under that name unconditionally. This is load-bearing: reattachment on reload keys on `name`, so a nameless job would be silently dropped by `saveToPersistence()`.
- **Time encoding**: everywhere a time is accepted (`when`, `first`, `last`), a `number` is a **delay in milliseconds from now** and a `Date` is an **absolute instant**. `0` means "due immediately", never "never".
- **`runOnce`**: one-shot (`interval` undefined). After it runs the job is removed from `jobs`.
- **`runRepeating`**: `first` defaults to `interval_ms`. After each run `next_t` advances by `interval_ms` and the job stays queued. If the next computed `next_t` would exceed `last`, the job stops repeating and is removed rather than rescheduled.
- **`runDaily`**: `interval` is `86_400_000`; the first run is today at the requested wall-clock time if still future, else tomorrow. `days` filters weekdays as **`0` = Sunday … `6` = Saturday, matching `Date.prototype.getDay()`** so no index translation is needed; default is all seven days. With `days` set, scheduling skips forward to the next permitted weekday.
- **`enabled === false` is total**: the scheduler excludes the job when computing the next deadline, never executes it, and **does not advance `next_t`**. This is deliberate — advancing or polling a disabled one-shot job would busy-loop. On re-enable the job is immediately due.
- **`scheduleRemoval()`** marks `removed` and detaches the job from `jobs`; a removed job never runs again.
- **Execution context**: the callback receives a `CallbackContext` carrying `bot`, `job` (the running job), and `job_queue`. With a `persistence` configured it also carries `bot_data`, plus `chat_data` when `chat_id` is set and `user_data` when `user_id` is set. Custom payloads reach the callback as `context.job.data`.
- **Error isolation**: a throwing callback must not break the tick loop or surface an unhandled rejection. Errors route to `onError` when provided; a repeating job survives and stays scheduled.
- **Scheduling engine**: a single timer armed to the earliest due `next_t` among enabled, non-removed jobs — no idle polling. Re-armed after each tick. An empty queue arms no timer. `start()` and `stop()` are both idempotent; `stop()` clears the pending timer.
- **Persistence round-trip**: `toPersisted()` emits `{ name, nextRun: next_t, interval?, data? }` and **omits `undefined` keys** so deep-equality round-trips hold. `saveToPersistence()` writes all non-removed jobs. `loadFromPersistence()` rebuilds each persisted job by looking up its callback in the registry by `name`; a persisted job whose name has no registered callback is **skipped, not thrown** — callbacks are code and cannot be serialized, so a renamed or deleted callback must degrade gracefully rather than crash startup.

## Conformance

`tests/unit/scheduler/queue.test.ts` must exercise every guarantee above using fake timers (`vi.useFakeTimers()` + `vi.setSystemTime()`, advanced with `await vi.advanceTimersByTimeAsync()` so async callbacks settle, and `vi.useRealTimers()` in cleanup). The persistence round-trip and the reattach-by-name path are additionally covered by the shared persistence contract suite in `tests/unit/storage/persistence.test.ts`.

## Out of scope for FR-7

Monthly scheduling and arbitrary cron-style expressions are not part of this contract. They would be additive (`runMonthly`) and must not change any guarantee above.
