import { describe, it, expect, vi } from "vitest";
import { ConversationHandler } from "../../../src/routing/conversation.js";
import {
  CommandHandler,
  MessageHandler,
  CallbackQueryHandler,
} from "../../../src/routing/handlers.js";
import { filters } from "../../../src/filters/matchers.js";
import { Update } from "../../../src/kernel/update.js";
import { CallbackContext } from "../../../src/kernel/context.js";
import { Bot } from "../../../src/client/bot.js";
import type { RawUpdate } from "../../../src/client/types.js";

describe("ConversationHandler", () => {
  const dummyBot = new Bot("123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11");

  function createTextUpdate(text: string, chatId = 100, userId = 200, messageId = 1): Update {
    const raw: RawUpdate = {
      update_id: 1,
      message: {
        message_id: messageId,
        date: 1600000000,
        text,
        chat: { id: chatId, type: "private" },
        from: { id: userId, is_bot: false, first_name: "Test" },
        ...(text.startsWith("/")
          ? {
              entities: [
                {
                  offset: 0,
                  length: text.split(" ")[0]!.length,
                  type: "bot_command",
                },
              ],
            }
          : {}),
      },
    };
    return new Update(raw, dummyBot);
  }

  function createCallbackUpdate(data: string, chatId = 100, userId = 200, messageId = 1): Update {
    const raw: RawUpdate = {
      update_id: 2,
      callback_query: {
        id: "cb_1",
        from: { id: userId, is_bot: false, first_name: "Test" },
        chat_instance: "ci_1",
        data,
        message: {
          message_id: messageId,
          date: 1600000000,
          chat: { id: chatId, type: "private" },
        },
      },
    };
    return new Update(raw, dummyBot);
  }

  it("throws if no entry points are provided", () => {
    expect(() => {
      new ConversationHandler({
        entry_points: [],
        states: {},
        fallbacks: [],
      });
    }).toThrow("ConversationHandler requires at least one entry point.");
  });

  it("transitions through multi-step states: entry_points -> states[1] -> states[2] -> END", async () => {
    const STATE_NAME = 1;
    const STATE_AGE = 2;

    const startCb = vi.fn(async (_u, _c) => STATE_NAME);
    const nameCb = vi.fn(async (_u, _c) => STATE_AGE);
    const ageCb = vi.fn(async (_u, _c) => ConversationHandler.END);
    const cancelCb = vi.fn(async (_u, _c) => ConversationHandler.END);

    const conv = new ConversationHandler({
      entry_points: [new CommandHandler("start", startCb)],
      states: {
        [STATE_NAME]: [new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), nameCb)],
        [STATE_AGE]: [new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), ageCb)],
      },
      fallbacks: [new CommandHandler("cancel", cancelCb)],
    });

    const context = new CallbackContext({ bot: dummyBot });

    // 1. Initial non-matching text (not in conversation yet)
    const randomMsg = createTextUpdate("Hello");
    expect(await conv.checkUpdate(randomMsg)).toBe(false);

    // 2. /start matches entry_point
    const startMsg = createTextUpdate("/start");
    expect(await conv.checkUpdate(startMsg)).toBe(true);
    const res1 = await conv.handleUpdate(startMsg, context);
    expect(res1).toBe(STATE_NAME);
    expect(startCb).toHaveBeenCalledTimes(1);

    // 3. User sends their name -> matches STATE_NAME
    const nameMsg = createTextUpdate("Alice");
    expect(await conv.checkUpdate(nameMsg)).toBe(true);
    const res2 = await conv.handleUpdate(nameMsg, context);
    expect(res2).toBe(STATE_AGE);
    expect(nameCb).toHaveBeenCalledTimes(1);

    // 4. User sends their age -> matches STATE_AGE, returns END
    const ageMsg = createTextUpdate("25");
    expect(await conv.checkUpdate(ageMsg)).toBe(true);
    const res3 = await conv.handleUpdate(ageMsg, context);
    expect(res3).toBe(ConversationHandler.END);
    expect(ageCb).toHaveBeenCalledTimes(1);

    // 5. Conversation has ended; another regular message is ignored
    const postEndMsg = createTextUpdate("Random text");
    expect(await conv.checkUpdate(postEndMsg)).toBe(false);
  });

  it("handles fallback handlers when in active state", async () => {
    const cancelCb = vi.fn(async (_u, _c) => ConversationHandler.END);
    const conv = new ConversationHandler({
      entry_points: [new CommandHandler("start", async () => 1)],
      states: {
        1: [new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async () => 2)],
      },
      fallbacks: [new CommandHandler("cancel", cancelCb)],
    });

    const context = new CallbackContext({ bot: dummyBot });

    // Enter state 1
    const startMsg = createTextUpdate("/start");
    await conv.checkUpdate(startMsg);
    await conv.handleUpdate(startMsg, context);

    // Send /cancel fallback
    const cancelMsg = createTextUpdate("/cancel");
    expect(await conv.checkUpdate(cancelMsg)).toBe(true);
    const res = await conv.handleUpdate(cancelMsg, context);
    expect(res).toBe(ConversationHandler.END);
    expect(cancelCb).toHaveBeenCalledTimes(1);
  });

  it("supports map_to_parent for nested conversation handlers", async () => {
    const innerConv = new ConversationHandler({
      entry_points: [new CommandHandler("sub", async () => 10)],
      states: {
        10: [
          new MessageHandler(
            filters.TEXT.and(filters.COMMAND.not()),
            async () => ConversationHandler.END,
          ),
        ],
      },
      fallbacks: [],
      map_to_parent: {
        [ConversationHandler.END]: 2, // Map inner END to parent state 2
      },
    });

    const context = new CallbackContext({ bot: dummyBot });

    const startMsg = createTextUpdate("/sub");
    await innerConv.checkUpdate(startMsg);
    await innerConv.handleUpdate(startMsg, context);

    const textMsg = createTextUpdate("Done sub task");
    await innerConv.checkUpdate(textMsg);
    const parentNext = await innerConv.handleUpdate(textMsg, context);
    expect(parentNext).toBe(2);
  });

  it("supports per_message tracking for callback queries", async () => {
    const conv = new ConversationHandler({
      entry_points: [new CallbackQueryHandler(async () => 1)],
      states: {
        1: [new CallbackQueryHandler(async () => ConversationHandler.END)],
      },
      fallbacks: [],
      per_message: true,
    });

    const context = new CallbackContext({ bot: dummyBot });

    const cb1 = createCallbackUpdate("btn_start", 100, 200, 555);
    expect(await conv.checkUpdate(cb1)).toBe(true);
    await conv.handleUpdate(cb1, context);

    // Query on same message is in state 1
    const cb2SameMsg = createCallbackUpdate("btn_next", 100, 200, 555);
    expect(await conv.checkUpdate(cb2SameMsg)).toBe(true);

    // Query on different message is not in conversation
    const cb2DiffMsg = createCallbackUpdate("btn_next", 100, 200, 999);
    expect(await conv.checkUpdate(cb2DiffMsg)).toBe(true); // Matches entry_point because it's new message!
  });

  it("supports allow_reentry to re-enter conversation", async () => {
    const conv = new ConversationHandler({
      entry_points: [new CommandHandler("start", async () => 1)],
      states: {
        1: [new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async () => 2)],
      },
      fallbacks: [],
      allow_reentry: true,
    });

    const context = new CallbackContext({ bot: dummyBot });

    // Enter state 1
    await conv.checkUpdate(createTextUpdate("/start"));
    await conv.handleUpdate(createTextUpdate("/start"), context);

    // Sending /start again while in state 1 should match entry point due to allow_reentry
    const reenter = createTextUpdate("/start");
    expect(await conv.checkUpdate(reenter)).toBe(true);
    const res = await conv.handleUpdate(reenter, context);
    expect(res).toBe(1);
  });
});
