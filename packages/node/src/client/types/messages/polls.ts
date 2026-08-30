import type { Link, Location } from "../common/index.js";
import type { Sticker } from "../stickers/index.js";
import type { ParseMode } from "../../constants.js";
import type {
  Animation,
  Audio,
  Document,
  InputMedia,
  LivePhoto,
  PhotoSize,
  Video,
} from "./media.js";
import type { MessageEntity, Venue } from "./core.js";
import type { MaybeInaccessibleMessage } from "./reply-context.js";

/**
 * Contains information about one answer option in a poll to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputpolloption Telegram Bot API: InputPollOption}
 */
export interface InputPollOption {
  /** Option text, 1-100 characters. */
  text: string;
  /** Mode for parsing entities in the text; currently, only custom emoji entities are supported. */
  text_parse_mode?: ParseMode;
  /** A list of special entities that appear in the option text. */
  text_entities?: MessageEntity[];
  /** Media that is shown together with the option. */
  media?: InputMedia;
}

/**
 * Describes media added to a poll or a poll option.
 *
 * @remarks
 * At most one of the optional fields can be present in any given object.
 *
 * @see {@link https://core.telegram.org/bots/api#pollmedia Telegram Bot API: PollMedia}
 */
export interface PollMedia {
  /** Media is an animation, information about the animation. */
  animation?: Animation;
  /** Media is an audio file, information about the file; currently, can't be received in a poll. */
  audio?: Audio;
  /** Media is a general file, information about the file; currently, can't be received in a poll. */
  document?: Document;
  /** The HTTP link attached to the poll option. */
  link?: Link;
  /** Media is a live photo, information about the live photo. */
  live_photo?: LivePhoto;
  /** Media is a shared location, information about the location. */
  location?: Location;
  /** Media is a photo, available sizes of the photo. */
  photo?: PhotoSize[];
  /** Media is a sticker, information about the sticker; currently, for poll options only. */
  sticker?: Sticker;
  /** Media is a venue, information about the venue. */
  venue?: Venue;
  /** Media is a video, information about the video. */
  video?: Video;
}

/**
 * Describes a service message about an option added to a poll.
 *
 * @see {@link https://core.telegram.org/bots/api#polloptionadded Telegram Bot API: PollOptionAdded}
 */
export interface PollOptionAdded {
  /**
   * Message containing the poll to which the option was added, if known.
   *
   * @remarks
   * The `Message` object in this field will not contain the `reply_to_message` field even if it
   * itself is a reply.
   */
  poll_message?: MaybeInaccessibleMessage;
  /** Unique identifier of the added option. */
  option_persistent_id: string;
  /** Option text. */
  option_text: string;
  /** Special entities that appear in the option_text. */
  option_text_entities?: MessageEntity[];
}

/**
 * Describes a service message about an option deleted from a poll.
 *
 * @see {@link https://core.telegram.org/bots/api#polloptiondeleted Telegram Bot API: PollOptionDeleted}
 */
export interface PollOptionDeleted {
  /**
   * Message containing the poll from which the option was deleted, if known.
   *
   * @remarks
   * The `Message` object in this field will not contain the `reply_to_message` field even if it
   * itself is a reply.
   */
  poll_message?: MaybeInaccessibleMessage;
  /** Unique identifier of the deleted option. */
  option_persistent_id: string;
  /** Option text. */
  option_text: string;
  /** Special entities that appear in the option_text. */
  option_text_entities?: MessageEntity[];
}
