import type { InlineKeyboardMarkup, MessageEntity } from "../messages/index.js";
import type { LabeledPrice, ShippingOption, SuggestedPostParameters } from "./models.js";

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
  /** Pass True to allow paid broadcast of the message. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Parameters of the suggested post to send in a business chat. */
  suggested_post_parameters?: SuggestedPostParameters;
  /** Description of the message to reply to. */
  reply_parameters?: unknown;
  /** An inline keyboard. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
}

/**
 * Options for {@link Bot.createInvoiceLink}.
 *
 * @remarks
 * Mirrors the documented 22-parameter createInvoiceLink set exactly. Unlike
 * sendInvoice it has no `chat_id` and no message-delivery fields
 * (`disable_notification`, `message_thread_id`, `protect_content`,
 * `reply_parameters`, `reply_markup`, `start_parameter`), and it supports
 * `subscription_period` for recurring charges.
 *
 * @see {@link https://core.telegram.org/bots/api#createinvoicelink Telegram Bot API: createInvoiceLink}
 */
export interface CreateInvoiceLinkOptions {
  /** Unique identifier of the business connection on behalf of which the link will be created. */
  business_connection_id?: string;
  /** Product name, 1-32 characters. */
  title: string;
  /** Product description, 1-255 characters. */
  description: string;
  /** Bot-defined invoice payload, 1-128 bytes. */
  payload: string;
  /** Payment provider token, obtained via @BotFather. Pass an empty string for payments in Telegram Stars. */
  provider_token?: string;
  /** Three-letter ISO 4217 currency code or 'XTR' for Telegram Stars. */
  currency: string;
  /** Price breakdown, a JSON-serialized list of components. */
  prices: LabeledPrice[];
  /** Subscription period in seconds for recurring payments; must be one of 86400, 604800, 2592000, 6048000, 31536000. */
  subscription_period?: number;
  /** The maximum accepted amount for tips in the smallest units of the currency. */
  max_tip_amount?: number;
  /** A JSON-serialized array of suggested amounts of tips in the smallest units of the currency. */
  suggested_tip_amounts?: number[];
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
}

/**
 * Options for {@link Bot.answerShippingQuery}.
 *
 * @see {@link https://core.telegram.org/bots/api#answershippingquery Telegram Bot API: answerShippingQuery}
 */
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

export interface AnswerPreCheckoutQueryOptions {
  /** Unique identifier for the query to be answered. */
  pre_checkout_query_id: string;
  /** Specify True if everything is alright and the bot is ready to proceed with the order. Use False if there are any problems. */
  ok: boolean;
  /** Required if ok is False. Error message in human readable form that explains the reason for failure. */
  error_message?: string;
}

/**
 * Options for {@link Bot.sendGift}.
 *
 * @remarks
 * `user_id` and `chat_id` are mutually exclusive: exactly one of them must be
 * provided. Limited gifts cannot be sent to channel chats.
 */
export interface SendGiftOptions {
  /** Required if `chat_id` is not specified. Unique identifier of the target user who will receive the gift. */
  user_id?: number;
  /** Required if `user_id` is not specified. Unique identifier for the chat or username of the channel (`@username`) that will receive the gift. */
  chat_id?: number | string;
  /** Identifier of the gift; limited gifts can't be sent to channel chats. */
  gift_id: string;
  /** Pass True to pay for the gift upgrade from the bot's balance, making the upgrade free for the receiver. */
  pay_for_upgrade?: boolean;
  /** Text that will be shown along with the gift; 0-128 characters. */
  text?: string;
  /** Mode for parsing entities in the text. */
  text_parse_mode?: string;
  /** Special entities that appear in the gift text. */
  text_entities?: MessageEntity[];
}

/** Options for {@link Bot.upgradeGift}. */
export interface UpgradeGiftOptions {
  /** Pass True to keep the original gift text, sender and receiver in the upgraded gift. */
  keep_original_details?: boolean;
  /** The amount of Telegram Stars that will be paid for the upgrade from the business account balance. */
  star_count?: number;
}

/** Options for {@link Bot.transferGift}. */
export interface TransferGiftOptions {
  /** The amount of Telegram Stars that will be paid for the transfer from the business account balance. */
  star_count?: number;
}

/** Shared filters for the `get*Gifts` methods. */
export interface GiftQueryOptions {
  /** Pass True to exclude gifts that can be purchased an unlimited number of times. */
  exclude_unlimited?: boolean;
  /** Pass True to exclude gifts that can be purchased a limited number of times and can be upgraded to unique. */
  exclude_limited_upgradable?: boolean;
  /** Pass True to exclude gifts that can be purchased a limited number of times and can't be upgraded to unique. */
  exclude_limited_non_upgradable?: boolean;
  /** Pass True to exclude unique gifts. */
  exclude_unique?: boolean;
  /** Pass True to exclude gifts that were assigned from the TON blockchain and can't be resold or transferred in Telegram. */
  exclude_from_blockchain?: boolean;
  /** Pass True to sort results by gift price instead of send date. Sorting is applied before pagination. */
  sort_by_price?: boolean;
  /** Offset of the first entry to return as received from the previous request; use an empty string to get the first chunk of results. */
  offset?: string;
  /** The maximum number of gifts to be returned; 1-100. */
  limit?: number;
}

/** Options for {@link Bot.getUserGifts}. */
export type GetUserGiftsOptions = GiftQueryOptions;

/** Options for {@link Bot.getChatGifts}. */
export interface GetChatGiftsOptions extends GiftQueryOptions {
  /** Pass True to exclude gifts that aren't saved to the chat's profile page. */
  exclude_unsaved?: boolean;
  /** Pass True to exclude gifts that are saved to the chat's profile page. */
  exclude_saved?: boolean;
}

/** Options for {@link Bot.getBusinessAccountGifts}. */
export interface GetBusinessAccountGiftsOptions extends GiftQueryOptions {
  /** Pass True to exclude gifts that aren't saved to the account's profile page. */
  exclude_unsaved?: boolean;
  /** Pass True to exclude gifts that are saved to the account's profile page. */
  exclude_saved?: boolean;
}

/** Options for {@link Bot.setBusinessAccountProfilePhoto}. */
export interface SetBusinessAccountProfilePhotoOptions {
  /** Pass True to set the public photo, which will be visible even if the main photo is hidden by the business account's privacy settings. */
  is_public?: boolean;
}

/** Options for {@link Bot.removeBusinessAccountProfilePhoto}. */
export interface RemoveBusinessAccountProfilePhotoOptions {
  /** Pass True to remove the public photo, which is visible even if the main photo is hidden by the business account's privacy settings. */
  is_public?: boolean;
}
