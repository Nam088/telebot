import type { ChatType } from "../../constants.js";
import type {
  BusinessIntro,
  BusinessLocation,
  BusinessOpeningHours,
  CallbackQuery,
  InlineQuery,
  ChosenInlineResult,
  ChatBoostUpdated,
  ChatBoostRemoved,
  BusinessConnection,
  BusinessMessagesDeleted,
} from "../business/index.js";
import type {
  ChatPermissions,
  ChatLocation,
  ChatMemberUpdated,
  ChatJoinRequest,
} from "../chats/index.js";
import type {
  Message,
  PhotoSize,
  Poll,
  PollAnswer,
  MessageReactionUpdated,
  MessageReactionCountUpdated,
  ReactionType,
  WebAppInfo,
} from "../messages/index.js";
import type { ShippingQuery, PreCheckoutQuery, PurchasedPaidMedia } from "../payments/index.js";
import type { BotSubscriptionUpdated, ManagedBotUpdated } from "./update-payloads.js";

/**
 * @see {@link https://core.telegram.org/bots/api#user Telegram Bot API: User}
 */
export interface User {
  /** Unique identifier for this user or bot. */
  id: number;
  /** True, if this user is a bot. */
  is_bot: boolean;
  /** User's or bot's first name. */
  first_name: string;
  /** User's or bot's last name. */
  last_name?: string;
  /** User's or bot's username without leading '@'. */
  username?: string;
  /** IETF language tag of the user's language (e.g. 'en', 'vi'). */
  language_code?: string;
  /** True, if this user is a Telegram Premium user. */
  is_premium?: boolean;
  /** True, if this user added the bot to the attachment menu. */
  added_to_attachment_menu?: boolean;
  /** True, if the bot can be invited to groups. Returned only in getMe. */
  can_join_groups?: boolean;
  /** True, if privacy mode is disabled for the bot in groups. Returned only in getMe. */
  can_read_all_group_messages?: boolean;
  /** True, if the bot supports inline queries. Returned only in getMe. */
  supports_inline_queries?: boolean;
  /** True, if the bot can be connected to a Telegram Business account. Returned only in getMe. */
  can_connect_to_business?: boolean;
  /** True, if the bot has a main Web App. Returned only in getMe. */
  has_main_web_app?: boolean;
  /** True, if the bot supports guest queries from chats it is not a member of. Returned only in getMe. */
  supports_guest_queries?: boolean;
  /** True, if the bot has forum topic mode enabled in private chats. Returned only in getMe. */
  has_topics_enabled?: boolean;
  /** True, if the bot allows users to create and delete topics in private chats. Returned only in getMe. */
  allows_users_to_create_topics?: boolean;
  /** True, if other bots can be created to be controlled by the bot. Returned only in getMe. */
  can_manage_bots?: boolean;
  /** True, if the bot supports join request queries and can be assigned to process them. Returned only in getMe. */
  supports_join_request_queries?: boolean;
}

/**
 * @see {@link https://core.telegram.org/bots/api#birthdate Telegram Bot API: Birthdate}
 */
export interface Birthdate {
  /** Day of the user's birth; 1-31. */
  day: number;
  /** Month of the user's birth; 1-12. */
  month: number;
  /** Year of the user's birth. */
  year?: number;
}

/**
 * @see {@link https://core.telegram.org/bots/api#chat Telegram Bot API: Chat}
 */
export interface Chat {
  /** Unique identifier for this chat (integer or channel username string). */
  id: number | string;
  /** Type of the chat, can be 'private', 'group', 'supergroup', or 'channel'. */
  type: ChatType;
  /** Title, for supergroups, channels and group chats. */
  title?: string;
  /** Username, for private chats, supergroups and channels if available. */
  username?: string;
  /** First name of the other party in a private chat. */
  first_name?: string;
  /** Last name of the other party in a private chat. */
  last_name?: string;
  /** True, if the supergroup chat is a forum (has topics enabled). */
  is_forum?: boolean;
  /** True, if the chat is the direct messages chat of a channel. */
  is_direct_messages?: boolean;
  /** Chat photo. */
  photo?: ChatPhoto;
  /** If non-empty, the list of all active chat usernames. */
  active_usernames?: string[];
  /** For private chats, the date of birth of the user. */
  birthdate?: Birthdate;
  /** For private chats with business accounts, the intro of the business. */
  business_intro?: BusinessIntro;
  /** For private chats with business accounts, the location of the business. */
  business_location?: BusinessLocation;
  /** For private chats with business accounts, the opening hours of the business. */
  business_opening_hours?: BusinessOpeningHours;
  /** For private chats, the personal channel of the user. */
  personal_chat?: Chat;
  /** List of available reactions allowed in the chat. */
  available_reactions?: ReactionType[];
  /** Identifier of the accent color for the chat name and backgrounds. */
  accent_color_id?: number;
  /** Custom emoji identifier of emoji chosen for chat background. */
  background_custom_emoji_id?: string;
  /** Identifier of the accent color for the chat's profile. */
  profile_accent_color_id?: number;
  /** Custom emoji identifier of emoji chosen for chat profile background. */
  profile_background_custom_emoji_id?: string;
  /** Custom emoji identifier of the emoji status. */
  emoji_status_custom_emoji_id?: string;
  /** Expiration date of the emoji status of the chat partner in Unix time. */
  emoji_status_expiration_date?: number;
  /** Bio of the other party in a private chat. */
  bio?: string;
  /** True, if privacy settings of the other party in the private chat forbid forwarding messages. */
  has_private_forwards?: boolean;
  /** True, if the privacy settings of the other party restrict sending voice and video notes. */
  has_restricted_voice_and_video_messages?: boolean;
  /** True, if users need to join the supergroup before they can send messages. */
  join_to_send_messages?: boolean;
  /** True, if all new members must be approved by chat administrators. */
  join_by_request?: boolean;
  /** Description, for groups, supergroups and channel chats. */
  description?: string;
  /** Primary invite link, for groups, supergroups and channel chats. */
  invite_link?: string;
  /** The most recent pinned message (by sending date) in the chat. */
  pinned_message?: Message;
  /** Default chat member permissions, for groups and supergroups. */
  permissions?: ChatPermissions;
  /** For supergroups, the minimum allowed interval between messages in seconds. */
  slow_mode_delay?: number;
  /** For supergroups, the minimum number of boosts needed to bypass slow mode. */
  unrestrict_boost_count?: number;
  /** Time in seconds after which messages are automatically deleted in the chat. */
  message_auto_delete_time?: number;
  /** True, if aggressive anti-spam checks are enabled in the supergroup. */
  has_aggressive_anti_spam_enabled?: boolean;
  /** True, if non-administrators can only see the list of bot administrators in the chat. */
  has_hidden_members?: boolean;
  /** True, if messages from the chat can't be forwarded to other chats. */
  has_protected_content?: boolean;
  /** True, if new chat members will see historical messages. */
  has_visible_history?: boolean;
  /** For supergroups, name of the group sticker set. */
  sticker_set_name?: string;
  /** True, if the bot can change the group sticker set. */
  can_set_sticker_set?: boolean;
  /** For supergroups, name of the custom emoji sticker set. */
  custom_emoji_sticker_set_name?: string;
  /** Unique identifier for the linked discussion chat for channels. */
  linked_chat_id?: number;
  /** For supergroups, the location to which the supergroup is connected. */
  location?: ChatLocation;
}

/**
 * @see {@link https://core.telegram.org/bots/api#chatphoto Telegram Bot API: ChatPhoto}
 */
export interface ChatPhoto {
  /** File identifier of small (160x160) chat photo. */
  small_file_id: string;
  /** Unique file identifier of small (160x160) chat photo. */
  small_file_unique_id: string;
  /** File identifier of big (640x640) chat photo. */
  big_file_id: string;
  /** Unique file identifier of big (640x640) chat photo. */
  big_file_unique_id: string;
}

/**
 * Represents an HTTP link.
 *
 * @see {@link https://core.telegram.org/bots/api#link Telegram Bot API: Link}
 */
export interface Link {
  /** URL of the link. */
  url: string;
}

/**
 * @see {@link https://core.telegram.org/bots/api#location Telegram Bot API: Location}
 */
export interface Location {
  /** Latitude as defined by sender. */
  latitude: number;
  /** Longitude as defined by sender. */
  longitude: number;
  /** The radius of uncertainty for the location, measured in meters; 0-1500. */
  horizontal_accuracy?: number;
  /** Time relative to the message sending date, during which the location can be updated; in seconds. */
  live_period?: number;
  /** The direction in which user is moving, in degrees; 1-360. */
  heading?: number;
  /** The maximum distance for proximity alerts about approaching another chat member, in meters. */
  proximity_alert_radius?: number;
}

/**
 * Describes the address of a location.
 *
 * @see {@link https://core.telegram.org/bots/api#locationaddress Telegram Bot API: LocationAddress}
 */
export interface LocationAddress {
  /** Two-letter ISO 3166-1 alpha-2 country code. */
  country_code: string;
  /** State, if available. */
  state?: string;
  /** City, if available. */
  city?: string;
  /** Street, if available. */
  street?: string;
}

/**
 * @see {@link https://core.telegram.org/bots/api#userprofilephotos Telegram Bot API: UserProfilePhotos}
 */
export interface UserProfilePhotos {
  /** Total number of profile pictures the target user has. */
  total_count: number;
  /** Requested profile pictures (in up to 4 sizes each). */
  photos: PhotoSize[][];
}

/**
 * @see {@link https://core.telegram.org/bots/api#file Telegram Bot API: File}
 */
export interface File {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** File size in bytes. */
  file_size?: number;
  /** File path. Use https://api.telegram.org/file/bot<token>/<file_path> to get the file. */
  file_path?: string;
}

/**
 * @see {@link https://core.telegram.org/bots/api#webhookinfo Telegram Bot API: WebhookInfo}
 */
export interface WebhookInfo {
  /** HTTPS URL to which Telegram sends updates. If empty, webhook is not set up. */
  url: string;
  /** True, if a custom certificate was provided for webhook certificate checks. */
  has_custom_certificate: boolean;
  /** Number of updates awaiting delivery. */
  pending_update_count: number;
  /** Currently used IP address for webhook connections. */
  ip_address?: string;
  /** Unix time for the most recent error that happened when trying to deliver an update via webhook. */
  last_error_date?: number;
  /** Error message in human-readable format for the most recent error. */
  last_error_message?: string;
  /** Unix time of the most recent error that happened when trying to synchronize available updates with Telegram datacenters. */
  last_synchronization_error_date?: number;
  /** The maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery. */
  max_connections?: number;
  /** A list of update types the bot is subscribed to. Defaults to all update types except chat_member. */
  allowed_updates?: string[];
}

export interface RawUpdate {
  /** The update's unique identifier. Update identifiers start from a certain positive number and increase sequentially. */
  update_id: number;
  /** New incoming message of any kind - text, photo, sticker, etc. */
  message?: Message;
  /** New version of a message that is known to the bot and was edited. */
  edited_message?: Message;
  /** New incoming channel post of any kind - text, photo, sticker, etc. */
  channel_post?: Message;
  /** New version of a channel post that is known to the bot and was edited. */
  edited_channel_post?: Message;
  /** The bot was connected to or disconnected from a business account, or a user edited an existing connection with the bot. */
  business_connection?: BusinessConnection;
  /** New message from a connected business account. */
  business_message?: Message;
  /** New version of a message from a connected business account. */
  edited_business_message?: Message;
  /** Messages were deleted from a connected business account. */
  deleted_business_messages?: BusinessMessagesDeleted;
  /** New guest message. */
  guest_message?: Message;
  /** A reaction to a message was changed by a user. */
  message_reaction?: MessageReactionUpdated;
  /** Reactions to a message with anonymous reactions were changed. */
  message_reaction_count?: MessageReactionCountUpdated;
  /** New incoming inline query. */
  inline_query?: InlineQuery;
  /** The result of an inline query that was chosen by a user and sent to their chat partner. */
  chosen_inline_result?: ChosenInlineResult;
  /** New incoming callback query. */
  callback_query?: CallbackQuery;
  /** New incoming shipping query. Only for invoices with flexible prices. */
  shipping_query?: ShippingQuery;
  /** New incoming pre-checkout query. Contains full information about checkout. */
  pre_checkout_query?: PreCheckoutQuery;
  /** New poll state. Bots receive only updates about stopped polls and polls, which are sent by the bot. */
  poll?: Poll;
  /** A user changed their answer in a non-anonymous poll. Bots receive new votes only in polls that were sent by the bot itself. */
  poll_answer?: PollAnswer;
  /** The bot's chat member status was updated in a chat. */
  my_chat_member?: ChatMemberUpdated;
  /** A chat member's status was updated in a chat. */
  chat_member?: ChatMemberUpdated;
  /** A request to join the chat has been sent. */
  chat_join_request?: ChatJoinRequest;
  /** A chat boost was added or changed. */
  chat_boost?: ChatBoostUpdated;
  /** A boost was removed from a chat. */
  removed_chat_boost?: ChatBoostRemoved;
  /** A new bot was created to be managed by the bot, or the token or owner of a managed bot was changed. */
  managed_bot?: ManagedBotUpdated;
  /** A user payment subscription toward the bot has changed. */
  subscription?: BotSubscriptionUpdated;
  /** A user purchased paid media with Telegram Stars. */
  purchased_paid_media?: PurchasedPaidMedia;
  /** A user asked the bot to stop the generation of a message (Bot API 10.3+). */
  stopped_message_generation?: MessageGenerationStopped;
}

/**
 * Describes an update about a user stopping message generation (Bot API 10.3+).
 *
 * @see {@link https://core.telegram.org/bots/api#messagegenerationstopped Telegram Bot API: MessageGenerationStopped}
 */
export interface MessageGenerationStopped {
  /** Chat in which the message is generated. */
  chat: Chat;
  /** Unique identifier of the message thread in which the message is generated. */
  message_thread_id?: number;
  /** Unique identifier of the message draft which was stopped. */
  draft_id: number;
}

/**
 * Represents a button to be shown above inline query results.
 *
 * @see {@link https://core.telegram.org/bots/api#inlinequeryresultsbutton Telegram Bot API: InlineQueryResultsButton}
 */
export interface InlineQueryResultsButton {
  /** Label text on the button. */
  text: string;
  /** Description of the Web App that will be launched when the user presses the button. */
  web_app?: WebAppInfo;
  /** Deep-linking parameter for the /start message sent to the bot when a user presses the button. */
  start_parameter?: string;
}

/**
 * Generic response wrapper returned by the Telegram Bot API.
 *
 * @typeParam T - The unwrapped result payload type returned on success.
 */
export interface ApiResponse<T = unknown> {
  /** True, if the request was successful. */
  ok: boolean;
  /** Result payload if the request succeeded. */
  result?: T;
  /** Numeric error code if the request was unsuccessful. */
  error_code?: number;
  /** Human-readable explanation of why the request was unsuccessful. */
  description?: string;
  /** Additional parameters which can help to automatically handle the error. */
  parameters?: {
    /** Number of seconds to wait before repeating the request. */
    retry_after?: number;
    /** The group has been migrated to a supergroup with this identifier. */
    migrate_to_chat_id?: number;
  };
}

export class TelegramApiError extends Error {
  /**
   * Telegram Bot API numeric error code (e.g. `400`, `401`, `403`, `429`).
   */
  public readonly error_code: number;

  /**
   * Human-readable description of the error returned by Telegram.
   */
  public readonly description: string;

  /**
   * Optional extra response parameters returned by Telegram (e.g. rate limit retry or chat migration info).
   */
  public readonly parameters?: {
    /**
     * Number of seconds to wait before repeating the request.
     */
    retry_after?: number;
    /**
     * The group has been migrated to a supergroup with this identifier.
     */
    migrate_to_chat_id?: number;
  };

  /**
   * Constructs a new {@link TelegramApiError}.
   *
   * @param error_code - The numeric error code from the Telegram response.
   * @param description - The error description string.
   * @param parameters - Optional extra parameter payload from Telegram.
   */
  constructor(
    error_code: number,
    description: string,
    parameters?: { retry_after?: number; migrate_to_chat_id?: number },
  ) {
    super(`Telegram API Error ${error_code}: ${description}`);
    this.name = "TelegramApiError";
    this.error_code = error_code;
    this.description = description;
    this.parameters = parameters;
    Object.setPrototypeOf(this, TelegramApiError.prototype);
  }
}
