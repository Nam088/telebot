import { describe, it, expect, vi } from "vitest";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";
import { CommandHandler } from "../../../src/routing/handlers.js";

describe("Application Middleware Pipeline Tests", () => {
  const bot = new Bot("TEST_TOKEN");

  it("executes middlewares in order before invoking handlers", async () => {
    const app = new Application(bot);
    const executionOrder: string[] = [];

    app.use(async (ctx, next) => {
      executionOrder.push("mw1_before");
      await next();
      executionOrder.push("mw1_after");
    });

    app.use(async (ctx, next) => {
      executionOrder.push("mw2_before");
      await next();
      executionOrder.push("mw2_after");
    });

    app.addHandler(
      new CommandHandler("test", () => {
        executionOrder.push("handler_executed");
      }),
    );

    await app.processUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 1, type: "private" },
        text: "/test",
        entities: [{ type: "bot_command", offset: 0, length: 5 }],
      },
    });

    expect(executionOrder).toEqual([
      "mw1_before",
      "mw2_before",
      "handler_executed",
      "mw2_after",
      "mw1_after",
    ]);
  });

  it("stops middleware chain if next() is not called", async () => {
    const app = new Application(bot);
    let handlerCalled = false;

    app.use(async (ctx, next) => {
      // Intentionally drop update
    });

    app.addHandler(
      new CommandHandler("test", () => {
        handlerCalled = true;
      }),
    );

    await app.processUpdate({
      update_id: 2,
      message: {
        message_id: 2,
        date: 123456,
        chat: { id: 1, type: "private" },
        text: "/test",
        entities: [{ type: "bot_command", offset: 0, length: 5 }],
      },
    });

    expect(handlerCalled).toBe(false);
  });
});
