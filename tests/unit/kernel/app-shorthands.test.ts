import { describe, it, expect, vi } from "vitest";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";
import { filters } from "../../../src/filters/matchers.js";

describe("Application Shorthands & Context Helpers Unit Tests", () => {
  const createMockBot = () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result: { message_id: 100 } }),
    });
    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    return { bot, fakeFetch };
  };

  it("registers command with app.command() and replies using ctx.replyWithHTML()", async () => {
    const { bot, fakeFetch } = createMockBot();
    const app = new Application(bot);

    let called = false;
    app.command("start", async (update, context) => {
      called = true;
      await context.replyWithHTML("<b>Welcome!</b>");
    });

    await app.processUpdate({
      update_id: 1,
      message: {
        message_id: 1,
        date: 12345,
        chat: { id: 42, type: "private" },
        from: { id: 42, is_bot: false, first_name: "Test" },
        text: "/start",
        entities: [{ type: "bot_command", offset: 0, length: 6 }],
      },
    });

    expect(called).toBe(true);
    expect(fakeFetch).toHaveBeenCalled();
  });

  it("handles text with app.hears() and regex capture groups", async () => {
    const { bot } = createMockBot();
    const app = new Application(bot);

    let matchedOrder = "";
    app.hears(/order:([0-9]+)/i, (update, context) => {
      matchedOrder = context.matches?.[0]?.[1] ?? "";
    });

    await app.processUpdate({
      update_id: 2,
      message: {
        message_id: 2,
        date: 12345,
        chat: { id: 42, type: "private" },
        from: { id: 42, is_bot: false, first_name: "Test" },
        text: "My order:987654",
      },
    });

    expect(matchedOrder).toBe("987654");
  });

  it("handles button callbacks with app.callbackQuery() and ctx.answerCallbackQuery()", async () => {
    const { bot, fakeFetch } = createMockBot();
    const app = new Application(bot);

    let answered = false;
    app.callbackQuery("btn_click", async (update, context) => {
      answered = true;
      await context.answerCallbackQuery({ text: "Tapped!" });
    });

    await app.processUpdate({
      update_id: 3,
      callback_query: {
        id: "cb_123",
        from: { id: 42, is_bot: false, first_name: "Test" },
        data: "btn_click",
        chat_instance: "ci",
      },
    });

    expect(answered).toBe(true);
    expect(fakeFetch).toHaveBeenCalled();
  });

  it("handles filters with app.on()", async () => {
    const { bot } = createMockBot();
    const app = new Application(bot);

    let photoReceived = false;
    app.on(filters.PHOTO, () => {
      photoReceived = true;
    });

    await app.processUpdate({
      update_id: 4,
      message: {
        message_id: 4,
        date: 12345,
        chat: { id: 42, type: "private" },
        from: { id: 42, is_bot: false, first_name: "Test" },
        photo: [{ file_id: "p1", file_unique_id: "pu1", width: 100, height: 100 }],
      },
    });

    expect(photoReceived).toBe(true);
  });

  it("supports replyWithMarkdown, replyWithVideo, replyWithAudio, editMessageText, deleteMessage", async () => {
    const { bot, fakeFetch } = createMockBot();
    const app = new Application(bot);

    app.command("media", async (update, context) => {
      await context.replyWithMarkdown("*bold text*");
      await context.replyWithVideo("https://example.com/v.mp4");
      await context.replyWithAudio("https://example.com/a.mp3");
      await context.editMessageText("New text");
      await context.deleteMessage();
    });

    await app.processUpdate({
      update_id: 5,
      message: {
        message_id: 5,
        date: 12345,
        chat: { id: 42, type: "private" },
        from: { id: 42, is_bot: false, first_name: "Test" },
        text: "/media",
        entities: [{ type: "bot_command", offset: 0, length: 6 }],
      },
    });

    expect(fakeFetch).toHaveBeenCalledTimes(5);
  });
});

