/**
 * Chat metadata, administrators, and settings management methods for Bot API.
 *
 * @packageDocumentation
 */

import { ChatMemberMethods } from "./members.js";
import type { InputFile } from "../../../utils/http.js";
import type { Chat, ChatMember, UserChatBoosts } from "../../types/index.js";

/**
 * Mixin providing chat metadata, administrator query, and photo operations.
 */
export abstract class ChatManagementMethods extends ChatMemberMethods {
  /**
   * Sets a new profile photo for the chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param photo - File ID, URL, or {@link InputFile} object.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting chat photo fails.
   */
  public async setChatPhoto(
    chatId: number | string,
    photo: string | import("../../../utils/http.js").InputFile,
  ): Promise<boolean> {
    return this.request<boolean>("setChatPhoto", { chat_id: chatId, photo });
  }

  /**
   * Deletes a chat photo.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting chat photo fails.
   */
  public async deleteChatPhoto(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("deleteChatPhoto", { chat_id: chatId });
  }

  /**
   * Changes the title of a chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param title - New chat title, 1-128 characters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting title fails.
   */
  public async setChatTitle(chatId: number | string, title: string): Promise<boolean> {
    return this.request<boolean>("setChatTitle", { chat_id: chatId, title });
  }

  /**
   * Changes the description of a group, a supergroup or a channel.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param description - New chat description, 0-255 characters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting description fails.
   */
  public async setChatDescription(chatId: number | string, description?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (description !== undefined) payload["description"] = description;
    return this.request<boolean>("setChatDescription", payload);
  }

  /**
   * Pins a message in a group, a supergroup, or a channel.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageId - Identifier of a message to pin.
   * @param disableNotification - Pass `true` if it is not necessary to send a notification to all chat members.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When pinning message fails.
   */
  public async pinChatMessage(
    chatId: number | string,
    messageId: number,
    disableNotification?: boolean,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, message_id: messageId };
    if (disableNotification !== undefined) payload["disable_notification"] = disableNotification;
    return this.request<boolean>("pinChatMessage", payload);
  }

  /**
   * Unpins a message in a group, a supergroup, or a channel.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageId - Identifier of a message to unpin. If not specified, the most recent pinned message is unpinned.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unpinning fails.
   */
  public async unpinChatMessage(chatId: number | string, messageId?: number): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (messageId !== undefined) payload["message_id"] = messageId;
    return this.request<boolean>("unpinChatMessage", payload);
  }

  /**
   * Clears the list of pinned messages in a chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When clearing pinned messages fails.
   */
  public async unpinAllChatMessages(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("unpinAllChatMessages", { chat_id: chatId });
  }

  /**
   * Leaves a group, supergroup or channel.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When leaving chat fails.
   */
  public async leaveChat(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("leaveChat", { chat_id: chatId });
  }

  /**
   * Retrieves up to date information about the chat (current name of the user for one-on-one conversations, current username of a user, group or channel, etc.).
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @returns A {@link Chat} object.
   * @throws {@link TelegramApiError} When chat is not found or bot lacks access.
   *
   * @example
   * ```ts
   * const chat = await bot.getChat(chatId);
   * console.log(`Chat title: ${chat.title}`);
   * ```
   */
  public async getChat(chatId: number | string): Promise<Chat> {
    return this.request<Chat>("getChat", { chat_id: chatId });
  }

  /**
   * Retrieves a list of administrators in a chat, which includes the chat creator and all promoted admins.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns Array of {@link ChatMember} objects.
   * @throws {@link TelegramApiError} When retrieving administrators fails.
   *
   * @example
   * ```ts
   * const admins = await bot.getChatAdministrators(chatId);
   * console.log(`Found ${admins.length} administrators`);
   * ```
   */
  public async getChatAdministrators(chatId: number | string): Promise<ChatMember[]> {
    return this.request<ChatMember[]>("getChatAdministrators", { chat_id: chatId });
  }

  /**
   * Retrieves the number of members in a chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns Total member count as a number.
   * @throws {@link TelegramApiError} When retrieving count fails.
   *
   * @example
   * ```ts
   * const count = await bot.getChatMemberCount(chatId);
   * console.log(`Chat members: ${count}`);
   * ```
   */
  public async getChatMemberCount(chatId: number | string): Promise<number> {
    return this.request<number>("getChatMemberCount", { chat_id: chatId });
  }

  /**
   * Retrieves information about a specific member of a chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param userId - Unique identifier of the target user.
   * @returns A {@link ChatMember} object.
   * @throws {@link TelegramApiError} When user is not found.
   *
   * @example
   * ```ts
   * const member = await bot.getChatMember(chatId, userId);
   * console.log(`User status: ${member.status}`);
   * ```
   */
  public async getChatMember(chatId: number | string, userId: number): Promise<ChatMember> {
    return this.request<ChatMember>("getChatMember", { chat_id: chatId, user_id: userId });
  }

  /**
   * Sets a new group sticker set for a supergroup.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param stickerSetName - Name of the sticker set to be set as the group sticker set.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting sticker set fails.
   */
  public async setChatStickerSet(
    chatId: number | string,
    stickerSetName: string,
  ): Promise<boolean> {
    return this.request<boolean>("setChatStickerSet", {
      chat_id: chatId,
      sticker_set_name: stickerSetName,
    });
  }

  /**
   * Deletes a group sticker set from a supergroup.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting sticker set fails.
   */
  public async deleteChatStickerSet(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("deleteChatStickerSet", { chat_id: chatId });
  }

  /**
   * Verifies a user on behalf of the organization which owns the bot.
   *
   * @param userId - Unique identifier of the target user.
   * @param customDescription - Custom description for the verification status; 0-70 characters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When verification fails.
   *
   * @example
   * ```ts
   * await bot.verifyUser(123456, "Official Staff");
   * ```
   */
  public async verifyUser(userId: number, customDescription?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { user_id: userId };
    if (customDescription !== undefined) payload["custom_description"] = customDescription;
    return this.request<boolean>("verifyUser", payload);
  }

  /**
   * Verifies a chat on behalf of the organization which owns the bot.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param customDescription - Custom description for the verification status; 0-70 characters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When verification fails.
   *
   * @example
   * ```ts
   * await bot.verifyChat(chatId, "Verified Community");
   * ```
   */
  public async verifyChat(chatId: number | string, customDescription?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (customDescription !== undefined) payload["custom_description"] = customDescription;
    return this.request<boolean>("verifyChat", payload);
  }

  /**
   * Removes verification from a user that was previously verified by the bot.
   *
   * @param userId - Unique identifier of the target user.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When removing verification fails.
   *
   * @example
   * ```ts
   * await bot.removeUserVerification(123456);
   * ```
   */
  public async removeUserVerification(userId: number): Promise<boolean> {
    return this.request<boolean>("removeUserVerification", { user_id: userId });
  }

  /**
   * Removes verification from a chat that was previously verified by the bot.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When removing verification fails.
   *
   * @example
   * ```ts
   * await bot.removeChatVerification(chatId);
   * ```
   */
  public async removeChatVerification(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("removeChatVerification", { chat_id: chatId });
  }

  /**
   * Retrieves the list of boosts added to a chat by a user.
   *
   * @param chatId - Unique identifier for the target chat or username of the target channel.
   * @param userId - Unique identifier of the target user.
   * @returns A {@link UserChatBoosts} object containing the list of boosts.
   * @throws {@link TelegramApiError} When retrieving boosts fails.
   *
   * @example
   * ```ts
   * const boosts = await bot.getUserChatBoosts(chatId, 123456);
   * console.log(`Total boosts: ${boosts.boosts.length}`);
   * ```
   */
  public async getUserChatBoosts(chatId: number | string, userId: number): Promise<UserChatBoosts> {
    return this.request<UserChatBoosts>("getUserChatBoosts", { chat_id: chatId, user_id: userId });
  }
}
