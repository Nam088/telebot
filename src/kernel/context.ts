/**
 * Callback context passed to handler callbacks.
 *
 * @packageDocumentation
 */

import type { Bot } from "../client/bot.js";
import type { Update } from "./update.js";
import type { JobQueue } from "../scheduler/queue.js";
import type { Job } from "../scheduler/job.js";
import {
  ConversationContextHelper,
  type AsyncConversationManager,
} from "../routing/async-conversation.js";

/**
 * Context object passed to handler callbacks, error handlers, and job callbacks.
 *
 * @typeParam UserData - Custom type definition for user-level persisted state.
 * @typeParam ChatData - Custom type definition for chat-level persisted state.
 * @typeParam BotData - Custom type definition for bot-level persisted state.
 *
 * @remarks
 * Context state property names (`context.user_data`, `context.chat_data`, `context.bot_data`,
 * `context.args`, `context.job_queue`) use consistent `snake_case` naming.
 *
 * @example
 * ```ts
 * async function startCallback(update: Update, context: CallbackContext) {
 *   const name = update.effective_user?.first_name ?? "there";
 *   context.user_data.visited = true;
 *   await context.bot.sendMessage({
 *     chat_id: update.effective_chat!.id,
 *     text: `Hello ${name}!`,
 *   });
 * }
 * ```
 */
export class CallbackContext<
  UserData extends Record<string, unknown> = Record<string, unknown>,
  ChatData extends Record<string, unknown> = Record<string, unknown>,
  BotData extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * The {@link Bot} client instance executing this handler.
   */
  public readonly bot: Bot;

  /**
   * Background task scheduler and timer engine.
   */
  public scheduler?: JobQueue;

  /**
   * The current background task/job being executed (when invoked from the scheduler).
   */
  public task?: Job;

  /**
   * Positional arguments parsed from a command message.
   */
  public args?: string[];

  /**
   * Per-user persistent or memory storage object.
   */
  public userData?: UserData;

  /**
   * Per-chat persistent or memory storage object.
   */
  public chatData?: ChatData;

  /**
   * Global bot-level persistent or memory storage object.
   */
  public botData?: BotData;

  /**
   * The caught exception / error when invoked inside an error handler.
   */
  public error?: Error;

  /**
   * RegExp match arrays populated by filters matching regular expressions.
   */
  public matches?: RegExpMatchArray[];

  /**
   * The {@link Update} that triggered this handler invocation, if applicable.
   */
  public readonly update?: Update;

  // Compatibility aliases
  get job_queue(): JobQueue | undefined {
    return this.scheduler;
  }
  set job_queue(val: JobQueue | undefined) {
    this.scheduler = val;
  }

  get job(): Job | undefined {
    return this.task;
  }
  set job(val: Job | undefined) {
    this.task = val;
  }

  get user_data(): UserData | undefined {
    return this.userData;
  }
  set user_data(val: UserData | undefined) {
    this.userData = val;
  }

  get chat_data(): ChatData | undefined {
    return this.chatData;
  }
  set chat_data(val: ChatData | undefined) {
    this.chatData = val;
  }

  get bot_data(): BotData | undefined {
    return this.botData;
  }
  set bot_data(val: BotData | undefined) {
    this.botData = val;
  }

  /**
   * Linear async conversation helper instance.
   */
  public conversation: ConversationContextHelper;

  /**
   * Creates a new {@link CallbackContext} instance.
   *
   * @param options - Initialization options for context properties.
   */
  constructor(options: {
    bot: Bot;
    scheduler?: JobQueue;
    job_queue?: JobQueue;
    task?: Job;
    job?: Job;
    args?: string[];
    userData?: UserData;
    user_data?: UserData;
    chatData?: ChatData;
    chat_data?: ChatData;
    botData?: BotData;
    bot_data?: BotData;
    error?: Error;
    matches?: RegExpMatchArray[];
    update?: Update;
    conversationManager?: AsyncConversationManager;
  }) {
    this.bot = options.bot;
    this.scheduler = options.scheduler ?? options.job_queue;
    this.task = options.task ?? options.job;
    this.args = options.args;
    this.userData = options.userData ?? options.user_data;
    this.chatData = options.chatData ?? options.chat_data;
    this.botData = options.botData ?? options.bot_data;
    this.error = options.error;
    this.matches = options.matches;
    this.update = options.update;
    this.conversation = new ConversationContextHelper(this, options.conversationManager);
  }

  /**
   * Convenience shortcut to send a text reply to the current chat.
   *
   * @param text - Message text to send.
   * @param options - Additional parameters for sending message.
   * @returns The sent {@link Message}.
   *
   * @example
   * ```ts
   * await context.reply("Hello there!");
   * ```
   */
  public async reply(
    text: string,
    options: Omit<import("../client/types.js").SendMessageOptions, "chat_id" | "text"> = {},
  ): Promise<import("../client/types.js").Message> {
    const chatId = this.update?.effective_chat?.id;
    if (!chatId) {
      throw new Error("Cannot call context.reply() when update has no effective_chat.");
    }
    return this.bot.sendMessage({
      chat_id: chatId,
      text,
      ...options,
    });
  }

  /**
   * Convenience shortcut to send a photo to the current chat.
   *
   * @param photo - File ID, URL, or {@link InputFile}.
   * @param options - Additional photo options.
   * @returns The sent {@link Message}.
   */
  public async replyWithPhoto(
    photo: string | import("../utils/http.js").InputFile,
    options: Omit<import("../client/types.js").SendPhotoOptions, "chat_id" | "photo"> = {},
  ): Promise<import("../client/types.js").Message> {
    const chatId = this.update?.effective_chat?.id;
    if (!chatId) {
      throw new Error("Cannot call context.replyWithPhoto() when update has no effective_chat.");
    }
    return this.bot.sendPhoto({
      chat_id: chatId,
      photo,
      ...options,
    });
  }

  /**
   * Convenience shortcut to send a document/file to the current chat.
   *
   * @param document - File ID, URL, or {@link InputFile}.
   * @param options - Additional document options.
   * @returns The sent {@link Message}.
   */
  public async replyWithDocument(
    document: string | import("../utils/http.js").InputFile,
    options: Omit<import("../client/types.js").SendDocumentOptions, "chat_id" | "document"> = {},
  ): Promise<import("../client/types.js").Message> {
    const chatId = this.update?.effective_chat?.id;
    if (!chatId) {
      throw new Error("Cannot call context.replyWithDocument() when update has no effective_chat.");
    }
    return this.bot.sendDocument({
      chat_id: chatId,
      document,
      ...options,
    });
  }

  /**
   * Convenience shortcut to send an HTML-formatted message to the current chat.
   *
   * @param htmlText - HTML string content.
   * @param options - Additional message options.
   * @returns The sent {@link Message}.
   */
  public async replyWithHTML(
    htmlText: string,
    options: Omit<
      import("../client/types.js").SendMessageOptions,
      "chat_id" | "text" | "parse_mode"
    > = {},
  ): Promise<import("../client/types.js").Message> {
    return this.reply(htmlText, { ...options, parse_mode: "HTML" });
  }

  /**
   * Convenience shortcut to send a MarkdownV2-formatted message to the current chat.
   *
   * @param markdownText - MarkdownV2 string content.
   * @param options - Additional message options.
   * @returns The sent {@link Message}.
   */
  public async replyWithMarkdown(
    markdownText: string,
    options: Omit<
      import("../client/types.js").SendMessageOptions,
      "chat_id" | "text" | "parse_mode"
    > = {},
  ): Promise<import("../client/types.js").Message> {
    return this.reply(markdownText, { ...options, parse_mode: "MarkdownV2" });
  }

  /**
   * Convenience shortcut to send a video to the current chat.
   *
   * @param video - File ID, URL, or {@link InputFile}.
   * @param options - Additional video options.
   * @returns The sent {@link Message}.
   */
  public async replyWithVideo(
    video: string | import("../utils/http.js").InputFile,
    options: Omit<import("../client/types.js").SendVideoOptions, "chat_id" | "video"> = {},
  ): Promise<import("../client/types.js").Message> {
    const chatId = this.update?.effective_chat?.id;
    if (!chatId) {
      throw new Error("Cannot call context.replyWithVideo() when update has no effective_chat.");
    }
    return this.bot.sendVideo({
      chat_id: chatId,
      video,
      ...options,
    });
  }

  /**
   * Convenience shortcut to send an audio file to the current chat.
   *
   * @param audio - File ID, URL, or {@link InputFile}.
   * @param options - Additional audio options.
   * @returns The sent {@link Message}.
   */
  public async replyWithAudio(
    audio: string | import("../utils/http.js").InputFile,
    options: Omit<import("../client/types.js").SendAudioOptions, "chat_id" | "audio"> = {},
  ): Promise<import("../client/types.js").Message> {
    const chatId = this.update?.effective_chat?.id;
    if (!chatId) {
      throw new Error("Cannot call context.replyWithAudio() when update has no effective_chat.");
    }
    return this.bot.sendAudio({
      chat_id: chatId,
      audio,
      ...options,
    });
  }

  /**
   * Convenience shortcut to answer the active callback query.
   *
   * @param options - Additional answer options (e.g. text notification, alert).
   * @returns `true` on success.
   */
  public async answerCallbackQuery(
    options: Omit<
      import("../client/types.js").AnswerCallbackQueryOptions,
      "callback_query_id"
    > = {},
  ): Promise<boolean> {
    const callbackQueryId = this.update?.callback_query?.id;
    if (!callbackQueryId) {
      throw new Error(
        "Cannot call context.answerCallbackQuery() when update has no callback_query.",
      );
    }
    return this.bot.answerCallbackQuery({
      callback_query_id: callbackQueryId,
      ...options,
    });
  }

  /**
   * Convenience shortcut to edit the text of the current message.
   *
   * @param text - New message text.
   * @param options - Additional text editing options.
   * @returns The edited {@link Message} or `true`.
   */
  public async editMessageText(
    text: string,
    options: Omit<
      import("../client/types.js").EditMessageTextOptions,
      "chat_id" | "message_id" | "text"
    > = {},
  ): Promise<import("../client/types.js").Message | boolean> {
    const chatId = this.update?.effective_chat?.id;
    const messageId = this.update?.effective_message?.message_id;
    if (!chatId || !messageId) {
      throw new Error(
        "Cannot call context.editMessageText() without effective_chat and effective_message.",
      );
    }
    return this.bot.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      ...options,
    });
  }

  /**
   * Convenience shortcut to delete a message in the current chat.
   *
   * @param messageId - Identifier of the message to delete (defaults to current `effective_message`).
   * @returns `true` on success.
   */
  public async deleteMessage(messageId?: number): Promise<boolean> {
    const chatId = this.update?.effective_chat?.id;
    const targetMessageId = messageId ?? this.update?.effective_message?.message_id;
    if (!chatId || !targetMessageId) {
      throw new Error(
        "Cannot call context.deleteMessage() without effective_chat and effective_message.",
      );
    }
    return this.bot.deleteMessage(chatId, targetMessageId);
  }
}
