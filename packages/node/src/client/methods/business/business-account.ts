/**
 * Connected business account and managed bot methods for Bot API.
 *
 * @packageDocumentation
 */

import { BusinessStoriesBoostsMethods } from "./stories-boosts.js";
import type {
  GetBusinessAccountGiftsOptions,
  SetBusinessAccountGiftSettingsOptions,
  SetBusinessAccountProfilePhotoOptions,
  RemoveBusinessAccountProfilePhotoOptions,
  SetManagedBotAccessSettingsOptions,
} from "../../types/index.js";

/**
 * Mixin providing business account management and managed bot operations.
 */
export abstract class BusinessAccountMethods extends BusinessStoriesBoostsMethods {
  /**
   * Retrieves the gifts received and owned by a connected business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param options - Optional exclusion, sorting and pagination filters.
   * @returns Owned gifts of the business account.
   * @throws {@link TelegramApiError} When the request fails.
   *
   * @see {@link https://core.telegram.org/bots/api#getbusinessaccountgifts Telegram Bot API: getBusinessAccountGifts}
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
   *
   * @see {@link https://core.telegram.org/bots/api#getbusinessaccountstarbalance Telegram Bot API: getBusinessAccountStarBalance}
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
   *
   * @see {@link https://core.telegram.org/bots/api#setbusinessaccountname Telegram Bot API: setBusinessAccountName}
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
   *
   * @see {@link https://core.telegram.org/bots/api#setbusinessaccountusername Telegram Bot API: setBusinessAccountUsername}
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
   *
   * @see {@link https://core.telegram.org/bots/api#setbusinessaccountbio Telegram Bot API: setBusinessAccountBio}
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
   * @param options - Gift settings parameters: the required `show_gift_button` flag and an
   *   `AcceptedGiftTypes` object in `accepted_gift_types`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   *
   * @see {@link https://core.telegram.org/bots/api#setbusinessaccountgiftsettings Telegram Bot API: setBusinessAccountGiftSettings}
   */
  public async setBusinessAccountGiftSettings(
    businessConnectionId: string,
    options: SetBusinessAccountGiftSettingsOptions,
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
   *
   * @see {@link https://core.telegram.org/bots/api#setbusinessaccountprofilephoto Telegram Bot API: setBusinessAccountProfilePhoto}
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
   *
   * @see {@link https://core.telegram.org/bots/api#removebusinessaccountprofilephoto Telegram Bot API: removeBusinessAccountProfilePhoto}
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
   * Transfers Telegram Stars from a business account.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param starCount - Number of stars to transfer.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#transferbusinessaccountstars Telegram Bot API: transferBusinessAccountStars}
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
   * @param userId - Unique identifier of the target user that owns the managed bot.
   * @returns Access settings.
   *
   * @see {@link https://core.telegram.org/bots/api#getmanagedbotaccesssettings Telegram Bot API: getManagedBotAccessSettings}
   */
  public async getManagedBotAccessSettings(userId: number): Promise<unknown> {
    return this.request<unknown>("getManagedBotAccessSettings", { user_id: userId });
  }

  /**
   * Updates access settings for a managed bot.
   *
   * @param userId - Unique identifier of the target user that owns the managed bot.
   * @param options - Updated access options including the required `is_access_restricted` flag.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#setmanagedbotaccesssettings Telegram Bot API: setManagedBotAccessSettings}
   */
  public async setManagedBotAccessSettings(
    userId: number,
    options: SetManagedBotAccessSettingsOptions,
  ): Promise<boolean> {
    return this.request<boolean>("setManagedBotAccessSettings", { user_id: userId, ...options });
  }

  /**
   * Retrieves the token of a managed bot.
   *
   * @param userId - Unique identifier of the target user that owns the managed bot.
   * @returns Object containing the bot `token`.
   *
   * @see {@link https://core.telegram.org/bots/api#getmanagedbottoken Telegram Bot API: getManagedBotToken}
   */
  public async getManagedBotToken(userId: number): Promise<{ token: string }> {
    return this.request<{ token: string }>("getManagedBotToken", { user_id: userId });
  }

  /**
   * Generates a replacement token for a managed bot.
   *
   * @param userId - Unique identifier of the target user that owns the managed bot.
   * @returns Object containing the new bot `token`.
   *
   * @see {@link https://core.telegram.org/bots/api#replacemanagedbottoken Telegram Bot API: replaceManagedBotToken}
   */
  public async replaceManagedBotToken(userId: number): Promise<{ token: string }> {
    return this.request<{ token: string }>("replaceManagedBotToken", { user_id: userId });
  }
}
