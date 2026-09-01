import type { WebAppInfo } from "../messages/index.js";

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
  /** True, if the name of the topic wasn't specified explicitly by its creator and likely needs to be changed by the bot. */
  is_name_implicit?: boolean;
}

/**
 * @see {@link https://core.telegram.org/bots/api#botcommand Telegram Bot API: BotCommand}
 */
export interface BotCommand {
  /** Text of the command; 1-32 characters. Can contain only lowercase English letters, digits and underscores. */
  command: string;
  /** Description of the command; 1-256 characters. */
  description: string;
  /** True, if the command sends an ephemeral message, which can be seen only by the sender of the message and the bot. */
  is_ephemeral?: boolean;
}

/**
 * Describes that no specific value for the menu button is set.
 *
 * @see {@link https://core.telegram.org/bots/api#menubuttondefault Telegram Bot API: MenuButtonDefault}
 */
export interface MenuButtonDefault {
  /** Type of the button, must be 'default'. */
  type: "default";
}

/**
 * Represents a menu button, which opens the bot's list of commands.
 *
 * @see {@link https://core.telegram.org/bots/api#menubuttoncommands Telegram Bot API: MenuButtonCommands}
 */
export interface MenuButtonCommands {
  /** Type of the button, must be 'commands'. */
  type: "commands";
}

/**
 * Represents a menu button, which launches a Web App.
 *
 * @see {@link https://core.telegram.org/bots/api#menubuttonwebapp Telegram Bot API: MenuButtonWebApp}
 */
export interface MenuButtonWebApp {
  /** Type of the button, must be 'web_app'. */
  type: "web_app";
  /** Text on the button. */
  text: string;
  /** Description of the Web App that will be launched when the user presses the button. */
  web_app: WebAppInfo;
}

/**
 * This object describes the bot's menu button in a private chat.
 *
 * @see {@link https://core.telegram.org/bots/api#menubutton Telegram Bot API: MenuButton}
 */
export type MenuButton = MenuButtonCommands | MenuButtonWebApp | MenuButtonDefault;

/**
 * This object represents the scope to which bot commands are applied.
 *
 * @see {@link https://core.telegram.org/bots/api#botcommandscope Telegram Bot API: BotCommandScope}
 */
export type BotCommandScope =
  | { type: "default" }
  | { type: "all_private_chats" }
  | { type: "all_group_chats" }
  | { type: "all_chat_administrators" }
  | { type: "chat"; chat_id: number | string }
  | { type: "chat_administrators"; chat_id: number | string }
  | { type: "chat_member"; chat_id: number | string; user_id: number };
