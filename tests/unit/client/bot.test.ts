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
});
