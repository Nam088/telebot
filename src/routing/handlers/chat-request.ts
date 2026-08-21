/**
 * Handlers for Telegram Chat Join Requests and Chat Boost updates.
 *
 * @packageDocumentation
 */

import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Handler for user requests to join private chats or channels (`chat_join_request` updates).
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const handler = new ChatJoinRequestHandler(async (update, context) => {
 *   await context.bot.approveChatJoinRequest(
 *     update.chat_join_request!.chat.id,
 *     update.chat_join_request!.from.id,
 *   );
 * });
 * ```
 */
export class ChatJoinRequestHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Checks whether the incoming update contains a `chat_join_request`.
   *
   * @param update - The update to test.
   * @returns `true` if update has `chat_join_request`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.chat_join_request);
  }
}

/**
 * Handler for chat boost additions and removals (`chat_boost` and `removed_chat_boost` updates).
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const handler = new ChatBoostHandler(async (update, context) => {
 *   if (update.chat_boost) {
 *     console.log("Chat boosted by user:", update.chat_boost.boost.source);
 *   }
 * });
 * ```
 */
export class ChatBoostHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /** Target only added or updated boosts (`chat_boost`) */
  public static readonly ADDED = 1;
  /** Target only removed boosts (`removed_chat_boost`) */
  public static readonly REMOVED = 2;
  /** Target any boost event */
  public static readonly ANY = 3;

  public readonly boostTypes: number;

  /**
   * Constructs a new {@link ChatBoostHandler}.
   *
   * @param callback - Function invoked when the update matches.
   * @param boostTypes - Filter mask (`ADDED`, `REMOVED`, or `ANY`).
   * @defaultValue `ChatBoostHandler.ANY`
   */
  constructor(callback: HandlerCallback<C, R>, boostTypes: number = ChatBoostHandler.ANY) {
    super(callback);
    this.boostTypes = boostTypes;
  }

  /**
   * Checks whether the incoming update matches the configured boost filter.
   *
   * @param update - The update to test.
   * @returns `true` if update matches.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    if (this.boostTypes === ChatBoostHandler.ADDED) {
      return Boolean(update.chat_boost);
    }
    if (this.boostTypes === ChatBoostHandler.REMOVED) {
      return Boolean(update.removed_chat_boost);
    }
    return Boolean(update.chat_boost || update.removed_chat_boost);
  }
}
