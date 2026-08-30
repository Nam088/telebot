import type { ParseMode } from "../../constants.js";
import type { MessageEntity, ReplyParameters } from "./core.js";
import type { ReplyMarkup } from "./keyboards.js";

/**
 * Options for {@link Bot.sendChecklist}.
 *
 * @remarks
 * `checklist` is an InputChecklist object (title, tasks, parse_mode,
 * title_entities, others_can_add_tasks, others_can_mark_tasks_as_done).
 *
 * @see {@link https://core.telegram.org/bots/api#sendchecklist Telegram Bot API: sendChecklist}
 */
export interface SendChecklistOptions {
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id: string;
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Checklist to send. */
  checklist: Record<string, unknown>;
  /** Sends the message silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
}

/**
 * Options for {@link Bot.editMessageChecklist}.
 *
 * @see {@link https://core.telegram.org/bots/api#editmessagechecklist Telegram Bot API: editMessageChecklist}
 */
export interface EditMessageChecklistOptions {
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id: string;
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Identifier of the message to edit. */
  message_id: number;
  /** New checklist content. */
  checklist: Record<string, unknown>;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
}

/**
 * Options for {@link Bot.sendPaidMedia}.
 *
 * @remarks
 * `media` holds up to 10 InputPaidMedia objects (InputPaidMediaPhoto /
 * InputPaidMediaVideo). The JSON-only client can't attach new files, so pass a
 * `file_id` or an HTTP URL.
 *
 * @see {@link https://core.telegram.org/bots/api#sendpaidmedia Telegram Bot API: sendPaidMedia}
 */
export interface SendPaidMediaOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Number of Telegram Stars that must be paid to buy access to the media; 1-25000. */
  star_count: number;
  /** Array describing the media to send; up to 10 items. */
  media: Record<string, unknown>[];
  /** Bot-defined paid media payload, 0-128 bytes. Not shown to the user. */
  payload?: string;
  /** Media caption, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the media caption. */
  parse_mode?: ParseMode | string;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Pass True, if the caption must be shown above the message media. */
  show_caption_above_media?: boolean;
  /** Sends the message silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Pass True to allow paid broadcast of the message. */
  allow_paid_broadcast?: boolean;
  /** Parameters of the suggested post to send in a business chat. */
  suggested_post_parameters?: unknown;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Additional interface options. */
  reply_markup?: ReplyMarkup;
}
