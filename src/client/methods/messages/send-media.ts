/**
 * Media sending methods for Bot API.
 *
 * @packageDocumentation
 */

import { BaseBotClient } from "../base.js";
import type { ParseMode } from "../../constants.js";
import type {
  Message,
  SendPhotoOptions,
  SendAudioOptions,
  SendDocumentOptions,
  SendVideoOptions,
  SendAnimationOptions,
  SendVoiceOptions,
  SendVideoNoteOptions,
  SendMediaGroupOptions,
  SendLivePhotoOptions,
} from "../../types/index.js";

/**
 * Mixin providing media sending operations.
 */
export abstract class MessageMediaMethods extends BaseBotClient {
  /**
   * Sends a photo to a chat.
   *
   * @param options - Options including `chat_id`, `photo` (file_id, URL, or {@link InputFile}), and optional `caption`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendPhoto({
   *   chat_id: 123456,
   *   photo: "https://example.com/image.jpg",
   *   caption: "Example image",
   * });
   * ```
   */
  public async sendPhoto(options: SendPhotoOptions): Promise<Message> {
    return this.request<Message>("sendPhoto", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an audio file (.MP3 or .M4A format).
   *
   * @param options - Options including `chat_id`, `audio`, `performer`, `title`, and optional `duration`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendAudio({
   *   chat_id: 123456,
   *   audio: audioFileId,
   *   performer: "Artist",
   *   title: "Track Title",
   * });
   * ```
   */
  public async sendAudio(options: SendAudioOptions): Promise<Message> {
    return this.request<Message>("sendAudio", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a general file/document of any type.
   *
   * @param options - Options including `chat_id`, `document`, and optional `caption`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendDocument({
   *   chat_id: 123456,
   *   document: { data: fileBuffer, filename: "report.pdf" },
   *   caption: "Monthly report",
   * });
   * ```
   */
  public async sendDocument(options: SendDocumentOptions): Promise<Message> {
    return this.request<Message>("sendDocument", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a video file.
   *
   * @param options - Options including `chat_id`, `video`, `duration`, `width`, `height`, and optional `caption`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendVideo({
   *   chat_id: 123456,
   *   video: "https://example.com/video.mp4",
   *   caption: "Watch this video",
   * });
   * ```
   */
  public async sendVideo(options: SendVideoOptions): Promise<Message> {
    return this.request<Message>("sendVideo", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an animation (GIF or H.264/MPEG-4 AVC video without sound).
   *
   * @param options - Options including `chat_id`, `animation`, and optional `caption`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendAnimation({
   *   chat_id: 123456,
   *   animation: "https://example.com/clip.gif",
   * });
   * ```
   */
  public async sendAnimation(options: SendAnimationOptions): Promise<Message> {
    return this.request<Message>("sendAnimation", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an audio voice note (.OGG format encoded with OPUS).
   *
   * @param options - Options including `chat_id`, `voice`, and optional `duration` and `caption`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendVoice({
   *   chat_id: 123456,
   *   voice: voiceFileId,
   * });
   * ```
   */
  public async sendVoice(options: SendVoiceOptions): Promise<Message> {
    return this.request<Message>("sendVoice", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a round video note (up to 1 minute, square 1:1 aspect ratio).
   *
   * @param options - Options including `chat_id`, `video_note`, and optional `length` and `duration`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendVideoNote({
   *   chat_id: 123456,
   *   video_note: videoNoteId,
   * });
   * ```
   */
  public async sendVideoNote(options: SendVideoNoteOptions): Promise<Message> {
    return this.request<Message>("sendVideoNote", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a group of 2-10 photos, videos, documents, or audios as an album.
   *
   * @param options - Options including `chat_id` and `media` array of {@link InputMedia}.
   * @returns Array of sent {@link Message} objects.
   * @throws {@link TelegramApiError} When sending media group fails.
   *
   * @example
   * ```ts
   * await bot.sendMediaGroup({
   *   chat_id: 123456,
   *   media: [
   *     { type: "photo", media: "https://example.com/1.jpg" },
   *     { type: "photo", media: "https://example.com/2.jpg" },
   *   ],
   * });
   * ```
   */
  public async sendMediaGroup(options: SendMediaGroupOptions): Promise<Message[]> {
    return this.request<Message[]>("sendMediaGroup", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends paid media (photos/videos purchased with Telegram Stars).
   *
   * @param options - Paid media parameters including `chat_id`, `star_count`, and `media` array.
   * @returns The sent {@link Message}.
   */
  public async sendPaidMedia(options: Record<string, unknown>): Promise<Message> {
    return this.request<Message>("sendPaidMedia", options);
  }

  /**
   * Sends an animated Live Photo message.
   *
   * @param options - Live photo options.
   * @returns Sent {@link Message}.
   */
  public async sendLivePhoto(options: SendLivePhotoOptions): Promise<Message> {
    return this.request<Message>("sendLivePhoto", options as unknown as Record<string, unknown>);
  }
}
