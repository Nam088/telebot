/**
 * Stickers and Custom Emoji methods for Bot API.
 *
 * @packageDocumentation
 */

import { ChatMethods } from "./chats.js";
import type {
  Message,
  Sticker,
  StickerSet,
  MaskPosition,
  File,
  SendStickerOptions,
  CreateNewStickerSetOptions,
  AddStickerToSetOptions,
  ReplaceStickerInSetOptions,
} from "../types.js";
import type { InputFile } from "../../utils/http.js";

/**
 * Mixin providing sticker and custom emoji operations.
 */
export abstract class StickerMethods extends ChatMethods {
  public async sendSticker(options: SendStickerOptions): Promise<Message> {
    return this.request<Message>("sendSticker", options as unknown as Record<string, unknown>);
  }

  public async getStickerSet(name: string): Promise<StickerSet> {
    return this.request<StickerSet>("getStickerSet", { name });
  }

  public async getCustomEmojiStickers(customEmojiIds: string[]): Promise<Sticker[]> {
    return this.request<Sticker[]>("getCustomEmojiStickers", { custom_emoji_ids: customEmojiIds });
  }

  public async uploadStickerFile(
    userId: number,
    sticker: string | InputFile,
    stickerFormat: "static" | "animated" | "video"
  ): Promise<File> {
    return this.request<File>("uploadStickerFile", {
      user_id: userId,
      sticker,
      sticker_format: stickerFormat,
    });
  }

  public async createNewStickerSet(options: CreateNewStickerSetOptions): Promise<boolean> {
    return this.request<boolean>("createNewStickerSet", options as unknown as Record<string, unknown>);
  }

  public async addStickerToSet(options: AddStickerToSetOptions): Promise<boolean> {
    return this.request<boolean>("addStickerToSet", options as unknown as Record<string, unknown>);
  }

  public async setStickerPositionInSet(sticker: string, position: number): Promise<boolean> {
    return this.request<boolean>("setStickerPositionInSet", { sticker, position });
  }

  public async deleteStickerFromSet(sticker: string): Promise<boolean> {
    return this.request<boolean>("deleteStickerFromSet", { sticker });
  }

  public async deleteStickerSet(name: string): Promise<boolean> {
    return this.request<boolean>("deleteStickerSet", { name });
  }

  public async replaceStickerInSet(options: ReplaceStickerInSetOptions): Promise<boolean> {
    return this.request<boolean>("replaceStickerInSet", options as unknown as Record<string, unknown>);
  }

  public async setStickerSetThumbnail(
    name: string,
    userId: number,
    format: "static" | "animated" | "video",
    thumbnail?: string | InputFile
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { name, user_id: userId, format };
    if (thumbnail !== undefined) payload["thumbnail"] = thumbnail;
    return this.request<boolean>("setStickerSetThumbnail", payload);
  }

  public async setCustomEmojiStickerSetThumbnail(name: string, customEmojiId?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { name };
    if (customEmojiId !== undefined) payload["custom_emoji_id"] = customEmojiId;
    return this.request<boolean>("setCustomEmojiStickerSetThumbnail", payload);
  }

  public async setStickerSetTitle(name: string, title: string): Promise<boolean> {
    return this.request<boolean>("setStickerSetTitle", { name, title });
  }

  public async setStickerEmojiList(sticker: string, emojiList: string[]): Promise<boolean> {
    return this.request<boolean>("setStickerEmojiList", { sticker, emoji_list: emojiList });
  }

  public async setStickerKeywords(sticker: string, keywords?: string[]): Promise<boolean> {
    const payload: Record<string, unknown> = { sticker };
    if (keywords !== undefined) payload["keywords"] = keywords;
    return this.request<boolean>("setStickerKeywords", payload);
  }

  public async setStickerMaskPosition(sticker: string, maskPosition?: MaskPosition): Promise<boolean> {
    const payload: Record<string, unknown> = { sticker };
    if (maskPosition !== undefined) payload["mask_position"] = maskPosition;
    return this.request<boolean>("setStickerMaskPosition", payload);
  }
}
