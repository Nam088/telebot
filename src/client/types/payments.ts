import type { User, Chat } from "./common.js";
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

/**
 * Colors of the backdrop of a unique gift.
 */
export interface UniqueGiftBackdropColors {
  /** The color in the center of the backdrop in RGB format. */
  center_color: number;
  /** The color on the edges of the backdrop in RGB format. */
  edge_color: number;
  /** The color to be applied to the symbol in RGB format. */
  symbol_color: number;
  /** The color for the text on the backdrop in RGB format. */
  text_color: number;
}

/**
 * Backdrop of a unique gift.
 */
export interface UniqueGiftBackdrop {
  /** Name of the backdrop. */
  name: string;
  /** Colors of the backdrop. */
  colors: UniqueGiftBackdropColors;
  /** The number of unique gifts that receive this backdrop for every 1000 gifts upgraded. */
  rarity_per_mille: number;
}

/**
 * Model of a unique gift.
 */
export interface UniqueGiftModel {
  /** Name of the model. */
  name: string;
  /** The sticker that represents the unique gift. */
  sticker: Sticker;
  /** The number of unique gifts that receive this model for every 1000 gift upgrades. */
  rarity_per_mille: number;
  /** Rarity of the model if it is a crafted model ('uncommon', 'rare', 'epic', 'legendary'). */
  rarity?: "uncommon" | "rare" | "epic" | "legendary" | string;
}

/**
 * Symbol shown on the pattern of a unique gift.
 */
export interface UniqueGiftSymbol {
  /** Name of the symbol. */
  name: string;
  /** The sticker that represents the unique gift. */
  sticker: Sticker;
  /** The number of unique gifts that receive this model for every 1000 gifts upgraded. */
  rarity_per_mille: number;
}

/**
 * Color scheme based on a unique gift.
 */
export interface UniqueGiftColors {
  /** Custom emoji identifier of the unique gift's model. */
  model_custom_emoji_id: string;
  /** Custom emoji identifier of the unique gift's symbol. */
  symbol_custom_emoji_id: string;
  /** Main color used in light themes; RGB format. */
  light_theme_main_color: number;
  /** List of 1-3 additional colors used in light themes; RGB format. */
  light_theme_other_colors: number[];
  /** Main color used in dark themes; RGB format. */
  dark_theme_main_color: number;
  /** List of 1-3 additional colors used in dark themes; RGB format. */
  dark_theme_other_colors: number[];
}

/**
 * A unique gift upgraded from a regular gift.
 */
export interface UniqueGift {
  /** Identifier of the regular gift from which the gift was upgraded. */
  gift_id: string;
  /** Human-readable name of the regular gift. */
  base_name: string;
  /** Unique name of the gift. */
  name: string;
  /** Unique number of the upgraded gift. */
  number: number;
  /** Model of the gift. */
  model: UniqueGiftModel;
  /** Symbol of the gift. */
  symbol: UniqueGiftSymbol;
  /** Backdrop of the gift. */
  backdrop: UniqueGiftBackdrop;
  /** True, if the original regular gift was exclusively purchaseable by Telegram Premium subscribers. */
  is_premium?: true | boolean;
  /** True, if the gift was used to craft another gift and isn't available anymore. */
  is_burned?: true | boolean;
  /** True, if the gift is assigned from the TON blockchain. */
  is_from_blockchain?: true | boolean;
  /** The color scheme for user's name, replies, etc. */
  colors?: UniqueGiftColors;
  /** Information about the chat that published the gift. */
  publisher_chat?: Chat;
}

/**
 * Describes a service message about a unique gift that was sent or received (Bot API 10.3+).
 */
export interface UniqueGiftInfo {
  /** Information about the gift. */
  gift: UniqueGift;
  /** Origin of the gift ('upgrade', 'transfer', 'resale', 'gifted_upgrade', 'offer'). */
  origin: "upgrade" | "transfer" | "resale" | "gifted_upgrade" | "offer" | string;
  /** Text of the message that was added to the gift (Bot API 10.3+). */
  text?: string;
  /** Special entities that appear in the text (Bot API 10.3+). */
  entities?: MessageEntity[];
  /** True, if the sender and gift text are shown only to the gift receiver (Bot API 10.3+). */
  is_private?: true | boolean;
  /** Currency in which the payment for the gift was done ('XTR', 'TON'). */
  last_resale_currency?: "XTR" | "TON" | string;
  /** Price paid for the gift in either Telegram Stars or nanograms. */
  last_resale_amount?: number;
  /** Unique identifier of the received gift for the bot. */
  owned_gift_id?: string;
  /** Number of Telegram Stars that must be paid to transfer the gift. */
  transfer_star_count?: number;
  /** Point in time (Unix timestamp) when the gift can be transferred. */
  next_transfer_date?: number;
}
