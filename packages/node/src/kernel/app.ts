/**
 * Application runtime and update orchestrator.
 *
 * @packageDocumentation
 */

import { type Server } from "node:http";
import { Bot, type BotOptions } from "../client/bot.js";
import { Update } from "./update.js";
import type { RawUpdate } from "../client/types.js";
import {
  BaseHandler,
  CommandHandler,
  MessageHandler,
  CallbackQueryHandler,
  TypeHandler,
  type HandlerCallback,
} from "../routing/handlers.js";
import { filters } from "../filters/matchers.js";
import type { BaseFilter } from "../filters/base.js";
import { ConversationHandler } from "../routing/conversation.js";

import { CallbackContext } from "./context.js";
import { type Persistence, MemoryPersistence } from "../storage/index.js";
import { JobQueue } from "../scheduler/queue.js";
import { dispatchUpdate, type MiddlewareFn } from "./dispatcher.js";
import { runPollingLoop, type PollingLoopOptions } from "./polling.js";
import { createWebhookServer, type WebhookServerOptions } from "./webhook.js";
import { AsyncConversationManager, type AsyncConversationHandlerFn } from "../routing/index.js";
import { ApplicationBuilder } from "./builder.js";
import { restoreApplicationState, flushApplicationState } from "./lifecycle.js";
import type { Plugin } from "./plugin.js";
import { PluginManager, type LifecycleHook } from "./plugin-manager.js";

export { ApplicationBuilder } from "./builder.js";
export { type MiddlewareFn } from "./dispatcher.js";
export { type AsyncConversationHandlerFn } from "../routing/index.js";
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
  private readonly conversationManager = new AsyncConversationManager();
  private readonly initHooks: LifecycleHook[] = [];
  private readonly shutdownHooks: LifecycleHook[] = [];
  private readonly pluginManager: PluginManager;

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
    this.pluginManager = new PluginManager(
      this,
      this.middlewares,
      this.initHooks,
      this.shutdownHooks,
      this.handlers,
      this.errorHandlers,
    );
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
   * Registers one or more global middleware functions or middleware-providing objects (e.g. {@link Menu}) executed on every incoming update.
   *
   * @param middlewares - Middleware functions or objects with a `middleware()` method to execute in order.
   * @returns This {@link Application} instance for chaining.
   *
   * @example
   * ```ts
   * app.use(async (context, next) => {
   *   const start = Date.now();
   *   await next();
   *   console.log(`Update processed in ${Date.now() - start}ms`);
   * });
   *
   * // Or with Menu
   * app.use(myMenu);
   * ```
   */
  public use(...middlewares: (MiddlewareFn | { middleware: () => MiddlewareFn })[]): this {
    for (const mw of middlewares) {
      let fn: MiddlewareFn | undefined;
      if (typeof mw === "function") {
        fn = mw;
      } else if (mw && typeof mw === "object" && typeof mw.middleware === "function") {
        fn = mw.middleware();
      }
      if (fn) {
        this.middlewares.push(fn);
        this.pluginManager.trackMiddleware(fn);
      }
    }
    return this;
  }

  /**
   * Installs a {@link Plugin} into the application.
   *
   * The plugin's `install` hook receives this application and wires up middleware, handlers, and
   * lifecycle hooks synchronously. Installing two plugins with the same `name` throws. Plugins
   * whose `dependsOn` dependencies are not installed yet are deferred and installed
   * automatically (in ascending `priority` order) once their dependencies arrive.
   *
   * @param plugin - The plugin instance to install.
   * @returns This {@link Application} instance for chaining.
   * @throws When a plugin with the same name is already installed.
   *
   * @example
   * ```ts
   * import { plugins } from "telebot-ts";
   *
   * app.usePlugin(
   *   plugins.i18n({ default_locale: "en", locales: { en: { hello: "Hello!" } } }),
   * );
   * ```
   */
  public usePlugin(plugin: Plugin): this {
    this.pluginManager.use(plugin);
    return this;
  }

  /**
   * Installs all deferred plugins whose dependencies are now satisfied.
   *
   * Called automatically by every {@link Application.usePlugin}; invoke manually only if you
   * need deterministic installation before registering further plugins.
   *
   * @returns This {@link Application} instance for chaining.
   */
  public flushPlugins(): this {
    this.pluginManager.flush();
    return this;
  }

  /**
   * Returns whether a plugin with the given name is currently installed.
   *
   * @param name - Plugin name to look up.
   * @returns True if the plugin is installed.
   */
  public hasPlugin(name: string): boolean {
    return this.pluginManager.has(name);
  }

  /**
   * Returns the mutable namespaced state object for a plugin, creating it on first access.
   *
   * Gives plugins their own key space so they never collide with bot code or other plugins in
   * `user_data`/`bot_data`. The object lives for the application's lifetime; persist anything
   * important into `bot_data` from an `onShutdown` hook.
   *
   * @typeParam T - Shape the caller expects the state to have.
   * @param name - Plugin name owning the state (usually `plugin.name`).
   * @returns The plugin's state object.
   *
   * @example
   * ```ts
   * const state = app.pluginState<{ counter?: number }>("my-plugin");
   * state.counter = (state.counter ?? 0) + 1;
   * ```
   */
  public pluginState<T extends Record<string, unknown> = Record<string, unknown>>(name: string): T {
    return this.pluginManager.state<T>(name);
  }

  /**
   * Uninstalls a plugin: runs its optional `uninstall` hook, deregisters every middleware,
   * handler, lifecycle hook, and error handler it registered, removes its tagged bot hooks, and
   * drops its {@link Application.pluginState}. The name can be reused afterwards.
   *
   * @param name - Name of the installed plugin to remove.
   * @returns This {@link Application} instance for chaining.
   * @throws When no plugin with that name is installed.
   *
   * @example
   * ```ts
   * app.removePlugin("telebot-plugin-i18n");
   * ```
   */
  public removePlugin(name: string): this {
    this.pluginManager.remove(name);
    return this;
  }

  /**
   * Registers a hook invoked once, in registration order, right before the application starts
   * serving updates (polling or webhook). Use it for asynchronous plugin setup such as opening
   * connections or warming caches.
   *
   * @param hook - Callback executed before startup completes.
   * @returns This {@link Application} instance for chaining.
   *
   * @example
   * ```ts
   * app.onInit(async () => {
   *   await loadTranslations();
   * });
   * ```
   */
  public onInit(hook: () => Promise<void> | void): this {
    this.initHooks.push(hook);
    this.pluginManager.trackInitHook(hook);
    return this;
  }

  /**
   * Registers a hook invoked once, in registration order, during {@link Application.stop} after
   * the server stops and persisted state is flushed. Use it to release resources held by plugins.
   *
   * @param hook - Callback executed during shutdown.
   * @returns This {@link Application} instance for chaining.
   *
   * @example
   * ```ts
   * app.onShutdown(() => metricsClient.close());
   * ```
   */
  public onShutdown(hook: () => Promise<void> | void): this {
    this.shutdownHooks.push(hook);
    this.pluginManager.trackShutdownHook(hook);
    return this;
  }

  private async runInitHooks(): Promise<void> {
    for (const hook of this.initHooks) {
      try {
        await hook();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        for (const errHandler of this.errorHandlers) {
          try {
            await errHandler(error);
          } catch (ehErr) {
            console.error("Error in error handler:", ehErr);
          }
        }
      }
    }
  }

  private async runShutdownHooks(): Promise<void> {
    for (const hook of this.shutdownHooks) {
      try {
        await hook();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        for (const errHandler of this.errorHandlers) {
          try {
            await errHandler(error);
          } catch (ehErr) {
            console.error("Error in error handler:", ehErr);
          }
        }
      }
    }
  }

  /**
   * Registers a command handler shortcut (e.g. `/start`, `/help`).
   *
   * @param command - Command name (without leading `/`) or array of command names.
   * @param callback - Callback function invoked when matching command is received.
   * @param group - Handler priority group (default: `0`).
   * @returns This {@link Application} instance for chaining.
   *
   * @example
   * ```ts
   * app.command("start", async (update, context) => {
   *   await context.reply("Welcome to our bot!");
   * });
   * ```
   */
  public command(command: string | string[], callback: HandlerCallback, group: number = 0): this {
    this.addHandler(new CommandHandler(command, callback), group);
    return this;
  }

  /**
   * Registers a text pattern listener shortcut matching text strings or regular expressions.
   *
   * @param pattern - String text or RegExp pattern to match in incoming text messages.
   * @param callback - Callback function invoked when pattern matches.
   * @param group - Handler priority group (default: `0`).
   * @returns This {@link Application} instance for chaining.
   *
   * @example
   * ```ts
   * app.hears(/order ([0-9]+)/i, async (update, context) => {
   *   const orderId = context.matches?.[0]?.[1];
   *   await context.reply(`Checking order ${orderId}...`);
   * });
   * ```
   */
  public hears(
    pattern: string | RegExp | (string | RegExp)[],
    callback: HandlerCallback,
    group: number = 0,
  ): this {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const regexFilter = filters.Regex(
      new RegExp(
        patterns
          .map((p) => (typeof p === "string" ? p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : p.source))
          .join("|"),
        typeof patterns[0] === "object" ? patterns[0].flags : undefined,
      ),
    );
    this.addHandler(new MessageHandler(regexFilter, callback), group);
    return this;
  }

  /**
   * Registers an inline callback query button listener shortcut.
   *
   * @param pattern - Callback data string, RegExp pattern, or boolean (match all).
   * @param callback - Callback function invoked when matching button is tapped.
   * @param group - Handler priority group (default: `0`).
   * @returns This {@link Application} instance for chaining.
   *
   * @example
   * ```ts
   * app.callbackQuery("buy_item", async (update, context) => {
   *   await context.answerCallbackQuery({ text: "Item added to cart!" });
   * });
   * ```
   */
  public callbackQuery(
    pattern: string | RegExp | ((data: string) => boolean) | (string | RegExp)[] | boolean,
    callback: HandlerCallback,
    group: number = 0,
  ): this {
    let resolvedPattern: string | RegExp | ((data: string) => boolean) | undefined;
    if (typeof pattern === "boolean") {
      resolvedPattern = undefined;
    } else if (Array.isArray(pattern)) {
      resolvedPattern = (data: string) =>
        pattern.some((p) => (typeof p === "string" ? p === data : p.test(data)));
    } else {
      resolvedPattern = pattern;
    }

    this.addHandler(new CallbackQueryHandler(callback, resolvedPattern), group);
    return this;
  }

  /**
   * Registers a message filter or update type listener shortcut.
   *
   * @param filterOrType - A {@link BaseFilter}, update property key string (e.g. `'message'`, `'inline_query'`), or custom predicate function.
   * @param callback - Callback function invoked when update matches.
   * @param group - Handler priority group (default: `0`).
   * @returns This {@link Application} instance for chaining.
   *
   * @example
   * ```ts
   * app.on(filters.PHOTO, async (update, context) => {
   *   await context.reply("Thanks for the photo!");
   * });
   * ```
   */
  public on(
    filterOrType:
      BaseFilter | string | ((update: Update | RawUpdate) => boolean | Promise<boolean>),
    callback: HandlerCallback,
    group: number = 0,
  ): this {
    if (typeof filterOrType === "function") {
      this.addHandler(new TypeHandler(filterOrType, callback), group);
    } else if (typeof filterOrType === "string") {
      this.addHandler(
        new TypeHandler(
          (u) => Boolean((u as unknown as Record<string, unknown>)[filterOrType]),
          callback,
        ),
        group,
      );
    } else {
      this.addHandler(new MessageHandler(filterOrType, callback), group);
    }
    return this;
  }

  /**
   * Registers a named linear async/await conversation flow.
   *
   * @param name - Unique string identifier for the conversation.
   * @param handler - Sequential asynchronous conversation generator or callback.
   * @returns This {@link Application} instance for chaining.
   *
   * @example
   * ```ts
   * app.conversation("survey", async (conv, ctx) => {
   *   const name = await conv.ask("What is your name?");
   *   await ctx.reply(`Nice to meet you, ${name}!`);
   * });
   * ```
   */
  public conversation(name: string, handler: AsyncConversationHandlerFn): this {
    this.conversationManager.register(name, handler);
    return this;
  }

  /**
   * Enters a registered linear async conversation for a specific user.
   *
   * @param userId - Target user identifier.
   * @param name - Name of the registered conversation to enter.
   * @param initialContext - Optional initial callback context.
   * @returns Resolves with the conversation execution promise.
   *
   * @example
   * ```ts
   * await app.enterConversation(123456, "survey");
   * ```
   */
  public async enterConversation(
    userId: number,
    name: string,
    initialContext?: CallbackContext,
  ): Promise<void> {
    const ctx =
      initialContext ??
      new CallbackContext({
        bot: this.bot,
        job_queue: this.job_queue,
        conversationManager: this.conversationManager,
        update: new Update({
          update_id: 0,
          message: {
            message_id: 0,
            date: Math.floor(Date.now() / 1000),
            chat: { id: userId, type: "private" },
            from: { id: userId, is_bot: false, first_name: "User" },
          },
        }),
      });
    await this.conversationManager.enter(name, ctx, userId, userId);
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
    this.pluginManager.trackHandler(handler);
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
    this.pluginManager.trackErrorHandler(callback);
  }

  /**
   * Initializes persistent conversation states from persistence storage.
   */
  public async initializePersistence(): Promise<void> {
    if (this.persistenceInitialized) return;
    await restoreApplicationState(this.persistence, this.handlers, this.scheduler);
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
      this.conversationManager,
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

    this.pluginManager.assertReady();
    this.isRunning = true;
    this.abortController = new AbortController();

    await this.initializePersistence();
    await this.runInitHooks();
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

    this.pluginManager.assertReady();
    this.isRunning = true;
    await this.initializePersistence();
    await this.runInitHooks();
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

    await flushApplicationState(this.persistence, this.job_queue);
    await this.runShutdownHooks();
  }
}
