import { describe, it, expect, vi } from "vitest";
import {
  AsyncConversation,
  AsyncConversationManager,
  ConversationTimeoutError,
  ConversationExitSignal,
} from "../../../src/routing/async-conversation.js";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";
import { CallbackContext } from "../../../src/kernel/context.js";
import { Update } from "../../../src/kernel/update.js";
import { filters } from "../../../src/filters/matchers.js";

describe("Linear Async/Await Conversation System", () => {
  describe("AsyncConversationManager & Unit Operations", () => {
    it("throws error when registering conversation with empty name", () => {
      const manager = new AsyncConversationManager();
      expect(() => manager.register("", async () => {})).toThrow(TypeError);
      expect(() => manager.register("   ", async () => {})).toThrow(TypeError);
    });

    it("throws error when entering unregistered conversation", async () => {
      const manager = new AsyncConversationManager();
      const bot = new Bot("123:TOKEN");
      const ctx = new CallbackContext({ bot });

      await expect(manager.enter("non_existent", ctx, 123)).rejects.toThrow(
        "Conversation 'non_existent' is not registered.",
      );
    });

    it("times out when wait exceeds timeoutMs", async () => {
      const manager = new AsyncConversationManager();
      const bot = new Bot("123:TOKEN");
      const ctx = new CallbackContext({ bot });

      let caughtError: unknown;
      manager.register("timeout_test", async (conv) => {
        try {
          await conv.wait(undefined, { timeoutMs: 10 });
        } catch (err) {
          caughtError = err;
        }
      });

      await manager.enter("timeout_test", ctx, 123, 456);

      // Wait for timer to trigger
      await new Promise((resolve) => setTimeout(resolve, 30));

      expect(caughtError).toBeInstanceOf(ConversationTimeoutError);
    });

    it("exits early without error when conv.exit() is called", async () => {
      const manager = new AsyncConversationManager();
      const bot = new Bot("123:TOKEN");
      const ctx = new CallbackContext({ bot });
      let afterExitReached = false;

      manager.register("exit_test", async (conv) => {
        conv.exit();
        afterExitReached = true;
      });

      await manager.enter("exit_test", ctx, 123);
      expect(afterExitReached).toBe(false);
      expect(manager.hasActiveSession(123)).toBe(false);
    });
  });

  describe("Application Integration & Sequential Multi-Step Flows", () => {
    it("completes sequential multi-step ask() and message interaction", async () => {
      const bot = new Bot("123:TOKEN");
      const sendSpy = vi.spyOn(bot, "sendMessage").mockResolvedValue({
        message_id: 1,
        date: 1000,
        chat: { id: 100, type: "private" },
      } as any);

      const app = new Application(bot);

      let capturedName = "";
      let capturedCity = "";

      app.conversation("profile_survey", async (conv, ctx) => {
        capturedName = await conv.ask("What is your name?");
        capturedCity = await conv.ask(`Great, ${capturedName}! Which city do you live in?`);
        await ctx.reply(`Thank you! Saved: ${capturedName} from ${capturedCity}`);
      });

      app.command("start", async (update, ctx) => {
        await ctx.conversation.enter("profile_survey");
      });

      // 1. Send /start command
      await app.processUpdate({
        update_id: 1,
        message: {
          message_id: 10,
          date: 1000,
          chat: { id: 100, type: "private" },
          from: { id: 555, is_bot: false, first_name: "Alice" },
          text: "/start",
          entities: [{ type: "bot_command", offset: 0, length: 6 }],
        },
      });

      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          chat_id: 100,
          text: "What is your name?",
        }),
      );

      // 2. User sends name
      await app.processUpdate({
        update_id: 2,
        message: {
          message_id: 11,
          date: 1001,
          chat: { id: 100, type: "private" },
          from: { id: 555, is_bot: false, first_name: "Alice" },
          text: "Alice Wonderland",
        },
      });

      expect(capturedName).toBe("Alice Wonderland");
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          chat_id: 100,
          text: "Great, Alice Wonderland! Which city do you live in?",
        }),
      );

      // 3. User sends city
      await app.processUpdate({
        update_id: 3,
        message: {
          message_id: 12,
          date: 1002,
          chat: { id: 100, type: "private" },
          from: { id: 555, is_bot: false, first_name: "Alice" },
          text: "London",
        },
      });

      expect(capturedCity).toBe("London");
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          chat_id: 100,
          text: "Thank you! Saved: Alice Wonderland from London",
        }),
      );
    });

    it("waits for specific message filters (e.g. photos) using waitForMessage", async () => {
      const bot = new Bot("123:TOKEN");
      vi.spyOn(bot, "sendMessage").mockResolvedValue({} as any);

      const app = new Application(bot);
      let receivedPhotoFileId = "";

      app.conversation("avatar_upload", async (conv, ctx) => {
        await ctx.reply("Please send a photo:");
        const photoMsg = await conv.waitForMessage({ filter: filters.PHOTO });
        receivedPhotoFileId = photoMsg.photo?.[0]?.file_id ?? "";
      });

      await app.enterConversation(777, "avatar_upload");

      // 1. User sends plain text (should be ignored by filter)
      await app.processUpdate({
        update_id: 10,
        message: {
          message_id: 100,
          date: 1000,
          chat: { id: 777, type: "private" },
          from: { id: 777, is_bot: false, first_name: "Bob" },
          text: "I don't want to send photo",
        },
      });

      expect(receivedPhotoFileId).toBe("");

      // 2. User sends photo
      await app.processUpdate({
        update_id: 11,
        message: {
          message_id: 101,
          date: 1001,
          chat: { id: 777, type: "private" },
          from: { id: 777, is_bot: false, first_name: "Bob" },
          photo: [{ file_id: "photo_abc_123", file_unique_id: "u1", width: 100, height: 100 }],
        },
      });

      expect(receivedPhotoFileId).toBe("photo_abc_123");
    });

    it("waits for callback query buttons using waitForCallbackQuery", async () => {
      const bot = new Bot("123:TOKEN");
      vi.spyOn(bot, "sendMessage").mockResolvedValue({} as any);
      const answerCallbackSpy = vi.spyOn(bot, "answerCallbackQuery").mockResolvedValue(true);

      const app = new Application(bot);
      let selectedOption = "";

      app.conversation("choice_flow", async (conv, ctx) => {
        await ctx.reply("Pick an option:");
        const query = await conv.waitForCallbackQuery({ pattern: /^opt:/ });
        selectedOption = query.data ?? "";
        await ctx.bot.answerCallbackQuery({ callback_query_id: query.id });
      });

      await app.enterConversation(888, "choice_flow");

      // User clicks matching button
      await app.processUpdate({
        update_id: 20,
        callback_query: {
          id: "cq_choice_1",
          chat_instance: "ci",
          from: { id: 888, is_bot: false, first_name: "Charlie" },
          data: "opt:premium_plan",
          message: {
            message_id: 200,
            date: 1000,
            chat: { id: 888, type: "private" },
          },
        },
      });

      expect(selectedOption).toBe("opt:premium_plan");
      expect(answerCallbackSpy).toHaveBeenCalledWith({ callback_query_id: "cq_choice_1" });
    });
  });
});
