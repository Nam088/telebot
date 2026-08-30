import type { User } from "./models.js";

/**
 * This object contains information about changes to a user payment subscription toward the current bot.
 *
 * @see {@link https://core.telegram.org/bots/api#botsubscriptionupdated Telegram Bot API: BotSubscriptionUpdated}
 */
export interface BotSubscriptionUpdated {
  /** User who subscribed for payments toward the bot. */
  user: User;
  /** Bot-specified invoice payload. */
  invoice_payload: string;
  /**
   * The new state of the subscription.
   *
   * @remarks
   * Currently, it can be one of "canceled" if the user canceled the subscription, "active" if the user
   * re-enabled a previously canceled subscription, or "failed" if payment for the subscription failed.
   */
  state: "canceled" | "active" | "failed" | string;
}

/**
 * This object contains information about the creation, token update, or owner update of a bot that is
 * managed by the current bot.
 *
 * @see {@link https://core.telegram.org/bots/api#managedbotupdated Telegram Bot API: ManagedBotUpdated}
 */
export interface ManagedBotUpdated {
  /** User that created the bot. */
  user: User;
  /** Information about the bot. Token of the bot can be fetched using the method getManagedBotToken. */
  bot: User;
}
