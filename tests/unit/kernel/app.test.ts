import { describe, it, expect, vi } from "vitest";
import { Application, ApplicationBuilder } from "../../../src/kernel/app.js";
import { CommandHandler } from "../../../src/routing/handlers.js";
import { Bot } from "../../../src/client/bot.js";
import { MemoryPersistence } from "../../../src/storage/memory.js";
import type { Persistence, PersistedJob } from "../../../src/storage/driver.js";

describe("Application and ApplicationBuilder", () => {
  it("builds application with ApplicationBuilder", () => {
    const app = new ApplicationBuilder()
      .token("TEST_TOKEN")
      .botOptions({ baseDelayMs: 10 })
      .persistence(new MemoryPersistence())
      .build();

    expect(app).toBeInstanceOf(Application);
    expect(app.bot.token).toBe("TEST_TOKEN");
  });

  it("throws if building Application without token", () => {
    const builder = new ApplicationBuilder();
    expect(() => builder.build()).toThrow("Cannot build Application without bot token.");
  });

  it("runs polling, drops pending updates and processes updates", async () => {
    let callCount = 0;
    const fakeFetch = vi.fn().mockImplementation(async (url: string) => {
      callCount++;
      if (url.includes("getUpdates")) {
        if (callCount === 1) {
          // Drop pending updates call
          return {
            status: 200,
            json: async () => ({
              ok: true,
              result: [{ update_id: 100 }],
            }),
          };
        }
        if (callCount === 2) {
          // First polling batch
          return {
            status: 200,
            json: async () => ({
              ok: true,
              result: [
                {
                  update_id: 101,
                  message: {
                    message_id: 1,
                    date: 123456,
                    chat: { id: 123, type: "private" },
                    text: "/start",
                    entities: [{ type: "bot_command", offset: 0, length: 6 }],
                  },
                },
              ],
            }),
          };
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
      return {
        status: 200,
        json: async () => ({ ok: true, result: [] }),
      };
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    const app = new Application(bot);

    const startCallback = vi.fn();
    app.addHandler(new CommandHandler("start", startCallback));

    const pollPromise = app.runPolling({ drop_pending_updates: true, poll_interval: 10 });

    // Wait short time for first loop iteration
    await new Promise((resolve) => setTimeout(resolve, 60));
    app.stop();
    await pollPromise;

    expect(startCallback).toHaveBeenCalledTimes(1);
    expect(app.isRunning).toBe(false);
  });

  it("routes polling errors to error handlers", async () => {
    let callCount = 0;
    const fakeFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          status: 400,
          json: async () => ({ ok: false, error_code: 400, description: "Bad Request" }),
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
      return {
        status: 200,
        json: async () => ({ ok: true, result: [] }),
      };
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch, baseDelayMs: 5, maxRetries: 0 });
    const app = new Application(bot);

    const errorHandler = vi.fn();
    app.addErrorHandler(errorHandler);

    const pollPromise = app.runPolling({ poll_interval: 10 });
    await new Promise((resolve) => setTimeout(resolve, 60));
    app.stop();
    expect(errorHandler).toHaveBeenCalled();
  });

  it("runs webhook server, verifies secret_token, dispatches updates, and guards against concurrency", async () => {
    const bot = new Bot("TEST_TOKEN");
    const app = new Application(bot);

    const receivedUpdates: number[] = [];
    app.addHandler(
      new CommandHandler("ping", (update) => {
        receivedUpdates.push(update.update_id);
      }),
    );

    const port = 9876;
    await app.runWebhook({
      port,
      path: "/custom-webhook",
      secret_token: "secret-12345",
    });

    expect(app.isRunning).toBe(true);

    // Guard: cannot start polling while webhook is running
    await expect(app.runPolling()).rejects.toThrow("Cannot start polling concurrently");
    await expect(app.runWebhook()).rejects.toThrow("Cannot start webhook concurrently");

    // 1. Test 404 for wrong path
    const res404 = await fetch(`http://localhost:${port}/wrong-path`, { method: "POST" });
    expect(res404.status).toBe(404);

    // 2. Test 401 for wrong secret token
    const res401 = await fetch(`http://localhost:${port}/custom-webhook`, {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": "wrong-token" },
      body: JSON.stringify({ update_id: 1 }),
    });
    expect(res401.status).toBe(401);

    // 3. Test 200 and successful dispatch with valid secret token
    const res200 = await fetch(`http://localhost:${port}/custom-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": "secret-12345",
      },
      body: JSON.stringify({
        update_id: 100,
        message: {
          message_id: 1,
          date: 123456,
          chat: { id: 123, type: "private" },
          text: "/ping",
          entities: [{ offset: 0, length: 5, type: "bot_command" }],
        },
      }),
    });
    expect(res200.status).toBe(200);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(receivedUpdates).toEqual([100]);

    await app.stop();
    expect(app.isRunning).toBe(false);
  });

  it("does not lose user_data updates from concurrent processUpdate calls for the same user (lost-update race)", async () => {
    // A persistence backend that mimics a real database driver: getUserData returns a
    // fresh deserialized copy each call rather than a live shared reference, so a
    // read-modify-write race is actually observable (unlike MemoryPersistence's shared map).
    let stored: Record<string, unknown> = {};
    const fakePersistence: Persistence = {
      async getUserData() {
        return { ...stored };
      },
      async setUserData(_userId, data) {
        stored = data;
      },
      async getChatData() {
        return {};
      },
      async setChatData() {},
      async getBotData() {
        return {};
      },
      async setBotData() {},
      async getConversations() {
        return new Map();
      },
      async updateConversation() {},
      async getJobs(): Promise<PersistedJob[]> {
        return [];
      },
      async setJobs() {},
    };

    const bot = new Bot("TEST_TOKEN");
    const app = new Application(bot, { persistence: fakePersistence });

    let dispatchCount = 0;
    app.addHandler(
      new CommandHandler("inc", async (_update, context) => {
        dispatchCount++;
        // Widen the race window: the first concurrent call reads, waits, then writes.
        if (dispatchCount === 1) {
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        const current = (context.user_data.count as number | undefined) ?? 0;
        context.user_data.count = current + 1;
      }),
    );

    const makeUpdate = (updateId: number) => ({
      update_id: updateId,
      message: {
        message_id: updateId,
        date: 123456,
        chat: { id: 1, type: "private" as const },
        from: { id: 42, is_bot: false, first_name: "Test" },
        text: "/inc",
        entities: [{ type: "bot_command", offset: 0, length: 4 }],
      },
    });

    await Promise.all([app.processUpdate(makeUpdate(1)), app.processUpdate(makeUpdate(2))]);

    expect(stored.count).toBe(2);
  });

  it("clears context.error after handling it so it does not leak into later handler groups", async () => {
    const bot = new Bot("TEST_TOKEN");
    const app = new Application(bot);

    const seenErrorInGroup1: Array<Error | undefined> = [];

    app.addHandler(
      new CommandHandler("boom", () => {
        throw new Error("boom");
      }),
      0,
    );
    app.addHandler(
      new CommandHandler("boom", (_update, context) => {
        seenErrorInGroup1.push(context.error);
      }),
      1,
    );
    app.addErrorHandler(() => {});

    await app.processUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 1, type: "private" },
        from: { id: 1, is_bot: false, first_name: "Test" },
        text: "/boom",
        entities: [{ type: "bot_command", offset: 0, length: 5 }],
      },
    });

    expect(seenErrorInGroup1).toEqual([undefined]);
  });

  it("rejects a same-length secret_token that does not match", async () => {
    const bot = new Bot("TEST_TOKEN");
    const app = new Application(bot);
    const port = 9878;
    await app.runWebhook({ port, path: "/hook", secret_token: "secret-12345" });

    const res = await fetch(`http://localhost:${port}/hook`, {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": "secret-00000" }, // same length, different value
      body: JSON.stringify({ update_id: 1 }),
    });
    expect(res.status).toBe(401);

    await app.stop();
  });

  it("rejects webhook request bodies exceeding the maximum allowed size with 413", async () => {
    const bot = new Bot("TEST_TOKEN");
    const app = new Application(bot);
    const port = 9879;
    await app.runWebhook({ port, path: "/hook" });

    const oversized = "x".repeat(6 * 1024 * 1024); // 6 MiB, over the cap
    const res = await fetch(`http://localhost:${port}/hook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: oversized,
    });
    expect(res.status).toBe(413);

    await app.stop();
  });
});
