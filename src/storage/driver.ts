/**
 * Storage driver interface and persisted types.
 *
 * @packageDocumentation
 */

/**
 * Representation of a scheduled job stored in persistence.
 */
export interface PersistedJob {
  /**
   * Unique name of the job.
   */
  name: string;
  /**
   * Epoch timestamp (in milliseconds) for the job's next execution.
   */
  nextRun: number;
  /**
   * Optional recurrence interval in milliseconds.
   */
  interval?: number;
  /**
   * Optional serializable custom payload passed to the job callback.
   */
  data?: unknown;
}

/**
 * Contract for bot state persistence backends.
 *
 * Enables storing and retrieving user data, chat data, bot data, conversation states,
 * and scheduled background jobs across bot restarts.
 *
 * @example
 * ```ts
 * class MyCustomPersistence implements Persistence {
 *   async getUserData(userId: number) { return {}; }
 *   async setUserData(userId: number, data: Record<string, unknown>) {}
 *   // ... other methods
 * }
 * ```
 */
export interface Persistence {
  /**
   * Retrieves stored user data for a specific user ID.
   *
   * @param userId - Telegram user ID.
   * @returns User data object (returns empty object if none found).
   */
  getUserData(userId: number): Promise<Record<string, unknown>>;

  /**
   * Stores user data for a specific user ID.
   *
   * @param userId - Telegram user ID.
   * @param data - Key-value map of user state.
   * @returns Resolves when data is saved.
   */
  setUserData(userId: number, data: Record<string, unknown>): Promise<void>;

  /**
   * Retrieves stored chat data for a specific chat ID.
   *
   * @param chatId - Telegram chat ID (number or string).
   * @returns Chat data object (returns empty object if none found).
   */
  getChatData(chatId: number | string): Promise<Record<string, unknown>>;

  /**
   * Stores chat data for a specific chat ID.
   *
   * @param chatId - Telegram chat ID (number or string).
   * @param data - Key-value map of chat state.
   * @returns Resolves when data is saved.
   */
  setChatData(chatId: number | string, data: Record<string, unknown>): Promise<void>;

  /**
   * Retrieves global bot data.
   *
   * @returns Bot data object.
   */
  getBotData(): Promise<Record<string, unknown>>;

  /**
   * Stores global bot data.
   *
   * @param data - Key-value map of global bot state.
   * @returns Resolves when data is saved.
   */
  setBotData(data: Record<string, unknown>): Promise<void>;

  /**
   * Retrieves all active conversation states.
   *
   * @returns A map of conversation keys to state values.
   */
  getConversations(): Promise<Map<string, number | string>>;

  /**
   * Updates or saves the state for a specific conversation key.
   *
   * @param key - Conversation key composite (e.g. chat_id + user_id).
   * @param state - Conversation state identifier or step number.
   * @returns Resolves when state is updated.
   */
  updateConversation(key: string, state: number | string): Promise<void>;

  /**
   * Retrieves all persisted scheduled jobs.
   *
   * @returns Array of {@link PersistedJob} definitions.
   */
  getJobs(): Promise<PersistedJob[]>;

  /**
   * Overwrites the list of persisted scheduled jobs.
   *
   * @param jobs - Array of {@link PersistedJob} definitions.
   * @returns Resolves when jobs are saved.
   */
  setJobs(jobs: PersistedJob[]): Promise<void>;

  /**
   * Optional lifecycle hook to flush in-memory buffers to underlying disk or database.
   *
   * @returns Resolves when flushing completes.
   */
  flush?(): Promise<void>;
}
