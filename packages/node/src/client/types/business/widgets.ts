import type { ParseMode } from "../../constants.js";
import type { Chat, User } from "../common/index.js";
import type { MessageEntity, ReplyMarkup, ReplyParameters } from "../messages/index.js";
import type { TonWalletCard } from "./ton-wallet.js";

/**
 * Represents an HTML widget in a message.
 *
 * @see {@link https://core.telegram.org/bots/api#widget Telegram Bot API: Widget}
 */
export interface Widget {
  /** Unique identifier of the shared widget, if shared. */
  id?: string;
  /** Width of the widget in pixels. */
  width?: number;
  /** Height of the widget in pixels. */
  height?: number;
  /** HTML content of the widget. */
  html: string;
  /** Public data of the widget, if any. */
  public_data?: string;
  /** Chat-specific data of the widget, if any. */
  chat_data?: string;
}

/**
 * Describes a TON wallet in a widget query.
 *
 * @see {@link https://core.telegram.org/bots/api#widgetquerywallet Telegram Bot API: WidgetQueryWallet}
 */
export interface WidgetQueryWallet {
  /** Address of the TON wallet. */
  address: string;
  /** Balance of the wallet in nanoton. */
  amount: string;
  /** Public key of the wallet, if available. */
  public_key?: string;
  /** Base64-encoded state init of the wallet, if available. */
  state_init?: string;
}

/**
 * Represents a widget query containing data for the bot.
 *
 * @see {@link https://core.telegram.org/bots/api#widgetquerytypedata Telegram Bot API: WidgetQueryTypeData}
 */
export interface WidgetQueryTypeData {
  /** Type of the query, always 'data'. */
  type: "data";
  /** TON wallet card of the user, if requested. */
  wallet_card?: TonWalletCard;
}

/**
 * Represents a widget query containing data signed by a TON wallet.
 *
 * @see {@link https://core.telegram.org/bots/api#widgetquerytypesigndata Telegram Bot API: WidgetQueryTypeSignData}
 */
export interface WidgetQueryTypeSignData {
  /** Type of the query, always 'sign_data'. */
  type: "sign_data";
  /** TON wallet that signed the data. */
  wallet: WidgetQueryWallet;
  /** Signed data payload. */
  sign_data: string;
}

/**
 * Represents a widget query notifying about a transaction sent from a TON wallet.
 *
 * @see {@link https://core.telegram.org/bots/api#widgetquerytypesenttransaction Telegram Bot API: WidgetQueryTypeSentTransaction}
 */
export interface WidgetQueryTypeSentTransaction {
  /** Type of the query, always 'sent_transaction'. */
  type: "sent_transaction";
  /** TON wallet that sent the transaction. */
  wallet: WidgetQueryWallet;
  /** Hash of the external message sent to the blockchain. */
  msg_hash: string;
}

/**
 * Describes the type of a query from a widget.
 *
 * @see {@link https://core.telegram.org/bots/api#widgetquerytype Telegram Bot API: WidgetQueryType}
 */
export type WidgetQueryType =
  WidgetQueryTypeData | WidgetQueryTypeSignData | WidgetQueryTypeSentTransaction;

/**
 * Represents an incoming query from a widget in a message sent by or via the bot.
 *
 * @see {@link https://core.telegram.org/bots/api#widgetquery Telegram Bot API: WidgetQuery}
 */
export interface WidgetQuery {
  /** Unique identifier for this query. */
  id: string;
  /** Sender of the query. */
  from: User;
  /** Chat where the widget message was sent, if available. */
  chat?: Chat;
  /** Identifier of the message with the widget, if available. */
  message_id?: number;
  /** Identifier of the inline message with the widget, if sent via the bot. */
  inline_message_id?: string;
  /** Global identifier uniquely corresponding to the chat. */
  chat_instance: string;
  /** Type of the chat, if available. */
  chat_type?: string;
  /** Type of the widget query. */
  type: WidgetQueryType;
  /** Data payload sent by the widget. */
  data: string;
  /** Identifier of the shared widget, if applicable. */
  widget_id?: string;
}

/**
 * Represents an incoming query from a forwarded message with a shared widget.
 *
 * @see {@link https://core.telegram.org/bots/api#sharedwidgetquery Telegram Bot API: SharedWidgetQuery}
 */
export interface SharedWidgetQuery {
  /** Unique identifier for this query. */
  id: string;
  /** Sender of the query. */
  from: User;
  /** Type of the widget query. */
  type: WidgetQueryType;
  /** Data payload sent by the widget. */
  data: string;
  /** Unique identifier of the shared widget. */
  widget_id: string;
}

/**
 * Represents the content of an HTML widget message to be sent as the result of an inline query.
 *
 * @see {@link https://core.telegram.org/bots/api#inputwidgetmessagecontent Telegram Bot API: InputWidgetMessageContent}
 */
export interface InputWidgetMessageContent {
  /** HTML content of the widget. */
  html: string;
  /** Width of the widget in pixels. */
  width?: number;
  /** Height of the widget in pixels. */
  height?: number;
  /** Public data of the widget. */
  public_data?: string;
  /** Chat-specific data of the widget. */
  chat_data?: string;
  /** Caption of the widget message. */
  caption?: string;
  /** Mode for parsing entities in the caption. */
  parse_mode?: ParseMode | string;
  /** List of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True if the caption must be shown above the widget. */
  show_caption_above_media?: boolean;
  /** Pass True to allow the widget to send queries to the bot. */
  allow_queries?: boolean;
  /** Pass True if the widget is shared. */
  is_shared?: boolean;
}

/**
 * Represents the content of a shared widget message to be sent as the result of an inline query.
 *
 * @see {@link https://core.telegram.org/bots/api#inputsharedwidgetmessagecontent Telegram Bot API: InputSharedWidgetMessageContent}
 */
export interface InputSharedWidgetMessageContent {
  /** Unique identifier of the shared widget. */
  widget_id: string;
  /** Chat-specific data of the widget. */
  chat_data?: string;
  /** Caption of the widget message. */
  caption?: string;
  /** Mode for parsing entities in the caption. */
  parse_mode?: ParseMode | string;
  /** List of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True if the caption must be shown above the widget. */
  show_caption_above_media?: boolean;
}

/**
 * Options for {@link Bot.sendWidget}.
 *
 * @see {@link https://core.telegram.org/bots/api#sendwidget Telegram Bot API: sendWidget}
 */
export interface SendWidgetOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Unique identifier for the target message thread (topic) of a forum supergroup. */
  message_thread_id?: number;
  /** HTML content of the widget. */
  html: string;
  /** Width of the widget in pixels. */
  width?: number;
  /** Height of the widget in pixels. */
  height?: number;
  /** Public data of the widget. */
  public_data?: string;
  /** Chat-specific data of the widget. */
  chat_data?: string;
  /** Caption of the widget message. */
  caption?: string;
  /** Mode for parsing entities in the caption. */
  parse_mode?: ParseMode | string;
  /** List of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True if the caption must be shown above the widget. */
  show_caption_above_media?: boolean;
  /** Pass True to allow the widget to send queries to the bot. */
  allow_queries?: boolean;
  /** Pass True if the widget is shared. */
  is_shared?: boolean;
  /** Sends the message silently. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Pass True to allow up to 1000 messages per second. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
}

/**
 * Options for {@link Bot.sendSharedWidget}.
 *
 * @see {@link https://core.telegram.org/bots/api#sendsharedwidget Telegram Bot API: sendSharedWidget}
 */
export interface SendSharedWidgetOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Unique identifier for the target message thread (topic) of a forum supergroup. */
  message_thread_id?: number;
  /** Unique identifier of the shared widget. */
  widget_id: string;
  /** Chat-specific data of the widget. */
  chat_data?: string;
  /** Caption of the widget message. */
  caption?: string;
  /** Mode for parsing entities in the caption. */
  parse_mode?: ParseMode | string;
  /** List of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True if the caption must be shown above the widget. */
  show_caption_above_media?: boolean;
  /** Sends the message silently. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Pass True to allow up to 1000 messages per second. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
}

/**
 * Options for {@link Bot.answerWidgetQuery}.
 *
 * @see {@link https://core.telegram.org/bots/api#answerwidgetquery Telegram Bot API: answerWidgetQuery}
 */
export interface AnswerWidgetQueryOptions {
  /** Unique identifier for the query to be answered. */
  widget_query_id: string;
  /** Data to be returned to the widget. */
  data?: string;
}

/**
 * Options for {@link Bot.editMessageWidgetData}.
 *
 * @see {@link https://core.telegram.org/bots/api#editmessagewidgetdata Telegram Bot API: editMessageWidgetData}
 */
export interface EditMessageWidgetDataOptions {
  /** Required if inline_message_id is not specified. Unique identifier for the target chat. */
  chat_id?: number | string;
  /** Required if inline_message_id is not specified. Identifier of the message to edit. */
  message_id?: number;
  /** Required if chat_id and message_id are not specified. Identifier of the inline message. */
  inline_message_id?: string;
  /** New public data of the widget. */
  public_data?: string;
  /** New chat-specific data of the widget. */
  chat_data?: string;
}

/**
 * Options for {@link Bot.editSharedWidgetData}.
 *
 * @see {@link https://core.telegram.org/bots/api#editsharedwidgetdata Telegram Bot API: editSharedWidgetData}
 */
export interface EditSharedWidgetDataOptions {
  /** Unique identifier of the shared widget. */
  widget_id: string;
  /** New public data of the widget, 0-1024 bytes. */
  public_data: string;
  /** Maximum amount of time in seconds that the result may be cached. */
  cache_time?: number;
}
