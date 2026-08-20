/**
 * Games, Passport, Stories, Business, and Gift methods for Bot API.
 *
 * @packageDocumentation
 */

import { TopicAndProfileMethods } from "./topics.js";
import type {
  Message,
  GameHighScore,
  PassportElementError,
  Story,
  BusinessConnection,
  Gifts,
  UserChatBoosts,
  AnswerCallbackQueryOptions,
  AnswerInlineQueryOptions,
} from "../types.js";

/**
 * Full domain mixin containing games, passport, stories, and business operations.
 */
export abstract class BusinessAndEcosystemMethods extends TopicAndProfileMethods {
  /**
   * Sends answers to callback queries sent from inline keyboards.
   *
   * @param options - Options including `callback_query_id`, `text`, `show_alert`, `url`, and `cache_time`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When answering callback query fails.
   *
   * @example
   * ```ts
   * await bot.answerCallbackQuery({
   *   callback_query_id: query.id,
   *   text: "Button clicked!",
   *   show_alert: false,
   * });
   * ```
   */
  public async answerCallbackQuery(options: AnswerCallbackQueryOptions): Promise<boolean> {
    return this.request<boolean>("answerCallbackQuery", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends answers to an inline query from users.
   *
   * @param options - Options including `inline_query_id`, `results` array, `cache_time`, `is_personal`, `next_offset`, `button`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When answering inline query fails.
   *
   * @remarks
   * Inline mode must be enabled for your bot in Telegram via BotFather (`/setinline`).
   *
   * @example
   * ```ts
   * await bot.answerInlineQuery({
   *   inline_query_id: update.inline_query!.id,
   *   results: [
   *     {
   *       type: "article",
   *       id: "1",
   *       title: "Result Title",
   *       input_message_content: { message_text: "Result content" },
   *     },
   *   ],
   * });
   * ```
   */
  public async answerInlineQuery(options: AnswerInlineQueryOptions): Promise<boolean> {
    return this.request<boolean>("answerInlineQuery", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends a game to a chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param gameShortName - Short name of the game, serves as the unique identifier for the game. Set up via BotFather.
   * @param options - Additional parameters for sending game.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending game fails.
   */
  public async sendGame(
    chatId: number | string,
    gameShortName: string,
    options: {
      business_connection_id?: string;
      message_thread_id?: number;
      disable_notification?: boolean;
      protect_content?: boolean;
      reply_markup?: unknown;
    } = {}
  ): Promise<Message> {
    return this.request<Message>("sendGame", {
      chat_id: chatId,
      game_short_name: gameShortName,
      ...options,
    });
  }

  /**
   * Sets the score of the specified user in a game.
   *
   * @param userId - User identifier.
   * @param score - New score, must be non-negative.
   * @param options - Additional parameters including target message coordinates.
   * @returns The edited {@link Message} or `true`.
   * @throws {@link TelegramApiError} When setting score fails.
   */
  public async setGameScore(
    userId: number,
    score: number,
    options: {
      force?: boolean;
      disable_edit_message?: boolean;
      chat_id?: number | string;
      message_id?: number;
      inline_message_id?: string;
    } = {}
  ): Promise<Message | boolean> {
    return this.request<Message | boolean>("setGameScore", {
      user_id: userId,
      score,
      ...options,
    });
  }

  /**
   * Retrieves high score tables for a game.
   *
   * @param userId - Target user identifier.
   * @param options - Target message coordinates.
   * @returns Array of {@link GameHighScore} objects.
   * @throws {@link TelegramApiError} When retrieving scores fails.
   */
  public async getGameHighScores(
    userId: number,
    options: {
      chat_id?: number | string;
      message_id?: number;
      inline_message_id?: string;
    } = {}
  ): Promise<GameHighScore[]> {
    return this.request<GameHighScore[]>("getGameHighScores", {
      user_id: userId,
      ...options,
    });
  }

  /**
   * Informs a user that some of the Telegram Passport elements they provided contains errors.
   *
   * @param userId - User identifier.
   * @param errors - Array describing the errors in the elements.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When reporting errors fails.
   */
  public async setPassportDataErrors(userId: number, errors: PassportElementError[]): Promise<boolean> {
    return this.request<boolean>("setPassportDataErrors", {
      user_id: userId,
      errors,
    });
  }

  /**
   * Posts a story on behalf of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param content - Content of the story.
   * @param options - Additional story options.
   * @returns The posted {@link Story} object.
   * @throws {@link TelegramApiError} When posting story fails.
   */
  public async postStory(
    businessConnectionId: string,
    content: unknown,
    options: Record<string, unknown> = {}
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
   */
  public async editStory(
    businessConnectionId: string,
    storyId: number,
    content: unknown,
    options: Record<string, unknown> = {}
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
   * @param messageId - Identifier of the message to mark as read.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When marking message fails.
   */
  public async readBusinessMessage(businessConnectionId: string, messageId: number): Promise<boolean> {
    return this.request<boolean>("readBusinessMessage", {
      business_connection_id: businessConnectionId,
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
   */
  public async deleteBusinessMessages(businessConnectionId: string, messageIds: number[]): Promise<boolean> {
    return this.request<boolean>("deleteBusinessMessages", {
      business_connection_id: businessConnectionId,
      message_ids: messageIds,
    });
  }

  /**
   * Returns the list of gifts that can be sent by the bot to users.
   *
   * @returns A {@link Gifts} object containing the available gifts.
   * @throws {@link TelegramApiError} When retrieving gifts fails.
   */
  public async getAvailableGifts(): Promise<Gifts> {
    return this.request<Gifts>("getAvailableGifts");
  }

  /**
   * Sends a gift to the given user.
   *
   * @param options - Options including `user_id`, `gift_id`, and optional message `text`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When sending gift fails.
   */
  public async sendGift(options: {
    user_id: number;
    gift_id: string;
    pay_for_upgrade?: boolean;
    text?: string;
    text_parse_mode?: string;
  }): Promise<boolean> {
    return this.request<boolean>("sendGift", options as unknown as Record<string, unknown>);
  }

  /**
   * Verifies a chat on behalf of the organization which owns the bot.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param customDescription - Custom description for the verification status.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When verification fails.
   */
  public async verifyChat(chatId: number | string, customDescription?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (customDescription !== undefined) payload["custom_description"] = customDescription;
    return this.request<boolean>("verifyChat", payload);
  }

  /**
   * Verifies a user on behalf of the organization which owns the bot.
   *
   * @param userId - Unique identifier of the target user.
   * @param customDescription - Custom description for the verification status.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When verification fails.
   */
  public async verifyUser(userId: number, customDescription?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { user_id: userId };
    if (customDescription !== undefined) payload["custom_description"] = customDescription;
    return this.request<boolean>("verifyUser", payload);
  }

  /**
   * Removes verification from a chat that was previously verified by the bot.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When removing verification fails.
   */
  public async removeChatVerification(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("removeChatVerification", { chat_id: chatId });
  }

  /**
   * Removes verification from a user that was previously verified by the bot.
   *
   * @param userId - Unique identifier of the target user.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When removing verification fails.
   */
  public async removeUserVerification(userId: number): Promise<boolean> {
    return this.request<boolean>("removeUserVerification", { user_id: userId });
  }

  /**
   * Retrieves the list of boosts added to a chat by a user.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param userId - Unique identifier of the target user.
   * @returns A {@link UserChatBoosts} object.
   * @throws {@link TelegramApiError} When retrieving boosts fails.
   */
  public async getUserChatBoosts(chatId: number | string, userId: number): Promise<UserChatBoosts> {
    return this.request<UserChatBoosts>("getUserChatBoosts", { chat_id: chatId, user_id: userId });
  }

  /**
   * Changes the emoji status for a given user that granted permission to the bot.
   *
   * @param userId - Unique identifier of the target user.
   * @param customEmojiId - Custom emoji identifier to set as status.
   * @param options - Expiration options.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting emoji status fails.
   */
  public async setUserEmojiStatus(
    userId: number,
    customEmojiId?: string,
    options: { emoji_status_expiration_date?: number } = {}
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { user_id: userId, ...options };
    if (customEmojiId !== undefined) payload["custom_emoji_id"] = customEmojiId;
    return this.request<boolean>("setUserEmojiStatus", payload);
  }

  /**
   * Saves a prepared inline message for sending by a user via a Mini App.
   *
   * @param options - Prepared inline message options.
   * @returns Prepared message info.
   */
  public async savePreparedInlineMessage(options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("savePreparedInlineMessage", options);
  }

  /**
   * Sets the result of an interaction with a Web App and sends a corresponding message on behalf of the user to the chat.
   *
   * @param webAppQueryId - Unique identifier for the query.
   * @param result - An object describing the message to be sent.
   * @returns Object with optional `inline_message_id`.
   * @throws {@link TelegramApiError} When answering web app query fails.
   */
  public async answerWebAppQuery(webAppQueryId: string, result: unknown): Promise<{ inline_message_id?: string }> {
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
   */
  public async answerGuestQuery(guestQueryId: string, result: unknown): Promise<{ inline_message_id?: string }> {
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
   */
  public async logOut(): Promise<boolean> {
    return this.request<boolean>("logOut");
  }

  /**
   * Closes the bot instance before moving it from one local server to another.
   *
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When close fails.
   */
  public async close(): Promise<boolean> {
    return this.request<boolean>("close");
  }

  /**
   * Retrieves custom emoji stickers that can be used as forum topic icons.
   *
   * @returns Array of sticker objects.
   * @throws {@link TelegramApiError} When retrieval fails.
   */
  public async getForumTopicIconStickers(): Promise<unknown[]> {
    return this.request<unknown[]>("getForumTopicIconStickers");
  }

  /**
   * Gifts a Telegram Premium subscription to a user.
   *
   * @param options - Premium gift parameters.
   * @returns `true` on success.
   */
  public async giftPremiumSubscription(options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("giftPremiumSubscription", options);
  }

  /**
   * Retrieves gifts received by a business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @returns Business account gifts.
   */
  public async getBusinessAccountGifts(businessConnectionId: string): Promise<unknown> {
    return this.request<unknown>("getBusinessAccountGifts", { business_connection_id: businessConnectionId });
  }

  /**
   * Retrieves the Telegram Star balance of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @returns Object containing the star `amount`.
   */
  public async getBusinessAccountStarBalance(businessConnectionId: string): Promise<{ amount: number }> {
    return this.request<{ amount: number }>("getBusinessAccountStarBalance", {
      business_connection_id: businessConnectionId,
    });
  }

  /**
   * Changes the business name of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param name - New business name.
   * @returns `true` on success.
   */
  public async setBusinessAccountName(businessConnectionId: string, name: string): Promise<boolean> {
    return this.request<boolean>("setBusinessAccountName", {
      business_connection_id: businessConnectionId,
      name,
    });
  }

  /**
   * Changes the username of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param username - New username.
   * @returns `true` on success.
   */
  public async setBusinessAccountUsername(businessConnectionId: string, username?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { business_connection_id: businessConnectionId };
    if (username !== undefined) payload["username"] = username;
    return this.request<boolean>("setBusinessAccountUsername", payload);
  }

  /**
   * Changes the bio description of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param bio - New bio text.
   * @returns `true` on success.
   */
  public async setBusinessAccountBio(businessConnectionId: string, bio?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { business_connection_id: businessConnectionId };
    if (bio !== undefined) payload["bio"] = bio;
    return this.request<boolean>("setBusinessAccountBio", payload);
  }

  /**
   * Configures gift settings for a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param options - Gift settings parameters.
   * @returns `true` on success.
   */
  public async setBusinessAccountGiftSettings(businessConnectionId: string, options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("setBusinessAccountGiftSettings", {
      business_connection_id: businessConnectionId,
      ...options,
    });
  }

  /**
   * Sets the profile photo for a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param photo - Profile photo to set.
   * @returns `true` on success.
   */
  public async setBusinessAccountProfilePhoto(businessConnectionId: string, photo: unknown): Promise<boolean> {
    return this.request<boolean>("setBusinessAccountProfilePhoto", {
      business_connection_id: businessConnectionId,
      photo,
    });
  }

  /**
   * Removes the profile photo of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @returns `true` on success.
   */
  public async removeBusinessAccountProfilePhoto(businessConnectionId: string): Promise<boolean> {
    return this.request<boolean>("removeBusinessAccountProfilePhoto", {
      business_connection_id: businessConnectionId,
    });
  }

  /**
   * Converts an owned gift to Telegram Stars for a user.
   *
   * @param userId - User identifier.
   * @param ownedGiftId - Owned gift identifier.
   * @returns `true` on success.
   */
  public async convertGiftToStars(userId: number, ownedGiftId: string): Promise<boolean> {
    return this.request<boolean>("convertGiftToStars", { user_id: userId, owned_gift_id: ownedGiftId });
  }

  /**
   * Upgrades a received gift to a unique collectible gift.
   *
   * @param userId - User identifier.
   * @param ownedGiftId - Identifier of the owned gift.
   * @returns `true` on success.
   */
  public async upgradeGift(userId: number, ownedGiftId: string): Promise<boolean> {
    return this.request<boolean>("upgradeGift", { user_id: userId, owned_gift_id: ownedGiftId });
  }

  /**
   * Transfers an upgraded gift to another user or chat.
   *
   * @param userId - User identifier.
   * @param ownedGiftId - Upgraded gift identifier.
   * @param newOwnerChatId - Target user or channel chat identifier.
   * @returns `true` on success.
   */
  public async transferGift(userId: number, ownedGiftId: string, newOwnerChatId: number | string): Promise<boolean> {
    return this.request<boolean>("transferGift", {
      user_id: userId,
      owned_gift_id: ownedGiftId,
      new_owner_chat_id: newOwnerChatId,
    });
  }

  /**
   * Transfers Telegram Stars from a business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param starCount - Number of stars to transfer.
   * @returns `true` on success.
   */
  public async transferBusinessAccountStars(businessConnectionId: string, starCount: number): Promise<boolean> {
    return this.request<boolean>("transferBusinessAccountStars", {
      business_connection_id: businessConnectionId,
      star_count: starCount,
    });
  }

  /**
   * Retrieves access settings for a managed bot.
   *
   * @param botId - Target bot identifier.
   * @returns Access settings.
   */
  public async getManagedBotAccessSettings(botId: number): Promise<unknown> {
    return this.request<unknown>("getManagedBotAccessSettings", { bot_id: botId });
  }

  /**
   * Updates access settings for a managed bot.
   *
   * @param botId - Target bot identifier.
   * @param options - Updated access options.
   * @returns `true` on success.
   */
  public async setManagedBotAccessSettings(botId: number, options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("setManagedBotAccessSettings", { bot_id: botId, ...options });
  }

  /**
   * Creates a subscription invite link for a channel or group.
   *
   * @param chatId - Target chat identifier.
   * @param options - Subscription parameters.
   * @returns Created link object.
   */
  public async createChatSubscriptionInviteLink(chatId: number | string, options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("createChatSubscriptionInviteLink", { chat_id: chatId, ...options });
  }

  /**
   * Edits a chat subscription invite link.
   *
   * @param chatId - Target chat identifier.
   * @param inviteLink - Invite link to edit.
   * @param options - Updated link parameters.
   * @returns Edited link object.
   */
  public async editChatSubscriptionInviteLink(chatId: number | string, inviteLink: string, options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("editChatSubscriptionInviteLink", {
      chat_id: chatId,
      invite_link: inviteLink,
      ...options,
    });
  }

  /**
   * Approves a suggested post in a channel.
   *
   * @param chatId - Channel chat identifier.
   * @param messageId - Identifier of the suggested post message.
   * @returns `true` on success.
   */
  public async approveSuggestedPost(chatId: number | string, messageId: number): Promise<boolean> {
    return this.request<boolean>("approveSuggestedPost", { chat_id: chatId, message_id: messageId });
  }

  /**
   * Declines a suggested post in a channel.
   *
   * @param chatId - Channel chat identifier.
   * @param messageId - Identifier of the suggested post message.
   * @returns `true` on success.
   */
  public async declineSuggestedPost(chatId: number | string, messageId: number): Promise<boolean> {
    return this.request<boolean>("declineSuggestedPost", { chat_id: chatId, message_id: messageId });
  }

  /**
   * Reposts a story to a channel or story feed.
   *
   * @param options - Repost parameters.
   * @returns Repost result.
   */
  public async repostStory(options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("repostStory", options);
  }

  /**
   * Retrieves the list of gifts received by a user.
   *
   * @param userId - Target user identifier.
   * @param options - Query options.
   * @returns List of user gifts.
   */
  public async getUserGifts(userId: number, options: Record<string, unknown> = {}): Promise<unknown> {
    return this.request<unknown>("getUserGifts", { user_id: userId, ...options });
  }

  /**
   * Retrieves the list of gifts received by a chat.
   *
   * @param chatId - Target chat identifier.
   * @param options - Query options.
   * @returns List of chat gifts.
   */
  public async getChatGifts(chatId: number | string, options: Record<string, unknown> = {}): Promise<unknown> {
    return this.request<unknown>("getChatGifts", { chat_id: chatId, ...options });
  }

  /**
   * Sets the profile photo for the bot.
   *
   * @param photo - Photo file to set.
   * @returns `true` on success.
   */
  public async setMyProfilePhoto(photo: unknown): Promise<boolean> {
    return this.request<boolean>("setMyProfilePhoto", { photo });
  }

  /**
   * Removes the profile photo of the bot.
   *
   * @returns `true` on success.
   */
  public async removeMyProfilePhoto(): Promise<boolean> {
    return this.request<boolean>("removeMyProfilePhoto");
  }

  /**
   * Retrieves profile audio files for a user.
   *
   * @param userId - Target user identifier.
   * @param offset - Query offset.
   * @param limit - Maximum items to retrieve.
   * @returns Profile audio objects.
   */
  public async getUserProfileAudios(userId: number, offset?: number, limit?: number): Promise<unknown> {
    const payload: Record<string, unknown> = { user_id: userId };
    if (offset !== undefined) payload["offset"] = offset;
    if (limit !== undefined) payload["limit"] = limit;
    return this.request<unknown>("getUserProfileAudios", payload);
  }

  /**
   * Sets a custom tag for a chat member.
   *
   * @param chatId - Target chat identifier.
   * @param userId - Target user identifier.
   * @param tag - Tag name to set.
   * @returns `true` on success.
   */
  public async setChatMemberTag(chatId: number | string, userId: number, tag?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, user_id: userId };
    if (tag !== undefined) payload["tag"] = tag;
    return this.request<boolean>("setChatMemberTag", payload);
  }

  /**
   * Retrieves the token of a managed bot.
   *
   * @param botId - Target bot identifier.
   * @returns Object containing the bot `token`.
   */
  public async getManagedBotToken(botId: number): Promise<{ token: string }> {
    return this.request<{ token: string }>("getManagedBotToken", { bot_id: botId });
  }

  /**
   * Generates a replacement token for a managed bot.
   *
   * @param botId - Target bot identifier.
   * @returns Object containing the new bot `token`.
   */
  public async replaceManagedBotToken(botId: number): Promise<{ token: string }> {
    return this.request<{ token: string }>("replaceManagedBotToken", { bot_id: botId });
  }

  /**
   * Saves a prepared keyboard button for a Mini App.
   *
   * @param options - Button options.
   * @returns Prepared button result.
   */
  public async savePreparedKeyboardButton(options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("savePreparedKeyboardButton", options);
  }

  /**
   * Initializes client state and verifies credentials via `getMe`.
   */
  public async initialize(): Promise<void> {
    await this.getMe();
  }

  /**
   * Gracefully shuts down active client sessions and connections.
   */
  public async shutdown(): Promise<void> {
    // Graceful client shutdown
  }

  /**
   * Sends a structured rich formatted message (Bot API 10.1+).
   *
   * @param options - Rich message options including `chat_id` and `rich_message`.
   * @returns The sent {@link Message}.
   */
  public async sendRichMessage(options: Record<string, unknown>): Promise<Message> {
    return this.request<Message>("sendRichMessage", options);
  }

  /**
   * Streams a draft of a rich formatted message (Bot API 10.1+).
   *
   * @param options - Rich message draft options.
   * @returns `true` on success.
   */
  public async sendRichMessageDraft(options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("sendRichMessageDraft", options);
  }

  /**
   * Edits an ephemeral message text (Bot API 10.2+).
   *
   * @param options - Ephemeral message edit options.
   * @returns Edited {@link Message} or boolean.
   */
  public async editEphemeralMessageText(options: Record<string, unknown>): Promise<Message | boolean> {
    return this.request<Message | boolean>("editEphemeralMessageText", options);
  }

  /**
   * Deletes an ephemeral message (Bot API 10.2+).
   *
   * @param chatId - Chat identifier.
   * @param messageId - Message identifier.
   * @returns `true` on success.
   */
  public async deleteEphemeralMessage(chatId: number | string, messageId: number): Promise<boolean> {
    return this.request<boolean>("deleteEphemeralMessage", { chat_id: chatId, message_id: messageId });
  }

  /**
   * Answers a chat join request query from a user (Bot API 10.1+).
   *
   * @param options - Query response options.
   * @returns `true` on success.
   */
  public async answerChatJoinRequestQuery(options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("answerChatJoinRequestQuery", options);
  }

  /**
   * Sends a Web App for a chat join request (Bot API 10.1+).
   *
   * @param options - Join request Web App options.
   * @returns `true` on success.
   */
  public async sendChatJoinRequestWebApp(options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("sendChatJoinRequestWebApp", options);
  }

  /**
   * General-purpose raw API method executor.
   *
   * @typeParam T - Expected result payload type.
   * @param method - API method name.
   * @param payload - Request parameters.
   * @returns Unwrapped API result.
   */
  public async doApiRequest<T>(method: string, payload: Record<string, unknown> = {}): Promise<T> {
    return this.request<T>(method, payload);
  }
}
