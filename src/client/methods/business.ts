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
  public async answerCallbackQuery(options: AnswerCallbackQueryOptions): Promise<boolean> {
    return this.request<boolean>("answerCallbackQuery", options as unknown as Record<string, unknown>);
  }

  public async answerInlineQuery(options: AnswerInlineQueryOptions): Promise<boolean> {
    return this.request<boolean>("answerInlineQuery", options as unknown as Record<string, unknown>);
  }

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

  public async setPassportDataErrors(userId: number, errors: PassportElementError[]): Promise<boolean> {
    return this.request<boolean>("setPassportDataErrors", {
      user_id: userId,
      errors,
    });
  }

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

  public async deleteStory(businessConnectionId: string, storyId: number): Promise<boolean> {
    return this.request<boolean>("deleteStory", {
      business_connection_id: businessConnectionId,
      story_id: storyId,
    });
  }

  public async getBusinessConnection(businessConnectionId: string): Promise<BusinessConnection> {
    return this.request<BusinessConnection>("getBusinessConnection", {
      business_connection_id: businessConnectionId,
    });
  }

  public async readBusinessMessage(businessConnectionId: string, messageId: number): Promise<boolean> {
    return this.request<boolean>("readBusinessMessage", {
      business_connection_id: businessConnectionId,
      message_id: messageId,
    });
  }

  public async deleteBusinessMessages(businessConnectionId: string, messageIds: number[]): Promise<boolean> {
    return this.request<boolean>("deleteBusinessMessages", {
      business_connection_id: businessConnectionId,
      message_ids: messageIds,
    });
  }

  public async getAvailableGifts(): Promise<Gifts> {
    return this.request<Gifts>("getAvailableGifts");
  }

  public async sendGift(options: {
    user_id: number;
    gift_id: string;
    pay_for_upgrade?: boolean;
    text?: string;
    text_parse_mode?: string;
  }): Promise<boolean> {
    return this.request<boolean>("sendGift", options as unknown as Record<string, unknown>);
  }

  public async verifyChat(chatId: number | string, customDescription?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (customDescription !== undefined) payload["custom_description"] = customDescription;
    return this.request<boolean>("verifyChat", payload);
  }

  public async verifyUser(userId: number, customDescription?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { user_id: userId };
    if (customDescription !== undefined) payload["custom_description"] = customDescription;
    return this.request<boolean>("verifyUser", payload);
  }

  public async removeChatVerification(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("removeChatVerification", { chat_id: chatId });
  }

  public async removeUserVerification(userId: number): Promise<boolean> {
    return this.request<boolean>("removeUserVerification", { user_id: userId });
  }

  public async getUserChatBoosts(chatId: number | string, userId: number): Promise<UserChatBoosts> {
    return this.request<UserChatBoosts>("getUserChatBoosts", { chat_id: chatId, user_id: userId });
  }

  public async setUserEmojiStatus(
    userId: number,
    customEmojiId?: string,
    options: { emoji_status_expiration_date?: number } = {}
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { user_id: userId, ...options };
    if (customEmojiId !== undefined) payload["custom_emoji_id"] = customEmojiId;
    return this.request<boolean>("setUserEmojiStatus", payload);
  }

  public async savePreparedInlineMessage(options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("savePreparedInlineMessage", options);
  }

  public async answerWebAppQuery(webAppQueryId: string, result: unknown): Promise<{ inline_message_id?: string }> {
    return this.request<{ inline_message_id?: string }>("answerWebAppQuery", {
      web_app_query_id: webAppQueryId,
      result,
    });
  }

  public async answerGuestQuery(guestQueryId: string, result: unknown): Promise<{ inline_message_id?: string }> {
    return this.request<{ inline_message_id?: string }>("answerGuestQuery", {
      guest_query_id: guestQueryId,
      result,
    });
  }

  public async logOut(): Promise<boolean> {
    return this.request<boolean>("logOut");
  }

  public async close(): Promise<boolean> {
    return this.request<boolean>("close");
  }

  public async getForumTopicIconStickers(): Promise<unknown[]> {
    return this.request<unknown[]>("getForumTopicIconStickers");
  }

  public async giftPremiumSubscription(options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("giftPremiumSubscription", options);
  }

  public async getBusinessAccountGifts(businessConnectionId: string): Promise<unknown> {
    return this.request<unknown>("getBusinessAccountGifts", { business_connection_id: businessConnectionId });
  }

  public async getBusinessAccountStarBalance(businessConnectionId: string): Promise<{ amount: number }> {
    return this.request<{ amount: number }>("getBusinessAccountStarBalance", {
      business_connection_id: businessConnectionId,
    });
  }

  public async setBusinessAccountName(businessConnectionId: string, name: string): Promise<boolean> {
    return this.request<boolean>("setBusinessAccountName", {
      business_connection_id: businessConnectionId,
      name,
    });
  }

  public async setBusinessAccountUsername(businessConnectionId: string, username?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { business_connection_id: businessConnectionId };
    if (username !== undefined) payload["username"] = username;
    return this.request<boolean>("setBusinessAccountUsername", payload);
  }

  public async setBusinessAccountBio(businessConnectionId: string, bio?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { business_connection_id: businessConnectionId };
    if (bio !== undefined) payload["bio"] = bio;
    return this.request<boolean>("setBusinessAccountBio", payload);
  }

  public async setBusinessAccountGiftSettings(businessConnectionId: string, options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("setBusinessAccountGiftSettings", {
      business_connection_id: businessConnectionId,
      ...options,
    });
  }

  public async setBusinessAccountProfilePhoto(businessConnectionId: string, photo: unknown): Promise<boolean> {
    return this.request<boolean>("setBusinessAccountProfilePhoto", {
      business_connection_id: businessConnectionId,
      photo,
    });
  }

  public async removeBusinessAccountProfilePhoto(businessConnectionId: string): Promise<boolean> {
    return this.request<boolean>("removeBusinessAccountProfilePhoto", {
      business_connection_id: businessConnectionId,
    });
  }

  public async convertGiftToStars(userId: number, ownedGiftId: string): Promise<boolean> {
    return this.request<boolean>("convertGiftToStars", { user_id: userId, owned_gift_id: ownedGiftId });
  }

  public async upgradeGift(userId: number, ownedGiftId: string): Promise<boolean> {
    return this.request<boolean>("upgradeGift", { user_id: userId, owned_gift_id: ownedGiftId });
  }

  public async transferGift(userId: number, ownedGiftId: string, newOwnerChatId: number | string): Promise<boolean> {
    return this.request<boolean>("transferGift", {
      user_id: userId,
      owned_gift_id: ownedGiftId,
      new_owner_chat_id: newOwnerChatId,
    });
  }

  public async transferBusinessAccountStars(businessConnectionId: string, starCount: number): Promise<boolean> {
    return this.request<boolean>("transferBusinessAccountStars", {
      business_connection_id: businessConnectionId,
      star_count: starCount,
    });
  }

  public async getManagedBotAccessSettings(botId: number): Promise<unknown> {
    return this.request<unknown>("getManagedBotAccessSettings", { bot_id: botId });
  }

  public async setManagedBotAccessSettings(botId: number, options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("setManagedBotAccessSettings", { bot_id: botId, ...options });
  }

  public async createChatSubscriptionInviteLink(chatId: number | string, options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("createChatSubscriptionInviteLink", { chat_id: chatId, ...options });
  }

  public async editChatSubscriptionInviteLink(chatId: number | string, inviteLink: string, options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("editChatSubscriptionInviteLink", {
      chat_id: chatId,
      invite_link: inviteLink,
      ...options,
    });
  }

  public async approveSuggestedPost(chatId: number | string, messageId: number): Promise<boolean> {
    return this.request<boolean>("approveSuggestedPost", { chat_id: chatId, message_id: messageId });
  }

  public async declineSuggestedPost(chatId: number | string, messageId: number): Promise<boolean> {
    return this.request<boolean>("declineSuggestedPost", { chat_id: chatId, message_id: messageId });
  }

  public async repostStory(options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("repostStory", options);
  }

  public async getUserGifts(userId: number, options: Record<string, unknown> = {}): Promise<unknown> {
    return this.request<unknown>("getUserGifts", { user_id: userId, ...options });
  }

  public async getChatGifts(chatId: number | string, options: Record<string, unknown> = {}): Promise<unknown> {
    return this.request<unknown>("getChatGifts", { chat_id: chatId, ...options });
  }

  public async setMyProfilePhoto(photo: unknown): Promise<boolean> {
    return this.request<boolean>("setMyProfilePhoto", { photo });
  }

  public async removeMyProfilePhoto(): Promise<boolean> {
    return this.request<boolean>("removeMyProfilePhoto");
  }

  public async getUserProfileAudios(userId: number, offset?: number, limit?: number): Promise<unknown> {
    const payload: Record<string, unknown> = { user_id: userId };
    if (offset !== undefined) payload["offset"] = offset;
    if (limit !== undefined) payload["limit"] = limit;
    return this.request<unknown>("getUserProfileAudios", payload);
  }

  public async setChatMemberTag(chatId: number | string, userId: number, tag?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, user_id: userId };
    if (tag !== undefined) payload["tag"] = tag;
    return this.request<boolean>("setChatMemberTag", payload);
  }

  public async getManagedBotToken(botId: number): Promise<{ token: string }> {
    return this.request<{ token: string }>("getManagedBotToken", { bot_id: botId });
  }

  public async replaceManagedBotToken(botId: number): Promise<{ token: string }> {
    return this.request<{ token: string }>("replaceManagedBotToken", { bot_id: botId });
  }

  public async savePreparedKeyboardButton(options: Record<string, unknown>): Promise<unknown> {
    return this.request<unknown>("savePreparedKeyboardButton", options);
  }

  public async initialize(): Promise<void> {
    await this.getMe();
  }

  public async shutdown(): Promise<void> {
    // Graceful client shutdown
  }

  public async doApiRequest<T>(method: string, payload: Record<string, unknown> = {}): Promise<T> {
    return this.request<T>(method, payload);
  }
}
