import type { Chat, User } from "../common/index.js";
import type { Gift } from "./models.js";
import type { PaidMedia } from "./paid-media.js";

/**
 * Describes the state of a revenue withdrawal operation.
 *
 * @see {@link https://core.telegram.org/bots/api#revenuewithdrawalstatepending Telegram Bot API: RevenueWithdrawalStatePending}
 */
export interface RevenueWithdrawalStatePending {
  /** Type of the state, always "pending". */
  type: "pending";
}

/**
 * The withdrawal succeeded.
 *
 * @see {@link https://core.telegram.org/bots/api#revenuewithdrawalstatesucceeded Telegram Bot API: RevenueWithdrawalStateSucceeded}
 */
export interface RevenueWithdrawalStateSucceeded {
  /** Type of the state, always "succeeded". */
  type: "succeeded";
  /** Date the withdrawal was completed in Unix time. */
  date: number;
  /** An HTTPS URL that can be used to see transaction details. */
  url: string;
}

/**
 * The withdrawal failed and the transaction was refunded.
 *
 * @see {@link https://core.telegram.org/bots/api#revenuewithdrawalstatefailed Telegram Bot API: RevenueWithdrawalStateFailed}
 */
export interface RevenueWithdrawalStateFailed {
  /** Type of the state, always "failed". */
  type: "failed";
}

/**
 * This object describes the state of a revenue withdrawal operation.
 *
 * @see {@link https://core.telegram.org/bots/api#revenuewithdrawalstate Telegram Bot API: RevenueWithdrawalState}
 */
export type RevenueWithdrawalState =
  RevenueWithdrawalStatePending | RevenueWithdrawalStateSucceeded | RevenueWithdrawalStateFailed;

/**
 * Contains information about the affiliate that received a commission via this transaction.
 *
 * @see {@link https://core.telegram.org/bots/api#affiliateinfo Telegram Bot API: AffiliateInfo}
 */
export interface AffiliateInfo {
  /** The bot or the user that received an affiliate commission if it was received by a bot or a user. */
  affiliate_user?: User;
  /** The chat that received an affiliate commission if it was received by a chat. */
  affiliate_chat?: Chat;
  /** The number of Telegram Stars received by the affiliate for each 1000 Telegram Stars received by the bot from referred users. */
  commission_per_mille: number;
  /** Integer amount of Telegram Stars received by the affiliate from the transaction, rounded to 0; can be negative for refunds. */
  amount: number;
  /** The number of 1/1000000000 shares of Telegram Stars received by the affiliate; from -999999999 to 999999999; can be negative for refunds. */
  nanostar_amount?: number;
}

/**
 * Describes a transaction with a user.
 *
 * @see {@link https://core.telegram.org/bots/api#transactionpartneruser Telegram Bot API: TransactionPartnerUser}
 */
export interface TransactionPartnerUser {
  /** Type of the transaction partner, always "user". */
  type: "user";
  /** Type of the transaction. */
  transaction_type:
    "invoice_payment" | "paid_media_payment" | "gift_purchase" | "premium_purchase" | string;
  /** Information about the user. */
  user: User;
  /** Information about the affiliate that received a commission via this transaction. */
  affiliate?: AffiliateInfo;
  /** Bot-specified invoice payload; for "invoice_payment" transactions only. */
  invoice_payload?: string;
  /** The duration of the paid subscription; for "invoice_payment" transactions only. */
  subscription_period?: number;
  /** Information about the paid media bought by the user; for "paid_media_payment" transactions only. */
  paid_media?: PaidMedia[];
  /** Bot-specified paid media payload; for "paid_media_payment" transactions only. */
  paid_media_payload?: string;
  /** The gift sent to the user by the bot; for "gift_purchase" transactions only. */
  gift?: Gift;
  /** Number of months the gifted Telegram Premium subscription will be active for; for "premium_purchase" transactions only. */
  premium_subscription_duration?: number;
}

/**
 * Describes a transaction with a chat.
 *
 * @see {@link https://core.telegram.org/bots/api#transactionpartnerchat Telegram Bot API: TransactionPartnerChat}
 */
export interface TransactionPartnerChat {
  /** Type of the transaction partner, always "chat". */
  type: "chat";
  /** Information about the chat. */
  chat: Chat;
  /** The gift sent to the chat by the bot. */
  gift?: Gift;
}

/**
 * Describes the affiliate program that issued the affiliate commission received via this transaction.
 *
 * @see {@link https://core.telegram.org/bots/api#transactionpartneraffiliateprogram Telegram Bot API: TransactionPartnerAffiliateProgram}
 */
export interface TransactionPartnerAffiliateProgram {
  /** Type of the transaction partner, always "affiliate_program". */
  type: "affiliate_program";
  /** Information about the bot that sponsored the affiliate program. */
  sponsor_user?: User;
  /** The number of Telegram Stars received by the bot for each 1000 Telegram Stars received by the affiliate program sponsor from referred users. */
  commission_per_mille: number;
}

/**
 * Describes a withdrawal transaction with Fragment.
 *
 * @see {@link https://core.telegram.org/bots/api#transactionpartnerfragment Telegram Bot API: TransactionPartnerFragment}
 */
export interface TransactionPartnerFragment {
  /** Type of the transaction partner, always "fragment". */
  type: "fragment";
  /** State of the transaction if the transaction is outgoing. */
  withdrawal_state?: RevenueWithdrawalState;
}

/**
 * Describes a withdrawal transaction to the Telegram Ads platform.
 *
 * @see {@link https://core.telegram.org/bots/api#transactionpartnertelegramads Telegram Bot API: TransactionPartnerTelegramAds}
 */
export interface TransactionPartnerTelegramAds {
  /** Type of the transaction partner, always "telegram_ads". */
  type: "telegram_ads";
}

/**
 * Describes a transaction with payment for paid broadcasting.
 *
 * @see {@link https://core.telegram.org/bots/api#transactionpartnertelegramapi Telegram Bot API: TransactionPartnerTelegramApi}
 */
export interface TransactionPartnerTelegramApi {
  /** Type of the transaction partner, always "telegram_api". */
  type: "telegram_api";
  /** The number of successful requests that exceeded regular limits and were therefore billed. */
  request_count: number;
}

/**
 * Describes a transaction with an unknown source or recipient.
 *
 * @see {@link https://core.telegram.org/bots/api#transactionpartnerother Telegram Bot API: TransactionPartnerOther}
 */
export interface TransactionPartnerOther {
  /** Type of the transaction partner, always "other". */
  type: "other";
}

/**
 * This object describes the source of a transaction, or its recipient for outgoing transactions.
 *
 * @see {@link https://core.telegram.org/bots/api#transactionpartner Telegram Bot API: TransactionPartner}
 */
export type TransactionPartner =
  | TransactionPartnerUser
  | TransactionPartnerChat
  | TransactionPartnerAffiliateProgram
  | TransactionPartnerFragment
  | TransactionPartnerTelegramAds
  | TransactionPartnerTelegramApi
  | TransactionPartnerOther;

/**
 * Describes a Telegram Star transaction.
 *
 * @see {@link https://core.telegram.org/bots/api#startransaction Telegram Bot API: StarTransaction}
 */
export interface StarTransaction {
  /** Unique identifier of the transaction. */
  id: string;
  /** Number of Telegram Stars transferred by the transaction. */
  amount: number;
  /** The number of 1/1000000000 shares of Telegram Stars transferred by the transaction; from 0 to 999999999. */
  nanostar_amount?: number;
  /** Date the transaction was created in Unix time. */
  date: number;
  /** Source of an incoming transaction (e.g., a user purchasing goods or services, Fragment refunding a suspended fee); for incoming transactions only. */
  source?: TransactionPartner;
  /** Receiver of an outgoing transaction (e.g., a user for a purchase, Fragment for a withdrawal); for outgoing transactions only. */
  receiver?: TransactionPartner;
}

/**
 * Contains a list of Telegram Star transactions.
 *
 * @see {@link https://core.telegram.org/bots/api#startransactions Telegram Bot API: StarTransactions}
 */
export interface StarTransactions {
  /** The list of transactions. */
  transactions: StarTransaction[];
}
