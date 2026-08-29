/**
 * Forum topic management methods for Bot API.
 *
 * @packageDocumentation
 */

import { BotProfileMethods } from "./profile.js";
import type { ForumTopic } from "../../types/index.js";

/**
 * Mixin providing forum topic creation, editing, closing, and pin operations.
 */
export abstract class ForumTopicMethods extends BotProfileMethods {
  /**
   * Creates a topic in a forum supergroup chat.
   *
   * @param options - Options including target `chat_id`, `name`, and optional `icon_color` or `icon_custom_emoji_id`.
   * @returns The created {@link ForumTopic} object on success.
   * @throws {@link TelegramApiError} When creating topic fails.
   *
   * @example
   * ```ts
   * const topic = await bot.createForumTopic({
   *   chat_id: -1001234567890,
   *   name: "Announcements",
   *   icon_color: 0x6FB9F0,
   * });
   * console.log(`Created thread ID: ${topic.message_thread_id}`);
   * ```
   */
  public async createForumTopic(options: {
    chat_id: number | string;
    name: string;
    icon_color?: number;
    icon_custom_emoji_id?: string;
  }): Promise<ForumTopic> {
    return this.request<ForumTopic>(
      "createForumTopic",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits the name and icon of a topic in a forum supergroup chat.
   *
   * @param options - Options including `chat_id`, `message_thread_id`, and updated `name` or `icon_custom_emoji_id`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When editing topic fails.
   *
   * @example
   * ```ts
   * await bot.editForumTopic({
   *   chat_id: -1001234567890,
   *   message_thread_id: 42,
   *   name: "Updated Announcements",
   * });
   * ```
   */
  public async editForumTopic(options: {
    chat_id: number | string;
    message_thread_id: number;
    name?: string;
    icon_custom_emoji_id?: string;
  }): Promise<boolean> {
    return this.request<boolean>("editForumTopic", options as unknown as Record<string, unknown>);
  }

  /**
   * Closes an open topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageThreadId - Unique identifier for the target message thread of the forum topic.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When closing topic fails.
   *
   * @example
   * ```ts
   * await bot.closeForumTopic(-1001234567890, 42);
   * ```
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
   * @throws {@link TelegramApiError} When reopening topic fails.
   *
   * @example
   * ```ts
   * await bot.reopenForumTopic(-1001234567890, 42);
   * ```
   */
  public async reopenForumTopic(
    chatId: number | string,
    messageThreadId: number,
  ): Promise<boolean> {
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
   * @throws {@link TelegramApiError} When deleting topic fails.
   *
   * @example
   * ```ts
   * await bot.deleteForumTopic(-1001234567890, 42);
   * ```
   */
  public async deleteForumTopic(
    chatId: number | string,
    messageThreadId: number,
  ): Promise<boolean> {
    return this.request<boolean>("deleteForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Clears the list of pinned messages in a forum topic.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageThreadId - Unique identifier for the target message thread of the forum topic.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unpinning messages fails.
   *
   * @example
   * ```ts
   * await bot.unpinAllForumTopicMessages(-1001234567890, 42);
   * ```
   */
  public async unpinAllForumTopicMessages(
    chatId: number | string,
    messageThreadId: number,
  ): Promise<boolean> {
    return this.request<boolean>("unpinAllForumTopicMessages", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Edits the name of the 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param name - New name of the topic (1-128 characters).
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When editing General topic fails.
   *
   * @example
   * ```ts
   * await bot.editGeneralForumTopic(-1001234567890, "General Chat");
   * ```
   */
  public async editGeneralForumTopic(chatId: number | string, name: string): Promise<boolean> {
    return this.request<boolean>("editGeneralForumTopic", { chat_id: chatId, name });
  }

  /**
   * Closes an open 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When closing General topic fails.
   *
   * @example
   * ```ts
   * await bot.closeGeneralForumTopic(-1001234567890);
   * ```
   */
  public async closeGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("closeGeneralForumTopic", { chat_id: chatId });
  }

  /**
   * Reopens a closed 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When reopening General topic fails.
   *
   * @example
   * ```ts
   * await bot.reopenGeneralForumTopic(-1001234567890);
   * ```
   */
  public async reopenGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("reopenGeneralForumTopic", { chat_id: chatId });
  }

  /**
   * Hides the 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When hiding General topic fails.
   *
   * @example
   * ```ts
   * await bot.hideGeneralForumTopic(-1001234567890);
   * ```
   */
  public async hideGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("hideGeneralForumTopic", { chat_id: chatId });
  }

  /**
   * Unhides the 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unhiding General topic fails.
   *
   * @example
   * ```ts
   * await bot.unhideGeneralForumTopic(-1001234567890);
   * ```
   */
  public async unhideGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("unhideGeneralForumTopic", { chat_id: chatId });
  }

  /**
   * Clears the list of pinned messages in the 'General' topic of a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unpinning General topic messages fails.
   *
   * @example
   * ```ts
   * await bot.unpinAllGeneralForumTopicMessages(-1001234567890);
   * ```
   */
  public async unpinAllGeneralForumTopicMessages(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("unpinAllGeneralForumTopicMessages", { chat_id: chatId });
  }
}
