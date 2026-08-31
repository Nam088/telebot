/**
 * Games, high scores, and Telegram Passport methods for Bot API.
 *
 * @packageDocumentation
 */

import { BusinessQueriesMethods } from "./queries.js";
import type { Message, GameHighScore, PassportElementError } from "../../types/index.js";

/**
 * Mixin providing games, game scores, and Telegram Passport operations.
 */
export abstract class BusinessGamesPassportMethods extends BusinessQueriesMethods {
  /**
   * Sends a game to a chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param gameShortName - Short name of the game, serves as the unique identifier for the game. Set up via BotFather.
   * @param options - Additional parameters for sending game.
   * @returns The sent {@link Message}.
   * @throws {@link TelegramApiError} When sending game fails.
   *
   * @see {@link https://core.telegram.org/bots/api#sendgame Telegram Bot API: sendGame}
   */
  public async sendGame(
    chatId: number | string,
    gameShortName: string,
    options: {
      business_connection_id?: string;
      message_thread_id?: number;
      disable_notification?: boolean;
      protect_content?: boolean;
      allow_paid_broadcast?: boolean;
      message_effect_id?: string;
      reply_markup?: unknown;
    } = {},
  ): Promise<Message> {
    return this.request<Message>("sendGame", {
      chat_id: chatId,
      game_short_name: gameShortName,
      ...options,
    });
  }

  /**
   * Sets the score of the specified user in a game.
   *
   * @param userId - User identifier.
   * @param score - New score, must be non-negative.
   * @param options - Additional parameters including target message coordinates.
   * @returns The edited {@link Message} or `true`.
   * @throws {@link TelegramApiError} When setting score fails.
   *
   * @see {@link https://core.telegram.org/bots/api#setgamescore Telegram Bot API: setGameScore}
   */
  public async setGameScore(
    userId: number,
    score: number,
    options: {
      force?: boolean;
      disable_edit_message?: boolean;
      chat_id?: number | string;
      message_id?: number;
      inline_message_id?: string;
    } = {},
  ): Promise<Message | boolean> {
    return this.request<Message | boolean>("setGameScore", {
      user_id: userId,
      score,
      ...options,
    });
  }

  /**
   * Retrieves high score tables for a game.
   *
   * @param userId - Target user identifier.
   * @param options - Target message coordinates.
   * @returns Array of {@link GameHighScore} objects.
   * @throws {@link TelegramApiError} When retrieving scores fails.
   *
   * @see {@link https://core.telegram.org/bots/api#getgamehighscores Telegram Bot API: getGameHighScores}
   */
  public async getGameHighScores(
    userId: number,
    options: {
      chat_id?: number | string;
      message_id?: number;
      inline_message_id?: string;
    } = {},
  ): Promise<GameHighScore[]> {
    return this.request<GameHighScore[]>("getGameHighScores", {
      user_id: userId,
      ...options,
    });
  }

  /**
   * Informs a user that some of the Telegram Passport elements they provided contains errors.
   *
   * @param userId - User identifier.
   * @param errors - Array describing the errors in the elements.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When reporting errors fails.
   *
   * @see {@link https://core.telegram.org/bots/api#setpassportdataerrors Telegram Bot API: setPassportDataErrors}
   */
  public async setPassportDataErrors(
    userId: number,
    errors: PassportElementError[],
  ): Promise<boolean> {
    return this.request<boolean>("setPassportDataErrors", {
      user_id: userId,
      errors,
    });
  }
}
