import type { MessageEntityType } from "../../constants.js";
import type { User } from "../common/index.js";

/**
 * @see {@link https://core.telegram.org/bots/api#messageentity Telegram Bot API: MessageEntity}
 */
export interface MessageEntity {
  /** Type of the entity (e.g. 'mention', 'hashtag', 'bot_command', 'url', 'bold', 'italic', etc.). */
  type: MessageEntityType;
  /** Offset in UTF-16 code units to the start of the entity. */
  offset: number;
  /** Length of the entity in UTF-16 code units. */
  length: number;
  /** For 'text_link' only, URL that will be opened after user taps on the text. */
  url?: string;
  /** For 'text_mention' only, the mentioned user. */
  user?: User;
  /** For 'pre' only, the programming language of the entity text. */
  language?: string;
  /** For 'custom_emoji' only, unique identifier of the custom emoji. */
  custom_emoji_id?: string;
  /** For 'date_time' only, the Unix time associated with the entity. */
  unix_time?: number;
  /** For 'date_time' only, the string that defines the formatting of the date and time. */
  date_time_format?: string;
}
