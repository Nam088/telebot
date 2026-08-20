import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import type { RawUpdate } from "../../client/types.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Handler that matches updates based on an arbitrary type predicate function.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 * @example
 * ```ts
 * const customTypeHandler = new TypeHandler(
 *   (update) => Boolean(update.message_reaction),
 *   async (update, context) => { console.log("Reaction update received!"); }
 * );
 * ```
 */
export class TypeHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * The custom type predicate function.
   */
  public readonly typePredicate: (update: Update | RawUpdate) => boolean | Promise<boolean>;

  /**
   * Constructs a new {@link TypeHandler}.
   *
   * @param typePredicate - Function that evaluates whether an update matches.
   * @param callback - Function invoked on match.
   */
  constructor(
    typePredicate: (update: Update | RawUpdate) => boolean | Promise<boolean>,
    callback: HandlerCallback<C, R>,
  ) {
    super(callback);
    this.typePredicate = typePredicate;
  }

  /**
   * Evaluates the type predicate against the incoming update.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if the type predicate is satisfied.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(await this.typePredicate(update));
  }
}
