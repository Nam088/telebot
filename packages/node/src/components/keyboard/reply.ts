/**
 * Reply keyboard markup and fluent builder.
 *
 * @packageDocumentation
 */

import type { ReplyKeyboardMarkup, KeyboardButton } from "../../client/types.js";

/**
 * Configuration options for {@link ReplyKeyboard}.
 */
export interface ReplyKeyboardOptions {
  /**
   * Requests clients to resize the keyboard vertically for optimal fit.
   *
   * @defaultValue `false`
   */
  resize_keyboard?: boolean;
  /**
   * Requests clients to hide the keyboard as soon as it's been used.
   *
   * @defaultValue `false`
   */
  one_time_keyboard?: boolean;
  /**
   * Requests clients to always show the keyboard when the regular keyboard is hidden.
   *
   * @defaultValue `false`
   */
  is_persistent?: boolean;
  /**
   * Placeholder to be shown in the input field when the keyboard is active.
   */
  input_field_placeholder?: string;
  /**
   * Use this parameter if you want to show the keyboard to specific users only.
   */
  selective?: boolean;
}

/**
 * Fluent builder for creating {@link ReplyKeyboardMarkup} objects.
 *
 * @example
 * ```ts
 * const keyboard = new ReplyKeyboard({ resize_keyboard: true })
 *   .text("Option A")
 *   .text("Option B")
 *   .row()
 *   .requestLocation("Share Location");
 *
 * await bot.sendMessage({
 *   chat_id: 12345,
 *   text: "Make a selection:",
 *   reply_markup: keyboard.build(),
 * });
 * ```
 */
export class ReplyKeyboard {
  private readonly rows: KeyboardButton[][] = [[]];
  private readonly options: ReplyKeyboardOptions;

  /**
   * Constructs a new {@link ReplyKeyboard} builder instance.
   *
   * @param options - Optional settings for reply keyboard presentation.
   */
  constructor(options: ReplyKeyboardOptions = {}) {
    this.options = options;
  }

  /**
   * Appends a plain text button to the current row.
   *
   * @param text - Text sent to the bot as a message when the button is pressed.
   * @returns This {@link ReplyKeyboard} instance for chaining.
   */
  public text(text: string): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text });
    }
    return this;
  }

  /**
   * Appends a button that prompts the user to share their contact.
   *
   * @param text - Button label text.
   * @returns This {@link ReplyKeyboard} instance for chaining.
   */
  public requestContact(text: string): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, request_contact: true });
    }
    return this;
  }

  /**
   * Appends a button that prompts the user to share their location.
   *
   * @param text - Button label text.
   * @returns This {@link ReplyKeyboard} instance for chaining.
   */
  public requestLocation(text: string): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, request_location: true });
    }
    return this;
  }

  /**
   * Appends a button that prompts the user to create and send a poll.
   *
   * @param text - Button label text.
   * @param type - Optional poll type restriction (`"quiz"` or `"regular"`).
   * @returns This {@link ReplyKeyboard} instance for chaining.
   */
  public requestPoll(text: string, type?: "quiz" | "regular"): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, request_poll: { type } });
    }
    return this;
  }

  /**
   * Appends a button that launches a Telegram Mini App Web App.
   *
   * @param text - Button label text.
   * @param url - HTTPS URL of the Web App.
   * @returns This {@link ReplyKeyboard} instance for chaining.
   */
  public webApp(text: string, url: string): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, web_app: { url } });
    }
    return this;
  }

  /**
   * Appends a button that prompts the user to select one or more users.
   *
   * @param text - Button label text.
   * @param requestId - Signed 32-bit identifier of the request.
   * @param options - Additional user selection filters.
   * @returns This {@link ReplyKeyboard} instance for chaining.
   */
  public requestUsers(
    text: string,
    requestId: number,
    options: {
      user_is_bot?: boolean;
      user_is_premium?: boolean;
      max_quantity?: number;
      request_name?: boolean;
      request_username?: boolean;
      request_photo?: boolean;
    } = {},
  ): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({
        text,
        request_users: {
          request_id: requestId,
          ...options,
        },
      });
    }
    return this;
  }

  /**
   * Appends a button that prompts the user to select a chat.
   *
   * @param text - Button label text.
   * @param requestId - Signed 32-bit identifier of the request.
   * @param chatIsChannel - Pass `true` to request a channel chat, `false` for a group.
   * @param options - Additional chat selection criteria.
   * @returns This {@link ReplyKeyboard} instance for chaining.
   */
  public requestChat(
    text: string,
    requestId: number,
    chatIsChannel: boolean,
    options: {
      chat_is_forum?: boolean;
      chat_has_username?: boolean;
      chat_is_created?: boolean;
      bot_is_member?: boolean;
      request_title?: boolean;
      request_username?: boolean;
      request_photo?: boolean;
    } = {},
  ): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({
        text,
        request_chat: {
          request_id: requestId,
          chat_is_channel: chatIsChannel,
          ...options,
        },
      });
    }
    return this;
  }

  /**
   * Advances the builder to start a new keyboard row.
   *
   * @returns This {@link ReplyKeyboard} instance for chaining.
   */
  public row(): this {
    if (
      this.rows.length === 0 ||
      (this.rows[this.rows.length - 1] && this.rows[this.rows.length - 1]!.length > 0)
    ) {
      this.rows.push([]);
    }
    return this;
  }

  /**
   * Builds and returns the final {@link ReplyKeyboardMarkup} structure.
   *
   * @returns The constructed {@link ReplyKeyboardMarkup}.
   */
  public build(): ReplyKeyboardMarkup {
    const keyboard = this.rows.filter((row) => row.length > 0);
    return {
      keyboard,
      resize_keyboard: this.options.resize_keyboard,
      one_time_keyboard: this.options.one_time_keyboard,
      is_persistent: this.options.is_persistent,
      input_field_placeholder: this.options.input_field_placeholder,
      selective: this.options.selective,
    };
  }
}
