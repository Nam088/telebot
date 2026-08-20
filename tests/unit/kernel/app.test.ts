import { describe, it, expect, vi } from "vitest";
import { Application, ApplicationBuilder } from "../../../src/kernel/app.js";
import { CommandHandler } from "../../../src/routing/handlers.js";
import { Bot } from "../../../src/client/bot.js";
import { MemoryPersistence } from "../../../src/storage/memory.js";

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
      })
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
});
