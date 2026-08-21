import type { User } from "./common.js";
import type { InlineKeyboardMarkup, MessageEntity } from "./messages.js";
import type { Sticker } from "./stickers.js";

export interface Invoice {
  /** Product name. */
  title: string;
  /** Product description. */
  description: string;
  /** Unique bot deep-linking parameter. */
  start_parameter: string;
  /** Three-letter ISO 4217 currency code or "XTR" for Telegram Stars. */
  currency: string;
  /** Total price in the smallest units of the currency. */
  total_amount: number;
}

export interface OrderInfo {
  /** User name. */
  name?: string;
  /** User's phone number. */
  phone_number?: string;
  /** User's email. */
  email?: string;
  /** User's shipping address. */
  shipping_address?: ShippingAddress;
}

export interface ShippingAddress {
  /** Two-letter ISO 3166-1 alpha-2 country code. */
  country_code: string;
  /** State, if applicable. */
  state?: string;
  /** City. */
  city: string;
  /** First line for the address. */
  street_line1: string;
  /** Second line for the address. */
  street_line2?: string;
  /** Address post code. */
  post_code: string;
}

export interface SuccessfulPayment {
  /** Three-letter ISO 4217 currency code or "XTR". */
  currency: string;
  /** Total price in the smallest units of the currency. */
  total_amount: number;
  /** Bot specified invoice payload. */
  invoice_payload: string;
  /** Identifier of the shipping option chosen by the user. */
  shipping_option_id?: string;
  /** Order info provided by the user. */
  order_info?: OrderInfo;
  /** Telegram payment identifier. */
  telegram_payment_charge_id: string;
  /** Provider payment identifier. */
  provider_payment_charge_id: string;
  /** True, if the payment is a recurring subscription. */
  is_recurring?: boolean;
  /** True, if the payment is the first payment for a subscription. */
  is_first_recurring?: boolean;
}

export interface RefundedPayment {
  /** Three-letter ISO 4217 currency code or "XTR". */
  currency: string;
  /** Total refunded price in the smallest units of the currency. */
  total_amount: number;
  /** Bot specified invoice payload. */
  invoice_payload: string;
  /** Telegram payment identifier. */
  telegram_payment_charge_id: string;
  /** Provider payment identifier. */
  provider_payment_charge_id?: string;
}

export interface ShippingQuery {
  /** Unique query identifier. */
  id: string;
  /** User who sent the query. */
  from: User;
  /** Bot specified invoice payload. */
  invoice_payload: string;
  /** User specified shipping address. */
  shipping_address: ShippingAddress;
}

export interface PreCheckoutQuery {
  /** Unique query identifier. */
  id: string;
  /** User who sent the query. */
  from: User;
  /** Three-letter ISO 4217 currency code or 'XTR'. */
  currency: string;
  /** Total price in the smallest units of the currency. */
  total_amount: number;
  /** Bot specified invoice payload. */
  invoice_payload: string;
  /** Identifier of the shipping option chosen by the user. */
  shipping_option_id?: string;
  /** Order info provided by the user. */
  order_info?: OrderInfo;
}

export interface SendInvoiceOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Product name, 1-32 characters. */
  title: string;
  /** Product description, 1-255 characters. */
  description: string;
  /** Bot-defined invoice payload, 1-128 bytes. */
  payload: string;
  /** Three-letter ISO 4217 currency code or 'XTR' for Telegram Stars. */
  currency: string;
  /** Price breakdown, a JSON-serialized list of components. */
  prices: LabeledPrice[];
  /** Payment provider token, obtained via @BotFather. Pass an empty string for payments in Telegram Stars. */
  provider_token?: string;
  /** The maximum accepted amount for tips in the smallest units of the currency. */
  max_tip_amount?: number;
  /** A JSON-serialized array of suggested amounts of tips in the smallest units of the currency. */
  suggested_tip_amounts?: number[];
  /** Unique deep-linking parameter. */
  start_parameter?: string;
  /** JSON-serialized data about the invoice, which will be shared with the payment provider. */
  provider_data?: string;
  /** URL of the product photo for the invoice. */
  photo_url?: string;
  /** Photo size in bytes. */
  photo_size?: number;
  /** Photo width. */
  photo_width?: number;
  /** Photo height. */
  photo_height?: number;
  /** Pass True if you require the user's full name to complete the order. */
  need_name?: boolean;
  /** Pass True if you require the user's phone number to complete the order. */
  need_phone_number?: boolean;
  /** Pass True if you require the user's email address to complete the order. */
  need_email?: boolean;
  /** Pass True if you require the user's shipping address to complete the order. */
  need_shipping_address?: boolean;
  /** Pass True if the user's phone number should be sent to the provider. */
  send_phone_number_to_provider?: boolean;
  /** Pass True if the user's email address should be sent to the provider. */
  send_email_to_provider?: boolean;
  /** Pass True if the final price depends on the shipping method. */
  is_flexible?: boolean;
  /** Sends the message silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Description of the message to reply to. */
  reply_parameters?: unknown;
  /** An inline keyboard. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

export interface LabeledPrice {
  /** Portion label. */
  label: string;
  /** Price of the product in the smallest units of the currency. */
  amount: number;
}

export interface AnswerShippingQueryOptions {
  /** Unique identifier for the query to be answered. */
  shipping_query_id: string;
  /** Pass True if delivery to the specified address is possible and False if there are any problems. */
  ok: boolean;
  /** Required if ok is True. A JSON-serialized array of available shipping options. */
  shipping_options?: ShippingOption[];
  /** Required if ok is False. Error message in human readable form that explains why it is impossible to complete the order. */
  error_message?: string;
}

export interface ShippingOption {
  /** Shipping option identifier. */
  id: string;
  /** Option title. */
  title: string;
  /** List of price portions. */
  prices: LabeledPrice[];
}

export interface AnswerPreCheckoutQueryOptions {
  /** Unique identifier for the query to be answered. */
  pre_checkout_query_id: string;
  /** Specify True if everything is alright and the bot is ready to proceed with the order. Use False if there are any problems. */
  ok: boolean;
  /** Required if ok is False. Error message in human readable form that explains the reason for failure. */
  error_message?: string;
}

export interface StarAmount {
  /** The integer number of Telegram Stars. */
  amount: number;
  /** The number of 1/1000000000 shares of Telegram Stars. */
  nanostar_amount?: number;
}

export interface StarTransactions {
  /** List of transactions. */
  transactions: StarTransaction[];
}

export interface StarTransaction {
  /** Unique identifier of the transaction. */
  id: string;
  /** Number of Telegram Stars transferred. */
  amount: number;
  /** The number of 1/1000000000 shares of Telegram Stars transferred. */
  nanostar_amount?: number;
  /** Date the transaction took place in Unix time. */
  date: number;
  /** Source of the transaction. */
  source?: unknown;
  /** Receiver of the transaction. */
  receiver?: unknown;
}

export interface PurchasedPaidMedia {
  /** User who purchased the media. */
  from: User;
  /** Bot-specified paid media payload. */
  paid_media_payload: string;
}

export interface Gift {
  /** Unique identifier of the gift. */
  id: string;
  /** The sticker representing the gift. */
  sticker: Sticker;
  /** Number of Telegram Stars that must be paid to send the sticker. */
  star_count: number;
  /** The total number of the gifts of this type that can be sent; for limited gifts only. */
  total_count?: number;
  /** The number of remaining gifts of this type that can be sent; for limited gifts only. */
  remaining_count?: number;
  /** Number of Telegram Stars that must be paid to upgrade the gift to a unique one. */
  upgrade_star_count?: number;
}

export interface Gifts {
  /** The list of gifts. */
  gifts: Gift[];
}

export interface SendGiftOptions {
  /** Unique identifier of the target user that will receive the gift. */
  user_id: number;
  /** Identifier of the gift. */
  gift_id: string;
  /** Pass True to pay for the gift upgrade from the bot's balance, making the upgrade free for the receiver. */
  pay_for_upgrade?: boolean;
  /** Text that will be shown along with the gift; 0-255 characters. */
  text?: string;
  /** Mode for parsing entities in the text. */
  text_parse_mode?: string;
  /** Special entities that appear in the gift text. */
  text_entities?: MessageEntity[];
}
