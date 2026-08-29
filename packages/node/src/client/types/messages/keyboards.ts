import type { CallbackGame } from "../business/index.js";

/**
 * Represents a disabled button which does nothing (Bot API 10.3+).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DisabledButton {}

/**
 * Describes a Web App that can be launched from a button.
 */
export interface WebAppInfo {
  /** An HTTPS URL of a Web App to be opened. */
  url: string;
}

/**
 * Parameter of the inline keyboard button used to automatically authorize a user.
 */
export interface LoginUrl {
  /** An HTTPS URL used to automatically authorize the user. */
  url: string;
  /** New text of the button in forwarded messages. */
  forward_text?: string;
  /** Username of a bot, which will be used for user authorization. */
  bot_username?: string;
  /** Pass True to request the permission for your bot to send messages to the user. */
  request_write_access?: boolean;
}

/**
 * Represents an inline button that switches the current user to inline mode in a chosen chat.
 */
export interface SwitchInlineQueryChosenChat {
  /** The default inline query to be inserted in the input field. */
  query?: string;
  /** True, if private chats with users can be chosen. */
  allow_user_chats?: boolean;
  /** True, if private chats with bots can be chosen. */
  allow_bot_chats?: boolean;
  /** True, if group and supergroup chats can be chosen. */
  allow_group_chats?: boolean;
  /** True, if channel chats can be chosen. */
  allow_channel_chats?: boolean;
}

/**
 * Represents an inline keyboard button that copies specified text to the clipboard.
 */
export interface CopyTextButton {
  /** The text to be copied to the clipboard; 1-256 characters. */
  text: string;
}

/**
 * Represents one button of an inline keyboard.
 */
export interface InlineKeyboardButton {
  /** Label text on the button. */
  text: string;
  /** Unique identifier of the custom emoji shown before the text of the button. */
  icon_custom_emoji_id?: string;
  /** Style of the button ('danger', 'success', 'primary'). */
  style?: "danger" | "success" | "primary" | string;
  /** HTTP or tg:// URL to be opened when the button is pressed. */
  url?: string;
  /** Data to be sent in a callback query to the bot when the button is pressed (1-64 bytes). */
  callback_data?: string;
  /** Description of the Web App that will be launched when the user presses the button. */
  web_app?: WebAppInfo;
  /** An HTTPS URL used to automatically authorize the user. */
  login_url?: LoginUrl;
  /** If set, pressing the button will prompt the user to select one of their chats and insert the bot's username and the specified inline query. */
  switch_inline_query?: string;
  /** If set, pressing the button will insert the bot's username and the specified inline query in the current chat's input field. */
  switch_inline_query_current_chat?: string;
  /** If set, pressing the button will prompt the user to select one of their chats of the specified type. */
  switch_inline_query_chosen_chat?: SwitchInlineQueryChosenChat;
  /** Description of the button that copies the specified text to the clipboard. */
  copy_text?: CopyTextButton;
  /** Description of the game that will be launched when the user presses the button. */
  callback_game?: CallbackGame;
  /** Specify True, to send a Pay button. */
  pay?: boolean;
  /** If set, then the button is disabled and does nothing (Bot API 10.3+). */
  disabled?: DisabledButton;
}

/**
 * Represents an inline keyboard that appears right next to the message it belongs to.
 */
export interface InlineKeyboardMarkup {
  /** Array of button rows, each represented by an Array of InlineKeyboardButton objects. */
  inline_keyboard: InlineKeyboardButton[][];
  /** Pass True if the reply interface must be shown to the user (Bot API 10.3+). */
  force_reply?: boolean;
}

/**
 * Represents type of poll that can be created with a keyboard button.
 */
export interface KeyboardButtonPollType {
  /** If quiz is passed, the user can only create a poll in quiz mode. */
  type?: string;
}

/**
 * Defines the criteria used to request suitable users.
 */
export interface KeyboardButtonRequestUsers {
  /** Signed 32-bit identifier of the request that will be received back in the UserShared object. */
  request_id: number;
  /** Pass True to request bots, pass False to request regular users. */
  user_is_bot?: boolean;
  /** Pass True to request premium users, pass False to request non-premium users. */
  user_is_premium?: boolean;
  /** The maximum number of users to be selected; 1-10. Defaults to 1. */
  max_quantity?: number;
  /** Pass True to request the users' first and last name. */
  request_name?: boolean;
  /** Pass True to request the users' username. */
  request_username?: boolean;
  /** Pass True to request the users' photo. */
  request_photo?: boolean;
}

/**
 * Defines the criteria used to request a suitable chat.
 */
export interface KeyboardButtonRequestChat {
  /** Signed 32-bit identifier of the request that will be received back in the ChatShared object. */
  request_id: number;
  /** Pass True to request a channel chat, pass False to request a group or a supergroup chat. */
  chat_is_channel: boolean;
  /** Pass True to request a forum supergroup, pass False to request a non-forum chat. */
  chat_is_forum?: boolean;
  /** Pass True to request a supergroup or a channel with a username, pass False to request a chat without a username. */
  chat_has_username?: boolean;
  /** Pass True to request a chat owned by the user. */
  chat_is_created?: boolean;
  /** A JSON-serialized object listing the required administrator rights of the user in the chat. */
  user_administrator_rights?: unknown;
  /** A JSON-serialized object listing the required administrator rights of the bot in the chat. */
  bot_administrator_rights?: unknown;
  /** Pass True to request a chat with the bot as a member. */
  bot_is_member?: boolean;
  /** Pass True to request the chat's title. */
  request_title?: boolean;
  /** Pass True to request the chat's username. */
  request_username?: boolean;
  /** Pass True to request the chat's photo. */
  request_photo?: boolean;
}

/**
 * Represents one button of the reply keyboard.
 */
export interface KeyboardButton {
  /** Text of the button. If none of the optional fields are used, it will be sent as a message when the button is pressed. */
  text: string;
  /** If specified, pressing the button will open a list of suitable users. */
  request_users?: KeyboardButtonRequestUsers | unknown;
  /** If specified, pressing the button will open a list of suitable chats. */
  request_chat?: KeyboardButtonRequestChat | unknown;
  /** If True, the user's phone number will be sent as a contact when the button is pressed. Available in private chats only. */
  request_contact?: boolean;
  /** If True, the user's current location will be sent when the button is pressed. Available in private chats only. */
  request_location?: boolean;
  /** If specified, the user will be asked to create a poll and send it to the bot. Available in private chats only. */
  request_poll?: KeyboardButtonPollType;
  /** If specified, the described Web App will be launched when the button is pressed. */
  web_app?: WebAppInfo;
}

/**
 * Represents a custom keyboard with reply options.
 */
export interface ReplyKeyboardMarkup {
  /** Array of button rows, each represented by an Array of KeyboardButton objects. */
  keyboard: KeyboardButton[][];
  /** Requests clients to always show the keyboard when the regular keyboard is hidden. Defaults to false. */
  is_persistent?: boolean;
  /** Requests clients to resize the keyboard vertically for optimal fit. Defaults to false. */
  resize_keyboard?: boolean;
  /** Requests clients to hide the keyboard as soon as it's been used. Defaults to false. */
  one_time_keyboard?: boolean;
  /** The placeholder to be shown in the input field when the keyboard is active; 1-64 characters. */
  input_field_placeholder?: string;
  /** Use this parameter if you want to show the keyboard to specific users only. */
  selective?: boolean;
  /** Pass True if the reply interface must be shown to the user (Bot API 10.3+). */
  force_reply?: boolean;
}

/**
 * Requests clients to remove the custom keyboard.
 */
export interface ReplyKeyboardRemove {
  /** Requests clients to remove the custom keyboard. */
  remove_keyboard: true;
  /** Use this parameter if you want to remove the keyboard for specific users only. */
  selective?: boolean;
}

/**
 * Shows reply interface to the user, as if they had selected the bot's message and tapped 'Reply'.
 */
export interface ForceReply {
  /** Shows reply interface to the user, as if they had selected the bot's message and tapped 'Reply'. */
  force_reply: true;
  /** The placeholder to be shown in the input field when the reply is active; 1-64 characters. */
  input_field_placeholder?: string;
  /** Use this parameter if you want to force reply from specific users only. */
  selective?: boolean;
}

/**
 * Union of all supported reply markup types.
 */
export type ReplyMarkup =
  InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
