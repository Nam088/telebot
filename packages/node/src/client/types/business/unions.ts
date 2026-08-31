import type { Location } from "../common/index.js";
import type { ReactionType } from "../messages/index.js";
import type {
  ChatBoostSourceGiftCode,
  ChatBoostSourceGiveaway,
  ChatBoostSourcePremium,
  InputStoryContentPhoto,
  InputStoryContentVideo,
} from "./models.js";

/**
 * Describes the type of a clickable area on a story.
 *
 * @see {@link https://core.telegram.org/bots/api#storyareatype Telegram Bot API: StoryAreaType}
 */
export type StoryAreaType =
  | { type: "location"; location: Location; address?: unknown }
  | {
      type: "suggested_reaction";
      reaction_type: ReactionType;
      is_dark?: boolean;
      is_flipped?: boolean;
    }
  | { type: "link"; url: string }
  | { type: "weather"; temperature_c: number; emoji: string; background_color: number };

/**
 * This object describes the content of a story to post.
 *
 * @see {@link https://core.telegram.org/bots/api#inputstorycontent Telegram Bot API: InputStoryContent}
 */
export type InputStoryContent = InputStoryContentPhoto | InputStoryContentVideo;

/**
 * This object describes the source of a chat boost.
 *
 * @see {@link https://core.telegram.org/bots/api#chatboostsource Telegram Bot API: ChatBoostSource}
 */
export type ChatBoostSource =
  ChatBoostSourcePremium | ChatBoostSourceGiftCode | ChatBoostSourceGiveaway;

/**
 * This object represents one result of an inline query.
 *
 * @remarks
 * Telegram clients currently support results of 20 concrete types; the framework keeps the variant
 * payload loosely typed so bots can pass any of them through unchanged.
 *
 * @see {@link https://core.telegram.org/bots/api#inlinequeryresult Telegram Bot API: InlineQueryResult}
 */
export type InlineQueryResult = Record<string, unknown>;
