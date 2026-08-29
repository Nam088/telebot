/**
 * Application lifecycle, persistence initialization, and state flushing helpers.
 *
 * @packageDocumentation
 */

import type { Persistence } from "../storage/index.js";
import { ConversationHandler } from "../routing/conversation.js";
import type { BaseHandler } from "../routing/handlers.js";
import type { JobQueue } from "../scheduler/queue.js";

/**
 * Restores persisted conversation states and scheduled jobs from persistence backend.
 */
export async function restoreApplicationState(
  persistence: Persistence,
  handlers: Map<number, BaseHandler[]>,
  scheduler: JobQueue,
): Promise<void> {
  const storedConversations = await persistence.getConversations();
  for (const groupHandlers of handlers.values()) {
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

  // Restore persistent scheduled jobs
  const persistedJobs = await persistence.getJobs();
  if (persistedJobs.length > 0) {
    scheduler.restoreFromPersistedJobs(persistedJobs);
  }
}

/**
 * Flushes active scheduled jobs to persistence backend on shutdown.
 */
export async function flushApplicationState(
  persistence: Persistence,
  scheduler: JobQueue,
): Promise<void> {
  const persistedJobs = scheduler.toPersistedJobs();
  await persistence.setJobs(persistedJobs);
  scheduler.stop();
}
