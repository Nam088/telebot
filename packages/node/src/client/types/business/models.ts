import type { InputFile } from "../../../utils/http.js";
import type { User, Chat, Location } from "../common/index.js";
import type {
  MessageEntity,
  PhotoSize,
  Animation,
  Message,
  ReactionType,
} from "../messages/index.js";
import type { Sticker } from "../stickers/index.js";

/**
 * @see {@link https://core.telegram.org/bots/api#businessintro Telegram Bot API: BusinessIntro}
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
 * @see {@link https://core.telegram.org/bots/api#businesslocation Telegram Bot API: BusinessLocation}
 */
export interface BusinessLocation {
  /** Address of the business. */
  address: string;
  /** Location of the business. */
  location?: Location;
}

/**
 * @see {@link https://core.telegram.org/bots/api#businessopeninghoursinterval Telegram Bot API: BusinessOpeningHoursInterval}
 */
export interface BusinessOpeningHoursInterval {
  /** The minute's sequence number in a week (0-10079) when the business opens in UTC+0. */
  opening_minute: number;
  /** The minute's sequence number in a week (1-10080) when the business closes in UTC+0. */
  closing_minute: number;
}

/**
 * @see {@link https://core.telegram.org/bots/api#businessopeninghours Telegram Bot API: BusinessOpeningHours}
 */
export interface BusinessOpeningHours {
  /** Unique name of the time zone. */
  time_zone_name: string;
  /** List of time intervals during which the business is open. */
  opening_hours: BusinessOpeningHoursInterval[];
}

/**
 * @see {@link https://core.telegram.org/bots/api#storyareaposition Telegram Bot API: StoryAreaPosition}
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
 * @see {@link https://core.telegram.org/bots/api#storyarea Telegram Bot API: StoryArea}
 */
export interface StoryArea {
  /** Position of the story area. */
  position: StoryAreaPosition;
  /** Type of the story area. */
  type: StoryAreaType;
}

/**
 * @see {@link https://core.telegram.org/bots/api#story Telegram Bot API: Story}
 */
export interface Story {
  /** Chat that posted the story. */
  chat: Chat;
  /** Unique identifier of the story in the chat. */
  id: number;
}

/**
 * @see {@link https://core.telegram.org/bots/api#inputstorycontentphoto Telegram Bot API: InputStoryContentPhoto}
 */
export interface InputStoryContentPhoto {
  /** Type of the content, must be photo. */
  type: "photo";
  /** File to send. Pass a file_id, HTTP URL, or upload via InputFile. */
  photo: string | InputFile;
}

/**
 * @see {@link https://core.telegram.org/bots/api#inputstorycontentvideo Telegram Bot API: InputStoryContentVideo}
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
 * @see {@link https://core.telegram.org/bots/api#callbackquery Telegram Bot API: CallbackQuery}
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
 * @see {@link https://core.telegram.org/bots/api#inlinequery Telegram Bot API: InlineQuery}
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
 * @see {@link https://core.telegram.org/bots/api#choseninlineresult Telegram Bot API: ChosenInlineResult}
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
 * @see {@link https://core.telegram.org/bots/api#chatboostadded Telegram Bot API: ChatBoostAdded}
 */
export interface ChatBoostAdded {
  /** Number of boosts added by the user. */
  boost_count: number;
}

/**
 * @see {@link https://core.telegram.org/bots/api#chatboostsourcepremium Telegram Bot API: ChatBoostSourcePremium}
 */
export interface ChatBoostSourcePremium {
  /** Source of the boost, always 'premium'. */
  source: "premium";
  /** User that boosted the chat. */
  user: User;
}

/**
 * @see {@link https://core.telegram.org/bots/api#chatboostsourcegiftcode Telegram Bot API: ChatBoostSourceGiftCode}
 */
export interface ChatBoostSourceGiftCode {
  /** Source of the boost, always 'gift_code'. */
  source: "gift_code";
  /** User for which the gift code was created. */
  user: User;
}

/**
 * @see {@link https://core.telegram.org/bots/api#chatboostsourcegiveaway Telegram Bot API: ChatBoostSourceGiveaway}
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
 * @see {@link https://core.telegram.org/bots/api#chatboost Telegram Bot API: ChatBoost}
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
 * @see {@link https://core.telegram.org/bots/api#chatboostupdated Telegram Bot API: ChatBoostUpdated}
 */
export interface ChatBoostUpdated {
  /** Chat which was boosted. */
  chat: Chat;
  /** Information about the chat boost. */
  boost: ChatBoost;
}

/**
 * @see {@link https://core.telegram.org/bots/api#chatboostremoved Telegram Bot API: ChatBoostRemoved}
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
 * Represents the rights of a business bot.
 *
 * @remarks
 * Every right is optional and, when present, is always `true`; a missing field
 * means the bot does not hold that right.
 *
 * @see {@link https://core.telegram.org/bots/api#businessbotrights Telegram Bot API: BusinessBotRights}
 */
export interface BusinessBotRights {
  /** True, if the bot can send and edit messages in the private chats that had incoming messages in the last 24 hours. */
  can_reply?: boolean;
  /** True, if the bot can mark incoming private messages as read. */
  can_read_messages?: boolean;
  /** True, if the bot can delete messages sent by the bot. */
  can_delete_sent_messages?: boolean;
  /** True, if the bot can delete all private messages in managed chats. */
  can_delete_all_messages?: boolean;
  /** True, if the bot can edit the first and last name of the business account. */
  can_edit_name?: boolean;
  /** True, if the bot can edit the bio of the business account. */
  can_edit_bio?: boolean;
  /** True, if the bot can edit the profile photo of the business account. */
  can_edit_profile_photo?: boolean;
  /** True, if the bot can edit the username of the business account. */
  can_edit_username?: boolean;
  /** True, if the bot can change the privacy settings pertaining to gifts for the business account. */
  can_change_gift_settings?: boolean;
  /** True, if the bot can view gifts and the amount of Telegram Stars owned by the business account. */
  can_view_gifts_and_stars?: boolean;
  /** True, if the bot can convert regular gifts owned by the business account to Telegram Stars. */
  can_convert_gifts_to_stars?: boolean;
  /** True, if the bot can transfer and upgrade gifts owned by the business account. */
  can_transfer_and_upgrade_gifts?: boolean;
  /** True, if the bot can transfer Telegram Stars received by the business account to its own account, or use them to upgrade and transfer gifts. */
  can_transfer_stars?: boolean;
  /** True, if the bot can post, edit and delete stories on behalf of the business account. */
  can_manage_stories?: boolean;
}

/**
 * @see {@link https://core.telegram.org/bots/api#businessconnection Telegram Bot API: BusinessConnection}
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
  /** Rights of the business bot. Replaced the top-level `can_reply` field in Bot API 10.3. */
  rights?: BusinessBotRights;
  /** True, if the connection is active. */
  is_enabled: boolean;
}

/**
 * @see {@link https://core.telegram.org/bots/api#businessmessagesdeleted Telegram Bot API: BusinessMessagesDeleted}
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
 * @see {@link https://core.telegram.org/bots/api#gamehighscore Telegram Bot API: GameHighScore}
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
 * @see {@link https://core.telegram.org/bots/api#passportelementerror Telegram Bot API: PassportElementError}
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
 * @see {@link https://core.telegram.org/bots/api#callbackgame Telegram Bot API: CallbackGame}
 */
export interface CallbackGame {
  [key: string]: unknown;
}

/**
 * @see {@link https://core.telegram.org/bots/api#game Telegram Bot API: Game}
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
 * @see {@link https://core.telegram.org/bots/api#passportdata Telegram Bot API: PassportData}
 */
export interface PassportData {
  /** Array with information about documents and other Telegram Passport elements. */
  data: EncryptedPassportElement[];
  /** Encrypted credentials required to decrypt the data. */
  credentials: EncryptedCredentials;
}

/**
 * @see {@link https://core.telegram.org/bots/api#encryptedpassportelement Telegram Bot API: EncryptedPassportElement}
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
 * @see {@link https://core.telegram.org/bots/api#passportfile Telegram Bot API: PassportFile}
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
 * @see {@link https://core.telegram.org/bots/api#encryptedcredentials Telegram Bot API: EncryptedCredentials}
 */
export interface EncryptedCredentials {
  /** Base64-encoded encrypted JSON-serialized data. */
  data: string;
  /** Base64-encoded data hash for verification. */
  hash: string;
  /** Base64-encoded secret hash for verification. */
  secret: string;
}

export type StoryAreaType =
  | { type: "location"; location: Location; address?: unknown }
  | {
      type: "suggested_reaction";
      reaction_type: ReactionType;
      is_dark?: boolean;
      is_flipped?: boolean;
    }
  | { type: "link"; url: string }
  | { type: "weather"; temperature_c: number; emoji: string; background_color: number };

export type InputStoryContent = InputStoryContentPhoto | InputStoryContentVideo;

export type ChatBoostSource =
  ChatBoostSourcePremium | ChatBoostSourceGiftCode | ChatBoostSourceGiveaway;

export type InlineQueryResult = Record<string, unknown>;
