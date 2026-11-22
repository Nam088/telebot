import type { ParseMode } from "../../constants.js";
import type { MessageEntity } from "../messages/index.js";
import type { UniqueGift, UniqueGiftBackdropColors } from "../payments/index.js";

/**
 * Describes a standard Unicode emoji.
 *
 * @see {@link https://core.telegram.org/bots/api#emojitypeemoji Telegram Bot API: EmojiTypeEmoji}
 */
export interface EmojiTypeEmoji {
  /** Type of the emoji, always 'emoji'. */
  type: "emoji";
  /** The Unicode emoji string. */
  emoji: string;
}

/**
 * Describes a custom emoji.
 *
 * @see {@link https://core.telegram.org/bots/api#emojitypecustomemoji Telegram Bot API: EmojiTypeCustomEmoji}
 */
export interface EmojiTypeCustomEmoji {
  /** Type of the emoji, always 'custom_emoji'. */
  type: "custom_emoji";
  /** Unique identifier of the custom emoji. */
  custom_emoji_id: string;
}

/**
 * Describes an emoji used in a chat share theme.
 *
 * @see {@link https://core.telegram.org/bots/api#emojitype Telegram Bot API: EmojiType}
 */
export type EmojiType = EmojiTypeEmoji | EmojiTypeCustomEmoji;

/**
 * Describes a chat share theme based on emojis.
 *
 * @see {@link https://core.telegram.org/bots/api#chatsharethemeemoji Telegram Bot API: ChatShareThemeEmoji}
 */
export interface ChatShareThemeEmoji {
  /** Type of the theme, always 'emoji'. */
  type: "emoji";
  /** List of emojis in the theme. */
  emojis: EmojiType[];
  /** Identifier of the background backdrop, if any. */
  background_backdrop_id?: number;
}

/**
 * Describes a chat share theme based on a unique gift.
 *
 * @see {@link https://core.telegram.org/bots/api#chatsharethemeuniquegift Telegram Bot API: ChatShareThemeUniqueGift}
 */
export interface ChatShareThemeUniqueGift {
  /** Type of the theme, always 'unique_gift'. */
  type: "unique_gift";
  /** The unique gift defining the theme. */
  gift: UniqueGift;
}

/**
 * Describes the theme of the screen for sharing a link to a user or a chat.
 *
 * @see {@link https://core.telegram.org/bots/api#chatsharetheme Telegram Bot API: ChatShareTheme}
 */
export type ChatShareTheme = ChatShareThemeEmoji | ChatShareThemeUniqueGift;

/**
 * Describes a backdrop for a chat share theme.
 *
 * @see {@link https://core.telegram.org/bots/api#chatsharethemebackdrop Telegram Bot API: ChatShareThemeBackdrop}
 */
export interface ChatShareThemeBackdrop {
  /** Unique identifier of the backdrop. */
  id: number;
  /** Name of the backdrop. */
  name: string;
  /** Colors of the backdrop. */
  colors: UniqueGiftBackdropColors;
}

/**
 * Contains a list of chat share theme backdrops.
 *
 * @see {@link https://core.telegram.org/bots/api#chatsharethemebackdrops Telegram Bot API: ChatShareThemeBackdrops}
 */
export interface ChatShareThemeBackdrops {
  /** List of available chat share theme backdrops. */
  backdrops: ChatShareThemeBackdrop[];
}

/**
 * Optional formatting parameters for {@link Bot.verifyUser} and {@link Bot.verifyChat}.
 */
export interface VerifyDescriptionOptions {
  /** Mode for parsing entities in the custom description. */
  custom_description_parse_mode?: ParseMode | string;
  /** List of special entities that appear in the custom description. */
  custom_description_entities?: MessageEntity[];
}
