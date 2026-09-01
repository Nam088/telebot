import type { ParseMode } from "../../constants.js";
import type { StoryArea, InlineQueryResult } from "../business/index.js";
import type { MessageEntity, ReactionType, InputFile } from "../messages/index.js";
import type { InlineQueryResultsButton } from "./models.js";

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
  button?: InlineQueryResultsButton;
}

export interface SetWebhookOptions {
  /** HTTPS URL to send updates to. Use an empty string to remove webhook integration. */
  url: string;
  /** Upload your public key certificate so that the root certificate in use can be checked. */
  certificate?: InputFile;
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
 * Options for {@link Bot.postStory} (excludes the positional `business_connection_id` and `content`).
 *
 * @remarks
 * `active_period` must be one of 21600, 43200, 86400, or 172800.
 *
 * @see {@link https://core.telegram.org/bots/api#poststory Telegram Bot API: postStory}
 */
export interface PostStoryOptions {
  /** Period after which the story is moved to the archive, in seconds; must be one of 21600, 43200, 86400, or 172800. */
  active_period: number;
  /** Story caption, 0-1024 characters. */
  caption?: string;
  /** Mode for parsing entities in the story caption. */
  parse_mode?: ParseMode | string;
  /** List of special entities that appear in the story caption. */
  caption_entities?: MessageEntity[];
  /** List of story areas to add to the story. */
  areas?: StoryArea[];
  /** Pass True if the story must be posted on the channel page. */
  post_to_chat_page?: boolean;
  /** Pass True if the content of the story must be protected from forwarding and saving. */
  protect_content?: boolean;
}

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
