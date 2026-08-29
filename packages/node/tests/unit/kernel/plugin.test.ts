import { describe, it, expect, vi } from "vitest";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";
import type { Plugin } from "../../../src/kernel/plugin.js";

function okFetch(result: unknown = true, capture?: Array<{ url: string; body: string }>) {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    capture?.push({ url: String(input), body: String(init?.body ?? "") });
    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

const textUpdate = {
  update_id: 1,
  message: {
    message_id: 1,
    date: 0,
    chat: { id: 1, type: "private" },
    from: { id: 7, is_bot: false, first_name: "Tester" },
    text: "hello",
  },
} as const;

describe("Plugin system", () => {
  it("installs a plugin and passes the application to install()", () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    const install = vi.fn();
    const plugin: Plugin = { name: "demo", install };

    const returned = app.usePlugin(plugin);

    expect(install).toHaveBeenCalledTimes(1);
    expect(install).toHaveBeenCalledWith(app);
    expect(returned).toBe(app);
  });

  it("rejects installing two plugins with the same name", () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    app.usePlugin({ name: "dup", install: () => {} });

    expect(() => app.usePlugin({ name: "dup", install: () => {} })).toThrow(/dup/);
  });

  it("runs middleware registered by a plugin on every update", async () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    const seen: string[] = [];

    app.usePlugin({
      name: "mw-plugin",
      install(a) {
        a.use(async (context, next) => {
          seen.push(context.update.update_id as unknown as string);
          await next();
        });
        a.on("message", async () => {
          seen.push("handler");
        });
      },
    });

    await app.processUpdate(textUpdate);

    expect(seen).toEqual([1, "handler"]);
  });

  it("invokes onInit hooks on start and onShutdown hooks on stop", async () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    const order: string[] = [];

    app.usePlugin({
      name: "lifecycle",
      install(a) {
        a.onInit(() => {
          order.push("init");
        });
        a.onShutdown(() => {
          order.push("shutdown");
        });
      },
    });

    await app.runWebhook({ port: 0 });
    expect(order).toEqual(["init"]);

    await app.stop();
    expect(order).toEqual(["init", "shutdown"]);
  });

  it("isolates errors thrown by lifecycle hooks", async () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    const errors: Error[] = [];
    app.addErrorHandler((error) => {
      errors.push(error);
    });

    app.onInit(() => {
      throw new Error("boom-init");
    });
    app.onShutdown(() => {
      throw new Error("boom-shutdown");
    });

    await app.runWebhook({ port: 0 });
    await app.stop();

    expect(errors.map((e) => e.message)).toEqual(["boom-init", "boom-shutdown"]);
    expect(app.isRunning).toBe(false);
  });
});

describe("Bot.transformRequest", () => {
  it("runs hooks before each outgoing API call and allows payload mutation", async () => {
    const calls: Array<{ method: string; payload: Record<string, unknown> }> = [];
    const sent: Array<{ url: string; body: string }> = [];
    const bot = new Bot("123:abc", { fetch: okFetch(true, sent) });

    bot.transformRequest((method, payload) => {
      calls.push({ method, payload: { ...payload } });
      payload["protect_content"] = true;
    });

    await bot.sendMessage({ chat_id: 1, text: "hi" });
    await bot.deleteMessage(1, 2);

    expect(calls.map((c) => c.method)).toEqual(["sendMessage", "deleteMessage"]);
    expect(sent[0]?.body).toContain('"protect_content":true');
  });

  it("runs multiple hooks in registration order", async () => {
    const order: number[] = [];
    const bot = new Bot("123:abc", { fetch: okFetch() });

    bot.transformRequest(() => order.push(1));
    bot.transformRequest(() => order.push(2));

    await bot.getMe();

    expect(order).toEqual([1, 2]);
  });
});
