/**
 * Linear Async/Await Conversation System types and errors.
 *
 * @packageDocumentation
 */

import type { Update } from "../../kernel/update.js";
import type { CallbackContext } from "../../kernel/context.js";
import type { Message, CallbackQuery } from "../../client/types.js";
import type { BaseFilter } from "../../filters/base.js";
import type { AsyncConversation } from "./conversation.js";

/**
 * Thrown when an asynchronous conversation step exceeds its allocated wait timeout.
 */
export class ConversationTimeoutError extends Error {
  constructor(message: string = "Conversation step timed out waiting for user response.") {
    super(message);
    this.name = "ConversationTimeoutError";
  }
}

/**
 * Internal control signal used to cleanly exit an active conversation flow early.
 */
export class ConversationExitSignal extends Error {
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
  /** Maximum duration in milliseconds to wait before rejecting with {@link ConversationTimeoutError}. */
  timeoutMs?: number;
}

/**
 * Options for waiting on incoming messages.
 */
export interface WaitForMessageOptions extends WaitOptions {
  /** Optional {@link BaseFilter} to restrict accepted messages. */
  filter?: BaseFilter;
}

/**
 * Options for waiting on incoming callback queries.
 */
export interface WaitForCallbackQueryOptions extends WaitOptions {
  /** Optional string or RegExp pattern to match against `callback_query.data`. */
  pattern?: string | RegExp;
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
  predicate?: UpdatePredicate;
  resolve: (update: Update) => void;
  reject: (error: Error) => void;
}
