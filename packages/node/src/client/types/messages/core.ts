import type { MessageEntityType, PollType } from "../../constants.js";
import type { User, Chat, Location } from "../common/index.js";
import type { Story, ChatBoostAdded, Game, PassportData } from "../business/index.js";
import type {
  Invoice,
  SuccessfulPayment,
  RefundedPayment,
  PaidMediaInfo,
  UniqueGiftInfo,
} from "../payments/index.js";
import type { Sticker } from "../stickers/index.js";
import type {
  Community,
  CommunityChatAdded,
  CommunityChatRemoved,
  ChatBackground,
} from "../chats/index.js";
import type {
  ForumTopicClosed,
  ForumTopicCreated,
  ForumTopicEdited,
  ForumTopicReopened,
  GeneralForumTopicHidden,
  GeneralForumTopicUnhidden,
} from "../topics/index.js";
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
import type {
  MessageOrigin,
  ExternalReplyInfo,
  TextQuote,
  LinkPreviewOptions,
} from "./reply-context.js";
import type { Checklist, ChecklistTasksAdded, ChecklistTasksDone } from "./checklist.js";
import type { PollMedia, PollOptionAdded, PollOptionDeleted } from "./polls.js";
import type { UsersShared, ChatShared } from "./shared.js";
import type {
  ChatOwnerChanged,
  ChatOwnerLeft,
  DirectMessagePriceChanged,
  DirectMessagesTopic,
  ManagedBotCreated,
  MessageAutoDeleteTimerChanged,
  PaidMessagePriceChanged,
  ProximityAlertTriggered,
  WebAppData,
  WriteAccessAllowed,
} from "./service-messages.js";
import type { GiftInfo } from "./gifts.js";
import type { Giveaway, GiveawayCompleted, GiveawayCreated, GiveawayWinners } from "./giveaways.js";
import type {
  SuggestedPostApprovalFailed,
  SuggestedPostApproved,
  SuggestedPostDeclined,
  SuggestedPostInfo,
  SuggestedPostPaid,
  SuggestedPostRefunded,
} from "./suggested-posts.js";
import type {
  VideoChatEnded,
  VideoChatParticipantsInvited,
  VideoChatScheduled,
  VideoChatStarted,
} from "./video-chats.js";

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
  /** For 'date_time' only, the Unix time associated with the entity. */
  unix_time?: number;
  /** For 'date_time' only, the string that defines the formatting of the date and time. */
  date_time_format?: string;
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
  /** Unique identifier of the option, persistent on option addition and deletion. */
  persistent_id: string;
  /** Option text, 1-100 characters. */
  text: string;
  /** Special entities that appear in the option text. */
  text_entities?: MessageEntity[];
  /** Media added to the poll option. */
  media?: PollMedia;
  /** Number of users that voted for this option; may be 0 if unknown. */
  voter_count: number;
  /** User who added the option; omitted if the option wasn't added by a user after poll creation. */
  added_by_user?: User;
  /** Chat that added the option; omitted if the option wasn't added by a chat after poll creation. */
  added_by_chat?: Chat;
  /** Point in time (Unix timestamp) when the option was added; omitted if the option existed in the original poll. */
  addition_date?: number;
}

/**
 * @see {@link https://core.telegram.org/bots/api#poll Telegram Bot API: Poll}
 */
export interface Poll {
  /** Unique poll identifier. */
  id: string;
  /** Poll question, 1-300 characters. */
  question: string;
  /** Special entities that appear in the question. */
  question_entities?: MessageEntity[];
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
  /** True, if the poll allows to change the chosen answer options. */
  allows_revoting: boolean;
  /** True, if voting is limited to users who have been members of the chat where the poll was originally sent for more than 24 hours. */
  members_only: boolean;
  /** A list of two-letter ISO 3166-1 alpha-2 country codes indicating the countries from which users can vote in the poll. */
  country_codes?: string[];
  /** Array of 0-based identifiers of the correct answer options. Available only for polls in quiz mode. */
  correct_option_ids?: number[];
  /** Text that is shown when a user chooses an incorrect answer or taps on the lamp icon; 0-200 characters. */
  explanation?: string;
  /** Special entities that appear in the explanation. */
  explanation_entities?: MessageEntity[];
  /** Media added to the quiz explanation. */
  explanation_media?: PollMedia;
  /** Amount of time in seconds the poll will be active after creation. */
  open_period?: number;
  /** Point in time (Unix timestamp) when the poll will be automatically closed. */
  close_date?: number;
  /** Description of the poll; for polls inside the Message object only. */
  description?: string;
  /** Special entities that appear in the description. */
  description_entities?: MessageEntity[];
  /** Media added to the poll description; for polls inside the Message object only. */
  media?: PollMedia;
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
  /** Persistent identifiers of the chosen answer options. May be empty if the vote was retracted. */
  option_persistent_ids: string[];
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
  link_preview_options?: LinkPreviewOptions;
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
  message_auto_delete_timer_changed?: MessageAutoDeleteTimerChanged;
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
  users_shared?: UsersShared;
  /** Service message: a chat was shared with the bot. */
  chat_shared?: ChatShared;
  /** The domain name of the website on which the user has logged in. */
  connected_website?: string;
  /** Service message: the user allowed the bot to write messages after adding it to the attachment menu. */
  write_access_allowed?: WriteAccessAllowed;
  /** Telegram Passport data. */
  passport_data?: PassportData;
  /** Service message: a user in the chat triggered another user's proximity alert while sharing Live Location. */
  proximity_alert_triggered?: ProximityAlertTriggered;
  /** Service message: user boosted the chat. */
  boost_added?: ChatBoostAdded;
  /** Service message: chat background set. */
  chat_background_set?: ChatBackground;
  /** Service message: forum topic created. */
  forum_topic_created?: ForumTopicCreated;
  /** Service message: forum topic edited. */
  forum_topic_edited?: ForumTopicEdited;
  /** Service message: forum topic closed. */
  forum_topic_closed?: ForumTopicClosed;
  /** Service message: forum topic reopened. */
  forum_topic_reopened?: ForumTopicReopened;
  /** Service message: the 'General' forum topic hidden. */
  general_forum_topic_hidden?: GeneralForumTopicHidden;
  /** Service message: the 'General' forum topic unhidden. */
  general_forum_topic_unhidden?: GeneralForumTopicUnhidden;
  /** Service message: a scheduled giveaway was created. */
  giveaway_created?: GiveawayCreated;
  /** The message is a scheduled giveaway. */
  giveaway?: Giveaway;
  /** A giveaway with public winners was completed. */
  giveaway_winners?: GiveawayWinners;
  /** Service message: a giveaway without public winners was completed. */
  giveaway_completed?: GiveawayCompleted;
  /** Service message: video chat scheduled. */
  video_chat_scheduled?: VideoChatScheduled;
  /** Service message: video chat started. */
  video_chat_started?: VideoChatStarted;
  /** Service message: video chat ended. */
  video_chat_ended?: VideoChatEnded;
  /** Service message: new participants invited to a video chat. */
  video_chat_participants_invited?: VideoChatParticipantsInvited;
  /** Service message: data sent by a Web App to the bot. */
  web_app_data?: WebAppData;
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
  /** Message is a checklist. */
  checklist?: Checklist;
  /** Service message: tasks were added to a checklist. */
  checklist_tasks_added?: ChecklistTasksAdded;
  /** Service message: some tasks in a checklist were marked as done or not done. */
  checklist_tasks_done?: ChecklistTasksDone;
  /** Identifier of the specific checklist task that is being replied to. */
  reply_to_checklist_task_id?: number;
  /** Service message: answer option was added to a poll. */
  poll_option_added?: PollOptionAdded;
  /** Service message: answer option was deleted from a poll. */
  poll_option_deleted?: PollOptionDeleted;
  /** Persistent identifier of the specific poll option that is being replied to. */
  reply_to_poll_option_id?: string;
  /** Service message: chat owner has changed. */
  chat_owner_changed?: ChatOwnerChanged;
  /** Service message: chat owner has left. */
  chat_owner_left?: ChatOwnerLeft;
  /** Service message: chat or bot added to a Community. */
  community_chat_added?: CommunityChatAdded;
  /** Service message: chat or bot removed from a Community. */
  community_chat_removed?: CommunityChatRemoved;
  /** Service message: user created a bot that will be managed by the current bot. */
  managed_bot_created?: ManagedBotCreated;
  /** Information about the direct messages chat topic that contains the message. */
  direct_messages_topic?: DirectMessagesTopic;
  /** Service message: the price for paid messages in the corresponding direct messages chat of a channel has changed. */
  direct_message_price_changed?: DirectMessagePriceChanged;
  /** Service message: the price for paid messages has changed in the chat. */
  paid_message_price_changed?: PaidMessagePriceChanged;
  /** Unique identifier of the message effect added to the message. */
  effect_id?: string;
  /** Tag or custom title of the sender of the message; for supergroups only. */
  sender_tag?: string;
  /** True, if the message is a paid post. */
  is_paid_post?: boolean;
  /** The number of Telegram Stars that were paid by the sender of the message to send it. */
  paid_star_count?: number;
  /** Message contains paid media; information about the paid media. */
  paid_media?: PaidMediaInfo;
  /** For a message sent by a guest bot, this is the chat whose original message triggered the bot's response. */
  guest_bot_caller_chat?: Chat;
  /** For a message sent by a guest bot, this is the user whose original message triggered the bot's response. */
  guest_bot_caller_user?: User;
  /** The unique identifier for the guest query, usable with the method answerGuestQuery. */
  guest_query_id?: string;
  /** Service message: a regular gift was sent or received. */
  gift?: GiftInfo;
  /** Service message: upgrade of a gift was purchased after the gift was sent. */
  gift_upgrade_sent?: GiftInfo;
  /** Service message: a unique gift was sent or received. */
  unique_gift?: UniqueGiftInfo;
  /** Information about suggested post parameters if the message is a suggested post in a channel direct messages chat. */
  suggested_post_info?: SuggestedPostInfo;
  /** Service message: a suggested post was approved. */
  suggested_post_approved?: SuggestedPostApproved;
  /** Service message: approval of a suggested post has failed. */
  suggested_post_approval_failed?: SuggestedPostApprovalFailed;
  /** Service message: a suggested post was declined. */
  suggested_post_declined?: SuggestedPostDeclined;
  /** Service message: payment for a suggested post was received. */
  suggested_post_paid?: SuggestedPostPaid;
  /** Service message: payment for a suggested post was refunded. */
  suggested_post_refunded?: SuggestedPostRefunded;
}
