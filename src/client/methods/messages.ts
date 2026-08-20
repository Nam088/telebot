/**
 * Message, media, and location methods for Bot API.
 *
 * @packageDocumentation
 */

import { BaseBotClient } from "./base.js";
import type {
  User,
  Message,
  Update as RawUpdate,
  UserProfilePhotos,
  File,
  WebhookInfo,
  SendMessageOptions,
  GetUpdatesOptions,
  SendPhotoOptions,
  SendAudioOptions,
  SendDocumentOptions,
  SendVideoOptions,
  SendAnimationOptions,
  SendVoiceOptions,
  SendVideoNoteOptions,
  SendMediaGroupOptions,
  SendLocationOptions,
  SendVenueOptions,
  SendContactOptions,
  SendPollOptions,
  SendDiceOptions,
  SendChatActionOptions,
  EditMessageTextOptions,
  EditMessageCaptionOptions,
  EditMessageReplyMarkupOptions,
  EditMessageMediaOptions,
  EditMessageLiveLocationOptions,
  StopMessageLiveLocationOptions,
  StopPollOptions,
  SetMessageReactionOptions,
  SetWebhookOptions,
  Poll,
} from "../types.js";
import type { ParseMode } from "../constants.js";

/**
 * Mixin providing message, media sending, editing, and reaction operations.
 */
export abstract class MessageMethods extends BaseBotClient {
  public async getMe(): Promise<User> {
    return this.request<User>("getMe");
  }

  public async getUpdates(options: GetUpdatesOptions = {}): Promise<RawUpdate[]> {
    return this.request<RawUpdate[]>("getUpdates", options as unknown as Record<string, unknown>);
  }

  public async sendMessage(options: SendMessageOptions): Promise<Message> {
    return this.request<Message>("sendMessage", options as unknown as Record<string, unknown>);
  }

  public async deleteMessage(chatId: number | string, messageId: number): Promise<boolean> {
    return this.request<boolean>("deleteMessage", { chat_id: chatId, message_id: messageId });
  }

  public async deleteMessages(chatId: number | string, messageIds: number[]): Promise<boolean> {
    return this.request<boolean>("deleteMessages", { chat_id: chatId, message_ids: messageIds });
  }

  public async forwardMessage(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_id: number;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_thread_id?: number;
  }): Promise<Message> {
    return this.request<Message>("forwardMessage", options as unknown as Record<string, unknown>);
  }

  public async forwardMessages(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_ids: number[];
    disable_notification?: boolean;
    protect_content?: boolean;
    message_thread_id?: number;
  }): Promise<Array<{ message_id: number }>> {
    return this.request<Array<{ message_id: number }>>("forwardMessages", options as unknown as Record<string, unknown>);
  }

  public async copyMessage(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_id: number;
    caption?: string;
    parse_mode?: ParseMode;
    caption_entities?: unknown[];
    disable_notification?: boolean;
    protect_content?: boolean;
    reply_markup?: unknown;
    message_thread_id?: number;
  }): Promise<{ message_id: number }> {
    return this.request<{ message_id: number }>("copyMessage", options as unknown as Record<string, unknown>);
  }

  public async copyMessages(options: {
    chat_id: number | string;
    from_chat_id: number | string;
    message_ids: number[];
    disable_notification?: boolean;
    protect_content?: boolean;
    remove_caption?: boolean;
    message_thread_id?: number;
  }): Promise<Array<{ message_id: number }>> {
    return this.request<Array<{ message_id: number }>>("copyMessages", options as unknown as Record<string, unknown>);
  }

  public async sendPhoto(options: SendPhotoOptions): Promise<Message> {
    return this.request<Message>("sendPhoto", options as unknown as Record<string, unknown>);
  }

  public async sendAudio(options: SendAudioOptions): Promise<Message> {
    return this.request<Message>("sendAudio", options as unknown as Record<string, unknown>);
  }

  public async sendDocument(options: SendDocumentOptions): Promise<Message> {
    return this.request<Message>("sendDocument", options as unknown as Record<string, unknown>);
  }

  public async sendVideo(options: SendVideoOptions): Promise<Message> {
    return this.request<Message>("sendVideo", options as unknown as Record<string, unknown>);
  }

  public async sendAnimation(options: SendAnimationOptions): Promise<Message> {
    return this.request<Message>("sendAnimation", options as unknown as Record<string, unknown>);
  }

  public async sendVoice(options: SendVoiceOptions): Promise<Message> {
    return this.request<Message>("sendVoice", options as unknown as Record<string, unknown>);
  }

  public async sendVideoNote(options: SendVideoNoteOptions): Promise<Message> {
    return this.request<Message>("sendVideoNote", options as unknown as Record<string, unknown>);
  }

  public async sendMediaGroup(options: SendMediaGroupOptions): Promise<Message[]> {
    return this.request<Message[]>("sendMediaGroup", options as unknown as Record<string, unknown>);
  }

  public async sendLocation(options: SendLocationOptions): Promise<Message> {
    return this.request<Message>("sendLocation", options as unknown as Record<string, unknown>);
  }

  public async editMessageLiveLocation(options: EditMessageLiveLocationOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageLiveLocation", options as unknown as Record<string, unknown>);
  }

  public async stopMessageLiveLocation(options: StopMessageLiveLocationOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>("stopMessageLiveLocation", options as unknown as Record<string, unknown>);
  }

  public async sendVenue(options: SendVenueOptions): Promise<Message> {
    return this.request<Message>("sendVenue", options as unknown as Record<string, unknown>);
  }

  public async sendContact(options: SendContactOptions): Promise<Message> {
    return this.request<Message>("sendContact", options as unknown as Record<string, unknown>);
  }

  public async sendPoll(options: SendPollOptions): Promise<Message> {
    return this.request<Message>("sendPoll", options as unknown as Record<string, unknown>);
  }

  public async stopPoll(chatId: number | string, messageId: number, options: StopPollOptions = {}): Promise<Poll> {
    return this.request<Poll>("stopPoll", {
      chat_id: chatId,
      message_id: messageId,
      ...options,
    });
  }

  public async sendDice(options: SendDiceOptions): Promise<Message> {
    return this.request<Message>("sendDice", options as unknown as Record<string, unknown>);
  }

  public async sendChatAction(options: SendChatActionOptions): Promise<boolean> {
    return this.request<boolean>("sendChatAction", options as unknown as Record<string, unknown>);
  }

  public async editMessageText(options: EditMessageTextOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageText", options as unknown as Record<string, unknown>);
  }

  public async editMessageCaption(options: EditMessageCaptionOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageCaption", options as unknown as Record<string, unknown>);
  }

  public async editMessageMedia(options: EditMessageMediaOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageMedia", options as unknown as Record<string, unknown>);
  }

  public async editMessageReplyMarkup(options: EditMessageReplyMarkupOptions): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageReplyMarkup", options as unknown as Record<string, unknown>);
  }

  public async setMessageReaction(options: SetMessageReactionOptions): Promise<boolean> {
    let reactionPayload: unknown = options.reaction;
    if (typeof options.reaction === "string") {
      reactionPayload = [{ type: "emoji", emoji: options.reaction }];
    } else if (Array.isArray(options.reaction)) {
      reactionPayload = options.reaction.map((r) => (typeof r === "string" ? { type: "emoji", emoji: r } : r));
    } else if (options.reaction && typeof options.reaction === "object") {
      reactionPayload = [options.reaction];
    }
    const payload: Record<string, unknown> = {
      chat_id: options.chat_id,
      message_id: options.message_id,
    };
    if (reactionPayload !== undefined) {
      payload["reaction"] = reactionPayload;
    }
    if (options.is_big !== undefined) {
      payload["is_big"] = options.is_big;
    }
    return this.request<boolean>("setMessageReaction", payload);
  }

  public async deleteMessageReaction(chatId: number | string, messageId: number, isBig?: boolean): Promise<boolean> {
    return this.setMessageReaction({ chat_id: chatId, message_id: messageId, reaction: [], is_big: isBig });
  }

  public async deleteAllMessageReactions(chatId: number | string, messageId: number): Promise<boolean> {
    return this.setMessageReaction({ chat_id: chatId, message_id: messageId, reaction: [] });
  }

  public async getUserProfilePhotos(userId: number, offset?: number, limit?: number): Promise<UserProfilePhotos> {
    const payload: Record<string, unknown> = { user_id: userId };
    if (offset !== undefined) payload["offset"] = offset;
    if (limit !== undefined) payload["limit"] = limit;
    return this.request<UserProfilePhotos>("getUserProfilePhotos", payload);
  }

  public async getFile(fileId: string): Promise<File> {
    return this.request<File>("getFile", { file_id: fileId });
  }

  public async setWebhook(options: SetWebhookOptions): Promise<boolean> {
    return this.request<boolean>("setWebhook", options as unknown as Record<string, unknown>);
  }

  public async deleteWebhook(dropPendingUpdates?: boolean): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (dropPendingUpdates !== undefined) payload["drop_pending_updates"] = dropPendingUpdates;
    return this.request<boolean>("deleteWebhook", payload);
  }

  public async getWebhookInfo(): Promise<WebhookInfo> {
    return this.request<WebhookInfo>("getWebhookInfo");
  }

  public async sendMessageDraft(options: Record<string, unknown>): Promise<boolean> {
    return this.request<boolean>("sendMessageDraft", options);
  }

  public async sendChecklist(options: Record<string, unknown>): Promise<Message> {
    return this.request<Message>("sendChecklist", options);
  }

  public async editMessageChecklist(options: Record<string, unknown>): Promise<Message | boolean> {
    return this.request<Message | boolean>("editMessageChecklist", options);
  }

  public async sendPaidMedia(options: Record<string, unknown>): Promise<Message> {
    return this.request<Message>("sendPaidMedia", options);
  }

  public async sendLivePhoto(options: Record<string, unknown>): Promise<Message> {
    return this.request<Message>("sendLivePhoto", options);
  }

  public async getUserPersonalChatMessages(chatId: number | string, limit?: number): Promise<Message[]> {
    const payload: Record<string, unknown> = { chat_id: chatId };
    if (limit !== undefined) payload["limit"] = limit;
    return this.request<Message[]>("getUserPersonalChatMessages", payload);
  }
}

