/**
 * Custom Prisma ORM Persistence Driver Example.
 *
 * Demonstrates integrating popular ORMs (like Prisma, Drizzle, TypeORM)
 * with telebot-ts persistence to store bot state in existing production databases.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/custom-prisma-persistence.ts
 */

import {
  Application,
  CommandHandler,
  type Persistence,
  type PersistedJob,
  type Update,
  type CallbackContext,
} from "../src/index.js";

// --- 1. Custom Prisma Persistence Adapter ---
export class PrismaPersistence implements Persistence {
  // In a real application, you pass your PrismaClient instance:
  // constructor(private readonly prisma: PrismaClient) {}
  private readonly localStore = new Map<string, any>();

  async getUserData(userId: number): Promise<Record<string, unknown>> {
    // Example Prisma Query:
    // const record = await this.prisma.userSession.findUnique({ where: { userId } });
    // return (record?.data as Record<string, unknown>) ?? {};
    return this.localStore.get(`user_${userId}`) ?? {};
  }

  async setUserData(userId: number, data: Record<string, unknown>): Promise<void> {
    // Example Prisma Upsert:
    // await this.prisma.userSession.upsert({
    //   where: { userId },
    //   update: { data },
    //   create: { userId, data },
    // });
    this.localStore.set(`user_${userId}`, data);
  }

  async getChatData(chatId: number | string): Promise<Record<string, unknown>> {
    return this.localStore.get(`chat_${chatId}`) ?? {};
  }

  async setChatData(chatId: number | string, data: Record<string, unknown>): Promise<void> {
    this.localStore.set(`chat_${chatId}`, data);
  }

  async getBotData(): Promise<Record<string, unknown>> {
    return this.localStore.get("bot_data") ?? {};
  }

  async setBotData(data: Record<string, unknown>): Promise<void> {
    this.localStore.set("bot_data", data);
  }

  async getConversations(): Promise<Map<string, number | string>> {
    return this.localStore.get("conversations") ?? new Map();
  }

  async updateConversation(key: string, state: number | string): Promise<void> {
    const convs: Map<string, number | string> = await this.getConversations();
    convs.set(key, state);
    this.localStore.set("conversations", convs);
  }

  async getJobs(): Promise<PersistedJob[]> {
    return this.localStore.get("jobs") ?? [];
  }

  async setJobs(jobs: PersistedJob[]): Promise<void> {
    this.localStore.set("jobs", jobs);
  }
}

// --- 2. Pass Prisma Adapter into Application ---
const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN";
const prismaPersistence = new PrismaPersistence();

const app = new Application(token, {
  persistence: prismaPersistence,
});

app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const user = update.effective_user?.first_name ?? "User";
    const balance = ((context.user_data["credits"] as number) || 100) + 10;
    context.user_data["credits"] = balance;

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Hello ${user}! User data saved via Prisma ORM adapter. Current Credits: ${balance}`,
    });
  }),
);

console.log("Custom Prisma ORM Persistence example initialized.");
