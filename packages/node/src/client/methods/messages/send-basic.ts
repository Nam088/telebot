/**
 * Basic message sending and polling methods for Bot API.
 *
 * @packageDocumentation
 */

import { MessageMediaMethods } from "./send-media.js";
import type { ParseMode } from "../../constants.js";
import type {
  User,
  Message,
  RawUpdate,
  SendMessageOptions,
  GetUpdatesOptions,
  SendLocationOptions,
  SendVenueOptions,
  SendContactOptions,
  SendPollOptions,
  PreparedInlineMessage,
  SavePreparedInlineMessageOptions,
  ForwardMessagesOptions,
  CopyMessagesOptions,
  MessageId,
  EditMessageLiveLocationOptions,
  StopMessageLiveLocationOptions,
  SuggestedPostParameters,
  ReplyParameters,
  ReplyMarkup,
  MessageEntity,
} from "../../types/index.js";

/**
 * Mixin providing core text message sending, location, and polling operations.
 */
export abstract class MessageBasicMethods extends MessageMediaMethods {
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
   *
   * @see {@link https://core.telegram.org/bots/api#getme Telegram Bot API: getMe}
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
   *
   * @see {@link https://core.telegram.org/bots/api#getupdates Telegram Bot API: getUpdates}
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
   *
   * @see {@link https://core.telegram.org/bots/api#sendmessage Telegram Bot API: sendMessage}
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
   *
   * @see {@link https://core.telegram.org/bots/api#deletemessage Telegram Bot API: deleteMessage}
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
   *
   * @see {@link https://core.telegram.org/bots/api#deletemessages Telegram Bot API: deleteMessages}
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
   *
   * @see {@link https://core.telegram.org/bots/api#forwardmessage Telegram Bot API: forwardMessage}
   */
  public async forwardMessage(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_id: number;
    video_start_timestamp?: number;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_thread_id?: number;
    direct_messages_topic_id?: number;
    message_effect_id?: string;
    suggested_post_parameters?: SuggestedPostParameters;
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
   *
   * @see {@link https://core.telegram.org/bots/api#forwardmessages Telegram Bot API: forwardMessages}
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
   *
   * @see {@link https://core.telegram.org/bots/api#copymessage Telegram Bot API: copyMessage}
   */
  public async copyMessage(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_id: number;
    caption?: string;
    parse_mode?: ParseMode;
    caption_entities?: MessageEntity[];
    show_caption_above_media?: boolean;
    video_start_timestamp?: number;
    disable_notification?: boolean;
    protect_content?: boolean;
    reply_parameters?: ReplyParameters;
    reply_markup?: ReplyMarkup;
    message_thread_id?: number;
    direct_messages_topic_id?: number;
    allow_paid_broadcast?: boolean;
    message_effect_id?: string;
    suggested_post_parameters?: SuggestedPostParameters;
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
   *
   * @see {@link https://core.telegram.org/bots/api#copymessages Telegram Bot API: copyMessages}
   */
  public async copyMessages(options: CopyMessagesOptions): Promise<MessageId[]> {
    return this.request<MessageId[]>("copyMessages", options as unknown as Record<string, unknown>);
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
   *
   * @see {@link https://core.telegram.org/bots/api#sendlocation Telegram Bot API: sendLocation}
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
   *
   * @see {@link https://core.telegram.org/bots/api#editmessagelivelocation Telegram Bot API: editMessageLiveLocation}
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
   *
   * @see {@link https://core.telegram.org/bots/api#stopmessagelivelocation Telegram Bot API: stopMessageLiveLocation}
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
   *
   * @see {@link https://core.telegram.org/bots/api#sendvenue Telegram Bot API: sendVenue}
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
   *
   * @see {@link https://core.telegram.org/bots/api#sendcontact Telegram Bot API: sendContact}
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
   *
   * @see {@link https://core.telegram.org/bots/api#sendpoll Telegram Bot API: sendPoll}
   */
  public async sendPoll(options: SendPollOptions): Promise<Message> {
    return this.request<Message>("sendPoll", options as unknown as Record<string, unknown>);
  }

  /**
   * Retrieves messages from a user's personal chat with the bot.
   *
   * @param userId - Unique identifier of the target user.
   * @param limit - Maximum number of messages to be returned; 1-100.
   * @returns Array of {@link Message} objects.
   * @throws {@link TelegramApiError} When retrieving messages fails.
   *
   * @see {@link https://core.telegram.org/bots/api#getuserpersonalchatmessages Telegram Bot API: getUserPersonalChatMessages}
   */
  public async getUserPersonalChatMessages(userId: number, limit: number): Promise<Message[]> {
    return this.request<Message[]>("getUserPersonalChatMessages", {
      user_id: userId,
      limit,
    });
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
   *
   * @see {@link https://core.telegram.org/bots/api#savepreparedinlinemessage Telegram Bot API: savePreparedInlineMessage}
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
