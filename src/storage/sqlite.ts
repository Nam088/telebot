/**
 * SQLite-backed persistence driver via Node.js native `node:sqlite`.
 *
 * @packageDocumentation
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";
import type { Persistence, PersistedJob } from "./driver.js";

const require = createRequire(import.meta.url);
const { DatabaseSync: NodeDatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (path: string) => {
    exec(sql: string): void;
    prepare(sql: string): {
      get(...params: any[]): any;
      all(...params: any[]): any[];
      run(...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint };
    };
  };
};

/**
 * Configuration options for {@link SqlitePersistence}.
 */
export interface SqlitePersistenceOptions {
  /**
   * Database file path (e.g. `./data/bot.sqlite`) or `":memory:"`.
   */
  dbPath: string;
}

/**
 * Robust database persistence using Node.js 22+ built-in `node:sqlite` module (`DatabaseSync`).
 *
 * Stores user, chat, bot, conversation, and job state in SQLite tables.
 *
 * @example
 * ```ts
 * const persistence = new SqlitePersistence({ dbPath: "./data/bot.sqlite" });
 * ```
 */
export class SqlitePersistence implements Persistence {
  private readonly db: InstanceType<typeof NodeDatabaseSync>;

  /**
   * Creates a new instance of {@link SqlitePersistence}.
   *
   * @param options - Configuration options specifying database path.
   */
  constructor(options: SqlitePersistenceOptions) {
    if (options.dbPath !== ":memory:") {
      const dir = path.dirname(options.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new NodeDatabaseSync(options.dbPath);
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id INTEGER PRIMARY KEY,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS chat_data (
        chat_id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS bot_data (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS conversations (
        key TEXT PRIMARY KEY,
        state TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS jobs (
        name TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
    `);
  }

  /**
   * Retrieves user data for the given user ID.
   *
   * @param userId - Telegram user ID.
   * @returns Key-value map of user data.
   */
  async getUserData(userId: number): Promise<Record<string, unknown>> {
    const stmt = this.db.prepare("SELECT data FROM user_data WHERE user_id = ?");
    const row = stmt.get(userId) as { data: string } | undefined;
    if (!row) {
      return {};
    }
    try {
      return JSON.parse(row.data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  /**
   * Stores user data for the given user ID.
   *
   * @param userId - Telegram user ID.
   * @param data - Key-value map to store.
   * @returns Resolves when saved.
   */
  async setUserData(userId: number, data: Record<string, unknown>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO user_data (user_id, data)
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET data = excluded.data
    `);
    stmt.run(userId, JSON.stringify(data));
  }

  /**
   * Retrieves chat data for the given chat ID.
   *
   * @param chatId - Telegram chat ID.
   * @returns Key-value map of chat data.
   */
  async getChatData(chatId: number | string): Promise<Record<string, unknown>> {
    const stmt = this.db.prepare("SELECT data FROM chat_data WHERE chat_id = ?");
    const row = stmt.get(String(chatId)) as { data: string } | undefined;
    if (!row) {
      return {};
    }
    try {
      return JSON.parse(row.data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  /**
   * Stores chat data for the given chat ID.
   *
   * @param chatId - Telegram chat ID.
   * @param data - Key-value map to store.
   * @returns Resolves when saved.
   */
  async setChatData(chatId: number | string, data: Record<string, unknown>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO chat_data (chat_id, data)
      VALUES (?, ?)
      ON CONFLICT(chat_id) DO UPDATE SET data = excluded.data
    `);
    stmt.run(String(chatId), JSON.stringify(data));
  }

  /**
   * Retrieves global bot data.
   *
   * @returns Key-value map of bot data.
   */
  async getBotData(): Promise<Record<string, unknown>> {
    const stmt = this.db.prepare("SELECT data FROM bot_data WHERE id = 1");
    const row = stmt.get() as { data: string } | undefined;
    if (!row) {
      return {};
    }
    try {
      return JSON.parse(row.data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  /**
   * Stores global bot data.
   *
   * @param data - Key-value map to store.
   * @returns Resolves when saved.
   */
  async setBotData(data: Record<string, unknown>): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO bot_data (id, data)
      VALUES (1, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data
    `);
    stmt.run(JSON.stringify(data));
  }

  /**
   * Retrieves all active conversation states.
   *
   * @returns Map of conversation keys to states.
   */
  async getConversations(): Promise<Map<string, number | string>> {
    const stmt = this.db.prepare("SELECT key, state FROM conversations");
    const rows = stmt.all() as Array<{ key: string; state: string }>;
    const map = new Map<string, number | string>();
    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.state);
        map.set(row.key, parsed);
      } catch {
        map.set(row.key, row.state);
      }
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
    const stmt = this.db.prepare(`
      INSERT INTO conversations (key, state)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET state = excluded.state
    `);
    stmt.run(key, JSON.stringify(state));
  }

  /**
   * Retrieves persisted jobs.
   *
   * @returns List of persisted jobs.
   */
  async getJobs(): Promise<PersistedJob[]> {
    const stmt = this.db.prepare("SELECT data FROM jobs");
    const rows = stmt.all() as Array<{ data: string }>;
    const jobs: PersistedJob[] = [];
    for (const row of rows) {
      try {
        jobs.push(JSON.parse(row.data) as PersistedJob);
      } catch {
        // Ignore malformed rows
      }
    }
    return jobs;
  }

  /**
   * Overwrites persisted jobs.
   *
   * @param jobs - List of persisted jobs.
   * @returns Resolves when saved.
   */
  async setJobs(jobs: PersistedJob[]): Promise<void> {
    this.db.exec("BEGIN TRANSACTION");
    try {
      this.db.exec("DELETE FROM jobs");
      const stmt = this.db.prepare("INSERT INTO jobs (name, data) VALUES (?, ?)");
      for (const job of jobs) {
        stmt.run(job.name, JSON.stringify(job));
      }
      this.db.exec("COMMIT");
    } catch (err) {
      this.db.exec("ROLLBACK");
      throw err;
    }
  }

  /**
   * Flushes any pending operations.
   */
  async flush(): Promise<void> {
    // SQLite synchronous transactions write to disk on commit
  }
}
