/**
 * Message editing, lifecycle, and reaction methods for Bot API.
 *
 * @packageDocumentation
 */

import { MessageBasicMethods } from "./send-basic.js";
import type {
  Message,
  UserProfilePhotos,
  File,
  WebhookInfo,
  EditMessageTextOptions,
  EditMessageCaptionOptions,
  EditMessageReplyMarkupOptions,
  EditMessageMediaOptions,
  StopPollOptions,
  SetMessageReactionOptions,
  SetWebhookOptions,
  Poll,
  SendMessageDraftOptions,
  SendDiceOptions,
  SendChatActionOptions,
  SendChecklistOptions,
  EditMessageChecklistOptions,
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
   *
   * @see {@link https://core.telegram.org/bots/api#stoppoll Telegram Bot API: stopPoll}
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
   *
   * @see {@link https://core.telegram.org/bots/api#senddice Telegram Bot API: sendDice}
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
   *
   * @see {@link https://core.telegram.org/bots/api#sendchataction Telegram Bot API: sendChatAction}
   */
  public async sendChatAction(options: SendChatActionOptions): Promise<boolean> {
    return this.request<boolean>("sendChatAction", options as unknown as Record<string, unknown>);
  }

  /**
   * Edits the text of a message previously sent by the bot or via inline queries.
   *
   * @param options - Options including `text`, `chat_id`+`message_id` or `inline_message_id`, `reply_markup`, and the optional `business_connection_id`.
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
   *
   * @see {@link https://core.telegram.org/bots/api#editmessagetext Telegram Bot API: editMessageText}
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
   *
   * @see {@link https://core.telegram.org/bots/api#editmessagecaption Telegram Bot API: editMessageCaption}
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
   *
   * @see {@link https://core.telegram.org/bots/api#editmessagemedia Telegram Bot API: editMessageMedia}
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
   *
   * @see {@link https://core.telegram.org/bots/api#editmessagereplymarkup Telegram Bot API: editMessageReplyMarkup}
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
   *
   * @see {@link https://core.telegram.org/bots/api#setmessagereaction Telegram Bot API: setMessageReaction}
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
   * Removes the calling user's or a managed business account's reaction from a message.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param messageId - Identifier of the target message.
   * @param userId - Identifier of the target user, for business connections only.
   * @param actorChatId - Unique identifier of the business chat on behalf of which to act.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When clearing reaction fails.
   *
   * @see {@link https://core.telegram.org/bots/api#deletemessagereaction Telegram Bot API: deleteMessageReaction}
   */
  public async deleteMessageReaction(
    chatId: number | string,
    messageId: number,
    userId?: number,
    actorChatId?: number,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, message_id: messageId };
    if (userId !== undefined) payload["user_id"] = userId;
    if (actorChatId !== undefined) payload["actor_chat_id"] = actorChatId;
    return this.request<boolean>("deleteMessageReaction", payload);
  }

  /**
   * Removes all reactions on a message (this endpoint takes no `message_id`).
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param userId - Identifier of the target user, for business connections only.
   * @param actorChatId - Unique identifier of the business chat on behalf of which to act.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When clearing reactions fails.
   *
   * @see {@link https://core.telegram.org/bots/api#deleteallmessagereactions Telegram Bot API: deleteAllMessageReactions}
   */
  public async deleteAllMessageReactions(
    chatId: number | string,
    userId?: number,
    actorChatId?: number,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (userId !== undefined) payload["user_id"] = userId;
    if (actorChatId !== undefined) payload["actor_chat_id"] = actorChatId;
    return this.request<boolean>("deleteAllMessageReactions", payload);
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
   *
   * @see {@link https://core.telegram.org/bots/api#getuserprofilephotos Telegram Bot API: getUserProfilePhotos}
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
   *
   * @see {@link https://core.telegram.org/bots/api#getfile Telegram Bot API: getFile}
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
   *
   * @see {@link https://core.telegram.org/bots/api#setwebhook Telegram Bot API: setWebhook}
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
   *
   * @see {@link https://core.telegram.org/bots/api#deletewebhook Telegram Bot API: deleteWebhook}
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
   *
   * @see {@link https://core.telegram.org/bots/api#getwebhookinfo Telegram Bot API: getWebhookInfo}
   */
  public async getWebhookInfo(): Promise<WebhookInfo> {
    return this.request<WebhookInfo>("getWebhookInfo");
  }

  /**
   * Sets a message draft in a personal chat.
   *
   * @param options - Options including `chat_id` and draft content.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#sendmessagedraft Telegram Bot API: sendMessageDraft}
   */
  public async sendMessageDraft(options: SendMessageDraftOptions): Promise<boolean> {
    return this.request<boolean>("sendMessageDraft", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an interactive checklist message.
   *
   * @param options - Checklist configuration options.
   * @returns Sent {@link Message}.
   * @throws {@link TelegramApiError} When sending the checklist fails.
   *
   * @see {@link https://core.telegram.org/bots/api#sendchecklist Telegram Bot API: sendChecklist}
   */
  public async sendChecklist(options: SendChecklistOptions): Promise<Message> {
    return this.request<Message>("sendChecklist", options as unknown as Record<string, unknown>);
  }

  /**
   * Edits an interactive checklist message.
   *
   * @param options - Checklist modification options.
   * @returns Edited {@link Message} or boolean.
   * @throws {@link TelegramApiError} When editing the checklist fails.
   *
   * @see {@link https://core.telegram.org/bots/api#editmessagechecklist Telegram Bot API: editMessageChecklist}
   */
  public async editMessageChecklist(
    options: EditMessageChecklistOptions,
  ): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "editMessageChecklist",
      options as unknown as Record<string, unknown>,
    );
  }
}
