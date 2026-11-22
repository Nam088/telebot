import { describe, it, expect, vi } from "vitest";
import { Bot } from "../../../../src/client/bot.js";

function createMockBot(result: unknown = true) {
  const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
  const fakeFetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
    calls.push({ url, body });
    return {
      status: 200,
      json: async () => ({ ok: true, result }),
    };
  });
  const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
  return { bot, calls };
}

describe("Bot API 10.4 Methods", () => {
  it("sendWidget sends widget payload and returns Message", async () => {
    const fakeMsg = {
      message_id: 101,
      date: 1700000000,
      chat: { id: 123, type: "private" },
      widget: { id: "w1", html: "<div>hi</div>", width: 320, height: 240 },
    };
    const { bot, calls } = createMockBot(fakeMsg);

    const res = await bot.sendWidget({
      chat_id: 123,
      html: "<div>hi</div>",
      width: 320,
      height: 240,
      public_data: '{"v":1}',
      chat_data: '{"c":2}',
      allow_queries: true,
      is_shared: false,
    });

    expect(res).toEqual(fakeMsg);
    expect(calls[0]?.url).toContain("/sendWidget");
    expect(calls[0]?.body).toEqual({
      chat_id: 123,
      html: "<div>hi</div>",
      width: 320,
      height: 240,
      public_data: '{"v":1}',
      chat_data: '{"c":2}',
      allow_queries: true,
      is_shared: false,
    });
  });

  it("sendSharedWidget sends shared widget_id and returns Message", async () => {
    const fakeMsg = { message_id: 102, date: 1700000000, chat: { id: 123, type: "private" } };
    const { bot, calls } = createMockBot(fakeMsg);

    const res = await bot.sendSharedWidget({
      chat_id: 123,
      widget_id: "shared_1",
      chat_data: '{"a":1}',
    });

    expect(res).toEqual(fakeMsg);
    expect(calls[0]?.url).toContain("/sendSharedWidget");
    expect(calls[0]?.body).toEqual({
      chat_id: 123,
      widget_id: "shared_1",
      chat_data: '{"a":1}',
    });
  });

  it("answerWidgetQuery answers a widget query", async () => {
    const { bot, calls } = createMockBot(true);
    const res = await bot.answerWidgetQuery({ widget_query_id: "wq_1", data: "ok" });
    expect(res).toBe(true);
    expect(calls[0]?.url).toContain("/answerWidgetQuery");
    expect(calls[0]?.body).toEqual({ widget_query_id: "wq_1", data: "ok" });
  });

  it("editMessageWidgetData edits widget data on a message", async () => {
    const { bot, calls } = createMockBot(true);
    const res = await bot.editMessageWidgetData({
      chat_id: 123,
      message_id: 101,
      public_data: '{"x":1}',
      chat_data: '{"y":2}',
    });
    expect(res).toBe(true);
    expect(calls[0]?.url).toContain("/editMessageWidgetData");
    expect(calls[0]?.body).toEqual({
      chat_id: 123,
      message_id: 101,
      public_data: '{"x":1}',
      chat_data: '{"y":2}',
    });
  });

  it("editSharedWidgetData edits public data of a shared widget", async () => {
    const { bot, calls } = createMockBot(true);
    const res = await bot.editSharedWidgetData({
      widget_id: "shared_1",
      public_data: '{"x":2}',
      cache_time: 60,
    });
    expect(res).toBe(true);
    expect(calls[0]?.url).toContain("/editSharedWidgetData");
    expect(calls[0]?.body).toEqual({
      widget_id: "shared_1",
      public_data: '{"x":2}',
      cache_time: 60,
    });
  });

  it("getChatShareThemeBackdrops returns backdrops", async () => {
    const fakeBackdrops = {
      backdrops: [
        {
          id: 1,
          name: "Emerald",
          colors: { center_color: 1, edge_color: 2, symbol_color: 3, text_color: 4 },
        },
      ],
    };
    const { bot, calls } = createMockBot(fakeBackdrops);
    const res = await bot.getChatShareThemeBackdrops();
    expect(res).toEqual(fakeBackdrops);
    expect(calls[0]?.url).toContain("/getChatShareThemeBackdrops");
  });

  it("getUniqueGift returns UniqueGift by name", async () => {
    const fakeGift = { gift_id: "g1", base_name: "Star", name: "Star-1", number: 1 };
    const { bot, calls } = createMockBot(fakeGift);
    const res = await bot.getUniqueGift("Star-1");
    expect(res).toEqual(fakeGift);
    expect(calls[0]?.url).toContain("/getUniqueGift");
    expect(calls[0]?.body).toEqual({ name: "Star-1" });
  });

  it("deleteBusinessAccountGift deletes a regular gift", async () => {
    const { bot, calls } = createMockBot(true);
    const res = await bot.deleteBusinessAccountGift("bc_1", "og_1");
    expect(res).toBe(true);
    expect(calls[0]?.url).toContain("/deleteBusinessAccountGift");
    expect(calls[0]?.body).toEqual({
      business_connection_id: "bc_1",
      owned_gift_id: "og_1",
    });
  });

  it("verifyUser and verifyChat accept custom_description_parse_mode and custom_description_entities", async () => {
    const { bot, calls } = createMockBot(true);
    await bot.verifyUser(42, "Verified", {
      custom_description_parse_mode: "HTML",
      custom_description_entities: [{ type: "bold", offset: 0, length: 8 }],
    });
    expect(calls[0]?.url).toContain("/verifyUser");
    expect(calls[0]?.body).toEqual({
      user_id: 42,
      custom_description: "Verified",
      custom_description_parse_mode: "HTML",
      custom_description_entities: [{ type: "bold", offset: 0, length: 8 }],
    });

    await bot.verifyChat(-1001, "Official", {
      custom_description_parse_mode: "MarkdownV2",
      custom_description_entities: [{ type: "italic", offset: 0, length: 8 }],
    });
    expect(calls[1]?.url).toContain("/verifyChat");
    expect(calls[1]?.body).toEqual({
      chat_id: -1001,
      custom_description: "Official",
      custom_description_parse_mode: "MarkdownV2",
      custom_description_entities: [{ type: "italic", offset: 0, length: 8 }],
    });
  });

  it("sendMessage allows omitting chat_id when ephemeral_message_parameters has callback_query_id", async () => {
    const fakeMsg = { message_id: 1, date: 1700000000, chat: { id: 1, type: "private" } };
    const { bot, calls } = createMockBot(fakeMsg);
    const res = await bot.sendMessage({
      text: "Ephemeral",
      ephemeral_message_parameters: { callback_query_id: "cq_1" },
    });
    expect(res).toEqual(fakeMsg);
    expect(calls[0]?.body).toEqual({
      text: "Ephemeral",
      ephemeral_message_parameters: { callback_query_id: "cq_1" },
    });
  });
});
