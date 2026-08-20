import { describe, it, expect, vi } from "vitest";
import { Bot } from "../../../src/client/bot.js";
import { TelegramApiError } from "../../../src/client/types.js";

describe("Bot client core", () => {
  it("creates an instance with a token", () => {
    const bot = new Bot("TEST_TOKEN");
    expect(bot.token).toBe("TEST_TOKEN");
  });

  it("throws on empty token", () => {
    expect(() => new Bot("")).toThrow();
  });

  it("makes successful request via custom fetch and returns result", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        ok: true,
        result: { id: 123, is_bot: true, first_name: "TestBot" },
      }),
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });
    const me = await bot.getMe();

    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(me).toEqual({ id: 123, is_bot: true, first_name: "TestBot" });
  });

  it("rejects with TelegramApiError on 4xx error (non-429)", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 400,
      json: async () => ({
        ok: false,
        error_code: 400,
        description: "Bad Request: chat not found",
      }),
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch });

    await expect(bot.getMe()).rejects.toThrow(TelegramApiError);
    await expect(bot.getMe()).rejects.toMatchObject({
      error_code: 400,
      description: "Bad Request: chat not found",
    });
  });

  it("retries on 429 honoring retry_after", async () => {
    let callCount = 0;
    const fakeFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          status: 429,
          json: async () => ({
            ok: false,
            error_code: 429,
            description: "Too Many Requests: retry after 1",
            parameters: { retry_after: 0.01 }, // 10ms for test
          }),
        };
      }
      return {
        status: 200,
        json: async () => ({
          ok: true,
          result: { id: 123, is_bot: true, first_name: "TestBot" },
        }),
      };
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch, baseDelayMs: 10 });
    const me = await bot.getMe();

    expect(callCount).toBe(2);
    expect(me.id).toBe(123);
  });

  it("retries on 5xx errors with exponential backoff", async () => {
    let callCount = 0;
    const fakeFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount <= 2) {
        return {
          status: 502,
          json: async () => ({
            ok: false,
            error_code: 502,
            description: "Bad Gateway",
          }),
        };
      }
      return {
        status: 200,
        json: async () => ({
          ok: true,
          result: { id: 123, is_bot: true, first_name: "TestBot" },
        }),
      };
    });

    const bot = new Bot("TEST_TOKEN", { fetch: fakeFetch, baseDelayMs: 10 });
    const me = await bot.getMe();

    expect(callCount).toBe(3);
    expect(me.id).toBe(123);
  });
});

describe("Bot API media and messaging methods", () => {
  const createMockBot = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { bot: new Bot("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("sendPhoto calls sendPhoto endpoint", async () => {
    const expectedMsg = { message_id: 1, chat: { id: 123, type: "private" }, photo: [] };
    const { bot, fakeFetch } = createMockBot(expectedMsg);

    const res = await bot.sendPhoto({ chat_id: 123, photo: "https://example.com/pic.jpg", caption: "Look" });
    expect(res).toEqual(expectedMsg);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
  });

  it("sendAudio calls sendAudio endpoint", async () => {
    const expectedMsg = { message_id: 2, chat: { id: 123, type: "private" }, audio: { file_id: "a1", file_unique_id: "u1", duration: 10 } };
    const { bot } = createMockBot(expectedMsg);

    const res = await bot.sendAudio({ chat_id: 123, audio: "https://example.com/audio.mp3" });
    expect(res).toEqual(expectedMsg);
  });

  it("sendDocument calls sendDocument endpoint", async () => {
    const expectedMsg = { message_id: 3, chat: { id: 123, type: "private" }, document: { file_id: "d1", file_unique_id: "u1" } };
    const { bot } = createMockBot(expectedMsg);

    const res = await bot.sendDocument({ chat_id: 123, document: "https://example.com/doc.pdf" });
    expect(res).toEqual(expectedMsg);
  });

  it("sendVideo calls sendVideo endpoint", async () => {
    const expectedMsg = { message_id: 4, chat: { id: 123, type: "private" }, video: { file_id: "v1", file_unique_id: "u1", width: 100, height: 100, duration: 10 } };
    const { bot } = createMockBot(expectedMsg);

    const res = await bot.sendVideo({ chat_id: 123, video: "https://example.com/video.mp4" });
    expect(res).toEqual(expectedMsg);
  });

  it("sendAnimation calls sendAnimation endpoint", async () => {
    const expectedMsg = { message_id: 5, chat: { id: 123, type: "private" }, animation: { file_id: "an1", file_unique_id: "u1", width: 100, height: 100, duration: 2 } };
    const { bot } = createMockBot(expectedMsg);

    const res = await bot.sendAnimation({ chat_id: 123, animation: "https://example.com/gif.mp4" });
    expect(res).toEqual(expectedMsg);
  });

  it("sendVoice calls sendVoice endpoint", async () => {
    const expectedMsg = { message_id: 6, chat: { id: 123, type: "private" }, voice: { file_id: "vo1", file_unique_id: "u1", duration: 5 } };
    const { bot } = createMockBot(expectedMsg);

    const res = await bot.sendVoice({ chat_id: 123, voice: "https://example.com/voice.ogg" });
    expect(res).toEqual(expectedMsg);
  });

  it("sendVideoNote calls sendVideoNote endpoint", async () => {
    const expectedMsg = { message_id: 7, chat: { id: 123, type: "private" }, video_note: { file_id: "vn1", file_unique_id: "u1", length: 100, duration: 5 } };
    const { bot } = createMockBot(expectedMsg);

    const res = await bot.sendVideoNote({ chat_id: 123, video_note: "https://example.com/vn.mp4" });
    expect(res).toEqual(expectedMsg);
  });

  it("sendMediaGroup calls sendMediaGroup endpoint", async () => {
    const expectedMsgs = [{ message_id: 8, chat: { id: 123, type: "private" } }];
    const { bot } = createMockBot(expectedMsgs);

    const res = await bot.sendMediaGroup({
      chat_id: 123,
      media: [{ type: "photo", media: "https://example.com/p1.jpg" }],
    });
    expect(res).toEqual(expectedMsgs);
  });

  it("sendLocation, sendVenue, sendContact, sendPoll, sendDice, sendChatAction", async () => {
    const { bot: bot1 } = createMockBot({ message_id: 9, location: { latitude: 10, longitude: 20 } });
    expect(await bot1.sendLocation({ chat_id: 123, latitude: 10, longitude: 20 })).toBeDefined();

    const { bot: bot2 } = createMockBot({ message_id: 10, venue: { location: { latitude: 10, longitude: 20 }, title: "Cafe", address: "Main St" } });
    expect(await bot2.sendVenue({ chat_id: 123, latitude: 10, longitude: 20, title: "Cafe", address: "Main St" })).toBeDefined();

    const { bot: bot3 } = createMockBot({ message_id: 11, contact: { phone_number: "+123456", first_name: "Alice" } });
    expect(await bot3.sendContact({ chat_id: 123, phone_number: "+123456", first_name: "Alice" })).toBeDefined();

    const { bot: bot4 } = createMockBot({ message_id: 12, poll: { id: "p1", question: "Q?", options: [], total_voter_count: 0, is_closed: false, is_anonymous: true, type: "regular", allows_multiple_answers: false } });
    expect(await bot4.sendPoll({ chat_id: 123, question: "Q?", options: ["A", "B"] })).toBeDefined();

    const { bot: bot5 } = createMockBot({ message_id: 13, dice: { emoji: "🎲", value: 6 } });
    expect(await bot5.sendDice({ chat_id: 123 })).toBeDefined();

    const { bot: bot6 } = createMockBot(true);
    expect(await bot6.sendChatAction({ chat_id: 123, action: "typing" })).toBe(true);
  });

  it("editMessageText, editMessageCaption, editMessageReplyMarkup, deleteMessage", async () => {
    const { bot: bot1 } = createMockBot({ message_id: 1, text: "Updated" });
    expect(await bot1.editMessageText({ chat_id: 123, message_id: 1, text: "Updated" })).toBeDefined();

    const { bot: bot2 } = createMockBot({ message_id: 1, caption: "New Caption" });
    expect(await bot2.editMessageCaption({ chat_id: 123, message_id: 1, caption: "New Caption" })).toBeDefined();

    const { bot: bot3 } = createMockBot({ message_id: 1, reply_markup: { inline_keyboard: [] } });
    expect(await bot3.editMessageReplyMarkup({ chat_id: 123, message_id: 1, reply_markup: { inline_keyboard: [] } })).toBeDefined();

    const { bot: bot4 } = createMockBot(true);
    expect(await bot4.deleteMessage(123, 1)).toBe(true);
  });

  it("answerCallbackQuery and answerInlineQuery", async () => {
    const { bot: bot1 } = createMockBot(true);
    expect(await bot1.answerCallbackQuery({ callback_query_id: "cb1", text: "Answered" })).toBe(true);

    const { bot: bot2 } = createMockBot(true);
    expect(await bot2.answerInlineQuery({ inline_query_id: "iq1", results: [] })).toBe(true);
  });

  it("chat administration methods", async () => {
    const { bot } = createMockBot(true);

    expect(await bot.banChatMember(123, 456)).toBe(true);
    expect(await bot.unbanChatMember(123, 456)).toBe(true);
    expect(await bot.restrictChatMember(123, 456, { can_send_messages: true })).toBe(true);
    expect(await bot.promoteChatMember(123, 456, { can_change_info: true })).toBe(true);
    expect(await bot.setChatAdministratorCustomTitle(123, 456, "Lead")).toBe(true);
    expect(await bot.setChatPermissions(123, { can_send_messages: false })).toBe(true);
    expect(await bot.approveChatJoinRequest(123, 456)).toBe(true);
    expect(await bot.declineChatJoinRequest(123, 456)).toBe(true);
    expect(await bot.setChatTitle(123, "Super Group")).toBe(true);
    expect(await bot.setChatDescription(123, "About us")).toBe(true);
    expect(await bot.pinChatMessage(123, 10)).toBe(true);
    expect(await bot.unpinChatMessage(123, 10)).toBe(true);
    expect(await bot.unpinAllChatMessages(123)).toBe(true);
    expect(await bot.leaveChat(123)).toBe(true);
    expect(await bot.setChatStickerSet(123, "stickers")).toBe(true);
    expect(await bot.deleteChatStickerSet(123)).toBe(true);
    expect(await bot.deleteChatPhoto(123)).toBe(true);

    const { bot: botChat } = createMockBot({ id: 123, type: "group", title: "Test" });
    expect(await botChat.getChat(123)).toEqual({ id: 123, type: "group", title: "Test" });

    const { bot: botAdmins } = createMockBot([{ status: "administrator", user: { id: 456, is_bot: false, first_name: "Admin" } }]);
    expect(await botAdmins.getChatAdministrators(123)).toHaveLength(1);

    const { bot: botCount } = createMockBot(42);
    expect(await botCount.getChatMemberCount(123)).toBe(42);

    const { bot: botMember } = createMockBot({ status: "member", user: { id: 456, is_bot: false, first_name: "User" } });
    expect(await botMember.getChatMember(123, 456)).toBeDefined();

    const { bot: botLink } = createMockBot("https://t.me/+invite");
    expect(await botLink.exportChatInviteLink(123)).toBe("https://t.me/+invite");

    const { bot: botInvite } = createMockBot({ invite_link: "https://t.me/+invite", creator: { id: 1, is_bot: false, first_name: "A" }, creates_join_request: false, is_primary: false, is_revoked: false });
    expect(await botInvite.createChatInviteLink(123)).toBeDefined();
    expect(await botInvite.editChatInviteLink(123, "https://t.me/+invite")).toBeDefined();
    expect(await botInvite.revokeChatInviteLink(123, "https://t.me/+invite")).toBeDefined();

    const { bot: botPhotos } = createMockBot({ total_count: 1, photos: [] });
    expect(await botPhotos.getUserProfilePhotos(456)).toEqual({ total_count: 1, photos: [] });

    const { bot: botFile } = createMockBot({ file_id: "f1", file_unique_id: "u1", file_size: 100, file_path: "photos/file_1.jpg" });
    expect(await botFile.getFile("f1")).toEqual({ file_id: "f1", file_unique_id: "u1", file_size: 100, file_path: "photos/file_1.jpg" });

    const { bot: botWebhook } = createMockBot(true);
    expect(await botWebhook.setWebhook({ url: "https://example.com/hook" })).toBe(true);
    expect(await botWebhook.deleteWebhook()).toBe(true);

    const { bot: botInfo } = createMockBot({ url: "https://example.com", has_custom_certificate: false, pending_update_count: 0 });
    expect(await botInfo.getWebhookInfo()).toEqual({ url: "https://example.com", has_custom_certificate: false, pending_update_count: 0 });
  });

  it("forwardMessage, copyMessage, commands and forum topic methods", async () => {
    const { bot: bot1 } = createMockBot({ message_id: 100 });
    expect(await bot1.forwardMessage({ chat_id: 123, from_chat_id: 456, message_id: 10 })).toBeDefined();

    const { bot: bot2 } = createMockBot({ message_id: 101 });
    expect(await bot2.copyMessage({ chat_id: 123, from_chat_id: 456, message_id: 10 })).toEqual({ message_id: 101 });

    const { bot: bot3 } = createMockBot(true);
    expect(await bot3.setMyCommands({ commands: [{ command: "start", description: "Start bot" }] })).toBe(true);

    const { bot: bot4 } = createMockBot([{ command: "start", description: "Start bot" }]);
    expect(await bot4.getMyCommands()).toEqual([{ command: "start", description: "Start bot" }]);

    const { bot: bot5 } = createMockBot(true);
    expect(await bot5.deleteMyCommands()).toBe(true);

    const { bot: bot6 } = createMockBot({ message_thread_id: 1, name: "General", icon_color: 123 });
    expect(await bot6.createForumTopic({ chat_id: 123, name: "General" })).toBeDefined();

    const { bot: bot7 } = createMockBot(true);
    expect(await bot7.closeForumTopic(123, 1)).toBe(true);
    expect(await bot7.reopenForumTopic(123, 1)).toBe(true);
    expect(await bot7.deleteForumTopic(123, 1)).toBe(true);
  });

  it("deleteMessages, forwardMessages, copyMessages", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const delRes = await bot1.deleteMessages(123456, [101, 102, 103]);
    expect(delRes).toBe(true);
    expect(fetch1).toHaveBeenCalledTimes(1);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({ chat_id: 123456, message_ids: [101, 102, 103] });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot([{ message_id: 201 }, { message_id: 202 }]);
    const fwdRes = await bot2.forwardMessages({
      chat_id: 123456,
      from_chat_id: 654321,
      message_ids: [101, 102],
      disable_notification: true,
      protect_content: false,
    });
    expect(fwdRes).toEqual([{ message_id: 201 }, { message_id: 202 }]);
    expect(fetch2).toHaveBeenCalledTimes(1);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({
      chat_id: 123456,
      from_chat_id: 654321,
      message_ids: [101, 102],
      disable_notification: true,
      protect_content: false,
    });

    const { bot: bot3, fakeFetch: fetch3 } = createMockBot([{ message_id: 301 }, { message_id: 302 }]);
    const copyRes = await bot3.copyMessages({
      chat_id: 123456,
      from_chat_id: 654321,
      message_ids: [101, 102],
      remove_caption: true,
    });
    expect(copyRes).toEqual([{ message_id: 301 }, { message_id: 302 }]);
    expect(fetch3).toHaveBeenCalledTimes(1);
    const body3 = JSON.parse(fetch3.mock.calls[0][1].body);
    expect(body3).toEqual({
      chat_id: 123456,
      from_chat_id: 654321,
      message_ids: [101, 102],
      remove_caption: true,
    });
  });

  it("editMessageMedia, editMessageLiveLocation, stopMessageLiveLocation", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot({ message_id: 42, photo: [] });
    const mediaRes = await bot1.editMessageMedia({
      chat_id: 123456,
      message_id: 42,
      media: {
        type: "photo",
        media: "https://example.com/pic.jpg",
        caption: "New caption",
      },
    });
    expect(mediaRes).toEqual({ message_id: 42, photo: [] });
    expect(fetch1).toHaveBeenCalledTimes(1);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1.chat_id).toBe(123456);
    expect(body1.message_id).toBe(42);
    expect(body1.media).toEqual({
      type: "photo",
      media: "https://example.com/pic.jpg",
      caption: "New caption",
    });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot({ message_id: 43, location: { latitude: 37.77, longitude: -122.41 } });
    const locRes = await bot2.editMessageLiveLocation({
      chat_id: 123456,
      message_id: 43,
      latitude: 37.77,
      longitude: -122.41,
      horizontal_accuracy: 10,
      heading: 90,
      proximity_alert_radius: 50,
      live_period: 3600,
    });
    expect(locRes).toEqual({ message_id: 43, location: { latitude: 37.77, longitude: -122.41 } });
    expect(fetch2).toHaveBeenCalledTimes(1);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({
      chat_id: 123456,
      message_id: 43,
      latitude: 37.77,
      longitude: -122.41,
      horizontal_accuracy: 10,
      heading: 90,
      proximity_alert_radius: 50,
      live_period: 3600,
    });

    const { bot: bot3, fakeFetch: fetch3 } = createMockBot(true);
    const stopLocRes = await bot3.stopMessageLiveLocation({
      inline_message_id: "inl_123",
    });
    expect(stopLocRes).toBe(true);
    expect(fetch3).toHaveBeenCalledTimes(1);
    const body3 = JSON.parse(fetch3.mock.calls[0][1].body);
    expect(body3).toEqual({ inline_message_id: "inl_123" });
  });

  it("stopPoll", async () => {
    const expectedPoll = {
      id: "poll_1",
      question: "Which one?",
      options: [{ text: "A", voter_count: 5 }, { text: "B", voter_count: 3 }],
      total_voter_count: 8,
      is_closed: true,
      is_anonymous: true,
      type: "regular",
      allows_multiple_answers: false,
    };
    const { bot, fakeFetch } = createMockBot(expectedPoll);
    const res = await bot.stopPoll(123456, 42, { reply_markup: { inline_keyboard: [] } });
    expect(res).toEqual(expectedPoll);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      chat_id: 123456,
      message_id: 42,
      reply_markup: { inline_keyboard: [] },
    });
  });

  it("setMessageReaction, deleteMessageReaction, deleteAllMessageReactions", async () => {
    // string reaction
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const res1 = await bot1.setMessageReaction({
      chat_id: 123456,
      message_id: 42,
      reaction: "👍",
      is_big: true,
    });
    expect(res1).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      chat_id: 123456,
      message_id: 42,
      reaction: [{ type: "emoji", emoji: "👍" }],
      is_big: true,
    });

    // ReactionType object
    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(true);
    const res2 = await bot2.setMessageReaction({
      chat_id: 123456,
      message_id: 42,
      reaction: { type: "custom_emoji", custom_emoji_id: "cust_123" },
    });
    expect(res2).toBe(true);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({
      chat_id: 123456,
      message_id: 42,
      reaction: [{ type: "custom_emoji", custom_emoji_id: "cust_123" }],
    });

    // Array of reactions (strings & ReactionType)
    const { bot: bot3, fakeFetch: fetch3 } = createMockBot(true);
    const res3 = await bot3.setMessageReaction({
      chat_id: 123456,
      message_id: 42,
      reaction: ["🔥", { type: "paid" }],
    });
    expect(res3).toBe(true);
    const body3 = JSON.parse(fetch3.mock.calls[0][1].body);
    expect(body3).toEqual({
      chat_id: 123456,
      message_id: 42,
      reaction: [{ type: "emoji", emoji: "🔥" }, { type: "paid" }],
    });

    // deleteMessageReaction
    const { bot: bot4, fakeFetch: fetch4 } = createMockBot(true);
    const res4 = await bot4.deleteMessageReaction(123456, 42, true);
    expect(res4).toBe(true);
    const body4 = JSON.parse(fetch4.mock.calls[0][1].body);
    expect(body4).toEqual({
      chat_id: 123456,
      message_id: 42,
      reaction: [],
      is_big: true,
    });

    // deleteAllMessageReactions
    const { bot: bot5, fakeFetch: fetch5 } = createMockBot(true);
    const res5 = await bot5.deleteAllMessageReactions(123456, 42);
    expect(res5).toBe(true);
    const body5 = JSON.parse(fetch5.mock.calls[0][1].body);
    expect(body5).toEqual({
      chat_id: 123456,
      message_id: 42,
      reaction: [],
    });
  });
});

describe("Bot API stickers and custom emoji methods", () => {
  const createMockBot = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { bot: new Bot("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("sendSticker sends sticker payload and returns message", async () => {
    const expectedMsg = {
      message_id: 101,
      chat: { id: 123456, type: "private" },
      sticker: {
        file_id: "stk_1",
        file_unique_id: "u_stk_1",
        type: "regular",
        width: 512,
        height: 512,
        is_animated: false,
        is_video: false,
      },
    };
    const { bot, fakeFetch } = createMockBot(expectedMsg);

    const res = await bot.sendSticker({
      chat_id: 123456,
      sticker: "CAACAgIAAxkBAAE...",
      emoji: "👍",
    });
    expect(res).toEqual(expectedMsg);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    const url = fakeFetch.mock.calls[0][0];
    expect(url).toContain("/sendSticker");
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      chat_id: 123456,
      sticker: "CAACAgIAAxkBAAE...",
      emoji: "👍",
    });
  });

  it("getStickerSet retrieves a sticker set", async () => {
    const expectedSet = {
      name: "animals_by_bot",
      title: "Animals Pack",
      sticker_type: "regular",
      stickers: [
        {
          file_id: "stk_1",
          file_unique_id: "u_stk_1",
          type: "regular",
          width: 512,
          height: 512,
          is_animated: false,
          is_video: false,
        },
      ],
    };
    const { bot, fakeFetch } = createMockBot(expectedSet);

    const res = await bot.getStickerSet("animals_by_bot");
    expect(res).toEqual(expectedSet);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({ name: "animals_by_bot" });
  });

  it("getCustomEmojiStickers retrieves custom emoji stickers", async () => {
    const expectedStickers = [
      {
        file_id: "emoji_1",
        file_unique_id: "u_emoji_1",
        type: "custom_emoji",
        custom_emoji_id: "5368324170671202286",
        width: 100,
        height: 100,
        is_animated: false,
        is_video: false,
      },
    ];
    const { bot, fakeFetch } = createMockBot(expectedStickers);

    const res = await bot.getCustomEmojiStickers(["5368324170671202286"]);
    expect(res).toEqual(expectedStickers);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({ custom_emoji_ids: ["5368324170671202286"] });
  });

  it("uploadStickerFile uploads sticker and returns File", async () => {
    const expectedFile = {
      file_id: "f_stk_upload_1",
      file_unique_id: "u_f_stk_1",
      file_size: 1024,
      file_path: "stickers/f_stk_upload_1.png",
    };
    const { bot, fakeFetch } = createMockBot(expectedFile);

    const res = await bot.uploadStickerFile(
      123456,
      {
        filename: "test.png",
        data: new Uint8Array([1, 2, 3]),
        contentType: "image/png",
      },
      "static"
    );
    expect(res).toEqual(expectedFile);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    const callArgs = fakeFetch.mock.calls[0];
    expect(callArgs[0]).toContain("/uploadStickerFile");
    expect(callArgs[1].body).toBeInstanceOf(FormData);
  });

  it("createNewStickerSet creates sticker set", async () => {
    const { bot, fakeFetch } = createMockBot(true);

    const res = await bot.createNewStickerSet({
      user_id: 123456,
      name: "pack_by_bot",
      title: "My Pack",
      stickers: [
        {
          sticker: "CAACAgIAAxkBAAE...",
          format: "static",
          emoji_list: ["🐶"],
        },
      ],
      sticker_type: "regular",
    });
    expect(res).toBe(true);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      user_id: 123456,
      name: "pack_by_bot",
      title: "My Pack",
      stickers: [
        {
          sticker: "CAACAgIAAxkBAAE...",
          format: "static",
          emoji_list: ["🐶"],
        },
      ],
      sticker_type: "regular",
    });
  });

  it("addStickerToSet adds sticker to set", async () => {
    const { bot, fakeFetch } = createMockBot(true);

    const res = await bot.addStickerToSet({
      user_id: 123456,
      name: "pack_by_bot",
      sticker: {
        sticker: "CAACAgIAAxkBAAE...",
        format: "static",
        emoji_list: ["🐱"],
      },
    });
    expect(res).toBe(true);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      user_id: 123456,
      name: "pack_by_bot",
      sticker: {
        sticker: "CAACAgIAAxkBAAE...",
        format: "static",
        emoji_list: ["🐱"],
      },
    });
  });

  it("setStickerPositionInSet sets position of sticker in set", async () => {
    const { bot, fakeFetch } = createMockBot(true);

    const res = await bot.setStickerPositionInSet("stk_123", 2);
    expect(res).toBe(true);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      sticker: "stk_123",
      position: 2,
    });
  });

  it("deleteStickerFromSet deletes sticker from set", async () => {
    const { bot, fakeFetch } = createMockBot(true);

    const res = await bot.deleteStickerFromSet("stk_123");
    expect(res).toBe(true);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({ sticker: "stk_123" });
  });

  it("deleteStickerSet deletes an entire sticker set", async () => {
    const { bot, fakeFetch } = createMockBot(true);

    const res = await bot.deleteStickerSet("pack_by_bot");
    expect(res).toBe(true);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({ name: "pack_by_bot" });
  });

  it("replaceStickerInSet replaces sticker with a new one", async () => {
    const { bot, fakeFetch } = createMockBot(true);

    const res = await bot.replaceStickerInSet({
      user_id: 123456,
      name: "pack_by_bot",
      old_sticker: "old_stk_1",
      sticker: {
        sticker: "new_stk_2",
        format: "static",
        emoji_list: ["🦊"],
      },
    });
    expect(res).toBe(true);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      user_id: 123456,
      name: "pack_by_bot",
      old_sticker: "old_stk_1",
      sticker: {
        sticker: "new_stk_2",
        format: "static",
        emoji_list: ["🦊"],
      },
    });
  });

  it("setStickerSetThumbnail updates thumbnail or drops it", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const res1 = await bot1.setStickerSetThumbnail("pack_by_bot", 123456, "static", "thumb_file_id");
    expect(res1).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      name: "pack_by_bot",
      user_id: 123456,
      format: "static",
      thumbnail: "thumb_file_id",
    });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(true);
    const res2 = await bot2.setStickerSetThumbnail("pack_by_bot", 123456, "static");
    expect(res2).toBe(true);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({
      name: "pack_by_bot",
      user_id: 123456,
      format: "static",
    });
  });

  it("setCustomEmojiStickerSetThumbnail sets or drops custom emoji thumbnail", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const res1 = await bot1.setCustomEmojiStickerSetThumbnail("custom_pack", "5368324170671202286");
    expect(res1).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      name: "custom_pack",
      custom_emoji_id: "5368324170671202286",
    });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(true);
    const res2 = await bot2.setCustomEmojiStickerSetThumbnail("custom_pack");
    expect(res2).toBe(true);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({ name: "custom_pack" });
  });

  it("setStickerSetTitle changes title of sticker set", async () => {
    const { bot, fakeFetch } = createMockBot(true);

    const res = await bot.setStickerSetTitle("pack_by_bot", "New Title");
    expect(res).toBe(true);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      name: "pack_by_bot",
      title: "New Title",
    });
  });

  it("setStickerEmojiList updates emoji list of sticker", async () => {
    const { bot, fakeFetch } = createMockBot(true);

    const res = await bot.setStickerEmojiList("stk_123", ["🚀", "⭐"]);
    expect(res).toBe(true);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      sticker: "stk_123",
      emoji_list: ["🚀", "⭐"],
    });
  });

  it("setStickerKeywords sets or removes keywords", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const res1 = await bot1.setStickerKeywords("stk_123", ["space", "launch"]);
    expect(res1).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      sticker: "stk_123",
      keywords: ["space", "launch"],
    });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(true);
    const res2 = await bot2.setStickerKeywords("stk_123");
    expect(res2).toBe(true);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({ sticker: "stk_123" });
  });

  it("setStickerMaskPosition sets or removes mask position", async () => {
    const maskPos = {
      point: "forehead",
      x_shift: 0.1,
      y_shift: -0.2,
      scale: 1.5,
    };
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const res1 = await bot1.setStickerMaskPosition("stk_123", maskPos);
    expect(res1).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      sticker: "stk_123",
      mask_position: maskPos,
    });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(true);
    const res2 = await bot2.setStickerMaskPosition("stk_123");
    expect(res2).toBe(true);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({ sticker: "stk_123" });
  });
});

describe("Bot API Payments and Telegram Stars methods", () => {
  const createMockBot = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { bot: new Bot("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("sendInvoice sends invoice request and returns Message", async () => {
    const expectedMsg = {
      message_id: 200,
      chat: { id: 123456, type: "private" },
      invoice: {
        title: "Product A",
        description: "Test product",
        start_parameter: "prod_a",
        currency: "USD",
        total_amount: 1000,
      },
    };
    const { bot, fakeFetch } = createMockBot(expectedMsg);

    const res = await bot.sendInvoice({
      chat_id: 123456,
      title: "Product A",
      description: "Test product",
      payload: "payload_123",
      currency: "USD",
      prices: [{ label: "Base", amount: 1000 }],
      start_parameter: "prod_a",
    });

    expect(res).toEqual(expectedMsg);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(fakeFetch.mock.calls[0][0]).toContain("/sendInvoice");
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      chat_id: 123456,
      title: "Product A",
      description: "Test product",
      payload: "payload_123",
      currency: "USD",
      prices: [{ label: "Base", amount: 1000 }],
      start_parameter: "prod_a",
    });
  });

  it("createInvoiceLink generates invoice link string", async () => {
    const expectedLink = "https://t.me/$invoice_link_123";
    const { bot, fakeFetch } = createMockBot(expectedLink);

    const res = await bot.createInvoiceLink({
      title: "Donation",
      description: "Support project",
      payload: "don_1",
      currency: "XTR",
      prices: [{ label: "Stars", amount: 50 }],
    });

    expect(res).toBe(expectedLink);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(fakeFetch.mock.calls[0][0]).toContain("/createInvoiceLink");
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      title: "Donation",
      description: "Support project",
      payload: "don_1",
      currency: "XTR",
      prices: [{ label: "Stars", amount: 50 }],
    });
  });

  it("answerShippingQuery handles success and error cases", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const res1 = await bot1.answerShippingQuery({
      shipping_query_id: "sq_1",
      ok: true,
      shipping_options: [
        { id: "std", title: "Standard", prices: [{ label: "Post", amount: 200 }] },
      ],
    });
    expect(res1).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      shipping_query_id: "sq_1",
      ok: true,
      shipping_options: [
        { id: "std", title: "Standard", prices: [{ label: "Post", amount: 200 }] },
      ],
    });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(true);
    const res2 = await bot2.answerShippingQuery({
      shipping_query_id: "sq_2",
      ok: false,
      error_message: "Cannot ship to location",
    });
    expect(res2).toBe(true);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({
      shipping_query_id: "sq_2",
      ok: false,
      error_message: "Cannot ship to location",
    });
  });

  it("answerPreCheckoutQuery handles success and error cases", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const res1 = await bot1.answerPreCheckoutQuery({
      pre_checkout_query_id: "pcq_1",
      ok: true,
    });
    expect(res1).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      pre_checkout_query_id: "pcq_1",
      ok: true,
    });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(true);
    const res2 = await bot2.answerPreCheckoutQuery({
      pre_checkout_query_id: "pcq_2",
      ok: false,
      error_message: "Item out of stock",
    });
    expect(res2).toBe(true);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({
      pre_checkout_query_id: "pcq_2",
      ok: false,
      error_message: "Item out of stock",
    });
  });

  it("refundStarPayment sends refund request", async () => {
    const { bot, fakeFetch } = createMockBot(true);
    const res = await bot.refundStarPayment(123456, "tx_charge_123");
    expect(res).toBe(true);
    expect(fakeFetch.mock.calls[0][0]).toContain("/refundStarPayment");
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      user_id: 123456,
      telegram_payment_charge_id: "tx_charge_123",
    });
  });

  it("getStarTransactions retrieves list of transactions", async () => {
    const expectedTxs = {
      transactions: [
        {
          id: "tx_1",
          amount: 50,
          nanostar_amount: 0,
          date: 1700000000,
        },
      ],
    };
    const { bot, fakeFetch } = createMockBot(expectedTxs);
    const res = await bot.getStarTransactions(10, 20);
    expect(res).toEqual(expectedTxs);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({ offset: 10, limit: 20 });
  });

  it("editUserStarSubscription modifies user subscription status", async () => {
    const { bot, fakeFetch } = createMockBot(true);
    const res = await bot.editUserStarSubscription(123456, "sub_charge_1", true);
    expect(res).toBe(true);
    const body = JSON.parse(fakeFetch.mock.calls[0][1].body);
    expect(body).toEqual({
      user_id: 123456,
      telegram_payment_charge_id: "sub_charge_1",
      is_canceled: true,
    });
  });

  it("getMyStarBalance retrieves StarAmount", async () => {
    const expectedBalance = { amount: 1500, nanostar_amount: 500000000 };
    const { bot, fakeFetch } = createMockBot(expectedBalance);
    const res = await bot.getMyStarBalance();
    expect(res).toEqual(expectedBalance);
    expect(fakeFetch.mock.calls[0][0]).toContain("/getMyStarBalance");
  });
});

describe("Bot API Profile, Admin Rights, Menu Button and Topics methods", () => {
  const createMockBot = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { bot: new Bot("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("setMyName and getMyName", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const setRes = await bot1.setMyName("SuperBot", "en");
    expect(setRes).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({ name: "SuperBot", language_code: "en" });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot({ name: "SuperBot" });
    const getRes = await bot2.getMyName("en");
    expect(getRes).toEqual({ name: "SuperBot" });
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({ language_code: "en" });
  });

  it("setMyDescription and getMyDescription", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const setRes = await bot1.setMyDescription("Bot description", "en");
    expect(setRes).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({ description: "Bot description", language_code: "en" });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot({ description: "Bot description" });
    const getRes = await bot2.getMyDescription("en");
    expect(getRes).toEqual({ description: "Bot description" });
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({ language_code: "en" });
  });

  it("setMyShortDescription and getMyShortDescription", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const setRes = await bot1.setMyShortDescription("Short desc", "en");
    expect(setRes).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({ short_description: "Short desc", language_code: "en" });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot({ short_description: "Short desc" });
    const getRes = await bot2.getMyShortDescription("en");
    expect(getRes).toEqual({ short_description: "Short desc" });
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({ language_code: "en" });
  });

  it("setMyDefaultAdministratorRights and getMyDefaultAdministratorRights", async () => {
    const rights = {
      is_anonymous: false,
      can_manage_chat: true,
      can_delete_messages: true,
      can_manage_video_chats: false,
      can_restrict_members: true,
      can_promote_members: false,
      can_change_info: true,
      can_invite_users: true,
    };
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const setRes = await bot1.setMyDefaultAdministratorRights(rights, true);
    expect(setRes).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({ rights, for_channels: true });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(rights);
    const getRes = await bot2.getMyDefaultAdministratorRights(true);
    expect(getRes).toEqual(rights);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({ for_channels: true });
  });

  it("setChatMenuButton and getChatMenuButton", async () => {
    const menuBtn = {
      type: "web_app" as const,
      text: "App",
      web_app: { url: "https://example.com" },
    };
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const setRes = await bot1.setChatMenuButton(123456, menuBtn);
    expect(setRes).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({ chat_id: 123456, menu_button: menuBtn });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(menuBtn);
    const getRes = await bot2.getChatMenuButton(123456);
    expect(getRes).toEqual(menuBtn);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({ chat_id: 123456 });
  });

  it("createForumTopic, editForumTopic, close/reopen/delete/unpin topic messages", async () => {
    const expectedTopic = {
      message_thread_id: 42,
      name: "Discussion",
      icon_color: 0x6FB9F0,
      icon_custom_emoji_id: "emoji_custom_1",
    };
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(expectedTopic);
    const createRes = await bot1.createForumTopic({
      chat_id: -100123456,
      name: "Discussion",
      icon_color: 0x6FB9F0,
      icon_custom_emoji_id: "emoji_custom_1",
    });
    expect(createRes).toEqual(expectedTopic);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      chat_id: -100123456,
      name: "Discussion",
      icon_color: 0x6FB9F0,
      icon_custom_emoji_id: "emoji_custom_1",
    });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(true);
    const editRes = await bot2.editForumTopic({
      chat_id: -100123456,
      message_thread_id: 42,
      name: "New Discussion Name",
      icon_custom_emoji_id: "emoji_custom_2",
    });
    expect(editRes).toBe(true);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({
      chat_id: -100123456,
      message_thread_id: 42,
      name: "New Discussion Name",
      icon_custom_emoji_id: "emoji_custom_2",
    });

    const { bot: bot3 } = createMockBot(true);
    expect(await bot3.closeForumTopic(-100123456, 42)).toBe(true);
    expect(await bot3.reopenForumTopic(-100123456, 42)).toBe(true);
    expect(await bot3.deleteForumTopic(-100123456, 42)).toBe(true);
    expect(await bot3.unpinAllForumTopicMessages(-100123456, 42)).toBe(true);
  });

  it("general forum topic management methods", async () => {
    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const editGenRes = await bot1.editGeneralForumTopic(-100123456, "General Discussion");
    expect(editGenRes).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      chat_id: -100123456,
      name: "General Discussion",
    });

    const { bot: bot2 } = createMockBot(true);
    expect(await bot2.closeGeneralForumTopic(-100123456)).toBe(true);
    expect(await bot2.reopenGeneralForumTopic(-100123456)).toBe(true);
    expect(await bot2.hideGeneralForumTopic(-100123456)).toBe(true);
    expect(await bot2.unhideGeneralForumTopic(-100123456)).toBe(true);
    expect(await bot2.unpinAllGeneralForumTopicMessages(-100123456)).toBe(true);
  });

  it("setMyCommands, getMyCommands, deleteMyCommands with scopes", async () => {
    const commands = [{ command: "start", description: "Start the bot" }];
    const scope = { type: "all_private_chats" as const };

    const { bot: bot1, fakeFetch: fetch1 } = createMockBot(true);
    const setRes = await bot1.setMyCommands({
      commands,
      scope,
      language_code: "en",
    });
    expect(setRes).toBe(true);
    const body1 = JSON.parse(fetch1.mock.calls[0][1].body);
    expect(body1).toEqual({
      commands,
      scope,
      language_code: "en",
    });

    const { bot: bot2, fakeFetch: fetch2 } = createMockBot(commands);
    const getRes = await bot2.getMyCommands({
      scope,
      language_code: "en",
    });
    expect(getRes).toEqual(commands);
    const body2 = JSON.parse(fetch2.mock.calls[0][1].body);
    expect(body2).toEqual({
      scope,
      language_code: "en",
    });

    const { bot: bot3, fakeFetch: fetch3 } = createMockBot(true);
    const delRes = await bot3.deleteMyCommands({
      scope,
      language_code: "en",
    });
    expect(delRes).toBe(true);
    const body3 = JSON.parse(fetch3.mock.calls[0][1].body);
    expect(body3).toEqual({
      scope,
      language_code: "en",
    });
  });
});

describe("Bot API Games, Passport, Stories, Business, and Gift methods", () => {
  const createMockBot = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { bot: new Bot("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("sendGame, setGameScore, and getGameHighScores", async () => {
    const { bot: bot1 } = createMockBot({ message_id: 50, game: { title: "Math Game" } });
    expect(await bot1.sendGame(123456, "math_game")).toBeDefined();

    const { bot: bot2 } = createMockBot(true);
    expect(await bot2.setGameScore(123456, 100, { chat_id: 123456, message_id: 50 })).toBe(true);

    const { bot: bot3 } = createMockBot([{ position: 1, user: { id: 123456, is_bot: false, first_name: "John" }, score: 100 }]);
    const scores = await bot3.getGameHighScores(123456, { chat_id: 123456, message_id: 50 });
    expect(scores).toHaveLength(1);
  });

  it("setPassportDataErrors, postStory, editStory, deleteStory", async () => {
    const { bot: bot1 } = createMockBot(true);
    expect(await bot1.setPassportDataErrors(123456, [{ source: "data", type: "passport", message: "Invalid" }])).toBe(true);

    const { bot: bot2 } = createMockBot({ chat: { id: 123, type: "private" }, id: 1 });
    expect(await bot2.postStory("biz_1", {})).toBeDefined();

    const { bot: bot3 } = createMockBot({ chat: { id: 123, type: "private" }, id: 1 });
    expect(await bot3.editStory("biz_1", 1, {})).toBeDefined();

    const { bot: bot4 } = createMockBot(true);
    expect(await bot4.deleteStory("biz_1", 1)).toBe(true);
  });

  it("getBusinessConnection, readBusinessMessage, deleteBusinessMessages", async () => {
    const { bot: bot1 } = createMockBot({ id: "biz_1", user: { id: 123, is_bot: false, first_name: "Biz" }, user_chat_id: 123, date: 1700000000, can_reply: true, is_enabled: true });
    expect(await bot1.getBusinessConnection("biz_1")).toBeDefined();

    const { bot: bot2 } = createMockBot(true);
    expect(await bot2.readBusinessMessage("biz_1", 101)).toBe(true);

    const { bot: bot3 } = createMockBot(true);
    expect(await bot3.deleteBusinessMessages("biz_1", [101, 102])).toBe(true);
  });

  it("gifts, verification, chat boosts, and emoji status", async () => {
    const { bot: bot1 } = createMockBot({ gifts: [] });
    expect(await bot1.getAvailableGifts()).toEqual({ gifts: [] });

    const { bot: bot2 } = createMockBot(true);
    expect(await bot2.sendGift({ user_id: 123456, gift_id: "g_1" })).toBe(true);

    const { bot: bot3 } = createMockBot(true);
    expect(await bot3.verifyChat(123456, "Verified")).toBe(true);
    expect(await bot3.verifyUser(123456, "Verified user")).toBe(true);
    expect(await bot3.removeChatVerification(123456)).toBe(true);
    expect(await bot3.removeUserVerification(123456)).toBe(true);

    const { bot: bot4 } = createMockBot({ boosts: [] });
    expect(await bot4.getUserChatBoosts(123456, 123456)).toEqual({ boosts: [] });

    const { bot: bot5 } = createMockBot(true);
    expect(await bot5.setUserEmojiStatus(123456, "emoji_1")).toBe(true);
  });
});

