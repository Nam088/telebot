/**
 * Handlers for Telegram Message Reaction updates.
 *
 * @packageDocumentation
 */

import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Filter predicate or pattern for matching reactions.
 */
export type ReactionFilter =
  | string
  | string[]
  | { type: "emoji"; emoji: string }
  | { type: "custom_emoji"; custom_emoji_id: string }
  | { type: "paid" }
  | ((update: Update) => boolean | Promise<boolean>);

/**
 * Handler for user message reaction changes (`message_reaction` updates).
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const handler = new MessageReactionHandler(async (update, context) => {
 *   console.log("Reaction changed on message:", update.message_reaction?.message_id);
 * });
 * ```
 */
export class MessageReactionHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  public readonly filter?: ReactionFilter;

  /**
   * Constructs a new {@link MessageReactionHandler}.
   *
   * @param callback - Function invoked when the reaction matches.
   * @param filter - Optional filter matching specific emojis, custom emoji IDs, or predicate.
   */
  constructor(callback: HandlerCallback<C, R>, filter?: ReactionFilter) {
    super(callback);
    this.filter = filter;
  }

  /**
   * Checks whether the incoming update contains a `message_reaction` and satisfies the filter.
   *
   * @param update - The update to test.
   * @returns `true` if update matches.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const rx = update.message_reaction;
    if (!rx) return false;

    if (!this.filter) return true;

    if (typeof this.filter === "function") {
      return this.filter(update);
    }

    if (typeof this.filter === "string") {
      return rx.new_reaction.some((r) => r.type === "emoji" && r.emoji === this.filter);
    }

    if (Array.isArray(this.filter)) {
      return rx.new_reaction.some(
        (r) => r.type === "emoji" && (this.filter as string[]).includes(r.emoji),
      );
    }

    if (this.filter.type === "emoji") {
      const emojiFilter = this.filter;
      return rx.new_reaction.some((r) => r.type === "emoji" && r.emoji === emojiFilter.emoji);
    }

    if (this.filter.type === "custom_emoji") {
      const customFilter = this.filter;
      return rx.new_reaction.some(
        (r) => r.type === "custom_emoji" && r.custom_emoji_id === customFilter.custom_emoji_id,
      );
    }

    if (this.filter.type === "paid") {
      return rx.new_reaction.some((r) => r.type === "paid");
    }

    return true;
  }
}

/**
 * Handler for anonymous reaction count updates on messages (`message_reaction_count` updates).
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const handler = new MessageReactionCountHandler(async (update, context) => {
 *   console.log("Reaction count updated for message:", update.message_reaction_count?.message_id);
 * });
 * ```
 */
export class MessageReactionCountHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Checks whether the incoming update contains a `message_reaction_count`.
   *
   * @param update - The update to test.
   * @returns `true` if update has `message_reaction_count`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.message_reaction_count);
  }
}
