import type { ParseMode } from "../../constants.js";
import type { User, Chat, Location } from "../common/index.js";
import type { Story, Game } from "../business/index.js";
import type { Sticker } from "../stickers/index.js";
import type { PhotoSize, Audio, Document, Video, Animation, Voice, VideoNote } from "./media.js";
import type { MessageEntity, Contact, Dice, Poll, Venue } from "./core.js";

/**
 * @see {@link https://core.telegram.org/bots/api#messageoriginuser Telegram Bot API: MessageOriginUser}
 */
export interface MessageOriginUser {
  /** Type of the message origin, always 'user'. */
  type: "user";
  /** Date the message was sent originally in Unix time. */
  date: number;
  /** User that sent the message originally. */
  sender_user: User;
}

/**
 * @see {@link https://core.telegram.org/bots/api#messageoriginhiddenuser Telegram Bot API: MessageOriginHiddenUser}
 */
export interface MessageOriginHiddenUser {
  /** Type of the message origin, always 'hidden_user'. */
  type: "hidden_user";
  /** Date the message was sent originally in Unix time. */
  date: number;
  /** Name of the user that sent the message originally. */
  sender_user_name: string;
}

/**
 * @see {@link https://core.telegram.org/bots/api#messageoriginchat Telegram Bot API: MessageOriginChat}
 */
export interface MessageOriginChat {
  /** Type of the message origin, always 'chat'. */
  type: "chat";
  /** Date the message was sent originally in Unix time. */
  date: number;
  /** Chat that sent the message originally. */
  sender_chat: Chat;
  /** For messages originally sent by an anonymous chat administrator, original message author signature. */
  author_signature?: string;
}

/**
 * @see {@link https://core.telegram.org/bots/api#messageoriginchannel Telegram Bot API: MessageOriginChannel}
 */
export interface MessageOriginChannel {
  /** Type of the message origin, always 'channel'. */
  type: "channel";
  /** Date the message was sent originally in Unix time. */
  date: number;
  /** Channel chat to which the message was originally sent. */
  chat: Chat;
  /** Identifier of the original message in the channel. */
  message_id: number;
  /** Signature of the original post author if present. */
  author_signature?: string;
}

export type MessageOrigin =
  MessageOriginUser | MessageOriginHiddenUser | MessageOriginChat | MessageOriginChannel;

/**
 * @see {@link https://core.telegram.org/bots/api#externalreplyinfo Telegram Bot API: ExternalReplyInfo}
 */
export interface ExternalReplyInfo {
  /** Origin of the message replied to. */
  origin: MessageOrigin;
  /** Chat the original message belongs to. */
  chat?: Chat;
  /** Unique message identifier inside the original chat. */
  message_id?: number;
  /** Options used for link preview generation for the original message. */
  link_preview_options?: unknown;
  /** Message is an animation, information about the animation. */
  animation?: Animation;
  /** Message is an audio file, information about the file. */
  audio?: Audio;
  /** Message is a general file, information about the file. */
  document?: Document;
  /** Message is a photo, available sizes of the photo. */
  photo?: PhotoSize[];
  /** Message is a sticker, information about the sticker. */
  sticker?: Sticker;
  /** Message is a forwarded story, information about the story. */
  story?: Story;
  /** Message is a video, information about the video. */
  video?: Video;
  /** Message is a video note, information about the video message. */
  video_note?: VideoNote;
  /** Message is a voice message, information about the file. */
  voice?: Voice;
  /** True, if the message media is covered by a spoiler animation. */
  has_media_spoiler?: boolean;
  /** Message is a shared contact, information about the contact. */
  contact?: Contact;
  /** Message is a dice with random value. */
  dice?: Dice;
  /** Message is a game, information about the game. */
  game?: Game;
  /** Message is a scheduled giveaway, information about the giveaway. */
  giveaway?: unknown;
  /** A giveaway with public winners was completed. */
  giveaway_winners?: unknown;
  /** Message is an invoice for a payment, information about the invoice. */
  invoice?: unknown;
  /** Message is a shared location, information about the location. */
  location?: Location;
  /** Message is a native poll, information about the poll. */
  poll?: Poll;
  /** Message is a venue, information about the venue. */
  venue?: Venue;
}

/**
 * @see {@link https://core.telegram.org/bots/api#textquote Telegram Bot API: TextQuote}
 */
export interface TextQuote {
  /** Text of the quoted part of a message that is replied to. */
  text: string;
  /** Special entities that appear in the quote. */
  entities?: MessageEntity[];
  /** Approximate quote position in the original message in UTF-16 code units. */
  position: number;
  /** True, if the quote was chosen manually by the message sender. */
  is_manual?: boolean;
}

/**
 * Parameters for sending or replying with ephemeral messages (Bot API 10.3+).
 *
 * @see {@link https://core.telegram.org/bots/api#ephemeralmessageparameters Telegram Bot API: EphemeralMessageParameters}
 */
export interface EphemeralMessageParameters {
  /** Identifier of the user who will receive the message. */
  receiver_user_id: number;
  /** Identifier of the callback query which triggered the message, if any. */
  callback_query_id?: string;
  /** Pass True if the ephemeral message must be shown in place of the original message. */
  replace_callback_query_message?: boolean;
}

/**
 * Describes reply parameters for a message to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#replyparameters Telegram Bot API: ReplyParameters}
 */
export interface ReplyParameters {
  /** Identifier of the message that will be replied to in the current chat, or in the chat chat_id if it is specified. */
  message_id?: number;
  /** If the message to be replied to is from a different chat, unique identifier for the chat. */
  chat_id?: number | string;
  /** Pass True if the message should be sent even if the specified replied-to message is not found. */
  allow_sending_without_reply?: boolean;
  /** Quoted part of the message to be replied to; 0-1024 characters after entities parsing. */
  quote?: string;
  /** Mode for parsing entities in the quote. */
  quote_parse_mode?: ParseMode | string;
  /** A list of special entities that appear in the quote. */
  quote_entities?: MessageEntity[];
  /** Position of the quote in the original message in UTF-16 code units. */
  quote_position?: number;
  /** Identifier of the specific checklist task to be replied to. */
  checklist_task_id?: number;
  /** Persistent identifier of the specific poll option to be replied to. */
  poll_option_id?: string;
  /** Identifier of the ephemeral message that will be replied to (Bot API 10.2+). */
  ephemeral_message_id?: number;
}
