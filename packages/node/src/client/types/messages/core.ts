import type { MessageEntityType, PollType } from "../../constants.js";
import type { User, Chat, Location } from "../common/index.js";
import type { Story, ChatBoostAdded, Game, PassportData } from "../business/index.js";
import type { Invoice, SuccessfulPayment, RefundedPayment } from "../payments/index.js";
import type { Sticker } from "../stickers/index.js";
import type { Community } from "../chats/index.js";
import type { RichMessage } from "../rich/index.js";

import type {
  PhotoSize,
  Audio,
  Document,
  Video,
  Animation,
  Voice,
  VideoNote,
  LivePhoto,
} from "./media.js";
import type { InlineKeyboardMarkup } from "./keyboards.js";
import type { MessageOrigin, ExternalReplyInfo, TextQuote } from "./reply-context.js";

/**
 * @see {@link https://core.telegram.org/bots/api#messageentity Telegram Bot API: MessageEntity}
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
 * @see {@link https://core.telegram.org/bots/api#contact Telegram Bot API: Contact}
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
 * @see {@link https://core.telegram.org/bots/api#dice Telegram Bot API: Dice}
 */
export interface Dice {
  /** Emoji on which the dice throw animation is based. */
  emoji: string;
  /** Value of the dice (e.g. 1-6 for dice/darts, 1-5 for basketball/football, 1-64 for slot machine). */
  value: number;
}

/**
 * @see {@link https://core.telegram.org/bots/api#polloption Telegram Bot API: PollOption}
 */
export interface PollOption {
  /** Unique identifier of the option in the poll. */
  persistent_id?: string;
  /** Option text, 1-100 characters. */
  text: string;
  /** Number of users that voted for this option. */
  voter_count: number;
  /** Special entities that appear in the option text. */
  text_entities?: MessageEntity[];
}

/**
 * @see {@link https://core.telegram.org/bots/api#poll Telegram Bot API: Poll}
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
  /** Poll type, currently can be "regular" or "quiz". */
  type: PollType;
  /** True, if the poll allows multiple answers. */
  allows_multiple_answers: boolean;
  /** 0-based identifier of the correct answer option. Available only for polls in quiz mode. */
  correct_option_id?: number;
  /** Text that is shown when a user chooses an incorrect answer or taps on the lamp icon; 0-200 characters. */
  explanation?: string;
  /** Special entities that appear in the explanation. */
  explanation_entities?: MessageEntity[];
  /** Amount of time in seconds the poll will be active after creation. */
  open_period?: number;
  /** Point in time (Unix timestamp) when the poll will be automatically closed. */
  close_date?: number;
}

/**
 * @see {@link https://core.telegram.org/bots/api#pollanswer Telegram Bot API: PollAnswer}
 */
export interface PollAnswer {
  /** Unique poll identifier. */
  poll_id: string;
  /** The chat that changed the answer to the poll, if the voter is anonymous. */
  voter_chat?: Chat;
  /** The user, who changed the answer to the poll, if the voter is not anonymous. */
  user?: User;
  /** 0-based identifiers of chosen answer options. May be empty if the user retracted their vote. */
  option_ids: number[];
}

/**
 * @see {@link https://core.telegram.org/bots/api#venue Telegram Bot API: Venue}
 */
export interface Venue {
  /** Venue location. */
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
 * Describes a service message about a chat being joined by a user from a community (Bot API 10.3+).
 *
 * @see {@link https://core.telegram.org/bots/api#communitychatjoined Telegram Bot API: CommunityChatJoined}
 */
export interface CommunityChatJoined {
  /** The community from which the chat was joined. */
  community: Community;
}

/**
 * @see {@link https://core.telegram.org/bots/api#message Telegram Bot API: Message}
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
  /** Service message: a user joined the chat from a community (Bot API 10.3+). */
  community_chat_joined?: CommunityChatJoined;
  /** Receiver user of an ephemeral message. */
  receiver_user?: User;
  /** Ephemeral message identifier. */
  ephemeral_message_id?: number;
  /** Rich formatted message content. */
  rich_message?: RichMessage;
  /** Live photo attachment. */
  live_photo?: LivePhoto;
}
