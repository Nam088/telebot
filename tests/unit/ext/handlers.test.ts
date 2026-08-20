import { describe, it, expect, vi } from "vitest";
import {
  CommandHandler,
  MessageHandler,
  CallbackQueryHandler,
  InlineQueryHandler,
  ChosenInlineResultHandler,
  PollAnswerHandler,
  ChatMemberHandler,
  TypeHandler,
} from "../../../src/ext/handlers.js";
import { filters } from "../../../src/ext/filters.js";
import { Update } from "../../../src/telegram/update.js";
import { CallbackContext } from "../../../src/ext/context.js";
import { Bot } from "../../../src/telegram/bot.js";

describe("CommandHandler and MessageHandler", () => {
  const bot = new Bot("TEST_TOKEN");

  it("CommandHandler matches /start command and parses args", async () => {
    const callback = vi.fn();
    const handler = new CommandHandler("start", callback);

    const update = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "/start foo bar",
        entities: [{ type: "bot_command", offset: 0, length: 6 }],
      },
    }, bot);

    const match = await handler.checkUpdate(update);
    expect(match).toBe(true);

    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);

    expect(context.args).toEqual(["foo", "bar"]);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("CommandHandler does not match different command", async () => {
    const callback = vi.fn();
    const handler = new CommandHandler("help", callback);

    const update = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "/start",
        entities: [{ type: "bot_command", offset: 0, length: 6 }],
      },
    }, bot);

    const match = await handler.checkUpdate(update);
    expect(match).toBe(false);
  });

  it("MessageHandler matches text filter and executes callback", async () => {
    const callback = vi.fn();
    const handler = new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), callback);

    const update = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "Hello there",
      },
    }, bot);

    const match = await handler.checkUpdate(update);
    expect(match).toBe(true);

    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("CallbackQueryHandler", () => {
  const bot = new Bot("TEST_TOKEN");

  it("matches callback query without pattern", async () => {
    const callback = vi.fn();
    const handler = new CallbackQueryHandler(callback);

    const update = new Update({
      update_id: 1,
      callback_query: {
        id: "cb_1",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        chat_instance: "inst1",
        data: "button_clicked",
      },
    }, bot);

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("matches callback query with string pattern", async () => {
    const callback = vi.fn();
    const handler = new CallbackQueryHandler(callback, "btn_yes");

    const updateMatch = new Update({
      update_id: 1,
      callback_query: {
        id: "cb_1",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        chat_instance: "inst1",
        data: "btn_yes",
      },
    }, bot);

    const updateNoMatch = new Update({
      update_id: 2,
      callback_query: {
        id: "cb_2",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        chat_instance: "inst1",
        data: "btn_no",
      },
    }, bot);

    expect(await handler.checkUpdate(updateMatch)).toBe(true);
    expect(await handler.checkUpdate(updateNoMatch)).toBe(false);
  });

  it("matches callback query with RegExp pattern and populates context.matches", async () => {
    const callback = vi.fn();
    const handler = new CallbackQueryHandler(callback, /^vote_(\d+)$/);

    const update = new Update({
      update_id: 1,
      callback_query: {
        id: "cb_1",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        chat_instance: "inst1",
        data: "vote_42",
      },
    }, bot);

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(context.matches?.[0]?.[1]).toBe("42");
  });

  it("matches callback query with predicate function pattern", async () => {
    const callback = vi.fn();
    const handler = new CallbackQueryHandler(callback, (data) => data.startsWith("item:"));

    const update = new Update({
      update_id: 1,
      callback_query: {
        id: "cb_1",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        chat_instance: "inst1",
        data: "item:123",
      },
    }, bot);

    expect(await handler.checkUpdate(update)).toBe(true);
  });

  it("returns false if update does not have callback_query", async () => {
    const handler = new CallbackQueryHandler(vi.fn());
    const update = new Update({ update_id: 1, message: { message_id: 1, date: 123, chat: { id: 1, type: "private" } } });
    expect(await handler.checkUpdate(update)).toBe(false);
  });
});

describe("InlineQueryHandler", () => {
  const bot = new Bot("TEST_TOKEN");

  it("matches inline query with RegExp and populates context.matches", async () => {
    const callback = vi.fn();
    const handler = new InlineQueryHandler(callback, /^search\s+(.+)$/);

    const update = new Update({
      update_id: 1,
      inline_query: {
        id: "iq_1",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        query: "search books",
        offset: "",
      },
    }, bot);

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(context.matches?.[0]?.[1]).toBe("books");
  });

  it("returns false when query does not match pattern or update is missing inline_query", async () => {
    const handler = new InlineQueryHandler(vi.fn(), "exact_match");
    const update = new Update({
      update_id: 1,
      inline_query: {
        id: "iq_1",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        query: "other",
        offset: "",
      },
    });
    expect(await handler.checkUpdate(update)).toBe(false);
  });
});

describe("ChosenInlineResultHandler", () => {
  const bot = new Bot("TEST_TOKEN");

  it("matches chosen inline result and checks pattern against query", async () => {
    const callback = vi.fn();
    const handler = new ChosenInlineResultHandler(callback, /^res_(\w+)$/);

    const update = new Update({
      update_id: 1,
      chosen_inline_result: {
        result_id: "r1",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        query: "res_success",
      },
    }, bot);

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(context.matches?.[0]?.[1]).toBe("success");
  });
});

describe("PollAnswerHandler", () => {
  const bot = new Bot("TEST_TOKEN");

  it("matches poll answer update", async () => {
    const callback = vi.fn();
    const handler = new PollAnswerHandler(callback);

    const update = new Update({
      update_id: 1,
      poll_answer: {
        poll_id: "poll_123",
        user: { id: 123, is_bot: false, first_name: "Alice" },
        option_ids: [0, 2],
      },
    }, bot);

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("ChatMemberHandler", () => {
  const bot = new Bot("TEST_TOKEN");

  it("matches chat_member update with CHAT_MEMBER type", async () => {
    const callback = vi.fn();
    const handler = new ChatMemberHandler(callback, ChatMemberHandler.CHAT_MEMBER);

    const update = new Update({
      update_id: 1,
      chat_member: {
        chat: { id: 123, type: "group" },
        from: { id: 456, is_bot: false, first_name: "Bob" },
        date: 123456,
        old_chat_member: { status: "left", user: { id: 456, is_bot: false, first_name: "Bob" } },
        new_chat_member: { status: "member", user: { id: 456, is_bot: false, first_name: "Bob" } },
      },
    }, bot);

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("matches my_chat_member update with MY_CHAT_MEMBER type", async () => {
    const callback = vi.fn();
    const handler = new ChatMemberHandler(callback, ChatMemberHandler.MY_CHAT_MEMBER);

    const update = new Update({
      update_id: 1,
      my_chat_member: {
        chat: { id: 123, type: "supergroup" },
        from: { id: 456, is_bot: false, first_name: "Bob" },
        date: 123456,
        old_chat_member: { status: "member", user: { id: 999, is_bot: true, first_name: "Bot" } },
        new_chat_member: { status: "administrator", user: { id: 999, is_bot: true, first_name: "Bot" } },
      },
    }, bot);

    expect(await handler.checkUpdate(update)).toBe(true);
  });

  it("matches either update when using ChatMemberHandler.ANY", async () => {
    const handler = new ChatMemberHandler(vi.fn(), ChatMemberHandler.ANY);

    const update1 = new Update({
      update_id: 1,
      chat_member: {
        chat: { id: 123, type: "group" },
        from: { id: 456, is_bot: false, first_name: "Bob" },
        date: 123456,
        old_chat_member: { status: "left", user: { id: 456, is_bot: false, first_name: "Bob" } },
        new_chat_member: { status: "member", user: { id: 456, is_bot: false, first_name: "Bob" } },
      },
    });

    const update2 = new Update({
      update_id: 2,
      my_chat_member: {
        chat: { id: 123, type: "group" },
        from: { id: 456, is_bot: false, first_name: "Bob" },
        date: 123456,
        old_chat_member: { status: "left", user: { id: 999, is_bot: true, first_name: "Bot" } },
        new_chat_member: { status: "member", user: { id: 999, is_bot: true, first_name: "Bot" } },
      },
    });

    expect(await handler.checkUpdate(update1)).toBe(true);
    expect(await handler.checkUpdate(update2)).toBe(true);
  });
});

describe("TypeHandler", () => {
  const bot = new Bot("TEST_TOKEN");

  it("matches update using custom predicate", async () => {
    const callback = vi.fn();
    const handler = new TypeHandler((update: Update) => Boolean(update.business_connection), callback);

    const update = new Update({
      update_id: 1,
      business_connection: {
        id: "bc_1",
        user: { id: 123, is_bot: false, first_name: "Alice" },
        user_chat_id: 123,
        date: 123456,
        can_reply: true,
        is_enabled: true,
      },
    }, bot);

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

