/**
 * Gifts, stars, suggested posts, and bot profile methods for Bot API.
 *
 * @packageDocumentation
 */

import { BusinessAccountMethods } from "./business-account.js";
import type {
  GetChatGiftsOptions,
  GetUserGiftsOptions,
  TransferGiftOptions,
  UpgradeGiftOptions,
  GiftPremiumSubscriptionOptions,
  CreateChatSubscriptionInviteLinkOptions,
  EditChatSubscriptionInviteLinkOptions,
  RepostStoryOptions,
  SavePreparedKeyboardButtonOptions,
  Story,
  ChatInviteLink,
} from "../../types/index.js";

/**
 * Mixin providing gifts, star transfers, and channel post operations.
 */
export abstract class BusinessGiftsMethods extends BusinessAccountMethods {
  /**
   * Gifts a Telegram Premium subscription to a user.
   *
   * @param options - Premium gift parameters.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#giftpremiumsubscription Telegram Bot API: giftPremiumSubscription}
   */
  public async giftPremiumSubscription(options: GiftPremiumSubscriptionOptions): Promise<boolean> {
    return this.request<boolean>(
      "giftPremiumSubscription",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Converts a regular gift owned by a managed business account to Telegram Stars.
   *
   * @param businessConnectionId - Unique identifier of the business connection.
   * @param ownedGiftId - Unique identifier of the regular gift to convert.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   *
   * @see {@link https://core.telegram.org/bots/api#convertgifttostars Telegram Bot API: convertGiftToStars}
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
   *
   * @see {@link https://core.telegram.org/bots/api#upgradegift Telegram Bot API: upgradeGift}
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
   *
   * @see {@link https://core.telegram.org/bots/api#transfergift Telegram Bot API: transferGift}
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
   * Creates a subscription invite link for a channel or group.
   *
   * @param chatId - Target chat identifier.
   * @param options - Subscription parameters.
   * @returns Created link object.
   *
   * @see {@link https://core.telegram.org/bots/api#createchatsubscriptioninvitelink Telegram Bot API: createChatSubscriptionInviteLink}
   */
  public async createChatSubscriptionInviteLink(
    chatId: number | string,
    options: CreateChatSubscriptionInviteLinkOptions,
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("createChatSubscriptionInviteLink", {
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
   *
   * @see {@link https://core.telegram.org/bots/api#editchatsubscriptioninvitelink Telegram Bot API: editChatSubscriptionInviteLink}
   */
  public async editChatSubscriptionInviteLink(
    chatId: number | string,
    inviteLink: string,
    options: EditChatSubscriptionInviteLinkOptions = {},
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("editChatSubscriptionInviteLink", {
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
   * @param sendDate - Point in time (Unix timestamp) when the post will be published; defaults to the
   *   current date and time when omitted.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   *
   * @see {@link https://core.telegram.org/bots/api#approvesuggestedpost Telegram Bot API: approveSuggestedPost}
   */
  public async approveSuggestedPost(
    chatId: number | string,
    messageId: number,
    sendDate?: number,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, message_id: messageId };
    if (sendDate !== undefined) payload["send_date"] = sendDate;
    return this.request<boolean>("approveSuggestedPost", payload);
  }

  /**
   * Declines a suggested post in a channel.
   *
   * @param chatId - Channel chat identifier.
   * @param messageId - Identifier of the suggested post message.
   * @param comment - Comment for the post author; pass an empty string for no comment.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When the request fails.
   *
   * @see {@link https://core.telegram.org/bots/api#declinesuggestedpost Telegram Bot API: declineSuggestedPost}
   */
  public async declineSuggestedPost(
    chatId: number | string,
    messageId: number,
    comment?: string,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, message_id: messageId };
    if (comment !== undefined) payload["comment"] = comment;
    return this.request<boolean>("declineSuggestedPost", payload);
  }

  /**
   * Reposts a story to a channel or story feed.
   *
   * @param options - Repost parameters.
   * @returns Repost result.
   *
   * @see {@link https://core.telegram.org/bots/api#repoststory Telegram Bot API: repostStory}
   */
  public async repostStory(options: RepostStoryOptions): Promise<Story> {
    return this.request<Story>("repostStory", options as unknown as Record<string, unknown>);
  }

  /**
   * Retrieves the gifts owned and hosted by a user.
   *
   * @param userId - Target user identifier.
   * @param options - Optional exclusion, sorting and pagination filters.
   * @returns List of user gifts.
   * @throws {@link TelegramApiError} When the request fails.
   *
   * @see {@link https://core.telegram.org/bots/api#getusergifts Telegram Bot API: getUserGifts}
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
   *
   * @see {@link https://core.telegram.org/bots/api#getchatgifts Telegram Bot API: getChatGifts}
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
   *
   * @see {@link https://core.telegram.org/bots/api#setmyprofilephoto Telegram Bot API: setMyProfilePhoto}
   */
  public async setMyProfilePhoto(photo: unknown): Promise<boolean> {
    return this.request<boolean>("setMyProfilePhoto", { photo });
  }

  /**
   * Removes the profile photo of the bot.
   *
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#removemyprofilephoto Telegram Bot API: removeMyProfilePhoto}
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
   *
   * @see {@link https://core.telegram.org/bots/api#getuserprofileaudios Telegram Bot API: getUserProfileAudios}
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
   *
   * @see {@link https://core.telegram.org/bots/api#setchatmembertag Telegram Bot API: setChatMemberTag}
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
   * Saves a prepared keyboard button for a Mini App.
   *
   * @param options - Button options.
   * @returns Prepared button result.
   *
   * @see {@link https://core.telegram.org/bots/api#savepreparedkeyboardbutton Telegram Bot API: savePreparedKeyboardButton}
   */
  public async savePreparedKeyboardButton(
    options: SavePreparedKeyboardButtonOptions,
  ): Promise<unknown> {
    return this.request<unknown>(
      "savePreparedKeyboardButton",
      options as unknown as Record<string, unknown>,
    );
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
