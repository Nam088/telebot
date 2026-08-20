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
  birthdate?: unknown;
  business_intro?: unknown;
  business_location?: unknown;
  business_opening_hours?: unknown;
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
  sticker?: unknown;
  story?: unknown;
  video?: Video;
  video_note?: VideoNote;
  voice?: Voice;
  has_media_spoiler?: boolean;
  contact?: Contact;
  dice?: Dice;
  game?: unknown;
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
 * Represents a Telegram story.
 */
export interface Story {
  chat: Chat;
  id: number;
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
  callback_game?: unknown;
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
  sticker?: unknown;
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
  game?: unknown;
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
  invoice?: unknown;
  successful_payment?: unknown;
  refunded_payment?: unknown;
  users_shared?: unknown;
  chat_shared?: unknown;
  connected_website?: string;
  write_access_allowed?: unknown;
  passport_data?: unknown;
  proximity_alert_triggered?: unknown;
  boost_added?: unknown;
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
 * Contains information about an incoming shipping query.
 */
export interface ShippingQuery {
  id: string;
  from: User;
  invoice_payload: string;
  shipping_address: unknown;
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
  order_info?: unknown;
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
 * Represents a boost added to a chat.
 */
export interface ChatBoostUpdated {
  chat: Chat;
  boost: unknown;
}

/**
 * Represents a boost removed from a chat.
 */
export interface ChatBoostRemoved {
  chat: Chat;
  boost_id: string;
  remove_date: number;
  source: unknown;
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
 * Type alias representing a raw Telegram Update structure.
 */
export type Update = RawUpdate;



