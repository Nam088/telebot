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
  available_reactions?: unknown[];
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
 * Represents a chat photo profile picture.
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
 * Describes actions that a non-administrator user is allowed to take in a chat.
 */
export interface ChatPermissions {
  /** True, if the user is allowed to send text messages, contacts, locations and venues. */
  can_send_messages?: boolean;
  /** True, if the user is allowed to send audios. */
  can_send_audios?: boolean;
  /** True, if the user is allowed to send documents. */
  can_send_documents?: boolean;
  /** True, if the user is allowed to send photos. */
  can_send_photos?: boolean;
  /** True, if the user is allowed to send videos. */
  can_send_videos?: boolean;
  /** True, if the user is allowed to send video notes. */
  can_send_video_notes?: boolean;
  /** True, if the user is allowed to send voice notes. */
  can_send_voice_notes?: boolean;
  /** True, if the user is allowed to send polls. */
  can_send_polls?: boolean;
  /** True, if the user is allowed to send animations, games, stickers and use inline bots. */
  can_send_other_messages?: boolean;
  /** True, if the user is allowed to add web page previews to their messages. */
  can_add_web_page_previews?: boolean;
  /** True, if the user is allowed to change the chat title, photo and other settings. */
  can_change_info?: boolean;
  /** True, if the user is allowed to invite new users to the chat. */
  can_invite_users?: boolean;
  /** True, if the user is allowed to pin messages. */
  can_pin_messages?: boolean;
  /** True, if the user is allowed to create, rename, close, and reopen forum topics. */
  can_manage_topics?: boolean;
}

/**
 * Represents a location to which a chat is connected.
 */
export interface ChatLocation {
  /** The physical location to which the supergroup is connected. */
  location: Location;
  /** Location address; 1-64 characters, as defined by the chat owner. */
  address: string;
}

/**
 * Represents a point on the map (geographic coordinates).
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
 * Represents one special entity in a text message (e.g. hashtags, usernames, URLs, formatting).
 */
export interface MessageEntity {
  /** Type of the entity (e.g. 'mention', 'hashtag', 'bot_command', 'url', 'bold', 'italic', etc.). */
  type: MessageEntityType;
  /** Offset in UTF-16 code units to the start of the entity. */
  offset: number;
  /** Length of the entity in UTF-16 code units. */
  length: number;
  /** For 'text_link' only, URL that will be opened after user taps on the text. */
  url?: string;
  /** For 'text_mention' only, the mentioned user. */
  user?: User;
  /** For 'pre' only, the programming language of the entity text. */
  language?: string;
  /** For 'custom_emoji' only, unique identifier of the custom emoji. */
  custom_emoji_id?: string;
}

/**
 * Represents one size of a photo or a file / sticker thumbnail.
 */
export interface PhotoSize {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Photo width. */
  width: number;
  /** Photo height. */
  height: number;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Represents an audio file to be treated as music by the Telegram clients.
 */
export interface Audio {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Duration of the audio in seconds as defined by sender. */
  duration: number;
  /** Performer of the audio as defined by sender or by audio tags. */
  performer?: string;
  /** Title of the audio as defined by sender or by audio tags. */
  title?: string;
  /** Original filename as defined by sender. */
  file_name?: string;
  /** MIME type of the file as defined by sender. */
  mime_type?: string;
  /** File size in bytes. */
  file_size?: number;
  /** Thumbnail of the album cover to which the music file belongs. */
  thumbnail?: PhotoSize;
}

/**
 * Represents a general file (as opposed to photos or audio files).
 */
export interface Document {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Document thumbnail as defined by sender. */
  thumbnail?: PhotoSize;
  /** Original filename as defined by sender. */
  file_name?: string;
  /** MIME type of the file as defined by sender. */
  mime_type?: string;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Represents a video file.
 */
export interface Video {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Video width as defined by sender. */
  width: number;
  /** Video height as defined by sender. */
  height: number;
  /** Duration of the video in seconds as defined by sender. */
  duration: number;
  /** Video thumbnail. */
  thumbnail?: PhotoSize;
  /** Original filename as defined by sender. */
  file_name?: string;
  /** MIME type of the file as defined by sender. */
  mime_type?: string;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Represents an animation file (GIF or video without sound).
 */
export interface Animation {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Video width as defined by sender. */
  width: number;
  /** Video height as defined by sender. */
  height: number;
  /** Duration of the video in seconds as defined by sender. */
  duration: number;
  /** Animation thumbnail. */
  thumbnail?: PhotoSize;
  /** Original animation filename as defined by sender. */
  file_name?: string;
  /** MIME type of the file as defined by sender. */
  mime_type?: string;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Represents a voice note.
 */
export interface Voice {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Duration of the audio in seconds as defined by sender. */
  duration: number;
  /** MIME type of the audio as defined by sender. */
  mime_type?: string;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Represents a video message (round video note).
 */
export interface VideoNote {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Video width and height (diameter of the video message) as defined by sender. */
  length: number;
  /** Duration of the video in seconds as defined by sender. */
  duration: number;
  /** Video thumbnail. */
  thumbnail?: PhotoSize;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Represents a phone contact.
 */
export interface Contact {
  /** Contact's phone number. */
  phone_number: string;
  /** Contact's first name. */
  first_name: string;
  /** Contact's last name. */
  last_name?: string;
  /** Contact's user identifier in Telegram. */
  user_id?: number;
  /** Additional data about the contact in the form of a vCard. */
  vcard?: string;
}

/**
 * Represents an animated emoji that displays a random value.
 */
export interface Dice {
  /** Emoji on which the dice throw animation is based. */
  emoji: string;
  /** Value of the dice (e.g. 1-6 for dice/darts, 1-5 for basketball/football, 1-64 for slot machine). */
  value: number;
}

/**
 * Contains information about one answer option in a poll.
 */
export interface PollOption {
  /** Option text, 1-100 characters. */
  text: string;
  /** Number of users that voted for this option. */
  voter_count: number;
  /** Special entities that appear in the option text. */
  text_entities?: MessageEntity[];
}

/**
 * Contains information about a poll.
 */
export interface Poll {
  /** Unique poll identifier. */
  id: string;
  /** Poll question, 1-300 characters. */
  question: string;
  /** List of poll options. */
  options: PollOption[];
  /** Total number of users that voted in the poll. */
  total_voter_count: number;
  /** True, if the poll is closed. */
  is_closed: boolean;
  /** True, if the poll is anonymous. */
  is_anonymous: boolean;
  /** Poll type, currently 'regular' or 'quiz'. */
  type: PollType;
  /** True, if the poll allows multiple answers. */
  allows_multiple_answers: boolean;
  /** 0-based identifier of the correct answer option. Available only for quizzes. */
  correct_option_id?: number;
  /** Text that is shown when a user chooses an incorrect answer or taps on the lamp icon. */
  explanation?: string;
  /** Special entities like substrings for formatting in the explanation. */
  explanation_entities?: MessageEntity[];
  /** Amount of time in seconds the poll will be active after creation. */
  open_period?: number;
  /** Point in time (Unix timestamp) when the poll will be automatically closed. */
  close_date?: number;
}

/**
 * Represents an answer of a user in a non-anonymous poll.
 */
export interface PollAnswer {
  /** Unique poll identifier. */
  poll_id: string;
  /** The chat that changed the answer to the poll, if the voter is anonymous. */
  voter_chat?: Chat;
  /** The user who changed the answer to the poll, if the voter is not anonymous. */
  user?: User;
  /** 0-based identifiers of chosen answer options. May be empty if the vote was retracted. */
  option_ids: number[];
}

/**
 * Represents a venue location with name and address.
 */
export interface Venue {
  /** Venue location. Can't be a live location. */
  location: Location;
  /** Name of the venue. */
  title: string;
  /** Address of the venue. */
  address: string;
  /** Foursquare identifier of the venue. */
  foursquare_id?: string;
  /** Foursquare type of the venue. */
  foursquare_type?: string;
  /** Google Places identifier of the venue. */
  google_place_id?: string;
  /** Google Places type of the venue. */
  google_place_type?: string;
}

/**
 * Describes the origin of a forwarded message.
 */
export interface MessageOrigin {
  /** Type of the message origin: 'user', 'hidden_user', 'chat', or 'channel'. */
  type: "user" | "hidden_user" | "chat" | "channel";
  /** Date the message was originally sent in Unix time. */
  date: number;
  /** User that sent the message originally (for 'user' origin). */
  sender_user?: User;
  /** Name of the user that sent the message originally (for 'hidden_user' origin). */
  sender_user_name?: string;
  /** Chat that sent the message originally (for 'chat' and 'channel' origin). */
  sender_chat?: Chat;
  /** For channel messages, signature of the post author if present. */
  author_signature?: string;
  /** Original message identifier in the chat/channel. */
  message_id?: number;
}

/**
 * Contains information about a message that is being replied to, which may come from another chat or forum topic.
 */
export interface ExternalReplyInfo {
  /** Origin of the message replied to. */
  origin: MessageOrigin;
  /** Chat the original message belongs to. */
  chat?: Chat;
  /** Unique message identifier inside the original chat. */
  message_id?: number;
  /** Options used for link preview generation for the original message. */
  link_preview_options?: unknown;
  /** Message is an animation, information about the animation. */
  animation?: Animation;
  /** Message is an audio file, information about the file. */
  audio?: Audio;
  /** Message is a general file, information about the file. */
  document?: Document;
  /** Message is a photo, available sizes of the photo. */
  photo?: PhotoSize[];
  /** Message is a sticker, information about the sticker. */
  sticker?: Sticker;
  /** Message is a forwarded story, information about the story. */
  story?: Story;
  /** Message is a video, information about the video. */
  video?: Video;
  /** Message is a video note, information about the video message. */
  video_note?: VideoNote;
  /** Message is a voice message, information about the file. */
  voice?: Voice;
  /** True, if the message media is covered by a spoiler animation. */
  has_media_spoiler?: boolean;
  /** Message is a shared contact, information about the contact. */
  contact?: Contact;
  /** Message is a dice with random value. */
  dice?: Dice;
  /** Message is a game, information about the game. */
  game?: Game;
  /** Message is a scheduled giveaway, information about the giveaway. */
  giveaway?: unknown;
  /** A giveaway with public winners was completed. */
  giveaway_winners?: unknown;
  /** Message is an invoice for a payment, information about the invoice. */
  invoice?: unknown;
  /** Message is a shared location, information about the location. */
  location?: Location;
  /** Message is a native poll, information about the poll. */
  poll?: Poll;
  /** Message is a venue, information about the venue. */
  venue?: Venue;
}

/**
 * Contains information about the quoted part of a message that is replied to.
 */
export interface TextQuote {
  /** Text of the quoted part of a message that is replied to. */
  text: string;
  /** Special entities that appear in the quote. */
  entities?: MessageEntity[];
  /** Approximate quote position in the original message in UTF-16 code units. */
  position: number;
  /** True, if the quote was chosen manually by the message sender. */
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
  /** Label text on the button. */
  text: string;
  /** HTTP or tg:// URL to be opened when the button is pressed. */
  url?: string;
  /** Data to be sent in a callback query to the bot when the button is pressed (1-64 bytes). */
  callback_data?: string;
  /** Description of the Web App that will be launched when the user presses the button. */
  web_app?: { url: string };
  /** An HTTPS URL used to automatically authorize the user. */
  login_url?: unknown;
  /** If set, pressing the button will prompt the user to select one of their chats and insert the bot's username and the specified inline query. */
  switch_inline_query?: string;
  /** If set, pressing the button will insert the bot's username and the specified inline query in the current chat's input field. */
  switch_inline_query_current_chat?: string;
  /** If set, pressing the button will prompt the user to select one of their chats of the specified type. */
  switch_inline_query_chosen_chat?: unknown;
  /** Description of the button that copies the specified text to the clipboard. */
  copy_text?: { text: string };
  /** Description of the game that will be launched when the user presses the button. */
  callback_game?: CallbackGame;
  /** Specify True, to send a Pay button. NOTE: This type of button must always be the first button in the first row and can only be used in invoice messages. */
  pay?: boolean;
}

/**
 * Represents an inline keyboard that appears right next to the message it belongs to.
 */
export interface InlineKeyboardMarkup {
  /** Array of button rows, each represented by an Array of InlineKeyboardButton objects. */
  inline_keyboard: InlineKeyboardButton[][];
}

/**
 * Represents one button of the reply keyboard.
 */
export interface KeyboardButton {
  /** Text of the button. If none of the optional fields are used, it will be sent as a message when the button is pressed. */
  text: string;
  /** If specified, pressing the button will open a list of suitable users. */
  request_users?: unknown;
  /** If specified, pressing the button will open a list of suitable chats. */
  request_chat?: unknown;
  /** If True, the user's phone number will be sent as a contact when the button is pressed. Available in private chats only. */
  request_contact?: boolean;
  /** If True, the user's current location will be sent when the button is pressed. Available in private chats only. */
  request_location?: boolean;
  /** If specified, the user will be asked to create a poll and send it to the bot. Available in private chats only. */
  request_poll?: { type?: string };
  /** If specified, the described Web App will be launched when the button is pressed. */
  web_app?: { url: string };
}

/**
 * Represents a custom keyboard with reply options.
 */
export interface ReplyKeyboardMarkup {
  /** Array of button rows, each represented by an Array of KeyboardButton objects. */
  keyboard: KeyboardButton[][];
  /** Requests clients to always show the keyboard when the regular keyboard is hidden. Defaults to false. */
  is_persistent?: boolean;
  /** Requests clients to resize the keyboard vertically for optimal fit. Defaults to false. */
  resize_keyboard?: boolean;
  /** Requests clients to hide the keyboard as soon as it's been used. Defaults to false. */
  one_time_keyboard?: boolean;
  /** The placeholder to be shown in the input field when the keyboard is active; 1-64 characters. */
  input_field_placeholder?: string;
  /** Use this parameter if you want to show the keyboard to specific users only. */
  selective?: boolean;
}

/**
 * Instructs Telegram clients to remove the custom keyboard and display default keyboard.
 */
export interface ReplyKeyboardRemove {
  /** Requests clients to remove the custom keyboard. */
  remove_keyboard: true;
  /** Use this parameter if you want to remove the keyboard for specific users only. */
  selective?: boolean;
}

/**
 * Instructs Telegram clients to display a reply interface to the user.
 */
export interface ForceReply {
  /** Shows reply interface to the user, as if they had selected the bot's message and tapped 'Reply'. */
  force_reply: true;
  /** The placeholder to be shown in the input field when the reply is active; 1-64 characters. */
  input_field_placeholder?: string;
  /** Use this parameter if you want to force reply from specific users only. */
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
  /** Unique message identifier inside this chat. */
  message_id: number;
  /** Unique identifier of a message thread to which the message belongs; for supergroups only. */
  message_thread_id?: number;
  /** Sender of the message; empty for messages sent to channels. */
  from?: User;
  /** Sender of the message, sent on behalf of a chat. */
  sender_chat?: Chat;
  /** If the sender of the message boosted the chat, the number of boosts added. */
  sender_boost_count?: number;
  /** The bot that actually sent the message on behalf of the business account. */
  sender_business_bot?: User;
  /** Date the message was sent in Unix time. */
  date: number;
  /** Unique identifier of the business connection from which the message was received. */
  business_connection_id?: string;
  /** Chat the message belongs to. */
  chat: Chat;
  /** Information about the original message for forwarded messages. */
  forward_origin?: MessageOrigin;
  /** True, if the message is sent to a forum topic. */
  is_topic_message?: boolean;
  /** True, if the message is a channel post that was automatically forwarded to the connected discussion group. */
  is_automatic_forward?: boolean;
  /** For replies in the same chat and message thread, the original message. */
  reply_to_message?: Message;
  /** Information about the message that is being replied to, which may come from another chat or forum topic. */
  external_reply?: ExternalReplyInfo;
  /** For replies that quote part of the original message, the quoted part of the message. */
  quote?: TextQuote;
  /** For replies to a story, the original story. */
  reply_to_story?: Story;
  /** Bot through which the message was sent. */
  via_bot?: User;
  /** Date the message was last edited in Unix time. */
  edit_date?: number;
  /** True, if the message can't be forwarded. */
  has_protected_content?: boolean;
  /** True, if the message was sent by an implicit action, for example, as an away or a greeting business message. */
  is_from_offline?: boolean;
  /** The unique identifier of a media message group this message belongs to. */
  media_group_id?: string;
  /** Signature of the post author for messages in channels, or the custom title of an anonymous group administrator. */
  author_signature?: string;
  /** For text messages, the actual UTF-8 text of the message. */
  text?: string;
  /** For text messages, special entities like substrings that appear in the text. */
  entities?: MessageEntity[];
  /** Options used for link preview generation for the message. */
  link_preview_options?: unknown;
  /** Message is an animation, information about the animation. */
  animation?: Animation;
  /** Message is an audio file, information about the file. */
  audio?: Audio;
  /** Message is a general file, information about the file. */
  document?: Document;
  /** Message is a photo, available sizes of the photo. */
  photo?: PhotoSize[];
  /** Message is a sticker, information about the sticker. */
  sticker?: Sticker;
  /** Message is a forwarded story, information about the story. */
  story?: Story;
  /** Message is a video, information about the video. */
  video?: Video;
  /** Message is a video note, information about the video message. */
  video_note?: VideoNote;
  /** Message is a voice message, information about the file. */
  voice?: Voice;
  /** Caption for the animation, audio, document, photo, video or voice. */
  caption?: string;
  /** For messages with a caption, special entities like substrings that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** True, if the caption must be shown above the message media. */
  show_caption_above_media?: boolean;
  /** True, if the message media is covered by a spoiler animation. */
  has_media_spoiler?: boolean;
  /** Message is a shared contact, information about the contact. */
  contact?: Contact;
  /** Message is a dice with random value. */
  dice?: Dice;
  /** Message is a game, information about the game. */
  game?: Game;
  /** Message is a native poll, information about the poll. */
  poll?: Poll;
  /** Message is a venue, information about the venue. */
  venue?: Venue;
  /** Message is a shared location, information about the location. */
  location?: Location;
  /** New members that were added to the group or supergroup and information about them. */
  new_chat_members?: User[];
  /** A member was removed in the group, information about them. */
  left_chat_member?: User;
  /** A chat title was changed to this value. */
  new_chat_title?: string;
  /** A chat photo was change to this value. */
  new_chat_photo?: PhotoSize[];
  /** Service message: the chat photo was deleted. */
  delete_chat_photo?: boolean;
  /** Service message: the group has been created. */
  group_chat_created?: boolean;
  /** Service message: the supergroup has been created. */
  supergroup_chat_created?: boolean;
  /** Service message: the channel has been created. */
  channel_chat_created?: boolean;
  /** Service message: auto-delete timer settings changed in the chat. */
  message_auto_delete_timer_changed?: unknown;
  /** The group has been migrated to a supergroup with the specified identifier. */
  migrate_to_chat_id?: number;
  /** The supergroup has been migrated from a group with the specified identifier. */
  migrate_from_chat_id?: number;
  /** Specified message was pinned. */
  pinned_message?: Message;
  /** Message is an invoice for a payment, information about the invoice. */
  invoice?: Invoice;
  /** Message is a service message about a successful payment, information about the payment. */
  successful_payment?: SuccessfulPayment;
  /** Message is a service message about a refunded payment, information about the payment. */
  refunded_payment?: RefundedPayment;
  /** Service message: users were shared with the bot. */
  users_shared?: unknown;
  /** Service message: a chat was shared with the bot. */
  chat_shared?: unknown;
  /** The domain name of the website on which the user has logged in. */
  connected_website?: string;
  /** Service message: the user allowed the bot to write messages after adding it to the attachment menu. */
  write_access_allowed?: unknown;
  /** Telegram Passport data. */
  passport_data?: PassportData;
  /** Service message: a user in the chat triggered another user's proximity alert while sharing Live Location. */
  proximity_alert_triggered?: unknown;
  /** Service message: user boosted the chat. */
  boost_added?: ChatBoostAdded;
  /** Service message: chat background set. */
  chat_background_set?: unknown;
  /** Service message: forum topic created. */
  forum_topic_created?: unknown;
  /** Service message: forum topic edited. */
  forum_topic_edited?: unknown;
  /** Service message: forum topic closed. */
  forum_topic_closed?: unknown;
  /** Service message: forum topic reopened. */
  forum_topic_reopened?: unknown;
  /** Service message: the 'General' forum topic hidden. */
  general_forum_topic_hidden?: unknown;
  /** Service message: the 'General' forum topic unhidden. */
  general_forum_topic_unhidden?: unknown;
  /** Service message: a scheduled giveaway was created. */
  giveaway_created?: unknown;
  /** The message is a scheduled giveaway. */
  giveaway?: unknown;
  /** A giveaway with public winners was completed. */
  giveaway_winners?: unknown;
  /** Service message: a giveaway without public winners was completed. */
  giveaway_completed?: unknown;
  /** Service message: video chat scheduled. */
  video_chat_scheduled?: unknown;
  /** Service message: video chat started. */
  video_chat_started?: unknown;
  /** Service message: video chat ended. */
  video_chat_ended?: unknown;
  /** Service message: new participants invited to a video chat. */
  video_chat_participants_invited?: unknown;
  /** Service message: data sent by a Web App to the bot. */
  web_app_data?: { data: string; button_text: string };
  /** Inline keyboard attached to the message. */
  reply_markup?: InlineKeyboardMarkup;
}

/**
 * Represents an incoming callback query from a callback button in an inline keyboard.
 */
export interface CallbackQuery {
  /** Unique identifier for this query. */
  id: string;
  /** Sender of the query. */
  from: User;
  /** Message sent by the bot with the callback button that originated the query. */
  message?: Message;
  /** Identifier of the message sent via the bot in inline mode, that originated the query. */
  inline_message_id?: string;
  /** Global identifier, uniquely corresponding to the chat to which the message with the callback button was sent. */
  chat_instance: string;
  /** Data associated with the callback button. */
  data?: string;
  /** Short name of a Game to be returned, serves as the unique identifier for the game. */
  game_short_name?: string;
}

/**
 * Represents an incoming inline query.
 */
export interface InlineQuery {
  /** Unique identifier for this query. */
  id: string;
  /** Sender of the inline query. */
  from: User;
  /** Text of the query (up to 256 characters). */
  query: string;
  /** Offset of the results to be returned. */
  offset: string;
  /** Type of the chat from which the inline query was sent ('sender', 'private', 'group', 'supergroup', or 'channel'). */
  chat_type?: "sender" | "private" | "group" | "supergroup" | "channel";
  /** Sender location, only for bots that request user location. */
  location?: Location;
}

/**
 * Represents a result of an inline query that was chosen by the user and sent to their chat partner.
 */
export interface ChosenInlineResult {
  /** The unique identifier for the result that was chosen. */
  result_id: string;
  /** The user that chose the result. */
  from: User;
  /** Sender location, only for bots that require user location. */
  location?: Location;
  /** Identifier of the sent inline message. Available only if there is an inline keyboard attached to the message. */
  inline_message_id?: string;
  /** The query that was used to obtain the result. */
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
  /** Unique query identifier. */
  id: string;
  /** User who sent the query. */
  from: User;
  /** Bot specified invoice payload. */
  invoice_payload: string;
  /** User specified shipping address. */
  shipping_address: ShippingAddress;
}

/**
 * Contains information about an incoming pre-checkout query.
 */
export interface PreCheckoutQuery {
  /** Unique query identifier. */
  id: string;
  /** User who sent the query. */
  from: User;
  /** Three-letter ISO 4217 currency code or 'XTR'. */
  currency: string;
  /** Total price in the smallest units of the currency. */
  total_amount: number;
  /** Bot specified invoice payload. */
  invoice_payload: string;
  /** Identifier of the shipping option chosen by the user. */
  shipping_option_id?: string;
  /** Order info provided by the user. */
  order_info?: OrderInfo;
}

/**
 * Represents changes in the status of a chat member.
 */
export interface ChatMemberUpdated {
  /** Chat, which member status was updated. */
  chat: Chat;
  /** Performer of the action, which resulted in the change. */
  from: User;
  /** Date the change was done in Unix time. */
  date: number;
  /** Previous information about the chat member. */
  old_chat_member: ChatMember;
  /** New information about the chat member. */
  new_chat_member: ChatMember;
  /** Chat invite link, which was used by the user to join the chat. */
  invite_link?: ChatInviteLink;
  /** True, if the user joined the chat after sending a direct join request and being approved. */
  via_join_request?: boolean;
  /** True, if the user joined the chat via a chat folder invite link. */
  via_chat_folder_invite_link?: boolean;
}

/**
 * Contains information about one member of a chat.
 */
export interface ChatMember {
  /** The member's status in the chat ('creator', 'administrator', 'member', 'restricted', 'left', or 'kicked'). */
  status: ChatMemberStatus;
  /** Information about the user. */
  user: User;
  /** Custom title for this user (administrators only). */
  custom_title?: string;
  /** True, if the user's presence in the chat is hidden (administrators only). */
  is_anonymous?: boolean;
  /** True, if the bot is allowed to edit administrator privileges of that user. */
  can_be_edited?: boolean;
  /** True, if the administrator can access the chat event log, get boost list, etc. */
  can_manage_chat?: boolean;
  /** True, if the administrator can delete messages of other users. */
  can_delete_messages?: boolean;
  /** True, if the administrator can manage video chats. */
  can_manage_video_chats?: boolean;
  /** True, if the administrator can restrict, ban or unban chat members. */
  can_restrict_members?: boolean;
  /** True, if the administrator can add new administrators. */
  can_promote_members?: boolean;
  /** True, if the user is allowed to change the chat title, photo and other settings. */
  can_change_info?: boolean;
  /** True, if the user is allowed to invite new users to the chat. */
  can_invite_users?: boolean;
  /** True, if the administrator can post stories to the chat. */
  can_post_stories?: boolean;
  /** True, if the administrator can edit stories posted by other users. */
  can_edit_stories?: boolean;
  /** True, if the administrator can delete stories posted by other users. */
  can_delete_stories?: boolean;
  /** True, if the administrator can post messages in the channel. */
  can_post_messages?: boolean;
  /** True, if the administrator can edit messages of other users. */
  can_edit_messages?: boolean;
  /** True, if the user is allowed to pin messages. */
  can_pin_messages?: boolean;
  /** True, if the user is allowed to create, rename, close, and reopen forum topics. */
  can_manage_topics?: boolean;
  /** Date when restrictions will be lifted for this user; Unix time. */
  until_date?: number;
}

/**
 * Represents an invite link for a chat.
 */
export interface ChatInviteLink {
  /** The invite link as a string. */
  invite_link: string;
  /** Creator of the link. */
  creator: User;
  /** True, if users joining the chat via the link need to be approved by chat administrators. */
  creates_join_request: boolean;
  /** True, if the link is primary. */
  is_primary: boolean;
  /** True, if the link is revoked. */
  is_revoked: boolean;
  /** Invite link name. */
  name?: string;
  /** Point in time (Unix timestamp) when the link will expire or has expired. */
  expire_date?: number;
  /** The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999. */
  member_limit?: number;
  /** Number of pending join requests created using this link. */
  pending_join_request_count?: number;
  /** The number of seconds the subscription will be active for. */
  subscription_period?: number;
  /** The amount of Telegram Stars a user must pay initially and after each subscription period to remain in the chat. */
  subscription_price?: number;
}

/**
 * Represents a join request sent to a chat.
 */
export interface ChatJoinRequest {
  /** Chat to which the request was sent. */
  chat: Chat;
  /** User that sent the join request. */
  from: User;
  /** Identifier of a private chat with the user who sent the join request. */
  user_chat_id: number;
  /** Date the request was sent in Unix time. */
  date: number;
  /** Bio of the user. */
  bio?: string;
  /** Chat invite link that was used by the user to send the join request. */
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
  /** Source of the boost, always 'premium'. */
  source: "premium";
  /** User that boosted the chat. */
  user: User;
}

/**
 * Represents a chat boost source from a gift code.
 */
export interface ChatBoostSourceGiftCode {
  /** Source of the boost, always 'gift_code'. */
  source: "gift_code";
  /** User for which the gift code was created. */
  user: User;
}

/**
 * Represents a chat boost source from a giveaway.
 */
export interface ChatBoostSourceGiveaway {
  /** Source of the boost, always 'giveaway'. */
  source: "giveaway";
  /** Identifier of a message in the chat with the giveaway; the message could have been deleted. */
  giveaway_message_id: number;
  /** User that won the prize in the giveaway if any. */
  user?: User;
  /** The number of Telegram Stars to be split among giveaway winners. */
  prize_star_count?: number;
  /** True, if the giveaway was completed, but no user won the prize. */
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
  /** Chat which was boosted. */
  chat: Chat;
  /** Information about the chat boost. */
  boost: ChatBoost;
}

/**
 * Represents a boost removed from a chat.
 */
export interface ChatBoostRemoved {
  /** Chat which was boosted. */
  chat: Chat;
  /** Unique identifier of the boost. */
  boost_id: string;
  /** Point in time (Unix timestamp) when the boost was removed. */
  remove_date: number;
  /** Source of the removed boost. */
  source: ChatBoostSource;
}

/**
 * Describes the connection of the bot with a business account.
 */
export interface BusinessConnection {
  /** Unique identifier of the business connection. */
  id: string;
  /** Business account user that created the business connection. */
  user: User;
  /** Identifier of a private chat with the user who created the business connection. */
  user_chat_id: number;
  /** Date the connection was established in Unix time. */
  date: number;
  /** True, if the bot can act on behalf of the business account in chats that were active in the last 24 hours. */
  can_reply: boolean;
  /** True, if the connection is active. */
  is_enabled: boolean;
}

/**
 * Received when messages are deleted from a connected business account.
 */
export interface BusinessMessagesDeleted {
  /** Unique identifier of the business connection. */
  business_connection_id: string;
  /** Information about a chat in the business account in which messages were deleted. */
  chat: Chat;
  /** The list of identifiers of deleted messages in the chat of the business account. */
  message_ids: number[];
}

/**
 * Reaction type using normal emoji.
 */
export interface ReactionTypeEmoji {
  /** Type of the reaction, always 'emoji'. */
  type: "emoji";
  /** Reaction emoji. */
  emoji: string;
}

/**
 * Reaction type using custom emoji.
 */
export interface ReactionTypeCustomEmoji {
  /** Type of the reaction, always 'custom_emoji'. */
  type: "custom_emoji";
  /** Custom emoji identifier. */
  custom_emoji_id: string;
}

/**
 * Reaction type for paid reactions.
 */
export interface ReactionTypePaid {
  /** Type of the reaction, always 'paid'. */
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
  /** Type of the reaction. */
  type: ReactionType;
  /** Number of times the reaction was added. */
  total_count: number;
}

/**
 * Represents a change of a reaction on a message performed by a user.
 */
export interface MessageReactionUpdated {
  /** The chat containing the message the user reacted to. */
  chat: Chat;
  /** Unique identifier of the message inside the chat. */
  message_id: number;
  /** The user that changed the reaction, if the user isn't anonymous. */
  user?: User;
  /** The chat on behalf of which the reaction was changed, if the user is anonymous. */
  actor_chat?: Chat;
  /** Date of the change in Unix time. */
  date: number;
  /** Previous list of reaction types that were set by the user for this message. */
  old_reaction: ReactionType[];
  /** New list of reaction types that have been set by the user for this message. */
  new_reaction: ReactionType[];
}

/**
 * Represents reaction changes on a message with anonymous reactions.
 */
export interface MessageReactionCountUpdated {
  /** The chat containing the message. */
  chat: Chat;
  /** Unique message identifier inside the chat. */
  message_id: number;
  /** Date of the change in Unix time. */
  date: number;
  /** List of reactions that are present on the message. */
  reactions: ReactionCount[];
}

/**
 * Represents a user's profile pictures.
 */
export interface UserProfilePhotos {
  /** Total number of profile pictures the target user has. */
  total_count: number;
  /** Requested profile pictures (in up to 4 sizes each). */
  photos: PhotoSize[][];
}

/**
 * Represents a file ready to be downloaded from Telegram.
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
 * Contains information about the current status of a webhook.
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

/**
 * Raw Telegram Update object received from the Bot API.
 */
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
}

/**
 * Generic response envelope returned by all Telegram Bot API endpoints.
 *
 * @typeParam T - The expected payload data type on success.
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

/**
 * Options passed to `getUpdates` requests.
 */
export interface GetUpdatesOptions {
  /** Identifier of the first update to be returned. Must be greater by one than the highest among the identifiers of previously received updates. */
  offset?: number;
  /** Limits the number of updates to be retrieved. Values between 1-100 are accepted. Defaults to 100. */
  limit?: number;
  /** Timeout in seconds for long polling. Defaults to 0, i.e. usual short polling. Should be positive for short polling. */
  timeout?: number;
  /** A list of the update types you want your bot to receive. */
  allowed_updates?: string[];
}

/**
 * Options passed to `sendMessage` requests.
 */
export interface SendMessageOptions {
  /** Unique identifier for the target chat or username of the target channel (in the format @channelusername). */
  chat_id: number | string;
  /** Text of the message to be sent, 1-4096 characters after entities parsing. */
  text: string;
  /** Unique identifier for the target message thread (topic) of the forum; for forum supergroups only. */
  message_thread_id?: number;
  /** Mode for parsing entities in the message text. See ParseMode. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in message text, which can be specified instead of parse_mode. */
  entities?: MessageEntity[];
  /** Link preview generation options for the message. */
  link_preview_options?: unknown;
  /** Sends the message silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Description of the message to reply to. */
  reply_parameters?: {
    /** Identifier of the target that will be replied to. */
    message_id: number;
    /** If the message to be replied to is from a different chat, unique identifier for the chat. */
    chat_id?: number | string;
    /** Pass True if the message should be sent even if the specified replied-to message is not found. */
    allow_sending_without_reply?: boolean;
    /** Quoted part of the message to be replied to. */
    quote?: string;
    /** Mode for parsing entities in the quote. */
    quote_parse_mode?: string;
    /** A list of special entities that appear in the quote. */
    quote_entities?: MessageEntity[];
    /** Position of the quote in the original message in UTF-16 code units. */
    quote_position?: number;
  };
  /** Additional interface options (inline keyboard, custom reply keyboard, instructions to remove reply keyboard or force reply). */
  reply_markup?: ReplyMarkup;
}

/**
 * Options passed to `editMessageText` requests.
 */
export interface EditMessageTextOptions {
  /** New text of the message, 1-4096 characters after entities parsing. */
  text: string;
  /** Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel. */
  chat_id?: number | string;
  /** Required if inline_message_id is not specified. Identifier of the message to edit. */
  message_id?: number;
  /** Required if chat_id and message_id are not specified. Identifier of the inline message. */
  inline_message_id?: string;
  /** Mode for parsing entities in the message text. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in message text. */
  entities?: MessageEntity[];
  /** Link preview generation options for the message. */
  link_preview_options?: unknown;
  /** A JSON-serialized object for an inline keyboard. */
  reply_markup?: InlineKeyboardMarkup;
}

/**
 * Options passed to `editMessageCaption` requests.
 */
export interface EditMessageCaptionOptions {
  /** Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel. */
  chat_id?: number | string;
  /** Required if inline_message_id is not specified. Identifier of the message to edit. */
  message_id?: number;
  /** Required if chat_id and message_id are not specified. Identifier of the inline message. */
  inline_message_id?: string;
  /** New caption of the message, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the message caption. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True, if the caption must be shown above the message media. Supported only for animation, audio and video messages. */
  show_caption_above_media?: boolean;
  /** A JSON-serialized object for an inline keyboard. */
  reply_markup?: InlineKeyboardMarkup;
}

/**
 * Options passed to `editMessageReplyMarkup` requests.
 */
export interface EditMessageReplyMarkupOptions {
  /** Required if inline_message_id is not specified. Unique identifier for the target chat or username of the target channel. */
  chat_id?: number | string;
  /** Required if inline_message_id is not specified. Identifier of the message to edit. */
  message_id?: number;
  /** Required if chat_id and message_id are not specified. Identifier of the inline message. */
  inline_message_id?: string;
  /** A JSON-serialized object for an inline keyboard. */
  reply_markup?: InlineKeyboardMarkup;
}

/**
 * Options passed to `sendPhoto` requests.
 */
export interface SendPhotoOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Photo to send. Pass a file_id as String to send a photo that exists on the Telegram servers, or an HTTP URL, or upload a new photo using InputFile. */
  photo: unknown;
  /** Photo caption (may also be used when resending photos by file_id), 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the photo caption. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True, if the caption must be shown above the message media. */
  show_caption_above_media?: boolean;
  /** Pass True, if the photo needs to be covered with a spoiler animation. */
  has_spoiler?: boolean;
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
  /** Unique identifier for the target message thread (topic) of the forum; for forum supergroups only. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendAudio` requests.
 */
export interface SendAudioOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Audio file to send. Pass a file_id as String, an HTTP URL, or upload a new file using InputFile. */
  audio: unknown;
  /** Audio caption, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the audio caption. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Duration of the audio in seconds. */
  duration?: number;
  /** Performer. */
  performer?: string;
  /** Track name. */
  title?: string;
  /** Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. */
  thumbnail?: unknown;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendDocument` requests.
 */
export interface SendDocumentOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** File to send. Pass a file_id as String, an HTTP URL, or upload a new file using InputFile. */
  document: unknown;
  /** Thumbnail of the file sent. */
  thumbnail?: unknown;
  /** Document caption, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the document caption. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Disables automatic server-side content type detection for files uploaded using multipart/form-data. */
  disable_content_type_detection?: boolean;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendVideo` requests.
 */
export interface SendVideoOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Video to send. Pass a file_id as String, an HTTP URL, or upload a new video file using InputFile. */
  video: unknown;
  /** Duration of sent video in seconds. */
  duration?: number;
  /** Video width. */
  width?: number;
  /** Video height. */
  height?: number;
  /** Thumbnail of the file sent. */
  thumbnail?: unknown;
  /** Video caption, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the video caption. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True, if the caption must be shown above the message media. */
  show_caption_above_media?: boolean;
  /** Pass True, if the video needs to be covered with a spoiler animation. */
  has_spoiler?: boolean;
  /** Pass True, if the uploaded video is suitable for streaming. */
  supports_streaming?: boolean;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendAnimation` requests.
 */
export interface SendAnimationOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Animation file to send. Pass a file_id as String, an HTTP URL, or upload a new file using InputFile. */
  animation: unknown;
  /** Duration of sent animation in seconds. */
  duration?: number;
  /** Animation width. */
  width?: number;
  /** Animation height. */
  height?: number;
  /** Thumbnail of the file sent. */
  thumbnail?: unknown;
  /** Animation caption, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the animation caption. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True, if the caption must be shown above the message media. */
  show_caption_above_media?: boolean;
  /** Pass True, if the animation needs to be covered with a spoiler animation. */
  has_spoiler?: boolean;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendVoice` requests.
 */
export interface SendVoiceOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Audio file to send. Pass a file_id as String, an HTTP URL, or upload a new file using InputFile. */
  voice: unknown;
  /** Voice message caption, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the voice message caption. */
  parse_mode?: ParseMode;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Duration of the voice message in seconds. */
  duration?: number;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendVideoNote` requests.
 */
export interface SendVideoNoteOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Video note to send. Pass a file_id as String, an HTTP URL, or upload a new video using InputFile. */
  video_note: unknown;
  /** Duration of sent video in seconds. */
  duration?: number;
  /** Video width and height (diameter of the video message). */
  length?: number;
  /** Thumbnail of the file sent. */
  thumbnail?: unknown;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Represents photo media item in `sendMediaGroup`.
 */
export interface InputMediaPhoto {
  /** Type of the result, must be 'photo'. */
  type: "photo";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | unknown;
  /** Caption of the photo to be sent, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the photo caption. */
  parse_mode?: ParseMode;
  /** List of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True, if the caption must be shown above the message media. */
  show_caption_above_media?: boolean;
  /** Pass True, if the photo needs to be covered with a spoiler animation. */
  has_spoiler?: boolean;
}

/**
 * Represents video media item in `sendMediaGroup`.
 */
export interface InputMediaVideo {
  /** Type of the result, must be 'video'. */
  type: "video";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | unknown;
  /** Thumbnail of the file sent. */
  thumbnail?: string | unknown;
  /** Caption of the video to be sent, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the video caption. */
  parse_mode?: ParseMode;
  /** List of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True, if the caption must be shown above the message media. */
  show_caption_above_media?: boolean;
  /** Video width. */
  width?: number;
  /** Video height. */
  height?: number;
  /** Video duration in seconds. */
  duration?: number;
  /** Pass True, if the uploaded video is suitable for streaming. */
  supports_streaming?: boolean;
  /** Pass True, if the video needs to be covered with a spoiler animation. */
  has_spoiler?: boolean;
}

/**
 * Represents animation media item in `sendMediaGroup`.
 */
export interface InputMediaAnimation {
  /** Type of the result, must be 'animation'. */
  type: "animation";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | unknown;
  /** Thumbnail of the file sent. */
  thumbnail?: string | unknown;
  /** Caption of the animation to be sent, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the animation caption. */
  parse_mode?: ParseMode;
  /** List of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True, if the caption must be shown above the message media. */
  show_caption_above_media?: boolean;
  /** Animation width. */
  width?: number;
  /** Animation height. */
  height?: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** Pass True, if the animation needs to be covered with a spoiler animation. */
  has_spoiler?: boolean;
}

/**
 * Represents audio media item in `sendMediaGroup`.
 */
export interface InputMediaAudio {
  /** Type of the result, must be 'audio'. */
  type: "audio";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | unknown;
  /** Thumbnail of the file sent. */
  thumbnail?: string | unknown;
  /** Caption of the audio to be sent, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the audio caption. */
  parse_mode?: ParseMode;
  /** List of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Duration of the audio in seconds. */
  duration?: number;
  /** Performer of the audio. */
  performer?: string;
  /** Title of the audio. */
  title?: string;
}

/**
 * Represents document media item in `sendMediaGroup`.
 */
export interface InputMediaDocument {
  /** Type of the result, must be 'document'. */
  type: "document";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | unknown;
  /** Thumbnail of the file sent. */
  thumbnail?: string | unknown;
  /** Caption of the document to be sent, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the document caption. */
  parse_mode?: ParseMode;
  /** List of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Disables automatic server-side content type detection for files. */
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
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** An array describing messages to be sent, must include 2-10 items. */
  media: InputMedia[];
  /** Sends messages silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent messages from forwarding and saving. */
  protect_content?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Description of the message to reply to. */
  reply_parameters?: unknown;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendLocation` requests.
 */
export interface SendLocationOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Latitude of the location. */
  latitude: number;
  /** Longitude of the location. */
  longitude: number;
  /** The radius of uncertainty for the location, measured in meters; 0-1500. */
  horizontal_accuracy?: number;
  /** Period in seconds for which the location will be updated; 60-86400. */
  live_period?: number;
  /** For live locations, a direction in which the user is moving, in degrees; 1-360. */
  heading?: number;
  /** For live locations, a maximum distance for proximity alerts about approaching another chat member, in meters; 1-100000. */
  proximity_alert_radius?: number;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendVenue` requests.
 */
export interface SendVenueOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Latitude of the venue. */
  latitude: number;
  /** Longitude of the venue. */
  longitude: number;
  /** Name of the venue. */
  title: string;
  /** Address of the venue. */
  address: string;
  /** Foursquare identifier of the venue. */
  foursquare_id?: string;
  /** Foursquare type of the venue, if known. */
  foursquare_type?: string;
  /** Google Places identifier of the venue. */
  google_place_id?: string;
  /** Google Places type of the venue. */
  google_place_type?: string;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendContact` requests.
 */
export interface SendContactOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Contact's phone number. */
  phone_number: string;
  /** Contact's first name. */
  first_name: string;
  /** Contact's last name. */
  last_name?: string;
  /** Additional data about the contact in the form of a vCard, 0-2048 bytes. */
  vcard?: string;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendPoll` requests.
 */
export interface SendPollOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Poll question, 1-300 characters. */
  question: string;
  /** A list of 2-10 answer options. */
  options: (string | { text: string })[];
  /** True, if the poll needs to be anonymous, defaults to True. */
  is_anonymous?: boolean;
  /** Poll type, 'quiz' or 'regular', defaults to 'regular'. */
  type?: PollType;
  /** True, if the poll allows multiple answers, ignored for quizzes, defaults to False. */
  allows_multiple_answers?: boolean;
  /** 0-based identifier of the correct answer option, required for polls in quiz mode. */
  correct_option_id?: number;
  /** Text that is shown when a user chooses an incorrect answer or taps on the lamp icon, 0-200 characters. */
  explanation?: string;
  /** Mode for parsing entities in the explanation. */
  explanation_parse_mode?: ParseMode;
  /** A list of special entities that appear in the poll explanation. */
  explanation_entities?: MessageEntity[];
  /** Amount of time in seconds the poll will be active after creation, 5-600. */
  open_period?: number;
  /** Point in time (Unix timestamp) when the poll will be automatically closed. */
  close_date?: number;
  /** Pass True if the poll needs to be immediately closed. */
  is_closed?: boolean;
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendDice` requests.
 */
export interface SendDiceOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Emoji on which the dice throw animation is based. Defaults to '🎲'. */
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
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Options passed to `sendChatAction` requests.
 */
export interface SendChatActionOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Type of action to broadcast (e.g. 'typing', 'upload_photo', 'record_video', etc.). */
  action: ChatAction;
  /** Unique identifier of the business connection on behalf of which the action will be taken. */
  business_connection_id?: string;
  /** Unique identifier for the target message thread; for supergroups only. */
  message_thread_id?: number;
}

/**
 * Options passed to `answerCallbackQuery` requests.
 */
export interface AnswerCallbackQueryOptions {
  /** Unique identifier for the query to be answered. */
  callback_query_id: string;
  /** Text of the notification. If not specified, nothing will be shown to the user, 0-200 characters. */
  text?: string;
  /** If True, an alert will be shown by the client instead of a notification at the top of the chat screen. Defaults to false. */
  show_alert?: boolean;
  /** URL that will be opened by the user's client. */
  url?: string;
  /** The maximum amount of time in seconds that the result of the callback query may be cached client-side. Defaults to 0. */
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
  /** Unique identifier for the answered query. */
  inline_query_id: string;
  /** An array of results for the inline query. */
  results: InlineQueryResult[];
  /** The maximum amount of time in seconds that the result of the inline query may be cached on the server. Defaults to 300. */
  cache_time?: number;
  /** Pass True if results may be cached on the server side only for the user that sent the query. */
  is_personal?: boolean;
  /** Pass the offset that a client should send in the next query with the same text to receive more results. */
  next_offset?: string;
  /** An object describing a button to be shown above inline query results. */
  button?: unknown;
}

/**
 * Options passed to `promoteChatMember` requests.
 */
export interface PromoteChatMemberOptions {
  /** Pass True if the administrator's presence in the chat is hidden. */
  is_anonymous?: boolean;
  /** Pass True if the administrator can access the chat event log, get boost list, see hidden members, etc. */
  can_manage_chat?: boolean;
  /** Pass True if the administrator can post messages in the channel, or access channel statistics; for channels only. */
  can_post_messages?: boolean;
  /** Pass True if the administrator can edit messages of other users and can pin messages; for channels only. */
  can_edit_messages?: boolean;
  /** Pass True if the administrator can delete messages of other users. */
  can_delete_messages?: boolean;
  /** Pass True if the administrator can post stories to the chat. */
  can_post_stories?: boolean;
  /** Pass True if the administrator can edit stories posted by other users. */
  can_edit_stories?: boolean;
  /** Pass True if the administrator can delete stories posted by other users. */
  can_delete_stories?: boolean;
  /** Pass True if the administrator can manage video chats. */
  can_manage_video_chats?: boolean;
  /** Pass True if the administrator can restrict, ban or unban chat members. */
  can_restrict_members?: boolean;
  /** Pass True if the administrator can add new administrators with a subset of their own privileges. */
  can_promote_members?: boolean;
  /** Pass True if the administrator can change chat title, photo and other settings. */
  can_change_info?: boolean;
  /** Pass True if the administrator can invite new users to the chat. */
  can_invite_users?: boolean;
  /** Pass True if the administrator can pin messages; for supergroups only. */
  can_pin_messages?: boolean;
  /** Pass True if the administrator can create, rename, close, and reopen forum topics; for supergroups only. */
  can_manage_topics?: boolean;
}

/**
 * Options passed to `createChatInviteLink` requests.
 */
export interface CreateChatInviteLinkOptions {
  /** Invite link name; 0-32 characters. */
  name?: string;
  /** Point in time (Unix timestamp) when the link will expire. */
  expire_date?: number;
  /** The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999. */
  member_limit?: number;
  /** True, if users joining the chat via the link need to be approved by chat administrators. */
  creates_join_request?: boolean;
}

/**
 * Options passed to `editChatInviteLink` requests.
 */
export interface EditChatInviteLinkOptions {
  /** Invite link name; 0-32 characters. */
  name?: string;
  /** Point in time (Unix timestamp) when the link will expire. */
  expire_date?: number;
  /** The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999. */
  member_limit?: number;
  /** True, if users joining the chat via the link need to be approved by chat administrators. */
  creates_join_request?: boolean;
}

/**
 * Options passed to `setWebhook` requests.
 */
export interface SetWebhookOptions {
  /** HTTPS URL to send updates to. Use an empty string to remove webhook integration. */
  url: string;
  /** Upload your public key certificate so that the root certificate in use can be checked. */
  certificate?: unknown;
  /** The fixed IP address which will be used to send webhook requests. */
  ip_address?: string;
  /** The maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery, 1-100. Defaults to 40. */
  max_connections?: number;
  /** A list of the update types you want your bot to receive. */
  allowed_updates?: string[];
  /** Pass True to drop all pending updates. */
  drop_pending_updates?: boolean;
  /** A secret token to be sent in a header 'X-Telegram-Bot-Api-Secret-Token' in every webhook request, 1-256 characters. */
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
  /** Position in high score table for the game. */
  position: number;
  /** User who scored the points. */
  user: User;
  /** Score value. */
  score: number;
}

/**
 * Abstract base for passport element errors.
 */
export interface PassportElementError {
  /** Error source. */
  source: string;
  /** Type of element of the user's Telegram Passport which has the issue. */
  type: string;
  /** Error message. */
  message: string;
}

/**
 * Represents a list of gifts.
 */
export interface Gifts {
  /** The list of gifts. */
  gifts: Gift[];
}

/**
 * Represents a gift that can be sent by the bot.
 */
export interface Gift {
  /** Unique identifier of the gift. */
  id: string;
  /** The sticker representing the gift. */
  sticker: Sticker;
  /** Number of Telegram Stars that must be paid to send the sticker. */
  star_count: number;
  /** The total number of the gifts of this type that can be sent; for limited gifts only. */
  total_count?: number;
  /** The number of remaining gifts of this type that can be sent; for limited gifts only. */
  remaining_count?: number;
}

/**
 * Represents the boost status of a chat.
 */
export interface UserChatBoosts {
  /** The list of boosts added to the chat by the user. */
  boosts: unknown[];
}

/**
 * Options passed to sendInvoice requests.
 */
export interface SendInvoiceOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Product name, 1-32 characters. */
  title: string;
  /** Product description, 1-255 characters. */
  description: string;
  /** Bot-defined invoice payload, 1-128 bytes. */
  payload: string;
  /** Three-letter ISO 4217 currency code or 'XTR' for Telegram Stars. */
  currency: string;
  /** Price breakdown, a JSON-serialized list of components. */
  prices: LabeledPrice[];
  /** Payment provider token, obtained via @BotFather. Pass an empty string for payments in Telegram Stars. */
  provider_token?: string;
  /** The maximum accepted amount for tips in the smallest units of the currency. */
  max_tip_amount?: number;
  /** A JSON-serialized array of suggested amounts of tips in the smallest units of the currency. */
  suggested_tip_amounts?: number[];
  /** Unique deep-linking parameter. */
  start_parameter?: string;
  /** JSON-serialized data about the invoice, which will be shared with the payment provider. */
  provider_data?: string;
  /** URL of the product photo for the invoice. */
  photo_url?: string;
  /** Photo size in bytes. */
  photo_size?: number;
  /** Photo width. */
  photo_width?: number;
  /** Photo height. */
  photo_height?: number;
  /** Pass True if you require the user's full name to complete the order. */
  need_name?: boolean;
  /** Pass True if you require the user's phone number to complete the order. */
  need_phone_number?: boolean;
  /** Pass True if you require the user's email address to complete the order. */
  need_email?: boolean;
  /** Pass True if you require the user's shipping address to complete the order. */
  need_shipping_address?: boolean;
  /** Pass True if the user's phone number should be sent to the provider. */
  send_phone_number_to_provider?: boolean;
  /** Pass True if the user's email address should be sent to the provider. */
  send_email_to_provider?: boolean;
  /** Pass True if the final price depends on the shipping method. */
  is_flexible?: boolean;
  /** Sends the message silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Description of the message to reply to. */
  reply_parameters?: unknown;
  /** An inline keyboard. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
}

/**
 * Portion of the price of a product or service.
 */
export interface LabeledPrice {
  /** Portion label. */
  label: string;
  /** Price of the product in the smallest units of the currency. */
  amount: number;
}

/**
 * Options for answerShippingQuery requests.
 */
export interface AnswerShippingQueryOptions {
  /** Unique identifier for the query to be answered. */
  shipping_query_id: string;
  /** Pass True if delivery to the specified address is possible and False if there are any problems. */
  ok: boolean;
  /** Required if ok is True. A JSON-serialized array of available shipping options. */
  shipping_options?: ShippingOption[];
  /** Required if ok is False. Error message in human readable form that explains why it is impossible to complete the order. */
  error_message?: string;
}

/**
 * Shipping option for payment.
 */
export interface ShippingOption {
  /** Shipping option identifier. */
  id: string;
  /** Option title. */
  title: string;
  /** List of price portions. */
  prices: LabeledPrice[];
}

/**
 * Options for answerPreCheckoutQuery requests.
 */
export interface AnswerPreCheckoutQueryOptions {
  /** Unique identifier for the query to be answered. */
  pre_checkout_query_id: string;
  /** Specify True if everything is alright and the bot is ready to proceed with the order. Use False if there are any problems. */
  ok: boolean;
  /** Required if ok is False. Error message in human readable form that explains the reason for failure. */
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

// ==========================================
// Bot API 10.0, 10.1 & 10.2 Extensions
// ==========================================

/**
 * Options passed to sendRichMessage requests.
 */
export interface SendRichMessageOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Rich message payload content. */
  rich_message: unknown;
  /** Identifier of the receiver user if targeting a specific user. */
  receiver_user_id?: number;
  /** Identifier of the callback query if answering a query. */
  callback_query_id?: string;
  /** Additional interface options. */
  reply_markup?: unknown;
  /** Unique identifier for the target message thread. */
  message_thread_id?: number;
}

/**
 * Options passed to editEphemeralMessageText requests.
 */
export interface EditEphemeralMessageTextOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Identifier of the message to edit. */
  message_id: number;
  /** New text of the ephemeral message. */
  text: string;
  /** Mode for parsing entities in the message text. */
  parse_mode?: string;
  /** Additional interface options. */
  reply_markup?: unknown;
}
