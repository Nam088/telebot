import { describe, it, expect, vi } from "vitest";
import { BusinessAndEcosystemMethods } from "../../../../src/client/methods/index.js";

class ConcreteBusinessClient extends BusinessAndEcosystemMethods {}

describe("BusinessAndEcosystemMethods Changelog Bot API 10.x Tests", () => {
  it("sendRichMessage, sendRichMessageDraft, editEphemeralMessageText, deleteEphemeralMessage, answerChatJoinRequestQuery, sendChatJoinRequestWebApp", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result: true }),
    });

    const client = new ConcreteBusinessClient("TEST_TOKEN", { fetch: fakeFetch });

    expect(await client.sendRichMessage({ chat_id: 123, rich_message: {} })).toBe(true);
    expect(await client.sendRichMessageDraft({ chat_id: 123, draft: "draft" })).toBe(true);
    expect(
      await client.editEphemeralMessageText({ chat_id: 123, message_id: 1, text: "edited" }),
    ).toBe(true);
    expect(await client.deleteEphemeralMessage(123, 1)).toBe(true);
    expect(await client.answerChatJoinRequestQuery({ query_id: "q1" })).toBe(true);
    expect(await client.sendChatJoinRequestWebApp({ chat_id: 123 })).toBe(true);
  });
});
