import type { ParseMode } from "../../constants.js";
import type { MessageEntity } from "./core.js";
import type { InputFile } from "../../../utils/http.js";

export type { InputFile };

/**
 * Represents one size of a photo or a file / sticker thumbnail.
 *
 * @see {@link https://core.telegram.org/bots/api#photosize Telegram Bot API: PhotoSize}
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
 *
 * @see {@link https://core.telegram.org/bots/api#audio Telegram Bot API: Audio}
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
 *
 * @see {@link https://core.telegram.org/bots/api#document Telegram Bot API: Document}
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
 * Represents a video file of a specific quality.
 *
 * @see {@link https://core.telegram.org/bots/api#videoquality Telegram Bot API: VideoQuality}
 */
export interface VideoQuality {
  /** Identifier for this file, which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for this file, which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Video width. */
  width: number;
  /** Video height. */
  height: number;
  /** Codec that was used to encode the video, for example, "h264", "h265", or "av01". */
  codec: string;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Represents a video file.
 *
 * @see {@link https://core.telegram.org/bots/api#video Telegram Bot API: Video}
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
  /** Available sizes of the cover of the video in the message. */
  cover?: PhotoSize[];
  /** Timestamp in seconds from which the video will play in the message. */
  start_timestamp?: number;
  /** List of available qualities of the video. */
  qualities?: VideoQuality[];
  /** Original filename as defined by sender. */
  file_name?: string;
  /** MIME type of the file as defined by sender. */
  mime_type?: string;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Represents an animation file (GIF or H.264/MPEG-4 AVC video without sound).
 *
 * @see {@link https://core.telegram.org/bots/api#animation Telegram Bot API: Animation}
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
 *
 * @see {@link https://core.telegram.org/bots/api#voice Telegram Bot API: Voice}
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
 *
 * @see {@link https://core.telegram.org/bots/api#videonote Telegram Bot API: VideoNote}
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
 *
 * @see {@link https://core.telegram.org/bots/api#livephoto Telegram Bot API: LivePhoto}
 */
export interface LivePhoto {
  /** Available sizes of the corresponding static photo. */
  photo?: PhotoSize[];
  /** Identifier for the video file which can be used to download or reuse the file. */
  file_id: string;
  /** Unique identifier for the video file which is supposed to be the same over time and for different bots. */
  file_unique_id: string;
  /** Video width as defined by the sender. */
  width: number;
  /** Video height as defined by the sender. */
  height: number;
  /** Duration of the video in seconds as defined by the sender. */
  duration: number;
  /** MIME type of the file as defined by the sender. */
  mime_type?: string;
  /** File size in bytes. */
  file_size?: number;
}

/**
 * Represents a photo to be sent as part of a media group or edited media.
 *
 * @see {@link https://core.telegram.org/bots/api#inputmediaphoto Telegram Bot API: InputMediaPhoto}
 */
export interface InputMediaPhoto {
  /** Type of the result, must be 'photo'. */
  type: "photo";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile;
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
 *
 * @see {@link https://core.telegram.org/bots/api#inputmediavideo Telegram Bot API: InputMediaVideo}
 */
export interface InputMediaVideo {
  /** Type of the result, must be 'video'. */
  type: "video";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile;
  /** Thumbnail of the file sent. */
  thumbnail?: string | InputFile;
  /** Cover for the video in the message. Pass a file_id, an HTTP URL, or upload using InputFile. */
  cover?: string | InputFile;
  /** Start timestamp for the video in the message. */
  start_timestamp?: number;
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
 *
 * @see {@link https://core.telegram.org/bots/api#inputmediaanimation Telegram Bot API: InputMediaAnimation}
 */
export interface InputMediaAnimation {
  /** Type of the result, must be 'animation'. */
  type: "animation";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile;
  /** Thumbnail of the file sent. */
  thumbnail?: string | InputFile;
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
 *
 * @see {@link https://core.telegram.org/bots/api#inputmediaaudio Telegram Bot API: InputMediaAudio}
 */
export interface InputMediaAudio {
  /** Type of the result, must be 'audio'. */
  type: "audio";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile;
  /** Thumbnail of the file sent. */
  thumbnail?: string | InputFile;
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
 *
 * @see {@link https://core.telegram.org/bots/api#inputmediadocument Telegram Bot API: InputMediaDocument}
 */
export interface InputMediaDocument {
  /** Type of the result, must be 'document'. */
  type: "document";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, an HTTP URL, or upload using InputFile. */
  media: string | InputFile;
  /** Thumbnail of the file sent. */
  thumbnail?: string | InputFile;
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
 *
 * @see {@link https://core.telegram.org/bots/api#inputmedia Telegram Bot API: InputMedia}
 */
export type InputMedia =
  InputMediaPhoto | InputMediaVideo | InputMediaAnimation | InputMediaAudio | InputMediaDocument;

/**
 * The paid media to send is a photo.
 *
 * @see {@link https://core.telegram.org/bots/api#inputpaidmediaphoto Telegram Bot API: InputPaidMediaPhoto}
 */
export interface InputPaidMediaPhoto {
  /** Type of the media, must be 'photo'. */
  type: "photo";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, or an HTTP URL. */
  media: string;
}

/**
 * The paid media to send is a video.
 *
 * @see {@link https://core.telegram.org/bots/api#inputpaidmediavideo Telegram Bot API: InputPaidMediaVideo}
 */
export interface InputPaidMediaVideo {
  /** Type of the media, must be 'video'. */
  type: "video";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, or an HTTP URL. */
  media: string;
  /** Thumbnail of the file sent. */
  thumbnail?: string;
  /** Cover for the video in the message. */
  cover?: string;
  /** Start timestamp for the video in the message. */
  start_timestamp?: number;
  /** Video width. */
  width?: number;
  /** Video height. */
  height?: number;
  /** Video duration in seconds. */
  duration?: number;
  /** Pass True, if the uploaded video is suitable for streaming. */
  supports_streaming?: boolean;
}

/**
 * The paid media to send is a live photo.
 *
 * @see {@link https://core.telegram.org/bots/api#inputpaidmedialivephoto Telegram Bot API: InputPaidMediaLivePhoto}
 */
export interface InputPaidMediaLivePhoto {
  /** Type of the media, must be 'live_photo'. */
  type: "live_photo";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, or an HTTP URL. */
  media: string;
  /** Photo to send. Pass a file_id to send a file that exists on the Telegram servers, or an HTTP URL. */
  photo: string;
}

/**
 * Describes the paid media to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputpaidmedia Telegram Bot API: InputPaidMedia}
 */
export type InputPaidMedia = InputPaidMediaPhoto | InputPaidMediaVideo | InputPaidMediaLivePhoto;
