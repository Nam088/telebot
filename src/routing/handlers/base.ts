import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";

/**
 * Abstract base class for all update handlers.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 */
export abstract class BaseHandler<C extends CallbackContext = CallbackContext, R = unknown> {
  /**
   * The underlying callback function to invoke on match.
   */
  protected callback: HandlerCallback<C, R>;

  /**
   * Creates a new handler instance.
   *
   * @param callback - Async function executed when this handler matches an update.
   */
  constructor(callback: HandlerCallback<C, R>) {
    this.callback = callback;
  }

  /**
   * Checks if the incoming update should be handled by this handler.
   *
   * @param update - The Telegram update to process.
   * @returns `true` if it matches, `false` otherwise.
   */
  abstract checkUpdate(update: Update): boolean | Promise<boolean>;

  /**
   * Executes the registered handler callback with the given update and context.
   *
   * @param update - The Telegram update to process.
   * @param context - Callback context instance.
   * @returns The value returned by the callback function.
   */
  async handleUpdate(update: Update, context: C): Promise<R> {
    return this.callback(update, context);
  }
}

/**
 * Standard callback function signature for update handlers.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type from the handler callback.
 * @param update - The incoming Telegram update object.
 * @param context - The execution context with bot client and stored state.
 * @returns Resolves with the result returned by the handler callback.
 */
export type HandlerCallback<C extends CallbackContext = CallbackContext, R = unknown> = (
  update: Update,
  context: C,
) => Promise<R> | R;
