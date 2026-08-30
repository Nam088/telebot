/**
 * Rich message, ephemeral messages, and request methods for Bot API.
 *
 * @packageDocumentation
 */

import { BusinessGiftsMethods } from "./gifts.js";
import type {
  Message,
  SendRichMessageOptions,
  SendRichMessageDraftOptions,
  EditEphemeralMessageTextOptions,
  EditEphemeralMessageMediaOptions,
  EditEphemeralMessageCaptionOptions,
  EditEphemeralMessageReplyMarkupOptions,
  DeleteEphemeralMessageOptions,
  AnswerChatJoinRequestQueryOptions,
  SendChatJoinRequestWebAppOptions,
} from "../../types/index.js";

/**
 * Mixin providing rich messages, ephemeral messages, and low-level API operations.
 */
export abstract class BusinessEphemeralMethods extends BusinessGiftsMethods {
  /**
   * Sends a structured rich formatted message (Bot API 10.1+).
   *
   * @param options - Rich message options including `chat_id` and `rich_message`.
   * @returns The sent {@link Message}.
   *
   * @see {@link https://core.telegram.org/bots/api#sendrichmessage Telegram Bot API: sendRichMessage}
   */
  public async sendRichMessage(options: SendRichMessageOptions): Promise<Message> {
    return this.request<Message>("sendRichMessage", options as unknown as Record<string, unknown>);
  }

  /**
   * Streams a draft of a rich formatted message (Bot API 10.1+).
   *
   * @param options - Rich message draft options.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#sendrichmessagedraft Telegram Bot API: sendRichMessageDraft}
   */
  public async sendRichMessageDraft(options: SendRichMessageDraftOptions): Promise<boolean> {
    return this.request<boolean>(
      "sendRichMessageDraft",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits an ephemeral message text (Bot API 10.2+).
   *
   * @param options - Ephemeral message edit options.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#editephemeralmessagetext Telegram Bot API: editEphemeralMessageText}
   */
  public async editEphemeralMessageText(
    options: EditEphemeralMessageTextOptions,
  ): Promise<boolean> {
    return this.request<boolean>(
      "editEphemeralMessageText",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits an ephemeral message media (Bot API 10.3+).
   *
   * @param options - Ephemeral message media edit options.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#editephemeralmessagemedia Telegram Bot API: editEphemeralMessageMedia}
   */
  public async editEphemeralMessageMedia(
    options: EditEphemeralMessageMediaOptions,
  ): Promise<boolean> {
    return this.request<boolean>(
      "editEphemeralMessageMedia",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits an ephemeral message caption (Bot API 10.3+).
   *
   * @param options - Ephemeral message caption edit options.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#editephemeralmessagecaption Telegram Bot API: editEphemeralMessageCaption}
   */
  public async editEphemeralMessageCaption(
    options: EditEphemeralMessageCaptionOptions,
  ): Promise<boolean> {
    return this.request<boolean>(
      "editEphemeralMessageCaption",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits an ephemeral message reply markup (Bot API 10.3+).
   *
   * @param options - Ephemeral message reply markup edit options.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#editephemeralmessagereplymarkup Telegram Bot API: editEphemeralMessageReplyMarkup}
   */
  public async editEphemeralMessageReplyMarkup(
    options: EditEphemeralMessageReplyMarkupOptions,
  ): Promise<boolean> {
    return this.request<boolean>(
      "editEphemeralMessageReplyMarkup",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Deletes an ephemeral message (Bot API 10.2+).
   *
   * @param optionsOrChatId - Options object or chat identifier.
   * @param receiverUserId - Receiver user identifier when passing positional arguments.
   * @param ephemeralMessageId - Ephemeral message identifier when passing positional arguments.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#deleteephemeralmessage Telegram Bot API: deleteEphemeralMessage}
   */
  public async deleteEphemeralMessage(
    optionsOrChatId: DeleteEphemeralMessageOptions | number | string,
    receiverUserId?: number,
    ephemeralMessageId?: number,
  ): Promise<boolean> {
    if (typeof optionsOrChatId === "object") {
      return this.request<boolean>(
        "deleteEphemeralMessage",
        optionsOrChatId as unknown as Record<string, unknown>,
      );
    }
    return this.request<boolean>("deleteEphemeralMessage", {
      chat_id: optionsOrChatId,
      receiver_user_id: receiverUserId,
      ephemeral_message_id: ephemeralMessageId,
    });
  }

  /**
   * Answers a chat join request query from a user (Bot API 10.1+).
   *
   * @param options - Query response options.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#answerchatjoinrequestquery Telegram Bot API: answerChatJoinRequestQuery}
   */
  public async answerChatJoinRequestQuery(
    options: AnswerChatJoinRequestQueryOptions,
  ): Promise<boolean> {
    return this.request<boolean>(
      "answerChatJoinRequestQuery",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Sends a Web App for a chat join request (Bot API 10.1+).
   *
   * @param options - Join request Web App options.
   * @returns `true` on success.
   *
   * @see {@link https://core.telegram.org/bots/api#sendchatjoinrequestwebapp Telegram Bot API: sendChatJoinRequestWebApp}
   */
  public async sendChatJoinRequestWebApp(
    options: SendChatJoinRequestWebAppOptions,
  ): Promise<boolean> {
    return this.request<boolean>(
      "sendChatJoinRequestWebApp",
      options as unknown as Record<string, unknown>,
    );
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
