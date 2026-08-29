/**
 * Async conversation manager and routing orchestration.
 *
 * @packageDocumentation
 */

import type { Update } from "../../kernel/update.js";
import type { CallbackContext } from "../../kernel/context.js";
import { AsyncConversation } from "./conversation.js";
import {
  ConversationExitSignal,
  type AsyncConversationHandlerFn,
  type PendingWait,
} from "./types.js";

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

  public register(name: string, handler: AsyncConversationHandlerFn): void {
    if (!name || name.trim().length === 0) {
      throw new TypeError("Conversation name must be a non-empty string.");
    }
    this.handlers.set(name.trim(), handler);
  }

  public getSessionKey(userId?: number, chatId?: number | string): string {
    const u = userId !== undefined ? String(userId) : "none";
    const c = chatId !== undefined ? String(chatId) : "none";
    return `${c}:${u}`;
  }

  public hasActiveSession(userId?: number, chatId?: number | string): boolean {
    const key = this.getSessionKey(userId, chatId);
    return this.activeSessions.has(key);
  }

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

  constructor(context: CallbackContext, manager?: AsyncConversationManager) {
    this.context = context;
    this.manager = manager;
  }

  public async enter(name: string): Promise<void> {
    if (!this.manager) {
      throw new Error("Conversation manager is not initialized on this application.");
    }
    await this.manager.enter(name, this.context);
  }

  public get active(): boolean {
    if (!this.manager) return false;
    return this.manager.hasActiveSession(
      this.context.update?.effective_user?.id,
      this.context.update?.effective_chat?.id,
    );
  }
}
