/**
 * Auto-retry and flood control configuration engine for Telegram Bot API requests.
 *
 * @packageDocumentation
 */

/**
 * Configuration options for HTTP request retry behavior and flood control.
 *
 * @example
 * ```ts
 * const bot = new Bot(process.env.BOT_TOKEN!, {
 *   retry: {
 *     maxRetryAttempts: 5,
 *     minDelaySeconds: 1,
 *     maxDelaySeconds: 60,
 *     retryOnStatus: [429, 500, 502, 503, 504],
 *     onRetry: (attempt, delayMs, error) => {
 *       console.warn(`Attempt ${attempt} failed with ${error.message}. Retrying in ${delayMs}ms...`);
 *     },
 *   },
 * });
 * ```
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts to execute before throwing an error.
   *
   * @defaultValue `3`
   */
  maxRetryAttempts?: number;

  /**
   * Maximum backoff delay in seconds between consecutive retry attempts.
   *
   * @defaultValue `30`
   */
  maxDelaySeconds?: number;

  /**
   * Base delay in seconds used for the initial retry exponential backoff.
   *
   * @defaultValue `1`
   */
  minDelaySeconds?: number;

  /**
   * HTTP status codes that trigger an automatic retry attempt.
   *
   * @defaultValue `[429, 500, 502, 503, 504]`
   */
  retryOnStatus?: number[];

  /**
   * Optional callback hook invoked before each retry attempt.
   *
   * @param attempt - The 1-based index of the failed attempt.
   * @param delayMs - The computed delay in milliseconds before the next attempt.
   * @param error - The error or API response causing the retry.
   */
  onRetry?: (attempt: number, delayMs: number, error: Error) => void;
}

/**
 * Default retry options applied to Bot API requests.
 */
export const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, "onRetry">> = {
  maxRetryAttempts: 3,
  maxDelaySeconds: 30,
  minDelaySeconds: 1,
  retryOnStatus: [429, 500, 502, 503, 504],
};

/**
 * Computes exponential backoff delay in seconds for a given attempt.
 *
 * @param attempt - 1-based attempt index.
 * @param options - Retry configuration options.
 * @param retryAfter - Telegram flood control `retry_after` parameter if provided.
 * @returns Delay duration in seconds.
 */
export function computeBackoffSeconds(
  attempt: number,
  options: RetryOptions = {},
  retryAfter?: number,
): number {
  if (typeof retryAfter === "number" && retryAfter >= 0) {
    return retryAfter;
  }

  const minDelay = options.minDelaySeconds ?? DEFAULT_RETRY_OPTIONS.minDelaySeconds;
  const maxDelay = options.maxDelaySeconds ?? DEFAULT_RETRY_OPTIONS.maxDelaySeconds;
  const computed = minDelay * Math.pow(2, Math.max(0, attempt - 1));

  return Math.min(maxDelay, Math.max(minDelay, computed));
}

/**
 * Evaluates whether an HTTP status code should trigger a retry attempt.
 *
 * @param status - The HTTP response status code.
 * @param retryOnStatus - Array of status codes configured for retry.
 * @returns `true` if the status code should be retried, `false` otherwise.
 */
export function isRetryableStatus(status: number, retryOnStatus?: number[]): boolean {
  const allowed = retryOnStatus ?? DEFAULT_RETRY_OPTIONS.retryOnStatus;
  return allowed.includes(status) || (status >= 500 && status < 600);
}
