import { describe, it, expect, vi } from "vitest";
import { Bot } from "../../../src/client/bot.js";
import { TelegramApiError } from "../../../src/client/types.js";

describe("Bot Composite Class Integration Tests", () => {
  it("initializes successfully and inherits all mixins", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        ok: true,
        result: { id: 123, is_bot: true, first_name: "TestBot" },
      }),
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    const me = await bot.getMe();
    expect(me.first_name).toBe("TestBot");
    expect(typeof bot.sendMessage).toBe("function");
    expect(typeof bot.banChatMember).toBe("function");
    expect(typeof bot.sendSticker).toBe("function");
    expect(typeof bot.sendInvoice).toBe("function");
    expect(typeof bot.createForumTopic).toBe("function");
    expect(typeof bot.postStory).toBe("function");
    expect(typeof bot.doApiRequest).toBe("function");
  });
});
