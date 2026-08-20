/**
 * Custom PostgreSQL Persistence Driver Example.
 *
 * Demonstrates how a developer can easily create their own Persistence adapter
 * for PostgreSQL, MySQL, Redis, MongoDB, or Prisma by implementing the standard
 * `Persistence` interface without modifying the core library.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/custom-postgres-persistence.ts
 */

import {
  Application,
  CommandHandler,
  type Persistence,
  type PersistedJob,
  type Update,
  type CallbackContext,
} from "../src/index.js";

// --- 1. Developer implements the standard Persistence interface ---
export class PostgresPersistence implements Persistence {
  // In a real application, you pass your `pg.Pool` or `prisma` instance here:
  // constructor(private readonly pool: Pool) {}
  private readonly memoryCache = new Map<string, any>();

  async getUserData(userId: number): Promise<Record<string, unknown>> {
    // Example PostgreSQL Query:
    // const res = await this.pool.query("SELECT data FROM bot_user_data WHERE user_id = $1", [userId]);
    // return res.rows[0]?.data ?? {};
    return this.memoryCache.get(`user:${userId}`) ?? {};
  }

  async setUserData(userId: number, data: Record<string, unknown>): Promise<void> {
    // Example PostgreSQL Query:
    // await this.pool.query(
    //   "INSERT INTO bot_user_data(user_id, data) VALUES($1, $2) ON CONFLICT (user_id) DO UPDATE SET data = $2",
    //   [userId, JSON.stringify(data)]
    // );
    this.memoryCache.set(`user:${userId}`, data);
  }

  async getChatData(chatId: number | string): Promise<Record<string, unknown>> {
    return this.memoryCache.get(`chat:${chatId}`) ?? {};
  }

  async setChatData(chatId: number | string, data: Record<string, unknown>): Promise<void> {
    this.memoryCache.set(`chat:${chatId}`, data);
  }

  async getBotData(): Promise<Record<string, unknown>> {
    return this.memoryCache.get("bot_data") ?? {};
  }

  async setBotData(data: Record<string, unknown>): Promise<void> {
    this.memoryCache.set("bot_data", data);
  }

  async getConversations(): Promise<Map<string, number | string>> {
    return this.memoryCache.get("conversations") ?? new Map();
  }

  async updateConversation(key: string, state: number | string): Promise<void> {
    const convs: Map<string, number | string> = await this.getConversations();
    convs.set(key, state);
    this.memoryCache.set("conversations", convs);
  }

  async getJobs(): Promise<PersistedJob[]> {
    return this.memoryCache.get("jobs") ?? [];
  }

  async setJobs(jobs: PersistedJob[]): Promise<void> {
    this.memoryCache.set("jobs", jobs);
  }
}

// --- 2. Pass the custom PostgresPersistence adapter into the Application ---
const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN";
const postgresPersistence = new PostgresPersistence();

const app = new Application(token, {
  persistence: postgresPersistence,
});

app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    // context.user_data is now automatically read and saved via PostgresPersistence
    const count = ((context.user_data["visits"] as number) || 0) + 1;
    context.user_data["visits"] = count;

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Welcome! You have visited ${count} times (saved in PostgreSQL).`,
    });
  })
);

console.log("Custom PostgreSQL Persistence example initialized successfully.");
