import type { StarAmount, SuggestedPostPrice } from "../payments/index.js";
import type { Message } from "./core.js";

/**
 * Contains information about a suggested post.
 *
 * @see {@link https://core.telegram.org/bots/api#suggestedpostinfo Telegram Bot API: SuggestedPostInfo}
 */
export interface SuggestedPostInfo {
  /** State of the suggested post. Currently, it can be one of "pending", "approved", "declined". */
  state: string;
  /** Proposed price of the post. If the field is omitted, then the post is unpaid. */
  price?: SuggestedPostPrice;
  /**
   * Proposed send date of the post.
   *
   * @remarks
   * If the field is omitted, then the post can be published at any time within 30 days at the sole
   * discretion of the user or administrator who approves it.
   */
  send_date?: number;
}

/**
 * Describes a service message about a successful payment for a suggested post.
 *
 * @see {@link https://core.telegram.org/bots/api#suggestedpostpaid Telegram Bot API: SuggestedPostPaid}
 */
export interface SuggestedPostPaid {
  /**
   * Message containing the suggested post.
   *
   * @remarks
   * The `Message` object in this field will not contain the `reply_to_message` field even if it itself
   * is a reply.
   */
  suggested_post_message?: Message;
  /** Currency in which the payment was made. Currently, one of "XTR" for Telegram Stars or "TON" for TON grams. */
  currency: string;
  /** The amount of the currency that was received by the channel in nanograms; for payments in TON grams only. */
  amount?: number;
  /** The amount of Telegram Stars that was received by the channel; for payments in Telegram Stars only. */
  star_amount?: StarAmount;
}

/**
 * Describes a service message about a payment refund for a suggested post.
 *
 * @see {@link https://core.telegram.org/bots/api#suggestedpostrefunded Telegram Bot API: SuggestedPostRefunded}
 */
export interface SuggestedPostRefunded {
  /**
   * Message containing the suggested post.
   *
   * @remarks
   * The `Message` object in this field will not contain the `reply_to_message` field even if it itself
   * is a reply.
   */
  suggested_post_message?: Message;
  /**
   * Reason for the refund.
   *
   * @remarks
   * Currently, one of "post_deleted" if the post was deleted within 24 hours of being posted or removed
   * from scheduled messages without being posted, or "payment_refunded" if the payer refunded their
   * payment.
   */
  reason: string;
}

/**
 * Describes a service message about the approval of a suggested post.
 *
 * @see {@link https://core.telegram.org/bots/api#suggestedpostapproved Telegram Bot API: SuggestedPostApproved}
 */
export interface SuggestedPostApproved {
  /**
   * Message containing the suggested post.
   *
   * @remarks
   * The `Message` object in this field will not contain the `reply_to_message` field even if it itself
   * is a reply.
   */
  suggested_post_message?: Message;
  /** Amount paid for the post. */
  price?: SuggestedPostPrice;
  /** Date when the post will be published. */
  send_date: number;
}

/**
 * Describes a service message about the failed approval of a suggested post.
 *
 * @remarks
 * Currently, only caused by insufficient funds of the bot's business account.
 *
 * @see {@link https://core.telegram.org/bots/api#suggestedpostapprovalfailed Telegram Bot API: SuggestedPostApprovalFailed}
 */
export interface SuggestedPostApprovalFailed {
  /**
   * Message containing the suggested post whose approval has failed.
   *
   * @remarks
   * The `Message` object in this field will not contain the `reply_to_message` field even if it itself
   * is a reply.
   */
  suggested_post_message?: Message;
  /** Expected price of the post. */
  price: SuggestedPostPrice;
}

/**
 * Describes a service message about the rejection of a suggested post.
 *
 * @see {@link https://core.telegram.org/bots/api#suggestedpostdeclined Telegram Bot API: SuggestedPostDeclined}
 */
export interface SuggestedPostDeclined {
  /**
   * Message containing the suggested post.
   *
   * @remarks
   * The `Message` object in this field will not contain the `reply_to_message` field even if it itself
   * is a reply.
   */
  suggested_post_message?: Message;
  /** Comment with which the post was declined. */
  comment?: string;
}
