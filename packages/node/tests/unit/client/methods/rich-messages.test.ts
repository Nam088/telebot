import { describe, it, expect, vi } from "vitest";
import { Bot } from "../../../../src/client/bot.js";
import type { InputRichMessage, Message } from "../../../../src/client/types.js";

/**
 * Builds a Bot whose transport is a mock fetch, recording the parsed JSON payload
 * Telegram would have received, keyed by wire method name. No network is involved.
 */
function makeRecordingBot(result: unknown = true) {
  const calls: Record<string, { payload: Record<string, unknown>; url: string }> = {};

  const fetchMock = vi.fn().mockImplementation(async (url: string, init: RequestInit) => {
    const method = (url.split("/").pop() ?? "").split("?")[0] ?? "";
    calls[method] = { payload: JSON.parse(String(init.body)) as Record<string, unknown>, url };
    return { status: 200, json: async () => ({ ok: true, result }) };
  });

  return { bot: new Bot("TEST_TOKEN", { fetch: fetchMock }), calls, fetchMock };
}

describe("Rich message Bot API surface (10.3 docs parity)", () => {
  it("sendRichMessage accepts and serializes all 13 documented parameters", async () => {
    const { bot, calls } = makeRecordingBot({
      message_id: 7,
      date: 1,
      chat: { id: 1, type: "private" },
    });

    const sent: Message = await bot.sendRichMessage({
      business_connection_id: "bc-1",
      chat_id: -100123,
      message_thread_id: 42,
      direct_messages_topic_id: 9,
      ephemeral_message_parameters: { receiver_user_id: 555 },
      rich_message: { markdown: "hello" },
      disable_notification: true,
      protect_content: true,
      allow_paid_broadcast: true,
      message_effect_id: "effect-1",
      suggested_post_parameters: { price: { currency: "XTR", amount: 250 }, send_date: 1893456000 },
      reply_parameters: { message_id: 3, quote: "quoted" },
      reply_markup: { inline_keyboard: [[{ text: "Go", url: "https://example.com" }]] },
    });

    expect(sent.message_id).toBe(7);

    const payload = calls["sendRichMessage"]?.payload ?? {};
    expect(Object.keys(payload).sort()).toEqual(
      [
        "allow_paid_broadcast",
        "business_connection_id",
        "chat_id",
        "direct_messages_topic_id",
        "disable_notification",
        "ephemeral_message_parameters",
        "message_effect_id",
        "message_thread_id",
        "protect_content",
        "reply_markup",
        "reply_parameters",
        "rich_message",
        "suggested_post_parameters",
      ].sort(),
    );
    expect(payload["business_connection_id"]).toBe("bc-1");
    expect(payload["chat_id"]).toBe(-100123);
    expect(payload["message_thread_id"]).toBe(42);
    expect(payload["direct_messages_topic_id"]).toBe(9);
    expect(payload["ephemeral_message_parameters"]).toEqual({ receiver_user_id: 555 });
    expect(payload["rich_message"]).toEqual({ markdown: "hello" });
    expect(payload["disable_notification"]).toBe(true);
    expect(payload["protect_content"]).toBe(true);
    expect(payload["allow_paid_broadcast"]).toBe(true);
    expect(payload["message_effect_id"]).toBe("effect-1");
    expect(payload["suggested_post_parameters"]).toEqual({
      price: { currency: "XTR", amount: 250 },
      send_date: 1893456000,
    });
    expect(payload["reply_parameters"]).toEqual({ message_id: 3, quote: "quoted" });
    expect(payload["reply_markup"]).toEqual({
      inline_keyboard: [[{ text: "Go", url: "https://example.com" }]],
    });
  });

  it("sendRichMessage omits parameters the caller did not pass", async () => {
    const { bot, calls } = makeRecordingBot({
      message_id: 8,
      date: 1,
      chat: { id: 1, type: "private" },
    });

    await bot.sendRichMessage({ chat_id: 1, rich_message: { blocks: [] } });

    const payload = calls["sendRichMessage"]?.payload ?? {};
    expect(payload["chat_id"]).toBe(1);
    expect(payload["allow_paid_broadcast"]).toBeUndefined();
    expect(payload["reply_parameters"]).toBeUndefined();
    expect(payload["suggested_post_parameters"]).toBeUndefined();
    expect(payload["direct_messages_topic_id"]).toBeUndefined();
  });

  it("sendRichMessage accepts a reply keyboard as reply_markup", async () => {
    const { bot, calls } = makeRecordingBot({
      message_id: 9,
      date: 1,
      chat: { id: 1, type: "private" },
    });

    await bot.sendRichMessage({
      chat_id: 1,
      rich_message: { blocks: [] },
      reply_markup: { keyboard: [[{ text: "ok" }]], one_time_keyboard: true },
    });

    expect(calls["sendRichMessage"]?.payload["reply_markup"]).toEqual({
      keyboard: [[{ text: "ok" }]],
      one_time_keyboard: true,
    });
  });

  it("sendRichMessageDraft sends exactly the 6 documented parameters", async () => {
    const { bot, calls } = makeRecordingBot();

    const ok = await bot.sendRichMessageDraft({
      chat_id: 12345,
      message_thread_id: 3,
      draft_id: 1000000000,
      rich_message: { markdown: "partial answer" },
      can_stop: true,
      keep_on_stop: true,
    });

    expect(ok).toBe(true);
    const payload = calls["sendRichMessageDraft"]?.payload ?? {};
    expect(Object.keys(payload).sort()).toEqual([
      "can_stop",
      "chat_id",
      "draft_id",
      "keep_on_stop",
      "message_thread_id",
      "rich_message",
    ]);
  });

  it("voice_note blocks serialize with the documented 'voice_note' discriminator", async () => {
    const { bot, calls } = makeRecordingBot();

    const richMessage: InputRichMessage = {
      blocks: [
        {
          type: "voice_note",
          voice_note: {
            type: "voice_note",
            media: "voice_123",
            duration: 12,
            caption_entities: [{ type: "bold", offset: 0, length: 5 }],
          },
        },
      ],
      media: [{ id: "v1", media: { type: "voice_note", media: "voice_123" } }],
    };

    await bot.sendRichMessage({ chat_id: 1, rich_message: richMessage });

    const payload = calls["sendRichMessage"]?.payload ?? {};
    const rich = payload["rich_message"] as unknown as {
      blocks?: { type: string; voice_note?: Record<string, unknown> }[];
      media?: { media?: Record<string, unknown> }[];
    };
    expect(rich.blocks?.[0]?.type).toBe("voice_note");
    expect(rich.blocks?.[0]?.voice_note?.["type"]).toBe("voice_note");
    expect(rich.media?.[0]?.media?.["type"]).toBe("voice_note");
  });

  it("document and buttons blocks serialize a full InputMediaDocument and a free-form style", async () => {
    const { bot, calls } = makeRecordingBot();

    await bot.sendRichMessage({
      chat_id: 1,
      rich_message: {
        blocks: [
          {
            type: "document",
            document: { type: "document", media: "doc_123", disable_content_type_detection: true },
          },
          {
            type: "buttons",
            buttons: [
              { text: "Danger", style: "danger" },
              { text: "Future", style: "some_future_style" },
            ],
          },
        ],
      },
    });

    const payload = calls["sendRichMessage"]?.payload ?? {};
    const blocks = (
      payload["rich_message"] as unknown as {
        blocks?: Record<string, unknown>[];
      }
    ).blocks;
    expect(blocks?.[0]?.["document"]).toEqual({
      type: "document",
      media: "doc_123",
      disable_content_type_detection: true,
    });
    expect(blocks?.[1]?.["buttons"]).toEqual([
      { text: "Danger", style: "danger" },
      { text: "Future", style: "some_future_style" },
    ]);
  });

  it("editMessageText and editEphemeralMessageText accept rich_message with typed link_preview_options", async () => {
    const { bot, calls } = makeRecordingBot();

    await bot.editMessageText({
      chat_id: 1,
      message_id: 2,
      rich_message: { blocks: [] },
      link_preview_options: { is_disabled: true, show_above_text: false },
    });
    await bot.editEphemeralMessageText({
      chat_id: 1,
      receiver_user_id: 2,
      ephemeral_message_id: 3,
      rich_message: { html: "<b>hi</b>" },
      link_preview_options: { url: "https://example.com" },
    });

    expect(calls["editMessageText"]?.payload["link_preview_options"]).toEqual({
      is_disabled: true,
      show_above_text: false,
    });
    const ephemeral = calls["editEphemeralMessageText"]?.payload ?? {};
    expect(ephemeral["receiver_user_id"]).toBe(2);
    expect(ephemeral["ephemeral_message_id"]).toBe(3);
    expect(ephemeral["text"]).toBeUndefined();
    expect(ephemeral["link_preview_options"]).toEqual({ url: "https://example.com" });
  });

  it("rejects with a typed error when Telegram returns an error for sendRichMessage", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 400,
      ok: false,
      json: async () => ({
        ok: false,
        error_code: 400,
        description: "REQUEST_PARAMETERS_INVALID: parameter rich_message is missing",
      }),
    });
    const bot = new Bot("TEST_TOKEN", { fetch: fetchMock });

    await expect(bot.sendRichMessage({ chat_id: 1, rich_message: {} })).rejects.toThrow(
      /rich_message is missing/,
    );
  });
});
