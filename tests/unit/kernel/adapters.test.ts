import { describe, it, expect, vi } from "vitest";
import {
  createExpressWebhook,
  createFastifyWebhook,
  createFetchWebhook,
  createHttpWebhook,
  webhookCallback,
} from "../../../src/kernel/adapters.js";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";
import { CommandHandler } from "../../../src/routing/handlers.js";

describe("Webhook Framework Adapters", () => {
  const bot = new Bot("TEST_TOKEN");

  it("createExpressWebhook processes valid update and enforces secret token", async () => {
    const app = new Application(bot);
    let handled = false;
    app.addHandler(
      new CommandHandler("ping", () => {
        handled = true;
      }),
    );

    const handler = createExpressWebhook(app, { secret_token: "secret_123" });

    // 1. Unauthorized
    let statusCode = 0;
    let sentBody = "";
    const mockRes = {
      status: (code: number) => {
        statusCode = code;
        return {
          send: (body?: string) => {
            sentBody = body ?? "";
          },
          end: () => {},
        };
      },
    };

    await handler({ headers: {} }, mockRes as any);
    expect(statusCode).toBe(401);

    // 2. Authorized + Valid body
    await handler(
      {
        headers: { "x-telegram-bot-api-secret-token": "secret_123" },
        body: {
          update_id: 10,
          message: {
            message_id: 1,
            date: 123456,
            chat: { id: 1, type: "private" },
            text: "/ping",
            entities: [{ type: "bot_command", offset: 0, length: 5 }],
          },
        },
      },
      mockRes as any,
    );

    expect(statusCode).toBe(200);
    expect(sentBody).toBe("OK");
    expect(handled).toBe(true);
  });

  it("createFastifyWebhook processes valid update and enforces secret token", async () => {
    const app = new Application(bot);
    let handled = false;
    app.addHandler(
      new CommandHandler("test", () => {
        handled = true;
      }),
    );

    const handler = createFastifyWebhook(app, { secret_token: "fastify_secret" });

    let statusCode = 0;
    const mockReply = {
      status: (code: number) => {
        statusCode = code;
        return { send: () => {} };
      },
    };

    // Unauthorized
    await handler({ headers: {} }, mockReply as any);
    expect(statusCode).toBe(401);

    // Valid
    await handler(
      {
        headers: { "x-telegram-bot-api-secret-token": "fastify_secret" },
        body: {
          update_id: 20,
          message: {
            message_id: 2,
            date: 123456,
            chat: { id: 1, type: "private" },
            text: "/test",
            entities: [{ type: "bot_command", offset: 0, length: 5 }],
          },
        },
      },
      mockReply as any,
    );

    expect(statusCode).toBe(200);
    expect(handled).toBe(true);
  });

  it("createFetchWebhook handles standard Request and returns Response for Next.js / Hono / Workers", async () => {
    const app = new Application(bot);
    let handled = false;
    app.addHandler(
      new CommandHandler("start", () => {
        handled = true;
      }),
    );

    const handler = createFetchWebhook(app, { secret_token: "fetch_secret" });

    // Method not allowed
    const getRes = await handler(new Request("https://localhost/webhook", { method: "GET" }));
    expect(getRes.status).toBe(405);

    // Unauthorized
    const unauthReq = new Request("https://localhost/webhook", {
      method: "POST",
      body: JSON.stringify({ update_id: 1 }),
    });
    const unauthRes = await handler(unauthReq);
    expect(unauthRes.status).toBe(401);

    // Valid POST
    const validReq = new Request("https://localhost/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "fetch_secret",
      },
      body: JSON.stringify({
        update_id: 30,
        message: {
          message_id: 3,
          date: 123456,
          chat: { id: 1, type: "private" },
          text: "/start",
          entities: [{ type: "bot_command", offset: 0, length: 6 }],
        },
      }),
    });

    const validRes = await handler(validReq);
    expect(validRes.status).toBe(200);
    expect(await validRes.text()).toBe("OK");
    expect(handled).toBe(true);
  });

  it("createHttpWebhook processes Node.js stream and enforces secret token", async () => {
    const app = new Application(bot);
    let handled = false;
    app.addHandler(
      new CommandHandler("http_cmd", () => {
        handled = true;
      }),
    );

    const handler = createHttpWebhook(app, { secret_token: "http_secret" });

    // Method not allowed
    let headStatus = 0;
    let endMessage = "";
    const mockRes405 = {
      writeHead: (status: number) => {
        headStatus = status;
      },
      end: (msg?: string) => {
        endMessage = msg ?? "";
      },
    };

    await handler({ method: "GET", headers: {} } as any, mockRes405 as any);
    expect(headStatus).toBe(405);

    // Unauthorized
    await handler({ method: "POST", headers: {} } as any, mockRes405 as any);
    expect(headStatus).toBe(401);

    // Valid stream
    const { Readable } = await import("node:stream");
    const payload = JSON.stringify({
      update_id: 40,
      message: {
        message_id: 4,
        date: 123456,
        chat: { id: 1, type: "private" },
        text: "/http_cmd",
        entities: [{ type: "bot_command", offset: 0, length: 9 }],
      },
    });

    const mockReq = Readable.from([Buffer.from(payload)]) as any;
    mockReq.method = "POST";
    mockReq.headers = { "x-telegram-bot-api-secret-token": "http_secret" };

    const mockRes200 = {
      writeHead: (status: number) => {
        headStatus = status;
      },
      end: (msg?: string) => {
        endMessage = msg ?? "";
      },
    };

    await handler(mockReq, mockRes200 as any);
    expect(headStatus).toBe(200);
    expect(endMessage).toBe("OK");
    expect(handled).toBe(true);
  });

  it("webhookCallback universal factory instantiates appropriate framework handlers", () => {
    const app = new Application(bot);

    const expressHandler = webhookCallback(app, "express");
    expect(typeof expressHandler).toBe("function");

    const fastifyHandler = webhookCallback(app, "fastify");
    expect(typeof fastifyHandler).toBe("function");

    const fetchHandler = webhookCallback(app, "fetch");
    expect(typeof fetchHandler).toBe("function");

    const httpHandler = webhookCallback(app, "http");
    expect(typeof httpHandler).toBe("function");

    expect(() => webhookCallback(app, "unsupported" as any)).toThrow();
  });
});
