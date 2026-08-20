/**
 * Stateful conversation handler (Finite State Machine).
 *
 * @packageDocumentation
 */

import { BaseHandler } from "./handlers.js";
import { Update } from "../kernel/update.js";
import { CallbackContext } from "../kernel/context.js";

/**
 * Key composite configuration for tracking unique conversations.
 */
export type ConversationKey = [chatId: number | string, userId: number | undefined];

/**
 * Options for configuring a {@link ConversationHandler}.
 *
 * @typeParam C - CallbackContext type.
 */
export interface ConversationHandlerOptions<C extends CallbackContext = CallbackContext> {
  /**
   * Handlers used to initiate the conversation from an inactive state.
   */
  entry_points: BaseHandler<C, any>[];

  /**
   * Handlers indexed by state identifier (number or string).
   */
  states: Record<number | string, BaseHandler<C, any>[]>;

  /**
   * Handlers run when none of the state handlers match or for common exit commands (e.g. /cancel).
   */
  fallbacks: BaseHandler<C, any>[];

  /**
   * Optional name identifying this conversation in persistence.
   */
  name?: string;

  /**
   * Whether persistence is enabled for this conversation handler.
   *
   * @defaultValue `false`
   */
  persistent?: boolean;

  /**
   * Optional mapping of child conversation exit states to parent conversation states.
   */
  map_to_parent?: Record<number | string, number | string>;

  /**
   * Whether conversation is tracked per user.
   *
   * @defaultValue `true`
   */
  per_user?: boolean;

  /**
   * Whether conversation is tracked per chat.
   *
   * @defaultValue `true`
   */
  per_chat?: boolean;

  /**
   * Whether conversation is tracked per message (e.g. inline callback queries).
   *
   * @defaultValue `false`
   */
  per_message?: boolean;

  /**
   * Whether to allow re-entering the conversation while already in an active state.
   *
   * @defaultValue `false`
   */
  allow_reentry?: boolean;
}

/**
 * Manages multi-step conversational flows and state transitions.
 *
 * @typeParam C - CallbackContext type.
 *
 * @example
 * ```ts
 * const convHandler = new ConversationHandler({
 *   entry_points: [new CommandHandler("start", startCallback)],
 *   states: {
 *     1: [new MessageHandler(filters.TEXT, nameCallback)],
 *     2: [new MessageHandler(filters.PHOTO, photoCallback)],
 *   },
 *   fallbacks: [new CommandHandler("cancel", cancelCallback)],
 * });
 * app.addHandler(convHandler);
 * ```
 */
export class ConversationHandler<C extends CallbackContext = CallbackContext> extends BaseHandler<
  C,
  any
> {
  /**
   * Special state indicating that the conversation has ended.
   */
  public static readonly END: number = -1;

  /**
   * Special state indicating that the conversation timed out.
   */
  public static readonly TIMEOUT: number = -2;

  /**
   * Handlers that initiate this conversation.
   */
  public readonly entry_points: BaseHandler<C, any>[];

  /**
   * Handlers indexed by state identifier.
   */
  public readonly states: Map<number | string, BaseHandler<C, any>[]>;

  /**
   * Fallback handlers when state handlers do not match or when cancelling.
   */
  public readonly fallbacks: BaseHandler<C, any>[];

  /**
   * Optional name identifying this conversation in persistence.
   */
  public readonly name?: string;

  /**
   * Whether state should be saved to persistence.
   */
  public readonly persistent: boolean;

  /**
   * Parent state transition mappings for nested conversation handlers.
   */
  public readonly map_to_parent?: Record<number | string, number | string>;

  /**
   * Whether conversation is tracked per user.
   */
  public readonly per_user: boolean;

  /**
   * Whether conversation is tracked per chat.
   */
  public readonly per_chat: boolean;

  /**
   * Whether conversation is tracked per message.
   */
  public readonly per_message: boolean;

  /**
   * Whether to allow re-entering via entry_points while active.
   */
  public readonly allow_reentry: boolean;

  /**
   * In-memory storage for conversations: key -> state
   */
  public readonly conversations: Map<string, number | string> = new Map();

  /**
   * Per-update match state, keyed by the update instance rather than shared instance
   * fields, so that concurrently in-flight updates (e.g. two webhook requests dispatched
   * before either reaches {@link ConversationHandler.handleUpdate}) cannot clobber each
   * other's matched handler/key.
   */
  private readonly matchState = new WeakMap<
    Update,
    { handler: BaseHandler<C, any>; key: string }
  >();

  /**
   * Creates a new {@link ConversationHandler} instance.
   *
   * @param options - Configuration options for conversation states and handlers.
   */
  constructor(options: ConversationHandlerOptions<C>) {
    super(async () => {});

    if (!options.entry_points || options.entry_points.length === 0) {
      throw new Error("ConversationHandler requires at least one entry point.");
    }

    this.entry_points = options.entry_points;
    this.fallbacks = options.fallbacks ?? [];
    this.name = options.name;
    this.persistent = options.persistent ?? false;
    this.map_to_parent = options.map_to_parent;
    this.per_user = options.per_user ?? true;
    this.per_chat = options.per_chat ?? true;
    this.per_message = options.per_message ?? false;
    this.allow_reentry = options.allow_reentry ?? false;

    this.states = new Map();
    for (const [key, handlers] of Object.entries(options.states ?? {})) {
      // Coerce numeric string keys to number if applicable
      const stateKey = !isNaN(Number(key)) && !isNaN(parseFloat(key)) ? Number(key) : key;
      this.states.set(stateKey, handlers);
    }
  }

  /**
   * Computes the storage composite key for an update.
   *
   * @param update - Incoming Telegram update.
   * @returns String identifier key, or null if unresolvable.
   */
  private getKey(update: Update): string | null {
    const chatId = this.per_chat ? update.effective_chat?.id : null;
    const userId = this.per_user ? update.effective_user?.id : null;
    const messageId = this.per_message ? update.callback_query?.message?.message_id : null;

    if (this.per_chat && chatId === undefined) return null;
    if (this.per_user && userId === undefined) return null;

    const parts: unknown[] = [];
    if (this.name) parts.push(this.name);
    if (this.per_chat) parts.push(chatId);
    if (this.per_user) parts.push(userId);
    if (this.per_message) parts.push(messageId);

    return parts.join(":");
  }

  /**
   * Checks whether the update matches an entry point, current state handler, or fallback.
   *
   * @param update - Incoming Telegram update.
   * @returns True if a handler matches.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const key = this.getKey(update);
    if (!key) return false;

    const currentState = this.conversations.get(key);

    if (currentState === undefined || currentState === ConversationHandler.END) {
      // Not in conversation: check entry_points
      for (const handler of this.entry_points) {
        if (await handler.checkUpdate(update)) {
          this.matchState.set(update, { handler, key });
          return true;
        }
      }
      return false;
    }

    // Currently in a conversation state
    // If allow_reentry is enabled, check entry_points first
    if (this.allow_reentry) {
      for (const handler of this.entry_points) {
        if (await handler.checkUpdate(update)) {
          this.matchState.set(update, { handler, key });
          return true;
        }
      }
    }

    // Check state handlers for current state
    const stateHandlers = this.states.get(currentState) ?? [];
    for (const handler of stateHandlers) {
      if (await handler.checkUpdate(update)) {
        this.matchState.set(update, { handler, key });
        return true;
      }
    }

    // Check fallbacks
    for (const handler of this.fallbacks) {
      if (await handler.checkUpdate(update)) {
        this.matchState.set(update, { handler, key });
        return true;
      }
    }

    return false;
  }

  /**
   * Dispatches the update to the matched handler and updates conversation state.
   *
   * @param update - Incoming Telegram update.
   * @param context - Callback context for this update.
   * @returns The next state (or {@link ConversationHandler.END}/{@link ConversationHandler.TIMEOUT}) returned by the matched handler callback.
   */
  async handleUpdate(update: Update, context: C): Promise<number | string | undefined> {
    const match = this.matchState.get(update);
    if (!match) {
      return;
    }
    this.matchState.delete(update);

    const { handler, key } = match;
    const nextState = (await handler.handleUpdate(update, context)) as number | string | undefined;

    if (nextState === ConversationHandler.END) {
      this.conversations.delete(key);
    } else if (nextState !== undefined) {
      this.conversations.set(key, nextState);
    }

    // If mapped to parent
    if (this.map_to_parent && nextState !== undefined && nextState in this.map_to_parent) {
      return this.map_to_parent[nextState];
    }

    return nextState;
  }
}
