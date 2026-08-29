import type { ParseMode } from "../constants.js";
import type { MessageEntity } from "./messages.js";
import type { InputFile } from "../../utils/http.js";

export type { InputFile };

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
 * Represents a general file (as opposed for photos or audio files).
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
 * Represents an animation file (GIF or H.264/MPEG-4 AVC video without sound).
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
 * Represents a video message (round video).
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
 * Represents a Live Photo message object (Bot API 10.3+).
 */
export interface LivePhoto {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file. */
  file_unique_id: string;
  /** Photo width. */
  width: number;
  /** Photo height. */
  height: number;
  /** Available sizes of the photo. */
  photo: PhotoSize[];
  /** Video file associated with the live photo. */
  video: Video;
}

/**
 * Represents a photo to be sent as part of a media group or edited media.
 */
export interface InputMediaPhoto {
  /** Type of the result, must be 'photo'. */
  type: "photo";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile | unknown;
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
 * Represents a video to be sent as part of a media group or edited media.
 */
export interface InputMediaVideo {
  /** Type of the result, must be 'video'. */
  type: "video";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile | unknown;
  /** Thumbnail of the file sent. */
  thumbnail?: string | InputFile | unknown;
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
 * Represents an animation file to be sent as part of a media group or edited media.
 */
export interface InputMediaAnimation {
  /** Type of the result, must be 'animation'. */
  type: "animation";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile | unknown;
  /** Thumbnail of the file sent. */
  thumbnail?: string | InputFile | unknown;
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
 * Represents an audio file to be treated as music to be sent as part of a media group or edited media.
 */
export interface InputMediaAudio {
  /** Type of the result, must be 'audio'. */
  type: "audio";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile | unknown;
  /** Thumbnail of the file sent. */
  thumbnail?: string | InputFile | unknown;
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
 * Represents a general file to be sent as part of a media group or edited media.
 */
export interface InputMediaDocument {
  /** Type of the result, must be 'document'. */
  type: "document";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile | unknown;
  /** Thumbnail of the file sent. */
  thumbnail?: string | InputFile | unknown;
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
 * Union of all input media types that can be sent in a media group or editMessageMedia.
 */
export type InputMedia =
  InputMediaPhoto | InputMediaVideo | InputMediaAnimation | InputMediaAudio | InputMediaDocument;
