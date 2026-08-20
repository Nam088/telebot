import { describe, it, expect, vi } from "vitest";
import { LinearConversation } from "../../../src/routing/linear-conversation.js";
import { Bot } from "../../../src/client/bot.js";
import { Application } from "../../../src/kernel/app.js";
import { filters } from "../../../src/filters/matchers.js";

describe("LinearConversation", () => {
  it("executes a multi-step sequential conversation with wait and ask", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result: { message_id: 1 } }),
    });
    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    const app = new Application(bot);

    const dialogLog: string[] = [];

    const conv = new LinearConversation(
      async (conversation, context) => {
        dialogLog.push("Started");
        const name = await conversation.ask("What is your name?");
        dialogLog.push(`Got name: ${name}`);

        const age = await conversation.ask("How old are you?");
        dialogLog.push(`Got age: ${age}`);

        dialogLog.push("Finished");
      },
      {
        entry_command: "survey",
      }
    );

    app.addHandler(conv);

    // 1. Send /survey to trigger
    await app.processUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 100, type: "private" },
        from: { id: 200, is_bot: false, first_name: "John" },
        text: "/survey",
        entities: [{ offset: 0, length: 7, type: "bot_command" }],
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(dialogLog).toEqual(["Started"]);

    // 2. User sends name "Alice"
    await app.processUpdate({
      update_id: 2,
      message: {
        message_id: 2,
        date: 123457,
        chat: { id: 100, type: "private" },
        from: { id: 200, is_bot: false, first_name: "John" },
        text: "Alice",
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(dialogLog).toEqual(["Started", "Got name: Alice"]);

    // 3. User sends age "25"
    await app.processUpdate({
      update_id: 3,
      message: {
        message_id: 3,
        date: 123458,
        chat: { id: 100, type: "private" },
        from: { id: 200, is_bot: false, first_name: "John" },
        text: "25",
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(dialogLog).toEqual(["Started", "Got name: Alice", "Got age: 25", "Finished"]);
  });

  it("handles conversation.exit() cleanly", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result: { message_id: 1 } }),
    });
    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    const app = new Application(bot);

    const log: string[] = [];

    const conv = new LinearConversation(
      async (conversation, context) => {
        log.push("Step 1");
        const resp = await conversation.ask("Say yes or no");
        if (resp === "no") {
          log.push("Exiting");
          conversation.exit();
        }
        log.push("Step 2");
      },
      {
        entry_command: "start",
      }
    );

    app.addHandler(conv);

    // Trigger
    await app.processUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 10, type: "private" },
        from: { id: 20, is_bot: false, first_name: "Test" },
        text: "/start",
        entities: [{ offset: 0, length: 6, type: "bot_command" }],
      },
    });

    expect(log).toEqual(["Step 1"]);

    // User replies "no"
    await app.processUpdate({
      update_id: 2,
      message: {
        message_id: 2,
        date: 123457,
        chat: { id: 10, type: "private" },
        from: { id: 20, is_bot: false, first_name: "Test" },
        text: "no",
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(log).toEqual(["Step 1", "Exiting"]);
  });
});
