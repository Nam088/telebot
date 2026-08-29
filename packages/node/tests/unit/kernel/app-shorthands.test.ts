import { describe, it, expect, vi } from "vitest";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";
import { filters } from "../../../src/filters/matchers.js";
import { CommandHandler, TypeHandler } from "../../../src/routing/handlers.js";

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

  it("handles update string key in app.on and batch addHandlers", async () => {
    const { bot } = createMockBot();
    const app = new Application(bot);

    let inlineQueryHandled = false;
    app.on("inline_query", () => {
      inlineQueryHandled = true;
    });

    await app.processUpdate({
      update_id: 6,
      inline_query: {
        id: "iq_1",
        from: { id: 42, is_bot: false, first_name: "Test" },
        query: "hello",
        offset: "",
      },
    });

    expect(inlineQueryHandled).toBe(true);

    let h1Handled = false;
    let h2Handled = false;
    app.addHandlers([
      new CommandHandler("h1", () => {
        h1Handled = true;
      }),
      new CommandHandler("h2", () => {
        h2Handled = true;
      }),
    ]);

    await app.processUpdate({
      update_id: 7,
      message: {
        message_id: 7,
        date: 12345,
        chat: { id: 42, type: "private" },
        text: "/h1",
        entities: [{ type: "bot_command", offset: 0, length: 3 }],
      },
    });
    expect(h1Handled).toBe(true);
  });

  it("throws expected errors when context helpers lack required update metadata", async () => {
    const { bot } = createMockBot();
    const emptyApp = new Application(bot);

    const errorCaught: string[] = [];
    emptyApp.addHandler(
      new TypeHandler(
        () => true,
        async (update, context) => {
          try {
            await context.replyWithVideo("v.mp4");
          } catch (err: any) {
            errorCaught.push(err.message);
          }
          try {
            await context.replyWithAudio("a.mp3");
          } catch (err: any) {
            errorCaught.push(err.message);
          }
          try {
            await context.answerCallbackQuery();
          } catch (err: any) {
            errorCaught.push(err.message);
          }
          try {
            await context.editMessageText("Edit");
          } catch (err: any) {
            errorCaught.push(err.message);
          }
          try {
            await context.deleteMessage();
          } catch (err: any) {
            errorCaught.push(err.message);
          }
        },
      ),
    );

    await emptyApp.processUpdate({
      update_id: 99,
      poll: {
        id: "poll_1",
        question: "Q?",
        options: [],
        total_voter_count: 0,
        is_closed: false,
        is_anonymous: true,
        type: "regular",
        allows_multiple_answers: false,
      },
    });

    expect(errorCaught).toHaveLength(5);
    expect(errorCaught[0]).toContain("replyWithVideo");
    expect(errorCaught[1]).toContain("replyWithAudio");
    expect(errorCaught[2]).toContain("answerCallbackQuery");
    expect(errorCaught[3]).toContain("editMessageText");
    expect(errorCaught[4]).toContain("deleteMessage");
  });
});
