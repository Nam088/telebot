/**
 * In-memory persistence backend.
 *
 * @packageDocumentation
 */

import type { Persistence, PersistedJob } from "./driver.js";

export type { Persistence, PersistedJob };

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
