import type { User } from "../common/index.js";

/**
 * Describes data sent from a Web App to the bot.
 *
 * @see {@link https://core.telegram.org/bots/api#webappdata Telegram Bot API: WebAppData}
 */
export interface WebAppData {
  /** The data. Be aware that a bad client can send arbitrary data in this field. */
  data: string;
  /** Text of the web_app keyboard button from which the Web App was opened. Be aware that a bad client can send arbitrary data in this field. */
  button_text: string;
}

/**
 * Describes a service message about a user allowing a bot to write messages after adding it to the
 * attachment menu, launching a Web App from a link, or accepting an explicit request from a Web App sent by
 * the method requestWriteAccess.
 *
 * @see {@link https://core.telegram.org/bots/api#writeaccessallowed Telegram Bot API: WriteAccessAllowed}
 */
export interface WriteAccessAllowed {
  /** True, if the access was granted after the user accepted an explicit request from a Web App sent by the method requestWriteAccess. */
  from_request?: boolean;
  /** Name of the Web App, if the access was granted when the Web App was launched from a link. */
  web_app_name?: string;
  /** True, if the access was granted when the bot was added to the attachment or side menu. */
  from_attachment_menu?: boolean;
}

/**
 * Represents the content of a service message, sent whenever a user in the chat triggers a proximity alert
 * set by another user.
 *
 * @see {@link https://core.telegram.org/bots/api#proximityalerttriggered Telegram Bot API: ProximityAlertTriggered}
 */
export interface ProximityAlertTriggered {
  /** User that triggered the alert. */
  traveler: User;
  /** User that set the alert. */
  watcher: User;
  /** The distance between the users. */
  distance: number;
}

/**
 * Represents a service message about a change in auto-delete timer settings.
 *
 * @see {@link https://core.telegram.org/bots/api#messageautodeletetimerchanged Telegram Bot API: MessageAutoDeleteTimerChanged}
 */
export interface MessageAutoDeleteTimerChanged {
  /** New auto-delete time for messages in the chat; in seconds. */
  message_auto_delete_time: number;
}

/**
 * Describes a service message about an ownership change in the chat.
 *
 * @see {@link https://core.telegram.org/bots/api#chatownerchanged Telegram Bot API: ChatOwnerChanged}
 */
export interface ChatOwnerChanged {
  /** The new owner of the chat. */
  new_owner: User;
}

/**
 * Describes a service message about the chat owner leaving the chat.
 *
 * @see {@link https://core.telegram.org/bots/api#chatownerleft Telegram Bot API: ChatOwnerLeft}
 */
export interface ChatOwnerLeft {
  /** The user who will become the new owner of the chat if the previous owner does not return to the chat. */
  new_owner?: User;
}

/**
 * Describes a topic of a direct messages chat.
 *
 * @see {@link https://core.telegram.org/bots/api#directmessagestopic Telegram Bot API: DirectMessagesTopic}
 */
export interface DirectMessagesTopic {
  /**
   * Unique identifier of the topic.
   *
   * @remarks
   * This number may have more than 32 significant bits and some programming languages may have
   * difficulty/silent defects in interpreting it. But it has at most 52 significant bits, so a 64-bit
   * integer or double-precision float type are safe for storing this identifier.
   */
  topic_id: number;
  /** Information about the user that created the topic. Currently, it is always present. */
  user?: User;
}

/**
 * Describes a service message about a change in the price of direct messages sent to a channel chat.
 *
 * @see {@link https://core.telegram.org/bots/api#directmessagepricechanged Telegram Bot API: DirectMessagePriceChanged}
 */
export interface DirectMessagePriceChanged {
  /** True, if direct messages are enabled for the channel chat; False otherwise. */
  are_direct_messages_enabled: boolean;
  /**
   * The new number of Telegram Stars that must be paid by users for each direct message sent to the channel.
   *
   * @remarks
   * Does not apply to users who have been exempted by administrators. Defaults to 0.
   */
  direct_message_star_count?: number;
}

/**
 * Describes a service message about a change in the price of paid messages within a chat.
 *
 * @see {@link https://core.telegram.org/bots/api#paidmessagepricechanged Telegram Bot API: PaidMessagePriceChanged}
 */
export interface PaidMessagePriceChanged {
  /** The new number of Telegram Stars that must be paid by non-administrator users of the supergroup chat for each sent message. */
  paid_message_star_count: number;
}

/**
 * Contains information about the bot that was created to be managed by the current bot.
 *
 * @see {@link https://core.telegram.org/bots/api#managedbotcreated Telegram Bot API: ManagedBotCreated}
 */
export interface ManagedBotCreated {
  /** Information about the bot. The bot's token can be fetched using the method getManagedBotToken. */
  bot: User;
}
