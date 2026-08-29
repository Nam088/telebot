import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import { filters as filtersModule, RegexFilter } from "../../filters/matchers.js";
import { BaseFilter } from "../../filters/base.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Handler for filtering and processing messages.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 * @example
 * ```ts
 * const photoHandler = new MessageHandler(filters.PHOTO, async (update, context) => {
 *   console.log("Photo received!");
 * });
 * ```
 */
export class MessageHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * The message filter applied to incoming updates.
   */
  public readonly filters: BaseFilter;

  /**
   * Creates a new {@link MessageHandler}.
   *
   * @param filters - The filter condition (or `null`/`undefined` for all messages).
   * @param callback - Function invoked when the filter matches.
   */
  constructor(filters: BaseFilter | null | undefined, callback: HandlerCallback<C, R>) {
    super(callback);
    this.filters = filters ?? filtersModule.ALL;
  }

  /**
   * Evaluates the update against the configured message filter.
   *
   * @param update - The update to test.
   * @returns `true` if matched, `false` otherwise.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const msg = update.effective_message;
    if (!msg) return false;
    return Boolean(await this.filters.checkUpdate(update));
  }

  /**
   * Populates `context.matches` if using a RegExp filter (or compound filter containing one) and executes callback.
   *
   * @param update - The incoming update.
   * @param context - Callback context instance.
   * @returns Result from callback execution.
   */
  override async handleUpdate(update: Update, context: C): Promise<R> {
    const msg = update.effective_message;
    const text = msg?.text ?? msg?.caption;
    if (text) {
      const regexFilter = this.findRegexFilter(this.filters);
      if (regexFilter) {
        const matches = text.match(regexFilter.pattern);
        if (matches) {
          context.matches = [matches];
        }
      }
    }

    return super.handleUpdate(update, context);
  }

  private findRegexFilter(filter: BaseFilter): RegexFilter | null {
    if (filter instanceof RegexFilter) {
      return filter;
    }

    if ("f1" in filter && "f2" in filter) {
      const compound = filter as unknown as { f1: BaseFilter; f2: BaseFilter };
      return this.findRegexFilter(compound.f1) ?? this.findRegexFilter(compound.f2);
    }

    return null;
  }
}
