import type {
  ChatType,
  ParseMode,
  MessageEntityType,
  PollType,
  ChatMemberStatus,
  ChatAction,
} from "../constants.js";
import type { InputFile } from "../../utils/http.js";
import type { User, Chat, Location, File } from "./common.js";
import type { Story, ChatBoostAdded, CallbackGame, Game, PassportData } from "./business.js";
import type { Invoice, SuccessfulPayment, RefundedPayment } from "./payments.js";
import type { Sticker } from "./stickers.js";

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

export interface Dice {
  /** Emoji on which the dice throw animation is based. */
  emoji: string;
  /** Value of the dice (e.g. 1-6 for dice/darts, 1-5 for basketball/football, 1-64 for slot machine). */
  value: number;
}

export interface PollOption {
  /** Option text, 1-100 characters. */
  text: string;
  /** Number of users that voted for this option. */
  voter_count: number;
  /** Special entities that appear in the option text. */
  text_entities?: MessageEntity[];
}

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

export interface InlineKeyboardMarkup {
  /** Array of button rows, each represented by an Array of InlineKeyboardButton objects. */
  inline_keyboard: InlineKeyboardButton[][];
}

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

export interface ReplyKeyboardRemove {
  /** Requests clients to remove the custom keyboard. */
  remove_keyboard: true;
  /** Use this parameter if you want to remove the keyboard for specific users only. */
  selective?: boolean;
}

export interface ForceReply {
  /** Shows reply interface to the user, as if they had selected the bot's message and tapped 'Reply'. */
  force_reply: true;
  /** The placeholder to be shown in the input field when the reply is active; 1-64 characters. */
  input_field_placeholder?: string;
  /** Use this parameter if you want to force reply from specific users only. */
  selective?: boolean;
}

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

export interface ReactionTypeEmoji {
  /** Type of the reaction, always 'emoji'. */
  type: "emoji";
  /** Reaction emoji. */
  emoji: string;
}

export interface ReactionTypeCustomEmoji {
  /** Type of the reaction, always 'custom_emoji'. */
  type: "custom_emoji";
  /** Custom emoji identifier. */
  custom_emoji_id: string;
}

export interface ReactionTypePaid {
  /** Type of the reaction, always 'paid'. */
  type: "paid";
}

export interface ReactionCount {
  /** Type of the reaction. */
  type: ReactionType;
  /** Number of times the reaction was added. */
  total_count: number;
}

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

export interface StopPollOptions {
  /** Inline keyboard markup. */
  reply_markup?: InlineKeyboardMarkup;
  /** Unique identifier of the business connection on behalf of which the message was sent. */
  business_connection_id?: string;
}

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

export type ReplyMarkup =
  InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;

export type ReactionType = ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid;

export type InputMedia =
  InputMediaPhoto | InputMediaVideo | InputMediaAnimation | InputMediaAudio | InputMediaDocument;
