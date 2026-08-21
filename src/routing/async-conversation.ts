/**
 * Linear Async/Await Conversation System.
 *
 * Enables writing multi-step, stateful user interactions sequentially using standard `async/await`.
 *
 * @packageDocumentation
 */

import type { Update } from "../kernel/update.js";
import type { CallbackContext } from "../kernel/context.js";
import type { Message, CallbackQuery } from "../client/types.js";
import type { BaseFilter } from "../filters/base.js";

/**
 * Thrown when an asynchronous conversation step exceeds its allocated wait timeout.
 */
export class ConversationTimeoutError extends Error {
  /**
   * Constructs a new {@link ConversationTimeoutError}.
   *
   * @param message - Descriptive timeout message.
   */
  constructor(message: string = "Conversation step timed out waiting for user response.") {
    super(message);
    this.name = "ConversationTimeoutError";
  }
}

/**
 * Internal control signal used to cleanly exit an active conversation flow early.
 */
export class ConversationExitSignal extends Error {
  /**
   * Constructs a new {@link ConversationExitSignal}.
   */
  constructor() {
    super("Conversation exited early.");
    this.name = "ConversationExitSignal";
  }
}

/**
 * Filter predicate function for matching incoming updates.
 */
export type UpdatePredicate = (update: Update) => boolean | Promise<boolean>;

/**
 * Options for waiting on general updates.
 */
export interface WaitOptions {
  /**
   * Maximum duration in milliseconds to wait before rejecting with {@link ConversationTimeoutError}.
   */
  timeoutMs?: number;
}

/**
 * Options for waiting on incoming messages.
 */
export interface WaitForMessageOptions extends WaitOptions {
  /**
   * Optional {@link BaseFilter} to restrict accepted messages.
   */
  filter?: BaseFilter;
}

/**
 * Options for waiting on incoming callback queries.
 */
export interface WaitForCallbackQueryOptions extends WaitOptions {
  /**
   * Optional string or RegExp pattern to match against `callback_query.data`.
   */
  pattern?: string | RegExp;
}

/**
 * Async conversation controller interface passed to conversation handler callbacks.
 *
 * Provides linear async methods (`wait`, `waitForMessage`, `waitForCallbackQuery`, `ask`, `exit`)
 * to write sequential conversational dialogs.
 *
 * @example
 * ```ts
 * app.conversation("registration", async (conversation, ctx) => {
 *   const name = await conversation.ask("What is your name?");
 *   await ctx.reply(`Welcome, ${name}! Please tap a button to choose your role:`, {
 *     reply_markup: new InlineKeyboard()
 *       .text("Developer", "role:dev")
 *       .text("Designer", "role:des")
 *       .build(),
 *   });
 *   const query = await conversation.waitForCallbackQuery();
 *   await ctx.answerCallbackQuery({ text: `Role selected: ${query.data}` });
 * });
 * ```
 */
export class AsyncConversation {
  /**
   * Name of this conversation flow.
   */
  public readonly name: string;

  /**
   * Initial {@link CallbackContext} for this conversation.
   */
  public readonly context: CallbackContext;

  /**
   * Target user ID if conversation is scoped per user.
   */
  public readonly userId?: number;

  /**
   * Target chat ID if conversation is scoped per chat.
   */
  public readonly chatId?: number | string;

  private readonly manager: AsyncConversationManager;
  private readonly sessionKey: string;

  /**
   * Constructs a new {@link AsyncConversation} controller.
   *
   * @param name - Name of the conversation.
   * @param context - Initial callback context.
   * @param sessionKey - Storage key for this conversation session.
   * @param manager - Conversation manager reference.
   * @param userId - Target user identifier.
   * @param chatId - Target chat identifier.
   */
  constructor(
    name: string,
    context: CallbackContext,
    sessionKey: string,
    manager: AsyncConversationManager,
    userId?: number,
    chatId?: number | string,
  ) {
    this.name = name;
    this.context = context;
    this.sessionKey = sessionKey;
    this.manager = manager;
    this.userId = userId;
    this.chatId = chatId;
  }

  /**
   * Pauses execution until the next update matching the optional predicate is received.
   *
   * @param filter - Predicate function that tests whether an incoming {@link Update} satisfies the step.
   * @param options - Configuration options such as timeout duration.
   * @returns Resolves with the incoming matching {@link Update}.
   * @throws {@link ConversationTimeoutError} If the timeout duration expires before a matching update arrives.
   *
   * @example
   * ```ts
   * const update = await conversation.wait((u) => Boolean(u.message?.photo));
   * ```
   */
  public wait(filter?: UpdatePredicate, options: WaitOptions = {}): Promise<Update> {
    return new Promise<Update>((resolve, reject) => {
      let timer: NodeJS.Timeout | undefined;

      if (options.timeoutMs !== undefined && options.timeoutMs > 0) {
        timer = setTimeout(() => {
          this.manager.clearPendingWait(this.sessionKey);
          reject(new ConversationTimeoutError());
        }, options.timeoutMs);
      }

      this.manager.registerPendingWait(this.sessionKey, {
        predicate: filter,
        resolve: (update: Update) => {
          if (timer) clearTimeout(timer);
          resolve(update);
        },
        reject: (error: Error) => {
          if (timer) clearTimeout(timer);
          reject(error);
        },
      });
    });
  }

  /**
   * Pauses execution until an incoming message matching the optional filter is received.
   *
   * @param options - Options including optional {@link BaseFilter} and timeout.
   * @returns Resolves with the received {@link Message}.
   * @throws {@link ConversationTimeoutError} If timeout expires before a message arrives.
   *
   * @example
   * ```ts
   * const message = await conversation.waitForMessage({ filter: filters.PHOTO });
   * ```
   */
  public async waitForMessage(options: WaitForMessageOptions = {}): Promise<Message> {
    const update = await this.wait(async (u: Update) => {
      if (!u.effective_message) return false;
      if (options.filter) {
        return await options.filter.checkUpdate(u);
      }
      return true;
    }, options);

    return update.effective_message!;
  }

  /**
   * Pauses execution until an incoming inline callback query is received.
   *
   * @param options - Options including optional callback data pattern and timeout.
   * @returns Resolves with the received {@link CallbackQuery}.
   * @throws {@link ConversationTimeoutError} If timeout expires before a callback query arrives.
   *
   * @example
   * ```ts
   * const query = await conversation.waitForCallbackQuery({ pattern: /^confirm:/ });
   * ```
   */
  public async waitForCallbackQuery(
    options: WaitForCallbackQueryOptions = {},
  ): Promise<CallbackQuery> {
    const update = await this.wait((u: Update) => {
      if (!u.callback_query) return false;
      if (options.pattern) {
        const data = u.callback_query.data ?? "";
        if (typeof options.pattern === "string") {
          return data === options.pattern;
        }
        return options.pattern.test(data);
      }
      return true;
    }, options);

    return update.callback_query!;
  }

  /**
   * Convenience shortcut that sends a prompt message to the user and awaits their text response.
   *
   * @param text - Prompt message text to send.
   * @param options - Additional message wait options.
   * @returns Resolves with the text string of the user's response.
   *
   * @example
   * ```ts
   * const email = await conversation.ask("Please enter your email address:");
   * ```
   */
  public async ask(text: string, options: WaitForMessageOptions = {}): Promise<string> {
    const chatId = this.chatId ?? this.userId ?? this.context.update?.effective_chat?.id;
    if (chatId !== undefined) {
      await this.context.bot.sendMessage({
        chat_id: chatId,
        text,
      });
    } else {
      await this.context.reply(text);
    }
    const message = await this.waitForMessage(options);
    return message.text ?? "";
  }

  /**
   * Immediately terminates the active conversation flow.
   *
   * @throws {@link ConversationExitSignal} Always throws to unwind the conversation stack.
   */
  public exit(): never {
    throw new ConversationExitSignal();
  }
}

/**
 * Handler function signature for an async linear conversation.
 */
export type AsyncConversationHandlerFn = (
  conversation: AsyncConversation,
  context: CallbackContext,
) => Promise<void>;

/**
 * Active pending wait listener inside an active conversation session.
 */
export interface PendingWait {
  /**
   * Optional predicate testing incoming updates.
   */
  predicate?: UpdatePredicate;

  /**
   * Resolver function called when update matches.
   */
  resolve: (update: Update) => void;

  /**
   * Rejector function called on timeout or error.
   */
  reject: (error: Error) => void;
}

/**
 * Active running session state for an async conversation.
 */
interface ActiveSession {
  name: string;
  conversation: AsyncConversation;
  pendingWait?: PendingWait;
  promise: Promise<void>;
  readyDeferred?: { resolve: () => void };
  stepDeferred?: { resolve: () => void };
}

/**
 * Manager orchestrating active async conversation sessions and update routing.
 */
export class AsyncConversationManager {
  private readonly handlers = new Map<string, AsyncConversationHandlerFn>();
  private readonly activeSessions = new Map<string, ActiveSession>();

  /**
   * Registers a named linear async conversation handler.
   *
   * @param name - Identifier for the conversation.
   * @param handler - Asynchronous conversation function.
   */
  public register(name: string, handler: AsyncConversationHandlerFn): void {
    if (!name || name.trim().length === 0) {
      throw new TypeError("Conversation name must be a non-empty string.");
    }
    this.handlers.set(name.trim(), handler);
  }

  /**
   * Computes composite session key for a chat/user pair.
   *
   * @param userId - User ID.
   * @param chatId - Chat ID.
   * @returns Session string key.
   */
  public getSessionKey(userId?: number, chatId?: number | string): string {
    const u = userId !== undefined ? String(userId) : "none";
    const c = chatId !== undefined ? String(chatId) : "none";
    return `${c}:${u}`;
  }

  /**
   * Checks if an active conversation session exists for the given user/chat.
   *
   * @param userId - User ID.
   * @param chatId - Chat ID.
   * @returns `true` if active session exists, `false` otherwise.
   */
  public hasActiveSession(userId?: number, chatId?: number | string): boolean {
    const key = this.getSessionKey(userId, chatId);
    return this.activeSessions.has(key);
  }

  /**
   * Starts and enters a registered conversation flow for a user/chat.
   *
   * @param name - Registered conversation name.
   * @param context - Callback context.
   * @param userId - Target user ID (defaults to `context.update.effective_user.id`).
   * @param chatId - Target chat ID (defaults to `context.update.effective_chat.id`).
   * @returns Resolves when the conversation flow reaches its first wait step or finishes.
   */
  public async enter(
    name: string,
    context: CallbackContext,
    userId?: number,
    chatId?: number | string,
  ): Promise<void> {
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new Error(`Conversation '${name}' is not registered.`);
    }

    const resolvedUserId = userId ?? context.update?.effective_user?.id;
    const resolvedChatId = chatId ?? context.update?.effective_chat?.id;
    const key = this.getSessionKey(resolvedUserId, resolvedChatId);

    // Cancel previous active session if exists
    const existing = this.activeSessions.get(key);
    if (existing?.pendingWait) {
      existing.pendingWait.reject(new ConversationExitSignal());
    }

    let markReady!: () => void;
    const readyPromise = new Promise<void>((resolve) => {
      markReady = resolve;
    });

    const conversation = new AsyncConversation(
      name,
      context,
      key,
      this,
      resolvedUserId,
      resolvedChatId,
    );

    const session: ActiveSession = {
      name,
      conversation,
      readyDeferred: { resolve: markReady },
      promise: Promise.resolve(),
    };

    const promise = (async () => {
      try {
        await handler(conversation, context);
      } catch (err: unknown) {
        if (!(err instanceof ConversationExitSignal)) {
          throw err;
        }
      } finally {
        if (session.readyDeferred) {
          session.readyDeferred.resolve();
          session.readyDeferred = undefined;
        }
        if (session.stepDeferred) {
          session.stepDeferred.resolve();
          session.stepDeferred = undefined;
        }
        if (this.activeSessions.get(key)?.conversation === conversation) {
          this.activeSessions.delete(key);
        }
      }
    })();

    session.promise = promise;
    this.activeSessions.set(key, session);

    await Promise.race([readyPromise, promise]);
  }

  /**
   * Registers a pending wait condition on the active session.
   *
   * @param sessionKey - Target session key.
   * @param pending - The pending wait listener.
   */
  public registerPendingWait(sessionKey: string, pending: PendingWait): void {
    const session = this.activeSessions.get(sessionKey);
    if (session) {
      session.pendingWait = pending;
      if (session.readyDeferred) {
        session.readyDeferred.resolve();
        session.readyDeferred = undefined;
      }
      if (session.stepDeferred) {
        session.stepDeferred.resolve();
        session.stepDeferred = undefined;
      }
    }
  }

  /**
   * Clears the pending wait condition on a session.
   *
   * @param sessionKey - Target session key.
   */
  public clearPendingWait(sessionKey: string): void {
    const session = this.activeSessions.get(sessionKey);
    if (session) {
      session.pendingWait = undefined;
      if (session.stepDeferred) {
        session.stepDeferred.resolve();
        session.stepDeferred = undefined;
      }
    }
  }

  /**
   * Attempts to route an incoming update to an active waiting conversation session.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if the update was handled by an active conversation step, `false` otherwise.
   */
  public async handleUpdate(update: Update): Promise<boolean> {
    const userId = update.effective_user?.id;
    const chatId = update.effective_chat?.id;
    const key = this.getSessionKey(userId, chatId);

    const session = this.activeSessions.get(key);
    if (!session || !session.pendingWait) {
      return false;
    }

    const { predicate, resolve } = session.pendingWait;
    if (predicate) {
      const matches = await predicate(update);
      if (!matches) {
        return false;
      }
    }

    session.pendingWait = undefined;

    let markStep!: () => void;
    const stepPromise = new Promise<void>((res) => {
      markStep = res;
    });
    session.stepDeferred = { resolve: markStep };

    resolve(update);

    await Promise.race([stepPromise, session.promise]);
    return true;
  }
}

/**
 * Context helper exposed on {@link CallbackContext} for conversation operations.
 */
export class ConversationContextHelper {
  private readonly context: CallbackContext;
  private readonly manager?: AsyncConversationManager;

  /**
   * Constructs a new {@link ConversationContextHelper}.
   *
   * @param context - Callback context instance.
   * @param manager - Async conversation manager instance.
   */
  constructor(context: CallbackContext, manager?: AsyncConversationManager) {
    this.context = context;
    this.manager = manager;
  }

  /**
   * Enters and starts a named linear async conversation.
   *
   * @param name - Name of the registered conversation to enter.
   *
   * @example
   * ```ts
   * app.command("order", async (update, ctx) => {
   *   await ctx.conversation.enter("order_flow");
   * });
   * ```
   */
  public async enter(name: string): Promise<void> {
    if (!this.manager) {
      throw new Error("Conversation manager is not initialized on this application.");
    }
    await this.manager.enter(name, this.context);
  }

  /**
   * Returns whether this user/chat is actively in an async conversation flow.
   */
  public get active(): boolean {
    if (!this.manager) return false;
    return this.manager.hasActiveSession(
      this.context.update?.effective_user?.id,
      this.context.update?.effective_chat?.id,
    );
  }
}
