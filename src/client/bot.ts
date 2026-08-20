/**
 * Telegram Bot API client implementation.
 *
 * @packageDocumentation
 */

import { TelegramApiError } from "./types.js";
import type {
  User,
  Message,
  Update as RawUpdate,
  Chat,
  ChatMember,
  ChatPermissions,
  ChatInviteLink,
  UserProfilePhotos,
  File,
  Poll,
  ReactionType,
  WebhookInfo,
  SendMessageOptions,
  GetUpdatesOptions,
  SendPhotoOptions,
  SendAudioOptions,
  SendDocumentOptions,
  SendVideoOptions,
  SendAnimationOptions,
  SendVoiceOptions,
  SendVideoNoteOptions,
  SendMediaGroupOptions,
  SendLocationOptions,
  SendVenueOptions,
  SendContactOptions,
  SendPollOptions,
  SendDiceOptions,
  SendChatActionOptions,
  EditMessageTextOptions,
  EditMessageCaptionOptions,
  EditMessageReplyMarkupOptions,
  EditMessageMediaOptions,
  EditMessageLiveLocationOptions,
  StopMessageLiveLocationOptions,
  StopPollOptions,
  SetMessageReactionOptions,
  AnswerCallbackQueryOptions,
  AnswerInlineQueryOptions,
  PromoteChatMemberOptions,
  CreateChatInviteLinkOptions,
  EditChatInviteLinkOptions,
  SetWebhookOptions,
  Sticker,
  StickerSet,
  MaskPosition,
  InputSticker,
  SendStickerOptions,
  CreateNewStickerSetOptions,
  AddStickerToSetOptions,
  ReplaceStickerInSetOptions,
} from "./types.js";
import type { ParseMode } from "./constants.js";
import type { InputFile } from "../utils/http.js";
import { buildRequestBody } from "../utils/http.js";

/**
 * Configuration options for creating a {@link Bot} instance.
 */
export interface BotOptions {
  /**
   * Base URL for the Telegram Bot API server.
   *
   * @defaultValue `"https://api.telegram.org"`
   */
  apiRoot?: string;
  /**
   * Custom HTTP fetch implementation for testing or custom proxies.
   *
   * @defaultValue `globalThis.fetch`
   */
  fetch?: typeof globalThis.fetch;
  /**
   * Maximum number of retry attempts for 429 rate limits and 5xx server errors.
   *
   * @defaultValue `4`
   */
  maxRetries?: number;
  /**
   * Base delay in milliseconds for exponential backoff calculations.
   *
   * @defaultValue `1000`
   */
  baseDelayMs?: number;
  /**
   * Maximum delay ceiling in milliseconds for retry backoff.
   *
   * @defaultValue `30000`
   */
  maxDelayMs?: number;
}

/**
 * Core Telegram Bot API client.
 *
 * Provides direct, typed wrappers around Telegram Bot API methods with built-in
 * exponential backoff, rate-limit retry handling, and customizable HTTP transport.
 *
 * @example
 * ```ts
 * import { Bot } from "telegram-bot-node";
 *
 * const bot = new Bot("123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11");
 * const me = await bot.getMe();
 * console.log(`Logged in as @${me.username}`);
 *
 * await bot.sendMessage({
 *   chat_id: 12345678,
 *   text: "Hello from telegram-bot-node!",
 * });
 * ```
 */
export class Bot {
  /**
   * Telegram Bot API token.
   */
  public readonly token: string;

  /**
   * Base URL of the Telegram Bot API server.
   *
   * @defaultValue `"https://api.telegram.org"`
   */
  public readonly apiRoot: string;

  private readonly _fetch: typeof globalThis.fetch;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  /**
   * Constructs a new {@link Bot} instance.
   *
   * @param token - Telegram bot token received from BotFather.
   * @param options - Optional configuration settings for the bot client.
   * @throws When `token` is missing, empty, or whitespace-only.
   *
   * @example
   * ```ts
   * const bot = new Bot(process.env.BOT_TOKEN!);
   * ```
   */
  constructor(token: string, options: BotOptions = {}) {
    if (!token || typeof token !== "string" || token.trim() === "") {
      throw new Error("Bot token is required and cannot be empty.");
    }
    this.token = token;
    this.apiRoot = options.apiRoot ?? "https://api.telegram.org";
    this._fetch = options.fetch ?? globalThis.fetch;
    this.maxRetries = options.maxRetries ?? 4;
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.maxDelayMs = options.maxDelayMs ?? 30000;
  }

  /**
   * Internal sleep helper for delay handling.
   *
   * @param ms - Duration to sleep in milliseconds.
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Makes a request to the Telegram Bot API with exponential backoff on 429 and 5xx errors.
   *
   * @typeParam T - The expected return type of the Telegram API result.
   * @param method - The Telegram API method name (e.g., `"sendMessage"`, `"getMe"`).
   * @param payload - Optional key-value parameters to pass in the request body.
   * @returns Resolves with the unwrapped `result` field from the Telegram Bot API response.
   * @throws {@link TelegramApiError} When Telegram returns `ok: false` with an error code and description.
   * @throws When network failure occurs and retry attempts are exhausted.
   *
   * @remarks
   * For 429 errors containing `parameters.retry_after`, the method pauses for the duration specified
   * by Telegram before retrying.
   *
   * @example
   * ```ts
   * const chat = await bot.request<Chat>("getChat", { chat_id: 123456 });
   * ```
   */
  public async request<T>(method: string, payload: Record<string, unknown> = {}): Promise<T> {
    const url = `${this.apiRoot}/bot${this.token}/${method}`;
    const { body, headers } = buildRequestBody(payload);

    let attempt = 0;
    while (true) {
      attempt++;
      try {
        const response = await this._fetch(url, {
          method: "POST",
          headers,
          body,
        });

        const data = (await response.json()) as {
          ok: boolean;
          result?: T;
          error_code?: number;
          description?: string;
          parameters?: { retry_after?: number; migrate_to_chat_id?: number };
        };

        if (data.ok && data.result !== undefined) {
          return data.result;
        }

        const errorCode = data.error_code ?? response.status;
        const description = data.description ?? `Request failed with status ${response.status}`;
        const parameters = data.parameters;

        const is429 = errorCode === 429 || response.status === 429;
        const is5xx = response.status >= 500 && response.status < 600;

        if ((is429 || is5xx) && attempt <= this.maxRetries) {
          let delayMs = Math.min(this.baseDelayMs * Math.pow(2, attempt - 1), this.maxDelayMs);
          if (is429 && parameters?.retry_after !== undefined) {
            delayMs = Math.max(delayMs, parameters.retry_after * 1000);
          }
          await this.sleep(delayMs);
          continue;
        }

        throw new TelegramApiError(errorCode, description, parameters);
      } catch (err: unknown) {
        if (err instanceof TelegramApiError) {
          throw err;
        }
        if (attempt <= this.maxRetries) {
          const delayMs = Math.min(this.baseDelayMs * Math.pow(2, attempt - 1), this.maxDelayMs);
          await this.sleep(delayMs);
          continue;
        }
        throw err;
      }
    }
  }

  /**
   * Tests the bot authentication token and retrieves basic information about the bot.
   *
   * @returns A {@link User} object representing the bot.
   * @throws {@link TelegramApiError} When token is invalid or request fails.
   *
   * @example
   * ```ts
   * const me = await bot.getMe();
   * console.log(`Bot ID: ${me.id}, Username: @${me.username}`);
   * ```
   */
  public async getMe(): Promise<User> {
    return this.request<User>("getMe");
  }

  /**
   * Sends a text message to a specified chat or channel.
   *
   * @param options - Message parameters including recipient `chat_id`, `text`, formatting options, and reply markups.
   * @returns The sent {@link Message} object on success.
   * @throws {@link TelegramApiError} When message fails to send.
   */
  public async sendMessage(options: SendMessageOptions): Promise<Message> {
    return this.request<Message>("sendMessage", options as unknown as Record<string, unknown>);
  }

  /**
   * Receives incoming updates using long polling.
   *
   * @param options - Polling parameters including `offset`, `limit`, `timeout`, and `allowed_updates`.
   * @returns An array of {@link RawUpdate} objects.
   * @throws {@link TelegramApiError} When the API request fails.
   */
  public async getUpdates(options: GetUpdatesOptions = {}): Promise<RawUpdate[]> {
    return this.request<RawUpdate[]>("getUpdates", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a photo to a chat.
   *
   * @param options - Options including recipient `chat_id`, photo payload, caption, and reply markups.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When photo fails to send.
   */
  public async sendPhoto(options: SendPhotoOptions): Promise<Message> {
    return this.request<Message>("sendPhoto", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an audio file to a chat.
   *
   * @param options - Options including recipient `chat_id`, audio payload, duration, performer, and title.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When audio fails to send.
   */
  public async sendAudio(options: SendAudioOptions): Promise<Message> {
    return this.request<Message>("sendAudio", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a general file/document to a chat.
   *
   * @param options - Options including recipient `chat_id`, document payload, thumbnail, and caption.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When document fails to send.
   */
  public async sendDocument(options: SendDocumentOptions): Promise<Message> {
    return this.request<Message>("sendDocument", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a video file to a chat.
   *
   * @param options - Options including recipient `chat_id`, video payload, dimensions, and caption.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When video fails to send.
   */
  public async sendVideo(options: SendVideoOptions): Promise<Message> {
    return this.request<Message>("sendVideo", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an animation (GIF or H.264/MPEG-4 AVC video without sound) to a chat.
   *
   * @param options - Options including recipient `chat_id`, animation payload, and caption.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When animation fails to send.
   */
  public async sendAnimation(options: SendAnimationOptions): Promise<Message> {
    return this.request<Message>("sendAnimation", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an audio voice note to a chat.
   *
   * @param options - Options including recipient `chat_id`, voice payload, and caption.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When voice note fails to send.
   */
  public async sendVoice(options: SendVoiceOptions): Promise<Message> {
    return this.request<Message>("sendVoice", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a video message (round video note) to a chat.
   *
   * @param options - Options including recipient `chat_id`, video note payload, and duration.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When video note fails to send.
   */
  public async sendVideoNote(options: SendVideoNoteOptions): Promise<Message> {
    return this.request<Message>("sendVideoNote", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a group of photos, videos, documents, or audios as an album.
   *
   * @param options - Options including recipient `chat_id` and array of media items.
   * @returns An array of sent {@link Message} objects.
   * @throws {@link TelegramApiError} When media group fails to send.
   */
  public async sendMediaGroup(options: SendMediaGroupOptions): Promise<Message[]> {
    return this.request<Message[]>("sendMediaGroup", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a point on the map.
   *
   * @param options - Options including `chat_id`, `latitude`, `longitude`, and live period.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When location fails to send.
   */
  public async sendLocation(options: SendLocationOptions): Promise<Message> {
    return this.request<Message>("sendLocation", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends information about a venue.
   *
   * @param options - Options including `chat_id`, coordinates, title, and address.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When venue fails to send.
   */
  public async sendVenue(options: SendVenueOptions): Promise<Message> {
    return this.request<Message>("sendVenue", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a phone contact.
   *
   * @param options - Options including `chat_id`, phone number, and first name.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When contact fails to send.
   */
  public async sendContact(options: SendContactOptions): Promise<Message> {
    return this.request<Message>("sendContact", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a native Telegram poll.
   *
   * @param options - Options including `chat_id`, question, answer options, and poll type.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When poll fails to send.
   */
  public async sendPoll(options: SendPollOptions): Promise<Message> {
    return this.request<Message>("sendPoll", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an animated dice emoji.
   *
   * @param options - Options including recipient `chat_id` and emoji (e.g. 🎲, 🎯, 🏀, ⚽, 🎳, 🎰).
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When dice fails to send.
   */
  public async sendDice(options: SendDiceOptions): Promise<Message> {
    return this.request<Message>("sendDice", options as unknown as Record<string, unknown>);
  }

  /**
   * Tells the user that something is happening on the bot's side (e.g. typing, uploading photo).
   *
   * @param options - Options including recipient `chat_id` and `action` type string.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async sendChatAction(options: SendChatActionOptions): Promise<boolean> {
    return this.request<boolean>("sendChatAction", options as unknown as Record<string, unknown>);
  }

  /**
   * Edits text and game messages.
   *
   * @param options - Options including target message identifier and updated `text`.
   * @returns The edited {@link Message} or `true` if edited by inline message ID.
   * @throws {@link TelegramApiError} When editing fails.
   */
  public async editMessageText(options: EditMessageTextOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageText", options as unknown as Record<string, unknown>);
  }

  /**
   * Edits captions of messages.
   *
   * @param options - Options including target message identifier and updated `caption`.
   * @returns The edited {@link Message} or `true`.
   * @throws {@link TelegramApiError} When editing fails.
   */
  public async editMessageCaption(options: EditMessageCaptionOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageCaption", options as unknown as Record<string, unknown>);
  }

  /**
   * Edits only the reply markup of messages.
   *
   * @param options - Options including target message identifier and updated `reply_markup`.
   * @returns The edited {@link Message} or `true`.
   * @throws {@link TelegramApiError} When editing fails.
   */
  public async editMessageReplyMarkup(options: EditMessageReplyMarkupOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageReplyMarkup", options as unknown as Record<string, unknown>);
  }

  /**
   * Deletes a message, including service messages.
   *
   * @param chatId - Unique identifier for target chat or username.
   * @param messageId - Identifier of the message to delete.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting fails.
   */
  public async deleteMessage(chatId: number | string, messageId: number): Promise<boolean> {
    return this.request<boolean>("deleteMessage", { chat_id: chatId, message_id: messageId });
  }

  /**
   * Sends answers to callback queries sent from inline keyboards.
   *
   * @param options - Options including `callback_query_id`, notification text, and `show_alert`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When answer fails.
   */
  public async answerCallbackQuery(options: AnswerCallbackQueryOptions): Promise<boolean> {
    return this.request<boolean>("answerCallbackQuery", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends answers to an inline query.
   *
   * @param options - Options including `inline_query_id` and array of query results.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async answerInlineQuery(options: AnswerInlineQueryOptions): Promise<boolean> {
    return this.request<boolean>("answerInlineQuery", options as unknown as Record<string, unknown>);
  }

  /**
   * Bans a user in a group, supergroup, or channel.
   *
   * @param chatId - Target chat identifier.
   * @param userId - Target user identifier.
   * @param untilDate - Optional date when the user will be unbanned (Unix timestamp).
   * @param revokeMessages - Optional flag to delete all messages from the chat for the user.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When ban fails.
   */
  public async banChatMember(
    chatId: number | string,
    userId: number,
    untilDate?: number,
    revokeMessages?: boolean
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, user_id: userId };
    if (untilDate !== undefined) payload["until_date"] = untilDate;
    if (revokeMessages !== undefined) payload["revoke_messages"] = revokeMessages;
    return this.request<boolean>("banChatMember", payload);
  }

  /**
   * Unbans a previously banned user in a supergroup or channel.
   *
   * @param chatId - Target chat identifier.
   * @param userId - Target user identifier.
   * @param onlyIfBanned - Do nothing if the user is not banned.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unban fails.
   */
  public async unbanChatMember(
    chatId: number | string,
    userId: number,
    onlyIfBanned?: boolean
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, user_id: userId };
    if (onlyIfBanned !== undefined) payload["only_if_banned"] = onlyIfBanned;
    return this.request<boolean>("unbanChatMember", payload);
  }

  /**
   * Restricts a user in a supergroup.
   *
   * @param chatId - Target chat identifier.
   * @param userId - Target user identifier.
   * @param permissions - Allowed permissions for the user.
   * @param useIndependentChatPermissions - Pass true if chat permissions are set independently.
   * @param untilDate - Optional date when restrictions will be lifted (Unix timestamp).
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When restriction fails.
   */
  public async restrictChatMember(
    chatId: number | string,
    userId: number,
    permissions: ChatPermissions,
    useIndependentChatPermissions?: boolean,
    untilDate?: number
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      user_id: userId,
      permissions,
    };
    if (useIndependentChatPermissions !== undefined) {
      payload["use_independent_chat_permissions"] = useIndependentChatPermissions;
    }
    if (untilDate !== undefined) payload["until_date"] = untilDate;
    return this.request<boolean>("restrictChatMember", payload);
  }

  /**
   * Promotes or demotes a user in a supergroup or channel.
   *
   * @param chatId - Target chat identifier.
   * @param userId - Target user identifier.
   * @param options - Administrator rights configuration.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When promotion fails.
   */
  public async promoteChatMember(
    chatId: number | string,
    userId: number,
    options: PromoteChatMemberOptions = {}
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      user_id: userId,
      ...options,
    };
    return this.request<boolean>("promoteChatMember", payload);
  }

  /**
   * Sets a custom title for an administrator in a supergroup.
   *
   * @param chatId - Target chat identifier.
   * @param userId - Target user identifier.
   * @param customTitle - New custom title for administrator (0-16 characters).
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async setChatAdministratorCustomTitle(
    chatId: number | string,
    userId: number,
    customTitle: string
  ): Promise<boolean> {
    return this.request<boolean>("setChatAdministratorCustomTitle", {
      chat_id: chatId,
      user_id: userId,
      custom_title: customTitle,
    });
  }

  /**
   * Sets default chat permissions for all members.
   *
   * @param chatId - Target chat identifier.
   * @param permissions - Default permissions.
   * @param useIndependentChatPermissions - Independent permissions flag.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async setChatPermissions(
    chatId: number | string,
    permissions: ChatPermissions,
    useIndependentChatPermissions?: boolean
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      permissions,
    };
    if (useIndependentChatPermissions !== undefined) {
      payload["use_independent_chat_permissions"] = useIndependentChatPermissions;
    }
    return this.request<boolean>("setChatPermissions", payload);
  }

  /**
   * Generates a new primary invite link for a chat; any previously generated primary link is revoked.
   *
   * @param chatId - Target chat identifier.
   * @returns The new invite link as a string.
   * @throws {@link TelegramApiError} When link generation fails.
   */
  public async exportChatInviteLink(chatId: number | string): Promise<string> {
    return this.request<string>("exportChatInviteLink", { chat_id: chatId });
  }

  /**
   * Creates an additional invite link for a chat.
   *
   * @param chatId - Target chat identifier.
   * @param options - Link settings such as expiration date or member limit.
   * @returns The newly created {@link ChatInviteLink}.
   * @throws {@link TelegramApiError} When creation fails.
   */
  public async createChatInviteLink(
    chatId: number | string,
    options: CreateChatInviteLinkOptions = {}
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("createChatInviteLink", {
      chat_id: chatId,
      ...options,
    });
  }

  /**
   * Edits a non-primary invite link created by the bot.
   *
   * @param chatId - Target chat identifier.
   * @param inviteLink - The invite link to edit.
   * @param options - Updated link parameters.
   * @returns The updated {@link ChatInviteLink}.
   * @throws {@link TelegramApiError} When editing fails.
   */
  public async editChatInviteLink(
    chatId: number | string,
    inviteLink: string,
    options: EditChatInviteLinkOptions = {}
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("editChatInviteLink", {
      chat_id: chatId,
      invite_link: inviteLink,
      ...options,
    });
  }

  /**
   * Revokes an invite link created by the bot.
   *
   * @param chatId - Target chat identifier.
   * @param inviteLink - The invite link to revoke.
   * @returns The revoked {@link ChatInviteLink}.
   * @throws {@link TelegramApiError} When revocation fails.
   */
  public async revokeChatInviteLink(
    chatId: number | string,
    inviteLink: string
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("revokeChatInviteLink", {
      chat_id: chatId,
      invite_link: inviteLink,
    });
  }

  /**
   * Approves a chat join request.
   *
   * @param chatId - Target chat identifier.
   * @param userId - Target user identifier.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When approval fails.
   */
  public async approveChatJoinRequest(chatId: number | string, userId: number): Promise<boolean> {
    return this.request<boolean>("approveChatJoinRequest", {
      chat_id: chatId,
      user_id: userId,
    });
  }

  /**
   * Declines a chat join request.
   *
   * @param chatId - Target chat identifier.
   * @param userId - Target user identifier.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async declineChatJoinRequest(chatId: number | string, userId: number): Promise<boolean> {
    return this.request<boolean>("declineChatJoinRequest", {
      chat_id: chatId,
      user_id: userId,
    });
  }

  /**
   * Sets a new profile photo for the chat.
   *
   * @param chatId - Target chat identifier.
   * @param photo - New chat photo file payload.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting photo fails.
   */
  public async setChatPhoto(chatId: number | string, photo: InputFile): Promise<boolean> {
    return this.request<boolean>("setChatPhoto", { chat_id: chatId, photo });
  }

  /**
   * Deletes a chat photo.
   *
   * @param chatId - Target chat identifier.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting photo fails.
   */
  public async deleteChatPhoto(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("deleteChatPhoto", { chat_id: chatId });
  }

  /**
   * Changes the title of a chat.
   *
   * @param chatId - Target chat identifier.
   * @param title - New chat title (1-128 characters).
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When title update fails.
   */
  public async setChatTitle(chatId: number | string, title: string): Promise<boolean> {
    return this.request<boolean>("setChatTitle", { chat_id: chatId, title });
  }

  /**
   * Changes the description of a group, supergroup, or channel.
   *
   * @param chatId - Target chat identifier.
   * @param description - New chat description (0-255 characters).
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When description update fails.
   */
  public async setChatDescription(chatId: number | string, description?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (description !== undefined) payload["description"] = description;
    return this.request<boolean>("setChatDescription", payload);
  }

  /**
   * Pins a message in a group, supergroup, or channel.
   *
   * @param chatId - Target chat identifier.
   * @param messageId - Identifier of message to pin.
   * @param disableNotification - Pass true if unneeded to notify chat members.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When pin fails.
   */
  public async pinChatMessage(
    chatId: number | string,
    messageId: number,
    disableNotification?: boolean
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
    };
    if (disableNotification !== undefined) {
      payload["disable_notification"] = disableNotification;
    }
    return this.request<boolean>("pinChatMessage", payload);
  }

  /**
   * Unpins a message in a group, supergroup, or channel.
   *
   * @param chatId - Target chat identifier.
   * @param messageId - Identifier of message to unpin. If omitted, the most recent pinned message is unpinned.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unpin fails.
   */
  public async unpinChatMessage(chatId: number | string, messageId?: number): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (messageId !== undefined) payload["message_id"] = messageId;
    return this.request<boolean>("unpinChatMessage", payload);
  }

  /**
   * Clears the list of pinned messages in a chat.
   *
   * @param chatId - Target chat identifier.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When clearing pinned messages fails.
   */
  public async unpinAllChatMessages(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("unpinAllChatMessages", { chat_id: chatId });
  }

  /**
   * Leaves a group, supergroup, or channel.
   *
   * @param chatId - Target chat identifier.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When leaving chat fails.
   */
  public async leaveChat(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("leaveChat", { chat_id: chatId });
  }

  /**
   * Gets up to date information about the chat.
   *
   * @param chatId - Target chat identifier.
   * @returns The {@link Chat} object.
   * @throws {@link TelegramApiError} When chat info cannot be retrieved.
   */
  public async getChat(chatId: number | string): Promise<Chat> {
    return this.request<Chat>("getChat", { chat_id: chatId });
  }

  /**
   * Gets a list of administrators in a chat.
   *
   * @param chatId - Target chat identifier.
   * @returns An array of {@link ChatMember} administrators.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async getChatAdministrators(chatId: number | string): Promise<ChatMember[]> {
    return this.request<ChatMember[]>("getChatAdministrators", { chat_id: chatId });
  }

  /**
   * Gets the number of members in a chat.
   *
   * @param chatId - Target chat identifier.
   * @returns The total number of chat members.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async getChatMemberCount(chatId: number | string): Promise<number> {
    return this.request<number>("getChatMemberCount", { chat_id: chatId });
  }

  /**
   * Gets information about a member of a chat.
   *
   * @param chatId - Target chat identifier.
   * @param userId - Target user identifier.
   * @returns The {@link ChatMember} object.
   * @throws {@link TelegramApiError} When member info cannot be retrieved.
   */
  public async getChatMember(chatId: number | string, userId: number): Promise<ChatMember> {
    return this.request<ChatMember>("getChatMember", {
      chat_id: chatId,
      user_id: userId,
    });
  }

  /**
   * Sets a new group sticker set for a supergroup.
   *
   * @param chatId - Target chat identifier.
   * @param stickerSetName - Name of the sticker set to set.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async setChatStickerSet(chatId: number | string, stickerSetName: string): Promise<boolean> {
    return this.request<boolean>("setChatStickerSet", {
      chat_id: chatId,
      sticker_set_name: stickerSetName,
    });
  }

  /**
   * Deletes a group sticker set from a supergroup.
   *
   * @param chatId - Target chat identifier.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async deleteChatStickerSet(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("deleteChatStickerSet", { chat_id: chatId });
  }

  /**
   * Gets a list of profile pictures for a user.
   *
   * @param userId - Unique identifier of the target user.
   * @param offset - Sequential number of first photo to return.
   * @param limit - Limits number of photos to return (1-100).
   * @returns A {@link UserProfilePhotos} object.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async getUserProfilePhotos(
    userId: number,
    offset?: number,
    limit?: number
  ): Promise<UserProfilePhotos> {
    const payload: Record<string, unknown> = { user_id: userId };
    if (offset !== undefined) payload["offset"] = offset;
    if (limit !== undefined) payload["limit"] = limit;
    return this.request<UserProfilePhotos>("getUserProfilePhotos", payload);
  }

  /**
   * Gets basic info about a file and prepares it for downloading.
   *
   * @param fileId - File identifier to get info about.
   * @returns A {@link File} object.
   * @throws {@link TelegramApiError} When file is invalid or too big.
   */
  public async getFile(fileId: string): Promise<File> {
    return this.request<File>("getFile", { file_id: fileId });
  }

  /**
   * Specifies a URL and receives incoming updates via an outgoing webhook.
   *
   * @param options - Webhook configuration options.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When webhook setup fails.
   */
  public async setWebhook(options: SetWebhookOptions): Promise<boolean> {
    return this.request<boolean>("setWebhook", options as unknown as Record<string, unknown>);
  }

  /**
   * Removes webhook integration.
   *
   * @param dropPendingUpdates - Pass true to drop all pending updates.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deletion fails.
   */
  public async deleteWebhook(dropPendingUpdates?: boolean): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (dropPendingUpdates !== undefined) payload["drop_pending_updates"] = dropPendingUpdates;
    return this.request<boolean>("deleteWebhook", payload);
  }

  /**
   * Gets current webhook status.
   *
   * @returns A {@link WebhookInfo} object.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async getWebhookInfo(): Promise<WebhookInfo> {
    return this.request<WebhookInfo>("getWebhookInfo");
  }

  /**
   * Forwards a message of any kind from one chat to another.
   *
   * @param options - Forwarding parameters including destination `chat_id`, origin `from_chat_id`, and `message_id`.
   * @returns The forwarded {@link Message} on success.
   * @throws {@link TelegramApiError} When message forwarding fails.
   */
  public async forwardMessage(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_id: number;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_thread_id?: number;
  }): Promise<Message> {
    return this.request<Message>("forwardMessage", options as unknown as Record<string, unknown>);
  }

  /**
   * Copies a message of any kind from one chat to another without link to original message.
   *
   * @param options - Copying parameters.
   * @returns The sent message identifier descriptor.
   * @throws {@link TelegramApiError} When message copying fails.
   */
  public async copyMessage(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_id: number;
    caption?: string;
    parse_mode?: ParseMode;
    caption_entities?: unknown[];
    disable_notification?: boolean;
    protect_content?: boolean;
    reply_markup?: unknown;
    message_thread_id?: number;
  }): Promise<{ message_id: number }> {
    return this.request<{ message_id: number }>("copyMessage", options as unknown as Record<string, unknown>);
  }

  /**
   * Changes the list of the bot's commands for the given scope and user language.
   *
   * @param options - Parameters including list of `commands`, optional `scope`, and `language_code`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting commands fails.
   */
  public async setMyCommands(options: {
    commands: Array<{ command: string; description: string }>;
    scope?: unknown;
    language_code?: string;
  }): Promise<boolean> {
    return this.request<boolean>("setMyCommands", options as unknown as Record<string, unknown>);
  }

  /**
   * Gets the current list of the bot's commands for the given scope and user language.
   *
   * @param options - Optional `scope` and `language_code`.
   * @returns Array of command objects.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async getMyCommands(options: {
    scope?: unknown;
    language_code?: string;
  } = {}): Promise<Array<{ command: string; description: string }>> {
    return this.request<Array<{ command: string; description: string }>>(
      "getMyCommands",
      options as unknown as Record<string, unknown>
    );
  }

  /**
   * Deletes the list of the bot's commands for the given scope and user language.
   *
   * @param options - Optional `scope` and `language_code`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async deleteMyCommands(options: {
    scope?: unknown;
    language_code?: string;
  } = {}): Promise<boolean> {
    return this.request<boolean>("deleteMyCommands", options as unknown as Record<string, unknown>);
  }

  /**
   * Creates a topic in a forum supergroup chat.
   *
   * @param options - Parameters including target `chat_id`, `name`, optional `icon_color`, and `icon_custom_emoji_id`.
   * @returns The created topic descriptor on success.
   * @throws {@link TelegramApiError} When creation fails.
   */
  public async createForumTopic(options: {
    chat_id: number | string;
    name: string;
    icon_color?: number;
    icon_custom_emoji_id?: string;
  }): Promise<{ message_thread_id: number; name: string; icon_color: number; icon_custom_emoji_id?: string }> {
    return this.request<any>("createForumTopic", options as unknown as Record<string, unknown>);
  }

  /**
   * Closes an open topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageThreadId - Unique identifier for the target message thread of the forum topic.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async closeForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean> {
    return this.request<boolean>("closeForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Reopens a closed topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageThreadId - Unique identifier for the target message thread of the forum topic.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async reopenForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean> {
    return this.request<boolean>("reopenForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Deletes a forum topic along with all its messages in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageThreadId - Unique identifier for the target message thread of the forum topic.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When request fails.
   */
  public async deleteForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean> {
    return this.request<boolean>("deleteForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Deletes multiple messages simultaneously.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param messageIds - Array of message identifiers to delete.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting messages fails.
   *
   * @example
   * ```ts
   * await bot.deleteMessages(123456, [101, 102, 103]);
   * ```
   */
  public async deleteMessages(chatId: number | string, messageIds: number[]): Promise<boolean> {
    return this.request<boolean>("deleteMessages", {
      chat_id: chatId,
      message_ids: messageIds,
    });
  }

  /**
   * Forwards multiple messages of any kind simultaneously.
   *
   * @param options - Forwarding parameters including destination `chat_id`, origin `from_chat_id`, and `message_ids`.
   * @returns Array of message identifier objects on success.
   * @throws {@link TelegramApiError} When forwarding messages fails.
   *
   * @example
   * ```ts
   * const sentIds = await bot.forwardMessages({
   *   chat_id: 123456,
   *   from_chat_id: 654321,
   *   message_ids: [101, 102],
   * });
   * ```
   */
  public async forwardMessages(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_ids: number[];
    disable_notification?: boolean;
    protect_content?: boolean;
  }): Promise<Array<{ message_id: number }>> {
    return this.request<Array<{ message_id: number }>>(
      "forwardMessages",
      options as unknown as Record<string, unknown>
    );
  }

  /**
   * Copies multiple messages of any kind simultaneously without link to the original message.
   *
   * @param options - Copying parameters including destination `chat_id`, origin `from_chat_id`, and `message_ids`.
   * @returns Array of sent message identifier objects on success.
   * @throws {@link TelegramApiError} When copying messages fails.
   *
   * @example
   * ```ts
   * const copiedIds = await bot.copyMessages({
   *   chat_id: 123456,
   *   from_chat_id: 654321,
   *   message_ids: [101, 102],
   *   remove_caption: false,
   * });
   * ```
   */
  public async copyMessages(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_ids: number[];
    disable_notification?: boolean;
    protect_content?: boolean;
    remove_caption?: boolean;
  }): Promise<Array<{ message_id: number }>> {
    return this.request<Array<{ message_id: number }>>(
      "copyMessages",
      options as unknown as Record<string, unknown>
    );
  }

  /**
   * Edits animation, audio, document, photo, or video messages, or adds media to text messages.
   *
   * @param options - Options including target message identifier and new `media` content.
   * @returns The edited {@link Message} on success, or `true` if edited by inline message ID.
   * @throws {@link TelegramApiError} When editing media fails.
   *
   * @example
   * ```ts
   * await bot.editMessageMedia({
   *   chat_id: 123456,
   *   message_id: 42,
   *   media: {
   *     type: "photo",
   *     media: "https://example.com/new-pic.jpg",
   *     caption: "Updated caption",
   *   },
   * });
   * ```
   */
  public async editMessageMedia(options: EditMessageMediaOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "editMessageMedia",
      options as unknown as Record<string, unknown>
    );
  }

  /**
   * Edits live location messages sent by the bot or via the bot.
   *
   * @param options - Options including coordinates, target message identifier, heading, and accuracy.
   * @returns The edited {@link Message} on success, or `true` if edited by inline message ID.
   * @throws {@link TelegramApiError} When editing live location fails.
   *
   * @example
   * ```ts
   * await bot.editMessageLiveLocation({
   *   chat_id: 123456,
   *   message_id: 42,
   *   latitude: 37.7749,
   *   longitude: -122.4194,
   * });
   * ```
   */
  public async editMessageLiveLocation(options: EditMessageLiveLocationOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "editMessageLiveLocation",
      options as unknown as Record<string, unknown>
    );
  }

  /**
   * Stops updating a live location message before live_period expires.
   *
   * @param options - Options identifying the target live location message to stop.
   * @returns The stopped {@link Message} on success, or `true` if stopped by inline message ID.
   * @throws {@link TelegramApiError} When stopping live location fails.
   *
   * @example
   * ```ts
   * await bot.stopMessageLiveLocation({
   *   chat_id: 123456,
   *   message_id: 42,
   * });
   * ```
   */
  public async stopMessageLiveLocation(options: StopMessageLiveLocationOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "stopMessageLiveLocation",
      options as unknown as Record<string, unknown>
    );
  }

  /**
   * Stops a poll which was sent by the bot.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param messageId - Identifier of the original message with the poll.
   * @param options - Additional options including reply markup.
   * @returns The stopped {@link Poll} on success.
   * @throws {@link TelegramApiError} When stopping poll fails.
   *
   * @example
   * ```ts
   * const finalPoll = await bot.stopPoll(123456, 42);
   * console.log(`Total voters: ${finalPoll.total_voter_count}`);
   * ```
   */
  public async stopPoll(
    chatId: number | string,
    messageId: number,
    options: StopPollOptions = {}
  ): Promise<Poll> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      ...options,
    };
    return this.request<Poll>("stopPoll", payload);
  }

  /**
   * Changes the chosen reactions on a message.
   *
   * @param options - Reaction parameters including `chat_id`, `message_id`, and `reaction` array/string.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting message reaction fails.
   *
   * @example
   * ```ts
   * await bot.setMessageReaction({
   *   chat_id: 123456,
   *   message_id: 42,
   *   reaction: [{ type: "emoji", emoji: "👍" }],
   * });
   * ```
   */
  public async setMessageReaction(options: SetMessageReactionOptions): Promise<boolean> {
    let reactionPayload: unknown = options.reaction;
    if (typeof options.reaction === "string") {
      reactionPayload = [{ type: "emoji", emoji: options.reaction }];
    } else if (
      options.reaction &&
      typeof options.reaction === "object" &&
      !Array.isArray(options.reaction)
    ) {
      reactionPayload = [options.reaction];
    } else if (Array.isArray(options.reaction)) {
      reactionPayload = options.reaction.map((r) =>
        typeof r === "string" ? { type: "emoji", emoji: r } : r
      );
    }

    const payload: Record<string, unknown> = {
      chat_id: options.chat_id,
      message_id: options.message_id,
    };
    if (reactionPayload !== undefined) {
      payload["reaction"] = reactionPayload;
    }
    if (options.is_big !== undefined) {
      payload["is_big"] = options.is_big;
    }
    return this.request<boolean>("setMessageReaction", payload);
  }

  /**
   * Deletes a specific reaction from a message.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param messageId - Identifier of the target message.
   * @param isBig - Optional flag to animate the reaction change with a big animation.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When clearing reaction fails.
   *
   * @example
   * ```ts
   * await bot.deleteMessageReaction(123456, 42);
   * ```
   */
  public async deleteMessageReaction(
    chatId: number | string,
    messageId: number,
    isBig?: boolean
  ): Promise<boolean> {
    return this.setMessageReaction({
      chat_id: chatId,
      message_id: messageId,
      reaction: [],
      is_big: isBig,
    });
  }

  /**
   * Deletes all reactions on a message.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param messageId - Identifier of the target message.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When clearing all reactions fails.
   *
   * @example
   * ```ts
   * await bot.deleteAllMessageReactions(123456, 42);
   * ```
   */
  public async deleteAllMessageReactions(
    chatId: number | string,
    messageId: number
  ): Promise<boolean> {
    return this.setMessageReaction({
      chat_id: chatId,
      message_id: messageId,
      reaction: [],
    });
  }

  /**
   * Sends a static, animated, or video sticker.
   *
   * @param options - Options including recipient `chat_id` and `sticker` payload.
   * @returns The sent {@link Message} on success.
   * @throws {@link TelegramApiError} When sending sticker fails.
   *
   * @example
   * ```ts
   * await bot.sendSticker({
   *   chat_id: 123456,
   *   sticker: "CAACAgIAAxkBAAE...",
   * });
   * ```
   */
  public async sendSticker(options: SendStickerOptions): Promise<Message> {
    return this.request<Message>("sendSticker", options as unknown as Record<string, unknown>);
  }

  /**
   * Retrieves a sticker set by its name.
   *
   * @param name - Name of the sticker set.
   * @returns A {@link StickerSet} object.
   * @throws {@link TelegramApiError} When retrieving the sticker set fails.
   *
   * @example
   * ```ts
   * const set = await bot.getStickerSet("animals_by_bot");
   * console.log(`Sticker set title: ${set.title}, total: ${set.stickers.length}`);
   * ```
   */
  public async getStickerSet(name: string): Promise<StickerSet> {
    return this.request<StickerSet>("getStickerSet", { name });
  }

  /**
   * Retrieves custom emoji stickers by their unique identifiers.
   *
   * @param customEmojiIds - List of custom emoji identifiers (1-200 identifiers).
   * @returns An array of {@link Sticker} objects.
   * @throws {@link TelegramApiError} When retrieving custom emoji stickers fails.
   *
   * @example
   * ```ts
   * const stickers = await bot.getCustomEmojiStickers(["5368324170671202286"]);
   * ```
   */
  public async getCustomEmojiStickers(customEmojiIds: string[]): Promise<Sticker[]> {
    return this.request<Sticker[]>("getCustomEmojiStickers", {
      custom_emoji_ids: customEmojiIds,
    });
  }

  /**
   * Uploads a sticker file with a .WEBP, .PNG, .TGS, or .WEBM file for later use in `createNewStickerSet` and `addStickerToSet` methods.
   *
   * @param userId - User identifier of the sticker file owner.
   * @param sticker - A file with the sticker in .WEBP, .PNG, .TGS, or .WEBM format.
   * @param stickerFormat - Format of the sticker: "static", "animated", or "video".
   * @returns The uploaded {@link File} object.
   * @throws {@link TelegramApiError} When uploading the sticker file fails.
   *
   * @example
   * ```ts
   * const file = await bot.uploadStickerFile(123456, { filename: "sticker.png", data: buffer }, "static");
   * ```
   */
  public async uploadStickerFile(
    userId: number,
    sticker: string | InputFile,
    stickerFormat: "static" | "animated" | "video"
  ): Promise<File> {
    return this.request<File>("uploadStickerFile", {
      user_id: userId,
      sticker,
      sticker_format: stickerFormat,
    });
  }

  /**
   * Creates a new sticker set owned by a user.
   *
   * @param options - Options including user identifier, sticker set name, title, and initial stickers list.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When creating sticker set fails.
   *
   * @example
   * ```ts
   * await bot.createNewStickerSet({
   *   user_id: 123456,
   *   name: "animals_by_mybot",
   *   title: "Animals Pack",
   *   stickers: [
   *     {
   *       sticker: "CAACAgIAAxkBAAE...",
   *       format: "static",
   *       emoji_list: ["🐶"],
   *     },
   *   ],
   * });
   * ```
   */
  public async createNewStickerSet(options: CreateNewStickerSetOptions): Promise<boolean> {
    return this.request<boolean>("createNewStickerSet", options as unknown as Record<string, unknown>);
  }

  /**
   * Adds a new sticker to a set created by the bot.
   *
   * @param options - Options including user identifier, sticker set name, and sticker description.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When adding sticker fails.
   *
   * @example
   * ```ts
   * await bot.addStickerToSet({
   *   user_id: 123456,
   *   name: "animals_by_mybot",
   *   sticker: {
   *     sticker: "CAACAgIAAxkBAAE...",
   *     format: "static",
   *     emoji_list: ["🐱"],
   *   },
   * });
   * ```
   */
  public async addStickerToSet(options: AddStickerToSetOptions): Promise<boolean> {
    return this.request<boolean>("addStickerToSet", options as unknown as Record<string, unknown>);
  }

  /**
   * Moves a sticker in a set created by the bot to a specific position.
   *
   * @param sticker - File identifier of the sticker.
   * @param position - New 0-based position of the sticker in the set.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting position fails.
   *
   * @example
   * ```ts
   * await bot.setStickerPositionInSet("CAACAgIAAxkBAAE...", 0);
   * ```
   */
  public async setStickerPositionInSet(sticker: string, position: number): Promise<boolean> {
    return this.request<boolean>("setStickerPositionInSet", {
      sticker,
      position,
    });
  }

  /**
   * Deletes a sticker from a set created by the bot.
   *
   * @param sticker - File identifier of the sticker.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting sticker fails.
   *
   * @example
   * ```ts
   * await bot.deleteStickerFromSet("CAACAgIAAxkBAAE...");
   * ```
   */
  public async deleteStickerFromSet(sticker: string): Promise<boolean> {
    return this.request<boolean>("deleteStickerFromSet", { sticker });
  }

  /**
   * Deletes a sticker set that was created by the bot.
   *
   * @param name - Sticker set name.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting sticker set fails.
   *
   * @example
   * ```ts
   * await bot.deleteStickerSet("animals_by_mybot");
   * ```
   */
  public async deleteStickerSet(name: string): Promise<boolean> {
    return this.request<boolean>("deleteStickerSet", { name });
  }

  /**
   * Replaces an existing sticker in a sticker set with a new one.
   *
   * @param options - Options including user identifier, sticker set name, old sticker identifier, and new sticker data.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When replacing sticker fails.
   *
   * @example
   * ```ts
   * await bot.replaceStickerInSet({
   *   user_id: 123456,
   *   name: "animals_by_mybot",
   *   old_sticker: "CAACAgIAAxkBAAE...",
   *   sticker: {
   *     sticker: "CAACAgIAAxkBAAF...",
   *     format: "static",
   *     emoji_list: ["🐶"],
   *   },
   * });
   * ```
   */
  public async replaceStickerInSet(options: ReplaceStickerInSetOptions): Promise<boolean> {
    return this.request<boolean>("replaceStickerInSet", options as unknown as Record<string, unknown>);
  }

  /**
   * Sets the thumbnail of a regular or mask sticker set.
   *
   * @param name - Sticker set name.
   * @param userId - User identifier of the sticker set owner.
   * @param format - Format of the thumbnail: "static", "animated", or "video".
   * @param thumbnail - A thumbnail in .WEBP or .PNG format for static, .TGS for animated, or .WEBM for video stickers. Pass undefined to drop thumbnail.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting sticker set thumbnail fails.
   *
   * @example
   * ```ts
   * await bot.setStickerSetThumbnail("animals_by_mybot", 123456, "static", "https://example.com/thumb.png");
   * ```
   */
  public async setStickerSetThumbnail(
    name: string,
    userId: number,
    format: "static" | "animated" | "video",
    thumbnail?: string | InputFile
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      name,
      user_id: userId,
      format,
    };
    if (thumbnail !== undefined) {
      payload["thumbnail"] = thumbnail;
    }
    return this.request<boolean>("setStickerSetThumbnail", payload);
  }

  /**
   * Sets the thumbnail of a custom emoji sticker set.
   *
   * @param name - Sticker set name.
   * @param customEmojiId - Custom emoji identifier of a sticker from the set; pass undefined to drop the thumbnail.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting thumbnail fails.
   *
   * @example
   * ```ts
   * await bot.setCustomEmojiStickerSetThumbnail("custom_emojis_by_mybot", "5368324170671202286");
   * ```
   */
  public async setCustomEmojiStickerSetThumbnail(
    name: string,
    customEmojiId?: string
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { name };
    if (customEmojiId !== undefined) {
      payload["custom_emoji_id"] = customEmojiId;
    }
    return this.request<boolean>("setCustomEmojiStickerSetThumbnail", payload);
  }

  /**
   * Sets the title of a created sticker set.
   *
   * @param name - Sticker set name.
   * @param title - Sticker set title, 1-64 characters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting title fails.
   *
   * @example
   * ```ts
   * await bot.setStickerSetTitle("animals_by_mybot", "Updated Animal Stickers");
   * ```
   */
  public async setStickerSetTitle(name: string, title: string): Promise<boolean> {
    return this.request<boolean>("setStickerSetTitle", { name, title });
  }

  /**
   * Changes the list of emoji associated with a sticker.
   *
   * @param sticker - File identifier of the sticker.
   * @param emojiList - A list of 1-20 emoji associated with the sticker.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting emoji list fails.
   *
   * @example
   * ```ts
   * await bot.setStickerEmojiList("CAACAgIAAxkBAAE...", ["🎉", "🎊"]);
   * ```
   */
  public async setStickerEmojiList(sticker: string, emojiList: string[]): Promise<boolean> {
    return this.request<boolean>("setStickerEmojiList", {
      sticker,
      emoji_list: emojiList,
    });
  }

  /**
   * Changes search keywords for a sticker.
   *
   * @param sticker - File identifier of the sticker.
   * @param keywords - A list of 0-20 search keywords for the sticker with total length up to 64 characters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting sticker keywords fails.
   *
   * @example
   * ```ts
   * await bot.setStickerKeywords("CAACAgIAAxkBAAE...", ["party", "celebration"]);
   * ```
   */
  public async setStickerKeywords(sticker: string, keywords?: string[]): Promise<boolean> {
    const payload: Record<string, unknown> = { sticker };
    if (keywords !== undefined) {
      payload["keywords"] = keywords;
    }
    return this.request<boolean>("setStickerKeywords", payload);
  }

  /**
   * Changes the mask position of a mask sticker.
   *
   * @param sticker - File identifier of the sticker.
   * @param maskPosition - An object with the position where the mask should be placed on faces, or undefined to remove the mask position.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting mask position fails.
   *
   * @example
   * ```ts
   * await bot.setStickerMaskPosition("CAACAgIAAxkBAAE...", {
   *   point: "forehead",
   *   x_shift: 0,
   *   y_shift: 0,
   *   scale: 1,
   * });
   * ```
   */
  public async setStickerMaskPosition(
    sticker: string,
    maskPosition?: MaskPosition
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { sticker };
    if (maskPosition !== undefined) {
      payload["mask_position"] = maskPosition;
    }
    return this.request<boolean>("setStickerMaskPosition", payload);
  }
}

