/**
 * Update handlers for dispatching commands, messages, callback queries, and events.
 *
 * @packageDocumentation
 */

import type { Update } from "../telegram/update.js";
import { CallbackContext } from "./context.js";
import { filters as filtersModule, BaseFilter } from "./filters.js";

/**
 * Handler callback function signature invoked when an update matches the handler's criteria.
 *
 * @typeParam C - The {@link CallbackContext} subclass or instance passed to the callback.
 * @typeParam R - The return type of the handler callback.
 * @param update - The incoming {@link Update} object.
 * @param context - The {@link CallbackContext} containing bot instance and contextual state.
 * @returns A result or Promise of result.
 */
export type HandlerCallback<
  C extends CallbackContext = CallbackContext,
  R = unknown
> = (update: Update, context: C) => Promise<R> | R;

/**
 * Abstract base class for all update handlers.
 *
 * @typeParam C - The {@link CallbackContext} type.
 * @typeParam R - Return type of callback execution.
 */
export abstract class BaseHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> {
  /**
   * The callback function to execute when an update matches.
   */
  protected callback: HandlerCallback<C, R>;

  /**
   * Constructs a new {@link BaseHandler}.
   *
   * @param callback - Function to invoke when an update passes the filter/check.
   */
  constructor(callback: HandlerCallback<C, R>) {
    this.callback = callback;
  }

  /**
   * Evaluates if this handler can process the given update.
   * Must be a pure predicate with no side effects.
   *
   * @param update - Incoming Telegram update to evaluate.
   * @returns `true` or Promise of `true` if handler should process this update.
   */
  abstract checkUpdate(update: Update): boolean | Promise<boolean>;

  /**
   * Dispatches the update to the handler's callback.
   *
   * @param update - The matched {@link Update}.
   * @param context - The active {@link CallbackContext}.
   * @returns Result of executing the callback function.
   */
  async handleUpdate(update: Update, context: C): Promise<R> {
    const rawUpdate = update as unknown as Record<string, unknown>;
    if (rawUpdate["_regex_matches"]) {
      context.matches = rawUpdate["_regex_matches"] as RegExpMatchArray[];
    }
    return this.callback(update, context);
  }
}

/**
 * Handler for Telegram bot commands (e.g. `/start`, `/help`, `/echo`).
 *
 * Matches commands with or without bot username mentions (e.g., `/start` or `/start@MyBot`),
 * automatically parses command arguments into `context.args`, and supports optional additional {@link BaseFilter} rules.
 *
 * @typeParam C - The {@link CallbackContext} type.
 * @typeParam R - Return type of callback execution.
 *
 * @example
 * ```ts
 * import { CommandHandler } from "telegram-bot-node";
 *
 * const startHandler = new CommandHandler("start", async (update, context) => {
 *   await context.bot.sendMessage({
 *     chat_id: update.effective_chat!.id,
 *     text: "Welcome to the bot!",
 *   });
 * });
 * ```
 */
export class CommandHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * Set of lowercase command names this handler responds to.
   */
  public readonly commands: Set<string>;

  /**
   * Optional secondary filter to apply after command matching.
   */
  public readonly filters?: BaseFilter;

  /**
   * Constructs a new {@link CommandHandler}.
   *
   * @param command - A single command string (without leading slash) or array of command strings (e.g. `"start"` or `["start", "help"]`).
   * @param callback - Async or sync callback function to execute on command match.
   * @param filters - Optional extra {@link BaseFilter} to check before executing.
   * @throws When `command` is empty, contains only empty strings, or is invalid.
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
   * Checks if an update contains a bot command matching one of {@link commands} and any optional {@link filters}.
   *
   * @param update - Incoming Telegram update.
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
   * Populates `context.args` with whitespace-delimited arguments following the command and executes callback.
   *
   * @param update - The matched {@link Update}.
   * @param context - The active {@link CallbackContext}.
   * @returns Result of executing the callback.
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
 * Handler for general Telegram messages matching custom {@link BaseFilter} criteria.
 *
 * @typeParam C - The {@link CallbackContext} type.
 * @typeParam R - Return type of callback execution.
 *
 * @example
 * ```ts
 * import { MessageHandler, filters } from "telegram-bot-node";
 *
 * const textHandler = new MessageHandler(filters.TEXT, async (update, context) => {
 *   await context.bot.sendMessage({
 *     chat_id: update.effective_chat!.id,
 *     text: `You said: ${update.effective_message?.text}`,
 *   });
 * });
 * ```
 */
export class MessageHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * The filter condition that incoming messages must satisfy.
   */
  public readonly filters: BaseFilter;

  /**
   * Constructs a new {@link MessageHandler}.
   *
   * @param filters - Filter rule (such as {@link filters.TEXT} or {@link filters.ALL}). If null or undefined, defaults to {@link filters.ALL}.
   * @param callback - Function to execute when an update satisfies the filter.
   */
  constructor(filters: BaseFilter | null | undefined, callback: HandlerCallback<C, R>) {
    super(callback);
    this.filters = filters ?? filtersModule.ALL;
  }

  /**
   * Checks whether the update's message satisfies the filter.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if update matches filter, `false` otherwise.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const msg = update.effective_message;
    if (!msg) return false;
    return Boolean(await this.filters.checkUpdate(update));
  }
}

/**
 * Pattern type supported by query and callback handlers.
 */
export type PatternType = string | RegExp | ((data: string) => boolean);

/**
 * Handler for Telegram callback queries emitted from inline keyboard buttons.
 *
 * @typeParam C - The {@link CallbackContext} type.
 * @typeParam R - Return type of callback execution.
 *
 * @example
 * ```ts
 * import { CallbackQueryHandler } from "telegram-bot-node";
 *
 * const handler = new CallbackQueryHandler(async (update, context) => {
 *   await context.bot.answerCallbackQuery({
 *     callback_query_id: update.callback_query!.id,
 *     text: "Button clicked!",
 *   });
 * }, /^vote_(\d+)$/);
 * ```
 */
export class CallbackQueryHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * Optional pattern to match callback data against.
   */
  public readonly pattern?: PatternType;

  /**
   * Constructs a new {@link CallbackQueryHandler}.
   *
   * @param callback - Handler function to execute on callback query match.
   * @param pattern - Optional string, RegExp, or predicate function to match against `callback_query.data`.
   */
  constructor(callback: HandlerCallback<C, R>, pattern?: PatternType) {
    super(callback);
    this.pattern = pattern;
  }

  /**
   * Evaluates whether the incoming update contains a matching `callback_query`.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if the callback query matches the specified pattern.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const cb = update.callback_query;
    if (!cb) return false;
    if (!this.pattern) return true;

    const data = cb.data ?? "";
    if (typeof this.pattern === "string") {
      return data === this.pattern;
    }
    if (typeof this.pattern === "function") {
      return Boolean(this.pattern(data));
    }
    if (this.pattern instanceof RegExp) {
      const match = data.match(this.pattern);
      if (!match) return false;
      const rawUpdate = update as unknown as Record<string, unknown>;
      const matches = (rawUpdate["_regex_matches"] as RegExpMatchArray[]) || [];
      matches.push(match);
      rawUpdate["_regex_matches"] = matches;
      return true;
    }
    return false;
  }
}

/**
 * Handler for Telegram inline queries.
 *
 * @typeParam C - The {@link CallbackContext} type.
 * @typeParam R - Return type of callback execution.
 *
 * @example
 * ```ts
 * import { InlineQueryHandler } from "telegram-bot-node";
 *
 * const inlineHandler = new InlineQueryHandler(async (update, context) => {
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
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * Optional pattern to match inline query string against.
   */
  public readonly pattern?: PatternType;

  /**
   * Constructs a new {@link InlineQueryHandler}.
   *
   * @param callback - Handler function to execute on inline query.
   * @param pattern - Optional string, RegExp, or predicate to match against `inline_query.query`.
   */
  constructor(callback: HandlerCallback<C, R>, pattern?: PatternType) {
    super(callback);
    this.pattern = pattern;
  }

  /**
   * Evaluates whether the incoming update contains a matching `inline_query`.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if inline query matches pattern.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const iq = update.inline_query;
    if (!iq) return false;
    if (!this.pattern) return true;

    const query = iq.query;
    if (typeof this.pattern === "string") {
      return query === this.pattern;
    }
    if (typeof this.pattern === "function") {
      return Boolean(this.pattern(query));
    }
    if (this.pattern instanceof RegExp) {
      const match = query.match(this.pattern);
      if (!match) return false;
      const rawUpdate = update as unknown as Record<string, unknown>;
      const matches = (rawUpdate["_regex_matches"] as RegExpMatchArray[]) || [];
      matches.push(match);
      rawUpdate["_regex_matches"] = matches;
      return true;
    }
    return false;
  }
}

/**
 * Handler for Telegram chosen inline results.
 *
 * @typeParam C - The {@link CallbackContext} type.
 * @typeParam R - Return type of callback execution.
 *
 * @example
 * ```ts
 * import { ChosenInlineResultHandler } from "telegram-bot-node";
 *
 * const chosenHandler = new ChosenInlineResultHandler(async (update, context) => {
 *   console.log(`Chosen result: ${update.chosen_inline_result?.result_id}`);
 * });
 * ```
 */
export class ChosenInlineResultHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * Optional pattern to match against `chosen_inline_result.query`.
   */
  public readonly pattern?: PatternType;

  /**
   * Constructs a new {@link ChosenInlineResultHandler}.
   *
   * @param callback - Handler function to execute.
   * @param pattern - Optional string, RegExp, or predicate matching `chosen_inline_result.query`.
   */
  constructor(callback: HandlerCallback<C, R>, pattern?: PatternType) {
    super(callback);
    this.pattern = pattern;
  }

  /**
   * Evaluates if update contains a matching `chosen_inline_result`.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if chosen inline result matches pattern.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const cir = update.chosen_inline_result;
    if (!cir) return false;
    if (!this.pattern) return true;

    const query = cir.query;
    if (typeof this.pattern === "string") {
      return query === this.pattern;
    }
    if (typeof this.pattern === "function") {
      return Boolean(this.pattern(query));
    }
    if (this.pattern instanceof RegExp) {
      const match = query.match(this.pattern);
      if (!match) return false;
      const rawUpdate = update as unknown as Record<string, unknown>;
      const matches = (rawUpdate["_regex_matches"] as RegExpMatchArray[]) || [];
      matches.push(match);
      rawUpdate["_regex_matches"] = matches;
      return true;
    }
    return false;
  }
}

/**
 * Handler for incoming Telegram poll answers in non-anonymous polls.
 *
 * @typeParam C - The {@link CallbackContext} type.
 * @typeParam R - Return type of callback execution.
 *
 * @example
 * ```ts
 * import { PollAnswerHandler } from "telegram-bot-node";
 *
 * const pollHandler = new PollAnswerHandler(async (update, context) => {
 *   const answer = update.poll_answer!;
 *   console.log(`User ${answer.user?.first_name} selected options:`, answer.option_ids);
 * });
 * ```
 */
export class PollAnswerHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * Evaluates if the incoming update contains a `poll_answer`.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if update has `poll_answer`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.poll_answer);
  }
}

/**
 * Handler for chat member status changes (`chat_member` and `my_chat_member`).
 *
 * @typeParam C - The {@link CallbackContext} type.
 * @typeParam R - Return type of callback execution.
 *
 * @example
 * ```ts
 * import { ChatMemberHandler } from "telegram-bot-node";
 *
 * const memberHandler = new ChatMemberHandler(async (update, context) => {
 *   const chatMember = update.chat_member!;
 *   console.log(`Member status updated: ${chatMember.new_chat_member.status}`);
 * }, ChatMemberHandler.CHAT_MEMBER);
 * ```
 */
export class ChatMemberHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * Flag matching `chat_member` updates.
   */
  public static readonly CHAT_MEMBER = 1;

  /**
   * Flag matching `my_chat_member` updates (the bot's own status in a chat).
   */
  public static readonly MY_CHAT_MEMBER = 2;

  /**
   * Flag matching both `chat_member` and `my_chat_member` updates.
   */
  public static readonly ANY = 3;

  /**
   * Bitmask determining which chat member update types to handle.
   */
  public readonly chat_member_types: number;

  /**
   * Constructs a new {@link ChatMemberHandler}.
   *
   * @param callback - Handler function to execute.
   * @param chat_member_types - Bitmask flag (`CHAT_MEMBER`, `MY_CHAT_MEMBER`, or `ANY`).
   * @defaultValue `ChatMemberHandler.CHAT_MEMBER`
   */
  constructor(
    callback: HandlerCallback<C, R>,
    chat_member_types: number = ChatMemberHandler.CHAT_MEMBER
  ) {
    super(callback);
    this.chat_member_types = chat_member_types;
  }

  /**
   * Checks if the update contains a chat member status update matching {@link chat_member_types}.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if update contains matching chat member update.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    if ((this.chat_member_types & ChatMemberHandler.CHAT_MEMBER) && update.chat_member) {
      return true;
    }
    if ((this.chat_member_types & ChatMemberHandler.MY_CHAT_MEMBER) && update.my_chat_member) {
      return true;
    }
    return false;
  }
}

/**
 * Generic handler matching updates via a custom predicate function.
 *
 * @typeParam C - The {@link CallbackContext} type.
 * @typeParam R - Return type of callback execution.
 *
 * @example
 * ```ts
 * import { TypeHandler } from "telegram-bot-node";
 *
 * const businessHandler = new TypeHandler(
 *   (update) => Boolean(update.business_connection),
 *   async (update, context) => {
 *     console.log("Business connection updated:", update.business_connection);
 *   }
 * );
 * ```
 */
export class TypeHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  /**
   * Predicate function evaluating incoming updates.
   */
  private readonly predicate: (update: Update) => boolean | Promise<boolean>;

  /**
   * Constructs a new {@link TypeHandler}.
   *
   * @param predicate - Custom function returning `true` for updates this handler should process.
   * @param callback - Handler function to execute when predicate returns `true`.
   */
  constructor(
    predicate: (update: Update) => boolean | Promise<boolean>,
    callback: HandlerCallback<C, R>
  ) {
    super(callback);
    this.predicate = predicate;
  }

  /**
   * Evaluates whether this handler should process the update using the configured predicate.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if predicate returns `true`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(await this.predicate(update));
  }
}
