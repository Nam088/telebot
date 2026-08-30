import { describe, it, expect, vi } from "vitest";
import { MessageMethods } from "../../../../src/client/methods/index.js";

class ConcreteMessageClient extends MessageMethods {}

describe("MessageMethods Unit Tests (1:1 mapping)", () => {
  const createMock = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { client: new ConcreteMessageClient("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("getMe, getUpdates, sendMessage, deleteMessage, deleteMessages", async () => {
    const { client } = createMock({ id: 123 });
    expect(await client.getMe()).toEqual({ id: 123 });
    expect(await client.getUpdates()).toEqual({ id: 123 });
    expect(await client.sendMessage({ chat_id: 123, text: "hi" })).toEqual({ id: 123 });
    expect(await client.deleteMessage(123, 1)).toEqual({ id: 123 });
    expect(await client.deleteMessages(123, [1, 2])).toEqual({ id: 123 });
  });

  it("forwardMessage, forwardMessages, copyMessage, copyMessages", async () => {
    const { client } = createMock([{ message_id: 101 }, { message_id: 102 }]);
    expect(await client.forwardMessage({ chat_id: 1, from_chat_id: 2, message_id: 3 })).toEqual([
      { message_id: 101 },
      { message_id: 102 },
    ]);
    const forwardBatch = await client.forwardMessages({
      chat_id: 1,
      from_chat_id: 2,
      message_ids: [10, 11],
      disable_notification: true,
      message_thread_id: 42,
      protect_content: true,
    });
    expect(forwardBatch).toEqual([{ message_id: 101 }, { message_id: 102 }]);

    expect(await client.copyMessage({ chat_id: 1, from_chat_id: 2, message_id: 3 })).toEqual([
      { message_id: 101 },
      { message_id: 102 },
    ]);
    const copyBatch = await client.copyMessages({
      chat_id: 1,
      from_chat_id: 2,
      message_ids: [10, 11],
      disable_notification: true,
      message_thread_id: 42,
      protect_content: true,
      remove_caption: true,
    });
    expect(copyBatch).toEqual([{ message_id: 101 }, { message_id: 102 }]);
  });

  it("savePreparedInlineMessage", async () => {
    const expected = { id: "prep_123", expiration_date: 1720000000 };
    const { client } = createMock(expected);
    const result = await client.savePreparedInlineMessage({
      user_id: 12345,
      result: {
        type: "article",
        id: "a1",
        title: "Test",
        input_message_content: { message_text: "Text" },
      },
      allow_user_chats: true,
      allow_bot_chats: true,
      allow_group_chats: true,
      allow_channel_chats: true,
    });
    expect(result).toEqual(expected);
  });

  it("sendPhoto, sendAudio, sendDocument, sendVideo, sendAnimation, sendVoice, sendVideoNote, sendMediaGroup", async () => {
    const { client } = createMock({ message_id: 1 });
    expect(await client.sendPhoto({ chat_id: 1, photo: "p" })).toBeDefined();
    expect(await client.sendAudio({ chat_id: 1, audio: "a" })).toBeDefined();
    expect(await client.sendDocument({ chat_id: 1, document: "d" })).toBeDefined();
    expect(await client.sendVideo({ chat_id: 1, video: "v" })).toBeDefined();
    expect(await client.sendAnimation({ chat_id: 1, animation: "an" })).toBeDefined();
    expect(await client.sendVoice({ chat_id: 1, voice: "vo" })).toBeDefined();
    expect(await client.sendVideoNote({ chat_id: 1, video_note: "vn" })).toBeDefined();
    expect(await client.sendMediaGroup({ chat_id: 1, media: [] })).toBeDefined();
  });

  it("sendLocation, editMessageLiveLocation, stopMessageLiveLocation, sendVenue, sendContact, sendPoll, stopPoll, sendDice, sendChatAction", async () => {
    const { client } = createMock(true);
    expect(await client.sendLocation({ chat_id: 1, latitude: 1, longitude: 2 })).toBe(true);
    expect(
      await client.editMessageLiveLocation({
        chat_id: 1,
        message_id: 2,
        latitude: 1,
        longitude: 2,
      }),
    ).toBe(true);
    expect(await client.stopMessageLiveLocation({ chat_id: 1, message_id: 2 })).toBe(true);
    expect(
      await client.sendVenue({ chat_id: 1, latitude: 1, longitude: 2, title: "T", address: "A" }),
    ).toBe(true);
    expect(await client.sendContact({ chat_id: 1, phone_number: "1", first_name: "F" })).toBe(true);
    expect(await client.sendPoll({ chat_id: 1, question: "Q", options: ["O1"] })).toBe(true);
    expect(await client.stopPoll(1, 2)).toBe(true);
    expect(await client.sendDice({ chat_id: 1 })).toBe(true);
    expect(await client.sendChatAction({ chat_id: 1, action: "typing" })).toBe(true);
  });

  it("editMessageText, editMessageCaption, editMessageMedia, editMessageReplyMarkup", async () => {
    const { client } = createMock(true);
    expect(await client.editMessageText({ chat_id: 1, message_id: 2, text: "T" })).toBe(true);
    expect(await client.editMessageCaption({ chat_id: 1, message_id: 2, caption: "C" })).toBe(true);
    expect(
      await client.editMessageMedia({
        chat_id: 1,
        message_id: 2,
        media: { type: "photo", media: "p" },
      }),
    ).toBe(true);
    expect(await client.editMessageReplyMarkup({ chat_id: 1, message_id: 2 })).toBe(true);
  });

  it("setMessageReaction, deleteMessageReaction, deleteAllMessageReactions", async () => {
    const { client } = createMock(true);
    expect(await client.setMessageReaction({ chat_id: 1, message_id: 2, reaction: "🔥" })).toBe(
      true,
    );
    expect(await client.deleteMessageReaction(1, 2)).toBe(true);
    expect(await client.deleteAllMessageReactions(1)).toBe(true);
  });

  it("getUserProfilePhotos, getFile, webhook methods, drafts, checklists, paid media, live photo", async () => {
    const { client } = createMock(true);
    expect(await client.getUserProfilePhotos(123)).toBe(true);
    expect(await client.getFile("f1")).toBe(true);
    expect(await client.setWebhook({ url: "https://example.com" })).toBe(true);
    expect(await client.deleteWebhook()).toBe(true);
    expect(await client.getWebhookInfo()).toBe(true);
    expect(await client.sendMessageDraft({ chat_id: 123 })).toBe(true);
    expect(
      await client.sendChecklist({
        business_connection_id: "bc1",
        chat_id: 123,
        checklist: { title: "Todo", tasks: [] },
      }),
    ).toBe(true);
    expect(
      await client.editMessageChecklist({
        business_connection_id: "bc1",
        chat_id: 123,
        message_id: 4,
        checklist: { title: "Todo", tasks: [] },
      }),
    ).toBe(true);
    expect(await client.sendPaidMedia({ chat_id: 123, star_count: 1, media: [] })).toBe(true);
    expect(
      await client.sendLivePhoto({ chat_id: 123, live_photo: "video_1", photo: "photo_1" }),
    ).toBe(true);
    expect(await client.getUserPersonalChatMessages(123, 10)).toBe(true);
  });
});

describe("MessageMethods payloads match the official Bot API 10.3 parameter names", () => {
  const createPayloadRecorder = () => {
    const calls: { method: string; payload: Record<string, unknown> }[] = [];
    const fakeFetch = vi.fn().mockImplementation(async (url: string, init: { body: string }) => {
      calls.push({
        method: String(url).split("/").pop() ?? "",
        payload: JSON.parse(init.body) as Record<string, unknown>,
      });
      return { status: 200, json: async () => ({ ok: true, result: true }) };
    });
    return { client: new ConcreteMessageClient("TEST_TOKEN", { fetch: fakeFetch }), calls };
  };

  it("sendPoll sends correct_option_ids, never the invented correct_option_id", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.sendPoll({
      chat_id: 1,
      question: "Q",
      options: ["A", "B"],
      type: "quiz",
      correct_option_ids: [0],
    });
    expect(calls[0]?.payload["correct_option_ids"]).toEqual([0]);
    expect(calls[0]?.payload["correct_option_id"]).toBeUndefined();
  });

  it("getUserPersonalChatMessages sends required user_id + limit, not chat_id", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.getUserPersonalChatMessages(555, 20);
    expect(calls[0]?.payload).toEqual({ user_id: 555, limit: 20 });
    expect(calls[0]?.payload["chat_id"]).toBeUndefined();
  });

  it("sendLivePhoto sends live_photo + photo and no invented video key", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.sendLivePhoto({ chat_id: 1, live_photo: "vid_1", photo: "pho_1" });
    expect(calls[0]?.payload).toEqual({ chat_id: 1, live_photo: "vid_1", photo: "pho_1" });
    expect(calls[0]?.payload["video"]).toBeUndefined();
  });

  it("deleteMessageReaction and deleteAllMessageReactions hit their true endpoints", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.deleteMessageReaction(1, 2, 3, 4);
    await client.deleteAllMessageReactions(1, 3, 4);
    expect(calls[0]?.method).toBe("deleteMessageReaction");
    expect(calls[0]?.payload).toEqual({ chat_id: 1, message_id: 2, user_id: 3, actor_chat_id: 4 });
    expect(calls[1]?.method).toBe("deleteAllMessageReactions");
    expect(calls[1]?.payload).toEqual({ chat_id: 1, user_id: 3, actor_chat_id: 4 });
    expect(calls[1]?.payload["message_id"]).toBeUndefined();
    for (const call of calls) {
      expect(call.method).not.toBe("setMessageReaction");
    }
  });
});
