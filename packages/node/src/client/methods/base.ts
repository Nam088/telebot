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
            throw apiError;
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
            throw apiError;
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
          throw new TelegramApiError(
            data.error_code ?? response.status,
            data.description ?? "Unknown error",
            data.parameters,
          );
        }

        return data.result as T;
      } catch (err: unknown) {
        if (err instanceof TelegramApiError) {
          throw err;
        }

        const rawMessage = err instanceof Error ? err.message : String(err);
        const errorObj = err instanceof Error ? err : new Error(rawMessage);

        if (attempt >= maxAttempts) {
          throw new TelegramApiError(0, this.redactToken(rawMessage));
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
