import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Handler for button clicks and callback queries from inline keyboards.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 * @example
 * ```ts
 * const clickHandler = new CallbackQueryHandler(/^btn_/, async (update, context) => {
 *   await context.bot.answerCallbackQuery({ callback_query_id: update.callback_query!.id });
 * });
 * ```
 */
export class CallbackQueryHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Optional pattern or predicate string/regex matching `callback_data`.
   */
  public readonly pattern?: RegExp | string | ((data: string) => boolean);

  /**
   * Creates a new {@link CallbackQueryHandler}.
   *
   * @remarks
   * When only the callback is given, pass it alone. When a pattern is also given, the
   * callback must be the first argument and the pattern (string, RegExp, or predicate
   * function) the second, e.g. `new CallbackQueryHandler(callback, /^btn_/)`.
   * @param callbackOrPattern - The callback function, or (when `callbackOrPattern2` is the
   * callback) a string/RegExp pattern matched against `callback_data`.
   * @param callbackOrPattern2 - The pattern (string, RegExp, or predicate function) matched
   * against `callback_data`, or (when `callbackOrPattern` is the pattern) the callback.
   */
  constructor(
    callbackOrPattern:
      HandlerCallback<C, R> | RegExp | string | ((data: string) => boolean) | null | undefined,
    callbackOrPattern2?:
      HandlerCallback<C, R> | RegExp | string | ((data: string) => boolean) | null | undefined,
  ) {
    let cb: HandlerCallback<C, R>;
    let pat: RegExp | string | ((data: string) => boolean) | undefined;
    if (typeof callbackOrPattern === "function") {
      cb = callbackOrPattern as HandlerCallback<C, R>;
      pat = (callbackOrPattern2 as (data: string) => boolean) ?? undefined;
    } else {
      cb = callbackOrPattern2 as HandlerCallback<C, R>;
      pat = (callbackOrPattern as RegExp | string) ?? undefined;
    }

    super(cb);
    this.pattern = pat;
  }

  /**
   * Checks whether the update contains a matching `callback_query` and evaluates its data against the pattern.
   *
   * @param update - The update to test.
   * @returns `true` if the callback query matches the configured pattern or predicate.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const query = update.callback_query;
    if (!query) return false;
    if (!this.pattern) return true;
    const data = query.data ?? "";
    if (typeof this.pattern === "string") {
      return data === this.pattern;
    }

    if (this.pattern instanceof RegExp) {
      return this.pattern.test(data);
    }

    if (typeof this.pattern === "function") {
      return Boolean(this.pattern(data));
    }

    return false;
  }

  /**
   * Populates `context.matches` if using a RegExp pattern and executes the callback.
   *
   * @param update - The incoming update.
   * @param context - Callback context instance.
   * @returns Result from callback execution.
   */
  override async handleUpdate(update: Update, context: C): Promise<R> {
    const query = update.callback_query;
    if (query?.data && this.pattern instanceof RegExp) {
      const matches = query.data.match(this.pattern);
      if (matches) {
        context.matches = [matches];
      }
    }

    return super.handleUpdate(update, context);
  }
}
