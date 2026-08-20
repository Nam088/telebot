/**
 * Callback context passed to handler callbacks.
 *
 * @packageDocumentation
 */

import type { Bot } from "../telegram/bot.js";
import type { Update } from "../telegram/update.js";

/**
 * Context object passed to handler callbacks, error handlers, and job callbacks.
 *
 * Provides access to the {@link Bot} instance, contextual data buckets (`user_data`, `chat_data`, `bot_data`),
 * command arguments, regex match results, and the active {@link Update}.
 *
 * @typeParam UserData - Custom type definition for user-level persisted state.
 * @typeParam ChatData - Custom type definition for chat-level persisted state.
 * @typeParam BotData - Custom type definition for bot-level persisted state.
 *
 * @remarks
 * Context state property names (`context.user_data`, `context.chat_data`, `context.bot_data`,
 * `context.args`, `context.job_queue`) use consistent `snake_case` naming.
 *
 * @example
 * ```ts
 * async function startCallback(update: Update, context: CallbackContext) {
 *   const name = update.effective_user?.first_name ?? "there";
 *   context.user_data.visited = true;
 *   await context.bot.sendMessage({
 *     chat_id: update.effective_chat!.id,
 *     text: `Hello ${name}!`,
 *   });
 * }
 * ```
 */
export class CallbackContext<
  UserData extends Record<string, unknown> = Record<string, unknown>,
  ChatData extends Record<string, unknown> = Record<string, unknown>,
  BotData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * The {@link Bot} client instance executing this handler.
   */
  public readonly bot: Bot;

  /**
   * Optional job queue instance for scheduling future background tasks.
   */
  public job_queue?: unknown;

  /**
   * The current background job being executed (when invoked from the JobQueue).
   */
  public job?: unknown;

  /**
   * Positional arguments parsed from a command message (e.g. `/echo hello world` -> `["hello", "world"]`).
   */
  public args?: string[];

  /**
   * Per-user persistent or memory storage object.
   */
  public user_data?: UserData;

  /**
   * Per-chat persistent or memory storage object.
   */
  public chat_data?: ChatData;

  /**
   * Global bot-level persistent or memory storage object.
   */
  public bot_data?: BotData;

  /**
   * The caught exception / error when invoked inside an error handler.
   */
  public error?: Error;

  /**
   * RegExp match arrays populated by filters matching regular expressions.
   */
  public matches?: RegExpMatchArray[];

  /**
   * The {@link Update} that triggered this handler invocation, if applicable.
   */
  public readonly update?: Update;

  /**
   * Creates a new {@link CallbackContext} instance.
   *
   * @param options - Initialization options for context properties.
   */
  constructor(options: {
    bot: Bot;
    job_queue?: unknown;
    job?: unknown;
    args?: string[];
    user_data?: UserData;
    chat_data?: ChatData;
    bot_data?: BotData;
    error?: Error;
    matches?: RegExpMatchArray[];
    update?: Update;
  }) {
    this.bot = options.bot;
    this.job_queue = options.job_queue;
    this.job = options.job;
    this.args = options.args;
    this.user_data = options.user_data;
    this.chat_data = options.chat_data;
    this.bot_data = options.bot_data;
    this.error = options.error;
    this.matches = options.matches;
    this.update = options.update;
  }
}

