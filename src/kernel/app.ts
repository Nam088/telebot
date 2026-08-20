/**
 * Application runtime and update orchestrator.
 *
 * @packageDocumentation
 */

import { Bot, type BotOptions } from "../client/bot.js";
import { Update } from "./update.js";
import type { RawUpdate } from "../client/types.js";
import { BaseHandler } from "../routing/handlers.js";
import { CallbackContext } from "./context.js";
import { type Persistence, MemoryPersistence } from "../storage/memory.js";

/**
 * Error handler callback signature.
 */
export type ErrorHandlerCallback = (
  error: Error,
  update?: Update,
  context?: CallbackContext
) => Promise<void> | void;

/**
 * Configuration options for creating an {@link Application}.
 */
export interface ApplicationOptions {
  /**
   * Custom persistence backend instance for state management.
   *
   * @defaultValue `new MemoryPersistence()`
   */
  persistence?: Persistence;
}

/**
 * Main application class responsible for managing handlers, polling loops, webhook servers, and error handling.
 *
 * @example
 * ```ts
 * const app = new ApplicationBuilder().token("BOT_TOKEN").build();
 * app.addHandler(new CommandHandler("start", startCallback));
 * await app.runPolling();
 * ```
 */
export class Application {
  /**
   * The underlying {@link Bot} API client.
   */
  public readonly bot: Bot;

  /**
   * Active persistence store for conversation and context data.
   */
  public readonly persistence: Persistence;

  private readonly handlers: Map<number, BaseHandler[]> = new Map();
  private readonly errorHandlers: ErrorHandlerCallback[] = [];

  /**
   * Indicates whether the polling loop is actively running.
   */
  public isRunning: boolean = false;

  private offset: number = 0;
  private abortController?: AbortController;

  /**
   * Constructs a new {@link Application} instance.
   *
   * @param bot - The {@link Bot} client instance.
   * @param options - Configuration options for the application.
   */
  constructor(bot: Bot, options: ApplicationOptions = {}) {
    this.bot = bot;
    this.persistence = options.persistence ?? new MemoryPersistence();
  }

  /**
   * Registers an update handler into a specific handler group.
   *
   * @param handler - The {@link BaseHandler} subclass instance.
   * @param group - Numerical priority group. Handlers in group 0 run before group 1.
   * @defaultValue `0`
   */
  public addHandler(handler: BaseHandler, group: number = 0): void {
    if (!this.handlers.has(group)) {
      this.handlers.set(group, []);
    }
    this.handlers.get(group)!.push(handler);
  }

  /**
   * Registers a global error handler callback.
   *
   * @param callback - Function invoked when an error occurs during update processing or polling.
   */
  public addErrorHandler(callback: ErrorHandlerCallback): void {
    this.errorHandlers.push(callback);
  }

  /**
   * Dispatches a single update through registered handler groups and catches errors.
   *
   * @param rawUpdate - The incoming {@link RawUpdate} or wrapped {@link Update} instance.
   * @returns Resolves when update dispatching completes across all handler groups.
   */
  public async processUpdate(rawUpdate: RawUpdate | Update): Promise<void> {
    const update = rawUpdate instanceof Update ? rawUpdate : new Update(rawUpdate, this.bot);

    // Resolve context user_data / chat_data / bot_data
    let userData: Record<string, unknown> | undefined;
    let chatData: Record<string, unknown> | undefined;
    const botData = await this.persistence.getBotData();

    const userId = update.effective_user?.id;
    if (userId !== undefined) {
      userData = await this.persistence.getUserData(userId);
    }

    const chatId = update.effective_chat?.id;
    if (chatId !== undefined) {
      chatData = await this.persistence.getChatData(chatId);
    }

    const context = new CallbackContext({
      bot: this.bot,
      user_data: userData,
      chat_data: chatData,
      bot_data: botData,
      update,
    });

    const sortedGroups = Array.from(this.handlers.keys()).sort((a, b) => a - b);

    for (const group of sortedGroups) {
      const handlersInGroup = this.handlers.get(group) || [];
      for (const handler of handlersInGroup) {
        try {
          const match = await handler.checkUpdate(update);
          if (match) {
            await handler.handleUpdate(update, context);
            break; // Stop at first matching handler in this group
          }
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          context.error = error;
          for (const errHandler of this.errorHandlers) {
            try {
              await errHandler(error, update, context);
            } catch (ehErr) {
              console.error("Error in error handler:", ehErr);
            }
          }
        }
      }
    }
  }

  /**
   * Starts long polling for updates from Telegram Bot API.
   *
   * @param options - Polling configuration options.
   * @returns Resolves when polling stops.
   */
  public async runPolling(options: {
    allowed_updates?: string[];
    drop_pending_updates?: boolean;
    poll_interval?: number;
    timeout?: number;
  } = {}): Promise<void> {
    this.isRunning = true;
    this.abortController = new AbortController();

    if (options.drop_pending_updates) {
      const updates = await this.bot.getUpdates({ offset: -1, timeout: 0 });
      if (updates.length > 0) {
        this.offset = updates[updates.length - 1]!.update_id + 1;
      }
    }

    const timeout = options.timeout ?? 10;
    const pollInterval = options.poll_interval ?? 0;

    while (this.isRunning) {
      try {
        const updates = await this.bot.getUpdates({
          offset: this.offset,
          timeout,
          allowed_updates: options.allowed_updates,
        });

        for (const update of updates) {
          if (!this.isRunning) break;
          this.offset = update.update_id + 1;
          await this.processUpdate(update);
        }
      } catch (err: unknown) {
        if (!this.isRunning) break;
        const error = err instanceof Error ? err : new Error(String(err));
        for (const errHandler of this.errorHandlers) {
          try {
            await errHandler(error);
          } catch (ehErr) {
            console.error("Error in polling error handler:", ehErr);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (pollInterval > 0 && this.isRunning) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }
  }

  /**
   * Stops the active polling loop and aborts pending network requests.
   */
  public stop(): void {
    this.isRunning = false;
    this.abortController?.abort();
  }
}

/**
 * Fluent builder for creating {@link Application} instances.
 */
export class ApplicationBuilder {
  private _token?: string;
  private _botOptions?: BotOptions;
  private _appOptions: ApplicationOptions = {};

  /**
   * Sets the Telegram bot token.
   */
  public token(token: string): this {
    this._token = token;
    return this;
  }

  /**
   * Configures optional settings for the underlying {@link Bot} client.
   */
  public botOptions(options: BotOptions): this {
    this._botOptions = options;
    return this;
  }

  /**
   * Configures the persistence backend for state management.
   */
  public persistence(persistence: Persistence): this {
    this._appOptions.persistence = persistence;
    return this;
  }

  /**
   * Constructs the configured {@link Application} instance.
   */
  public build(): Application {
    if (!this._token) {
      throw new Error("Cannot build Application without bot token.");
    }
    const bot = new Bot(this._token, this._botOptions);
    return new Application(bot, this._appOptions);
  }
}
