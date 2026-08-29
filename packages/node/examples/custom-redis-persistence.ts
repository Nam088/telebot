/**
 * Custom Redis Persistence Driver Example.
 *
 * Demonstrates creating a high-performance in-memory caching and session store
 * for distributed Telegram bots using Redis (ioredis / redis-client style).
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/custom-redis-persistence.ts
 */

import {
  Application,
  CommandHandler,
  MessageHandler,
  filters,
  type Persistence,
  type PersistedJob,
  type Update,
  type CallbackContext,
} from "../src/index.js";

// --- 1. Custom Redis Persistence Adapter ---
export class RedisPersistence implements Persistence {
  // In a real application, you pass your Redis client:
  // constructor(private readonly redis: Redis) {}
  private readonly memoryStore = new Map<string, string>();

  async getUserData(userId: number): Promise<Record<string, unknown>> {
    // Redis equivalent: const data = await this.redis.get(`bot:user:${userId}`);
    const raw = this.memoryStore.get(`bot:user:${userId}`);
    return raw ? JSON.parse(raw) : {};
  }

  async setUserData(userId: number, data: Record<string, unknown>): Promise<void> {
    // Redis equivalent: await this.redis.set(`bot:user:${userId}`, JSON.stringify(data));
    this.memoryStore.set(`bot:user:${userId}`, JSON.stringify(data));
  }

  async getChatData(chatId: number | string): Promise<Record<string, unknown>> {
    // Redis equivalent: const data = await this.redis.get(`bot:chat:${chatId}`);
    const raw = this.memoryStore.get(`bot:chat:${chatId}`);
    return raw ? JSON.parse(raw) : {};
  }

  async setChatData(chatId: number | string, data: Record<string, unknown>): Promise<void> {
    // Redis equivalent: await this.redis.set(`bot:chat:${chatId}`, JSON.stringify(data));
    this.memoryStore.set(`bot:chat:${chatId}`, JSON.stringify(data));
  }

  async getBotData(): Promise<Record<string, unknown>> {
    const raw = this.memoryStore.get("bot:global_data");
    return raw ? JSON.parse(raw) : {};
  }

  async setBotData(data: Record<string, unknown>): Promise<void> {
    this.memoryStore.set("bot:global_data", JSON.stringify(data));
  }

  async getConversations(): Promise<Map<string, number | string>> {
    // Redis equivalent: const entries = await this.redis.hgetall("bot:conversations");
    const raw = this.memoryStore.get("bot:conversations");
    const map = new Map<string, number | string>();
    if (raw) {
      const obj = JSON.parse(raw);
      for (const [k, v] of Object.entries(obj)) {
        map.set(k, v as number | string);
      }
    }
    return map;
  }

  async updateConversation(key: string, state: number | string): Promise<void> {
    const convs = await this.getConversations();
    convs.set(key, state);
    const obj = Object.fromEntries(convs.entries());
    this.memoryStore.set("bot:conversations", JSON.stringify(obj));
  }

  async getJobs(): Promise<PersistedJob[]> {
    const raw = this.memoryStore.get("bot:jobs");
    return raw ? JSON.parse(raw) : [];
  }

  async setJobs(jobs: PersistedJob[]): Promise<void> {
    this.memoryStore.set("bot:jobs", JSON.stringify(jobs));
  }
}

// --- 2. Attach Custom RedisPersistence to telebot-ts Application ---
const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN";
const redisPersistence = new RedisPersistence();

const app = new Application(token, {
  persistence: redisPersistence,
});

app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const user = update.effective_user?.first_name ?? "User";
    const visits = ((context.user_data["visits"] as number) || 0) + 1;
    context.user_data["visits"] = visits;

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Hello ${user}! Session visits tracked in Redis: ${visits}`,
    });
  }),
);

app.addHandler(
  new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update, context) => {
    const totalMsgs = ((context.chat_data["total_messages"] as number) || 0) + 1;
    context.chat_data["total_messages"] = totalMsgs;

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Chat total messages recorded in Redis: ${totalMsgs}`,
    });
  }),
);

console.log("Redis Custom Persistence example initialized.");
