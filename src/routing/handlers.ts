/**
 * Update handlers for dispatching commands and messages.
 *
 * @packageDocumentation
 */

import type { Update } from "../kernel/update.js";
import { CallbackContext } from "../kernel/context.js";
import { filters as filtersModule, BaseFilter, RegexFilter } from "../filters/matchers.js";
import type { RawUpdate } from "../client/types.js";

/**
 * Standard callback function signature for update handlers.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type from the handler callback.
 * @param update - The incoming Telegram update object.
 * @param context - The execution context with bot client and stored state.
 * @returns Resolves with the result returned by the handler callback.
 */
export type HandlerCallback<
  C extends CallbackContext = CallbackContext,
  R = unknown
> = (update: Update, context: C) => Promise<R> | R;

/**
 * Abstract base class for all update handlers.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 */
export abstract class BaseHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> {
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
   * Determines whether this handler should process the incoming update.
   *
   * @param update - The Telegram update to evaluate.
   * @returns `true` if the update matches this handler, `false` otherwise.
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
 * Handler for Telegram bot commands (e.g. `/start`, `/help`).
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const startHandler = new CommandHandler("start", async (update, context) => {
 *   await context.bot.sendMessage({ chat_id: update.effective_chat!.id, text: "Hello!" });
 * });
 * ```
 */
export class CommandHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * Normalized set of command names that trigger this handler (without `/` or `@botname`).
   */
  public readonly commands: Set<string>;

  /**
   * Optional secondary filter to apply before triggering.
   */
  public readonly filters?: BaseFilter;

  /**
   * Creates a new {@link CommandHandler}.
   *
   * @param command - A single command string (e.g. `"start"`) or an array of aliases.
   * @param callback - Function invoked when the command matches.
   * @param filters - Optional additional filter criteria.
   * @throws When command is empty or contains only whitespace.
   */
  constructor(
    command: string | string[],
    callback: HandlerCallback<C, R>,
    filters?: BaseFilter
  ) {
    super(callback);
    const commandList = Array.isArray(command) ? command : [command];
    if (commandList.length === 0 || commandList.some((c) => !c || c.trim() === "")) {
      throw new Error("CommandHandler requires at least one non-empty command string.");
    }
    this.commands = new Set(commandList.map((c) => c.toLowerCase()));
    this.filters = filters;
  }

  /**
   * Checks whether the update contains a matching bot command.
   *
   * @param update - The update to test.
   * @returns `true` if command matches, `false` otherwise.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const msg = update.effective_message;
    if (!msg || !msg.text) return false;

    if (!msg.entities || msg.entities.length === 0) return false;
    const firstEntity = msg.entities[0];
    if (!firstEntity || firstEntity.type !== "bot_command" || firstEntity.offset !== 0) {
      return false;
    }

    const commandText = msg.text.slice(1, firstEntity.length);
    const [commandName] = commandText.split("@");
    if (!commandName || !this.commands.has(commandName.toLowerCase())) {
      return false;
    }

    if (this.filters) {
      const match = await this.filters.checkUpdate(update);
      if (!match) return false;
    }

    return true;
  }

  /**
   * Parses positional command arguments into `context.args` and executes callback.
   *
   * @param update - The incoming update.
   * @param context - Callback context instance.
   * @returns Result from callback execution.
   */
  override async handleUpdate(update: Update, context: C): Promise<R> {
    const msg = update.effective_message;
    if (msg?.text) {
      const parts = msg.text.trim().split(/\s+/);
      context.args = parts.slice(1);
    }
    return super.handleUpdate(update, context);
  }
}

/**
 * Handler for filtering and processing messages.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const photoHandler = new MessageHandler(filters.PHOTO, async (update, context) => {
 *   console.log("Photo received!");
 * });
 * ```
 */
export class MessageHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
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
   * Populates `context.matches` if using a RegExp filter and executes callback.
   *
   * @param update - The incoming update.
   * @param context - Callback context instance.
   * @returns Result from callback execution.
   */
  override async handleUpdate(update: Update, context: C): Promise<R> {
    if (this.filters instanceof RegexFilter) {
      const msg = update.effective_message;
      const text = msg?.text ?? msg?.caption;
      if (text) {
        const matches = text.match(this.filters.pattern);
        if (matches) {
          context.matches = [matches];
        }
      }
    }
    return super.handleUpdate(update, context);
  }
}

/**
 * Handler for button clicks and callback queries from inline keyboards.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const clickHandler = new CallbackQueryHandler(/^btn_/, async (update, context) => {
 *   await context.bot.answerCallbackQuery({ callback_query_id: update.callback_query!.id });
 * });
 * ```
 */
export class CallbackQueryHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * Optional pattern or predicate string/regex matching `callback_data`.
   */
  public readonly pattern?: RegExp | string | ((data: string) => boolean);

  /**
   * Creates a new {@link CallbackQueryHandler}.
   *
   * @param callbackOrPattern - Callback function or match pattern.
   * @param callbackOrPattern2 - Callback function or match pattern.
   */
  constructor(
    callbackOrPattern: HandlerCallback<C, R> | RegExp | string | ((data: string) => boolean) | null | undefined,
    callbackOrPattern2?: HandlerCallback<C, R> | RegExp | string | ((data: string) => boolean) | null | undefined
  ) {
    let cb: HandlerCallback<C, R>;
    let pat: RegExp | string | ((data: string) => boolean) | undefined;

    if (typeof callbackOrPattern === "function" && typeof callbackOrPattern2 === "function") {
      if (callbackOrPattern.length >= 2 || callbackOrPattern2.length === 1) {
        cb = callbackOrPattern as HandlerCallback<C, R>;
        pat = callbackOrPattern2 as (data: string) => boolean;
      } else {
        cb = callbackOrPattern2 as HandlerCallback<C, R>;
        pat = callbackOrPattern as (data: string) => boolean;
      }
    } else if (typeof callbackOrPattern === "function" && callbackOrPattern2 === undefined) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
    } else if (typeof callbackOrPattern === "function" && callbackOrPattern2 !== undefined) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
      pat = callbackOrPattern2 as RegExp | string | ((data: string) => boolean);
    } else {
      cb = callbackOrPattern2 as HandlerCallback<C, R>;
      pat = callbackOrPattern as RegExp | string | ((data: string) => boolean);
    }

    super(cb);
    this.pattern = pat;
  }

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

export class InlineQueryHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  public readonly pattern?: RegExp | string | ((query: string) => boolean);

  constructor(
    callbackOrPattern: HandlerCallback<C, R> | RegExp | string | ((query: string) => boolean) | null | undefined,
    callbackOrPattern2?: HandlerCallback<C, R> | RegExp | string | ((query: string) => boolean) | null | undefined
  ) {
    let cb: HandlerCallback<C, R>;
    let pat: RegExp | string | ((query: string) => boolean) | undefined;

    if (typeof callbackOrPattern === "function" && callbackOrPattern.length >= 1 && callbackOrPattern2 === undefined) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
    } else if (typeof callbackOrPattern === "function" && typeof callbackOrPattern2 !== "function") {
      cb = callbackOrPattern as HandlerCallback<C, R>;
      pat = (callbackOrPattern2 as RegExp | string | ((query: string) => boolean)) ?? undefined;
    } else {
      cb = callbackOrPattern2 as HandlerCallback<C, R>;
      pat = (callbackOrPattern as RegExp | string | ((query: string) => boolean)) ?? undefined;
    }

    super(cb);
    this.pattern = pat;
  }

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

export class ChosenInlineResultHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  public readonly pattern?: RegExp | string | ((resultId: string) => boolean);

  constructor(
    callbackOrPattern: HandlerCallback<C, R> | RegExp | string | ((resultId: string) => boolean) | null | undefined,
    callbackOrPattern2?: HandlerCallback<C, R> | RegExp | string | ((resultId: string) => boolean) | null | undefined
  ) {
    let cb: HandlerCallback<C, R>;
    let pat: RegExp | string | ((resultId: string) => boolean) | undefined;

    if (typeof callbackOrPattern === "function" && callbackOrPattern.length >= 1 && callbackOrPattern2 === undefined) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
    } else if (typeof callbackOrPattern === "function" && typeof callbackOrPattern2 !== "function") {
      cb = callbackOrPattern as HandlerCallback<C, R>;
      pat = (callbackOrPattern2 as RegExp | string | ((resultId: string) => boolean)) ?? undefined;
    } else {
      cb = callbackOrPattern2 as HandlerCallback<C, R>;
      pat = (callbackOrPattern as RegExp | string | ((resultId: string) => boolean)) ?? undefined;
    }

    super(cb);
    this.pattern = pat;
  }

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

export class PollAnswerHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.poll_answer);
  }
}

export class ChatMemberHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  public static readonly CHAT_MEMBER = 1;
  public static readonly MY_CHAT_MEMBER = 2;
  public static readonly ANY = 3;

  public readonly chatMemberTypes: number;

  constructor(
    callback: HandlerCallback<C, R>,
    chatMemberTypes: number = ChatMemberHandler.ANY
  ) {
    super(callback);
    this.chatMemberTypes = chatMemberTypes;
  }

  async checkUpdate(update: Update): Promise<boolean> {
    if (this.chatMemberTypes === ChatMemberHandler.CHAT_MEMBER) {
      return Boolean(update.chat_member);
    }
    if (this.chatMemberTypes === ChatMemberHandler.MY_CHAT_MEMBER) {
      return Boolean(update.my_chat_member);
    }
    return Boolean(update.chat_member || update.my_chat_member);
  }
}

export class TypeHandler<
  T = unknown,
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  constructor(
    public readonly typePredicate: (update: Update | RawUpdate) => boolean | Promise<boolean>,
    callback: HandlerCallback<C, R>
  ) {
    super(callback);
  }

  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(await this.typePredicate(update));
  }
}
