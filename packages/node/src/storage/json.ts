/**
 * JSON file-backed persistence driver.
 *
 * @packageDocumentation
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { Persistence, PersistedJob } from "./driver.js";

/**
 * Options for configuring {@link JsonFilePersistence}.
 */
export interface JsonFilePersistenceOptions {
  /**
   * File path where JSON state is stored.
   */
  filePath: string;
}

interface StoredData {
  userData: Record<string, Record<string, unknown>>;
  chatData: Record<string, Record<string, unknown>>;
  botData: Record<string, unknown>;
  conversations: Record<string, number | string>;
  jobs: PersistedJob[];
}

/**
 * Persists user data, chat data, bot data, conversation states, and jobs to a single JSON file.
 *
 * @example
 * ```ts
 * const persistence = new JsonFilePersistence({ filePath: "./data/state.json" });
 * ```
 */
export class JsonFilePersistence implements Persistence {
  private readonly filePath: string;
  private data: StoredData;

  /**
   * Creates a new instance of {@link JsonFilePersistence}.
   *
   * @param options - Configuration options specifying file path.
   */
  constructor(options: JsonFilePersistenceOptions) {
    this.filePath = options.filePath;
    this.data = {
      userData: {},
      chatData: {},
      botData: {},
      conversations: {},
      jobs: [],
    };
    this.load();
  }

  private load(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const content = fs.readFileSync(this.filePath, "utf-8");
        if (content.trim()) {
          const parsed = JSON.parse(content) as Partial<StoredData>;
          this.data = {
            userData: parsed.userData ?? {},
            chatData: parsed.chatData ?? {},
            botData: parsed.botData ?? {},
            conversations: parsed.conversations ?? {},
            jobs: parsed.jobs ?? [],
          };
        }
      } catch (err) {
        console.error(`Failed to load JSON persistence from ${this.filePath}:`, err);
      }
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpPath = `${this.filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tmpPath, this.filePath);
    } catch (err) {
      console.error(`Failed to save JSON persistence to ${this.filePath}:`, err);
    }
  }

  /**
   * Retrieves user data for the given user ID.
   *
   * @param userId - Telegram user ID.
   * @returns Key-value map of user data.
   */
  async getUserData(userId: number): Promise<Record<string, unknown>> {
    const key = String(userId);
    if (!this.data.userData[key]) {
      this.data.userData[key] = {};
    }
    return this.data.userData[key]!;
  }

  /**
   * Stores user data for the given user ID.
   *
   * @param userId - Telegram user ID.
   * @param data - Key-value map to store.
   * @returns Resolves when saved.
   */
  async setUserData(userId: number, data: Record<string, unknown>): Promise<void> {
    this.data.userData[String(userId)] = data;
    this.save();
  }

  /**
   * Retrieves chat data for the given chat ID.
   *
   * @param chatId - Telegram chat ID.
   * @returns Key-value map of chat data.
   */
  async getChatData(chatId: number | string): Promise<Record<string, unknown>> {
    const key = String(chatId);
    if (!this.data.chatData[key]) {
      this.data.chatData[key] = {};
    }
    return this.data.chatData[key]!;
  }

  /**
   * Stores chat data for the given chat ID.
   *
   * @param chatId - Telegram chat ID.
   * @param data - Key-value map to store.
   * @returns Resolves when saved.
   */
  async setChatData(chatId: number | string, data: Record<string, unknown>): Promise<void> {
    this.data.chatData[String(chatId)] = data;
    this.save();
  }

  /**
   * Retrieves global bot data.
   *
   * @returns Key-value map of bot data.
   */
  async getBotData(): Promise<Record<string, unknown>> {
    return this.data.botData;
  }

  /**
   * Stores global bot data.
   *
   * @param data - Key-value map to store.
   * @returns Resolves when saved.
   */
  async setBotData(data: Record<string, unknown>): Promise<void> {
    this.data.botData = data;
    this.save();
  }

  /**
   * Retrieves all active conversation states.
   *
   * @returns Map of conversation keys to states.
   */
  async getConversations(): Promise<Map<string, number | string>> {
    const map = new Map<string, number | string>();
    for (const [key, val] of Object.entries(this.data.conversations)) {
      map.set(key, val);
    }
    return map;
  }

  /**
   * Updates state for a conversation key.
   *
   * @param key - Conversation identifier.
   * @param state - Current step/state.
   * @returns Resolves when saved.
   */
  async updateConversation(key: string, state: number | string): Promise<void> {
    this.data.conversations[key] = state;
    this.save();
  }

  /**
   * Deletes user data for the given user ID.
   *
   * @param userId - Telegram user ID.
   */
  async deleteUserData(userId: number): Promise<void> {
    delete this.data.userData[String(userId)];
    this.save();
  }

  /**
   * Deletes chat data for the given chat ID.
   *
   * @param chatId - Telegram chat ID.
   */
  async deleteChatData(chatId: number | string): Promise<void> {
    delete this.data.chatData[String(chatId)];
    this.save();
  }

  /**
   * Deletes state for a conversation key.
   *
   * @param key - Conversation identifier.
   */
  async deleteConversation(key: string): Promise<void> {
    delete this.data.conversations[key];
    this.save();
  }

  /**
   * Retrieves persisted jobs.
   *
   * @returns List of persisted jobs.
   */
  async getJobs(): Promise<PersistedJob[]> {
    return [...this.data.jobs];
  }

  /**
   * Overwrites persisted jobs.
   *
   * @param jobs - List of persisted jobs.
   * @returns Resolves when saved.
   */
  async setJobs(jobs: PersistedJob[]): Promise<void> {
    this.data.jobs = [...jobs];
    this.save();
  }

  /**
   * Flushes any pending disk updates.
   */
  async flush(): Promise<void> {
    this.save();
  }
}
