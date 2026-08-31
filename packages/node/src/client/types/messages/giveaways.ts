import type { Chat, User } from "../common/index.js";
import type { Message } from "./core.js";

/**
 * This object represents a message about a scheduled giveaway.
 *
 * @see {@link https://core.telegram.org/bots/api#giveaway Telegram Bot API: Giveaway}
 */
export interface Giveaway {
  /** The list of chats which the user must join to participate in the giveaway. */
  chats: Chat[];
  /** Point in time (Unix timestamp) when winners of the giveaway will be selected. */
  winners_selection_date: number;
  /** The number of users which are supposed to be selected as winners of the giveaway. */
  winner_count: number;
  /** True, if only users who join the chats after the giveaway started should be eligible to win. */
  only_new_members?: boolean;
  /** True, if the list of giveaway winners will be visible to everyone. */
  has_public_winners?: boolean;
  /** Description of additional giveaway prize. */
  prize_description?: string;
  /**
   * A list of two-letter ISO 3166-1 alpha-2 country codes indicating the countries from which eligible
   * users for the giveaway must come.
   *
   * @remarks
   * If empty, then all users can participate in the giveaway. Users with a phone number that was bought
   * on Fragment can always participate in giveaways.
   */
  country_codes?: string[];
  /** The number of Telegram Stars to be split between giveaway winners; for Telegram Star giveaways only. */
  prize_star_count?: number;
  /** The number of months the Telegram Premium subscription won from the giveaway will be active for; for Telegram Premium giveaways only. */
  premium_subscription_month_count?: number;
}

/**
 * This object represents a service message about the creation of a scheduled giveaway.
 *
 * @see {@link https://core.telegram.org/bots/api#giveawaycreated Telegram Bot API: GiveawayCreated}
 */
export interface GiveawayCreated {
  /** The number of Telegram Stars to be split between giveaway winners; for Telegram Star giveaways only. */
  prize_star_count?: number;
}

/**
 * This object represents a message about the completion of a giveaway with public winners.
 *
 * @see {@link https://core.telegram.org/bots/api#giveawaywinners Telegram Bot API: GiveawayWinners}
 */
export interface GiveawayWinners {
  /** The chat that created the giveaway. */
  chat: Chat;
  /** Identifier of the message with the giveaway in the chat. */
  giveaway_message_id: number;
  /** Point in time (Unix timestamp) when winners of the giveaway were selected. */
  winners_selection_date: number;
  /** Total number of winners in the giveaway. */
  winner_count: number;
  /** List of up to 100 winners of the giveaway. */
  winners: User[];
  /** The number of other chats the user had to join in order to be eligible for the giveaway. */
  additional_chat_count?: number;
  /** The number of Telegram Stars that were split between giveaway winners; for Telegram Star giveaways only. */
  prize_star_count?: number;
  /** The number of months the Telegram Premium subscription won from the giveaway will be active for; for Telegram Premium giveaways only. */
  premium_subscription_month_count?: number;
  /** Number of undistributed prizes. */
  unclaimed_prize_count?: number;
  /** True, if only users who had joined the chats after the giveaway started were eligible to win. */
  only_new_members?: boolean;
  /** True, if the giveaway was canceled because the payment for it was refunded. */
  was_refunded?: boolean;
  /** Description of additional giveaway prize. */
  prize_description?: string;
}

/**
 * This object represents a service message about the completion of a giveaway without public winners.
 *
 * @see {@link https://core.telegram.org/bots/api#giveawaycompleted Telegram Bot API: GiveawayCompleted}
 */
export interface GiveawayCompleted {
  /** Number of winners in the giveaway. */
  winner_count: number;
  /** Number of undistributed prizes. */
  unclaimed_prize_count?: number;
  /** Message with the giveaway that was completed, if it wasn't deleted. */
  giveaway_message?: Message;
  /** True, if the giveaway is a Telegram Star giveaway. Otherwise, currently, the giveaway is a Telegram Premium giveaway. */
  is_star_giveaway?: boolean;
}
