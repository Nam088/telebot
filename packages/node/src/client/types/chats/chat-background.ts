import type { Document } from "../messages/index.js";

/**
 * The background is filled using the selected color.
 *
 * @see {@link https://core.telegram.org/bots/api#backgroundfillsolid Telegram Bot API: BackgroundFillSolid}
 */
export interface BackgroundFillSolid {
  /** Type of the background fill, always "solid". */
  type: "solid";
  /** The color of the background fill in the RGB24 format. */
  color: number;
}

/**
 * The background is a gradient fill.
 *
 * @see {@link https://core.telegram.org/bots/api#backgroundfillgradient Telegram Bot API: BackgroundFillGradient}
 */
export interface BackgroundFillGradient {
  /** Type of the background fill, always "gradient". */
  type: "gradient";
  /** Top color of the gradient in the RGB24 format. */
  top_color: number;
  /** Bottom color of the gradient in the RGB24 format. */
  bottom_color: number;
  /** Clockwise rotation angle of the background fill in degrees; 0-359. */
  rotation_angle: number;
}

/**
 * The background is a freeform gradient that rotates after every message in the chat.
 *
 * @see {@link https://core.telegram.org/bots/api#backgroundfillfreeformgradient Telegram Bot API: BackgroundFillFreeformGradient}
 */
export interface BackgroundFillFreeformGradient {
  /** Type of the background fill, always "freeform_gradient". */
  type: "freeform_gradient";
  /** A list of the 3 or 4 base colors that are used to generate the freeform gradient in the RGB24 format. */
  colors: number[];
}

/**
 * This object describes the way a background is filled based on the selected colors.
 *
 * @see {@link https://core.telegram.org/bots/api#backgroundfill Telegram Bot API: BackgroundFill}
 */
export type BackgroundFill =
  BackgroundFillSolid | BackgroundFillGradient | BackgroundFillFreeformGradient;

/**
 * The background is automatically filled based on the selected colors.
 *
 * @see {@link https://core.telegram.org/bots/api#backgroundtypefill Telegram Bot API: BackgroundTypeFill}
 */
export interface BackgroundTypeFill {
  /** Type of the background, always "fill". */
  type: "fill";
  /** The background fill. */
  fill: BackgroundFill;
  /** Dimming of the background in dark themes, as a percentage; 0-100. */
  dark_theme_dimming: number;
}

/**
 * The background is a wallpaper in the JPEG format.
 *
 * @see {@link https://core.telegram.org/bots/api#backgroundtypewallpaper Telegram Bot API: BackgroundTypeWallpaper}
 */
export interface BackgroundTypeWallpaper {
  /** Type of the background, always "wallpaper". */
  type: "wallpaper";
  /** Document with the wallpaper. */
  document: Document;
  /** Dimming of the background in dark themes, as a percentage; 0-100. */
  dark_theme_dimming: number;
  /** True, if the wallpaper is downscaled to fit in a 450x450 square and then box-blurred with radius 12 pixels. */
  is_blurred?: boolean;
  /** True, if the background moves slightly when the device is tilted. */
  is_moving?: boolean;
}

/**
 * The background is a .PNG or .TGV (gzipped subset of SVG with MIME type "application/x-tgwallpattern")
 * pattern to be combined with the background fill chosen by the user.
 *
 * @see {@link https://core.telegram.org/bots/api#backgroundtypepattern Telegram Bot API: BackgroundTypePattern}
 */
export interface BackgroundTypePattern {
  /** Type of the background, always "pattern". */
  type: "pattern";
  /** Document with the pattern. */
  document: Document;
  /** The background fill that is combined with the pattern. */
  fill: BackgroundFill;
  /** Intensity of the pattern when it is shown above the filled background; 0-100. */
  intensity: number;
  /** True, if the background fill must be applied only to the pattern itself. All other pixels are black in this case. */
  is_inverted?: boolean;
  /** True, if the background moves slightly when the device is tilted. */
  is_moving?: boolean;
}

/**
 * The background is taken directly from a built-in chat theme.
 *
 * @see {@link https://core.telegram.org/bots/api#backgroundtypechattheme Telegram Bot API: BackgroundTypeChatTheme}
 */
export interface BackgroundTypeChatTheme {
  /** Type of the background, always "chat_theme". */
  type: "chat_theme";
  /** Name of the chat theme, which is usually an emoji. */
  theme_name: string;
}

/**
 * This object describes the type of a background.
 *
 * @see {@link https://core.telegram.org/bots/api#backgroundtype Telegram Bot API: BackgroundType}
 */
export type BackgroundType =
  BackgroundTypeFill | BackgroundTypeWallpaper | BackgroundTypePattern | BackgroundTypeChatTheme;

/**
 * This object represents a chat background.
 *
 * @see {@link https://core.telegram.org/bots/api#chatbackground Telegram Bot API: ChatBackground}
 */
export interface ChatBackground {
  /** Type of the background. */
  type: BackgroundType;
}
