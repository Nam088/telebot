import type { InputFile } from "../../utils/http.js";
import type { File } from "./common.js";
import type { PhotoSize, ReplyMarkup, EphemeralMessageParameters, ReplyParameters } from "./messages.js";


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

export interface SendStickerOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Sticker to send. Pass a file_id as String to send a file that exists on the Telegram servers, or an HTTP URL as String, or upload a new one using InputFile. */
  sticker: string | InputFile;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Emoji associated with the sticker; only for just uploaded stickers. */
  emoji?: string;
  /** Sends the message silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
  /** Ephemeral message parameters (Bot API 10.3+). */
  ephemeral_message_parameters?: EphemeralMessageParameters;
}


export interface CreateNewStickerSetOptions {
  /** User identifier of created sticker set owner. */
  user_id: number;
  /** Short name of sticker set, to be used in t.me/addstickers/ URLs. */
  name: string;
  /** Sticker set title, 1-64 characters. */
  title: string;
  /** A list of 1-50 initial stickers to be added to the sticker set. */
  stickers: InputSticker[];
  /** Type of stickers in the set, pass "regular", "mask", or "custom_emoji". By default, a regular sticker set is created. */
  sticker_type?: "regular" | "mask" | "custom_emoji";
  /** Pass True if stickers in the sticker set must be repainted to the color of text when used in messages. For "custom_emoji" only. */
  needs_repainting?: boolean;
}

export interface AddStickerToSetOptions {
  /** User identifier of sticker set owner. */
  user_id: number;
  /** Sticker set name. */
  name: string;
  /** A object with information about the added sticker. */
  sticker: InputSticker;
}

export interface ReplaceStickerInSetOptions {
  /** User identifier of the sticker set owner. */
  user_id: number;
  /** Sticker set name. */
  name: string;
  /** File identifier of the replaced sticker. */
  old_sticker: string;
  /** A object with information about the added sticker. */
  sticker: InputSticker;
}
