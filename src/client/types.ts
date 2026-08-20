/**
 * Telegram Bot API object types, interfaces, and error definitions.
 *
 * @packageDocumentation
 */

import type {
  ChatType,
  ParseMode,
  MessageEntityType,
  PollType,
  ChatMemberStatus,
  ChatAction,
} from "./constants.js";
import type { InputFile } from "../utils/http.js";

/**
 * Error thrown when a Telegram Bot API request returns a non-OK (`ok: false`) response.
 *
 * Encapsulates the HTTP status code / Telegram `error_code`, human-readable `description`,
 * and any optional response `parameters` such as `retry_after` and `migrate_to_chat_id`.
 *
 * @example
 * ```ts
 * try {
 *   await bot.sendMessage({ chat_id: 123, text: "Hello" });
 * } catch (err) {
 *   if (err instanceof TelegramApiError) {
 *     console.error(`Telegram error ${err.error_code}: ${err.description}`);
 *     if (err.parameters?.retry_after) {
 *       console.log(`Rate limited. Retry after ${err.parameters.retry_after}s`);
 *     }
 *   }
 * }
 * ```
 */
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
  constructor(error_code: number, description: string, parameters?: { retry_after?: number; migrate_to_chat_id?: number }) {
    super(`Telegram API Error ${error_code}: ${description}`);
    this.name = "TelegramApiError";
    this.error_code = error_code;
    this.description = description;
    this.parameters = parameters;
    Object.setPrototypeOf(this, TelegramApiError.prototype);
  }
}

/**
 * Represents a Telegram user or bot.
 */
export interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
  can_connect_to_business?: boolean;
  has_main_web_app?: boolean;
}

/**
 * Describes the birthdate of a user.
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
 * Describes the intro message of a business.
 */
export interface BusinessIntro {
  /** Title of the intro message. */
  title?: string;
  /** Text of the intro message. */
  message?: string;
  /** Sticker of the intro message. */
  sticker?: Sticker;
}

/**
 * Describes the location of a business.
 */
export interface BusinessLocation {
  /** Address of the business. */
  address: string;
  /** Location of the business. */
  location?: Location;
}

/**
 * Describes the opening hours interval of a business.
 */
export interface BusinessOpeningHoursInterval {
  /** The minute's sequence number in a week (0-10079) when the business opens in UTC+0. */
  opening_minute: number;
  /** The minute's sequence number in a week (1-10080) when the business closes in UTC+0. */
  closing_minute: number;
}

/**
 * Describes the opening hours of a business.
 */
export interface BusinessOpeningHours {
  /** Unique name of the time zone. */
  time_zone_name: string;
  /** List of time intervals during which the business is open. */
  opening_hours: BusinessOpeningHoursInterval[];
}

/**
 * Represents a Telegram chat (private conversation, group, supergroup, or channel).
 */
export interface Chat {
  id: number | string;
  type: ChatType;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_forum?: boolean;
  photo?: ChatPhoto;
  active_usernames?: string[];
  birthdate?: Birthdate;
  business_intro?: BusinessIntro;
  business_location?: BusinessLocation;
  business_opening_hours?: BusinessOpeningHours;
  personal_chat?: Chat;
  available_reactions?: unknown[];
  accent_color_id?: number;
  background_custom_emoji_id?: string;
  profile_accent_color_id?: number;
  profile_background_custom_emoji_id?: string;
  emoji_status_custom_emoji_id?: string;
  emoji_status_expiration_date?: number;
  bio?: string;
  has_private_forwards?: boolean;
  has_restricted_voice_and_video_messages?: boolean;
  join_to_send_messages?: boolean;
  join_by_request?: boolean;
  description?: string;
  invite_link?: string;
  pinned_message?: Message;
  permissions?: ChatPermissions;
  slow_mode_delay?: number;
  unrestrict_boost_count?: number;
  message_auto_delete_time?: number;
  has_aggressive_anti_spam_enabled?: boolean;
  has_hidden_members?: boolean;
  has_protected_content?: boolean;
  has_visible_history?: boolean;
  sticker_set_name?: string;
  can_set_sticker_set?: boolean;
  custom_emoji_sticker_set_name?: string;
  linked_chat_id?: number;
  location?: ChatLocation;
}

/**
 * Represents a chat photo profile picture.
 */
export interface ChatPhoto {
  small_file_id: string;
  small_file_unique_id: string;
  big_file_id: string;
  big_file_unique_id: string;
}

/**
 * Describes actions that a non-administrator user is allowed to take in a chat.
 */
export interface ChatPermissions {
  can_send_messages?: boolean;
  can_send_audios?: boolean;
  can_send_documents?: boolean;
  can_send_photos?: boolean;
  can_send_videos?: boolean;
  can_send_video_notes?: boolean;
  can_send_voice_notes?: boolean;
  can_send_polls?: boolean;
  can_send_other_messages?: boolean;
  can_add_web_page_previews?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
}

/**
 * Represents a location to which a chat is connected.
 */
export interface ChatLocation {
  location: Location;
  address: string;
}

/**
 * Represents a point on the map (geographic coordinates).
 */
export interface Location {
  latitude: number;
  longitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
}

/**
 * Represents one special entity in a text message (e.g. hashtags, usernames, URLs, formatting).
 */
export interface MessageEntity {
  type: MessageEntityType;
  offset: number;
  length: number;
  url?: string;
  user?: User;
  language?: string;
  custom_emoji_id?: string;
}

/**
 * Represents one size of a photo or a file / sticker thumbnail.
 */
export interface PhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

/**
 * Represents an audio file to be treated as music by the Telegram clients.
 */
export interface Audio {
  file_id: string;
  file_unique_id: string;
  duration: number;
  performer?: string;
  title?: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  thumbnail?: PhotoSize;
}

/**
 * Represents a general file (as opposed to photos or audio files).
 */
export interface Document {
  file_id: string;
  file_unique_id: string;
  thumbnail?: PhotoSize;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

/**
 * Represents a video file.
 */
export interface Video {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  thumbnail?: PhotoSize;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

/**
 * Represents an animation file (GIF or video without sound).
 */
export interface Animation {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  thumbnail?: PhotoSize;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

/**
 * Represents a voice note.
 */
export interface Voice {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

/**
 * Represents a video message (round video note).
 */
export interface VideoNote {
  file_id: string;
  file_unique_id: string;
  length: number;
  duration: number;
  thumbnail?: PhotoSize;
  file_size?: number;
}

/**
 * Represents a phone contact.
 */
export interface Contact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
  vcard?: string;
}

/**
 * Represents an animated emoji that displays a random value.
 */
export interface Dice {
  emoji: string;
  value: number;
}

/**
 * Contains information about one answer option in a poll.
 */
export interface PollOption {
  text: string;
  voter_count: number;
  text_entities?: MessageEntity[];
}

/**
 * Contains information about a poll.
 */
export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  total_voter_count: number;
  is_closed: boolean;
  is_anonymous: boolean;
  type: PollType;
  allows_multiple_answers: boolean;
  correct_option_id?: number;
  explanation?: string;
  explanation_entities?: MessageEntity[];
  open_period?: number;
  close_date?: number;
}

/**
 * Represents an answer of a user in a non-anonymous poll.
 */
export interface PollAnswer {
  poll_id: string;
  voter_chat?: Chat;
  user?: User;
  option_ids: number[];
}

/**
 * Represents a venue location with name and address.
 */
export interface Venue {
  location: Location;
  title: string;
  address: string;
  foursquare_id?: string;
  foursquare_type?: string;
  google_place_id?: string;
  google_place_type?: string;
}

/**
 * Describes the origin of a forwarded message.
 */
export interface MessageOrigin {
  type: "user" | "hidden_user" | "chat" | "channel";
  date: number;
  sender_user?: User;
  sender_user_name?: string;
  sender_chat?: Chat;
  author_signature?: string;
  message_id?: number;
}

/**
 * Contains information about a message that is being replied to, which may come from another chat or forum topic.
 */
export interface ExternalReplyInfo {
  origin: MessageOrigin;
  chat?: Chat;
  message_id?: number;
  link_preview_options?: unknown;
  animation?: Animation;
  audio?: Audio;
  document?: Document;
  photo?: PhotoSize[];
  sticker?: Sticker;
  story?: Story;
  video?: Video;
  video_note?: VideoNote;
  voice?: Voice;
  has_media_spoiler?: boolean;
  contact?: Contact;
  dice?: Dice;
  game?: Game;
  giveaway?: unknown;
  giveaway_winners?: unknown;
  invoice?: unknown;
  location?: Location;
  poll?: Poll;
  venue?: Venue;
}

/**
 * Contains information about the quoted part of a message that is replied to.
 */
export interface TextQuote {
  text: string;
  entities?: MessageEntity[];
  position: number;
  is_manual?: boolean;
}

/**
 * Describes the position of a story area.
 */
export interface StoryAreaPosition {
  /** The abscissa of the rectangle's center, as a percentage of the story width. */
  x_percentage: number;
  /** The ordinate of the rectangle's center, as a percentage of the story height. */
  y_percentage: number;
  /** The width of the rectangle, as a percentage of the story width. */
  width_percentage: number;
  /** The height of the rectangle, as a percentage of the story height. */
  height_percentage: number;
  /** Clockwise rotation angle of the rectangle, in degrees; 0-360. */
  rotation_angle: number;
  /** The radius of the rectangle corner rounding, as a percentage of the story width. */
  corner_radius_percentage: number;
}

/**
 * Describes the type of a story area.
 */
export type StoryAreaType =
  | { type: "location"; location: Location; address?: unknown }
  | { type: "suggested_reaction"; reaction_type: ReactionType; is_dark?: boolean; is_flipped?: boolean }
  | { type: "link"; url: string }
  | { type: "weather"; temperature_c: number; emoji: string; background_color: number };

/**
 * Describes a clickable or interactive area on a story.
 */
export interface StoryArea {
  /** Position of the story area. */
  position: StoryAreaPosition;
  /** Type of the story area. */
  type: StoryAreaType;
}

/**
 * Represents a Telegram story.
 */
export interface Story {
  /** Chat that posted the story. */
  chat: Chat;
  /** Unique identifier of the story in the chat. */
  id: number;
}

/**
 * Content of a story to be posted or edited using a photo.
 */
export interface InputStoryContentPhoto {
  /** Type of the content, must be photo. */
  type: "photo";
  /** File to send. Pass a file_id, HTTP URL, or upload via InputFile. */
  photo: string | InputFile;
}

/**
 * Content of a story to be posted or edited using a video.
 */
export interface InputStoryContentVideo {
  /** Type of the content, must be video. */
  type: "video";
  /** File to send. Pass a file_id, HTTP URL, or upload via InputFile. */
  video: string | InputFile;
  /** Precise duration of the video in seconds. */
  duration?: number;
  /** Cover image for the video. */
  cover?: string | InputFile;
  /** Timestamp in seconds from which the video will play. */
  timestamp?: number;
  /** Pass True if the video has no sound and should be looped. */
  is_animation?: boolean;
}

/**
 * Union of story content inputs.
 */
export type InputStoryContent = InputStoryContentPhoto | InputStoryContentVideo;

/**
 * Options passed to `postStory` requests.
 */
export interface PostStoryOptions {
  /** Period after which the story is moved to the archive, in seconds; must be one of 6 * 3600, 12 * 3600, 24 * 3600, or 48 * 3600. */
  active_period?: number;
  /** Identifier of the target chat to pin the story in. */
  pinned_peer_id?: number;
  /** Story caption, 0-1024 characters. */
  caption?: string;
  /** Mode for parsing entities in the story caption. */
  parse_mode?: ParseMode | string;
  /** List of special entities that appear in the story caption. */
  caption_entities?: MessageEntity[];
  /** List of story areas to add to the story. */
  areas?: StoryArea[];
  /** Pass True if the content of the story must be protected from forwarding and saving. */
  protect_content?: boolean;
}

/**
 * Options passed to `editStory` requests.
 */
export interface EditStoryOptions {
  /** Story caption, 0-1024 characters. */
  caption?: string;
  /** Mode for parsing entities in the story caption. */
  parse_mode?: ParseMode | string;
  /** List of special entities that appear in the story caption. */
  caption_entities?: MessageEntity[];
  /** List of story areas to add to the story. */
  areas?: StoryArea[];
}

/**
 * Represents one button of an inline keyboard.
 */
export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
  login_url?: unknown;
  switch_inline_query?: string;
  switch_inline_query_current_chat?: string;
  switch_inline_query_chosen_chat?: unknown;
  copy_text?: { text: string };
  callback_game?: CallbackGame;
  pay?: boolean;
}

/**
 * Represents an inline keyboard that appears right next to the message it belongs to.
 */
export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

/**
 * Represents one button of the reply keyboard.
 */
export interface KeyboardButton {
  text: string;
  request_users?: unknown;
  request_chat?: unknown;
  request_contact?: boolean;
  request_location?: boolean;
  request_poll?: { type?: string };
  web_app?: { url: string };
}

/**
 * Represents a custom keyboard with reply options.
 */
export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][];
  is_persistent?: boolean;
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  input_field_placeholder?: string;
  selective?: boolean;
}

/**
 * Instructs Telegram clients to remove the custom keyboard and display default keyboard.
 */
export interface ReplyKeyboardRemove {
  remove_keyboard: true;
  selective?: boolean;
}

/**
 * Instructs Telegram clients to display a reply interface to the user.
 */
export interface ForceReply {
  force_reply: true;
  input_field_placeholder?: string;
  selective?: boolean;
}

/**
 * Union type representing all supported Telegram reply markup structures.
 */
export type ReplyMarkup =
  | InlineKeyboardMarkup
  | ReplyKeyboardMarkup
  | ReplyKeyboardRemove
  | ForceReply;

/**
 * Represents a Telegram message.
 */
export interface Message {
  message_id: number;
  message_thread_id?: number;
  from?: User;
  sender_chat?: Chat;
  sender_boost_count?: number;
  sender_business_bot?: User;
  date: number;
  business_connection_id?: string;
  chat: Chat;
  forward_origin?: MessageOrigin;
  is_topic_message?: boolean;
  is_automatic_forward?: boolean;
  reply_to_message?: Message;
  external_reply?: ExternalReplyInfo;
  quote?: TextQuote;
  reply_to_story?: Story;
  via_bot?: User;
  edit_date?: number;
  has_protected_content?: boolean;
  is_from_offline?: boolean;
  media_group_id?: string;
  author_signature?: string;
  text?: string;
  entities?: MessageEntity[];
  link_preview_options?: unknown;
  animation?: Animation;
  audio?: Audio;
  document?: Document;
  photo?: PhotoSize[];
  sticker?: Sticker;
  story?: Story;
  video?: Video;
  video_note?: VideoNote;
  voice?: Voice;
  caption?: string;
  caption_entities?: MessageEntity[];
  show_caption_above_media?: boolean;
  has_media_spoiler?: boolean;
  contact?: Contact;
  dice?: Dice;
  game?: Game;
  poll?: Poll;
  venue?: Venue;
  location?: Location;
  new_chat_members?: User[];
  left_chat_member?: User;
  new_chat_title?: string;
  new_chat_photo?: PhotoSize[];
  delete_chat_photo?: boolean;
  group_chat_created?: boolean;
  supergroup_chat_created?: boolean;
  channel_chat_created?: boolean;
  message_auto_delete_timer_changed?: unknown;
  migrate_to_chat_id?: number;
  migrate_from_chat_id?: number;
  pinned_message?: Message;
  invoice?: Invoice;
  successful_payment?: SuccessfulPayment;
  refunded_payment?: RefundedPayment;
  users_shared?: unknown;
  chat_shared?: unknown;
  connected_website?: string;
  write_access_allowed?: unknown;
  passport_data?: PassportData;
  proximity_alert_triggered?: unknown;
  boost_added?: ChatBoostAdded;
  chat_background_set?: unknown;
  forum_topic_created?: unknown;
  forum_topic_edited?: unknown;
  forum_topic_closed?: unknown;
  forum_topic_reopened?: unknown;
  general_forum_topic_hidden?: unknown;
  general_forum_topic_unhidden?: unknown;
  giveaway_created?: unknown;
  giveaway?: unknown;
  giveaway_winners?: unknown;
  giveaway_completed?: unknown;
  video_chat_scheduled?: unknown;
  video_chat_started?: unknown;
  video_chat_ended?: unknown;
  video_chat_participants_invited?: unknown;
  web_app_data?: { data: string; button_text: string };
  reply_markup?: InlineKeyboardMarkup;
}

/**
 * Represents an incoming callback query from a callback button in an inline keyboard.
 */
export interface CallbackQuery {
  id: string;
  from: User;
  message?: Message;
  inline_message_id?: string;
  chat_instance: string;
  data?: string;
  game_short_name?: string;
}

/**
 * Represents an incoming inline query.
 */
export interface InlineQuery {
  id: string;
  from: User;
  query: string;
  offset: string;
  chat_type?: "sender" | "private" | "group" | "supergroup" | "channel";
  location?: Location;
}

/**
 * Represents a result of an inline query that was chosen by the user and sent to their chat partner.
 */
export interface ChosenInlineResult {
  result_id: string;
  from: User;
  location?: Location;
  inline_message_id?: string;
  query: string;
}

/**
 * Represents basic information about an invoice.
 */
export interface Invoice {
  /** Product name. */
  title: string;
  /** Product description. */
  description: string;
  /** Unique bot deep-linking parameter. */
  start_parameter: string;
  /** Three-letter ISO 4217 currency code or "XTR" for Telegram Stars. */
  currency: string;
  /** Total price in the smallest units of the currency. */
  total_amount: number;
}

/**
 * Represents information about an order.
 */
export interface OrderInfo {
  /** User name. */
  name?: string;
  /** User's phone number. */
  phone_number?: string;
  /** User's email. */
  email?: string;
  /** User's shipping address. */
  shipping_address?: ShippingAddress;
}

/**
 * Represents a shipping address.
 */
export interface ShippingAddress {
  /** Two-letter ISO 3166-1 alpha-2 country code. */
  country_code: string;
  /** State, if applicable. */
  state?: string;
  /** City. */
  city: string;
  /** First line for the address. */
  street_line1: string;
  /** Second line for the address. */
  street_line2?: string;
  /** Address post code. */
  post_code: string;
}

/**
 * Contains basic information about a successful payment.
 */
export interface SuccessfulPayment {
  /** Three-letter ISO 4217 currency code or "XTR". */
  currency: string;
  /** Total price in the smallest units of the currency. */
  total_amount: number;
  /** Bot specified invoice payload. */
  invoice_payload: string;
  /** Identifier of the shipping option chosen by the user. */
  shipping_option_id?: string;
  /** Order info provided by the user. */
  order_info?: OrderInfo;
  /** Telegram payment identifier. */
  telegram_payment_charge_id: string;
  /** Provider payment identifier. */
  provider_payment_charge_id: string;
  /** True, if the payment is a recurring subscription. */
  is_recurring?: boolean;
  /** True, if the payment is the first payment for a subscription. */
  is_first_recurring?: boolean;
}

/**
 * Contains basic information about a refunded payment.
 */
export interface RefundedPayment {
  /** Three-letter ISO 4217 currency code or "XTR". */
  currency: string;
  /** Total refunded price in the smallest units of the currency. */
  total_amount: number;
  /** Bot specified invoice payload. */
  invoice_payload: string;
  /** Telegram payment identifier. */
  telegram_payment_charge_id: string;
  /** Provider payment identifier. */
  provider_payment_charge_id?: string;
}

/**
 * Contains information about an incoming shipping query.
 */
export interface ShippingQuery {
  id: string;
  from: User;
  invoice_payload: string;
  shipping_address: ShippingAddress;
}

/**
 * Contains information about an incoming pre-checkout query.
 */
export interface PreCheckoutQuery {
  id: string;
  from: User;
  currency: string;
  total_amount: number;
  invoice_payload: string;
  shipping_option_id?: string;
  order_info?: OrderInfo;
}

/**
 * Represents changes in the status of a chat member.
 */
export interface ChatMemberUpdated {
  chat: Chat;
  from: User;
  date: number;
  old_chat_member: ChatMember;
  new_chat_member: ChatMember;
  invite_link?: ChatInviteLink;
  via_join_request?: boolean;
  via_chat_folder_invite_link?: boolean;
}

/**
 * Contains information about one member of a chat.
 */
export interface ChatMember {
  status: ChatMemberStatus;
  user: User;
  custom_title?: string;
  is_anonymous?: boolean;
  can_be_edited?: boolean;
  can_manage_chat?: boolean;
  can_delete_messages?: boolean;
  can_manage_video_chats?: boolean;
  can_restrict_members?: boolean;
  can_promote_members?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_post_stories?: boolean;
  can_edit_stories?: boolean;
  can_delete_stories?: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
  until_date?: number;
}

/**
 * Represents an invite link for a chat.
 */
export interface ChatInviteLink {
  invite_link: string;
  creator: User;
  creates_join_request: boolean;
  is_primary: boolean;
  is_revoked: boolean;
  name?: string;
  expire_date?: number;
  member_limit?: number;
  pending_join_request_count?: number;
  subscription_period?: number;
  subscription_price?: number;
}

/**
 * Represents a join request sent to a chat.
 */
export interface ChatJoinRequest {
  chat: Chat;
  from: User;
  user_chat_id: number;
  date: number;
  bio?: string;
  invite_link?: ChatInviteLink;
}

/**
 * Describes a service message about a user boosting a chat.
 */
export interface ChatBoostAdded {
  /** Number of boosts added by the user. */
  boost_count: number;
}

/**
 * Represents a chat boost source from Premium subscription.
 */
export interface ChatBoostSourcePremium {
  source: "premium";
  user: User;
}

/**
 * Represents a chat boost source from a gift code.
 */
export interface ChatBoostSourceGiftCode {
  source: "gift_code";
  user: User;
}

/**
 * Represents a chat boost source from a giveaway.
 */
export interface ChatBoostSourceGiveaway {
  source: "giveaway";
  giveaway_message_id: number;
  user?: User;
  prize_star_count?: number;
  is_unclaimed?: boolean;
}

/**
 * Describes the source of a chat boost.
 */
export type ChatBoostSource =
  | ChatBoostSourcePremium
  | ChatBoostSourceGiftCode
  | ChatBoostSourceGiveaway;

/**
 * Contains information about a boost added to a chat.
 */
export interface ChatBoost {
  /** Unique identifier of the boost. */
  boost_id: string;
  /** Point in time (Unix timestamp) when the chat was boosted. */
  add_date: number;
  /** Point in time (Unix timestamp) when the boost will automatically expire. */
  expiration_date: number;
  /** Source of the added boost. */
  source: ChatBoostSource;
}

/**
 * Represents a boost added to a chat.
 */
export interface ChatBoostUpdated {
  chat: Chat;
  boost: ChatBoost;
}

/**
 * Represents a boost removed from a chat.
 */
export interface ChatBoostRemoved {
  chat: Chat;
  boost_id: string;
  remove_date: number;
  source: ChatBoostSource;
}

/**
 * Describes the connection of the bot with a business account.
 */
export interface BusinessConnection {
  id: string;
  user: User;
  user_chat_id: number;
  date: number;
  can_reply: boolean;
  is_enabled: boolean;
}

/**
 * Received when messages are deleted from a connected business account.
 */
export interface BusinessMessagesDeleted {
  business_connection_id: string;
  chat: Chat;
  message_ids: number[];
}

/**
 * Reaction type using normal emoji.
 */
export interface ReactionTypeEmoji {
  type: "emoji";
  emoji: string;
}

/**
 * Reaction type using custom emoji.
 */
export interface ReactionTypeCustomEmoji {
  type: "custom_emoji";
  custom_emoji_id: string;
}

/**
 * Reaction type for paid reactions.
 */
export interface ReactionTypePaid {
  type: "paid";
}

/**
 * Union type representing all supported Telegram reaction types.
 */
export type ReactionType =
  | ReactionTypeEmoji
  | ReactionTypeCustomEmoji
  | ReactionTypePaid;

/**
 * Represents a reaction added to a message along with the number of times it was added.
 */
export interface ReactionCount {
  type: ReactionType;
  total_count: number;
}

/**
 * Represents a change of a reaction on a message performed by a user.
 */
export interface MessageReactionUpdated {
  chat: Chat;
  message_id: number;
  user?: User;
  actor_chat?: Chat;
  date: number;
  old_reaction: ReactionType[];
  new_reaction: ReactionType[];
}

/**
 * Represents reaction changes on a message with anonymous reactions.
 */
export interface MessageReactionCountUpdated {
  chat: Chat;
  message_id: number;
  date: number;
  reactions: ReactionCount[];
}

/**
 * Represents a user's profile pictures.
 */
export interface UserProfilePhotos {
  total_count: number;
  photos: PhotoSize[][];
}

/**
 * Represents a file ready to be downloaded from Telegram.
 */
export interface File {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

/**
 * Contains information about the current status of a webhook.
 */
export interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  last_synchronization_error_date?: number;
  max_connections?: number;
  allowed_updates?: string[];
}

/**
 * Raw Telegram Update object received from the Bot API.
 */
export interface RawUpdate {
  update_id: number;
  message?: Message;
  edited_message?: Message;
  channel_post?: Message;
  edited_channel_post?: Message;
  business_connection?: BusinessConnection;
  business_message?: Message;
  edited_business_message?: Message;
  deleted_business_messages?: BusinessMessagesDeleted;
  message_reaction?: MessageReactionUpdated;
  message_reaction_count?: MessageReactionCountUpdated;
  inline_query?: InlineQuery;
  chosen_inline_result?: ChosenInlineResult;
  callback_query?: CallbackQuery;
  shipping_query?: ShippingQuery;
  pre_checkout_query?: PreCheckoutQuery;
  poll?: Poll;
  poll_answer?: PollAnswer;
  my_chat_member?: ChatMemberUpdated;
  chat_member?: ChatMemberUpdated;
  chat_join_request?: ChatJoinRequest;
  chat_boost?: ChatBoostUpdated;
  removed_chat_boost?: ChatBoostRemoved;
}

/**
 * Generic response envelope returned by all Telegram Bot API endpoints.
 *
 * @typeParam T - The expected payload data type on success.
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
  parameters?: {
    retry_after?: number;
    migrate_to_chat_id?: number;
  };
}

/**
 * Options passed to `getUpdates` requests.
 */
export interface GetUpdatesOptions {
  offset?: number;
  limit?: number;
  timeout?: number;
  allowed_updates?: string[];
}

/**
 * Options passed to `sendMessage` requests.
 */
export interface SendMessageOptions {
  chat_id: number | string;
  text: string;
  message_thread_id?: number;
  parse_mode?: ParseMode;
  entities?: MessageEntity[];
  link_preview_options?: unknown;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: {
    message_id: number;
    chat_id?: number | string;
    allow_sending_without_reply?: boolean;
    quote?: string;
    quote_parse_mode?: string;
    quote_entities?: MessageEntity[];
    quote_position?: number;
  };
  reply_markup?: ReplyMarkup;
}

/**
 * Options passed to `editMessageText` requests.
 */
export interface EditMessageTextOptions {
  text: string;
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  parse_mode?: ParseMode;
  entities?: MessageEntity[];
  link_preview_options?: unknown;
  reply_markup?: InlineKeyboardMarkup;
}

/**
 * Options passed to `editMessageCaption` requests.
 */
export interface EditMessageCaptionOptions {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  show_caption_above_media?: boolean;
  reply_markup?: InlineKeyboardMarkup;
}

/**
 * Options passed to `editMessageReplyMarkup` requests.
 */
export interface EditMessageReplyMarkupOptions {
  chat_id?: number | string;
  message_id?: number;
  inline_message_id?: string;
  reply_markup?: InlineKeyboardMarkup;
}

/**
 * Options passed to `sendPhoto` requests.
 */
export interface SendPhotoOptions {
  chat_id: number | string;
  photo: unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  show_caption_above_media?: boolean;
  has_spoiler?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendAudio` requests.
 */
export interface SendAudioOptions {
  chat_id: number | string;
  audio: unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  duration?: number;
  performer?: string;
  title?: string;
  thumbnail?: unknown;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendDocument` requests.
 */
export interface SendDocumentOptions {
  chat_id: number | string;
  document: unknown;
  thumbnail?: unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  disable_content_type_detection?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendVideo` requests.
 */
export interface SendVideoOptions {
  chat_id: number | string;
  video: unknown;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  show_caption_above_media?: boolean;
  has_spoiler?: boolean;
  supports_streaming?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendAnimation` requests.
 */
export interface SendAnimationOptions {
  chat_id: number | string;
  animation: unknown;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  show_caption_above_media?: boolean;
  has_spoiler?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendVoice` requests.
 */
export interface SendVoiceOptions {
  chat_id: number | string;
  voice: unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  duration?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendVideoNote` requests.
 */
export interface SendVideoNoteOptions {
  chat_id: number | string;
  video_note: unknown;
  duration?: number;
  length?: number;
  thumbnail?: unknown;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Represents photo media item in `sendMediaGroup`.
 */
export interface InputMediaPhoto {
  type: "photo";
  media: string | unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  show_caption_above_media?: boolean;
  has_spoiler?: boolean;
}

/**
 * Represents video media item in `sendMediaGroup`.
 */
export interface InputMediaVideo {
  type: "video";
  media: string | unknown;
  thumbnail?: string | unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  show_caption_above_media?: boolean;
  width?: number;
  height?: number;
  duration?: number;
  supports_streaming?: boolean;
  has_spoiler?: boolean;
}

/**
 * Represents animation media item in `sendMediaGroup`.
 */
export interface InputMediaAnimation {
  type: "animation";
  media: string | unknown;
  thumbnail?: string | unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  show_caption_above_media?: boolean;
  width?: number;
  height?: number;
  duration?: number;
  has_spoiler?: boolean;
}

/**
 * Represents audio media item in `sendMediaGroup`.
 */
export interface InputMediaAudio {
  type: "audio";
  media: string | unknown;
  thumbnail?: string | unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  duration?: number;
  performer?: string;
  title?: string;
}

/**
 * Represents document media item in `sendMediaGroup`.
 */
export interface InputMediaDocument {
  type: "document";
  media: string | unknown;
  thumbnail?: string | unknown;
  caption?: string;
  parse_mode?: ParseMode;
  caption_entities?: MessageEntity[];
  disable_content_type_detection?: boolean;
}

/**
 * Union of all input media types accepted in `sendMediaGroup`.
 */
export type InputMedia =
  | InputMediaPhoto
  | InputMediaVideo
  | InputMediaAnimation
  | InputMediaAudio
  | InputMediaDocument;

/**
 * Options passed to `sendMediaGroup` requests.
 */
export interface SendMediaGroupOptions {
  chat_id: number | string;
  media: InputMedia[];
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  message_thread_id?: number;
}

/**
 * Options passed to `sendLocation` requests.
 */
export interface SendLocationOptions {
  chat_id: number | string;
  latitude: number;
  longitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendVenue` requests.
 */
export interface SendVenueOptions {
  chat_id: number | string;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  foursquare_id?: string;
  foursquare_type?: string;
  google_place_id?: string;
  google_place_type?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendContact` requests.
 */
export interface SendContactOptions {
  chat_id: number | string;
  phone_number: string;
  first_name: string;
  last_name?: string;
  vcard?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendPoll` requests.
 */
export interface SendPollOptions {
  chat_id: number | string;
  question: string;
  options: (string | { text: string })[];
  is_anonymous?: boolean;
  type?: PollType;
  allows_multiple_answers?: boolean;
  correct_option_id?: number;
  explanation?: string;
  explanation_parse_mode?: ParseMode;
  explanation_entities?: MessageEntity[];
  open_period?: number;
  close_date?: number;
  is_closed?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendDice` requests.
 */
export interface SendDiceOptions {
  chat_id: number | string;
  emoji?: string;
  disable_notification?: boolean;
  protect_content?: boolean;
  message_effect_id?: string;
  reply_parameters?: unknown;
  reply_markup?: ReplyMarkup;
  message_thread_id?: number;
}

/**
 * Options passed to `sendChatAction` requests.
 */
export interface SendChatActionOptions {
  chat_id: number | string;
  action: ChatAction;
  business_connection_id?: string;
  message_thread_id?: number;
}

/**
 * Options passed to `answerCallbackQuery` requests.
 */
export interface AnswerCallbackQueryOptions {
  callback_query_id: string;
  text?: string;
  show_alert?: boolean;
  url?: string;
  cache_time?: number;
}

/**
 * Represents one result of an inline query.
 */
export type InlineQueryResult = Record<string, unknown>;

/**
 * Options passed to `answerInlineQuery` requests.
 */
export interface AnswerInlineQueryOptions {
  inline_query_id: string;
  results: InlineQueryResult[];
  cache_time?: number;
  is_personal?: boolean;
  next_offset?: string;
  button?: unknown;
}

/**
 * Options passed to `promoteChatMember` requests.
 */
export interface PromoteChatMemberOptions {
  is_anonymous?: boolean;
  can_manage_chat?: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_delete_messages?: boolean;
  can_post_stories?: boolean;
  can_edit_stories?: boolean;
  can_delete_stories?: boolean;
  can_manage_video_chats?: boolean;
  can_restrict_members?: boolean;
  can_promote_members?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
  can_manage_topics?: boolean;
}

/**
 * Options passed to `createChatInviteLink` requests.
 */
export interface CreateChatInviteLinkOptions {
  name?: string;
  expire_date?: number;
  member_limit?: number;
  creates_join_request?: boolean;
}

/**
 * Options passed to `editChatInviteLink` requests.
 */
export interface EditChatInviteLinkOptions {
  name?: string;
  expire_date?: number;
  member_limit?: number;
  creates_join_request?: boolean;
}

/**
 * Options passed to `setWebhook` requests.
 */
export interface SetWebhookOptions {
  url: string;
  certificate?: unknown;
  ip_address?: string;
  max_connections?: number;
  allowed_updates?: string[];
  drop_pending_updates?: boolean;
  secret_token?: string;
}

/**
 * Options passed to `editMessageMedia` requests.
 */
export interface EditMessageMediaOptions {
  /** The new media content of the message. */
  media: InputMedia;
  /** Unique identifier for the target chat or username of the target channel. Required if inline_message_id is not specified. */
  chat_id?: number | string;
  /** Identifier of the message to edit. Required if inline_message_id is not specified. */
  message_id?: number;
  /** Identifier of the inline message. Required if chat_id and message_id are not specified. */
  inline_message_id?: string;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier of the business connection on behalf of which the message was sent. */
  business_connection_id?: string;
}

/**
 * Options passed to `editMessageLiveLocation` requests.
 */
export interface EditMessageLiveLocationOptions {
  /** Latitude of new location. */
  latitude: number;
  /** Longitude of new location. */
  longitude: number;
  /** Unique identifier for the target chat or username of the target channel. Required if inline_message_id is not specified. */
  chat_id?: number | string;
  /** Identifier of the message to edit. Required if inline_message_id is not specified. */
  message_id?: number;
  /** Identifier of the inline message. Required if chat_id and message_id are not specified. */
  inline_message_id?: string;
  /** Radius of uncertainty for the location, measured in meters; 0-1500. */
  horizontal_accuracy?: number;
  /** Direction in which the user is moving, in degrees; 1-360. */
  heading?: number;
  /** Maximum distance for proximity alerts about approaching another chat member, in meters; 1-100000. */
  proximity_alert_radius?: number;
  /** New period in seconds during which the location can be updated, starting from the message send date. */
  live_period?: number;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier of the business connection on behalf of which the message was sent. */
  business_connection_id?: string;
}

/**
 * Options passed to `stopMessageLiveLocation` requests.
 */
export interface StopMessageLiveLocationOptions {
  /** Unique identifier for the target chat or username of the target channel. Required if inline_message_id is not specified. */
  chat_id?: number | string;
  /** Identifier of the message with live location to stop. Required if inline_message_id is not specified. */
  message_id?: number;
  /** Identifier of the inline message. Required if chat_id and message_id are not specified. */
  inline_message_id?: string;
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier of the business connection on behalf of which the message was sent. */
  business_connection_id?: string;
}

/**
 * Options passed to `stopPoll` requests.
 */
export interface StopPollOptions {
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier of the business connection on behalf of which the message was sent. */
  business_connection_id?: string;
}

/**
 * Options passed to `setMessageReaction` requests.
 */
export interface SetMessageReactionOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Identifier of the target message. */
  message_id: number;
  /** List of reaction types to set on the message. */
  reaction?: (ReactionType | string)[] | ReactionType | string;
  /** Pass True to set the reaction with a big animation. */
  is_big?: boolean;
}

/**
 * Represents a sticker.
 */
export interface Sticker {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Type of the sticker, currently one of "regular", "mask", "custom_emoji". */
  type: "regular" | "mask" | "custom_emoji";
  /** Sticker width. */
  width: number;
  /** Sticker height. */
  height: number;
  /** True, if the sticker is animated. */
  is_animated: boolean;
  /** True, if the sticker is a video sticker. */
  is_video: boolean;
  /** Sticker thumbnail in the .WEBP or .JPG format. */
  thumbnail?: PhotoSize;
  /** Emoji associated with the sticker. */
  emoji?: string;
  /** Name of the sticker set to which the sticker belongs. */
  set_name?: string;
  /** For premium regular stickers, premium animation for the sticker. */
  premium_animation?: File;
  /** For mask stickers, the position where the mask should be placed. */
  mask_position?: MaskPosition;
  /** For custom emoji stickers, unique identifier of the custom emoji. */
  custom_emoji_id?: string;
  /** True, if the sticker must be repainted to a text color in messages. */
  needs_repainting?: boolean;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Describes the position on faces where a mask should be placed by default.
 */
export interface MaskPosition {
  /** The part of the face relative to which the mask should be placed. One of "forehead", "eyes", "mouth", or "chin". */
  point: string;
  /** Shift by X-axis measured in widths of the mask scaled to the face size, from left to right. */
  x_shift: number;
  /** Shift by Y-axis measured in heights of the mask scaled to the face size, from top to bottom. */
  y_shift: number;
  /** Mask scaling coefficient. */
  scale: number;
}

/**
 * Represents a sticker set.
 */
export interface StickerSet {
  /** Sticker set name. */
  name: string;
  /** Sticker set title. */
  title: string;
  /** Type of stickers in the set, currently one of "regular", "mask", "custom_emoji". */
  sticker_type: "regular" | "mask" | "custom_emoji";
  /** List of all stickers in the set. */
  stickers: Sticker[];
  /** Sticker set thumbnail in the .WEBP, .TGS, or .WEBM format. */
  thumbnail?: PhotoSize;
}

/**
 * Describes a sticker to be added to or created in a sticker set.
 */
export interface InputSticker {
  /** The added sticker. Pass a file_id as a string or an InputFile object. */
  sticker: string | InputFile;
  /** Format of the sticker, must be one of "static", "animated", "video". */
  format: "static" | "animated" | "video";
  /** List of 1-20 emoji associated with the sticker. */
  emoji_list: string[];
  /** Position where the mask should be placed on faces. For "mask" stickers only. */
  mask_position?: MaskPosition;
  /** List of 0-20 search keywords for the sticker with total length up to 64 characters. For "regular" and "custom_emoji" stickers only. */
  keywords?: string[];
}

/**
 * Options passed to `sendSticker` requests.
 */
export interface SendStickerOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Sticker to send. Pass a file_id as String to send a file that exists on the Telegram servers, or an HTTP URL as String, or upload a new one using InputFile. */
  sticker: string | InputFile;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Emoji associated with the sticker; only for just uploaded stickers. */
  emoji?: string;
  /** Sends the message silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Description of the message to reply to. */
  reply_parameters?: unknown;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
}

/**
 * Options passed to `createNewStickerSet` requests.
 */
export interface CreateNewStickerSetOptions {
  /** User identifier of created sticker set owner. */
  user_id: number;
  /** Short name of sticker set, to be used in t.me/addstickers/ URLs. */
  name: string;
  /** Sticker set title, 1-64 characters. */
  title: string;
  /** A list of 1-50 initial stickers to be added to the sticker set. */
  stickers: InputSticker[];
  /** Type of stickers in the set, pass "regular", "mask", or "custom_emoji". By default, a regular sticker set is created. */
  sticker_type?: "regular" | "mask" | "custom_emoji";
  /** Pass True if stickers in the sticker set must be repainted to the color of text when used in messages. For "custom_emoji" only. */
  needs_repainting?: boolean;
}

/**
 * Options passed to `addStickerToSet` requests.
 */
export interface AddStickerToSetOptions {
  /** User identifier of sticker set owner. */
  user_id: number;
  /** Sticker set name. */
  name: string;
  /** A object with information about the added sticker. */
  sticker: InputSticker;
}

/**
 * Options passed to `replaceStickerInSet` requests.
 */
export interface ReplaceStickerInSetOptions {
  /** User identifier of the sticker set owner. */
  user_id: number;
  /** Sticker set name. */
  name: string;
  /** File identifier of the replaced sticker. */
  old_sticker: string;
  /** A object with information about the added sticker. */
  sticker: InputSticker;
}

/**
 * Type alias representing a raw Telegram Update structure.
 */
export type Update = RawUpdate;




/**
 * Represents a game high score for a user.
 */
export interface GameHighScore {
  position: number;
  user: User;
  score: number;
}

/**
 * Abstract base for passport element errors.
 */
export interface PassportElementError {
  source: string;
  type: string;
  message: string;
}

/**
 * Represents a list of gifts.
 */
export interface Gifts {
  gifts: Gift[];
}

/**
 * Represents a gift that can be sent by the bot.
 */
export interface Gift {
  id: string;
  sticker: Sticker;
  star_count: number;
  total_count?: number;
  remaining_count?: number;
}

/**
 * Represents the boost status of a chat.
 */
export interface UserChatBoosts {
  boosts: unknown[];
}

/**
 * Options passed to sendInvoice requests.
 */
export interface SendInvoiceOptions {
  chat_id: number | string;
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: LabeledPrice[];
  provider_token?: string;
  max_tip_amount?: number;
  suggested_tip_amounts?: number[];
  start_parameter?: string;
  provider_data?: string;
  photo_url?: string;
  photo_size?: number;
  photo_width?: number;
  photo_height?: number;
  need_name?: boolean;
  need_phone_number?: boolean;
  need_email?: boolean;
  need_shipping_address?: boolean;
  send_phone_number_to_provider?: boolean;
  send_email_to_provider?: boolean;
  is_flexible?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_parameters?: unknown;
  reply_markup?: InlineKeyboardMarkup;
  message_thread_id?: number;
}

/**
 * Portion of the price of a product or service.
 */
export interface LabeledPrice {
  label: string;
  amount: number;
}

/**
 * Options for answerShippingQuery requests.
 */
export interface AnswerShippingQueryOptions {
  shipping_query_id: string;
  ok: boolean;
  shipping_options?: ShippingOption[];
  error_message?: string;
}

/**
 * Shipping option for payment.
 */
export interface ShippingOption {
  id: string;
  title: string;
  prices: LabeledPrice[];
}

/**
 * Options for answerPreCheckoutQuery requests.
 */
export interface AnswerPreCheckoutQueryOptions {
  pre_checkout_query_id: string;
  ok: boolean;
  error_message?: string;
}

/**
 * Describes the number of Telegram Stars.
 */
export interface StarAmount {
  /** The integer number of Telegram Stars. */
  amount: number;
  /** The number of 1/1000000000 shares of Telegram Stars. */
  nanostar_amount?: number;
}

/**
 * Contains a list of Telegram Star transactions.
 */
export interface StarTransactions {
  /** List of transactions. */
  transactions: StarTransaction[];
}

/**
 * Describes a Telegram Star transaction.
 */
export interface StarTransaction {
  /** Unique identifier of the transaction. */
  id: string;
  /** Number of Telegram Stars transferred. */
  amount: number;
  /** The number of 1/1000000000 shares of Telegram Stars transferred. */
  nanostar_amount?: number;
  /** Date the transaction took place in Unix time. */
  date: number;
  /** Source of the transaction. */
  source?: unknown;
  /** Receiver of the transaction. */
  receiver?: unknown;
}

/**
 * Represents the rights of an administrator in a chat.
 */
export interface ChatAdministratorRights {
  /** True, if the user's presence in the chat is hidden. */
  is_anonymous: boolean;
  /** True, if the administrator can access the chat event log, get boost list, see hidden members, etc. */
  can_manage_chat: boolean;
  /** True, if the administrator can delete messages of other users. */
  can_delete_messages: boolean;
  /** True, if the administrator can manage video chats. */
  can_manage_video_chats: boolean;
  /** True, if the administrator can restrict, ban or unban chat members. */
  can_restrict_members: boolean;
  /** True, if the administrator can add new administrators with a subset of their own privileges. */
  can_promote_members: boolean;
  /** True, if the user is allowed to change the chat title, photo and other settings. */
  can_change_info: boolean;
  /** True, if the user is allowed to invite new users to the chat. */
  can_invite_users: boolean;
  /** True, if the administrator can post stories to the chat. */
  can_post_stories?: boolean;
  /** True, if the administrator can edit stories posted by other users. */
  can_edit_stories?: boolean;
  /** True, if the administrator can delete stories posted by other users. */
  can_delete_stories?: boolean;
  /** True, if the administrator can post messages in the channel, or access channel statistics. */
  can_post_messages?: boolean;
  /** True, if the administrator can edit messages of other users. */
  can_edit_messages?: boolean;
  /** True, if the user is allowed to pin messages. */
  can_pin_messages?: boolean;
  /** True, if the user is allowed to create, rename, close, and reopen forum topics. */
  can_manage_topics?: boolean;
}

/**
 * Describes a menu button in a chat.
 */
export type MenuButton =
  | { type: "default" }
  | { type: "commands" }
  | { type: "web_app"; text: string; web_app: { url: string } };

/**
 * Represents the scope to which bot commands are applied.
 */
export type BotCommandScope =
  | { type: "default" }
  | { type: "all_private_chats" }
  | { type: "all_group_chats" }
  | { type: "all_chat_administrators" }
  | { type: "chat"; chat_id: number | string }
  | { type: "chat_administrators"; chat_id: number | string }
  | { type: "chat_member"; chat_id: number | string; user_id: number };

/**
 * Represents the bot's name.
 */
export interface BotName {
  /** The bot's name. */
  name: string;
}

/**
 * Represents the bot's description.
 */
export interface BotDescription {
  /** The bot's description. */
  description: string;
}

/**
 * Represents the bot's short description.
 */
export interface BotShortDescription {
  /** The bot's short description. */
  short_description: string;
}

/**
 * Represents a forum topic.
 */
export interface ForumTopic {
  /** Unique identifier of the forum topic. */
  message_thread_id: number;
  /** Name of the topic. */
  name: string;
  /** Color of the topic icon in RGB format. */
  icon_color: number;
  /** Unique identifier of the custom emoji shown as the topic icon. */
  icon_custom_emoji_id?: string;
}

/**
 * Represents a bot command.
 */
export interface BotCommand {
  /** Text of the command; 1-32 characters. Can contain only lowercase English letters, digits and underscores. */
  command: string;
  /** Description of the command; 1-256 characters. */
  description: string;
}

/**
 * A placeholder, currently holds no information. Use BotFather to set up your game.
 */
export interface CallbackGame {
  [key: string]: unknown;
}

/**
 * Represents a game.
 */
export interface Game {
  /** Title of the game. */
  title: string;
  /** Description of the game. */
  description: string;
  /** Photo that will be displayed in the game message in chats. */
  photo: PhotoSize[];
  /** Brief description of the game or high scores. */
  text?: string;
  /** Special entities that appear in text. */
  text_entities?: MessageEntity[];
  /** Animation that will be displayed in the game message in chats. */
  animation?: Animation;
}

/**
 * Describes Telegram Passport data shared with the bot.
 */
export interface PassportData {
  /** Array with information about documents and other Telegram Passport elements. */
  data: EncryptedPassportElement[];
  /** Encrypted credentials required to decrypt the data. */
  credentials: EncryptedCredentials;
}

/**
 * Describes an encrypted Telegram Passport element.
 */
export interface EncryptedPassportElement {
  /** Element type. */
  type: string;
  /** Base64-encoded element hash for verification. */
  hash: string;
  /** Base64-encoded encrypted data. */
  data?: string;
  /** User's verified phone number. */
  phone_number?: string;
  /** User's verified email address. */
  email?: string;
  /** Array of encrypted files. */
  files?: PassportFile[];
  /** Encrypted file with the front side of the document. */
  front_side?: PassportFile;
  /** Encrypted file with the reverse side of the document. */
  reverse_side?: PassportFile;
  /** Encrypted file with the selfie of the user holding a document. */
  selfie?: PassportFile;
  /** Array of encrypted files with translated versions of documents. */
  translation?: PassportFile[];
}

/**
 * Represents a file uploaded to Telegram Passport.
 */
export interface PassportFile {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file. */
  file_unique_id: string;
  /** File size in bytes. */
  file_size: number;
  /** Unix time when the file was uploaded. */
  file_date: number;
}

/**
 * Represents encrypted credentials required for decrypting Telegram Passport data.
 */
export interface EncryptedCredentials {
  /** Base64-encoded encrypted JSON-serialized data. */
  data: string;
  /** Base64-encoded data hash for verification. */
  hash: string;
  /** Base64-encoded secret hash for verification. */
  secret: string;
}
