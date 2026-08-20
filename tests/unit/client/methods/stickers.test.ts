import { describe, it, expect, vi } from "vitest";
import { StickerMethods } from "../../../../src/client/methods/stickers.js";

class ConcreteStickerClient extends StickerMethods {}

describe("StickerMethods Unit Tests (1:1 mapping)", () => {
  const createMock = (result: unknown) => {
    const fakeFetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true, result }),
    });
    return { client: new ConcreteStickerClient("TEST_TOKEN", { fetch: fakeFetch }), fakeFetch };
  };

  it("sendSticker, getStickerSet, getCustomEmojiStickers, uploadStickerFile", async () => {
    const { client } = createMock(true);
    expect(await client.sendSticker({ chat_id: 123, sticker: "stk_1" })).toBe(true);
    expect(await client.getStickerSet("pack_name")).toBe(true);
    expect(await client.getCustomEmojiStickers(["emoji_1"])).toBe(true);
    expect(await client.uploadStickerFile(123, "file_data", "static")).toBe(true);
  });

  it("createNewStickerSet, addStickerToSet, setStickerPositionInSet, deleteStickerFromSet, deleteStickerSet, replaceStickerInSet", async () => {
    const { client } = createMock(true);
    expect(await client.createNewStickerSet({ user_id: 123, name: "p_by_bot", title: "P", stickers: [] })).toBe(true);
    expect(await client.addStickerToSet({ user_id: 123, name: "p_by_bot", sticker: { sticker: "s", format: "static", emoji_list: ["⭐"] } })).toBe(true);
    expect(await client.setStickerPositionInSet("s_1", 0)).toBe(true);
    expect(await client.deleteStickerFromSet("s_1")).toBe(true);
    expect(await client.deleteStickerSet("p_by_bot")).toBe(true);
    expect(await client.replaceStickerInSet({ user_id: 123, name: "p", old_sticker: "s1", sticker: { sticker: "s2", format: "static", emoji_list: ["⭐"] } })).toBe(true);
  });

  it("setStickerSetThumbnail, setCustomEmojiStickerSetThumbnail, setStickerSetTitle, setStickerEmojiList, setStickerKeywords, setStickerMaskPosition", async () => {
    const { client } = createMock(true);
    expect(await client.setStickerSetThumbnail("p", 123, "static", "thumb")).toBe(true);
    expect(await client.setCustomEmojiStickerSetThumbnail("p", "emoji_id")).toBe(true);
    expect(await client.setStickerSetTitle("p", "New Title")).toBe(true);
    expect(await client.setStickerEmojiList("s_1", ["⭐", "🔥"])).toBe(true);
    expect(await client.setStickerKeywords("s_1", ["space"])).toBe(true);
    expect(await client.setStickerMaskPosition("s_1", { point: "eyes", x_shift: 0, y_shift: 0, scale: 1 })).toBe(true);
  });
});
