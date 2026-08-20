import { describe, it, expect, vi } from "vitest";
import { Bot, Application, CommandHandler } from "../../src/index.js";
import { createServer } from "node:http";

describe("Webhook Integration Engine Tests", () => {
  it("processes incoming webhook POST requests, validates secret_token, and dispatches updates", async () => {
    let commandHandled = false;

    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result: true }),
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    const app = new Application(bot);

    app.addHandler(
      new CommandHandler("hello", async (update, ctx) => {
        commandHandled = true;
        await ctx.reply("Hello from webhook!");
      }),
    );

    const testPort = 9876;
    const secretToken = "my_secret_token_123";

    // Start Webhook server
    await app.runWebhook({
      port: testPort,
      path: "/webhook",
      secret_token: secretToken,
    });

    // 1. Test 404 for wrong path
    const res404 = await fetch(`http://localhost:${testPort}/wrong`, { method: "POST" });
    expect(res404.status).toBe(404);

    // 2. Test 401 for missing/invalid secret token
    const res401 = await fetch(`http://localhost:${testPort}/webhook`, {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": "wrong_token" },
      body: JSON.stringify({ update_id: 1 }),
    });
    expect(res401.status).toBe(401);

    // 3. Test 200 and successful update dispatch
    const res200 = await fetch(`http://localhost:${testPort}/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": secretToken,
      },
      body: JSON.stringify({
        update_id: 1001,
        message: {
          message_id: 1,
          date: Date.now(),
          chat: { id: 123456, type: "private" },
          from: { id: 123456, is_bot: false, first_name: "Tester" },
          text: "/hello",
          entities: [{ type: "bot_command", offset: 0, length: 6 }],
        },
      }),
    });

    expect(res200.status).toBe(200);
    expect(commandHandled).toBe(true);
    expect(fakeFetch).toHaveBeenCalled();

    // Clean stop
    await app.stop();
  });
});
