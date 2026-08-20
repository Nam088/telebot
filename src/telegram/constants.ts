/**
 * Telegram Bot API Constants and Enums.
 *
 * Provides strongly-typed constant objects mirroring `python-telegram-bot`'s `telegram.constants`.
 *
 * @packageDocumentation
 */

/**
 * Message formatting parse modes supported by Telegram.
 *
 * @example
 * ```ts
 * import { ParseMode } from "telegram-bot-node";
 *
 * await bot.sendMessage({
 *   chat_id: 123456,
 *   text: "*Hello World*",
 *   parse_mode: ParseMode.MARKDOWN_V2,
 * });
 * ```
 */
export const ParseMode = {
  /** Markdown style parsing */
  MARKDOWN: "Markdown",
  /** MarkdownV2 style parsing */
  MARKDOWN_V2: "MarkdownV2",
  /** HTML style parsing */
  HTML: "HTML",
} as const;

export type ParseMode = (typeof ParseMode)[keyof typeof ParseMode];

/**
 * Chat types supported by Telegram Bot API.
 */
export const ChatType = {
  /** Private one-on-one chat with a user */
  PRIVATE: "private",
  /** Basic Telegram group chat */
  GROUP: "group",
  /** Supergroup with advanced management */
  SUPERGROUP: "supergroup",
  /** Telegram channel */
  CHANNEL: "channel",
  /** Chat of a sender in a channel/group */
  SENDER: "sender",
} as const;

export type ChatType = (typeof ChatType)[keyof typeof ChatType];

/**
 * Status actions to broadcast to chat members while performing work.
 *
 * @example
 * ```ts
 * import { ChatAction } from "telegram-bot-node";
 *
 * await bot.sendChatAction({
 *   chat_id: 123456,
 *   action: ChatAction.TYPING,
 * });
 * ```
 */
export const ChatAction = {
  /** Typing a text message */
  TYPING: "typing",
  /** Uploading a photo */
  UPLOAD_PHOTO: "upload_photo",
  /** Recording a video */
  RECORD_VIDEO: "record_video",
  /** Uploading a video */
  UPLOAD_VIDEO: "upload_video",
  /** Recording an audio/voice note */
  RECORD_VOICE: "record_voice",
  /** Uploading an audio/voice note */
  UPLOAD_VOICE: "upload_voice",
  /** Uploading a general document/file */
  UPLOAD_DOCUMENT: "upload_document",
  /** Choosing a sticker */
  CHOOSE_STICKER: "choose_sticker",
  /** Finding location data */
  FIND_LOCATION: "find_location",
  /** Recording a round video note */
  RECORD_VIDEO_NOTE: "record_video_note",
  /** Uploading a round video note */
  UPLOAD_VIDEO_NOTE: "upload_video_note",
} as const;

export type ChatAction = (typeof ChatAction)[keyof typeof ChatAction];

/**
 * Status types for chat members.
 */
export const ChatMemberStatus = {
  /** Chat creator/owner */
  CREATOR: "creator",
  /** Administrator of the chat */
  ADMINISTRATOR: "administrator",
  /** Standard member */
  MEMBER: "member",
  /** Restricted member with limited permissions */
  RESTRICTED: "restricted",
  /** User has left the chat */
  LEFT: "left",
  /** User has been kicked/banned from the chat */
  KICKED: "kicked",
} as const;

export type ChatMemberStatus = (typeof ChatMemberStatus)[keyof typeof ChatMemberStatus];

/**
 * Entity types in formatted message text.
 */
export const MessageEntityType = {
  MENTION: "mention",
  HASHTAG: "hashtag",
  CASHTAG: "cashtag",
  BOT_COMMAND: "bot_command",
  URL: "url",
  EMAIL: "email",
  PHONE_NUMBER: "phone_number",
  BOLD: "bold",
  ITALIC: "italic",
  UNDERLINE: "underline",
  STRIKETHROUGH: "strikethrough",
  SPOILER: "spoiler",
  BLOCKQUOTE: "blockquote",
  EXPANDABLE_BLOCKQUOTE: "expandable_blockquote",
  CODE: "code",
  PRE: "pre",
  TEXT_LINK: "text_link",
  TEXT_MENTION: "text_mention",
  CUSTOM_EMOJI: "custom_emoji",
} as const;

export type MessageEntityType = (typeof MessageEntityType)[keyof typeof MessageEntityType];

/**
 * Types of Polls.
 */
export const PollType = {
  REGULAR: "regular",
  QUIZ: "quiz",
} as const;

export type PollType = (typeof PollType)[keyof typeof PollType];

/**
 * Dice emojis supported by `sendDice`.
 */
export const DiceEmoji = {
  DICE: "🎲",
  DART: "🎯",
  BASKETBALL: "🏀",
  FOOTBALL: "⚽",
  SLOT_MACHINE: "🎰",
  BOWLING: "🎳",
} as const;

export type DiceEmoji = (typeof DiceEmoji)[keyof typeof DiceEmoji];

/**
 * Types of updates that can be delivered by Telegram.
 */
export const UpdateType = {
  MESSAGE: "message",
  EDITED_MESSAGE: "edited_message",
  CHANNEL_POST: "channel_post",
  EDITED_CHANNEL_POST: "edited_channel_post",
  BUSINESS_CONNECTION: "business_connection",
  BUSINESS_MESSAGE: "business_message",
  EDITED_BUSINESS_MESSAGE: "edited_business_message",
  DELETED_BUSINESS_MESSAGES: "deleted_business_messages",
  MESSAGE_REACTION: "message_reaction",
  MESSAGE_REACTION_COUNT: "message_reaction_count",
  INLINE_QUERY: "inline_query",
  CHOSEN_INLINE_RESULT: "chosen_inline_result",
  CALLBACK_QUERY: "callback_query",
  SHIPPING_QUERY: "shipping_query",
  PRE_CHECKOUT_QUERY: "pre_checkout_query",
  POLL: "poll",
  POLL_ANSWER: "poll_answer",
  MY_CHAT_MEMBER: "my_chat_member",
  CHAT_MEMBER: "chat_member",
  CHAT_JOIN_REQUEST: "chat_join_request",
  CHAT_BOOST: "chat_boost",
  REMOVED_CHAT_BOOST: "removed_chat_boost",
} as const;

export type UpdateType = (typeof UpdateType)[keyof typeof UpdateType];
