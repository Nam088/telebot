import { describe, it, expect, vi } from "vitest";
import { MessageMethods } from "../../../../src/client/methods/messages.js";

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
    const { client } = createMock({ message_id: 1 });
    expect(await client.forwardMessage({ chat_id: 1, from_chat_id: 2, message_id: 3 })).toEqual({
      message_id: 1,
    });
    expect(await client.forwardMessages({ chat_id: 1, from_chat_id: 2, message_ids: [3] })).toEqual(
      { message_id: 1 },
    );
    expect(await client.copyMessage({ chat_id: 1, from_chat_id: 2, message_id: 3 })).toEqual({
      message_id: 1,
    });
    expect(await client.copyMessages({ chat_id: 1, from_chat_id: 2, message_ids: [3] })).toEqual({
      message_id: 1,
    });
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
    expect(await client.deleteAllMessageReactions(1, 2)).toBe(true);
  });

  it("getUserProfilePhotos, getFile, webhook methods, drafts, checklists, paid media, live photo", async () => {
    const { client } = createMock(true);
    expect(await client.getUserProfilePhotos(123)).toBe(true);
    expect(await client.getFile("f1")).toBe(true);
    expect(await client.setWebhook({ url: "https://example.com" })).toBe(true);
    expect(await client.deleteWebhook()).toBe(true);
    expect(await client.getWebhookInfo()).toBe(true);
    expect(await client.sendMessageDraft({ chat_id: 123 })).toBe(true);
    expect(await client.sendChecklist({ chat_id: 123 })).toBe(true);
    expect(await client.editMessageChecklist({ chat_id: 123 })).toBe(true);
    expect(await client.sendPaidMedia({ chat_id: 123, star_count: 1, media: [] })).toBe(true);
    expect(await client.sendLivePhoto({ chat_id: 123 })).toBe(true);
    expect(await client.getUserPersonalChatMessages(123, 10)).toBe(true);
  });
});
