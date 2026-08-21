/**
 * Application runtime and update orchestrator.
 *
 * @packageDocumentation
 */

import { type Server } from "node:http";
import { Bot, type BotOptions } from "../client/bot.js";
import { Update } from "./update.js";
import type { RawUpdate } from "../client/types.js";
import { BaseHandler } from "../routing/handlers.js";
import { ConversationHandler } from "../routing/conversation.js";
import { CallbackContext } from "./context.js";
import { type Persistence, MemoryPersistence } from "../storage/index.js";
import { JobQueue } from "../scheduler/queue.js";
import { dispatchUpdate, type MiddlewareFn } from "./dispatcher.js";
import { runPollingLoop, type PollingLoopOptions } from "./polling.js";
import { createWebhookServer, type WebhookServerOptions } from "./webhook.js";
import { ApplicationBuilder } from "./builder.js";

export { ApplicationBuilder } from "./builder.js";
export { type MiddlewareFn } from "./dispatcher.js";
export {
  isSecretTokenValid,
  MAX_WEBHOOK_BODY_BYTES,
  type WebhookServerOptions,
} from "./webhook.js";
export { type PollingLoopOptions } from "./polling.js";

/**
 * Error handler callback signature.
 */
export type ErrorHandlerCallback = (
  error: Error,
  update?: Update,
  context?: CallbackContext,
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
 * const app = new Application(process.env.BOT_TOKEN!);
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
  private readonly middlewares: MiddlewareFn[] = [];
  private readonly stateLocks: Map<string, Promise<void>> = new Map();

  /**
   * Indicates whether the polling loop is actively running.
   */
  public isRunning: boolean = false;

  private abortController?: AbortController;
  private persistenceInitialized: boolean = false;
  private webhookServer?: Server;

  /**
   * Creates a new fluent {@link ApplicationBuilder} instance.
   *
   * @returns An {@link ApplicationBuilder} instance.
   */
  public static builder(): ApplicationBuilder {
    return new ApplicationBuilder();
  }

  /**
   * Constructs a new {@link Application} from a bot token or existing {@link Bot}.
   */
  constructor(token: string, options?: ApplicationOptions & BotOptions);
  constructor(bot: Bot, options?: ApplicationOptions);
  constructor(botOrToken: Bot | string, options: ApplicationOptions & BotOptions = {}) {
    this.bot = typeof botOrToken === "string" ? new Bot(botOrToken, options) : botOrToken;
    this.persistence = options.persistence ?? new MemoryPersistence();
    this.scheduler = new JobQueue(this.bot);
    this.scheduler.errorHandler = async (error, context) => {
      context.error = error;
      for (const errHandler of this.errorHandlers) {
        try {
          await errHandler(error, context.update, context);
        } catch (ehErr) {
          console.error("Error in error handler:", ehErr);
        }
      }
      context.error = undefined;
    };
  }

  /**
   * Registers one or more global middleware functions executed on every incoming update.
   *
   * @param middlewares - Middleware functions to execute in order.
   * @returns This {@link Application} instance for chaining.
   *
   * @example
   * ```ts
   * app.use(async (context, next) => {
   *   const start = Date.now();
   *   await next();
   *   console.log(`Update processed in ${Date.now() - start}ms`);
   * });
   * ```
   */
  public use(...middlewares: MiddlewareFn[]): this {
    this.middlewares.push(...middlewares);
    return this;
  }

  /**
   * Registers an update handler into a numerical priority group.
   *
   * @param handler - The {@link BaseHandler} instance.
   * @param group - Numerical priority group (lower runs earlier, default: `0`).
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
   * @param group - Numerical priority group (default: `0`).
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
   * Initializes persistent conversation states from persistence storage.
   */
  public async initializePersistence(): Promise<void> {
    if (this.persistenceInitialized) return;

    const storedConversations = await this.persistence.getConversations();
    for (const handlers of this.handlers.values()) {
      for (const handler of handlers) {
        if (handler instanceof ConversationHandler && handler.persistent) {
          for (const [key, state] of storedConversations.entries()) {
            if (!handler.name || key.startsWith(`${handler.name}:`)) {
              handler.conversations.set(key, state);
            }
          }
        }
      }
    }

    // Restore persistent scheduled jobs
    const persistedJobs = await this.persistence.getJobs();
    if (persistedJobs.length > 0) {
      this.scheduler.restoreFromPersistedJobs(persistedJobs);
    }

    this.persistenceInitialized = true;
  }

  /**
   * Processes a single update through the registered handler pipeline.
   *
   * @param rawUpdate - The update payload received from Telegram.
   */
  public async processUpdate(rawUpdate: RawUpdate | Record<string, unknown>): Promise<void> {
    await this.initializePersistence();
    await dispatchUpdate(
      rawUpdate,
      this.bot,
      this.job_queue,
      this.persistence,
      this.handlers,
      this.errorHandlers,
      this.stateLocks,
      this.middlewares,
    );
  }

  /**
   * Starts long polling for updates from Telegram Bot API.
   *
   * @param options - Polling configuration options.
   * @returns Resolves when polling stops.
   */
  public async runPolling(options: PollingLoopOptions = {}): Promise<void> {
    if (this.isRunning) {
      throw new Error("Application is already running. Cannot start polling concurrently.");
    }

    this.isRunning = true;
    this.abortController = new AbortController();

    await this.initializePersistence();
    this.job_queue.start();

    await runPollingLoop(
      this.bot,
      options,
      () => this.isRunning,
      async (update) => {
        await this.processUpdate(update);
      },
      this.errorHandlers,
    );
  }

  /**
   * Starts a webhook HTTP server to receive updates pushed directly by Telegram.
   *
   * @param options - Webhook server configuration options.
   * @throws If the application is already running in polling or webhook mode.
   */
  public async runWebhook(options: WebhookServerOptions = {}): Promise<void> {
    if (this.isRunning) {
      throw new Error("Application is already running. Cannot start webhook concurrently.");
    }

    this.isRunning = true;
    await this.initializePersistence();
    this.scheduler.start();

    this.webhookServer = await createWebhookServer(
      options,
      async (rawUpdate) => {
        await this.processUpdate(rawUpdate);
      },
      this.errorHandlers,
    );
  }

  /**
   * Stops the active polling loop or webhook server, shuts down the scheduler, and flushes persistent state.
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
