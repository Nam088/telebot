/**
 * Fluent builder for constructing Application instances.
 *
 * @packageDocumentation
 */

import { Bot, type BotOptions } from "../client/bot.js";
import { type Persistence } from "../storage/index.js";
import { Application, type ApplicationOptions } from "./app.js";

/**
 * Fluent builder for constructing and configuring {@link Application} instances.
 *
 * @example
 * ```ts
 * const app = new ApplicationBuilder()
 *   .token(process.env.BOT_TOKEN!)
 *   .persistence(new SqlitePersistence({ dbPath: "./data/bot.sqlite" }))
 *   .build();
 * ```
 */
export class ApplicationBuilder {
  private _token?: string;
  private _botOptions?: BotOptions;
  private _appOptions: ApplicationOptions = {};

  /**
   * Sets the Telegram bot token received from BotFather.
   *
   * @param token - The bot token string.
   * @returns This builder instance for chaining.
   */
  public token(token: string): this {
    this._token = token;
    return this;
  }

  /**
   * Configures optional settings for the underlying {@link Bot} client.
   *
   * @param options - Bot options (custom fetch, retry limits, apiRoot).
   * @returns This builder instance for chaining.
   */
  public botOptions(options: BotOptions): this {
    this._botOptions = options;
    return this;
  }

  /**
   * Configures the persistence backend for state management.
   *
   * @param persistence - A {@link Persistence} implementation instance.
   * @returns This builder instance for chaining.
   */
  public persistence(persistence: Persistence): this {
    this._appOptions.persistence = persistence;
    return this;
  }

  /**
   * Constructs and returns the configured {@link Application} instance.
   *
   * @returns The newly created {@link Application}.
   * @throws When the bot token has not been provided.
   */
  public build(): Application {
    if (!this._token) {
      throw new Error("Cannot build Application without bot token.");
    }
    const bot = new Bot(this._token, this._botOptions);
    return new Application(bot, this._appOptions);
  }
}
