import type { ParseMode } from "../../constants.js";
import type { SuggestedPostParameters } from "../payments/index.js";
import type { MessageEntity } from "./core.js";
import type { ReplyParameters, EphemeralMessageParameters } from "./reply-context.js";
import type { ReplyMarkup } from "./keyboards.js";
import type { InputMedia, InputFile } from "./media.js";

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
  /** Unique identifier for the target message thread (topic) of the forum; for forum supergroups only. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
  /** Ephemeral message parameters (Bot API 10.3+). */
  ephemeral_message_parameters?: EphemeralMessageParameters;
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
 * Options for {@link Bot.sendLivePhoto}.
 *
 * @see {@link https://core.telegram.org/bots/api#sendlivephoto Telegram Bot API: sendLivePhoto}
 */
export interface SendLivePhotoOptions {
  /** Unique identifier for the target chat or username of the target channel. */
  chat_id: number | string;
  /** Live photo video to send. Pass a file_id as String, an HTTP URL, or upload a new video using InputFile. */
  live_photo: string | InputFile;
  /** Static photo to send as the live photo cover. Pass a file_id as String, an HTTP URL, or upload a new photo using InputFile. */
  photo: string | InputFile;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
  /** Unique identifier for the target message thread (topic) of the forum; for forum supergroups only. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
  /** Live photo caption, 0-1024 characters after entities parsing. */
  caption?: string;
  /** Mode for parsing entities in the photo caption. */
  parse_mode?: ParseMode | string;
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
  /** Ephemeral message parameters (Bot API 10.3+). */
  ephemeral_message_parameters?: EphemeralMessageParameters;
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
  /** Pass True to allow paid broadcast of the message. */
  allow_paid_broadcast?: boolean;
  /** Unique identifier of the message effect to be added to the message. */
  message_effect_id?: string;
  /** Description of the message to reply to. */
  reply_parameters?: ReplyParameters;
  /** Unique identifier of the business connection on behalf of which the message will be sent. */
  business_connection_id?: string;
  /** Unique identifier for the target message thread (topic) of the forum. */
  message_thread_id?: number;
  /** Identifier of the topic the message will be sent to in a direct messages chat. */
  direct_messages_topic_id?: number;
}
