/**
 * Invoices, Shipping, and Telegram Stars payment methods for Bot API.
 *
 * @packageDocumentation
 */

import { StickerMethods } from "./stickers.js";
import type {
  Message,
  SendInvoiceOptions,
  AnswerShippingQueryOptions,
  AnswerPreCheckoutQueryOptions,
  StarTransactions,
  StarAmount,
  Gifts,
  SendGiftOptions,
} from "../types.js";

/**
 * Mixin providing payment, invoicing, and Telegram Star transactions.
 */
export abstract class PaymentMethods extends StickerMethods {
  /**
   * Sends an invoice to a user or channel.
   *
   * @param options - Options including `chat_id`, `title`, `description`, `payload`, `currency`, and `prices`.
   * @returns The sent {@link Message} containing the invoice.
   * @throws {@link TelegramApiError} When sending invoice fails.
   *
   * @example
   * ```ts
   * await bot.sendInvoice({
   *   chat_id: 123456,
   *   title: "Premium Subscription",
   *   description: "1-month access",
   *   payload: "sub_premium_1m",
   *   currency: "XTR",
   *   prices: [{ label: "1 Month", amount: 100 }],
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#sendinvoice Telegram Bot API: sendInvoice}
   */
  public async sendInvoice(options: SendInvoiceOptions): Promise<Message> {
    return this.request<Message>("sendInvoice", options as unknown as Record<string, unknown>);
  }

  /**
   * Creates an HTTP link for an invoice that can be shared in messages or buttons.
   *
   * @param options - Invoice options without `chat_id`.
   * @returns The created invoice link as a string.
   * @throws {@link TelegramApiError} When link creation fails.
   *
   * @example
   * ```ts
   * const link = await bot.createInvoiceLink({
   *   title: "Donation",
   *   description: "Support development",
   *   payload: "donation_50",
   *   currency: "XTR",
   *   prices: [{ label: "Stars", amount: 50 }],
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#createinvoicelink Telegram Bot API: createInvoiceLink}
   */
  public async createInvoiceLink(options: Omit<SendInvoiceOptions, "chat_id">): Promise<string> {
    return this.request<string>("createInvoiceLink", options as unknown as Record<string, unknown>);
  }

  /**
   * Replies to an incoming shipping query.
   *
   * @param options - Options including `shipping_query_id`, `ok`, and optional `shipping_options` or `error_message`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When replying fails.
   *
   * @example
   * ```ts
   * await bot.answerShippingQuery({
   *   shipping_query_id: "sq_123",
   *   ok: true,
   *   shipping_options: [
   *     { id: "express", title: "Express (1-2 days)", prices: [{ label: "Express", amount: 500 }] },
   *   ],
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#answershippingquery Telegram Bot API: answerShippingQuery}
   */
  public async answerShippingQuery(options: AnswerShippingQueryOptions): Promise<boolean> {
    return this.request<boolean>(
      "answerShippingQuery",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Replies to an incoming pre-checkout query to confirm or cancel the order.
   *
   * @param options - Options including `pre_checkout_query_id`, `ok`, and optional `error_message`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When confirming/canceling fails.
   *
   * @example
   * ```ts
   * await bot.answerPreCheckoutQuery({
   *   pre_checkout_query_id: "pcq_123",
   *   ok: true,
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#answerprecheckoutquery Telegram Bot API: answerPreCheckoutQuery}
   */
  public async answerPreCheckoutQuery(options: AnswerPreCheckoutQueryOptions): Promise<boolean> {
    return this.request<boolean>(
      "answerPreCheckoutQuery",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Refunds a successful payment in Telegram Stars.
   *
   * @param userId - Identifier of the user who made the payment.
   * @param telegramPaymentChargeId - Telegram payment identifier.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When refund fails.
   *
   * @example
   * ```ts
   * await bot.refundStarPayment(123456, "tx_charge_123");
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#refundstarpayment Telegram Bot API: refundStarPayment}
   */
  public async refundStarPayment(
    userId: number,
    telegramPaymentChargeId: string,
  ): Promise<boolean> {
    return this.request<boolean>("refundStarPayment", {
      user_id: userId,
      telegram_payment_charge_id: telegramPaymentChargeId,
    });
  }

  /**
   * Retrieves the bot's Telegram Star transactions in chronological order.
   *
   * @param offset - Number of transactions to skip in the response.
   * @param limit - The maximum number of transactions to retrieve (1-100).
   * @returns A {@link StarTransactions} object.
   * @throws {@link TelegramApiError} When retrieving transactions fails.
   *
   * @example
   * ```ts
   * const txs = await bot.getStarTransactions(0, 20);
   * console.log(`Total transactions returned: ${txs.transactions.length}`);
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#getstartransactions Telegram Bot API: getStarTransactions}
   */
  public async getStarTransactions(offset?: number, limit?: number): Promise<StarTransactions> {
    const payload: Record<string, unknown> = {};
    if (offset !== undefined) payload["offset"] = offset;
    if (limit !== undefined) payload["limit"] = limit;
    return this.request<StarTransactions>("getStarTransactions", payload);
  }

  /**
   * Allows the bot to cancel or re-enable a subscription paid with Telegram Stars for a user.
   *
   * @param userId - Identifier of the user whose subscription will be edited.
   * @param telegramPaymentChargeId - Telegram payment identifier for the subscription charge.
   * @param isCanceled - Pass `true` to cancel the subscription, or `false` to re-enable.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When updating subscription status fails.
   *
   * @example
   * ```ts
   * await bot.editUserStarSubscription(123456, "sub_charge_123", true);
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#edituserstarsubscription Telegram Bot API: editUserStarSubscription}
   */
  public async editUserStarSubscription(
    userId: number,
    telegramPaymentChargeId: string,
    isCanceled: boolean,
  ): Promise<boolean> {
    return this.request<boolean>("editUserStarSubscription", {
      user_id: userId,
      telegram_payment_charge_id: telegramPaymentChargeId,
      is_canceled: isCanceled,
    });
  }

  /**
   * Retrieves the bot's current balance in Telegram Stars.
   *
   * @returns A {@link StarAmount} object containing `amount` and optional `nanostar_amount`.
   * @throws {@link TelegramApiError} When retrieving balance fails.
   *
   * @example
   * ```ts
   * const balance = await bot.getMyStarBalance();
   * console.log(`Current Stars: ${balance.amount}`);
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#getmystarbalance Telegram Bot API: getMyStarBalance}
   */
  public async getMyStarBalance(): Promise<StarAmount> {
    return this.request<StarAmount>("getMyStarBalance");
  }

  /**
   * Returns the list of gifts that can be sent by the bot to users and channel chats.
   *
   * @returns A {@link Gifts} object containing the available gifts.
   * @throws {@link TelegramApiError} When retrieving gifts fails.
   *
   * @example
   * ```ts
   * const gifts = await bot.getAvailableGifts();
   * console.log(`Available gifts count: ${gifts.gifts.length}`);
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#getavailablegifts Telegram Bot API: getAvailableGifts}
   */
  public async getAvailableGifts(): Promise<Gifts> {
    return this.request<Gifts>("getAvailableGifts");
  }

  /**
   * Sends a gift to the given user or channel chat.
   *
   * @param options - Options including `gift_id` and either `user_id` or `chat_id`, plus optional message `text`, `text_parse_mode`, `text_entities` and `pay_for_upgrade`.
   * @returns `true` on success.
   * @remarks Exactly one of `user_id` and `chat_id` must be provided. The gift can't be converted to Telegram Stars by the receiver.
   * @throws {@link TelegramApiError} When sending gift fails.
   *
   * @example
   * ```ts
   * await bot.sendGift({
   *   user_id: 123456,
   *   gift_id: "gift_abc123",
   *   text: "Enjoy your gift!",
   *   pay_for_upgrade: true,
   * });
   * ```
   *
   * @example
   * ```ts
   * // Send to a channel chat instead of a user
   * await bot.sendGift({ chat_id: "@my_channel", gift_id: "gift_abc123" });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#sendgift Telegram Bot API: sendGift}
   */
  public async sendGift(options: SendGiftOptions): Promise<boolean> {
    return this.request<boolean>("sendGift", options as unknown as Record<string, unknown>);
  }
}
