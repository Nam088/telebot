/**
 * Gifts, stars, and managed bot settings methods for Bot API.
 *
 * @packageDocumentation
 */

import { BusinessStoriesBoostsMethods } from "./stories-boosts.js";
import type {
  GetBusinessAccountGiftsOptions,
  GetChatGiftsOptions,
  GetUserGiftsOptions,
  RemoveBusinessAccountProfilePhotoOptions,
  SetBusinessAccountProfilePhotoOptions,
  TransferGiftOptions,
  UpgradeGiftOptions,
} from "../../types/index.js";

/**
 * Mixin providing gifts, star transfers, and managed bot operations.
 */
export abstract class BusinessGiftsMethods extends BusinessStoriesBoostsMethods {
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
   * Retrieves the gifts received and owned by a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param options - Optional exclusion, sorting and pagination filters.
   * @returns Owned gifts of the business account.
   * @throws {@link TelegramApiError} When the request fails.
   */
  public async getBusinessAccountGifts(
    businessConnectionId: string,
    options: GetBusinessAccountGiftsOptions = {},
  ): Promise<unknown> {
    return this.request<unknown>("getBusinessAccountGifts", {
      business_connection_id: businessConnectionId,
      ...options,
    });
  }

  /**
   * Retrieves the Telegram Star balance of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @returns Object containing the star `amount`.
   */
  public async getBusinessAccountStarBalance(
    businessConnectionId: string,
  ): Promise<{ amount: number }> {
    return this.request<{ amount: number }>("getBusinessAccountStarBalance", {
      business_connection_id: businessConnectionId,
    });
  }

  /**
   * Changes the first and last name of a managed business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param firstName - New first name of the business account; 1-64 characters.
   * @param lastName - New last name of the business account; 0-64 characters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   */
  public async setBusinessAccountName(
    businessConnectionId: string,
    firstName: string,
    lastName?: string,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      business_connection_id: businessConnectionId,
      first_name: firstName,
    };
    if (lastName !== undefined) payload["last_name"] = lastName;
    return this.request<boolean>("setBusinessAccountName", payload);
  }

  /**
   * Changes the username of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param username - New username.
   * @returns `true` on success.
   */
  public async setBusinessAccountUsername(
    businessConnectionId: string,
    username?: string,
  ): Promise<boolean> {
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
  public async setBusinessAccountGiftSettings(
    businessConnectionId: string,
    options: Record<string, unknown>,
  ): Promise<boolean> {
    return this.request<boolean>("setBusinessAccountGiftSettings", {
      business_connection_id: businessConnectionId,
      ...options,
    });
  }

  /**
   * Sets the profile photo for a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param photo - The new profile photo to set.
   * @param options - Optional `is_public` flag.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   */
  public async setBusinessAccountProfilePhoto(
    businessConnectionId: string,
    photo: unknown,
    options: SetBusinessAccountProfilePhotoOptions = {},
  ): Promise<boolean> {
    return this.request<boolean>("setBusinessAccountProfilePhoto", {
      business_connection_id: businessConnectionId,
      photo,
      ...options,
    });
  }

  /**
   * Removes the profile photo of a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param options - Optional `is_public` flag; pass True to remove the public photo.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   */
  public async removeBusinessAccountProfilePhoto(
    businessConnectionId: string,
    options: RemoveBusinessAccountProfilePhotoOptions = {},
  ): Promise<boolean> {
    return this.request<boolean>("removeBusinessAccountProfilePhoto", {
      business_connection_id: businessConnectionId,
      ...options,
    });
  }

  /**
   * Converts a regular gift owned by a managed business account to Telegram Stars.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param ownedGiftId - Unique identifier of the regular gift to convert.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   */
  public async convertGiftToStars(
    businessConnectionId: string,
    ownedGiftId: string,
  ): Promise<boolean> {
    return this.request<boolean>("convertGiftToStars", {
      business_connection_id: businessConnectionId,
      owned_gift_id: ownedGiftId,
    });
  }

  /**
   * Upgrades a regular gift owned by a managed business account to a unique gift.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param ownedGiftId - Unique identifier of the regular gift to upgrade.
   * @param options - Optional `keep_original_details` and `star_count` parameters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   */
  public async upgradeGift(
    businessConnectionId: string,
    ownedGiftId: string,
    options: UpgradeGiftOptions = {},
  ): Promise<boolean> {
    return this.request<boolean>("upgradeGift", {
      business_connection_id: businessConnectionId,
      owned_gift_id: ownedGiftId,
      ...options,
    });
  }

  /**
   * Transfers an owned unique gift to another user or chat.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param ownedGiftId - Unique identifier of the gift to transfer.
   * @param newOwnerChatId - Unique identifier of the chat which will own the gift.
   * @param options - Optional `star_count` paid for the transfer from the business account balance.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   */
  public async transferGift(
    businessConnectionId: string,
    ownedGiftId: string,
    newOwnerChatId: number,
    options: TransferGiftOptions = {},
  ): Promise<boolean> {
    return this.request<boolean>("transferGift", {
      business_connection_id: businessConnectionId,
      owned_gift_id: ownedGiftId,
      new_owner_chat_id: newOwnerChatId,
      ...options,
    });
  }

  /**
   * Transfers Telegram Stars from a business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param starCount - Number of stars to transfer.
   * @returns `true` on success.
   */
  public async transferBusinessAccountStars(
    businessConnectionId: string,
    starCount: number,
  ): Promise<boolean> {
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
  public async setManagedBotAccessSettings(
    botId: number,
    options: Record<string, unknown>,
  ): Promise<boolean> {
    return this.request<boolean>("setManagedBotAccessSettings", { bot_id: botId, ...options });
  }

  /**
   * Creates a subscription invite link for a channel or group.
   *
   * @param chatId - Target chat identifier.
   * @param options - Subscription parameters.
   * @returns Created link object.
   */
  public async createChatSubscriptionInviteLink(
    chatId: number | string,
    options: Record<string, unknown>,
  ): Promise<unknown> {
    return this.request<unknown>("createChatSubscriptionInviteLink", {
      chat_id: chatId,
      ...options,
    });
  }

  /**
   * Edits a chat subscription invite link.
   *
   * @param chatId - Target chat identifier.
   * @param inviteLink - Invite link to edit.
   * @param options - Updated link parameters.
   * @returns Edited link object.
   */
  public async editChatSubscriptionInviteLink(
    chatId: number | string,
    inviteLink: string,
    options: Record<string, unknown>,
  ): Promise<unknown> {
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
    return this.request<boolean>("approveSuggestedPost", {
      chat_id: chatId,
      message_id: messageId,
    });
  }

  /**
   * Declines a suggested post in a channel.
   *
   * @param chatId - Channel chat identifier.
   * @param messageId - Identifier of the suggested post message.
   * @returns `true` on success.
   */
  public async declineSuggestedPost(chatId: number | string, messageId: number): Promise<boolean> {
    return this.request<boolean>("declineSuggestedPost", {
      chat_id: chatId,
      message_id: messageId,
    });
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
   * Retrieves the gifts owned and hosted by a user.
   *
   * @param userId - Target user identifier.
   * @param options - Optional exclusion, sorting and pagination filters.
   * @returns List of user gifts.
   * @throws {@link TelegramApiError} When the request fails.
   */
  public async getUserGifts(userId: number, options: GetUserGiftsOptions = {}): Promise<unknown> {
    return this.request<unknown>("getUserGifts", { user_id: userId, ...options });
  }

  /**
   * Retrieves the gifts owned by a chat.
   *
   * @param chatId - Target chat identifier or channel `@username`.
   * @param options - Optional exclusion (including saved/unsaved), sorting and pagination filters.
   * @returns List of chat gifts.
   * @throws {@link TelegramApiError} When the request fails.
   */
  public async getChatGifts(
    chatId: number | string,
    options: GetChatGiftsOptions = {},
  ): Promise<unknown> {
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
  public async getUserProfileAudios(
    userId: number,
    offset?: number,
    limit?: number,
  ): Promise<unknown> {
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
  public async setChatMemberTag(
    chatId: number | string,
    userId: number,
    tag?: string,
  ): Promise<boolean> {
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
}
