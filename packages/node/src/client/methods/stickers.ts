/**
 * Stickers and Custom Emoji methods for Bot API.
 *
 * @packageDocumentation
 */

import { ChatMethods } from "./chats/index.js";
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
  /**
   * Sends a static, animated (.TGS), or video (.WEBM) sticker.
   *
   * @param options - Options including `chat_id` and `sticker` (file ID, URL, or {@link InputFile}).
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending sticker fails.
   *
   * @example
   * ```ts
   * await bot.sendSticker({
   *   chat_id: 123456,
   *   sticker: stickerFileId,
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#sendsticker Telegram Bot API: sendSticker}
   */
  public async sendSticker(options: SendStickerOptions): Promise<Message> {
    return this.request<Message>("sendSticker", options as unknown as Record<string, unknown>);
  }

  /**
   * Retrieves a sticker set by its short name.
   *
   * @param name - Short name of the sticker set.
   * @returns A {@link StickerSet} object.
   * @throws {@link TelegramApiError} When sticker set is not found.
   *
   * @example
   * ```ts
   * const set = await bot.getStickerSet("animals");
   * console.log(`Sticker set title: ${set.title}, stickers: ${set.stickers.length}`);
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#getstickerset Telegram Bot API: getStickerSet}
   */
  public async getStickerSet(name: string): Promise<StickerSet> {
    return this.request<StickerSet>("getStickerSet", { name });
  }

  /**
   * Retrieves information about custom emoji stickers by their identifiers.
   *
   * @param customEmojiIds - List of custom emoji identifiers (up to 200).
   * @returns Array of {@link Sticker} objects.
   * @throws {@link TelegramApiError} When retrieval fails.
   *
   * @example
   * ```ts
   * const emojis = await bot.getCustomEmojiStickers(["5368324170671202286"]);
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#getcustomemojistickers Telegram Bot API: getCustomEmojiStickers}
   */
  public async getCustomEmojiStickers(customEmojiIds: string[]): Promise<Sticker[]> {
    return this.request<Sticker[]>("getCustomEmojiStickers", { custom_emoji_ids: customEmojiIds });
  }

  /**
   * Uploads a file with a sticker for later use in `createNewStickerSet` and `addStickerToSet` methods.
   *
   * @param userId - User identifier of sticker file owner.
   * @param sticker - A file with the sticker (.PNG, .WEBP, .TGS, or .WEBM).
   * @param stickerFormat - Format of the sticker: `"static"`, `"animated"`, or `"video"`.
   * @returns The uploaded {@link File} object.
   * @throws {@link TelegramApiError} When upload fails.
   *
   * @example
   * ```ts
   * const file = await bot.uploadStickerFile(userId, stickerInputFile, "static");
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#uploadstickerfile Telegram Bot API: uploadStickerFile}
   */
  public async uploadStickerFile(
    userId: number,
    sticker: string | InputFile,
    stickerFormat: "static" | "animated" | "video",
  ): Promise<File> {
    return this.request<File>("uploadStickerFile", {
      user_id: userId,
      sticker,
      sticker_format: stickerFormat,
    });
  }

  /**
   * Creates a new sticker set owned by a user.
   *
   * @param options - Options including `user_id`, `name`, `title`, `stickers` array, and `sticker_format`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When creation fails.
   *
   * @example
   * ```ts
   * await bot.createNewStickerSet({
   *   user_id: 123456,
   *   name: "custom_pack_by_bot",
   *   title: "Custom Pack",
   *   stickers: [{ sticker: uploadedFileId, emoji_list: ["😀"] }],
   *   sticker_format: "static",
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#createnewstickerset Telegram Bot API: createNewStickerSet}
   */
  public async createNewStickerSet(options: CreateNewStickerSetOptions): Promise<boolean> {
    return this.request<boolean>(
      "createNewStickerSet",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Adds a new sticker to a set created by the bot.
   *
   * @param options - Options including `user_id`, `name`, and `sticker` descriptor.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When adding sticker fails.
   *
   * @see {@link https://core.telegram.org/bots/api#addstickertoset Telegram Bot API: addStickerToSet}
   */
  public async addStickerToSet(options: AddStickerToSetOptions): Promise<boolean> {
    return this.request<boolean>("addStickerToSet", options as unknown as Record<string, unknown>);
  }

  /**
   * Moves a sticker in a set created by the bot to a specific position.
   *
   * @param sticker - File identifier of the sticker.
   * @param position - New 0-based position of the sticker in the set.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When moving position fails.
   *
   * @see {@link https://core.telegram.org/bots/api#setstickerpositioninset Telegram Bot API: setStickerPositionInSet}
   */
  public async setStickerPositionInSet(sticker: string, position: number): Promise<boolean> {
    return this.request<boolean>("setStickerPositionInSet", { sticker, position });
  }

  /**
   * Deletes a sticker from a set created by the bot.
   *
   * @param sticker - File identifier of the sticker.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting sticker fails.
   *
   * @see {@link https://core.telegram.org/bots/api#deletestickerfromset Telegram Bot API: deleteStickerFromSet}
   */
  public async deleteStickerFromSet(sticker: string): Promise<boolean> {
    return this.request<boolean>("deleteStickerFromSet", { sticker });
  }

  /**
   * Deletes a sticker set that was created by the bot.
   *
   * @param name - Sticker set name.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting set fails.
   *
   * @see {@link https://core.telegram.org/bots/api#deletestickerset Telegram Bot API: deleteStickerSet}
   */
  public async deleteStickerSet(name: string): Promise<boolean> {
    return this.request<boolean>("deleteStickerSet", { name });
  }

  /**
   * Replaces an existing sticker in a sticker set with a new one.
   *
   * @param options - Options including `user_id`, `name`, `old_sticker`, and `sticker` descriptor.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When replacing sticker fails.
   *
   * @see {@link https://core.telegram.org/bots/api#replacestickerinset Telegram Bot API: replaceStickerInSet}
   */
  public async replaceStickerInSet(options: ReplaceStickerInSetOptions): Promise<boolean> {
    return this.request<boolean>(
      "replaceStickerInSet",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Sets the thumbnail of a regular or custom emoji sticker set.
   *
   * @param name - Sticker set name.
   * @param userId - User identifier of the sticker set owner.
   * @param format - Format of the thumbnail (`"static"`, `"animated"`, or `"video"`).
   * @param thumbnail - Thumbnail file identifier, URL, or {@link InputFile}.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting thumbnail fails.
   *
   * @see {@link https://core.telegram.org/bots/api#setstickersetthumbnail Telegram Bot API: setStickerSetThumbnail}
   */
  public async setStickerSetThumbnail(
    name: string,
    userId: number,
    format: "static" | "animated" | "video",
    thumbnail?: string | InputFile,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { name, user_id: userId, format };
    if (thumbnail !== undefined) payload["thumbnail"] = thumbnail;
    return this.request<boolean>("setStickerSetThumbnail", payload);
  }

  /**
   * Sets the thumbnail of a custom emoji sticker set.
   *
   * @param name - Sticker set name.
   * @param customEmojiId - Custom emoji identifier of a sticker from the set.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting thumbnail fails.
   *
   * @example
   * ```ts
   * await bot.setCustomEmojiStickerSetThumbnail("custom_emojis", "5368324170671202286");
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#setcustomemojistickersetthumbnail Telegram Bot API: setCustomEmojiStickerSetThumbnail}
   */
  public async setCustomEmojiStickerSetThumbnail(
    name: string,
    customEmojiId?: string,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { name };
    if (customEmojiId !== undefined) payload["custom_emoji_id"] = customEmojiId;
    return this.request<boolean>("setCustomEmojiStickerSetThumbnail", payload);
  }

  /**
   * Sets the title of a created sticker set.
   *
   * @param name - Sticker set name.
   * @param title - Sticker set title, 1-64 characters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting title fails.
   *
   * @example
   * ```ts
   * await bot.setStickerSetTitle("my_pack", "My Awesome Sticker Pack");
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#setstickersettitle Telegram Bot API: setStickerSetTitle}
   */
  public async setStickerSetTitle(name: string, title: string): Promise<boolean> {
    return this.request<boolean>("setStickerSetTitle", { name, title });
  }

  /**
   * Changes the list of emoji assigned to a regular or custom emoji sticker.
   *
   * @param sticker - File identifier of the sticker.
   * @param emojiList - List of 1-20 emoji associated with the sticker.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting emoji list fails.
   *
   * @see {@link https://core.telegram.org/bots/api#setstickeremojilist Telegram Bot API: setStickerEmojiList}
   */
  public async setStickerEmojiList(sticker: string, emojiList: string[]): Promise<boolean> {
    return this.request<boolean>("setStickerEmojiList", { sticker, emoji_list: emojiList });
  }

  /**
   * Changes search keywords for a sticker.
   *
   * @param sticker - File identifier of the sticker.
   * @param keywords - List of 0-20 search keywords for the sticker.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting keywords fails.
   *
   * @see {@link https://core.telegram.org/bots/api#setstickerkeywords Telegram Bot API: setStickerKeywords}
   */
  public async setStickerKeywords(sticker: string, keywords?: string[]): Promise<boolean> {
    const payload: Record<string, unknown> = { sticker };
    if (keywords !== undefined) payload["keywords"] = keywords;
    return this.request<boolean>("setStickerKeywords", payload);
  }

  /**
   * Changes the mask position of a mask sticker.
   *
   * @param sticker - File identifier of the sticker.
   * @param maskPosition - Object with the position where the mask should be placed.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting mask position fails.
   *
   * @see {@link https://core.telegram.org/bots/api#setstickermaskposition Telegram Bot API: setStickerMaskPosition}
   */
  public async setStickerMaskPosition(
    sticker: string,
    maskPosition?: MaskPosition,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { sticker };
    if (maskPosition !== undefined) payload["mask_position"] = maskPosition;
    return this.request<boolean>("setStickerMaskPosition", payload);
  }
}
