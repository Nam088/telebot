/**
 * Chat member moderation and permissions methods for Bot API.
 *
 * @packageDocumentation
 */

import { MessageMethods } from "../messages/index.js";
import type {
  ChatMember,
  ChatPermissions,
  ChatInviteLink,
  PromoteChatMemberOptions,
  CreateChatInviteLinkOptions,
  EditChatInviteLinkOptions,
} from "../../types/index.js";

/**
 * Mixin providing chat member moderation, permissions, and invite links.
 */
export abstract class ChatMemberMethods extends MessageMethods {
  /**
   * Bans a user in a group, a supergroup or a channel.
   *
   * @param chatId - Unique identifier for the target group or channel.
   * @param userId - Unique identifier of the target user.
   * @param untilDate - Date when the user will be unbanned; Unix time. If user is banned for more than 366 days or less than 30 seconds from the current time they are considered to be banned forever.
   * @param revokeMessages - Pass `true` to delete all messages from the chat for the user that is being banned.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When banning fails.
   *
   * @example
   * ```ts
   * await bot.banChatMember(chatId, userId, undefined, true);
   * ```
   */
  public async banChatMember(
    chatId: number | string,
    userId: number,
    untilDate?: number,
    revokeMessages?: boolean,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, user_id: userId };
    if (untilDate !== undefined) payload["until_date"] = untilDate;
    if (revokeMessages !== undefined) payload["revoke_messages"] = revokeMessages;
    return this.request<boolean>("banChatMember", payload);
  }

  /**
   * Unbans a previously banned user in a supergroup or channel.
   *
   * @param chatId - Unique identifier for the target group or channel.
   * @param userId - Unique identifier of the target user.
   * @param onlyIfBanned - Do nothing if the user is not banned.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unbanning fails.
   *
   * @example
   * ```ts
   * await bot.unbanChatMember(chatId, userId);
   * ```
   */
  public async unbanChatMember(
    chatId: number | string,
    userId: number,
    onlyIfBanned?: boolean,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, user_id: userId };
    if (onlyIfBanned !== undefined) payload["only_if_banned"] = onlyIfBanned;
    return this.request<boolean>("unbanChatMember", payload);
  }

  /**
   * Bans a channel in a chat, preventing it from sending messages.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param senderChatId - Unique identifier of the target sender channel.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When banning sender chat fails.
   *
   * @example
   * ```ts
   * await bot.banChatSenderChat(chatId, channelId);
   * ```
   */
  public async banChatSenderChat(chatId: number | string, senderChatId: number): Promise<boolean> {
    return this.request<boolean>("banChatSenderChat", {
      chat_id: chatId,
      sender_chat_id: senderChatId,
    });
  }

  /**
   * Unbans a previously banned channel in a chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param senderChatId - Unique identifier of the target sender channel.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unbanning sender chat fails.
   *
   * @example
   * ```ts
   * await bot.unbanChatSenderChat(chatId, channelId);
   * ```
   */
  public async unbanChatSenderChat(
    chatId: number | string,
    senderChatId: number,
  ): Promise<boolean> {
    return this.request<boolean>("unbanChatSenderChat", {
      chat_id: chatId,
      sender_chat_id: senderChatId,
    });
  }

  /**
   * Restricts a user in a supergroup.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param userId - Unique identifier of the target user.
   * @param permissions - Object for new user permissions (e.g. `can_send_messages`).
   * @param useIndependentChatPermissions - Pass `true` if chat permissions are set independently.
   * @param untilDate - Date when restrictions will be lifted; Unix time.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When restriction fails.
   *
   * @example
   * ```ts
   * await bot.restrictChatMember(chatId, userId, {
   *   can_send_messages: false,
   * });
   * ```
   */
  public async restrictChatMember(
    chatId: number | string,
    userId: number,
    permissions: ChatPermissions,
    useIndependentChatPermissions?: boolean,
    untilDate?: number,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      user_id: userId,
      permissions,
    };
    if (useIndependentChatPermissions !== undefined)
      payload["use_independent_chat_permissions"] = useIndependentChatPermissions;
    if (untilDate !== undefined) payload["until_date"] = untilDate;
    return this.request<boolean>("restrictChatMember", payload);
  }

  /**
   * Promotes or demotes a user in a supergroup or a channel.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param userId - Unique identifier of the target user.
   * @param options - Admin rights flags (e.g. `can_manage_chat`, `can_delete_messages`, `can_invite_users`).
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When promotion fails.
   *
   * @example
   * ```ts
   * await bot.promoteChatMember(chatId, userId, {
   *   can_delete_messages: true,
   *   can_invite_users: true,
   * });
   * ```
   */
  public async promoteChatMember(
    chatId: number | string,
    userId: number,
    options: PromoteChatMemberOptions = {},
  ): Promise<boolean> {
    return this.request<boolean>("promoteChatMember", {
      chat_id: chatId,
      user_id: userId,
      ...options,
    });
  }

  /**
   * Sets a custom title for an administrator in a supergroup promoted by the bot.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param userId - Unique identifier of the target user.
   * @param customTitle - New custom title for the administrator; 0-16 characters.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting title fails.
   *
   * @example
   * ```ts
   * await bot.setChatAdministratorCustomTitle(chatId, userId, "Moderator");
   * ```
   */
  public async setChatAdministratorCustomTitle(
    chatId: number | string,
    userId: number,
    customTitle: string,
  ): Promise<boolean> {
    return this.request<boolean>("setChatAdministratorCustomTitle", {
      chat_id: chatId,
      user_id: userId,
      custom_title: customTitle,
    });
  }

  /**
   * Sets default chat permissions for all members.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param permissions - Object for new default chat permissions.
   * @param useIndependentChatPermissions - Pass `true` if chat permissions are set independently.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting permissions fails.
   *
   * @example
   * ```ts
   * await bot.setChatPermissions(chatId, {
   *   can_send_messages: true,
   *   can_send_photos: false,
   * });
   * ```
   */
  public async setChatPermissions(
    chatId: number | string,
    permissions: ChatPermissions,
    useIndependentChatPermissions?: boolean,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, permissions };
    if (useIndependentChatPermissions !== undefined)
      payload["use_independent_chat_permissions"] = useIndependentChatPermissions;
    return this.request<boolean>("setChatPermissions", payload);
  }

  /**
   * Generates a new primary invite link for a chat; any previously generated primary link is revoked.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns The new invite link as a string.
   * @throws {@link TelegramApiError} When exporting link fails.
   *
   * @example
   * ```ts
   * const link = await bot.exportChatInviteLink(chatId);
   * console.log(`Primary invite link: ${link}`);
   * ```
   */
  public async exportChatInviteLink(chatId: number | string): Promise<string> {
    return this.request<string>("exportChatInviteLink", { chat_id: chatId });
  }

  /**
   * Creates an additional invite link for a chat with optional expiration and usage limits.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param options - Options including `name`, `expire_date`, `member_limit`, and `creates_join_request`.
   * @returns The created {@link ChatInviteLink}.
   * @throws {@link TelegramApiError} When creating link fails.
   *
   * @example
   * ```ts
   * const invite = await bot.createChatInviteLink(chatId, {
   *   name: "VIP Membership",
   *   member_limit: 10,
   * });
   * ```
   */
  public async createChatInviteLink(
    chatId: number | string,
    options: CreateChatInviteLinkOptions = {},
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("createChatInviteLink", {
      chat_id: chatId,
      ...options,
    });
  }

  /**
   * Edits a non-primary invite link created by the bot.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param inviteLink - The invite link to edit.
   * @param options - Updated invite link parameters.
   * @returns The edited {@link ChatInviteLink}.
   * @throws {@link TelegramApiError} When editing link fails.
   *
   * @example
   * ```ts
   * const edited = await bot.editChatInviteLink(chatId, inviteLink, {
   *   member_limit: 20,
   * });
   * ```
   */
  public async editChatInviteLink(
    chatId: number | string,
    inviteLink: string,
    options: EditChatInviteLinkOptions = {},
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("editChatInviteLink", {
      chat_id: chatId,
      invite_link: inviteLink,
      ...options,
    });
  }

  /**
   * Revokes an invite link created by the bot.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param inviteLink - The invite link to revoke.
   * @returns The revoked {@link ChatInviteLink}.
   * @throws {@link TelegramApiError} When revoking fails.
   *
   * @example
   * ```ts
   * await bot.revokeChatInviteLink(chatId, inviteLink);
   * ```
   */
  public async revokeChatInviteLink(
    chatId: number | string,
    inviteLink: string,
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("revokeChatInviteLink", {
      chat_id: chatId,
      invite_link: inviteLink,
    });
  }

  /**
   * Approves a chat join request from a user.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param userId - Unique identifier of the target user.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When approval fails.
   *
   * @example
   * ```ts
   * await bot.approveChatJoinRequest(chatId, userId);
   * ```
   */
  public async approveChatJoinRequest(chatId: number | string, userId: number): Promise<boolean> {
    return this.request<boolean>("approveChatJoinRequest", { chat_id: chatId, user_id: userId });
  }

  /**
   * Declines a chat join request from a user.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param userId - Unique identifier of the target user.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When declining fails.
   *
   * @example
   * ```ts
   * await bot.declineChatJoinRequest(chatId, userId);
   * ```
   */
  public async declineChatJoinRequest(chatId: number | string, userId: number): Promise<boolean> {
    return this.request<boolean>("declineChatJoinRequest", { chat_id: chatId, user_id: userId });
  }
}
