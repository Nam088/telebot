import type {
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
  InputMediaPhoto,
  InputMediaVideo,
  EphemeralMessageParameters,
  InlineKeyboardMarkup,
} from "../messages/index.js";
import type { RichBlock } from "./received-blocks.js";
import type { InputMediaVoiceNote, InputRichBlock } from "./input-blocks.js";

/**
 * Represents a rich formatted message received from Telegram.
 *
 * @see {@link https://core.telegram.org/bots/api#richmessage Telegram Bot API: RichMessage}
 */
export interface RichMessage {
  /** Content of the message. */
  blocks: RichBlock[];
  /** True, if the rich message must be shown right-to-left. */
  is_rtl?: boolean;
}

/**
 * Media embedded in an outgoing rich message via tg:// links.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichmessagemedia Telegram Bot API: InputRichMessageMedia}
 */
export interface InputRichMessageMedia {
  /** Unique identifier of the media used in tg:// links (e.g. tg://document?id=doc1). */
  id: string;
  /** The media to be sent. */
  media:
    | InputMediaAnimation
    | InputMediaAudio
    | InputMediaDocument
    | InputMediaPhoto
    | InputMediaVideo
    | InputMediaVoiceNote;
}

/**
 * Outgoing rich message payload to send.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichmessage Telegram Bot API: InputRichMessage}
 */
export interface InputRichMessage {
  /** Content of the rich message to send described as a list of blocks. */
  blocks?: InputRichBlock[];
  /** Content of the rich message to send described using HTML formatting. */
  html?: string;
  /** Content of the rich message to send described using Markdown formatting. */
  markdown?: string;
  /** List of media that are specified in the markdown or html fields using tg:// links. */
  media?: InputRichMessageMedia[];
  /** Pass True if the rich message must be shown right-to-left. */
  is_rtl?: boolean;
  /** Pass True to skip automatic detection of entities in the text. */
  skip_entity_detection?: boolean;
}

/**
 * Content of a rich message to be sent as the result of an inline query.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichmessagecontent Telegram Bot API: InputRichMessageContent}
 */
export interface InputRichMessageContent {
  /** The message to be sent. Only previously uploaded files may be used in the message. */
  rich_message: InputRichMessage;
}

/**
 * Parameters for the sendRichMessage method (Bot API 10.1+).
 */
export interface SendRichMessageOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Rich message content to be sent. */
  rich_message: InputRichMessage;
  /** Unique identifier for the target message thread (topic) of the forum; for forum supergroups only. */
  message_thread_id?: number;
  /** Sends the message silently. Users will receive a notification with no sound. */
  disable_notification?: boolean;
  /** Protects the contents of the sent message from forwarding and saving. */
  protect_content?: boolean;
  /** Additional interface options (InlineKeyboardMarkup). */
  reply_markup?: InlineKeyboardMarkup;
  /** Ephemeral message parameters (Bot API 10.3+). */
  ephemeral_message_parameters?: EphemeralMessageParameters;
}

/**
 * Parameters for the sendRichMessageDraft method (Bot API 10.1+).
 */
export interface SendRichMessageDraftOptions {
  /** Unique identifier for the target chat. */
  chat_id: number | string;
  /** Unique identifier of the draft; 1-1000000000. */
  draft_id: number;
  /** Rich message content of the draft. */
  rich_message: InputRichMessage;
  /** Unique identifier for the target message thread (topic) of the forum; for forum supergroups only. */
  message_thread_id?: number;
  /** Pass True to show a stop generation button in the chat (Bot API 10.3+). */
  can_stop?: boolean;
  /** Pass True to keep the draft message in the chat after stop generation is pressed (Bot API 10.3+). */
  keep_on_stop?: boolean;
}
