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
}
