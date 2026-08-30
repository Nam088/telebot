/**
 * Stories, chat boosts, and business account management methods for Bot API.
 *
 * @packageDocumentation
 */

import { BusinessGamesPassportMethods } from "./games-passport.js";
import type {
  Story,
  BusinessConnection,
  PostStoryOptions,
  EditStoryOptions,
} from "../../types/index.js";

/**
 * Mixin providing story management and business account operations.
 */
export abstract class BusinessStoriesBoostsMethods extends BusinessGamesPassportMethods {
  /**
   * Posts a story on behalf of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param content - Content of the story.
   * @param options - Additional story options.
   * @returns The posted {@link Story} object.
   * @throws {@link TelegramApiError} When posting story fails.
   *
   * @see {@link https://core.telegram.org/bots/api#poststory Telegram Bot API: postStory}
   */
  public async postStory(
    businessConnectionId: string,
    content: unknown,
    options: PostStoryOptions,
  ): Promise<Story> {
    return this.request<Story>("postStory", {
      business_connection_id: businessConnectionId,
      content,
      ...options,
    });
  }

  /**
   * Edits a story previously posted by the bot on behalf of a business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param storyId - Unique identifier of the story to edit.
   * @param content - New content for the story.
   * @param options - Additional edit parameters.
   * @returns The edited {@link Story} object.
   * @throws {@link TelegramApiError} When editing story fails.
   *
   * @see {@link https://core.telegram.org/bots/api#editstory Telegram Bot API: editStory}
   */
  public async editStory(
    businessConnectionId: string,
    storyId: number,
    content: unknown,
    options: EditStoryOptions = {},
  ): Promise<Story> {
    return this.request<Story>("editStory", {
      business_connection_id: businessConnectionId,
      story_id: storyId,
      content,
      ...options,
    });
  }

  /**
   * Deletes a story previously posted on behalf of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param storyId - Identifier of the story to delete.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting story fails.
   *
   * @see {@link https://core.telegram.org/bots/api#deletestory Telegram Bot API: deleteStory}
   */
  public async deleteStory(businessConnectionId: string, storyId: number): Promise<boolean> {
    return this.request<boolean>("deleteStory", {
      business_connection_id: businessConnectionId,
      story_id: storyId,
    });
  }

  /**
   * Retrieves information about the connection of the bot with a business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @returns A {@link BusinessConnection} object.
   * @throws {@link TelegramApiError} When connection is not found.
   *
   * @see {@link https://core.telegram.org/bots/api#getbusinessconnection Telegram Bot API: getBusinessConnection}
   */
  public async getBusinessConnection(businessConnectionId: string): Promise<BusinessConnection> {
    return this.request<BusinessConnection>("getBusinessConnection", {
      business_connection_id: businessConnectionId,
    });
  }

  /**
   * Marks incoming messages in a business account as read.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param chatId - Unique identifier of the chat in which the message was received.
   * @param messageId - Identifier of the message to mark as read.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When marking message fails.
   *
   * @see {@link https://core.telegram.org/bots/api#readbusinessmessage Telegram Bot API: readBusinessMessage}
   */
  public async readBusinessMessage(
    businessConnectionId: string,
    chatId: number,
    messageId: number,
  ): Promise<boolean> {
    return this.request<boolean>("readBusinessMessage", {
      business_connection_id: businessConnectionId,
      chat_id: chatId,
      message_id: messageId,
    });
  }

  /**
   * Deletes messages on behalf of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param messageIds - List of message identifiers to delete.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting messages fails.
   *
   * @see {@link https://core.telegram.org/bots/api#deletebusinessmessages Telegram Bot API: deleteBusinessMessages}
   */
  public async deleteBusinessMessages(
    businessConnectionId: string,
    messageIds: number[],
  ): Promise<boolean> {
    return this.request<boolean>("deleteBusinessMessages", {
      business_connection_id: businessConnectionId,
      message_ids: messageIds,
    });
  }

  /**
   * Changes the emoji status for a given user that granted permission to the bot.
   *
   * @param userId - Unique identifier of the target user.
   * @param emojiStatusCustomEmojiId - Custom emoji identifier of the emoji status to set; pass an empty string to remove the status.
   * @param options - Optional `emoji_status_expiration_date`.
   * @returns `true` on success.
   * @remarks Serialized as the documented `emoji_status_custom_emoji_id` and `emoji_status_expiration_date` fields.
   * @throws {@link TelegramApiError} When setting emoji status fails.
   *
   * @see {@link https://core.telegram.org/bots/api#setuseremojistatus Telegram Bot API: setUserEmojiStatus}
   */
  public async setUserEmojiStatus(
    userId: number,
    emojiStatusCustomEmojiId?: string,
    options: { emoji_status_expiration_date?: number } = {},
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { user_id: userId, ...options };
    if (emojiStatusCustomEmojiId !== undefined) {
      payload["emoji_status_custom_emoji_id"] = emojiStatusCustomEmojiId;
    }
    return this.request<boolean>("setUserEmojiStatus", payload);
  }

  /**
   * Sets the result of an interaction with a Web App and sends a corresponding message on behalf of the user to the chat.
   *
   * @param webAppQueryId - Unique identifier for the query.
   * @param result - An object describing the message to be sent.
   * @returns Object with optional `inline_message_id`.
   * @throws {@link TelegramApiError} When answering web app query fails.
   *
   * @see {@link https://core.telegram.org/bots/api#answerwebappquery Telegram Bot API: answerWebAppQuery}
   */
  public async answerWebAppQuery(
    webAppQueryId: string,
    result: unknown,
  ): Promise<{ inline_message_id?: string }> {
    return this.request<{ inline_message_id?: string }>("answerWebAppQuery", {
      web_app_query_id: webAppQueryId,
      result,
    });
  }

  /**
   * Answers a guest query in a mini app.
   *
   * @param guestQueryId - Unique identifier of the query.
   * @param result - Result payload to return.
   * @returns Object with optional `inline_message_id`.
   *
   * @see {@link https://core.telegram.org/bots/api#answerguestquery Telegram Bot API: answerGuestQuery}
   */
  public async answerGuestQuery(
    guestQueryId: string,
    result: unknown,
  ): Promise<{ inline_message_id?: string }> {
    return this.request<{ inline_message_id?: string }>("answerGuestQuery", {
      guest_query_id: guestQueryId,
      result,
    });
  }

  /**
   * Logs out from the cloud Bot API server before launching a local Bot API server.
   *
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When logout fails.
   *
   * @see {@link https://core.telegram.org/bots/api#logout Telegram Bot API: logOut}
   */
  public async logOut(): Promise<boolean> {
    return this.request<boolean>("logOut");
  }

  /**
   * Closes the bot instance before moving it from one local server to another.
   *
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When close fails.
   *
   * @see {@link https://core.telegram.org/bots/api#close Telegram Bot API: close}
   */
  public async close(): Promise<boolean> {
    return this.request<boolean>("close");
  }

  /**
   * Retrieves custom emoji stickers that can be used as forum topic icons.
   *
   * @returns Array of sticker objects.
   * @throws {@link TelegramApiError} When retrieval fails.
   *
   * @see {@link https://core.telegram.org/bots/api#getforumtopiciconstickers Telegram Bot API: getForumTopicIconStickers}
   */
  public async getForumTopicIconStickers(): Promise<unknown[]> {
    return this.request<unknown[]>("getForumTopicIconStickers");
  }
}
