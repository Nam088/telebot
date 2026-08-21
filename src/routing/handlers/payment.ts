/**
 * Handlers for Telegram Payments, Invoicing, and Paid Media updates.
 *
 * @packageDocumentation
 */

import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Handler for incoming pre-checkout queries (`pre_checkout_query` updates).
 *
 * Allows validating shipping information and confirming the final order before payment processing.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const handler = new PreCheckoutQueryHandler(async (update, context) => {
 *   await context.bot.answerPreCheckoutQuery({
 *     pre_checkout_query_id: update.pre_checkout_query!.id,
 *     ok: true,
 *   });
 * });
 * ```
 */
export class PreCheckoutQueryHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Checks whether the incoming update contains a `pre_checkout_query`.
   *
   * @param update - The update to test.
   * @returns `true` if update has `pre_checkout_query`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.pre_checkout_query);
  }
}

/**
 * Handler for incoming shipping queries (`shipping_query` updates).
 *
 * Allows providing available shipping options based on the delivery address provided by the user.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const handler = new ShippingQueryHandler(async (update, context) => {
 *   await context.bot.answerShippingQuery({
 *     shipping_query_id: update.shipping_query!.id,
 *     ok: true,
 *     shipping_options: [
 *       { id: "std", title: "Standard Delivery", prices: [{ label: "Shipping", amount: 200 }] },
 *     ],
 *   });
 * });
 * ```
 */
export class ShippingQueryHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Checks whether the incoming update contains a `shipping_query`.
   *
   * @param update - The update to test.
   * @returns `true` if update has `shipping_query`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.shipping_query);
  }
}

/**
 * Handler for purchased paid media events (`purchased_paid_media` updates).
 *
 * Triggered when a user buys paid media using Telegram Stars.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const handler = new PurchasedPaidMediaHandler(async (update, context) => {
 *   console.log(`User ${update.effective_user?.id} bought media payload: ${update.purchased_paid_media?.paid_media_payload}`);
 * });
 * ```
 */
export class PurchasedPaidMediaHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Checks whether the incoming update contains a `purchased_paid_media` event.
   *
   * @param update - The update to test.
   * @returns `true` if update has `purchased_paid_media`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.purchased_paid_media);
  }
}
