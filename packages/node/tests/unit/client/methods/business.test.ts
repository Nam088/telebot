import { describe, it, expect, vi } from "vitest";
import { BusinessAndEcosystemMethods } from "../../../../src/client/methods/index.js";
import type { AcceptedGiftTypes } from "../../../../src/client/types/index.js";

class ConcreteBusinessClient extends BusinessAndEcosystemMethods {}

/** Every field of AcceptedGiftTypes is required by the Bot API. */
const ALL_GIFT_TYPES: AcceptedGiftTypes = {
  unlimited_gifts: true,
  limited_gifts: false,
  unique_gifts: true,
  premium_subscription: true,
  gifts_from_channels: false,
};

describe("BusinessAndEcosystemMethods Unit Tests (1:1 mapping)", () => {
  const createMock = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { client: new ConcreteBusinessClient("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("callback query, inline query, HTML5 games", async () => {
    const { client } = createMock(true);
    expect(await client.answerCallbackQuery({ callback_query_id: "cb_1" })).toBe(true);
    expect(await client.answerInlineQuery({ inline_query_id: "iq_1", results: [] })).toBe(true);
    expect(await client.sendGame(123, "my_game")).toBe(true);
    expect(await client.setGameScore(123, 100)).toBe(true);
    expect(await client.getGameHighScores(123)).toBe(true);
  });

  it("passport and stories", async () => {
    const { client } = createMock(true);
    expect(
      await client.setPassportDataErrors(123, [
        { source: "data", type: "passport", message: "err" },
      ]),
    ).toBe(true);
    expect(await client.postStory("biz_1", {}, { active_period: 86400 })).toBe(true);
    expect(await client.editStory("biz_1", 1, {})).toBe(true);
    expect(await client.deleteStory("biz_1", 1)).toBe(true);
  });

  it("business connections and business messages", async () => {
    const { client } = createMock(true);
    expect(await client.getBusinessConnection("biz_1")).toBe(true);
    expect(await client.readBusinessMessage("biz_1", 456, 100)).toBe(true);
    expect(await client.deleteBusinessMessages("biz_1", [100, 101])).toBe(true);
  });

  it("star gifts, verifications, boosts, emoji status", async () => {
    const { client } = createMock(true);
    expect(await client.getAvailableGifts()).toBe(true);
    expect(await client.sendGift({ user_id: 123, gift_id: "g1" })).toBe(true);
    expect(await client.sendGift({ chat_id: "@chan", gift_id: "g1" })).toBe(true);
    expect(await client.verifyChat(123, "desc")).toBe(true);
    expect(await client.verifyUser(123, "desc")).toBe(true);
    expect(await client.removeChatVerification(123)).toBe(true);
    expect(await client.removeUserVerification(123)).toBe(true);
    expect(await client.getUserChatBoosts(123, 456)).toBe(true);
    expect(await client.setUserEmojiStatus(123, "emoji_1")).toBe(true);
  });

  it("all additional Telegram 8.0+ ecosystem methods", async () => {
    const { client } = createMock(true);
    expect(
      await client.savePreparedInlineMessage({
        user_id: 123,
        result: {
          type: "article",
          id: "1",
          title: "T",
          input_message_content: { message_text: "M" },
        },
      }),
    ).toBe(true);
    expect(await client.answerWebAppQuery("q1", {})).toBe(true);
    expect(await client.answerGuestQuery("g1", {})).toBe(true);
    expect(await client.logOut()).toBe(true);
    expect(await client.close()).toBe(true);
    expect(await client.getForumTopicIconStickers()).toBe(true);
    expect(
      await client.giftPremiumSubscription({ user_id: 123, month_count: 3, star_count: 1000 }),
    ).toBe(true);
    expect(await client.getBusinessAccountGifts("biz_1", { exclude_saved: true })).toBe(true);
    expect(await client.getBusinessAccountStarBalance("biz_1")).toBe(true);
    expect(await client.setBusinessAccountName("biz_1", "First", "Last")).toBe(true);
    expect(await client.setBusinessAccountUsername("biz_1", "U")).toBe(true);
    expect(await client.setBusinessAccountBio("biz_1", "B")).toBe(true);
    expect(
      await client.setBusinessAccountGiftSettings("biz_1", {
        show_gift_button: true,
        accepted_gift_types: ALL_GIFT_TYPES,
      }),
    ).toBe(true);
    expect(await client.setBusinessAccountProfilePhoto("biz_1", "p", { is_public: true })).toBe(
      true,
    );
    expect(await client.removeBusinessAccountProfilePhoto("biz_1", { is_public: true })).toBe(true);
    expect(await client.convertGiftToStars("biz_1", "g")).toBe(true);
    expect(await client.upgradeGift("biz_1", "g", { keep_original_details: true })).toBe(true);
    expect(await client.transferGift("biz_1", "g", 456, { star_count: 25 })).toBe(true);
    expect(await client.transferBusinessAccountStars("biz_1", 50)).toBe(true);
    expect(await client.getManagedBotAccessSettings(123)).toBe(true);
    expect(await client.setManagedBotAccessSettings(123, { is_access_restricted: true })).toBe(
      true,
    );
    expect(
      await client.createChatSubscriptionInviteLink(123, {
        subscription_period: 2592000,
        subscription_price: 50,
      }),
    ).toBe(true);
    expect(await client.editChatSubscriptionInviteLink(123, "l", {})).toBe(true);
    expect(await client.approveSuggestedPost(123, 456, 1700000000)).toBe(true);
    expect(await client.declineSuggestedPost(123, 456, "not suitable")).toBe(true);
    expect(
      await client.repostStory({ from_chat_id: 200, from_story_id: 9, active_period: 86400 }),
    ).toBe(true);
    expect(await client.getUserGifts(123, { exclude_unique: true, limit: 10 })).toBe(true);
    expect(await client.getChatGifts(123, { exclude_unsaved: true, exclude_saved: false })).toBe(
      true,
    );
    expect(await client.setMyProfilePhoto("p")).toBe(true);
    expect(await client.removeMyProfilePhoto()).toBe(true);
    expect(await client.getUserProfileAudios(123, 0, 10)).toBe(true);
    expect(await client.setChatMemberTag(123, 456, "t")).toBe(true);
    expect(await client.getManagedBotToken(123)).toBe(true);
    expect(await client.replaceManagedBotToken(123)).toBe(true);
    expect(
      await client.savePreparedKeyboardButton({
        user_id: 42,
        button: { text: "Share team", request_users: { user_is_bot: true } },
      }),
    ).toBe(true);
    await client.initialize();
    await client.shutdown();
    expect(await client.doApiRequest("m", {})).toBe(true);
  });
});

describe("Business method payloads match the official Bot API 10.3 parameter names", () => {
  const createPayloadRecorder = () => {
    const calls: { method: string; payload: Record<string, unknown> }[] = [];
    const fakeFetch = vi.fn().mockImplementation(async (url: string, init: { body: string }) => {
      calls.push({
        method: String(url).split("/").pop() ?? "",
        payload: JSON.parse(init.body) as Record<string, unknown>,
      });
      return { status: 200, json: async () => ({ ok: true, result: true }) };
    });
    return { client: new ConcreteBusinessClient("TEST_TOKEN", { fetch: fakeFetch }), calls };
  };

  it("convertGiftToStars uses business_connection_id, never user_id", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.convertGiftToStars("biz_1", "owned_1");
    expect(calls[0]?.payload).toEqual({
      business_connection_id: "biz_1",
      owned_gift_id: "owned_1",
    });
    expect(calls[0]?.payload["user_id"]).toBeUndefined();
  });

  it("upgradeGift sends business_connection_id, owned_gift_id and optional keep_original_details/star_count", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.upgradeGift("biz_1", "owned_1", { keep_original_details: true, star_count: 300 });
    expect(calls[0]?.method).toBe("upgradeGift");
    expect(calls[0]?.payload).toEqual({
      business_connection_id: "biz_1",
      owned_gift_id: "owned_1",
      keep_original_details: true,
      star_count: 300,
    });
  });

  it("transferGift sends business_connection_id, owned_gift_id, new_owner_chat_id and optional star_count", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.transferGift("biz_1", "owned_1", 456, { star_count: 50 });
    expect(calls[0]?.payload).toEqual({
      business_connection_id: "biz_1",
      owned_gift_id: "owned_1",
      new_owner_chat_id: 456,
      star_count: 50,
    });
    expect(calls[0]?.payload["user_id"]).toBeUndefined();
  });

  it("readBusinessMessage sends the required chat_id", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.readBusinessMessage("biz_1", 456, 100);
    expect(calls[0]?.payload).toEqual({
      business_connection_id: "biz_1",
      chat_id: 456,
      message_id: 100,
    });
  });

  it("setBusinessAccountName sends first_name and optional last_name, never an invented name field", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.setBusinessAccountName("biz_1", "Alice");
    await client.setBusinessAccountName("biz_1", "Alice", "Anderson");
    expect(calls[0]?.payload).toEqual({ business_connection_id: "biz_1", first_name: "Alice" });
    expect(calls[1]?.payload).toEqual({
      business_connection_id: "biz_1",
      first_name: "Alice",
      last_name: "Anderson",
    });
  });

  it("setUserEmojiStatus sends emoji_status_custom_emoji_id", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.setUserEmojiStatus(123, "emoji_1", { emoji_status_expiration_date: 1700000000 });
    expect(calls[0]?.payload).toEqual({
      user_id: 123,
      emoji_status_custom_emoji_id: "emoji_1",
      emoji_status_expiration_date: 1700000000,
    });
    expect(calls[0]?.payload["custom_emoji_id"]).toBeUndefined();
  });

  it("profile photo methods forward is_public", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.setBusinessAccountProfilePhoto("biz_1", { type: "static" }, { is_public: true });
    await client.removeBusinessAccountProfilePhoto("biz_1", { is_public: true });
    expect(calls[0]?.payload).toEqual({
      business_connection_id: "biz_1",
      photo: { type: "static" },
      is_public: true,
    });
    expect(calls[1]?.payload).toEqual({ business_connection_id: "biz_1", is_public: true });
  });

  it("gift list methods forward their documented filters", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.getBusinessAccountGifts("biz_1", {
      exclude_unsaved: true,
      exclude_saved: false,
      limit: 10,
    });
    await client.getUserGifts(123, { exclude_unique: true, offset: "o1" });
    await client.getChatGifts("@chan", { exclude_unsaved: true, sort_by_price: true });
    expect(calls[0]?.payload).toEqual({
      business_connection_id: "biz_1",
      exclude_unsaved: true,
      exclude_saved: false,
      limit: 10,
    });
    expect(calls[1]?.payload).toEqual({
      user_id: 123,
      exclude_unique: true,
      offset: "o1",
    });
    expect(calls[2]?.payload).toEqual({
      chat_id: "@chan",
      exclude_unsaved: true,
      sort_by_price: true,
    });
  });

  it("sendGift supports channel chat targets via chat_id", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.sendGift({ chat_id: "@chan", gift_id: "g1", text: "gg" });
    expect(calls[0]?.payload).toEqual({ chat_id: "@chan", gift_id: "g1", text: "gg" });
    expect(calls[0]?.payload["user_id"]).toBeUndefined();
  });

  it("managed-bot methods send user_id, never the invented bot_id", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.getManagedBotAccessSettings(555);
    await client.setManagedBotAccessSettings(555, {
      is_access_restricted: true,
      added_user_ids: [7, 8],
    });
    await client.getManagedBotToken(555);
    await client.replaceManagedBotToken(555);
    expect(calls[0]?.payload).toEqual({ user_id: 555 });
    expect(calls[1]?.payload).toEqual({
      user_id: 555,
      is_access_restricted: true,
      added_user_ids: [7, 8],
    });
    expect(calls[2]?.payload).toEqual({ user_id: 555 });
    expect(calls[3]?.payload).toEqual({ user_id: 555 });
    for (const call of calls) {
      expect(call.payload["bot_id"]).toBeUndefined();
    }
  });

  it("setBusinessAccountGiftSettings sends the documented accepted_gift_types object", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.setBusinessAccountGiftSettings("biz_1", {
      show_gift_button: true,
      accepted_gift_types: ALL_GIFT_TYPES,
    });
    expect(calls[0]?.method).toBe("setBusinessAccountGiftSettings");
    expect(calls[0]?.payload).toEqual({
      business_connection_id: "biz_1",
      show_gift_button: true,
      accepted_gift_types: {
        unlimited_gifts: true,
        limited_gifts: false,
        unique_gifts: true,
        premium_subscription: true,
        gifts_from_channels: false,
      },
    });
  });

  it("suggested post methods send send_date/comment and omit them when unset", async () => {
    const { client, calls } = createPayloadRecorder();
    await client.approveSuggestedPost(123, 456, 1700000000);
    await client.approveSuggestedPost(123, 456);
    await client.declineSuggestedPost(123, 456, "not suitable");
    await client.declineSuggestedPost(123, 456);
    expect(calls[0]?.payload).toEqual({
      chat_id: 123,
      message_id: 456,
      send_date: 1700000000,
    });
    expect(calls[1]?.payload).toEqual({ chat_id: 123, message_id: 456 });
    expect(calls[2]?.payload).toEqual({ chat_id: 123, message_id: 456, comment: "not suitable" });
    expect(calls[3]?.payload).toEqual({ chat_id: 123, message_id: 456 });
  });
});
