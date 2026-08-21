/**
 * Fluent builder for creating Telegram Inline Query results.
 *
 * @packageDocumentation
 */

import type {
  InlineKeyboardMarkup,
  InlineQueryResult,
} from "../client/types.js";
import type { ParseMode } from "../client/constants.js";

/**
 * Common options available for all inline query result items.
 */
export interface BaseInlineResultOptions {
  /** Inline keyboard attached to the message. */
  reply_markup?: InlineKeyboardMarkup;
}

/**
 * Options for article inline query results.
 */
export interface ArticleResultOptions extends BaseInlineResultOptions {
  /** Short description of the result. */
  description?: string;
  /** URL of the result. */
  url?: string;
  /** Pass `true` if you don't want the URL to be shown in the message. */
  hide_url?: boolean;
  /** URL of the thumbnail for the result. */
  thumbnail_url?: string;
  /** Thumbnail width. */
  thumbnail_width?: number;
  /** Thumbnail height. */
  thumbnail_height?: number;
}

/**
 * Options for photo inline query results.
 */
export interface PhotoResultOptions extends BaseInlineResultOptions {
  /** Title for the result. */
  title?: string;
  /** Short description of the result. */
  description?: string;
  /** Caption of the photo to be sent, 0-1024 characters. */
  caption?: string;
  /** Mode for parsing entities in the photo caption. */
  parse_mode?: ParseMode | string;
  /** Pass `true` if the photo caption must be shown above the message media. */
  show_caption_above_media?: boolean;
}

/**
 * Builder class for article inline query results with text message content.
 */
export class ArticleResultBuilder {
  private readonly id: string;
  private readonly title: string;
  private readonly options: ArticleResultOptions;

  constructor(id: string, title: string, options: ArticleResultOptions = {}) {
    this.id = id;
    this.title = title;
    this.options = options;
  }

  /**
   * Sets the text message content that will be sent when the user selects this article result.
   *
   * @param messageText - Text of the message to be sent, 1-4096 characters.
   * @param options - Text formatting options such as `parse_mode` and `disable_web_page_preview`.
   * @returns Constructed {@link InlineQueryResult} object ready for `answerInlineQuery`.
   */
  public text(
    messageText: string,
    options: {
      parse_mode?: ParseMode | string;
      disable_web_page_preview?: boolean;
    } = {},
  ): InlineQueryResult {
    return {
      type: "article",
      id: this.id,
      title: this.title,
      description: this.options.description,
      url: this.options.url,
      hide_url: this.options.hide_url,
      thumbnail_url: this.options.thumbnail_url,
      thumbnail_width: this.options.thumbnail_width,
      thumbnail_height: this.options.thumbnail_height,
      reply_markup: this.options.reply_markup,
      input_message_content: {
        message_text: messageText,
        parse_mode: options.parse_mode,
        disable_web_page_preview: options.disable_web_page_preview,
      },
    } as unknown as InlineQueryResult;
  }
}

/**
 * Fluent builder utility for constructing type-safe {@link InlineQueryResult} objects.
 *
 * @example
 * ```ts
 * const results = [
 *   InlineQueryResultBuilder.article("1", "Search Google")
 *     .text("https://google.com"),
 *   InlineQueryResultBuilder.photo("2", "https://example.com/image.jpg", {
 *     title: "Nature Wallpaper",
 *     caption: "Beautiful sunset view",
 *   }),
 * ];
 *
 * await context.bot.answerInlineQuery({
 *   inline_query_id: context.update!.inline_query!.id,
 *   results,
 * });
 * ```
 */
export class InlineQueryResultBuilder {
  /**
   * Creates an article inline query result builder.
   *
   * @param id - Unique identifier for this result (1-64 bytes).
   * @param title - Title of the result.
   * @param options - Additional options such as description, URL, and thumbnail.
   * @returns An {@link ArticleResultBuilder} instance to configure message content via `.text()`.
   */
  public static article(
    id: string,
    title: string,
    options: ArticleResultOptions = {},
  ): ArticleResultBuilder {
    return new ArticleResultBuilder(id, title, options);
  }

  /**
   * Creates a photo inline query result.
   *
   * @param id - Unique identifier for this result.
   * @param photoUrl - A valid URL of the photo. The photo must be in JPEG format and size must not exceed 5MB.
   * @param options - Additional options such as title, caption, and thumbnail.
   * @returns Constructed {@link InlineQueryResult} object.
   */
  public static photo(
    id: string,
    photoUrl: string,
    options: PhotoResultOptions = {},
  ): InlineQueryResult {
    return {
      type: "photo",
      id,
      photo_url: photoUrl,
      thumbnail_url: photoUrl,
      title: options.title,
      description: options.description,
      caption: options.caption,
      parse_mode: options.parse_mode,
      show_caption_above_media: options.show_caption_above_media,
      reply_markup: options.reply_markup,
    } as unknown as InlineQueryResult;
  }

  /**
   * Creates a video inline query result.
   *
   * @param id - Unique identifier for this result.
   * @param videoUrl - A valid URL for the embedded video player or video file.
   * @param mimeType - MIME type of the content of the video URL, `"text/html"` or `"video/mp4"`.
   * @param thumbnailUrl - URL of the thumbnail (JPEG or GIF) for the video.
   * @param title - Title for the result.
   * @param options - Additional options such as caption and duration.
   * @returns Constructed {@link InlineQueryResult} object.
   */
  public static video(
    id: string,
    videoUrl: string,
    mimeType: string,
    thumbnailUrl: string,
    title: string,
    options: BaseInlineResultOptions & {
      caption?: string;
      parse_mode?: ParseMode | string;
      video_width?: number;
      video_height?: number;
      video_duration?: number;
      description?: string;
    } = {},
  ): InlineQueryResult {
    return {
      type: "video",
      id,
      video_url: videoUrl,
      mime_type: mimeType,
      thumbnail_url: thumbnailUrl,
      title,
      ...options,
    } as unknown as InlineQueryResult;
  }

  /**
   * Creates an audio inline query result.
   *
   * @param id - Unique identifier for this result.
   * @param audioUrl - A valid URL for the audio file.
   * @param title - Title of the audio track.
   * @param options - Additional options such as performer, caption, and duration.
   * @returns Constructed {@link InlineQueryResult} object.
   */
  public static audio(
    id: string,
    audioUrl: string,
    title: string,
    options: BaseInlineResultOptions & {
      performer?: string;
      audio_duration?: number;
      caption?: string;
      parse_mode?: ParseMode | string;
    } = {},
  ): InlineQueryResult {
    return {
      type: "audio",
      id,
      audio_url: audioUrl,
      title,
      ...options,
    } as unknown as InlineQueryResult;
  }

  /**
   * Creates a document inline query result.
   *
   * @param id - Unique identifier for this result.
   * @param title - Title for the result.
   * @param documentUrl - A valid URL for the file.
   * @param mimeType - MIME type of the content of the file.
   * @param options - Additional options such as description, caption, and thumbnail.
   * @returns Constructed {@link InlineQueryResult} object.
   */
  public static document(
    id: string,
    title: string,
    documentUrl: string,
    mimeType: string,
    options: BaseInlineResultOptions & {
      caption?: string;
      parse_mode?: ParseMode | string;
      description?: string;
      thumbnail_url?: string;
    } = {},
  ): InlineQueryResult {
    return {
      type: "document",
      id,
      title,
      document_url: documentUrl,
      mime_type: mimeType,
      ...options,
    } as unknown as InlineQueryResult;
  }

  /**
   * Creates a GIF animation inline query result.
   *
   * @param id - Unique identifier for this result.
   * @param gifUrl - A valid URL for the GIF file.
   * @param thumbnailUrl - URL of the static (JPEG or GIF) thumbnail for the result.
   * @param options - Additional options such as title, caption, and dimensions.
   * @returns Constructed {@link InlineQueryResult} object.
   */
  public static gif(
    id: string,
    gifUrl: string,
    thumbnailUrl: string,
    options: BaseInlineResultOptions & {
      title?: string;
      caption?: string;
      parse_mode?: ParseMode | string;
      gif_width?: number;
      gif_height?: number;
      gif_duration?: number;
    } = {},
  ): InlineQueryResult {
    return {
      type: "gif",
      id,
      gif_url: gifUrl,
      thumbnail_url: thumbnailUrl,
      ...options,
    } as unknown as InlineQueryResult;
  }

  /**
   * Creates a location inline query result.
   *
   * @param id - Unique identifier for this result.
   * @param latitude - Location latitude in degrees.
   * @param longitude - Location longitude in degrees.
   * @param title - Location title.
   * @param options - Additional options such as live period and heading.
   * @returns Constructed {@link InlineQueryResult} object.
   */
  public static location(
    id: string,
    latitude: number,
    longitude: number,
    title: string,
    options: BaseInlineResultOptions & {
      live_period?: number;
      horizontal_accuracy?: number;
      heading?: number;
      proximity_alert_radius?: number;
      thumbnail_url?: string;
    } = {},
  ): InlineQueryResult {
    return {
      type: "location",
      id,
      latitude,
      longitude,
      title,
      ...options,
    } as unknown as InlineQueryResult;
  }

  /**
   * Creates a venue inline query result.
   *
   * @param id - Unique identifier for this result.
   * @param latitude - Latitude of the venue in degrees.
   * @param longitude - Longitude of the venue in degrees.
   * @param title - Title of the venue.
   * @param address - Address of the venue.
   * @param options - Additional options such as foursquare ID or Google Places ID.
   * @returns Constructed {@link InlineQueryResult} object.
   */
  public static venue(
    id: string,
    latitude: number,
    longitude: number,
    title: string,
    address: string,
    options: BaseInlineResultOptions & {
      foursquare_id?: string;
      foursquare_type?: string;
      google_place_id?: string;
      google_place_type?: string;
      thumbnail_url?: string;
    } = {},
  ): InlineQueryResult {
    return {
      type: "venue",
      id,
      latitude,
      longitude,
      title,
      address,
      ...options,
    } as unknown as InlineQueryResult;
  }

  /**
   * Creates a contact inline query result.
   *
   * @param id - Unique identifier for this result.
   * @param phoneNumber - Contact's phone number.
   * @param firstName - Contact's first name.
   * @param options - Additional options such as last name and vCard.
   * @returns Constructed {@link InlineQueryResult} object.
   */
  public static contact(
    id: string,
    phoneNumber: string,
    firstName: string,
    options: BaseInlineResultOptions & {
      last_name?: string;
      vcard?: string;
      thumbnail_url?: string;
    } = {},
  ): InlineQueryResult {
    return {
      type: "contact",
      id,
      phone_number: phoneNumber,
      first_name: firstName,
      ...options,
    } as unknown as InlineQueryResult;
  }

  /**
   * Creates a Game inline query result.
   *
   * @param id - Unique identifier for this result.
   * @param gameShortName - Short name of the game.
   * @param options - Additional options such as reply markup.
   * @returns Constructed {@link InlineQueryResult} object.
   */
  public static game(
    id: string,
    gameShortName: string,
    options: BaseInlineResultOptions = {},
  ): InlineQueryResult {
    return {
      type: "game",
      id,
      game_short_name: gameShortName,
      ...options,
    } as unknown as InlineQueryResult;
  }
}
