/**
 * Callback query and inline query methods for Bot API.
 *
 * @packageDocumentation
 */

import { TopicAndProfileMethods } from "../topics/index.js";
import type { AnswerCallbackQueryOptions, AnswerInlineQueryOptions } from "../../types/index.js";

/**
 * Mixin providing callback queries and inline query handling operations.
 */
export abstract class BusinessQueriesMethods extends TopicAndProfileMethods {
  /**
   * Sends answers to callback queries sent from inline keyboards.
   *
   * @param options - Options including `callback_query_id`, `text`, `show_alert`, `url`, and `cache_time`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When answering callback query fails.
   *
   * @example
   * ```ts
   * await bot.answerCallbackQuery({
   *   callback_query_id: query.id,
   *   text: "Button clicked!",
   *   show_alert: false,
   * });
   * ```
   */
  public async answerCallbackQuery(options: AnswerCallbackQueryOptions): Promise<boolean> {
    return this.request<boolean>(
      "answerCallbackQuery",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Sends answers to an inline query from users.
   *
   * @param options - Options including `inline_query_id`, `results` array, `cache_time`, `is_personal`, `next_offset`, `button`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When answering inline query fails.
   *
   * @remarks
   * Inline mode must be enabled for your bot in Telegram via BotFather (`/setinline`).
   *
   * @example
   * ```ts
   * await bot.answerInlineQuery({
   *   inline_query_id: update.inline_query!.id,
   *   results: [
   *     {
   *       type: "article",
   *       id: "1",
   *       title: "Result Title",
   *       input_message_content: { message_text: "Result content" },
   *     },
   *   ],
   * });
   * ```
   */
  public async answerInlineQuery(options: AnswerInlineQueryOptions): Promise<boolean> {
    return this.request<boolean>(
      "answerInlineQuery",
      options as unknown as Record<string, unknown>,
    );
  }
}
