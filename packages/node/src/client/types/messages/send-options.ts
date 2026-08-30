import type { ParseMode, PollType, ChatAction } from "../../constants.js";
import type { SuggestedPostParameters } from "../payments/index.js";
import type { MessageEntity } from "./core.js";
import type { InputMedia } from "./media.js";
import type { InputPollOption } from "./polls.js";
import type { ReplyParameters, EphemeralMessageParameters } from "./reply-context.js";
import type { ReplyMarkup } from "./keyboards.js";

export interface SendMessageOptions {
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
  /** Unique identifier for the target chat or username of the target channel (in the format @channelusername). */
  chat_id: number | string;
  /** Text of the message to be sent, 1-4096 characters after entities parsing. */
  text: string;
  /** Unique identifier for the target message thread (topic) of the forum; for forum supergroups only. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
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
  /** Pass True to allow paid broadcast of the message. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Parameters of the suggested post to send in a business chat. */
  suggested_post_parameters?: SuggestedPostParameters;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options (inline keyboard, custom reply keyboard, instructions to remove reply keyboard or force reply). */
  reply_markup?: ReplyMarkup;
  /** Ephemeral message parameters (Bot API 10.3+). */
  ephemeral_message_parameters?: EphemeralMessageParameters;
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
  /** Pass True to allow paid broadcast of the message. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Parameters of the suggested post to send in a business chat. */
  suggested_post_parameters?: SuggestedPostParameters;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
  /** Ephemeral message parameters (Bot API 10.3+). */
  ephemeral_message_parameters?: EphemeralMessageParameters;
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
  /** Pass True to allow paid broadcast of the message. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Parameters of the suggested post to send in a business chat. */
  suggested_post_parameters?: SuggestedPostParameters;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
  /** Ephemeral message parameters (Bot API 10.3+). */
  ephemeral_message_parameters?: EphemeralMessageParameters;
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
  /** Pass True to allow paid broadcast of the message. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Parameters of the suggested post to send in a business chat. */
  suggested_post_parameters?: SuggestedPostParameters;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
  /** Ephemeral message parameters (Bot API 10.3+). */
  ephemeral_message_parameters?: EphemeralMessageParameters;
}

/**
 * Options for {@link Bot.sendPoll}.
 *
 * @see {@link https://core.telegram.org/bots/api#sendpoll Telegram Bot API: sendPoll}
 */
export interface SendPollOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Poll question, 1-300 characters. */
  question: string;
  /** Mode for parsing entities in the question. */
  question_parse_mode?: ParseMode;
  /** A list of special entities that appear in the poll question. */
  question_entities?: MessageEntity[];
  /** A list of 2-10 answer options. */
  options: InputPollOption[];
  /** True, if the poll needs to be anonymous, defaults to True. */
  is_anonymous?: boolean;
  /** Poll type, 'quiz' or 'regular', defaults to 'regular'. */
  type?: PollType;
  /** True, if the poll allows multiple answers, ignored for quizzes, defaults to False. */
  allows_multiple_answers?: boolean;
  /** Pass True, if the poll allows users to change their vote; polls can't be anonymous if revoting is allowed. */
  allows_revoting?: boolean;
  /** Pass True, if the order of the answer options must be shuffled for each user. */
  shuffle_options?: boolean;
  /** Pass True, if users can add new options to the poll. */
  allow_adding_options?: boolean;
  /** Pass True, if the poll results are hidden until the poll is closed. */
  hide_results_until_closes?: boolean;
  /** Pass True, if the poll is accessible to chat members only. */
  members_only?: boolean;
  /** A list of ISO 3166-1 alpha-2 country codes that restrict which users can participate in the poll. */
  country_codes?: string[];
  /** A list of 0-based identifiers of known answer option(s) that are correct, required for polls in quiz mode. */
  correct_option_ids?: number[];
  /** Text that is shown when a user chooses an incorrect answer or taps on the lamp icon, 0-200 characters. */
  explanation?: string;
  /** Mode for parsing entities in the explanation. */
  explanation_parse_mode?: ParseMode;
  /** A list of special entities that appear in the poll explanation. */
  explanation_entities?: MessageEntity[];
  /** Media that is shown together with the poll explanation. */
  explanation_media?: InputMedia;
  /** Amount of time in seconds the poll will be active after creation, 5-600. */
  open_period?: number;
  /** Point in time (Unix timestamp) when the poll will be automatically closed. */
  close_date?: number;
  /** Pass True if the poll needs to be immediately closed. */
  is_closed?: boolean;
  /** Description of the poll. */
  description?: string;
  /** Mode for parsing entities in the description. */
  description_parse_mode?: ParseMode;
  /** A list of special entities that appear in the description. */
  description_entities?: MessageEntity[];
  /** Media that is shown together with the poll. */
  media?: InputMedia;
  /** Sends the message silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Pass True to allow paid broadcast of the message. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
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
  /** Pass True to allow paid broadcast of the message. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Parameters of the suggested post to send in a business chat. */
  suggested_post_parameters?: SuggestedPostParameters;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
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

export interface SendMessageDraftOptions {
  /** Unique identifier for the target private chat. */
  chat_id: number | string;
  /** Unique identifier of the message draft; must be non-zero. */
  draft_id: number;
  /** Unique identifier for the target message thread. */
  message_thread_id?: number;
  /** Text of the message to be sent, 0-4096 characters. Pass an empty text to show a 'Thinking...' placeholder. */
  text?: string;
  /** Mode for parsing entities in the message text. */
  parse_mode?: ParseMode | string;
  /** A list of special entities that appear in message text. */
  entities?: MessageEntity[];
  /** Pass True to show the user a button to stop further drafts (Bot API 10.3+). */
  can_stop?: boolean;
  /** Pass True to keep the draft in the chat when the button is pressed (Bot API 10.3+). */
  keep_on_stop?: boolean;
}
