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
   * Optional method to delete user data for a specific user ID.
   *
   * @param userId - Telegram user ID.
   */
  deleteUserData?(userId: number): Promise<void>;

  /**
   * Optional method to delete chat data for a specific chat ID.
   *
   * @param chatId - Telegram chat ID.
   */
  deleteChatData?(chatId: number | string): Promise<void>;

  /**
   * Optional method to delete conversation state.
   *
   * @param key - Conversation key composite.
   */
  deleteConversation?(key: string): Promise<void>;

  /**
   * Optional lifecycle hook to flush in-memory buffers to underlying disk or database.
   *
   * @returns Resolves when flushing completes.
   */
  flush?(): Promise<void>;
}

/**
 * Base abstract persistence class that handles common serialization and key-value mapping.
 *
 * Extending this class allows writing new database drivers (PostgreSQL, Redis, MongoDB)
 * with minimal boilerplate code.
 *
 * @example
 * ```ts
 * export class SimpleKvPersistence extends BasePersistence {
 *   private store = new Map<string, string>();
 *   protected async getRaw(key: string) { return this.store.get(key) ?? null; }
 *   protected async setRaw(key: string, val: string) { this.store.set(key, val); }
 *   protected async deleteRaw(key: string) { this.store.delete(key); }
 * }
 * ```
 */
export abstract class BasePersistence implements Persistence {
  protected abstract getRaw(key: string): Promise<string | null>;
  protected abstract setRaw(key: string, value: string): Promise<void>;
  protected abstract deleteRaw(key: string): Promise<void>;

  async getUserData(userId: number): Promise<Record<string, unknown>> {
    const raw = await this.getRaw(`user:${userId}`);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  async setUserData(userId: number, data: Record<string, unknown>): Promise<void> {
    await this.setRaw(`user:${userId}`, JSON.stringify(data));
  }

  async deleteUserData(userId: number): Promise<void> {
    await this.deleteRaw(`user:${userId}`);
  }

  async getChatData(chatId: number | string): Promise<Record<string, unknown>> {
    const raw = await this.getRaw(`chat:${chatId}`);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  async setChatData(chatId: number | string, data: Record<string, unknown>): Promise<void> {
    await this.setRaw(`chat:${chatId}`, JSON.stringify(data));
  }

  async deleteChatData(chatId: number | string): Promise<void> {
    await this.deleteRaw(`chat:${chatId}`);
  }

  async getBotData(): Promise<Record<string, unknown>> {
    const raw = await this.getRaw("bot:global_data");
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  async setBotData(data: Record<string, unknown>): Promise<void> {
    await this.setRaw("bot:global_data", JSON.stringify(data));
  }

  async getConversations(): Promise<Map<string, number | string>> {
    const raw = await this.getRaw("bot:conversations");
    const map = new Map<string, number | string>();
    if (!raw) return map;
    try {
      const obj = JSON.parse(raw) as Record<string, number | string>;
      for (const [k, v] of Object.entries(obj)) {
        map.set(k, v);
      }
    } catch {
      // Ignore
    }
    return map;
  }

  async updateConversation(key: string, state: number | string): Promise<void> {
    const convs = await this.getConversations();
    convs.set(key, state);
    const obj = Object.fromEntries(convs.entries());
    await this.setRaw("bot:conversations", JSON.stringify(obj));
  }

  async deleteConversation(key: string): Promise<void> {
    const convs = await this.getConversations();
    convs.delete(key);
    const obj = Object.fromEntries(convs.entries());
    await this.setRaw("bot:conversations", JSON.stringify(obj));
  }

  async getJobs(): Promise<PersistedJob[]> {
    const raw = await this.getRaw("bot:jobs");
    if (!raw) return [];
    try {
      return JSON.parse(raw) as PersistedJob[];
    } catch {
      return [];
    }
  }

  async setJobs(jobs: PersistedJob[]): Promise<void> {
    await this.setRaw("bot:jobs", JSON.stringify(jobs));
  }
}
