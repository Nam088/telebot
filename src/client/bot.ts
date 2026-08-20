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
  AnswerCallbackQueryOptions,
  AnswerInlineQueryOptions,
  PromoteChatMemberOptions,
  CreateChatInviteLinkOptions,
  EditChatInviteLinkOptions,
  SetWebhookOptions,
} from "./types.js";
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

  // --- 100% snake_case Method Aliases ---
  public readonly get_me = this.getMe.bind(this);
  public readonly send_message = this.sendMessage.bind(this);
  public readonly get_updates = this.getUpdates.bind(this);
  public readonly send_photo = this.sendPhoto.bind(this);
  public readonly send_audio = this.sendAudio.bind(this);
  public readonly send_document = this.sendDocument.bind(this);
  public readonly send_video = this.sendVideo.bind(this);
  public readonly send_animation = this.sendAnimation.bind(this);
  public readonly send_voice = this.sendVoice.bind(this);
  public readonly send_video_note = this.sendVideoNote.bind(this);
  public readonly send_media_group = this.sendMediaGroup.bind(this);
  public readonly send_location = this.sendLocation.bind(this);
  public readonly send_venue = this.sendVenue.bind(this);
  public readonly send_contact = this.sendContact.bind(this);
  public readonly send_poll = this.sendPoll.bind(this);
  public readonly send_dice = this.sendDice.bind(this);
  public readonly send_chat_action = this.sendChatAction.bind(this);
  public readonly edit_message_text = this.editMessageText.bind(this);
  public readonly edit_message_caption = this.editMessageCaption.bind(this);
  public readonly edit_message_reply_markup = this.editMessageReplyMarkup.bind(this);
  public readonly delete_message = this.deleteMessage.bind(this);
  public readonly answer_callback_query = this.answerCallbackQuery.bind(this);
  public readonly answer_inline_query = this.answerInlineQuery.bind(this);
  public readonly ban_chat_member = this.banChatMember.bind(this);
  public readonly unban_chat_member = this.unbanChatMember.bind(this);
  public readonly restrict_chat_member = this.restrictChatMember.bind(this);
  public readonly promote_chat_member = this.promoteChatMember.bind(this);
  public readonly set_chat_administrator_custom_title = this.setChatAdministratorCustomTitle.bind(this);
  public readonly set_chat_permissions = this.setChatPermissions.bind(this);
  public readonly export_chat_invite_link = this.exportChatInviteLink.bind(this);
  public readonly create_chat_invite_link = this.createChatInviteLink.bind(this);
  public readonly get_chat = this.getChat.bind(this);
  public readonly get_chat_administrators = this.getChatAdministrators.bind(this);
  public readonly get_chat_member_count = this.getChatMemberCount.bind(this);
  public readonly get_chat_member = this.getChatMember.bind(this);
  public readonly leave_chat = this.leaveChat.bind(this);
  public readonly pin_chat_message = this.pinChatMessage.bind(this);
  public readonly unpin_chat_message = this.unpinChatMessage.bind(this);
  public readonly get_user_profile_photos = this.getUserProfilePhotos.bind(this);
  public readonly get_file = this.getFile.bind(this);
  public readonly set_webhook = this.setWebhook.bind(this);
  public readonly delete_webhook = this.deleteWebhook.bind(this);
  public readonly get_webhook_info = this.getWebhookInfo.bind(this);
}
