import type { ParseMode } from "../../constants.js";
import type { MessageEntity } from "./core.js";
import type { InlineKeyboardMarkup } from "./keyboards.js";
import type { InputMedia } from "./media.js";
import type { InputRichMessage } from "../rich/index.js";
import type { InlineQueryResult } from "../business/index.js";

export interface EditMessageTextOptions {
  /** New text of the message, 1-4096 characters after entities parsing. */
  text: string;
  /** Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel. */
  chat_id?: number | string;
  /** Required if inline_message_id is not specified. Identifier of the message to edit. */
  message_id?: number;
  /** Required if chat_id and message_id are not specified. Identifier of the inline message. */
  inline_message_id?: string;
  /** Mode for parsing entities in the message text. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in message text. */
  entities?: MessageEntity[];
  /** Link preview generation options for the message. */
  link_preview_options?: unknown;
  /** A JSON-serialized object for an inline keyboard. */
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditMessageCaptionOptions {
  /** Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel. */
  chat_id?: number | string;
  /** Required if inline_message_id is not specified. Identifier of the message to edit. */
  message_id?: number;
  /** Required if chat_id and message_id are not specified. Identifier of the inline message. */
  inline_message_id?: string;
  /** New caption of the message, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the message caption. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True, if the caption must be shown above the message media. Supported only for animation, audio and video messages. */
  show_caption_above_media?: boolean;
  /** A JSON-serialized object for an inline keyboard. */
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditMessageReplyMarkupOptions {
  /** Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel. */
  chat_id?: number | string;
  /** Required if inline_message_id is not specified. Identifier of the message to edit. */
  message_id?: number;
  /** Required if chat_id and message_id are not specified. Identifier of the inline message. */
  inline_message_id?: string;
  /** A JSON-serialized object for an inline keyboard. */
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditMessageMediaOptions {
  /** The new media content of the message. */
  media: InputMedia;
  /** Unique identifier for the target chat or username of the target channel. Required if inline_message_id is not specified. */
  chat_id?: number | string;
  /** Identifier of the message to edit. Required if inline_message_id is not specified. */
  message_id?: number;
  /** Identifier of the inline message. Required if chat_id and message_id are not specified. */
  inline_message_id?: string;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier of the business connection on behalf of which the message was sent. */
  business_connection_id?: string;
}

export interface EditMessageLiveLocationOptions {
  /** Latitude of new location. */
  latitude: number;
  /** Longitude of new location. */
  longitude: number;
  /** Unique identifier for the target chat or username of the target channel. Required if inline_message_id is not specified. */
  chat_id?: number | string;
  /** Identifier of the message to edit. Required if inline_message_id is not specified. */
  message_id?: number;
  /** Identifier of the inline message. Required if chat_id and message_id are not specified. */
  inline_message_id?: string;
  /** Radius of uncertainty for the location, measured in meters; 0-1500. */
  horizontal_accuracy?: number;
  /** Direction in which the user is moving, in degrees; 1-360. */
  heading?: number;
  /** Maximum distance for proximity alerts about approaching another chat member, in meters; 1-100000. */
  proximity_alert_radius?: number;
  /** New period in seconds during which the location can be updated, starting from the message send date. */
  live_period?: number;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier of the business connection on behalf of which the message was sent. */
  business_connection_id?: string;
}

export interface StopMessageLiveLocationOptions {
  /** Unique identifier for the target chat or username of the target channel. Required if inline_message_id is not specified. */
  chat_id?: number | string;
  /** Identifier of the message with live location to stop. Required if inline_message_id is not specified. */
  message_id?: number;
  /** Identifier of the inline message. Required if chat_id and message_id are not specified. */
  inline_message_id?: string;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier of the business connection on behalf of which the message was sent. */
  business_connection_id?: string;
}

export interface StopPollOptions {
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier of the business connection on behalf of which the message was sent. */
  business_connection_id?: string;
}

export interface EditEphemeralMessageTextOptions {
  /** Unique identifier for the target chat or username of the target supergroup. */
  chat_id: number | string;
  /** Identifier of the user who received the message. */
  receiver_user_id: number;
  /** Identifier of the ephemeral message to edit. */
  ephemeral_message_id: number;
  /** New text of the message, 1-4096 characters after entity parsing; required if rich_message isn't specified. */
  text?: string;
  /** Mode for parsing entities in the message text. */
  parse_mode?: ParseMode | string;
  /** A list of special entities that appear in message text. */
  entities?: MessageEntity[];
  /** New rich content of the message; required if text isn't specified (Bot API 10.3+). */
  rich_message?: InputRichMessage;
  /** Link preview generation options for the message. */
  link_preview_options?: unknown;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditEphemeralMessageMediaOptions {
  /** Unique identifier for the target chat or username of the target supergroup. */
  chat_id: number | string;
  /** Identifier of the user who received the message. */
  receiver_user_id: number;
  /** Identifier of the ephemeral message to edit. */
  ephemeral_message_id: number;
  /** A JSON-serialized object for the new media content of the message. */
  media: InputMedia;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditEphemeralMessageCaptionOptions {
  /** Unique identifier for the target chat or username of the target supergroup. */
  chat_id: number | string;
  /** Identifier of the user who received the message. */
  receiver_user_id: number;
  /** Identifier of the ephemeral message to edit. */
  ephemeral_message_id: number;
  /** New caption of the message, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the message caption. */
  parse_mode?: ParseMode | string;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True if the caption must be shown above the message media (Bot API 10.3+). */
  show_caption_above_media?: boolean;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
}

export interface EditEphemeralMessageReplyMarkupOptions {
  /** Unique identifier for the target chat or username of the target supergroup. */
  chat_id: number | string;
  /** Identifier of the user who received the message. */
  receiver_user_id: number;
  /** Identifier of the ephemeral message to edit. */
  ephemeral_message_id: number;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
}

export interface DeleteEphemeralMessageOptions {
  /** Unique identifier for the target chat or username of the target supergroup. */
  chat_id: number | string;
  /** Identifier of the user who received the message. */
  receiver_user_id: number;
  /** Identifier of the ephemeral message to delete. */
  ephemeral_message_id: number;
}

export interface MessageId {
  /** Unique message identifier. */
  message_id: number;
}

export interface ForwardMessagesOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Unique identifier for the chat where the original messages were sent. */
  from_chat_id: number | string;
  /** Identifiers of 1-100 messages in the chat from_chat_id to forward. */
  message_ids: number[];
  /** Sends the messages silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Protects the contents of the forwarded messages from forwarding and saving. */
  protect_content?: boolean;
}

export interface CopyMessagesOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Unique identifier for the chat where the original messages were sent. */
  from_chat_id: number | string;
  /** Identifiers of 1-100 messages in the chat from_chat_id to copy. */
  message_ids: number[];
  /** Sends the messages silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Protects the contents of the sent messages from forwarding and saving. */
  protect_content?: boolean;
  /** Pass True to copy the messages without their captions. */
  remove_caption?: boolean;
}

export interface PreparedInlineMessage {
  /** Unique identifier of the prepared message. */
  id: string;
  /** Expiration date of the prepared message, in Unix time. Expired prepared messages can no longer be used. */
  expiration_date: number;
}

export interface SavePreparedInlineMessageOptions {
  /** Unique identifier of the target user that can use the prepared message. */
  user_id: number;
  /** An object describing the message to be sent. */
  result: InlineQueryResult;
  /** Pass True if the message can be sent to private chats with users. */
  allow_user_chats?: boolean;
  /** Pass True if the message can be sent to private chats with bots. */
  allow_bot_chats?: boolean;
  /** Pass True if the message can be sent to group and supergroup chats. */
  allow_group_chats?: boolean;
  /** Pass True if the message can be sent to channel chats. */
  allow_channel_chats?: boolean;
}
