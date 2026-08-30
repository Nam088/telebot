import type { User, Chat } from "../common/index.js";
import type { Sticker } from "../stickers/index.js";
import type { MessageEntity } from "../messages/index.js";

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

export interface LabeledPrice {
  /** Portion label. */
  label: string;
  /** Price of the product in the smallest units of the currency. */
  amount: number;
}

export interface ShippingOption {
  /** Shipping option identifier. */
  id: string;
  /** Option title. */
  title: string;
  /** List of price portions. */
  prices: LabeledPrice[];
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

/** Describes the background of a {@link Gift}. */
export interface GiftBackground {
  /** Center color of the background in RGB format. */
  center_color: number;
  /** Edge color of the background in RGB format. */
  edge_color: number;
  /** Text color of the background in RGB format. */
  text_color: number;
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
  /** True, if the gift can only be purchased by Telegram Premium subscribers. */
  is_premium?: boolean;
  /** True, if the gift can be used (after being upgraded) to customize a user's appearance. */
  has_colors?: boolean;
  /** Background of the gift. */
  background?: GiftBackground;
  /** The total number of gifts of this type that can be sent by the bot; for limited gifts only. */
  personal_total_count?: number;
  /** The number of remaining gifts of this type that can be sent by the bot; for limited gifts only. */
  personal_remaining_count?: number;
  /** The total number of different unique gifts that can be obtained by upgrading the gift. */
  unique_gift_variant_count?: number;
  /** Information about the chat that published the gift. */
  publisher_chat?: Chat;
}

export interface Gifts {
  /** The list of gifts. */
  gifts: Gift[];
}

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

export interface UniqueGiftBackdrop {
  /** Name of the backdrop. */
  name: string;
  /** Colors of the backdrop. */
  colors: UniqueGiftBackdropColors;
  /** The number of unique gifts that receive this backdrop for every 1000 gifts upgraded. */
  rarity_per_mille: number;
}

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

export interface UniqueGiftSymbol {
  /** Name of the symbol. */
  name: string;
  /** The sticker that represents the unique gift. */
  sticker: Sticker;
  /** The number of unique gifts that receive this model for every 1000 gifts upgraded. */
  rarity_per_mille: number;
}

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
