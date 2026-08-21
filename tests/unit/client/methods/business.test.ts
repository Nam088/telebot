import { describe, it, expect, vi } from "vitest";
import { BusinessAndEcosystemMethods } from "../../../../src/client/methods/business.js";

class ConcreteBusinessClient extends BusinessAndEcosystemMethods {}

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
    expect(await client.postStory("biz_1", {})).toBe(true);
    expect(await client.editStory("biz_1", 1, {})).toBe(true);
    expect(await client.deleteStory("biz_1", 1)).toBe(true);
  });

  it("business connections and business messages", async () => {
    const { client } = createMock(true);
    expect(await client.getBusinessConnection("biz_1")).toBe(true);
    expect(await client.readBusinessMessage("biz_1", 100)).toBe(true);
    expect(await client.deleteBusinessMessages("biz_1", [100, 101])).toBe(true);
  });

  it("star gifts, verifications, boosts, emoji status", async () => {
    const { client } = createMock(true);
    expect(await client.getAvailableGifts()).toBe(true);
    expect(await client.sendGift({ user_id: 123, gift_id: "g1" })).toBe(true);
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
    expect(await client.giftPremiumSubscription({ user_id: 123, months: 3 })).toBe(true);
    expect(await client.getBusinessAccountGifts("biz_1")).toBe(true);
    expect(await client.getBusinessAccountStarBalance("biz_1")).toBe(true);
    expect(await client.setBusinessAccountName("biz_1", "N")).toBe(true);
    expect(await client.setBusinessAccountUsername("biz_1", "U")).toBe(true);
    expect(await client.setBusinessAccountBio("biz_1", "B")).toBe(true);
    expect(await client.setBusinessAccountGiftSettings("biz_1", {})).toBe(true);
    expect(await client.setBusinessAccountProfilePhoto("biz_1", "p")).toBe(true);
    expect(await client.removeBusinessAccountProfilePhoto("biz_1")).toBe(true);
    expect(await client.convertGiftToStars(123, "g")).toBe(true);
    expect(await client.upgradeGift(123, "g")).toBe(true);
    expect(await client.transferGift(123, "g", 456)).toBe(true);
    expect(await client.transferBusinessAccountStars("biz_1", 50)).toBe(true);
    expect(await client.getManagedBotAccessSettings(123)).toBe(true);
    expect(await client.setManagedBotAccessSettings(123, {})).toBe(true);
    expect(await client.createChatSubscriptionInviteLink(123, {})).toBe(true);
    expect(await client.editChatSubscriptionInviteLink(123, "l", {})).toBe(true);
    expect(await client.approveSuggestedPost(123, 456)).toBe(true);
    expect(await client.declineSuggestedPost(123, 456)).toBe(true);
    expect(await client.repostStory({})).toBe(true);
    expect(await client.getUserGifts(123)).toBe(true);
    expect(await client.getChatGifts(123)).toBe(true);
    expect(await client.setMyProfilePhoto("p")).toBe(true);
    expect(await client.removeMyProfilePhoto()).toBe(true);
    expect(await client.getUserProfileAudios(123, 0, 10)).toBe(true);
    expect(await client.setChatMemberTag(123, 456, "t")).toBe(true);
    expect(await client.getManagedBotToken(123)).toBe(true);
    expect(await client.replaceManagedBotToken(123)).toBe(true);
    expect(await client.savePreparedKeyboardButton({})).toBe(true);
    await client.initialize();
    await client.shutdown();
    expect(await client.doApiRequest("m", {})).toBe(true);
  });
});
