/**
 * Long-polling update retrieval loop.
 *
 * @packageDocumentation
 */

import type { Bot } from "../client/bot.js";
import type { ErrorHandlerCallback } from "./app.js";

/**
 * Options for long-polling loop.
 */
export interface PollingLoopOptions {
  /** List of update types to receive (e.g. `["message", "callback_query"]`). */
  allowed_updates?: string[];
  /** Timeout in seconds for long polling wait on Telegram servers (default: `10`). */
  timeout?: number;
  /** Milliseconds to wait between polling requests (default: `0`). */
  poll_interval?: number;
  /** Whether to drop updates pending from when bot was offline (default: `false`). */
  drop_pending_updates?: boolean;
}

/**
 * Executes the continuous long-polling loop until stopped.
 *
 * @param bot - Bot API client instance.
 * @param options - Polling options.
 * @param isRunning - Predicate checking if app should continue running.
 * @param onUpdate - Callback invoked for each update received.
 * @param errorHandlers - Array of global error handler callbacks.
 */
export async function runPollingLoop(
  bot: Bot,
  options: PollingLoopOptions,
  isRunning: () => boolean,
  onUpdate: (update: Record<string, unknown>) => Promise<void>,
  errorHandlers: ErrorHandlerCallback[],
): Promise<void> {
  let offset = 0;

  if (options.drop_pending_updates) {
    const updates = await bot.getUpdates({ offset: -1, timeout: 0 });
    if (updates.length > 0) {
      offset = updates[updates.length - 1]!.update_id + 1;
    }
  }

  const timeout = options.timeout ?? 10;
  const pollInterval = options.poll_interval ?? 0;

  while (isRunning()) {
    try {
      const updates = await bot.getUpdates({
        offset,
        timeout,
        allowed_updates: options.allowed_updates,
      });

      for (const update of updates) {
        if (!isRunning()) break;
        offset = update.update_id + 1;
        await onUpdate(update as unknown as Record<string, unknown>);
      }
    } catch (err: unknown) {
      if (!isRunning()) break;
      const error = err instanceof Error ? err : new Error(String(err));
      for (const errHandler of errorHandlers) {
        try {
          await errHandler(error);
        } catch (ehErr) {
          console.error("Error in polling error handler:", ehErr);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (pollInterval > 0 && isRunning()) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }
}
