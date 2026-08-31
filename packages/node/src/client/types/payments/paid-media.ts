import type { User } from "../common/index.js";
import type { LivePhoto, PhotoSize, Video } from "../messages/index.js";

/**
 * The paid media is a photo.
 *
 * @see {@link https://core.telegram.org/bots/api#paidmediaphoto Telegram Bot API: PaidMediaPhoto}
 */
export interface PaidMediaPhoto {
  /** Type of the paid media, always "photo". */
  type: "photo";
  /** The photo. */
  photo: PhotoSize[];
}

/**
 * The paid media is a video.
 *
 * @see {@link https://core.telegram.org/bots/api#paidmediavideo Telegram Bot API: PaidMediaVideo}
 */
export interface PaidMediaVideo {
  /** Type of the paid media, always "video". */
  type: "video";
  /** The video. */
  video: Video;
}

/**
 * The paid media is a live photo.
 *
 * @see {@link https://core.telegram.org/bots/api#paidmedialivephoto Telegram Bot API: PaidMediaLivePhoto}
 */
export interface PaidMediaLivePhoto {
  /** Type of the paid media, always "live_photo". */
  type: "live_photo";
  /** The live photo. */
  live_photo: LivePhoto;
}

/**
 * The paid media isn't available before the payment.
 *
 * @see {@link https://core.telegram.org/bots/api#paidmediapreview Telegram Bot API: PaidMediaPreview}
 */
export interface PaidMediaPreview {
  /** Type of the paid media, always "preview". */
  type: "preview";
  /** Media width as defined by the sender. */
  width?: number;
  /** Media height as defined by the sender. */
  height?: number;
  /** Duration of the media in seconds as defined by the sender. */
  duration?: number;
}

/**
 * This object describes paid media.
 *
 * @see {@link https://core.telegram.org/bots/api#paidmedia Telegram Bot API: PaidMedia}
 */
export type PaidMedia = PaidMediaPhoto | PaidMediaVideo | PaidMediaLivePhoto | PaidMediaPreview;

/**
 * Describes the paid media added to a message.
 *
 * @see {@link https://core.telegram.org/bots/api#paidmediainfo Telegram Bot API: PaidMediaInfo}
 */
export interface PaidMediaInfo {
  /** The number of Telegram Stars that must be paid to buy access to the media. */
  star_count: number;
  /** Information about the paid media. */
  paid_media: PaidMedia[];
}

/**
 * This object contains information about a paid media purchase.
 *
 * @see {@link https://core.telegram.org/bots/api#paidmediapurchased Telegram Bot API: PaidMediaPurchased}
 */
export interface PaidMediaPurchased {
  /** User who purchased the media. */
  from: User;
  /** Bot-specified paid media payload. */
  paid_media_payload: string;
}
