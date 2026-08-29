import type { InputFile } from "../../../utils/http.js";
import type { File } from "../common/index.js";
import type { PhotoSize } from "../messages/index.js";

export interface Sticker {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Type of the sticker, currently one of "regular", "mask", "custom_emoji". */
  type: "regular" | "mask" | "custom_emoji";
  /** Sticker width. */
  width: number;
  /** Sticker height. */
  height: number;
  /** True, if the sticker is animated. */
  is_animated: boolean;
  /** True, if the sticker is a video sticker. */
  is_video: boolean;
  /** Sticker thumbnail in the .WEBP or .JPG format. */
  thumbnail?: PhotoSize;
  /** Emoji associated with the sticker. */
  emoji?: string;
  /** Name of the sticker set to which the sticker belongs. */
  set_name?: string;
  /** For premium regular stickers, premium animation for the sticker. */
  premium_animation?: File;
  /** For mask stickers, the position where the mask should be placed. */
  mask_position?: MaskPosition;
  /** For custom emoji stickers, unique identifier of the custom emoji. */
  custom_emoji_id?: string;
  /** True, if the sticker must be repainted to a text color in messages. */
  needs_repainting?: boolean;
  /** File size in bytes. */
  file_size?: number;
}

export interface MaskPosition {
  /** The part of the face relative to which the mask should be placed. One of "forehead", "eyes", "mouth", or "chin". */
  point: string;
  /** Shift by X-axis measured in widths of the mask scaled to the face size, from left to right. */
  x_shift: number;
  /** Shift by Y-axis measured in heights of the mask scaled to the face size, from top to bottom. */
  y_shift: number;
  /** Mask scaling coefficient. */
  scale: number;
}

export interface StickerSet {
  /** Sticker set name. */
  name: string;
  /** Sticker set title. */
  title: string;
  /** Type of stickers in the set, currently one of "regular", "mask", "custom_emoji". */
  sticker_type: "regular" | "mask" | "custom_emoji";
  /** List of all stickers in the set. */
  stickers: Sticker[];
  /** Sticker set thumbnail in the .WEBP, .TGS, or .WEBM format. */
  thumbnail?: PhotoSize;
}

export interface InputSticker {
  /** The added sticker. Pass a file_id as a string or an InputFile object. */
  sticker: string | InputFile;
  /** Format of the sticker, must be one of "static", "animated", "video". */
  format: "static" | "animated" | "video";
  /** List of 1-20 emoji associated with the sticker. */
  emoji_list: string[];
  /** Position where the mask should be placed on faces. For "mask" stickers only. */
  mask_position?: MaskPosition;
  /** List of 0-20 search keywords for the sticker with total length up to 64 characters. For "regular" and "custom_emoji" stickers only. */
  keywords?: string[];
}
