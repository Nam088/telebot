import type { PhotoSize } from "./media.js";

/**
 * Contains information about a user that was shared with the bot using a
 * {@link https://core.telegram.org/bots/api#keyboardbuttonrequestusers | KeyboardButtonRequestUsers} button.
 *
 * @see {@link https://core.telegram.org/bots/api#shareduser Telegram Bot API: SharedUser}
 */
export interface SharedUser {
  /**
   * Identifier of the shared user.
   *
   * @remarks
   * This number may have more than 32 significant bits and some programming languages may have
   * difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so 64-bit
   * integers or double-precision float types are safe for storing this identifier. The bot may not have
   * access to the user and could be unable to use this identifier, unless the user is already known to
   * the bot by some other means.
   */
  user_id: number;
  /** First name of the user, if the name was requested by the bot. */
  first_name?: string;
  /** Last name of the user, if the name was requested by the bot. */
  last_name?: string;
  /** Username of the user, if the username was requested by the bot. */
  username?: string;
  /** Available sizes of the chat photo, if the photo was requested by the bot. */
  photo?: PhotoSize[];
}

/**
 * This object contains information about the users whose identifiers were shared with the bot
 * using a {@link https://core.telegram.org/bots/api#keyboardbuttonrequestusers | KeyboardButtonRequestUsers} button.
 *
 * @see {@link https://core.telegram.org/bots/api#usersshared Telegram Bot API: UsersShared}
 */
export interface UsersShared {
  /** Identifier of the request. */
  request_id: number;
  /** Information about users shared with the bot. */
  users: SharedUser[];
}

/**
 * This object contains information about a chat that was shared with the bot using a
 * {@link https://core.telegram.org/bots/api#keyboardbuttonrequestchat | KeyboardButtonRequestChat} button.
 *
 * @see {@link https://core.telegram.org/bots/api#chatshared Telegram Bot API: ChatShared}
 */
export interface ChatShared {
  /** Identifier of the request. */
  request_id: number;
  /**
   * Identifier of the shared chat.
   *
   * @remarks
   * This number may have more than 32 significant bits and some programming languages may have
   * difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit
   * integer or double-precision float type are safe for storing this identifier. The bot may not have
   * access to the chat and could be unable to use this identifier, unless the chat is already known to
   * the bot by some other means.
   */
  chat_id: number;
  /** Title of the chat, if the title was requested by the bot. */
  title?: string;
  /** Username of the chat, if the username was requested by the bot and available. */
  username?: string;
  /** Available sizes of the chat photo, if the photo was requested by the bot. */
  photo?: PhotoSize[];
}
