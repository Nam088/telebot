/**
 * Base HTTP client and request dispatching logic for Telegram Bot API.
 *
 * @packageDocumentation
 */

import { TelegramApiError } from "../types.js";
import { buildRequestBody } from "../../utils/http.js";
import { validateToken } from "../../utils/validation.js";
import {
  type RetryOptions,
  DEFAULT_RETRY_OPTIONS,
  computeBackoffSeconds,
  isRetryableStatus,
} from "../retry.js";

export type { RetryOptions } from "../retry.js";

/**
 * Options for initializing a {@link BaseBotClient} or {@link Bot}.
 */
export interface BotOptions {
  /**
   * Custom base API endpoint URL (e.g. `http://localhost:8081` for a local Telegram Bot API server).
   *
   * @defaultValue `"https://api.telegram.org"`
   */
  apiRoot?: string;

  /**
   * Custom fetch implementation for deterministic testing, custom agents, or proxy tunneling.
   *
   * @defaultValue `globalThis.fetch`
   */
  fetch?: typeof globalThis.fetch;

  /**
   * Base delay in milliseconds used for exponential backoff during rate-limiting or server retries.
   *
   * Primarily customized in test suites for fast execution.
   */
  baseDelayMs?: number;

  /**
   * Per-request abort timeout in milliseconds. If a request (e.g. a hung connection) takes
   * longer than this, it is aborted and treated as a retryable network error.
   *
   * @remarks
   * For long-polling `getUpdates` calls, the effective timeout is automatically extended to
   * cover the requested long-poll `timeout` (in seconds) plus a buffer, so a large poll
   * timeout is never mistaken for a hang.
   *
   * @defaultValue `30000`
   */
  requestTimeoutMs?: number;

  /**
   * Configurable auto-retry and flood control options.
   */
  retry?: RetryOptions;
}

/**
 * Hook invoked with every outgoing Bot API request before it is serialized and sent.
 *
 * Hooks run synchronously in registration order and may mutate `payload` to decorate or rewrite
 * requests (e.g. metrics, logging, forced options). Throwing from a hook fails the request.
 *
 * @param method - The Bot API method name (e.g. `"sendMessage"`).
 * @param payload - The mutable request payload about to be sent.
 */
export type RequestTransformFn = (method: string, payload: Record<string, unknown>) => void;

/**
 * Hook invoked with every successful Bot API response after it is unwrapped.
 *
 * Hooks run in registration order. A hook may observe the result (return `undefined`) or return
 * a replacement value that is passed to subsequent hooks and ultimately returned to the caller.
 *
 * @param method - The Bot API method name (e.g. `"sendMessage"`).
 * @param result - The unwrapped `result` payload returned by Telegram.
 * @returns A replacement result, or `undefined` to keep the current value.
 */
export type ResponseTransformFn = (method: string, result: unknown) => unknown;

/**
 * Observer hook invoked whenever a Bot API request finally fails with a {@link TelegramApiError}.
 *
 * Hooks run in registration order right before the error is thrown (after retry exhaustion for
 * `429`/`5xx`/network errors, or immediately for non-retryable failures). Throwing inside a hook
 * is swallowed so observers cannot mask the original error.
 *
 * @param method - The Bot API method name that failed.
 * @param error - The final typed error about to be thrown.
 */
export type ApiErrorHookFn = (method: string, error: TelegramApiError) => void;

/**
 * Extra time, in milliseconds, added on top of a `getUpdates` long-poll `timeout` (converted
 * to milliseconds) when computing the effective per-request abort timeout.
 */
const LONG_POLL_TIMEOUT_BUFFER_MS = 5000;

/**
 * Shape of the raw JSON envelope returned by every Telegram Bot API endpoint.
 */
interface TelegramApiEnvelope<T> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
  parameters?: {
    retry_after?: number;
    migrate_to_chat_id?: number;
  };
}

/**
 * Core HTTP dispatcher and credential manager for all Telegram Bot API operations.
 *
 * Implements automated rate-limit backoff (HTTP 429 `retry_after`), exponential backoff
 * for server errors (HTTP 5xx), payload serialization (JSON or multipart `FormData`),
 * and uniform error unwrapping into {@link TelegramApiError}.
 */
export abstract class BaseBotClient {
  /**
   * Secret Telegram Bot API token received from BotFather.
   */
  public readonly token: string;

  /**
   * Base endpoint URL of the Telegram Bot API server.
   */
  public readonly apiRoot: string;

  /**
   * Client configuration options.
   */
  public readonly options: BotOptions;

  /**
   * Internal fetch adapter instance used for HTTP dispatch.
   */
  protected readonly _fetch: typeof globalThis.fetch;

  /**
   * Optional base delay in milliseconds used for retry calculations.
   */
  protected readonly baseDelayMs?: number;

  /**
   * Default per-request abort timeout in milliseconds.
   */
  protected readonly requestTimeoutMs: number;

  private readonly transformHooks: Array<{ fn: RequestTransformFn; tag?: string }> = [];
  private readonly responseHooks: Array<{ fn: ResponseTransformFn; tag?: string }> = [];
  private readonly apiErrorHooks: Array<{ fn: ApiErrorHookFn; tag?: string }> = [];

  /**
   * Registers a hook invoked before every outgoing Bot API request.
   *
   * Hooks run in registration order and may mutate the payload. Intended for plugins that need to
   * observe or decorate all API traffic (logging, metrics, throttling signals, test mocks).
   *
   * @param hook - Callback receiving the method name and the mutable payload.
   * @param tag - Optional owner tag; all hooks sharing a tag can be removed together via {@link BaseBotClient.removeHooksByTag}.
   * @returns This client instance for chaining.
   *
   * @example
   * ```ts
   * bot.transformRequest((method, payload) => {
   *   console.log(`Calling ${method}`);
   *   payload["protect_content"] = true;
   * });
   * ```
   */
  public transformRequest(hook: RequestTransformFn, tag?: string): this {
    this.transformHooks.push({ fn: hook, tag });
    return this;
  }

  /**
   * Registers a hook invoked with every successful Bot API response.
   *
   * Hooks run in registration order. Returning a value replaces the result for subsequent hooks
   * and the caller; returning `undefined` keeps it unchanged. Useful for response logging,
   * caching, or normalization plugins.
   *
   * @param hook - Callback receiving the method name and the unwrapped result.
   * @param tag - Optional owner tag for grouped removal via {@link BaseBotClient.removeHooksByTag}.
   * @returns This client instance for chaining.
   *
   * @example
   * ```ts
   * bot.transformResponse((method, result) => {
   *   console.log(`${method} succeeded`);
   * });
   * ```
   */
  public transformResponse(hook: ResponseTransformFn, tag?: string): this {
    this.responseHooks.push({ fn: hook, tag });
    return this;
  }

  /**
   * Registers an observer invoked whenever a Bot API request finally fails.
   *
   * Hooks run in registration order right before the {@link TelegramApiError} is thrown, after
   * retries are exhausted. Observers cannot alter the error; exceptions inside a hook are
   * swallowed and logged. Useful for alerting and metrics plugins.
   *
   * @param hook - Callback receiving the method name and the final error.
   * @param tag - Optional owner tag for grouped removal via {@link BaseBotClient.removeHooksByTag}.
   * @returns This client instance for chaining.
   *
   * @example
   * ```ts
   * bot.onApiError((method, error) => {
   *   console.error(`${method} failed: ${error.description}`);
   * });
   * ```
   */
  public onApiError(hook: ApiErrorHookFn, tag?: string): this {
    this.apiErrorHooks.push({ fn: hook, tag });
    return this;
  }

  /**
   * Removes every request transform, response transform, and API error hook registered with
   * the given owner tag.
   *
   * @param tag - Owner tag previously passed when registering hooks.
   * @returns The number of hooks removed.
   *
   * @example
   * ```ts
   * bot.removeHooksByTag("my-plugin");
   * ```
   */
  public removeHooksByTag(tag: string): number {
    const countOf = (hooks: Array<{ tag?: string }>): number =>
      hooks.filter((h) => h.tag === tag).length;
    const removed =
      countOf(this.transformHooks) + countOf(this.responseHooks) + countOf(this.apiErrorHooks);
    const keep = <T extends { tag?: string }>(hooks: T[]): T[] =>
      hooks.filter((h) => h.tag !== tag);
    this.transformHooks.splice(0, this.transformHooks.length, ...keep(this.transformHooks));
    this.responseHooks.splice(0, this.responseHooks.length, ...keep(this.responseHooks));
    this.apiErrorHooks.splice(0, this.apiErrorHooks.length, ...keep(this.apiErrorHooks));
    return removed;
  }

  /**
   * Constructs a new {@link BaseBotClient}.
   *
   * @param token - Telegram bot token received from BotFather. Must follow format `<bot_id>:<secret_token>`.
   * @param options - Configuration options for the client including custom fetch or local API server URL.
   * @throws When the token is empty or invalid.
   */
  constructor(token: string, options: BotOptions = {}) {
    validateToken(token);
    this.token = token;
    this.options = { ...options };
    this.apiRoot = options.apiRoot ?? "https://api.telegram.org";
    this._fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.baseDelayMs = options.baseDelayMs;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 30_000;
  }

  /**
   * Dynamically configures or updates the auto-retry and flood control settings.
   *
   * @param options - Partial retry options to update.
   * @returns This client instance for chaining.
   *
   * @example
   * ```ts
   * bot.configureRetry({
   *   maxRetryAttempts: 5,
   *   minDelaySeconds: 2,
   * });
   * ```
   */
  public configureRetry(options: Partial<RetryOptions>): this {
    this.options.retry = {
      ...this.options.retry,
      ...options,
    };
    return this;
  }

  /**
   * Helper utility to pause asynchronous execution for a given number of seconds.
   *
   * Used internally during retry delays and rate-limit backoff.
   *
   * @param seconds - Duration in seconds to pause execution.
   * @returns Promise that resolves once the specified duration elapses.
   *
   * @example
   * ```ts
   * await bot.sleep(2); // Pauses execution for 2 seconds
   * ```
   */
  public async sleep(seconds: number): Promise<void> {
    const ms = this.baseDelayMs !== undefined ? this.baseDelayMs : seconds * 1000;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Core request dispatcher to execute any raw Telegram Bot API endpoint.
   *
   * Automatically serializes JSON objects or multipart `FormData` when file buffers / `InputFile` are present.
   * Handles HTTP 429 rate-limiting (honoring `retry_after`) and HTTP 5xx retries with exponential
   * backoff, sharing a single retry budget across both so that repeated `429`s cannot retry forever
   * or starve genuine `5xx` retries.
   *
   * @typeParam T - The expected return payload type from Telegram.
   * @param method - The Bot API method name (e.g. `"sendMessage"`, `"getMe"`, `"setWebhook"`).
   * @param payload - Key-value parameters corresponding to the API method fields.
   * @returns Resolves with the unwrapped `result` field returned by Telegram.
   * @throws {@link TelegramApiError} When Telegram returns `ok: false`, HTTP 4xx, or after retry exhaustion on `429`/`5xx`/network errors.
   *
   * @example
   * ```ts
   * const user = await bot.request<User>("getMe");
   * console.log(`Bot username: @${user.username}`);
   * ```
   */
  public async request<T>(method: string, payload: Record<string, unknown> = {}): Promise<T> {
    const url = `${this.apiRoot}/bot${this.token}/${method}`;
    for (const hook of this.transformHooks) {
      hook.fn(method, payload);
    }
    const { body, headers } = buildRequestBody(payload);

    // getUpdates long-polling passes its wait time (in seconds) as `timeout`; the abort
    // timeout must comfortably exceed it or a long poll would be mistaken for a hang. Only
    // extend the timeout when a poll timeout is actually present, so a small configured
    // requestTimeoutMs still applies as-is to ordinary (non-long-poll) requests.
    const pollTimeoutMs = typeof payload.timeout === "number" ? payload.timeout * 1000 : 0;
    const effectiveTimeoutMs =
      pollTimeoutMs > 0
        ? Math.max(this.requestTimeoutMs, pollTimeoutMs + LONG_POLL_TIMEOUT_BUFFER_MS)
        : this.requestTimeoutMs;

    const retryOpts = this.options.retry ?? {};
    const maxAttempts = 1 + (retryOpts.maxRetryAttempts ?? DEFAULT_RETRY_OPTIONS.maxRetryAttempts);

    let attempt = 0;
    while (true) {
      attempt++;
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), effectiveTimeoutMs);
      try {
        const response = await this._fetch(url, {
          method: "POST",
          headers,
          body,
          signal: timeoutController.signal,
        });

        if (response.status === 429) {
          const json = (await response.json()) as TelegramApiEnvelope<T>;
          const apiError = new TelegramApiError(
            json.error_code ?? response.status,
            json.description ?? "Too Many Requests",
            json.parameters,
          );

          if (attempt >= maxAttempts) {
            throw this.fail(method, apiError);
          }

          const retryAfter = json.parameters?.retry_after;
          const delaySeconds = computeBackoffSeconds(attempt, retryOpts, retryAfter);
          const delayMs = this.baseDelayMs !== undefined ? this.baseDelayMs : delaySeconds * 1000;

          if (retryOpts.onRetry) {
            retryOpts.onRetry(attempt, delayMs, apiError);
          }

          await this.sleep(delaySeconds);
          continue;
        }

        if (isRetryableStatus(response.status, retryOpts.retryOnStatus)) {
          const apiError = new TelegramApiError(
            response.status,
            `Server error: ${response.statusText}`,
          );

          if (attempt >= maxAttempts) {
            throw this.fail(method, apiError);
          }

          const delaySeconds = computeBackoffSeconds(attempt, retryOpts);
          const delayMs = this.baseDelayMs !== undefined ? this.baseDelayMs : delaySeconds * 1000;

          if (retryOpts.onRetry) {
            retryOpts.onRetry(attempt, delayMs, apiError);
          }

          await this.sleep(delaySeconds);
          continue;
        }

        const data = (await response.json()) as TelegramApiEnvelope<T>;
        if (!data.ok) {
          throw this.fail(
            method,
            new TelegramApiError(
              data.error_code ?? response.status,
              data.description ?? "Unknown error",
              data.parameters,
            ),
          );
        }

        let result: unknown = data.result;
        for (const hook of this.responseHooks) {
          const next = hook.fn(method, result);
          if (next !== undefined) {
            result = next;
          }
        }
        return result as T;
      } catch (err: unknown) {
        if (err instanceof TelegramApiError) {
          throw err;
        }

        const rawMessage = err instanceof Error ? err.message : String(err);
        const errorObj = err instanceof Error ? err : new Error(rawMessage);

        if (attempt >= maxAttempts) {
          throw this.fail(method, new TelegramApiError(0, this.redactToken(rawMessage)));
        }

        const delaySeconds = computeBackoffSeconds(attempt, retryOpts);
        const delayMs = this.baseDelayMs !== undefined ? this.baseDelayMs : delaySeconds * 1000;

        if (retryOpts.onRetry) {
          retryOpts.onRetry(attempt, delayMs, errorObj);
        }

        await this.sleep(delaySeconds);
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Runs all registered API error hooks for a failed method, then returns the error for throwing.
   *
   * Hook exceptions are swallowed so observers can never mask the original API error.
   *
   * @param method - The Bot API method name that failed.
   * @param error - The final typed error.
   * @returns The same error, for `throw this.fail(...)` call sites.
   */
  private fail(method: string, error: TelegramApiError): TelegramApiError {
    for (const hook of this.apiErrorHooks) {
      try {
        hook.fn(method, error);
      } catch (hookErr) {
        console.error("Error in API error hook:", hookErr);
      }
    }
    return error;
  }

  /**
   * Removes any occurrence of the bot token from a string.
   *
   * @remarks
   * Request errors (e.g. from a failed `fetch`) can echo back the request URL, which embeds
   * the bot token. Redacting it here prevents the token from reaching {@link TelegramApiError}
   * and, transitively, any logs or error handlers that print the error message.
   *
   * @param message - The raw message to redact.
   * @returns `message` with every occurrence of the bot token replaced by `[REDACTED]`.
   */
  private redactToken(message: string): string {
    return message.split(this.token).join("[REDACTED]");
  }
}
