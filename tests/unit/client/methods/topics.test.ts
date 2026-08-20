import { describe, it, expect, vi } from "vitest";
import { TopicAndProfileMethods } from "../../../../src/client/methods/topics.js";

class ConcreteTopicClient extends TopicAndProfileMethods {}

describe("TopicAndProfileMethods Unit Tests (1:1 mapping)", () => {
  const createMock = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { client: new ConcreteTopicClient("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("bot commands, names, descriptions, admin rights, chat menu button", async () => {
    const { client } = createMock(true);
    expect(
      await client.setMyCommands({ commands: [{ command: "start", description: "Start" }] }),
    ).toBe(true);
    expect(await client.getMyCommands()).toBe(true);
    expect(await client.deleteMyCommands()).toBe(true);
    expect(await client.setMyName("Bot", "en")).toBe(true);
    expect(await client.getMyName("en")).toBe(true);
    expect(await client.setMyDescription("Desc", "en")).toBe(true);
    expect(await client.getMyDescription("en")).toBe(true);
    expect(await client.setMyShortDescription("Short", "en")).toBe(true);
    expect(await client.getMyShortDescription("en")).toBe(true);
    expect(await client.setMyDefaultAdministratorRights()).toBe(true);
    expect(await client.getMyDefaultAdministratorRights()).toBe(true);
    expect(await client.setChatMenuButton(123, { type: "default" })).toBe(true);
    expect(await client.getChatMenuButton(123)).toBe(true);
  });

  it("forum topics and general forum topics full suite", async () => {
    const { client } = createMock(true);
    expect(await client.createForumTopic({ chat_id: 123, name: "Topic" })).toBe(true);
    expect(
      await client.editForumTopic({ chat_id: 123, message_thread_id: 1, name: "Topic 2" }),
    ).toBe(true);
    expect(await client.closeForumTopic(123, 1)).toBe(true);
    expect(await client.reopenForumTopic(123, 1)).toBe(true);
    expect(await client.deleteForumTopic(123, 1)).toBe(true);
    expect(await client.unpinAllForumTopicMessages(123, 1)).toBe(true);
    expect(await client.editGeneralForumTopic(123, "General 2")).toBe(true);
    expect(await client.closeGeneralForumTopic(123)).toBe(true);
    expect(await client.reopenGeneralForumTopic(123)).toBe(true);
    expect(await client.hideGeneralForumTopic(123)).toBe(true);
    expect(await client.unhideGeneralForumTopic(123)).toBe(true);
    expect(await client.unpinAllGeneralForumTopicMessages(123)).toBe(true);
  });
});
