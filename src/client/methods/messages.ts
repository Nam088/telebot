/**
 * Message, media, and location methods for Bot API.
 *
 * @packageDocumentation
 */

import { BaseBotClient } from "./base.js";
import type {
  User,
  Message,
  Update as RawUpdate,
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
} from "../types.js";
import type { ParseMode } from "../constants.js";

/**
 * Mixin providing message, media sending, editing, and reaction operations.
 */
export abstract class MessageMethods extends BaseBotClient {
  /**
   * Basic information about the bot in form of a {@link User} object.
   *
   * @returns The {@link User} object representing the bot.
   * @throws {@link TelegramApiError} When token is invalid or request fails.
   *
   * @example
   * ```ts
   * const me = await bot.getMe();
   * console.log(`Logged in as @${me.username} (${me.id})`);
   * ```
   */
  public async getMe(): Promise<User> {
    return this.request<User>("getMe");
  }

  /**
   * Retrieves incoming updates using long polling.
   *
   * @param options - Polling options such as `offset`, `limit`, `timeout`, and `allowed_updates`.
   * @returns Array of {@link RawUpdate} objects.
   * @throws {@link TelegramApiError} When retrieving updates fails.
   *
   * @example
   * ```ts
   * const updates = await bot.getUpdates({ timeout: 10, offset: 0 });
   * console.log(`Received ${updates.length} updates`);
   * ```
   */
  public async getUpdates(options: GetUpdatesOptions = {}): Promise<RawUpdate[]> {
    return this.request<RawUpdate[]>("getUpdates", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a text message to a specific chat or user.
   *
   * @param options - Message options including `chat_id`, `text`, `parse_mode`, `reply_markup`, and `reply_parameters`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendMessage({
   *   chat_id: 123456,
   *   text: "Hello *world*!",
   *   parse_mode: ParseMode.MARKDOWN_V2,
   * });
   * ```
   */
  public async sendMessage(options: SendMessageOptions): Promise<Message> {
    return this.request<Message>("sendMessage", options as unknown as Record<string, unknown>);
  }

  /**
   * Deletes a message in a chat.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param messageId - Identifier of the message to delete.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When message cannot be deleted.
   *
   * @example
   * ```ts
   * await bot.deleteMessage(chatId, messageId);
   * ```
   */
  public async deleteMessage(chatId: number | string, messageId: number): Promise<boolean> {
    return this.request<boolean>("deleteMessage", { chat_id: chatId, message_id: messageId });
  }

  /**
   * Deletes multiple messages simultaneously in a chat.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param messageIds - Array of 1-100 identifiers of messages to delete.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When messages cannot be deleted.
   *
   * @example
   * ```ts
   * await bot.deleteMessages(chatId, [101, 102, 103]);
   * ```
   */
  public async deleteMessages(chatId: number | string, messageIds: number[]): Promise<boolean> {
    return this.request<boolean>("deleteMessages", { chat_id: chatId, message_ids: messageIds });
  }

  /**
   * Forwards a message of any kind.
   *
   * @param options - Forward options including `chat_id`, `from_chat_id`, and `message_id`.
   * @returns The forwarded {@link Message}.
   * @throws {@link TelegramApiError} When forwarding fails.
   *
   * @example
   * ```ts
   * await bot.forwardMessage({
   *   chat_id: targetChatId,
   *   from_chat_id: sourceChatId,
   *   message_id: 123,
   * });
   * ```
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
   * Forwards multiple messages of any kind in batch.
   *
   * @param options - Forward batch options including `chat_id`, `from_chat_id`, and `message_ids`.
   * @returns Array of {@link MessageId} objects containing the identifiers of forwarded messages.
   * @throws {@link TelegramApiError} When batch forwarding fails.
   *
   * @example
   * ```ts
   * const sent = await bot.forwardMessages({
   *   chat_id: targetChatId,
   *   from_chat_id: sourceChatId,
   *   message_ids: [100, 101],
   * });
   * console.log(`Forwarded ${sent.length} messages`);
   * ```
   */
  public async forwardMessages(options: ForwardMessagesOptions): Promise<MessageId[]> {
    return this.request<MessageId[]>(
      "forwardMessages",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Copies a message of any kind, sending a new message with the same content without header links.
   *
   * @param options - Copy options including optional custom `caption`, `parse_mode`, and `reply_markup`.
   * @returns Object containing the `message_id` of the copied message.
   * @throws {@link TelegramApiError} When copying fails.
   *
   * @example
   * ```ts
   * const result = await bot.copyMessage({
   *   chat_id: targetChatId,
   *   from_chat_id: sourceChatId,
   *   message_id: 123,
   *   caption: "Here is your copy!",
   * });
   * ```
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
    return this.request<{ message_id: number }>(
      "copyMessage",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Copies multiple messages of any kind in batch.
   *
   * @param options - Batch copy options including `chat_id`, `from_chat_id`, and `message_ids`.
   * @returns Array of {@link MessageId} objects containing the identifiers of copied messages.
   * @throws {@link TelegramApiError} When batch copying fails.
   *
   * @example
   * ```ts
   * const copies = await bot.copyMessages({
   *   chat_id: targetChatId,
   *   from_chat_id: sourceChatId,
   *   message_ids: [100, 101],
   *   remove_caption: true,
   * });
   * console.log(`Copied ${copies.length} messages`);
   * ```
   */
  public async copyMessages(options: CopyMessagesOptions): Promise<MessageId[]> {
    return this.request<MessageId[]>("copyMessages", options as unknown as Record<string, unknown>);
  }

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
   * Sends a geographic location point on a map.
   *
   * @param options - Options including `chat_id`, `latitude`, `longitude`, and optional `live_period`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendLocation({
   *   chat_id: 123456,
   *   latitude: 37.7749,
   *   longitude: -122.4194,
   * });
   * ```
   */
  public async sendLocation(options: SendLocationOptions): Promise<Message> {
    return this.request<Message>("sendLocation", options as unknown as Record<string, unknown>);
  }

  /**
   * Edits a live location message previously sent by the bot.
   *
   * @param options - Options including `latitude`, `longitude`, and either `chat_id`+`message_id` or `inline_message_id`.
   * @returns The edited {@link Message} or `true` if inline message.
   * @throws {@link TelegramApiError} When editing live location fails.
   *
   * @example
   * ```ts
   * await bot.editMessageLiveLocation({
   *   chat_id: 123456,
   *   message_id: 456,
   *   latitude: 37.7750,
   *   longitude: -122.4195,
   * });
   * ```
   */
  public async editMessageLiveLocation(
    options: EditMessageLiveLocationOptions,
  ): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "editMessageLiveLocation",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Stops updating a live location message before `live_period` expires.
   *
   * @param options - Target message identifier options.
   * @returns The stopped {@link Message} or `true` if inline message.
   * @throws {@link TelegramApiError} When stopping fails.
   *
   * @example
   * ```ts
   * await bot.stopMessageLiveLocation({
   *   chat_id: 123456,
   *   message_id: 456,
   * });
   * ```
   */
  public async stopMessageLiveLocation(
    options: StopMessageLiveLocationOptions,
  ): Promise<Message | boolean> {
    return this.request<Message | boolean>(
      "stopMessageLiveLocation",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Sends information about a venue / location with title and address.
   *
   * @param options - Options including `chat_id`, `latitude`, `longitude`, `title`, and `address`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendVenue({
   *   chat_id: 123456,
   *   latitude: 40.758896,
   *   longitude: -73.985130,
   *   title: "Times Square",
   *   address: "Manhattan, NY 10036",
   * });
   * ```
   */
  public async sendVenue(options: SendVenueOptions): Promise<Message> {
    return this.request<Message>("sendVenue", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a phone contact card to a chat.
   *
   * @param options - Options including `chat_id`, `phone_number`, `first_name`, and optional `last_name`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendContact({
   *   chat_id: 123456,
   *   phone_number: "+1234567890",
   *   first_name: "Alice",
   * });
   * ```
   */
  public async sendContact(options: SendContactOptions): Promise<Message> {
    return this.request<Message>("sendContact", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a native Telegram poll or quiz.
   *
   * @param options - Options including `chat_id`, `question`, `options` array, `type`, and `is_anonymous`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending poll fails.
   *
   * @example
   * ```ts
   * await bot.sendPoll({
   *   chat_id: 123456,
   *   question: "What is your favorite language?",
   *   options: [{ text: "TypeScript" }, { text: "Rust" }, { text: "Go" }],
   *   is_anonymous: false,
   * });
   * ```
   */
  public async sendPoll(options: SendPollOptions): Promise<Message> {
    return this.request<Message>("sendPoll", options as unknown as Record<string, unknown>);
  }

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
  public async sendMessageDraft(options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("sendMessageDraft", options);
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
  public async sendLivePhoto(options: Record<string, unknown>): Promise<Message> {
    return this.request<Message>("sendLivePhoto", options);
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
