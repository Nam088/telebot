/**
 * Native, zero-dependency Rate Limiter Middleware for Telegram bots.
 *
 * @packageDocumentation
 */

import type { CallbackContext } from "../kernel/context.js";
import type { MiddlewareFn } from "../kernel/dispatcher.js";

/**
 * Options for configuring the {@link rateLimit} middleware.
 */
export interface RateLimitOptions {
  /**
   * Time window in milliseconds.
   * @defaultValue 1000 (1 second)
   */
  windowMs?: number;
  /**
   * Maximum allowed requests per key within the time window.
   * @defaultValue 1
   */
  limit?: number;
  /**
   * Custom key extractor function.
   * Defaults to extracting the user ID or chat ID.
   */
  keyGenerator?: (context: CallbackContext) => string;
  /**
   * Optional callback invoked when an update exceeds the rate limit.
   */
  onLimitExceeded?: (context: CallbackContext) => Promise<void> | void;
}

/**
 * Creates an in-memory sliding window rate limiter middleware.
 *
 * Prevents flood limits and excessive requests by throttling updates per user or chat.
 *
 * @param options - Configuration options for the rate limiter.
 * @returns A {@link MiddlewareFn} ready to be used with `app.use()`.
 *
 * @example
 * ```ts
 * // Limit each user to max 3 messages per 2 seconds
 * app.use(rateLimit({
 *   windowMs: 2000,
 *   limit: 3,
 *   onLimitExceeded: async (ctx) => {
 *     await ctx.reply("Slow down! Please wait a moment.");
 *   },
 * }));
 * ```
 */
export function rateLimit(options: RateLimitOptions = {}): MiddlewareFn {
  const windowMs = options.windowMs ?? 1000;
  const limit = options.limit ?? 1;
  const keyGenerator =
    options.keyGenerator ??
    ((ctx) => String(ctx.update?.effective_user?.id ?? ctx.update?.effective_chat?.id ?? "global"));

  const hits = new Map<string, number[]>();

  // Cleanup timer every 60 seconds to prevent memory leaks from inactive keys
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of hits.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, valid);
      }
    }
  }, 60000);

  // Allow Node.js process to exit cleanly without waiting for this interval
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return async (context: CallbackContext, next: () => Promise<void>): Promise<void> => {
    const key = keyGenerator(context);
    const now = Date.now();
    const timestamps = hits.get(key) ?? [];

    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= limit) {
      if (options.onLimitExceeded) {
        await options.onLimitExceeded(context);
      }
      return; // Drop update (do not call next())
    }

    validTimestamps.push(now);
    hits.set(key, validTimestamps);

    await next();
  };
}
