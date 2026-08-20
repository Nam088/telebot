/**
 * Persistence interfaces and built-in memory storage backend.
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

/**
 * Default in-memory persistence implementation.
 *
 * Stores user, chat, bot data, and conversation states in memory Maps.
 * Data is reset when the process terminates.
 *
 * @example
 * ```ts
 * import { ApplicationBuilder, MemoryPersistence } from "telegram-bot-node";
 *
 * const app = new ApplicationBuilder()
 *   .token("BOT_TOKEN")
 *   .persistence(new MemoryPersistence())
 *   .build();
 * ```
 */
export class MemoryPersistence implements Persistence {
  private userData = new Map<number, Record<string, unknown>>();
  private chatData = new Map<number | string, Record<string, unknown>>();
  private botData: Record<string, unknown> = {};
  private conversations = new Map<string, number | string>();
  private jobs: PersistedJob[] = [];

  /**
   * Retrieves user data from memory.
   *
   * @param userId - Telegram user ID.
   * @returns The user data record for `userId`.
   */
  async getUserData(userId: number): Promise<Record<string, unknown>> {
    const data = this.userData.get(userId);
    if (!data) {
      const empty = {};
      this.userData.set(userId, empty);
      return empty;
    }
    return data;
  }

  /**
   * Stores user data in memory.
   *
   * @param userId - Telegram user ID.
   * @param data - User data record to store.
   * @returns Resolves when saved in memory.
   */
  async setUserData(userId: number, data: Record<string, unknown>): Promise<void> {
    this.userData.set(userId, data);
  }

  /**
   * Retrieves chat data from memory.
   *
   * @param chatId - Telegram chat ID.
   * @returns The chat data record for `chatId`.
   */
  async getChatData(chatId: number | string): Promise<Record<string, unknown>> {
    const data = this.chatData.get(chatId);
    if (!data) {
      const empty = {};
      this.chatData.set(chatId, empty);
      return empty;
    }
    return data;
  }

  /**
   * Stores chat data in memory.
   *
   * @param chatId - Telegram chat ID.
   * @param data - Chat data record to store.
   * @returns Resolves when saved in memory.
   */
  async setChatData(chatId: number | string, data: Record<string, unknown>): Promise<void> {
    this.chatData.set(chatId, data);
  }

  /**
   * Retrieves bot data from memory.
   *
   * @returns Global bot data record.
   */
  async getBotData(): Promise<Record<string, unknown>> {
    return this.botData;
  }

  /**
   * Stores bot data in memory.
   *
   * @param data - Global bot data record to store.
   * @returns Resolves when saved in memory.
   */
  async setBotData(data: Record<string, unknown>): Promise<void> {
    this.botData = data;
  }

  /**
   * Retrieves a snapshot copy of all active conversation states.
   *
   * @returns A Map clone of conversation states.
   */
  async getConversations(): Promise<Map<string, number | string>> {
    return new Map(this.conversations);
  }

  /**
   * Updates conversation state for the given key in memory.
   *
   * @param key - Conversation composite key.
   * @param state - Current conversation state.
   * @returns Resolves when updated in memory.
   */
  async updateConversation(key: string, state: number | string): Promise<void> {
    this.conversations.set(key, state);
  }

  /**
   * Retrieves a copy of scheduled persisted jobs from memory.
   *
   * @returns An array copy of persisted jobs.
   */
  async getJobs(): Promise<PersistedJob[]> {
    return [...this.jobs];
  }

  /**
   * Overwrites the persisted jobs in memory.
   *
   * @param jobs - Array of persisted jobs.
   * @returns Resolves when updated.
   */
  async setJobs(jobs: PersistedJob[]): Promise<void> {
    this.jobs = [...jobs];
  }
}

