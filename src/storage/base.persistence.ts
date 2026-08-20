import { Persistence, PersistedJob } from "./types.js";

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
