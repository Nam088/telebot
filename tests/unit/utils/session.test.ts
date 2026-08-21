import { describe, it, expect } from "vitest";
import { session, MemorySessionStorage } from "../../../src/utils/session.js";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";
import { CommandHandler } from "../../../src/routing/handlers.js";

describe("Session Middleware Tests", () => {
  const bot = new Bot("TEST_TOKEN");

  it("loads, mutates, and persists session across updates", async () => {
    interface TestSession {
      clicks: number;
    }

    const app = new Application(bot);
    const storage = new MemorySessionStorage<TestSession>();

    app.use(
      session<TestSession>({
        initial: () => ({ clicks: 0 }),
        storage,
      }),
    );

    let recordedClicks = 0;

    app.addHandler(
      new CommandHandler("click", (update, context) => {
        const s = (context as any).session as TestSession;
        s.clicks++;
        recordedClicks = s.clicks;
      }),
    );

    const makeUpdate = (id: number) => ({
      update_id: id,
      message: {
        message_id: id,
        date: 123456,
        chat: { id: 100, type: "private" as const },
        from: { id: 200, is_bot: false, first_name: "Alice" },
        text: "/click",
        entities: [{ type: "bot_command" as const, offset: 0, length: 6 }],
      },
    });

    // Update 1
    await app.processUpdate(makeUpdate(1));
    expect(recordedClicks).toBe(1);

    // Update 2
    await app.processUpdate(makeUpdate(2));
    expect(recordedClicks).toBe(2);

    // Verify stored data
    const saved = storage.read("session:user:200");
    expect(saved).toEqual({ clicks: 2 });
  });

  it("supports deleting session key in MemorySessionStorage", () => {
    const storage = new MemorySessionStorage<{ foo: string }>();
    storage.write("k1", { foo: "bar" });
    expect(storage.read("k1")).toEqual({ foo: "bar" });
    storage.delete("k1");
    expect(storage.read("k1")).toBeUndefined();
  });

  it("falls back to chat key when effective_user is not present and skips when no key", async () => {
    const app = new Application(bot);
    const storage = new MemorySessionStorage<{ viewed: boolean }>();
    app.use(session({ initial: () => ({ viewed: true }), storage }));

    let handled = false;
    app.addHandler(
      new CommandHandler("test", (_u, _c) => {
        handled = true;
      }),
    );

    // Update with chat only (no from/effective_user)
    await app.processUpdate({
      update_id: 10,
      channel_post: {
        message_id: 1,
        date: 123456,
        chat: { id: 500, type: "channel" },
        text: "/test",
        entities: [{ type: "bot_command", offset: 0, length: 5 }],
      },
    });

    expect(handled).toBe(true);
    expect(storage.read("session:chat:500")).toEqual({ viewed: true });

    // Custom getSessionKey returning undefined
    const appNoKey = new Application(bot);
    appNoKey.use(session({ getSessionKey: () => undefined }));
    let noKeyHandled = false;
    appNoKey.addHandler(
      new CommandHandler("test", (_u, _c) => {
        noKeyHandled = true;
      }),
    );
    await appNoKey.processUpdate({
      update_id: 11,
      message: {
        message_id: 2,
        date: 123456,
        chat: { id: 600, type: "private" },
        text: "/test",
        entities: [{ type: "bot_command", offset: 0, length: 5 }],
      },
    });
    expect(noKeyHandled).toBe(true);
  });
});
