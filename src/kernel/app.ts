/**
 * Application runtime and update orchestrator.
 *
 * @packageDocumentation
 */

import { createServer, type Server } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { Bot, type BotOptions } from "../client/bot.js";
import { Update } from "./update.js";
import type { RawUpdate } from "../client/types.js";
import { BaseHandler } from "../routing/handlers.js";
import { ConversationHandler } from "../routing/conversation.js";
import { CallbackContext } from "./context.js";
import { type Persistence, MemoryPersistence } from "../storage/index.js";
import { JobQueue } from "../scheduler/queue.js";

/**
 * Error handler callback signature.
 */
export type ErrorHandlerCallback = (
  error: Error,
  update?: Update,
  context?: CallbackContext,
) => Promise<void> | void;

/**
 * Maximum accepted size, in bytes, of an incoming webhook request body.
 *
 * @remarks
 * Telegram update payloads are small JSON documents (files are referenced by `file_id`,
 * never embedded), so this generously bounds memory use per in-flight request while
 * comfortably fitting any real update.
 */
const MAX_WEBHOOK_BODY_BYTES = 5 * 1024 * 1024;

/**
 * Compares the received `X-Telegram-Bot-Api-Secret-Token` header against the configured
 * secret using a constant-time comparison, so that response timing cannot leak how many
 * leading characters matched.
 *
 * @param received - The raw header value as read from the incoming request.
 * @param expected - The secret token configured via {@link Application.runWebhook}.
 * @returns `true` if `received` matches `expected`.
 */
function isSecretTokenValid(received: string | string[] | undefined, expected: string): boolean {
  if (typeof received !== "string") return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

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

  /**
   * Background task scheduler and timer engine.
   */
  public readonly scheduler: JobQueue;

  /**
   * Compatibility alias for {@link Application.scheduler}.
   */
  get job_queue(): JobQueue {
    return this.scheduler;
  }

  private readonly handlers: Map<number, BaseHandler[]> = new Map();
  private readonly errorHandlers: ErrorHandlerCallback[] = [];
  private readonly stateLocks: Map<string, Promise<void>> = new Map();

  /**
   * Indicates whether the polling loop is actively running.
   */
  public isRunning: boolean = false;

  private offset: number = 0;
  private abortController?: AbortController;
  private persistenceInitialized: boolean = false;

  /**
   * Constructs a new {@link Application} instance.
   *
   * @param bot - The {@link Bot} client instance.
   * @param options - Configuration options for the application.
   */
  constructor(bot: Bot, options: ApplicationOptions = {}) {
    this.bot = bot;
    this.persistence = options.persistence ?? new MemoryPersistence();
    this.scheduler = new JobQueue(bot);
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
   * Registers multiple update handlers simultaneously into a handler group.
   *
   * @param handlers - Array of {@link BaseHandler} instances.
   * @param group - Numerical priority group.
   * @defaultValue `0`
   *
   * @example
   * ```ts
   * app.addHandlers([startHandler, helpHandler, echoHandler]);
   * ```
   */
  public addHandlers(handlers: BaseHandler[], group: number = 0): void {
    for (const handler of handlers) {
      this.addHandler(handler, group);
    }
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
   * Serializes execution of `fn` against any other call currently holding one of `keys`.
   *
   * @remarks
   * Used to prevent lost updates when persistence read-modify-write cycles (e.g. `user_data`)
   * for the same key overlap across concurrently dispatched updates, such as two webhook
   * requests from the same chat/user arriving close together.
   *
   * @typeParam T - Return type of `fn`.
   * @param keys - Lock keys to acquire, e.g. `user:<id>`, `chat:<id>`. Acquired in sorted
   * order so that overlapping key sets across concurrent calls can never deadlock.
   * @param fn - The critical section to run once all `keys` are held.
   * @returns The value returned by `fn`.
   */
  private async withStateLock<T>(keys: string[], fn: () => Promise<T>): Promise<T> {
    if (keys.length === 0) {
      return fn();
    }

    const releases: Array<() => void> = [];
    for (const key of [...new Set(keys)].sort()) {
      const previous = this.stateLocks.get(key) ?? Promise.resolve();
      let release!: () => void;
      const tail = new Promise<void>((resolve) => {
        release = resolve;
      });
      this.stateLocks.set(key, tail);
      releases.push(() => {
        release();
        if (this.stateLocks.get(key) === tail) {
          this.stateLocks.delete(key);
        }
      });
      await previous;
    }

    try {
      return await fn();
    } finally {
      for (const release of releases) release();
    }
  }

  /**
   * Initializes persistent conversation states from persistence storage.
   */
  public async initializePersistence(): Promise<void> {
    if (this.persistenceInitialized) return;

    const storedConversations = await this.persistence.getConversations();
    for (const groupHandlers of this.handlers.values()) {
      for (const handler of groupHandlers) {
        if (handler instanceof ConversationHandler && handler.persistent) {
          for (const [key, state] of storedConversations.entries()) {
            if (!handler.name || key.startsWith(`${handler.name}:`)) {
              handler.conversations.set(key, state);
            }
          }
        }
      }
    }

    // Restore persisted background jobs
    const storedJobs = await this.persistence.getJobs();
    if (storedJobs.length > 0) {
      this.job_queue.restoreFromPersistedJobs(storedJobs);
    }

    this.persistenceInitialized = true;
  }

  /**
   * Dispatches a single update through registered handler groups and catches errors.
   *
   * @param rawUpdate - The incoming {@link RawUpdate} or wrapped {@link Update} instance.
   * @returns Resolves when update dispatching completes across all handler groups.
   */
  public async processUpdate(rawUpdate: RawUpdate | Update): Promise<void> {
    await this.initializePersistence();

    const update = rawUpdate instanceof Update ? rawUpdate : new Update(rawUpdate, this.bot);

    const userId = update.effective_user?.id;
    const chatId = update.effective_chat?.id;
    const lockKeys: string[] = [];
    if (userId !== undefined) lockKeys.push(`user:${userId}`);
    if (chatId !== undefined) lockKeys.push(`chat:${chatId}`);

    // Holding a lock per user_id/chat_id for the whole read-dispatch-write cycle below
    // prevents two concurrently dispatched updates for the same user/chat (e.g. two
    // webhook requests arriving close together) from reading stale data and clobbering
    // each other's write.
    await this.withStateLock(lockKeys, async () => {
      // Resolve context user_data / chat_data / bot_data
      let userData: Record<string, unknown> | undefined;
      let chatData: Record<string, unknown> | undefined;
      const botData = await this.persistence.getBotData();

      if (userId !== undefined) {
        userData = await this.persistence.getUserData(userId);
      }

      if (chatId !== undefined) {
        chatData = await this.persistence.getChatData(chatId);
      }

      const context = new CallbackContext({
        bot: this.bot,
        job_queue: this.job_queue,
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

              // Sync persistent ConversationHandler changes
              if (handler instanceof ConversationHandler && handler.persistent) {
                for (const [key, state] of handler.conversations.entries()) {
                  await this.persistence.updateConversation(key, state);
                }
              }

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
            context.error = undefined;
          }
        }
      }

      // Auto-save modified state to persistence
      if (userId !== undefined && userData !== undefined) {
        await this.persistence.setUserData(userId, userData);
      }
      if (chatId !== undefined && chatData !== undefined) {
        await this.persistence.setChatData(chatId, chatData);
      }
      if (botData !== undefined) {
        await this.persistence.setBotData(botData);
      }

      if (this.persistence.flush) {
        await this.persistence.flush();
      }
    });
  }

  /**
   * Starts long polling for updates from Telegram Bot API.
   *
   * @param options - Polling configuration options.
   * @returns Resolves when polling stops.
   */
  public async runPolling(
    options: {
      allowed_updates?: string[];
      drop_pending_updates?: boolean;
      poll_interval?: number;
      timeout?: number;
    } = {},
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error("Application is already running. Cannot start polling concurrently.");
    }

    this.isRunning = true;
    this.abortController = new AbortController();

    await this.initializePersistence();

    this.job_queue.start();

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
   * Starts a webhook HTTP server to receive updates pushed directly by Telegram.
   *
   * @param options - Webhook server configuration options.
   * @throws If the application is already running in polling or webhook mode.
   *
   * @example
   * ```ts
   * await app.runWebhook({
   *   listen: "0.0.0.0",
   *   port: 8443,
   *   path: "/telegram-webhook",
   *   secret_token: "super-secret-token",
   * });
   * ```
   */
  public async runWebhook(
    options: {
      listen?: string;
      port?: number;
      path?: string;
      secret_token?: string;
      server?: Server;
    } = {},
  ): Promise<void> {
    if (this.isRunning) {
      throw new Error("Application is already running. Cannot start webhook concurrently.");
    }

    this.isRunning = true;
    await this.initializePersistence();
    this.scheduler.start();

    const listenHost = options.listen ?? "0.0.0.0";
    const listenPort = options.port ?? 8080;
    const webhookPath = options.path ?? "/";
    const secretToken = options.secret_token;

    const server = options.server ?? createServer();

    server.on("request", async (req, res) => {
      const url = new URL(req.url ?? "/", `http://${req.headers.host || "localhost"}`);
      if (req.method !== "POST" || url.pathname !== webhookPath) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }

      // Validate secret_token header if configured, using a constant-time comparison so
      // that response timing cannot be used to brute-force the token character by character.
      if (secretToken) {
        const receivedToken = req.headers["x-telegram-bot-api-secret-token"];
        if (!isSecretTokenValid(receivedToken, secretToken)) {
          res.writeHead(401, { "Content-Type": "text/plain" });
          res.end("Unauthorized");
          return;
        }
      }

      const declaredLength = Number(req.headers["content-length"]);
      if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BODY_BYTES) {
        res.writeHead(413, { "Content-Type": "text/plain" });
        res.end("Payload Too Large");
        // Drain (rather than destroy) so the client can finish its upload without the
        // connection being reset mid-write, which would surface as ECONNRESET/EPIPE.
        req.resume();
        return;
      }

      let body = "";
      let receivedBytes = 0;
      let rejected = false;
      req.on("data", (chunk: Buffer) => {
        if (rejected) return;
        receivedBytes += chunk.length;
        if (receivedBytes > MAX_WEBHOOK_BODY_BYTES) {
          rejected = true;
          res.writeHead(413, { "Content-Type": "text/plain" });
          res.end("Payload Too Large");
          return;
        }
        body += chunk;
      });

      req.on("end", async () => {
        if (rejected) return;
        try {
          const rawUpdate = JSON.parse(body);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("OK");

          await this.processUpdate(rawUpdate);
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          for (const errHandler of this.errorHandlers) {
            try {
              await errHandler(error);
            } catch (ehErr) {
              console.error("Error in webhook error handler:", ehErr);
            }
          }
          if (!res.headersSent) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("Bad Request");
          }
        }
      });
    });

    if (!options.server) {
      await new Promise<void>((resolve) => {
        server.listen(listenPort, listenHost, () => {
          resolve();
        });
      });
    }

    this.webhookServer = server;
  }

  private webhookServer?: Server;

  /**
   * Stops the active polling loop or webhook server, shuts down the scheduler, and flushes persistent state.
   *
   * @returns Resolves when all shutdown operations complete.
   *
   * @example
   * ```ts
   * process.on("SIGINT", async () => {
   *   await app.stop();
   *   process.exit(0);
   * });
   * ```
   */
  public async stop(): Promise<void> {
    this.isRunning = false;
    this.abortController?.abort();

    if (this.webhookServer) {
      await new Promise<void>((resolve) => {
        this.webhookServer?.close(() => resolve());
      });
      this.webhookServer = undefined;
    }

    // Persist active jobs before stopping scheduler
    const persistedJobs = this.job_queue.toPersistedJobs();
    await this.persistence.setJobs(persistedJobs);

    this.job_queue.stop();
  }
}

/**
 * Fluent builder for constructing and configuring {@link Application} instances.
 *
 * @example
 * ```ts
 * const app = new ApplicationBuilder()
 *   .token(process.env.BOT_TOKEN!)
 *   .persistence(new SqlitePersistence({ dbPath: "./data/bot.sqlite" }))
 *   .build();
 * ```
 */
export class ApplicationBuilder {
  private _token?: string;
  private _botOptions?: BotOptions;
  private _appOptions: ApplicationOptions = {};

  /**
   * Sets the Telegram bot token received from BotFather.
   *
   * @param token - The bot token string.
   * @returns This builder instance for chaining.
   */
  public token(token: string): this {
    this._token = token;
    return this;
  }

  /**
   * Configures optional settings for the underlying {@link Bot} client.
   *
   * @param options - Bot options (custom fetch, retry limits, apiRoot).
   * @returns This builder instance for chaining.
   */
  public botOptions(options: BotOptions): this {
    this._botOptions = options;
    return this;
  }

  /**
   * Configures the persistence backend for state management.
   *
   * @param persistence - A {@link Persistence} implementation instance.
   * @returns This builder instance for chaining.
   */
  public persistence(persistence: Persistence): this {
    this._appOptions.persistence = persistence;
    return this;
  }

  /**
   * Constructs and returns the configured {@link Application} instance.
   *
   * @returns The newly created {@link Application}.
   * @throws When the bot token has not been provided.
   */
  public build(): Application {
    if (!this._token) {
      throw new Error("Cannot build Application without bot token.");
    }
    const bot = new Bot(this._token, this._botOptions);
    return new Application(bot, this._appOptions);
  }
}
