import type { ParseMode } from "../../constants.js";
import type { MessageEntity, KeyboardButton } from "../messages/index.js";
import type { AcceptedGiftTypes } from "./models.js";
import type { InlineQueryResult } from "./unions.js";

/**
 * Options for {@link Bot.giftPremiumSubscription}.
 *
 * @remarks
 * `month_count` must be one of 3, 6, 12 and `star_count` must match the price
 * Telegram charges for that duration (1000, 1500 and 2500 Stars respectively).
 *
 * @see {@link https://core.telegram.org/bots/api#giftpremiumsubscription Telegram Bot API: giftPremiumSubscription}
 */
export interface GiftPremiumSubscriptionOptions {
  /** Unique identifier of the target user. */
  user_id: number;
  /** Number of months the subscription will be active; one of 3, 6, 12. */
  month_count: number;
  /** Number of Telegram Stars to pay for the subscription. */
  star_count: number;
  /** Text shown along with the service message about the subscription; 0-128 characters. */
  text?: string;
  /** Mode for parsing entities in the text. */
  text_parse_mode?: ParseMode | string;
  /** A list of special entities that appear in the text; can be specified instead of text_parse_mode. */
  text_entities?: MessageEntity[];
}

/**
 * Options for {@link Bot.setBusinessAccountGiftSettings} (excludes the positional `business_connection_id`).
 *
 * @see {@link https://core.telegram.org/bots/api#setbusinessaccountgiftsettings Telegram Bot API: setBusinessAccountGiftSettings}
 */
export interface SetBusinessAccountGiftSettingsOptions {
  /** Pass True to show a button with the list of gifts and the Star balance on the business profile. */
  show_gift_button: boolean;
  /** An {@link AcceptedGiftTypes} object describing which gifts the business account is willing to accept. */
  accepted_gift_types: AcceptedGiftTypes;
}

/**
 * Options for {@link Bot.createChatSubscriptionInviteLink} (excludes the positional `chat_id`).
 *
 * @see {@link https://core.telegram.org/bots/api#createchatsubscriptioninvitelink Telegram Bot API: createChatSubscriptionInviteLink}
 */
export interface CreateChatSubscriptionInviteLinkOptions {
  /** Number of seconds the subscription will be active for before the next payment; 30-31536000. */
  subscription_period: number;
  /** Number of Telegram Stars that must be paid to subscribe after the initial period; 1-2500. */
  subscription_price: number;
  /** Invite link name; 0-32 characters. */
  name?: string;
}

/**
 * Options for {@link Bot.editChatSubscriptionInviteLink} (excludes the positional `chat_id` and `invite_link`).
 *
 * @see {@link https://core.telegram.org/bots/api#editchatsubscriptioninvitelink Telegram Bot API: editChatSubscriptionInviteLink}
 */
export interface EditChatSubscriptionInviteLinkOptions {
  /** Invite link name; 0-32 characters. */
  name?: string;
}

/**
 * Options for {@link Bot.repostStory}.
 *
 * @remarks
 * `active_period` must be one of 21600, 43200, 86400, or 172800.
 *
 * @see {@link https://core.telegram.org/bots/api#repoststory Telegram Bot API: repostStory}
 */
export interface RepostStoryOptions {
  /** Unique identifier of the business connection on behalf of which the story will be reposted. */
  business_connection_id?: string;
  /** Unique identifier of the chat that posted the source story. */
  from_chat_id: number;
  /** Unique identifier of the source story. */
  from_story_id: number;
  /** Period after which the story is moved to the archive, in seconds. */
  active_period: number;
  /** Pass True if the story must be posted on the channel page. */
  post_to_chat_page?: boolean;
  /** Pass True if the content of the story must be protected from forwarding and saving. */
  protect_content?: boolean;
}

/**
 * Options for {@link Bot.savePreparedKeyboardButton}.
 *
 * @remarks
 * `button` must be a KeyboardButton of the type request_users, request_chat, or request_managed_bot.
 *
 * @see {@link https://core.telegram.org/bots/api#savepreparedkeyboardbutton Telegram Bot API: savePreparedKeyboardButton}
 */
export interface SavePreparedKeyboardButtonOptions {
  /** Unique identifier of the target user that can use the button. */
  user_id: number;
  /** A KeyboardButton object describing the button to save. */
  button: KeyboardButton;
}

/**
 * Options for {@link Bot.answerChatJoinRequestQuery}.
 *
 * @see {@link https://core.telegram.org/bots/api#answerchatjoinrequestquery Telegram Bot API: answerChatJoinRequestQuery}
 */
export interface AnswerChatJoinRequestQueryOptions {
  /** Unique identifier of the chat join request query to be answered. */
  chat_join_request_query_id: string;
  /** An object describing the result of the join request interaction. */
  result: InlineQueryResult;
}

/**
 * Options for {@link Bot.sendChatJoinRequestWebApp}.
 *
 * @see {@link https://core.telegram.org/bots/api#sendchatjoinrequestwebapp Telegram Bot API: sendChatJoinRequestWebApp}
 */
export interface SendChatJoinRequestWebAppOptions {
  /** Unique identifier of the chat join request query. */
  chat_join_request_query_id: string;
  /** An HTTPS URL of the Web App to open. */
  web_app_url: string;
}

/**
 * Options for {@link Bot.setManagedBotAccessSettings} (excludes the positional `user_id`).
 *
 * @see {@link https://core.telegram.org/bots/api#setmanagedbotaccesssettings Telegram Bot API: setManagedBotAccessSettings}
 */
export interface SetManagedBotAccessSettingsOptions {
  /** Pass True if the bot's access to private chats with users must be restricted to a subset of users. */
  is_access_restricted: boolean;
  /** Identifiers of users that are allowed to communicate with the managed bot; only applicable if is_access_restricted is True. */
  added_user_ids?: number[];
}
