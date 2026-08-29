import type { InputFile } from "../../../utils/http.js";
import type {
  ReplyMarkup,
  EphemeralMessageParameters,
  ReplyParameters,
} from "../messages/index.js";
import type { InputSticker } from "./models.js";

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
