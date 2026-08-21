/**
 * High-performance, modular Telegram Bot API client.
 *
 * Composes domain mixins for messages, chats, stickers, payments, topics, games, and business APIs.
 *
 * @packageDocumentation
 */

import { BusinessAndEcosystemMethods } from "./methods/business.js";
import type { BotOptions } from "./methods/base.js";

export type { BotOptions } from "./methods/base.js";
export type { RetryOptions } from "./retry.js";

/**
 * Primary HTTP Client for executing Telegram Bot API requests.
 *
 * Inherits all domain method mixins with full autocomplete and type safety.
 *
 * @example
 * ```ts
 * const bot = new Bot(process.env.BOT_TOKEN!, {
 *   retry: {
 *     maxRetryAttempts: 4,
 *     minDelaySeconds: 1,
 *   },
 * });
 * await bot.sendMessage({ chat_id: 123456, text: "Hello world!" });
 * ```
 */
export class Bot extends BusinessAndEcosystemMethods {
  /**
   * Constructs a new {@link Bot} client instance.
   *
   * @param token - Secret token provided by BotFather.
   * @param options - Custom HTTP, retry, and endpoint options.
   */
  constructor(token: string, options: BotOptions = {}) {
    super(token, options);
  }
}
