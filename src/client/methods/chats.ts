/**
 * Chat and user administration methods for Bot API.
 *
 * @packageDocumentation
 */

import { MessageMethods } from "./messages.js";
import type {
  Chat,
  ChatMember,
  ChatPermissions,
  ChatInviteLink,
  PromoteChatMemberOptions,
  CreateChatInviteLinkOptions,
  EditChatInviteLinkOptions,
} from "../types.js";

/**
 * Mixin providing chat moderation, permissions, and administrator operations.
 */
export abstract class ChatMethods extends MessageMethods {
  public async banChatMember(
    chatId: number | string,
    userId: number,
    untilDate?: number,
    revokeMessages?: boolean
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, user_id: userId };
    if (untilDate !== undefined) payload["until_date"] = untilDate;
    if (revokeMessages !== undefined) payload["revoke_messages"] = revokeMessages;
    return this.request<boolean>("banChatMember", payload);
  }

  public async unbanChatMember(chatId: number | string, userId: number, onlyIfBanned?: boolean): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, user_id: userId };
    if (onlyIfBanned !== undefined) payload["only_if_banned"] = onlyIfBanned;
    return this.request<boolean>("unbanChatMember", payload);
  }

  public async banChatSenderChat(chatId: number | string, senderChatId: number): Promise<boolean> {
    return this.request<boolean>("banChatSenderChat", { chat_id: chatId, sender_chat_id: senderChatId });
  }

  public async unbanChatSenderChat(chatId: number | string, senderChatId: number): Promise<boolean> {
    return this.request<boolean>("unbanChatSenderChat", { chat_id: chatId, sender_chat_id: senderChatId });
  }

  public async restrictChatMember(
    chatId: number | string,
    userId: number,
    permissions: ChatPermissions,
    useIndependentChatPermissions?: boolean,
    untilDate?: number
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

  public async promoteChatMember(
    chatId: number | string,
    userId: number,
    options: PromoteChatMemberOptions = {}
  ): Promise<boolean> {
    return this.request<boolean>("promoteChatMember", {
      chat_id: chatId,
      user_id: userId,
      ...options,
    });
  }

  public async setChatAdministratorCustomTitle(
    chatId: number | string,
    userId: number,
    customTitle: string
  ): Promise<boolean> {
    return this.request<boolean>("setChatAdministratorCustomTitle", {
      chat_id: chatId,
      user_id: userId,
      custom_title: customTitle,
    });
  }

  public async setChatPermissions(
    chatId: number | string,
    permissions: ChatPermissions,
    useIndependentChatPermissions?: boolean
  ): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, permissions };
    if (useIndependentChatPermissions !== undefined)
      payload["use_independent_chat_permissions"] = useIndependentChatPermissions;
    return this.request<boolean>("setChatPermissions", payload);
  }

  public async exportChatInviteLink(chatId: number | string): Promise<string> {
    return this.request<string>("exportChatInviteLink", { chat_id: chatId });
  }

  public async createChatInviteLink(
    chatId: number | string,
    options: CreateChatInviteLinkOptions = {}
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("createChatInviteLink", {
      chat_id: chatId,
      ...options,
    });
  }

  public async editChatInviteLink(
    chatId: number | string,
    inviteLink: string,
    options: EditChatInviteLinkOptions = {}
  ): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("editChatInviteLink", {
      chat_id: chatId,
      invite_link: inviteLink,
      ...options,
    });
  }

  public async revokeChatInviteLink(chatId: number | string, inviteLink: string): Promise<ChatInviteLink> {
    return this.request<ChatInviteLink>("revokeChatInviteLink", {
      chat_id: chatId,
      invite_link: inviteLink,
    });
  }

  public async approveChatJoinRequest(chatId: number | string, userId: number): Promise<boolean> {
    return this.request<boolean>("approveChatJoinRequest", { chat_id: chatId, user_id: userId });
  }

  public async declineChatJoinRequest(chatId: number | string, userId: number): Promise<boolean> {
    return this.request<boolean>("declineChatJoinRequest", { chat_id: chatId, user_id: userId });
  }

  public async setChatPhoto(chatId: number | string, photo: string | import("../../utils/http.js").InputFile): Promise<boolean> {
    return this.request<boolean>("setChatPhoto", { chat_id: chatId, photo });
  }

  public async deleteChatPhoto(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("deleteChatPhoto", { chat_id: chatId });
  }

  public async setChatTitle(chatId: number | string, title: string): Promise<boolean> {
    return this.request<boolean>("setChatTitle", { chat_id: chatId, title });
  }

  public async setChatDescription(chatId: number | string, description?: string): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (description !== undefined) payload["description"] = description;
    return this.request<boolean>("setChatDescription", payload);
  }

  public async pinChatMessage(chatId: number | string, messageId: number, disableNotification?: boolean): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId, message_id: messageId };
    if (disableNotification !== undefined) payload["disable_notification"] = disableNotification;
    return this.request<boolean>("pinChatMessage", payload);
  }

  public async unpinChatMessage(chatId: number | string, messageId?: number): Promise<boolean> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (messageId !== undefined) payload["message_id"] = messageId;
    return this.request<boolean>("unpinChatMessage", payload);
  }

  public async unpinAllChatMessages(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("unpinAllChatMessages", { chat_id: chatId });
  }

  public async leaveChat(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("leaveChat", { chat_id: chatId });
  }

  public async getChat(chatId: number | string): Promise<Chat> {
    return this.request<Chat>("getChat", { chat_id: chatId });
  }

  public async getChatAdministrators(chatId: number | string): Promise<ChatMember[]> {
    return this.request<ChatMember[]>("getChatAdministrators", { chat_id: chatId });
  }

  public async getChatMemberCount(chatId: number | string): Promise<number> {
    return this.request<number>("getChatMemberCount", { chat_id: chatId });
  }

  public async getChatMember(chatId: number | string, userId: number): Promise<ChatMember> {
    return this.request<ChatMember>("getChatMember", { chat_id: chatId, user_id: userId });
  }

  public async setChatStickerSet(chatId: number | string, stickerSetName: string): Promise<boolean> {
    return this.request<boolean>("setChatStickerSet", { chat_id: chatId, sticker_set_name: stickerSetName });
  }

  public async deleteChatStickerSet(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("deleteChatStickerSet", { chat_id: chatId });
  }
}
