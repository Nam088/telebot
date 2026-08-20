import { describe, it, expect, vi } from "vitest";
import { Application } from "../../src/ext/application.js";
import { CommandHandler, MessageHandler } from "../../src/ext/handlers.js";
import { filters } from "../../src/ext/filters.js";
import { Bot } from "../../src/telegram/bot.js";

describe("Application dispatch integration", () => {
  it("dispatches first match in group, other groups still run", async () => {
    const bot = new Bot("TEST_TOKEN");
    const app = new Application(bot);

    const group0Handler1 = vi.fn();
    const group0Handler2 = vi.fn();
    const group1Handler = vi.fn();

    // Group 0
    app.addHandler(new CommandHandler("start", group0Handler1), 0);
    app.addHandler(new CommandHandler("start", group0Handler2), 0);

    // Group 1
    app.addHandler(new MessageHandler(filters.COMMAND, group1Handler), 1);

    await app.processUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "/start",
        entities: [{ type: "bot_command", offset: 0, length: 6 }],
      },
    });

    expect(group0Handler1).toHaveBeenCalledTimes(1);
    expect(group0Handler2).not.toHaveBeenCalled();
    expect(group1Handler).toHaveBeenCalledTimes(1);
  });
});
