import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Handler for Telegram inline queries triggered when a user types `@bot query` in any chat.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 * @example
 * ```ts
 * const inlineHandler = new InlineQueryHandler(/^search:(.+)$/, async (update, context) => {
 *   const query = update.inline_query!.query;
 *   await context.bot.answerInlineQuery({
 *     inline_query_id: update.inline_query!.id,
 *     results: [],
 *   });
 * });
 * ```
 */
export class InlineQueryHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Optional pattern or predicate string/regex matching `inline_query.query`.
   */
  public readonly pattern?: RegExp | string | ((query: string) => boolean);

  /**
   * Constructs a new {@link InlineQueryHandler}.
   *
   * @param callbackOrPattern - Callback function or string/RegExp match pattern.
   * @param callbackOrPattern2 - Callback function or string/RegExp match pattern.
   */
  constructor(
    callbackOrPattern:
      HandlerCallback<C, R> | RegExp | string | ((query: string) => boolean) | null | undefined,
    callbackOrPattern2?:
      HandlerCallback<C, R> | RegExp | string | ((query: string) => boolean) | null | undefined,
  ) {
    let cb: HandlerCallback<C, R>;
    let pat: RegExp | string | ((query: string) => boolean) | undefined;
    if (
      typeof callbackOrPattern === "function" &&
      callbackOrPattern.length >= 1 &&
      callbackOrPattern2 === undefined
    ) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
    } else if (
      typeof callbackOrPattern === "function" &&
      typeof callbackOrPattern2 !== "function"
    ) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
      pat = (callbackOrPattern2 as RegExp | string | ((query: string) => boolean)) ?? undefined;
    } else {
      cb = callbackOrPattern2 as HandlerCallback<C, R>;
      pat = (callbackOrPattern as RegExp | string | ((query: string) => boolean)) ?? undefined;
    }

    super(cb);
    this.pattern = pat;
  }

  /**
   * Checks whether the update contains a matching inline query.
   *
   * @param update - The update to test.
   * @returns `true` if inline query matches, `false` otherwise.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const query = update.inline_query;
    if (!query) return false;
    if (!this.pattern) return true;
    const text = query.query;
    if (typeof this.pattern === "string") {
      return text === this.pattern;
    }

    if (this.pattern instanceof RegExp) {
      return this.pattern.test(text);
    }

    if (typeof this.pattern === "function") {
      return Boolean(this.pattern(text));
    }

    return false;
  }

  /**
   * Populates `context.matches` if using a RegExp pattern and executes callback.
   *
   * @param update - The incoming update.
   * @param context - Callback context instance.
   * @returns Result from callback execution.
   */
  override async handleUpdate(update: Update, context: C): Promise<R> {
    const query = update.inline_query;
    if (query && this.pattern instanceof RegExp) {
      const matches = query.query.match(this.pattern);
      if (matches) {
        context.matches = [matches];
      }
    }

    return super.handleUpdate(update, context);
  }
}

/**
 * Handler for tracking results chosen by users from inline queries.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 * @example
 * ```ts
 * const chosenHandler = new ChosenInlineResultHandler(async (update, context) => {
 *   console.log("Chosen result ID:", update.chosen_inline_result?.result_id);
 * });
 * ```
 */
export class ChosenInlineResultHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Optional pattern or predicate string/regex matching `result_id` or `query`.
   */
  public readonly pattern?: RegExp | string | ((resultId: string) => boolean);

  /**
   * Constructs a new {@link ChosenInlineResultHandler}.
   *
   * @param callbackOrPattern - Callback function or string/RegExp match pattern.
   * @param callbackOrPattern2 - Callback function or string/RegExp match pattern.
   */
  constructor(
    callbackOrPattern:
      HandlerCallback<C, R> | RegExp | string | ((resultId: string) => boolean) | null | undefined,
    callbackOrPattern2?:
      HandlerCallback<C, R> | RegExp | string | ((resultId: string) => boolean) | null | undefined,
  ) {
    let cb: HandlerCallback<C, R>;
    let pat: RegExp | string | ((resultId: string) => boolean) | undefined;
    if (
      typeof callbackOrPattern === "function" &&
      callbackOrPattern.length >= 1 &&
      callbackOrPattern2 === undefined
    ) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
    } else if (
      typeof callbackOrPattern === "function" &&
      typeof callbackOrPattern2 !== "function"
    ) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
      pat = (callbackOrPattern2 as RegExp | string | ((resultId: string) => boolean)) ?? undefined;
    } else {
      cb = callbackOrPattern2 as HandlerCallback<C, R>;
      pat = (callbackOrPattern as RegExp | string | ((resultId: string) => boolean)) ?? undefined;
    }

    super(cb);
    this.pattern = pat;
  }

  /**
   * Checks whether the chosen inline result matches the pattern.
   *
   * @param update - The update to test.
   * @returns `true` if chosen result matches, `false` otherwise.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const chosen = update.chosen_inline_result;
    if (!chosen) return false;
    if (!this.pattern) return true;
    const target = chosen.query || chosen.result_id;
    if (typeof this.pattern === "string") {
      return chosen.result_id === this.pattern || chosen.query === this.pattern;
    }

    if (this.pattern instanceof RegExp) {
      return this.pattern.test(target);
    }

    if (typeof this.pattern === "function") {
      return Boolean(this.pattern(target));
    }

    return false;
  }

  /**
   * Populates `context.matches` if using a RegExp pattern and executes callback.
   *
   * @param update - The incoming update.
   * @param context - Callback context instance.
   * @returns Result from callback execution.
   */
  override async handleUpdate(update: Update, context: C): Promise<R> {
    const chosen = update.chosen_inline_result;
    if (chosen && this.pattern instanceof RegExp) {
      const target = chosen.query || chosen.result_id;
      const matches = target.match(this.pattern);
      if (matches) {
        context.matches = [matches];
      }
    }

    return super.handleUpdate(update, context);
  }
}
