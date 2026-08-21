import { describe, it, expect, vi } from "vitest";
import { ChatMethods } from "../../../../src/client/methods/chats.js";

class ConcreteChatClient extends ChatMethods {}

describe("ChatMethods Unit Tests (1:1 mapping)", () => {
  const createMock = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { client: new ConcreteChatClient("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("banChatMember, unbanChatMember, banChatSenderChat, unbanChatSenderChat, restrictChatMember, promoteChatMember", async () => {
    const { client } = createMock(true);
    expect(await client.banChatMember(123, 456)).toBe(true);
    expect(await client.unbanChatMember(123, 456)).toBe(true);
    expect(await client.banChatSenderChat(123, 456)).toBe(true);
    expect(await client.unbanChatSenderChat(123, 456)).toBe(true);
    expect(await client.restrictChatMember(123, 456, { can_send_messages: true })).toBe(true);
    expect(await client.promoteChatMember(123, 456, { can_change_info: true })).toBe(true);
  });

  it("admin titles, permissions, invite links", async () => {
    const { client } = createMock(true);
    expect(await client.setChatAdministratorCustomTitle(123, 456, "Boss")).toBe(true);
    expect(await client.setChatPermissions(123, { can_send_messages: true })).toBe(true);
    expect(await client.exportChatInviteLink(123)).toBe(true);
    expect(await client.createChatInviteLink(123, { name: "VIP" })).toBe(true);
    expect(await client.editChatInviteLink(123, "link_123", { name: "VIP2" })).toBe(true);
    expect(await client.revokeChatInviteLink(123, "link_123")).toBe(true);
    expect(await client.approveChatJoinRequest(123, 456)).toBe(true);
    expect(await client.declineChatJoinRequest(123, 456)).toBe(true);
  });

  it("chat photo, title, description, pin/unpin, leaveChat, getChat info & members", async () => {
    const { client } = createMock(true);
    expect(await client.setChatPhoto(123, "photo_id")).toBe(true);
    expect(await client.deleteChatPhoto(123)).toBe(true);
    expect(await client.setChatTitle(123, "New Title")).toBe(true);
    expect(await client.setChatDescription(123, "New Desc")).toBe(true);
    expect(await client.pinChatMessage(123, 1)).toBe(true);
    expect(await client.unpinChatMessage(123, 1)).toBe(true);
    expect(await client.unpinAllChatMessages(123)).toBe(true);
    expect(await client.leaveChat(123)).toBe(true);
    expect(await client.getChat(123)).toBe(true);
    expect(await client.getChatAdministrators(123)).toBe(true);
    expect(await client.getChatMemberCount(123)).toBe(true);
    expect(await client.getChatMember(123, 456)).toBe(true);
    expect(await client.setChatStickerSet(123, "pack")).toBe(true);
    expect(await client.deleteChatStickerSet(123)).toBe(true);
  });

  it("verifyUser, verifyChat, removeUserVerification, removeChatVerification, getUserChatBoosts", async () => {
    const { client } = createMock(true);
    expect(await client.verifyUser(123, "Custom user desc")).toBe(true);
    expect(await client.verifyChat(456, "Custom chat desc")).toBe(true);
    expect(await client.removeUserVerification(123)).toBe(true);
    expect(await client.removeChatVerification(456)).toBe(true);

    const mockBoosts = { boosts: [] };
    const { client: boostClient } = createMock(mockBoosts);
    expect(await boostClient.getUserChatBoosts(456, 123)).toEqual(mockBoosts);
  });
});
