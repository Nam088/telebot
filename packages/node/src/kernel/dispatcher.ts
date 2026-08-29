/**
 * Update processing pipeline and state synchronization dispatcher.
 *
 * @packageDocumentation
 */

import { Update } from "./update.js";
import type { RawUpdate } from "../client/types.js";
import { CallbackContext } from "./context.js";
import { BaseHandler } from "../routing/handlers.js";
import { ConversationHandler } from "../routing/conversation.js";
import type { Persistence } from "../storage/index.js";
import type { JobQueue } from "../scheduler/queue.js";
import type { Bot } from "../client/bot.js";
import type { ErrorHandlerCallback } from "./app.js";

/**
 * Executes the state-locked critical section preventing lost updates.
 */
export async function withStateLock<T>(
  stateLocks: Map<string, Promise<void>>,
  keys: string[],
  fn: () => Promise<T>,
): Promise<T> {
  if (keys.length === 0) {
    return fn();
  }

  const releases: Array<() => void> = [];
  for (const key of [...new Set(keys)].sort()) {
    const previous = stateLocks.get(key) ?? Promise.resolve();
    let release!: () => void;
    const tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    stateLocks.set(key, tail);
    releases.push(() => {
      release();
      if (stateLocks.get(key) === tail) {
        stateLocks.delete(key);
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
 * Middleware function signature for intercepting updates.
 *
 * @typeParam C - Type of the callback context.
 */
export type MiddlewareFn<C extends CallbackContext = CallbackContext> = (
  context: C,
  next: () => Promise<void>,
) => Promise<void> | void;

/**
 * Dispatches an incoming raw update through the middleware chain and handler pipeline.
 */
export async function dispatchUpdate(
  rawUpdate: RawUpdate | Record<string, unknown>,
  bot: Bot,
  job_queue: JobQueue,
  persistence: Persistence,
  handlers: Map<number, BaseHandler[]>,
  errorHandlers: ErrorHandlerCallback[],
  stateLocks: Map<string, Promise<void>>,
  middlewares: MiddlewareFn[] = [],
  conversationManager?: import("../routing/index.js").AsyncConversationManager,
): Promise<void> {
  const update = rawUpdate instanceof Update ? rawUpdate : new Update(rawUpdate as RawUpdate);

  const userId = update.effective_user?.id;
  const chatId = update.effective_chat?.id;

  const lockKeys: string[] = [];
  if (userId !== undefined) lockKeys.push(`user:${userId}`);
  if (chatId !== undefined) lockKeys.push(`chat:${chatId}`);

  await withStateLock(stateLocks, lockKeys, async () => {
    const botData = await persistence.getBotData();
    let userData: Record<string, unknown> | undefined;
    let chatData: Record<string, unknown> | undefined;

    if (userId !== undefined) {
      userData = await persistence.getUserData(userId);
    }

    if (chatId !== undefined) {
      chatData = await persistence.getChatData(chatId);
    }

    const context = new CallbackContext({
      bot,
      job_queue,
      user_data: userData,
      chat_data: chatData,
      bot_data: botData,
      update,
      conversationManager,
    });

    const runHandlers = async (): Promise<void> => {
      // Check active async conversation sessions first
      if (conversationManager) {
        try {
          const handled = await conversationManager.handleUpdate(update);
          if (handled) {
            return;
          }
        } catch (convErr: unknown) {
          const error = convErr instanceof Error ? convErr : new Error(String(convErr));
          context.error = error;
          for (const errHandler of errorHandlers) {
            try {
              await errHandler(error, update, context);
            } catch (ehErr) {
              console.error("Error in error handler:", ehErr);
            }
          }
          context.error = undefined;
          return;
        }
      }

      const sortedGroups = Array.from(handlers.keys()).sort((a, b) => a - b);

      for (const group of sortedGroups) {
        const handlersInGroup = handlers.get(group) || [];
        for (const handler of handlersInGroup) {
          try {
            const match = await handler.checkUpdate(update);
            if (match) {
              await handler.handleUpdate(update, context);

              // Sync persistent ConversationHandler changes
              if (handler instanceof ConversationHandler && handler.persistent) {
                for (const [key, state] of handler.conversations.entries()) {
                  await persistence.updateConversation(key, state);
                }
              }

              break; // Stop at first matching handler in this group
            }
          } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            context.error = error;
            for (const errHandler of errorHandlers) {
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
    };

    if (middlewares.length > 0) {
      let index = 0;
      const dispatchMiddleware = async (): Promise<void> => {
        if (index < middlewares.length) {
          const mw = middlewares[index++];
          if (mw) {
            await mw(context, dispatchMiddleware);
          }
        } else {
          await runHandlers();
        }
      };
      await dispatchMiddleware();
    } else {
      await runHandlers();
    }

    // Auto-save modified state to persistence
    if (userId !== undefined && userData !== undefined) {
      await persistence.setUserData(userId, userData);
    }
    if (chatId !== undefined && chatData !== undefined) {
      await persistence.setChatData(chatId, chatData);
    }
    if (botData !== undefined) {
      await persistence.setBotData(botData);
    }

    if (persistence.flush) {
      await persistence.flush();
    }
  });
}
