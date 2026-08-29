/**
 * Message editing, lifecycle, and reaction methods for Bot API.
 *
 * @packageDocumentation
 */

import { MessageBasicMethods } from "./send-basic.js";
import type { ParseMode } from "../../constants.js";
import type {
  Message,
  UserProfilePhotos,
  File,
  WebhookInfo,
  EditMessageTextOptions,
  EditMessageCaptionOptions,
  EditMessageReplyMarkupOptions,
  EditMessageMediaOptions,
  EditMessageLiveLocationOptions,
  StopMessageLiveLocationOptions,
  StopPollOptions,
  SetMessageReactionOptions,
  SetWebhookOptions,
  Poll,
  MessageId,
  ForwardMessagesOptions,
  CopyMessagesOptions,
  PreparedInlineMessage,
  SavePreparedInlineMessageOptions,
  SendMessageDraftOptions,
  SendLivePhotoOptions,
  SendDiceOptions,
  SendChatActionOptions,
} from "../../types/index.js";

/**
 * Mixin providing message editing, lifecycle, webhook, and reaction operations.
 */
export abstract class MessageEditMethods extends MessageBasicMethods {
  /**
   * Stops a poll which was sent by the bot.
   *
   * @param chatId - Unique identifier for the target chat or channel.
   * @param messageId - Identifier of the original message with the poll.
   * @param options - Additional stop options.
   * @returns The final stopped {@link Poll} state.
   * @throws {@link TelegramApiError} When stopping poll fails.
   *
   * @example
   * ```ts
   * const poll = await bot.stopPoll(chatId, messageId);
   * console.log(`Total voters: ${poll.total_voter_count}`);
   * ```
   */
  public async stopPoll(
    chatId: number | string,
    messageId: number,
    options: StopPollOptions = {},
  ): Promise<Poll> {
    return this.request<Poll>("stopPoll", {
      chat_id: chatId,
      message_id: messageId,
      ...options,
    });
  }

  /**
   * Sends an animated dice, dart, basketball, football, slot machine, or bowling pin.
   *
   * @param options - Options including `chat_id` and optional `emoji` (default `🎲`).
   * @returns The sent {@link Message} with dice result value.
   * @throws {@link TelegramApiError} When sending dice fails.
   *
   * @example
   * ```ts
   * const msg = await bot.sendDice({ chat_id: 123456, emoji: "🎯" });
   * console.log(`Dart score: ${msg.dice?.value}`);
   * ```
   */
  public async sendDice(options: SendDiceOptions): Promise<Message> {
    return this.request<Message>("sendDice", options as unknown as Record<string, unknown>);
  }

  /**
   * Broadcasts a chat status action (e.g. typing, uploading photo) to chat members.
   *
   * @param options - Options including `chat_id` and `action` (from {@link ChatAction}).
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When sending action fails.
   *
   * @example
   * ```ts
   * await bot.sendChatAction({ chat_id: 123456, action: ChatAction.TYPING });
   * ```
   */
  public async sendChatAction(options: SendChatActionOptions): Promise<boolean> {
    return this.request<boolean>("sendChatAction", options as unknown as Record<string, unknown>);
  }

  /**
   * Edits the text of a message previously sent by the bot or via inline queries.
   *
   * @param options - Options including `text`, `chat_id`+`message_id` or `inline_message_id`, and `reply_markup`.
   * @returns The edited {@link Message} or `true` if inline message.
   * @throws {@link TelegramApiError} When editing text fails.
   *
   * @example
   * ```ts
   * await bot.editMessageText({
   *   chat_id: 123456,
   *   message_id: 789,
   *   text: "Updated text content",
   * });
   * ```
   */
  public async editMessageText(options: EditMessageTextOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "editMessageText",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits the caption of a media message previously sent by the bot.
   *
   * @param options - Options including optional `caption`, `parse_mode`, and `reply_markup`.
   * @returns The edited {@link Message} or `true` if inline message.
   * @throws {@link TelegramApiError} When editing caption fails.
   *
   * @example
   * ```ts
   * await bot.editMessageCaption({
   *   chat_id: 123456,
   *   message_id: 789,
   *   caption: "Updated caption description",
   * });
   * ```
   */
  public async editMessageCaption(options: EditMessageCaptionOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "editMessageCaption",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits the animation, audio, document, photo, or video content of a message.
   *
   * @param options - Options including new `media` descriptor and target message ID.
   * @returns The edited {@link Message} or `true` if inline message.
   * @throws {@link TelegramApiError} When editing media fails.
   *
   * @example
   * ```ts
   * await bot.editMessageMedia({
   *   chat_id: 123456,
   *   message_id: 789,
   *   media: { type: "photo", media: "https://example.com/new_photo.jpg" },
   * });
   * ```
   */
  public async editMessageMedia(options: EditMessageMediaOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "editMessageMedia",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits only the inline keyboard reply markup of a message.
   *
   * @param options - Target message options with optional new `reply_markup`.
   * @returns The edited {@link Message} or `true` if inline message.
   * @throws {@link TelegramApiError} When editing reply markup fails.
   *
   * @example
   * ```ts
   * await bot.editMessageReplyMarkup({
   *   chat_id: 123456,
   *   message_id: 789,
   *   reply_markup: new InlineKeyboard().text("Done", "done").build(),
   * });
   * ```
   */
  public async editMessageReplyMarkup(
    options: EditMessageReplyMarkupOptions,
  ): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "editMessageReplyMarkup",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Sets emoji or custom emoji reactions on a message.
   *
   * @param options - Reaction options including `chat_id`, `message_id`, and `reaction` array/string.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting reaction fails.
   *
   * @example
   * ```ts
   * await bot.setMessageReaction({
   *   chat_id: 123456,
   *   message_id: 789,
   *   reaction: "👍",
   * });
   * ```
   */
  public async setMessageReaction(options: SetMessageReactionOptions): Promise<boolean> {
    let reactionPayload: unknown = options.reaction;
    if (typeof options.reaction === "string") {
      reactionPayload = [{ type: "emoji", emoji: options.reaction }];
    } else if (Array.isArray(options.reaction)) {
      reactionPayload = options.reaction.map((r) =>
        typeof r === "string" ? { type: "emoji", emoji: r } : r,
      );
    } else if (options.reaction && typeof options.reaction === "object") {
      reactionPayload = [options.reaction];
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
   * Clears the bot's reaction on a message.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageId - Identifier of the message.
   * @param isBig - Pass `true` for big animation.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When clearing reaction fails.
   */
  public async deleteMessageReaction(
    chatId: number | string,
    messageId: number,
    isBig?: boolean,
  ): Promise<boolean> {
    return this.setMessageReaction({
      chat_id: chatId,
      message_id: messageId,
      reaction: [],
      is_big: isBig,
    });
  }

  /**
   * Clears all reactions on a message.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageId - Identifier of the message.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When clearing reactions fails.
   */
  public async deleteAllMessageReactions(
    chatId: number | string,
    messageId: number,
  ): Promise<boolean> {
    return this.setMessageReaction({ chat_id: chatId, message_id: messageId, reaction: [] });
  }

  /**
   * Retrieves a list of profile pictures for a user.
   *
   * @param userId - Unique identifier of the target user.
   * @param offset - Sequential number of first photo to return (default 0).
   * @param limit - Limits the number of photos to be retrieved (1-100, default 100).
   * @returns A {@link UserProfilePhotos} object.
   * @throws {@link TelegramApiError} When retrieving photos fails.
   *
   * @example
   * ```ts
   * const photos = await bot.getUserProfilePhotos(123456, 0, 1);
   * console.log(`User has ${photos.total_count} total photos`);
   * ```
   */
  public async getUserProfilePhotos(
    userId: number,
    offset?: number,
    limit?: number,
  ): Promise<UserProfilePhotos> {
    const payload: Record<string, unknown> = { user_id: userId };
    if (offset !== undefined) payload["offset"] = offset;
    if (limit !== undefined) payload["limit"] = limit;
    return this.request<UserProfilePhotos>("getUserProfilePhotos", payload);
  }

  /**
   * Retrieves basic info about a file and prepares it for downloading.
   *
   * @param fileId - File identifier to get info about.
   * @returns A {@link File} object with `file_path`.
   * @throws {@link TelegramApiError} When file is not found or exceeds 20MB bot limit.
   *
   * @example
   * ```ts
   * const file = await bot.getFile(photoFileId);
   * const downloadUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
   * ```
   */
  public async getFile(fileId: string): Promise<File> {
    return this.request<File>("getFile", { file_id: fileId });
  }

  /**
   * Configures a webhook URL to receive incoming updates via HTTPS POST requests.
   *
   * @param options - Webhook settings including `url`, optional `secret_token`, `allowed_updates`, and `certificate`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting webhook fails.
   *
   * @example
   * ```ts
   * await bot.setWebhook({
   *   url: "https://bot.example.com/webhook",
   *   secret_token: "my-secret-token",
   *   allowed_updates: ["message", "callback_query"],
   * });
   * ```
   */
  public async setWebhook(options: SetWebhookOptions): Promise<boolean> {
    return this.request<boolean>("setWebhook", options as unknown as Record<string, unknown>);
  }

  /**
   * Removes webhook integration, reverting to getUpdates polling.
   *
   * @param dropPendingUpdates - Pass `true` to discard all queued undelivered updates.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When removing webhook fails.
   *
   * @example
   * ```ts
   * await bot.deleteWebhook(true);
   * ```
   */
  public async deleteWebhook(dropPendingUpdates?: boolean): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (dropPendingUpdates !== undefined) payload["drop_pending_updates"] = dropPendingUpdates;
    return this.request<boolean>("deleteWebhook", payload);
  }

  /**
   * Retrieves current webhook status information.
   *
   * @returns A {@link WebhookInfo} object.
   * @throws {@link TelegramApiError} When retrieving webhook info fails.
   *
   * @example
   * ```ts
   * const info = await bot.getWebhookInfo();
   * console.log(`Webhook URL: ${info.url}, Pending updates: ${info.pending_update_count}`);
   * ```
   */
  public async getWebhookInfo(): Promise<WebhookInfo> {
    return this.request<WebhookInfo>("getWebhookInfo");
  }

  /**
   * Sets a message draft in a personal chat.
   *
   * @param options - Options including `chat_id` and draft content.
   * @returns `true` on success.
   */
  public async sendMessageDraft(options: SendMessageDraftOptions): Promise<boolean> {
    return this.request<boolean>("sendMessageDraft", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an interactive checklist message.
   *
   * @param options - Checklist configuration options.
   * @returns Sent {@link Message}.
   */
  public async sendChecklist(options: Record<string, unknown>): Promise<Message> {
    return this.request<Message>("sendChecklist", options);
  }

  /**
   * Edits an interactive checklist message.
   *
   * @param options - Checklist modification options.
   * @returns Edited {@link Message} or boolean.
   */
  public async editMessageChecklist(options: Record<string, unknown>): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageChecklist", options);
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

  /**
   * Retrieves messages from a personal chat.
   *
   * @param chatId - Chat identifier.
   * @param limit - Maximum messages to return.
   * @returns Array of {@link Message} objects.
   */
  public async getUserPersonalChatMessages(
    chatId: number | string,
    limit?: number,
  ): Promise<Message[]> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (limit !== undefined) payload["limit"] = limit;
    return this.request<Message[]>("getUserPersonalChatMessages", payload);
  }

  /**
   * Stores a message that can be sent by a user of a Mini App.
   *
   * @param options - Prepared inline message options including `user_id` and `result`.
   * @returns A {@link PreparedInlineMessage} object containing the `id` and `expiration_date`.
   * @throws {@link TelegramApiError} When saving the prepared message fails.
   *
   * @example
   * ```ts
   * const prepared = await bot.savePreparedInlineMessage({
   *   user_id: 123456,
   *   result: {
   *     type: "article",
   *     id: "art_1",
   *     title: "Shareable Result",
   *     input_message_content: { message_text: "Shared via Mini App!" },
   *   },
   *   allow_user_chats: true,
   *   allow_group_chats: true,
   * });
   * console.log(`Prepared message ID: ${prepared.id}`);
   * ```
   */
  public async savePreparedInlineMessage(
    options: SavePreparedInlineMessageOptions,
  ): Promise<PreparedInlineMessage> {
    return this.request<PreparedInlineMessage>(
      "savePreparedInlineMessage",
      options as unknown as Record<string, unknown>,
    );
  }
}
