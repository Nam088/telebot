/**
 * @see {@link https://core.telegram.org/bots/api#botname Telegram Bot API: BotName}
 */
export interface BotName {
  /** The bot's name. */
  name: string;
}

/**
 * @see {@link https://core.telegram.org/bots/api#botdescription Telegram Bot API: BotDescription}
 */
export interface BotDescription {
  /** The bot's description. */
  description: string;
}

/**
 * @see {@link https://core.telegram.org/bots/api#botshortdescription Telegram Bot API: BotShortDescription}
 */
export interface BotShortDescription {
  /** The bot's short description. */
  short_description: string;
}

/**
 * @see {@link https://core.telegram.org/bots/api#forumtopic Telegram Bot API: ForumTopic}
 */
export interface ForumTopic {
  /** Unique identifier of the forum topic. */
  message_thread_id: number;
  /** Name of the topic. */
  name: string;
  /** Color of the topic icon in RGB format. */
  icon_color: number;
  /** Unique identifier of the custom emoji shown as the topic icon. */
  icon_custom_emoji_id?: string;
}

/**
 * @see {@link https://core.telegram.org/bots/api#botcommand Telegram Bot API: BotCommand}
 */
export interface BotCommand {
  /** Text of the command; 1-32 characters. Can contain only lowercase English letters, digits and underscores. */
  command: string;
  /** Description of the command; 1-256 characters. */
  description: string;
}

export type MenuButton =
  | { type: "default" }
  | { type: "commands" }
  | { type: "web_app"; text: string; web_app: { url: string } };

export type BotCommandScope =
  | { type: "default" }
  | { type: "all_private_chats" }
  | { type: "all_group_chats" }
  | { type: "all_chat_administrators" }
  | { type: "chat"; chat_id: number | string }
  | { type: "chat_administrators"; chat_id: number | string }
  | { type: "chat_member"; chat_id: number | string; user_id: number };
