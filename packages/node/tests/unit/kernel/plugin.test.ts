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

describe("Bot.transformResponse / Bot.onApiError", () => {
  it("observes successful results and can replace them", async () => {
    const seen: Array<{ method: string; result: unknown }> = [];
    const bot = new Bot("123:abc", { fetch: okFetch({ id: 1, username: "raw" }) });

    bot.transformResponse((method, result) => {
      seen.push({ method, result });
    });
    bot.transformResponse((_method, result) => {
      return { ...(result as Record<string, unknown>), username: "rewritten" };
    });

    const me = await bot.getMe();

    expect(seen).toEqual([{ method: "getMe", result: { id: 1, username: "raw" } }]);
    expect(me.username).toBe("rewritten");
  });

  it("invokes error hooks once with the final TelegramApiError", async () => {
    const failing = (async () =>
      new Response(
        JSON.stringify({ ok: false, error_code: 400, description: "Bad Request: chat not found" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )) as typeof fetch;
    const bot = new Bot("123:abc", { fetch: failing });

    const failures: Array<{ method: string; description: string }> = [];
    bot.onApiError((method, error) => {
      failures.push({ method, description: error.description });
    });
    bot.onApiError(() => {
      throw new Error("hook bug");
    });

    await expect(bot.sendMessage({ chat_id: 1, text: "hi" })).rejects.toThrow(/chat not found/);
    expect(failures).toEqual([
      { method: "sendMessage", description: "Bad Request: chat not found" },
    ]);
  });

  it("removeHooksByTag removes only hooks registered under that tag", async () => {
    const bot = new Bot("123:abc", { fetch: okFetch() });
    const calls: string[] = [];

    bot.transformRequest(() => calls.push("plugin"), "my-plugin");
    bot.transformResponse(() => calls.push("resp"), "my-plugin");
    bot.onApiError(() => calls.push("err"), "my-plugin");
    bot.transformRequest(() => calls.push("kept"));

    expect(bot.removeHooksByTag("my-plugin")).toBe(3);

    await bot.getMe();
    expect(calls).toEqual(["kept"]);
  });
});

describe("Plugin ordering and removal", () => {
  it("defers plugins with unsatisfied dependsOn until the dependency is installed", () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    const order: string[] = [];

    app.usePlugin({
      name: "depends-on-base",
      dependsOn: ["base"],
      install: () => order.push("dependent"),
    });
    expect(order).toEqual([]);

    app.usePlugin({ name: "base", install: () => order.push("base") });
    expect(order).toEqual(["base", "dependent"]);
    expect(app.hasPlugin("depends-on-base")).toBe(true);
  });

  it("installs simultaneously ready plugins by ascending priority", () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    const order: string[] = [];

    app.usePlugin({
      name: "late",
      priority: 5,
      dependsOn: ["base"],
      install: () => order.push("late"),
    });
    app.usePlugin({
      name: "early",
      priority: -1,
      dependsOn: ["base"],
      install: () => order.push("early"),
    });
    expect(order).toEqual([]);

    app.usePlugin({ name: "base", install: () => order.push("base") });
    expect(order).toEqual(["base", "early", "late"]);
  });

  it("throws at startup when dependencies are never installed", async () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    app.usePlugin({ name: "orphan", dependsOn: ["ghost"], install: () => {} });

    await expect(app.runWebhook({ port: 0 })).rejects.toThrow(/orphan/);
    expect(app.isRunning).toBe(false);
  });

  it("gives each plugin an isolated namespaced state object", () => {
    const app = new Application("123:abc", { fetch: okFetch() });

    const a = app.pluginState<{ count?: number }>("a");
    const b = app.pluginState("b");
    a.count = 1;
    b["count"] = 99;

    expect(app.pluginState<{ count?: number }>("a").count).toBe(1);
    expect(app.pluginState("a")).toBe(a);
    expect(a).not.toBe(b);
  });

  it("removePlugin deregisters middleware, hooks, bot hooks, and state", async () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    const uninstall = vi.fn();
    const events: string[] = [];

    app.usePlugin({
      name: "removable",
      install(a) {
        a.use(async (_ctx, next) => {
          events.push("middleware");
          await next();
        });
        a.onInit(() => events.push("init"));
        a.onShutdown(() => events.push("shutdown"));
        a.on("message", async () => events.push("handler"));
        a.bot.transformRequest(() => events.push("transform"), "removable");
        a.pluginState("removable")["flag"] = true;
      },
      uninstall,
    });

    expect(app.hasPlugin("removable")).toBe(true);
    app.removePlugin("removable");

    expect(uninstall).toHaveBeenCalledWith(app);
    expect(app.hasPlugin("removable")).toBe(false);

    await app.processUpdate(textUpdate);
    await app.bot.getMe();
    expect(events).toEqual([]);

    expect(app.pluginState("removable")).toEqual({});

    app.usePlugin({ name: "removable", install: () => events.push("reinstalled") });
    expect(events).toEqual(["reinstalled"]);
  });

  it("throws when removing an unknown plugin", () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    expect(() => app.removePlugin("ghost")).toThrow(/ghost/);
  });
});
