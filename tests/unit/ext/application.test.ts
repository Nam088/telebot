import { describe, it, expect, vi } from "vitest";
import { Application, ApplicationBuilder } from "../../../src/ext/application.js";
import { CommandHandler } from "../../../src/ext/handlers.js";
import { Bot } from "../../../src/telegram/bot.js";
import { MemoryPersistence } from "../../../src/ext/persistence.js";

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
    await pollPromise;

    expect(errorHandler).toHaveBeenCalled();
  });
});
