/**
 * Base HTTP client and request dispatching logic for Telegram Bot API.
 *
 * @packageDocumentation
 */

import { TelegramApiError } from "../types.js";
import { buildRequestBody } from "../../utils/http.js";
import { validateToken } from "../../utils/validation.js";

/**
 * Options for initializing a {@link BaseBotClient}.
 */
export interface BotOptions {
  /** Custom base API endpoint URL (e.g. for local Bot API server). */
  apiRoot?: string;
  /** Custom fetch implementation for deterministic testing or proxy tunneling. */
  fetch?: typeof globalThis.fetch;
  /** Base delay in milliseconds for retries (used in unit tests). */
  baseDelayMs?: number;
}

/**
 * Core HTTP dispatcher and credential manager for Bot API operations.
 */
export abstract class BaseBotClient {
  public readonly token: string;
  public readonly apiRoot: string;
  protected readonly _fetch: typeof globalThis.fetch;
  protected readonly baseDelayMs?: number;

  /**
   * Constructs a new {@link BaseBotClient}.
   *
   * @param token - Telegram bot token received from BotFather.
   * @param options - Configuration options for the bot client.
   */
  constructor(token: string, options: BotOptions = {}) {
    validateToken(token);
    this.token = token;
    this.apiRoot = options.apiRoot ?? "https://api.telegram.org";
    this._fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.baseDelayMs = options.baseDelayMs;
  }

  /**
   * Helper utility to pause execution for a given number of seconds.
   *
   * @param seconds - Duration in seconds to sleep.
   */
  public async sleep(seconds: number): Promise<void> {
    const ms = this.baseDelayMs !== undefined ? this.baseDelayMs : seconds * 1000;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Core request dispatcher to call any raw Telegram Bot API endpoint.
   *
   * @typeParam T - The expected result payload type.
   * @param method - The API method name (e.g. `"sendMessage"`).
   * @param payload - Key-value map of parameters.
   * @returns Resolves with the unwrapped `result` field.
   * @throws {@link TelegramApiError} On non-200 or API errors.
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
