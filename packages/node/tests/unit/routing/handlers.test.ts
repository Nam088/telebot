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
  PreCheckoutQueryHandler,
  ShippingQueryHandler,
  PurchasedPaidMediaHandler,
  MessageReactionHandler,
  MessageReactionCountHandler,
  ChatJoinRequestHandler,
  ChatBoostHandler,
  BusinessConnectionHandler,
  BusinessMessagesHandler,
} from "../../../src/routing/handlers.js";
import { filters } from "../../../src/filters/matchers.js";
import { Update } from "../../../src/kernel/update.js";
import { CallbackContext } from "../../../src/kernel/context.js";
import { Bot } from "../../../src/client/bot.js";

describe("CommandHandler and MessageHandler", () => {
  const bot = new Bot("TEST_TOKEN");

  it("CommandHandler matches /start command and parses args", async () => {
    const callback = vi.fn();
    const handler = new CommandHandler("start", callback);

    const update = new Update(
      {
        update_id: 1,
        message: {
          message_id: 1,
          date: 123456,
          chat: { id: 123, type: "private" },
          text: "/start foo bar",
          entities: [{ type: "bot_command", offset: 0, length: 6 }],
        },
      },
      bot,
    );

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

    const update = new Update(
      {
        update_id: 1,
        message: {
          message_id: 1,
          date: 123456,
          chat: { id: 123, type: "private" },
          text: "/start",
          entities: [{ type: "bot_command", offset: 0, length: 6 }],
        },
      },
      bot,
    );

    const match = await handler.checkUpdate(update);
    expect(match).toBe(false);
  });

  it("MessageHandler matches text filter and executes callback", async () => {
    const callback = vi.fn();
    const handler = new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), callback);

    const update = new Update(
      {
        update_id: 1,
        message: {
          message_id: 1,
          date: 123456,
          chat: { id: 123, type: "private" },
          text: "Hello there",
        },
      },
      bot,
    );

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

    const update = new Update(
      {
        update_id: 1,
        callback_query: {
          id: "cb_1",
          from: { id: 123, is_bot: false, first_name: "Alice" },
          chat_instance: "inst1",
          data: "button_clicked",
        },
      },
      bot,
    );

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("matches callback query with string pattern", async () => {
    const callback = vi.fn();
    const handler = new CallbackQueryHandler(callback, "btn_yes");

    const updateMatch = new Update(
      {
        update_id: 1,
        callback_query: {
          id: "cb_1",
          from: { id: 123, is_bot: false, first_name: "Alice" },
          chat_instance: "inst1",
          data: "btn_yes",
        },
      },
      bot,
    );

    const updateNoMatch = new Update(
      {
        update_id: 2,
        callback_query: {
          id: "cb_2",
          from: { id: 123, is_bot: false, first_name: "Alice" },
          chat_instance: "inst1",
          data: "btn_no",
        },
      },
      bot,
    );

    expect(await handler.checkUpdate(updateMatch)).toBe(true);
    expect(await handler.checkUpdate(updateNoMatch)).toBe(false);
  });

  it("matches callback query with RegExp pattern and populates context.matches", async () => {
    const callback = vi.fn();
    const handler = new CallbackQueryHandler(callback, /^vote_(\d+)$/);

    const update = new Update(
      {
        update_id: 1,
        callback_query: {
          id: "cb_1",
          from: { id: 123, is_bot: false, first_name: "Alice" },
          chat_instance: "inst1",
          data: "vote_42",
        },
      },
      bot,
    );

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(context.matches?.[0]?.[1]).toBe("42");
  });

  it("matches callback query with predicate function pattern", async () => {
    const callback = vi.fn();
    const handler = new CallbackQueryHandler(callback, (data) => data.startsWith("item:"));

    const update = new Update(
      {
        update_id: 1,
        callback_query: {
          id: "cb_1",
          from: { id: 123, is_bot: false, first_name: "Alice" },
          chat_instance: "inst1",
          data: "item:123",
        },
      },
      bot,
    );

    expect(await handler.checkUpdate(update)).toBe(true);
  });

  it("does not swap callback and pattern based on function arity in the (callback, pattern) order", async () => {
    const seenData: string[] = [];
    const callback = vi.fn((update: Update) => {
      seenData.push(update.callback_query?.data ?? "");
    });
    // Predicate intentionally ignores its `data` parameter (arity 0) — an edge case the
    // old arity-based heuristic misread as "this must be the callback".
    const alwaysMatch = () => true;
    const handler = new CallbackQueryHandler(callback, alwaysMatch);

    const update = new Update(
      {
        update_id: 1,
        callback_query: {
          id: "cb_1",
          from: { id: 123, is_bot: false, first_name: "Alice" },
          chat_instance: "inst1",
          data: "item:123",
        },
      },
      bot,
    );

    expect(await handler.checkUpdate(update)).toBe(true);

    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(seenData).toEqual(["item:123"]);
  });

  it("returns false if update does not have callback_query", async () => {
    const handler = new CallbackQueryHandler(vi.fn());
    const update = new Update({
      update_id: 1,
      message: { message_id: 1, date: 123, chat: { id: 1, type: "private" } },
    });
    expect(await handler.checkUpdate(update)).toBe(false);
  });
});

describe("InlineQueryHandler", () => {
  const bot = new Bot("TEST_TOKEN");

  it("matches inline query with RegExp and populates context.matches", async () => {
    const callback = vi.fn();
    const handler = new InlineQueryHandler(callback, /^search\s+(.+)$/);

    const update = new Update(
      {
        update_id: 1,
        inline_query: {
          id: "iq_1",
          from: { id: 123, is_bot: false, first_name: "Alice" },
          query: "search books",
          offset: "",
        },
      },
      bot,
    );

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

    const update = new Update(
      {
        update_id: 1,
        chosen_inline_result: {
          result_id: "r1",
          from: { id: 123, is_bot: false, first_name: "Alice" },
          query: "res_success",
        },
      },
      bot,
    );

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

    const update = new Update(
      {
        update_id: 1,
        poll_answer: {
          poll_id: "poll_123",
          user: { id: 123, is_bot: false, first_name: "Alice" },
          option_ids: [0, 2],
        },
      },
      bot,
    );

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

    const update = new Update(
      {
        update_id: 1,
        chat_member: {
          chat: { id: 123, type: "group" },
          from: { id: 456, is_bot: false, first_name: "Bob" },
          date: 123456,
          old_chat_member: { status: "left", user: { id: 456, is_bot: false, first_name: "Bob" } },
          new_chat_member: {
            status: "member",
            user: { id: 456, is_bot: false, first_name: "Bob" },
          },
        },
      },
      bot,
    );

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("matches my_chat_member update with MY_CHAT_MEMBER type", async () => {
    const callback = vi.fn();
    const handler = new ChatMemberHandler(callback, ChatMemberHandler.MY_CHAT_MEMBER);

    const update = new Update(
      {
        update_id: 1,
        my_chat_member: {
          chat: { id: 123, type: "supergroup" },
          from: { id: 456, is_bot: false, first_name: "Bob" },
          date: 123456,
          old_chat_member: { status: "member", user: { id: 999, is_bot: true, first_name: "Bot" } },
          new_chat_member: {
            status: "administrator",
            user: { id: 999, is_bot: true, first_name: "Bot" },
          },
        },
      },
      bot,
    );

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
    const handler = new TypeHandler(
      (update: Update) => Boolean(update.business_connection),
      callback,
    );

    const update = new Update(
      {
        update_id: 1,
        business_connection: {
          id: "bc_1",
          user: { id: 123, is_bot: false, first_name: "Alice" },
          user_chat_id: 123,
          date: 123456,
          can_reply: true,
          is_enabled: true,
        },
      },
      bot,
    );

    expect(await handler.checkUpdate(update)).toBe(true);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("Payment & Stars Handlers", () => {
  const bot = new Bot("TEST_TOKEN");

  it("PreCheckoutQueryHandler matches pre_checkout_query update", async () => {
    const callback = vi.fn();
    const handler = new PreCheckoutQueryHandler(callback);

    const update = new Update({
      update_id: 1,
      pre_checkout_query: {
        id: "pcq_1",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        currency: "XTR",
        total_amount: 100,
        invoice_payload: "sub_1m",
      },
    });

    expect(await handler.checkUpdate(update)).toBe(true);
    const emptyUpdate = new Update({ update_id: 2 });
    expect(await handler.checkUpdate(emptyUpdate)).toBe(false);
  });

  it("ShippingQueryHandler matches shipping_query update", async () => {
    const callback = vi.fn();
    const handler = new ShippingQueryHandler(callback);

    const update = new Update({
      update_id: 1,
      shipping_query: {
        id: "sq_1",
        from: { id: 123, is_bot: false, first_name: "Alice" },
        invoice_payload: "payload_1",
        shipping_address: {
          country_code: "US",
          city: "New York",
          street_line1: "5th Ave",
          post_code: "10001",
        },
      },
    });

    expect(await handler.checkUpdate(update)).toBe(true);
  });

  it("PurchasedPaidMediaHandler matches purchased_paid_media update", async () => {
    const callback = vi.fn();
    const handler = new PurchasedPaidMediaHandler(callback);

    const update = new Update({
      update_id: 1,
      purchased_paid_media: {
        from: { id: 123, is_bot: false, first_name: "Alice" },
        paid_media_payload: "media_exclusive_1",
      },
    });

    expect(await handler.checkUpdate(update)).toBe(true);
    expect(update.effective_user?.first_name).toBe("Alice");
  });
});

describe("Message Reaction Handlers", () => {
  it("MessageReactionHandler matches any, string emoji, array, custom emoji, paid, and predicate", async () => {
    const callback = vi.fn();
    const anyHandler = new MessageReactionHandler(callback);
    const stringHandler = new MessageReactionHandler(callback, "👍");
    const arrayHandler = new MessageReactionHandler(callback, ["🎉", "🔥"]);
    const customHandler = new MessageReactionHandler(callback, {
      type: "custom_emoji",
      custom_emoji_id: "ce_123",
    });
    const paidHandler = new MessageReactionHandler(callback, { type: "paid" });
    const funcHandler = new MessageReactionHandler(
      callback,
      (u) => (u.message_reaction?.message_id ?? 0) > 10,
    );

    const updateEmoji = new Update({
      update_id: 1,
      message_reaction: {
        chat: { id: 123, type: "private" },
        message_id: 100,
        date: 123456,
        old_reaction: [],
        new_reaction: [{ type: "emoji", emoji: "👍" }],
      },
    });

    expect(await anyHandler.checkUpdate(updateEmoji)).toBe(true);
    expect(await stringHandler.checkUpdate(updateEmoji)).toBe(true);
    expect(await arrayHandler.checkUpdate(updateEmoji)).toBe(false);
    expect(await customHandler.checkUpdate(updateEmoji)).toBe(false);
    expect(await paidHandler.checkUpdate(updateEmoji)).toBe(false);
    expect(await funcHandler.checkUpdate(updateEmoji)).toBe(true);

    const updateCustom = new Update({
      update_id: 2,
      message_reaction: {
        chat: { id: 123, type: "private" },
        message_id: 5,
        date: 123456,
        old_reaction: [],
        new_reaction: [{ type: "custom_emoji", custom_emoji_id: "ce_123" }],
      },
    });

    expect(await customHandler.checkUpdate(updateCustom)).toBe(true);
    expect(await stringHandler.checkUpdate(updateCustom)).toBe(false);
    expect(await funcHandler.checkUpdate(updateCustom)).toBe(false);

    const updatePaid = new Update({
      update_id: 3,
      message_reaction: {
        chat: { id: 123, type: "private" },
        message_id: 200,
        date: 123456,
        old_reaction: [],
        new_reaction: [{ type: "paid" }],
      },
    });
    expect(await paidHandler.checkUpdate(updatePaid)).toBe(true);

    const emptyUpdate = new Update({ update_id: 4 });
    expect(await anyHandler.checkUpdate(emptyUpdate)).toBe(false);
  });

  it("MessageReactionCountHandler matches message_reaction_count", async () => {
    const handler = new MessageReactionCountHandler(vi.fn());
    const update = new Update({
      update_id: 1,
      message_reaction_count: {
        chat: { id: 123, type: "group" },
        message_id: 50,
        date: 123456,
        reactions: [{ type: { type: "emoji", emoji: "❤️" }, total_count: 5 }],
      },
    });
    expect(await handler.checkUpdate(update)).toBe(true);
  });
});

describe("ChatJoinRequest and ChatBoost Handlers", () => {
  it("ChatJoinRequestHandler matches chat_join_request update", async () => {
    const handler = new ChatJoinRequestHandler(vi.fn());
    const update = new Update({
      update_id: 1,
      chat_join_request: {
        chat: { id: -100123, type: "channel", title: "VIP" },
        from: { id: 456, is_bot: false, first_name: "Bob" },
        user_chat_id: 456,
        date: 123456,
      },
    });
    expect(await handler.checkUpdate(update)).toBe(true);
  });

  it("ChatBoostHandler matches added, removed, and any boost updates", async () => {
    const anyHandler = new ChatBoostHandler(vi.fn(), ChatBoostHandler.ANY);
    const addedHandler = new ChatBoostHandler(vi.fn(), ChatBoostHandler.ADDED);
    const removedHandler = new ChatBoostHandler(vi.fn(), ChatBoostHandler.REMOVED);

    const addedUpdate = new Update({
      update_id: 1,
      chat_boost: {
        chat: { id: -100123, type: "supergroup" },
        boost: {
          boost_id: "b1",
          add_date: 123456,
          expiration_date: 234567,
          source: { source: "premium", user: { id: 1, is_bot: false, first_name: "A" } },
        },
      },
    });

    const removedUpdate = new Update({
      update_id: 2,
      removed_chat_boost: {
        chat: { id: -100123, type: "supergroup" },
        boost_id: "b1",
        remove_date: 123456,
        source: { source: "premium", user: { id: 1, is_bot: false, first_name: "A" } },
      },
    });

    expect(await anyHandler.checkUpdate(addedUpdate)).toBe(true);
    expect(await anyHandler.checkUpdate(removedUpdate)).toBe(true);
    expect(await addedHandler.checkUpdate(addedUpdate)).toBe(true);
    expect(await addedHandler.checkUpdate(removedUpdate)).toBe(false);
    expect(await removedHandler.checkUpdate(removedUpdate)).toBe(true);
    expect(await removedHandler.checkUpdate(addedUpdate)).toBe(false);
  });
});

describe("Business Handlers", () => {
  it("BusinessConnectionHandler matches business_connection update", async () => {
    const handler = new BusinessConnectionHandler(vi.fn());
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
    });
    expect(await handler.checkUpdate(update)).toBe(true);
  });

  it("BusinessMessagesHandler matches business_message, edited_business_message, deleted_business_messages", async () => {
    const handler = new BusinessMessagesHandler(vi.fn());

    const updateMsg = new Update({
      update_id: 1,
      business_message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "hello business",
      },
    });
    const updateEdited = new Update({
      update_id: 2,
      edited_business_message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "edited business",
      },
    });
    const updateDeleted = new Update({
      update_id: 3,
      deleted_business_messages: {
        business_connection_id: "bc_1",
        chat: { id: 123, type: "private" },
        message_ids: [1, 2],
      },
    });

    expect(await handler.checkUpdate(updateMsg)).toBe(true);
    expect(await handler.checkUpdate(updateEdited)).toBe(true);
    expect(await handler.checkUpdate(updateDeleted)).toBe(true);
  });
});
