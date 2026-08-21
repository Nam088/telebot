/**
 * Generic Session Middleware and In-Memory / Persistent Session Storage.
 *
 * @packageDocumentation
 */

import type { CallbackContext } from "../kernel/context.js";
import type { MiddlewareFn } from "../kernel/dispatcher.js";

/**
 * Storage adapter interface for reading, writing, and deleting session data.
 *
 * @typeParam S - Shape of the session data.
 */
export interface SessionStorage<S> {
  /** Retrieves session data for the given key. */
  read: (key: string) => Promise<S | undefined> | S | undefined;
  /** Saves session data for the given key. */
  write: (key: string, value: S) => Promise<void> | void;
  /** Deletes session data for the given key. */
  delete: (key: string) => Promise<void> | void;
}

/**
 * In-memory implementation of {@link SessionStorage}.
 *
 * @typeParam S - Shape of the session data.
 */
export class MemorySessionStorage<S = Record<string, unknown>> implements SessionStorage<S> {
  private readonly store = new Map<string, S>();

  /**
   * Reads session data from memory.
   *
   * @param key - Storage key.
   * @returns Session data or `undefined`.
   */
  public read(key: string): S | undefined {
    const data = this.store.get(key);
    if (data === undefined) return undefined;
    return JSON.parse(JSON.stringify(data)) as S;
  }

  /**
   * Writes session data to memory.
   *
   * @param key - Storage key.
   * @param value - Session value to save.
   */
  public write(key: string, value: S): void {
    this.store.set(key, JSON.parse(JSON.stringify(value)) as S);
  }

  /**
   * Deletes session data from memory.
   *
   * @param key - Storage key.
   */
  public delete(key: string): void {
    this.store.delete(key);
  }
}

/**
 * Options for configuring {@link session} middleware.
 *
 * @typeParam S - Shape of the session data.
 */
export interface SessionOptions<S> {
  /** Factory function returning initial state for new sessions. */
  initial?: () => S;
  /** Custom session key generator function. Default: extracts user ID or chat ID. */
  getSessionKey?: (context: CallbackContext) => string | undefined;
  /** Storage backend instance. Default: {@link MemorySessionStorage}. */
  storage?: SessionStorage<S>;
  /** Key prefix for namespacing session records. Default: `"session:"`. */
  prefix?: string;
}

/**
 * Creates a session management middleware.
 *
 * Automatically loads user or chat session state before handlers execute, exposes `context.session`,
 * and persists modified state after execution finishes.
 *
 * @typeParam S - Structure of the session state.
 * @param options - Configuration options for initial state and storage backend.
 * @returns A {@link MiddlewareFn} ready to be used with `app.use()`.
 *
 * @example
 * ```ts
 * interface MySession {
 *   count: number;
 * }
 *
 * app.use(session<MySession>({
 *   initial: () => ({ count: 0 }),
 * }));
 *
 * app.addHandler(new CommandHandler("counter", async (update, context) => {
 *   const session = (context as any).session as MySession;
 *   session.count++;
 *   await context.bot.sendMessage({
 *     chat_id: update.effective_chat!.id,
 *     text: `You have called this command ${session.count} times!`,
 *   });
 * }));
 * ```
 */
export function session<S = Record<string, unknown>>(options: SessionOptions<S> = {}): MiddlewareFn {
  const initial = options.initial;
  const storage = options.storage ?? new MemorySessionStorage<S>();
  const prefix = options.prefix ?? "session:";
  const getSessionKey =
    options.getSessionKey ??
    ((ctx) => {
      const userId = ctx.update?.effective_user?.id;
      if (userId !== undefined) return `user:${userId}`;
      const chatId = ctx.update?.effective_chat?.id;
      if (chatId !== undefined) return `chat:${chatId}`;
      return undefined;
    });

  return async (context: CallbackContext, next: () => Promise<void>): Promise<void> => {
    const key = getSessionKey(context);
    if (!key) {
      await next();
      return;
    }

    const fullKey = `${prefix}${key}`;
    const stored = await storage.read(fullKey);
    const sessionData: S | undefined = stored ?? (initial ? initial() : undefined);

    // Attach to context
    (context as unknown as { session?: S }).session = sessionData;

    await next();

    // Persist changes
    const currentSession = (context as unknown as { session?: S }).session;
    if (currentSession !== undefined) {
      await storage.write(fullKey, currentSession);
    }
  };
}
