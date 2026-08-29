import { describe, it, expect, vi } from "vitest";
import { Bot } from "../../../src/client/bot.js";
import type {
  InputRichMessage,
  UniqueGiftInfo,
  DisabledButton,
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  PromoteChatMemberOptions,
} from "../../../src/client/types.js";

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

  it("supports sendMessageDraft with can_stop and keep_on_stop (Bot API 10.3)", async () => {
    let calledPayload: Record<string, unknown> = {};

    const fakeFetch = vi.fn().mockImplementation(async (_url, init) => {
      calledPayload = JSON.parse(init.body);
      return {
        status: 200,
        json: async () => ({ ok: true, result: true }),
      };
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    const result = await bot.sendMessageDraft({
      chat_id: 12345,
      draft_id: 101,
      text: "Generating...",
      can_stop: true,
      keep_on_stop: false,
    });

    expect(result).toBe(true);
    expect(calledPayload["chat_id"]).toBe(12345);
    expect(calledPayload["draft_id"]).toBe(101);
    expect(calledPayload["can_stop"]).toBe(true);
    expect(calledPayload["keep_on_stop"]).toBe(false);
  });

  it("supports sendLivePhoto (Bot API 10.3)", async () => {
    let calledPayload: Record<string, unknown> = {};

    const fakeFetch = vi.fn().mockImplementation(async (_url, init) => {
      calledPayload = JSON.parse(init.body);
      return {
        status: 200,
        json: async () => ({
          ok: true,
          result: {
            message_id: 1,
            date: 123456,
            chat: { id: 12345, type: "private" },
            live_photo: {
              file_id: "photo_123",
              file_unique_id: "u_photo_123",
              width: 800,
              height: 600,
              photo: [{ file_id: "photo_123", file_unique_id: "u_photo_123", width: 800, height: 600 }],
              video: { file_id: "video_123", file_unique_id: "u_video_123", width: 800, height: 600, duration: 3 },
            },
          },
        }),
      };
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    const msg = await bot.sendLivePhoto({
      chat_id: 12345,
      photo: "photo_123",
      video: "video_123",
      caption: "Live Photo Caption",
      show_caption_above_media: true,
      ephemeral_message_parameters: {
        receiver_user_id: 999,
        replace_callback_query_message: true,
      },
    });

    expect(msg.message_id).toBe(1);
    expect(msg.live_photo?.file_id).toBe("photo_123");
    expect(calledPayload["chat_id"]).toBe(12345);
    expect(calledPayload["show_caption_above_media"]).toBe(true);
    expect(calledPayload["ephemeral_message_parameters"]).toEqual({
      receiver_user_id: 999,
      replace_callback_query_message: true,
    });
  });

  it("supports sendRichMessage and sendRichMessageDraft (Bot API 10.3)", async () => {
    let richMessagePayload: Record<string, unknown> = {};
    let draftPayload: Record<string, unknown> = {};

    const fakeFetch = vi.fn().mockImplementation(async (url: string, init: any) => {
      const payload = JSON.parse(init.body);
      if (url.includes("sendRichMessageDraft")) {
        draftPayload = payload;
        return { status: 200, json: async () => ({ ok: true, result: true }) };
      }
      richMessagePayload = payload;
      return {
        status: 200,
        json: async () => ({
          ok: true,
          result: {
            message_id: 2,
            date: 123456,
            chat: { id: 12345, type: "private" },
          },
        }),
      };
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });

    const richMessage: InputRichMessage = {
      blocks: [
        {
          type: "table",
          rows: [
            { cells: [{ text: "Header 1" }, { text: "Header 2" }] },
            { cells: [{ text: "Val 1" }, { text: "Val 2" }] },
          ],
          is_compact: true,
        },
        {
          type: "expandable_block_quotation",
          text: "Expanded quote text",
        },
        {
          type: "document",
          document: "doc_123",
        },
        {
          type: "buttons",
          buttons: [
            [{ text: "Disabled Button", disabled: {} as DisabledButton }],
          ],
        },
      ],
    };

    const sent = await bot.sendRichMessage({
      chat_id: 12345,
      rich_message: richMessage,
      ephemeral_message_parameters: {
        receiver_user_id: 456,
      },
    });
    expect(sent.message_id).toBe(2);
    expect(richMessagePayload["chat_id"]).toBe(12345);

    const draftSuccess = await bot.sendRichMessageDraft({
      chat_id: 12345,
      draft_id: 202,
      rich_message: richMessage,
      can_stop: true,
      keep_on_stop: true,
    });
    expect(draftSuccess).toBe(true);
    expect(draftPayload["draft_id"]).toBe(202);
    expect(draftPayload["can_stop"]).toBe(true);
    expect(draftPayload["keep_on_stop"]).toBe(true);
  });

  it("supports editEphemeralMessageMedia, caption, reply markup, delete (Bot API 10.3)", async () => {
    const callLog: { method: string; payload: Record<string, unknown> }[] = [];

    const fakeFetch = vi.fn().mockImplementation(async (url: string, init: any) => {
      const method = url.split("/").pop() || "";
      const payload = JSON.parse(init.body);
      callLog.push({ method, payload });
      return { status: 200, json: async () => ({ ok: true, result: true }) };
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });

    await bot.editEphemeralMessageMedia({
      chat_id: 12345,
      receiver_user_id: 999,
      ephemeral_message_id: 55,
      media: {
        type: "photo",
        media: "photo_new",
      },
    });

    await bot.editEphemeralMessageCaption({
      chat_id: 12345,
      receiver_user_id: 999,
      ephemeral_message_id: 55,
      caption: "New caption",
      show_caption_above_media: true,
    });

    await bot.editEphemeralMessageReplyMarkup({
      chat_id: 12345,
      receiver_user_id: 999,
      ephemeral_message_id: 55,
      reply_markup: {
        inline_keyboard: [[{ text: "Btn", callback_data: "data" }]],
        force_reply: true,
      },
    });

    await bot.deleteEphemeralMessage({
      chat_id: 12345,
      receiver_user_id: 999,
      ephemeral_message_id: 55,
    });

    expect(callLog).toHaveLength(4);
    expect(callLog[0]?.method).toBe("editEphemeralMessageMedia");
    expect(callLog[0]?.payload.receiver_user_id).toBe(999);
    expect(callLog[1]?.method).toBe("editEphemeralMessageCaption");
    expect(callLog[1]?.payload.show_caption_above_media).toBe(true);
    expect(callLog[2]?.method).toBe("editEphemeralMessageReplyMarkup");
    expect((callLog[2]?.payload.reply_markup as InlineKeyboardMarkup).force_reply).toBe(true);
    expect(callLog[3]?.method).toBe("deleteEphemeralMessage");
    expect(callLog[3]?.payload.ephemeral_message_id).toBe(55);
  });

  it("supports promoteChatMember with can_send_welcome_messages", async () => {
    let calledPayload: Record<string, unknown> = {};

    const fakeFetch = vi.fn().mockImplementation(async (_url, init) => {
      calledPayload = JSON.parse(init.body);
      return { status: 200, json: async () => ({ ok: true, result: true }) };
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    const options: PromoteChatMemberOptions = {
      can_send_welcome_messages: true,
      can_manage_chat: true,
    };

    await bot.promoteChatMember(12345, 999, options);
    expect(calledPayload["chat_id"]).toBe(12345);
    expect(calledPayload["user_id"]).toBe(999);
    expect(calledPayload["can_send_welcome_messages"]).toBe(true);
  });

  it("supports disabled buttons and force_reply on keyboards", () => {
    const inlineMarkup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          { text: "Enabled", callback_data: "ok" },
          { text: "Disabled", disabled: {} },
        ],
      ],
      force_reply: true,
    };

    const replyMarkup: ReplyKeyboardMarkup = {
      keyboard: [[{ text: "Send Contact", request_contact: true }]],
      force_reply: true,
    };

    expect(inlineMarkup.force_reply).toBe(true);
    expect(inlineMarkup.inline_keyboard[0]?.[1]?.disabled).toEqual({});
    expect(replyMarkup.force_reply).toBe(true);
  });

  it("supports UniqueGiftInfo extended properties", () => {
    const giftInfo: UniqueGiftInfo = {
      gift: {
        gift_id: "g1",
        base_name: "Star",
        name: "Super Star",
        number: 10,
        model: {
          name: "Model 1",
          sticker: {
            file_id: "s1",
            file_unique_id: "su1",
            type: "regular",
            width: 512,
            height: 512,
            is_animated: false,
            is_video: false,
          },
          rarity_per_mille: 50,
          rarity: "legendary",
        },
        symbol: {
          name: "Sym 1",
          sticker: {
            file_id: "s2",
            file_unique_id: "su2",
            type: "regular",
            width: 512,
            height: 512,
            is_animated: false,
            is_video: false,
          },
          rarity_per_mille: 100,
        },
        backdrop: {
          name: "Backdrop 1",
          colors: {
            center_color: 0xff0000,
            edge_color: 0x00ff00,
            symbol_color: 0x0000ff,
            text_color: 0xffffff,
          },
          rarity_per_mille: 200,
        },
        is_premium: true,
      },
      origin: "upgrade",
      text: "Gift description",
      is_private: true,
      entities: [{ type: "bold", offset: 0, length: 4 }],
    };

    expect(giftInfo.text).toBe("Gift description");
    expect(giftInfo.is_private).toBe(true);
    expect(giftInfo.gift.backdrop.colors.center_color).toBe(0xff0000);
  });
});

