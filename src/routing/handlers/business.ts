/**
 * Handlers for Telegram Business Connection and Business Message updates.
 *
 * @packageDocumentation
 */

import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Handler for Telegram Business account connection changes (`business_connection` updates).
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const handler = new BusinessConnectionHandler(async (update, context) => {
 *   console.log("Business account connected:", update.business_connection?.id);
 * });
 * ```
 */
export class BusinessConnectionHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Checks whether the incoming update contains a `business_connection`.
   *
   * @param update - The update to test.
   * @returns `true` if update has `business_connection`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.business_connection);
  }
}

/**
 * Handler for messages in connected Telegram Business accounts.
 *
 * Catches `business_message`, `edited_business_message`, and `deleted_business_messages`.
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 *
 * @example
 * ```ts
 * const handler = new BusinessMessagesHandler(async (update, context) => {
 *   if (update.business_message) {
 *     console.log("New business message received:", update.business_message.text);
 *   }
 * });
 * ```
 */
export class BusinessMessagesHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Checks whether the incoming update is a business message event.
   *
   * @param update - The update to test.
   * @returns `true` if update is a business message event.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(
      update.business_message || update.edited_business_message || update.deleted_business_messages,
    );
  }
}
