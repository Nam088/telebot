/**
 * HTML Widget and Widget Query methods for Bot API 10.4+.
 *
 * @packageDocumentation
 */

import { BusinessEphemeralMethods } from "./ephemeral.js";
import type {
  AnswerWidgetQueryOptions,
  EditMessageWidgetDataOptions,
  EditSharedWidgetDataOptions,
  Message,
  SendSharedWidgetOptions,
  SendWidgetOptions,
} from "../../types/index.js";

/**
 * Mixin providing HTML widget sending, querying, and editing operations.
 */
export abstract class BusinessWidgetsMethods extends BusinessEphemeralMethods {
  /**
   * Sends a message with an HTML widget.
   *
   * @param options - Widget options including `chat_id` and `html`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendWidget({
   *   chat_id: 123456,
   *   html: "<div>Hello Widget</div>",
   *   width: 320,
   *   height: 200,
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#sendwidget Telegram Bot API: sendWidget}
   */
  public async sendWidget(options: SendWidgetOptions): Promise<Message> {
    return this.request<Message>("sendWidget", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends again a shared widget created by the bot.
   *
   * @param options - Shared widget options including `chat_id` and `widget_id`.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending fails.
   *
   * @example
   * ```ts
   * await bot.sendSharedWidget({
   *   chat_id: 123456,
   *   widget_id: "shared_widget_id",
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#sendsharedwidget Telegram Bot API: sendSharedWidget}
   */
  public async sendSharedWidget(options: SendSharedWidgetOptions): Promise<Message> {
    return this.request<Message>("sendSharedWidget", options as unknown as Record<string, unknown>);
  }

  /**
   * Sends an answer to a query from a widget.
   *
   * @param options - Answer options including `widget_query_id`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When answering fails.
   *
   * @example
   * ```ts
   * await bot.answerWidgetQuery({ widget_query_id: "query_1", data: "ok" });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#answerwidgetquery Telegram Bot API: answerWidgetQuery}
   */
  public async answerWidgetQuery(options: AnswerWidgetQueryOptions): Promise<boolean> {
    return this.request<boolean>(
      "answerWidgetQuery",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits data of a widget in a message sent by the bot or via the bot.
   *
   * @param options - Widget data edit options.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When editing fails.
   *
   * @example
   * ```ts
   * await bot.editMessageWidgetData({
   *   chat_id: 123456,
   *   message_id: 42,
   *   public_data: '{"count":1}',
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#editmessagewidgetdata Telegram Bot API: editMessageWidgetData}
   */
  public async editMessageWidgetData(options: EditMessageWidgetDataOptions): Promise<boolean> {
    return this.request<boolean>(
      "editMessageWidgetData",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits public data of a shared widget created by the bot.
   *
   * @param options - Shared widget data edit options including `widget_id` and `public_data`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When editing fails.
   *
   * @example
   * ```ts
   * await bot.editSharedWidgetData({
   *   widget_id: "shared_widget_id",
   *   public_data: '{"count":2}',
   * });
   * ```
   *
   * @see {@link https://core.telegram.org/bots/api#editsharedwidgetdata Telegram Bot API: editSharedWidgetData}
   */
  public async editSharedWidgetData(options: EditSharedWidgetDataOptions): Promise<boolean> {
    return this.request<boolean>(
      "editSharedWidgetData",
      options as unknown as Record<string, unknown>,
    );
  }
}
