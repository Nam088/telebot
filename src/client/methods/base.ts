/**
 * Base HTTP client and request dispatching logic for Telegram Bot API.
 *
 * @packageDocumentation
 */

import { TelegramApiError } from "../types.js";
import { buildRequestBody } from "../../utils/http.js";
import { validateToken } from "../../utils/validation.js";

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
   * Internal fetch adapter instance used for HTTP dispatch.
   */
  protected readonly _fetch: typeof globalThis.fetch;

  /**
   * Optional base delay in milliseconds used for retry calculations.
   */
  protected readonly baseDelayMs?: number;

  /**
   * Constructs a new {@link BaseBotClient}.
   *
   * @param token - Telegram bot token received from BotFather. Must follow format `<bot_id>:<secret_token>`.
   * @param options - Configuration options for the client including custom fetch or local API server URL.
   * @throws {@link TypeError} When the token is empty or invalid.
   */
  constructor(token: string, options: BotOptions = {}) {
    validateToken(token);
    this.token = token;
    this.apiRoot = options.apiRoot ?? "https://api.telegram.org";
    this._fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.baseDelayMs = options.baseDelayMs;
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
   * Handles HTTP 429 rate-limiting with `retry_after` backoff and HTTP 5xx retries.
   *
   * @typeParam T - The expected return payload type from Telegram.
   * @param method - The Bot API method name (e.g. `"sendMessage"`, `"getMe"`, `"setWebhook"`).
   * @param payload - Key-value parameters corresponding to the API method fields.
   * @returns Resolves with the unwrapped `result` field returned by Telegram.
   * @throws {@link TelegramApiError} When Telegram returns `ok: false`, HTTP 4xx, or after retry exhaustion on 5xx errors.
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

    let attempt = 0;
    while (true) {
      attempt++;
      try {
        const response = await this._fetch(url, {
          method: "POST",
          headers,
          body,
        });

        if (response.status === 429) {
          const json = (await response.json()) as any;
          const retryAfter = json?.parameters?.retry_after ?? Math.min(30, 2 ** attempt);
          await this.sleep(retryAfter);
          continue;
        }

        if (response.status >= 500 && response.status < 600) {
          if (attempt >= 4) {
            throw new TelegramApiError(response.status, `Server error: ${response.statusText}`);
          }
          const backoff = Math.min(30, 2 ** attempt);
          await this.sleep(backoff);
          continue;
        }

        const data = (await response.json()) as any;
        if (!data.ok) {
          throw new TelegramApiError(
            data.error_code ?? response.status,
            data.description ?? "Unknown error",
            data.parameters
          );
        }

        return data.result as T;
      } catch (err: unknown) {
        if (err instanceof TelegramApiError) {
          throw err;
        }
        if (attempt >= 4) {
          throw new TelegramApiError(0, err instanceof Error ? err.message : String(err));
        }
        const backoff = Math.min(30, 2 ** attempt);
        await this.sleep(backoff);
      }
    }
  }
}
