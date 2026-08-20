import { describe, it, expect, vi } from "vitest";
import { CallbackContext } from "../../../src/kernel/context.js";
import { Update } from "../../../src/kernel/update.js";
import { Bot } from "../../../src/client/bot.js";
import { ApplicationBuilder } from "../../../src/kernel/app.js";
import { CommandHandler } from "../../../src/routing/handlers.js";
import type { RawUpdate } from "../../../src/client/types.js";

describe("CallbackContext", () => {
  const dummyBot = new Bot("123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11");

  it("constructs with default and custom values", () => {
    const ctx = new CallbackContext({
      bot: dummyBot,
      args: ["foo", "bar"],
      user_data: { score: 42 },
      chat_data: { title: "Dev Chat" },
      bot_data: { total: 1 },
    });

    expect(ctx.bot).toBe(dummyBot);
    expect(ctx.args).toEqual(["foo", "bar"]);
    expect(ctx.user_data).toEqual({ score: 42 });
    expect(ctx.chat_data).toEqual({ title: "Dev Chat" });
    expect(ctx.bot_data).toEqual({ total: 1 });
    expect(ctx.error).toBeUndefined();
    expect(ctx.matches).toBeUndefined();
  });

  it("leaves user_data and chat_data undefined when non-resolvable during dispatch", async () => {
    let capturedContext: CallbackContext | undefined;

    const app = new ApplicationBuilder()
      .token("123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11")
      .build();

    app.addHandler(
      new CommandHandler("test", (_update, context) => {
        capturedContext = context;
      })
    );

    // Update with message that has no 'from' and no 'chat' (edge case/synthetic)
    const rawUpdate: RawUpdate = {
      update_id: 1,
      message: {
        message_id: 10,
        date: 1600000000,
        text: "/test",
        chat: undefined as any,
        from: undefined,
        entities: [{ offset: 0, length: 5, type: "bot_command" }],
      },
    };

    await app.processUpdate(rawUpdate);

    expect(capturedContext).toBeDefined();
    expect(capturedContext?.bot_data).toEqual({});
    expect(capturedContext?.user_data).toBeUndefined();
    expect(capturedContext?.chat_data).toBeUndefined();
  });
});
