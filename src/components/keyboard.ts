/**
 * Keyboard markups and builder utilities for inline and reply keyboards.
 *
 * @packageDocumentation
 */

import type {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  ForceReply,
  InlineKeyboardButton,
  KeyboardButton,
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
  InputMedia,
} from "../client/types.js";
import type { InputFile } from "../utils/http.js";

export type {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  ForceReply,
  InlineKeyboardButton,
  KeyboardButton,
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
  InputMedia,
  InputFile,
};

/**
 * Fluent builder for creating {@link InlineKeyboardMarkup} objects.
 *
 * @example
 * ```ts
 * const keyboard = new InlineKeyboard()
 *   .text("Option 1", "opt_1")
 *   .text("Option 2", "opt_2")
 *   .row()
 *   .url("Website", "https://example.com");
 *
 * await bot.sendMessage({
 *   chat_id: 12345,
 *   text: "Choose an option:",
 *   reply_markup: keyboard.build(),
 * });
 * ```
 */
export class InlineKeyboard {
  private readonly rows: InlineKeyboardButton[][] = [[]];

  /**
   * Appends a callback button to the current row.
   *
   * @param text - Label text on the button.
   * @param callbackData - Data to be sent in a callback query to the bot when pressed.
   * @returns This {@link InlineKeyboard} instance for chaining.
   */
  public text(text: string, callbackData: string): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, callback_data: callbackData });
    }
    return this;
  }

  /**
   * Appends an HTTP URL button to the current row.
   *
   * @param text - Label text on the button.
   * @param url - HTTP or tg:// URL to be opened when the button is pressed.
   * @returns This {@link InlineKeyboard} instance for chaining.
   */
  public url(text: string, url: string): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, url });
    }
    return this;
  }

  /**
   * Appends a Web App button to the current row.
   *
   * @param text - Label text on the button.
   * @param url - HTTPS URL of a Web App to be opened.
   * @returns This {@link InlineKeyboard} instance for chaining.
   */
  public webApp(text: string, url: string): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, web_app: { url } });
    }
    return this;
  }

  /**
   * Appends an inline query button to the current row.
   *
   * @param text - Label text on the button.
   * @param query - Inline query string inserted in the chat input field.
   * @returns This {@link InlineKeyboard} instance for chaining.
   */
  public switchInlineQuery(text: string, query: string = ""): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, switch_inline_query: query });
    }
    return this;
  }

  /**
   * Appends an inline query button for the current chat to the current row.
   *
   * @param text - Label text on the button.
   * @param query - Inline query string inserted in the current chat.
   * @returns This {@link InlineKeyboard} instance for chaining.
   */
  public switchInlineQueryCurrentChat(text: string, query: string = ""): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, switch_inline_query_current_chat: query });
    }
    return this;
  }

  /**
   * Appends a copy text button to the current row.
   *
   * @param text - Label text on the button.
   * @param copyText - Text to be copied to the clipboard.
   * @returns This {@link InlineKeyboard} instance for chaining.
   */
  public copyText(text: string, copyText: string): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({ text, copy_text: { text: copyText } });
    }
    return this;
  }

  /**
   * Advances the builder to start a new keyboard row.
   *
   * @returns This {@link InlineKeyboard} instance for chaining.
   */
  public row(): this {
    if (this.rows.length === 0 || (this.rows[this.rows.length - 1] && this.rows[this.rows.length - 1]!.length > 0)) {
      this.rows.push([]);
    }
    return this;
  }

  /**
   * Builds and returns the final {@link InlineKeyboardMarkup} structure.
   *
   * @returns The constructed {@link InlineKeyboardMarkup}.
   */
  public build(): InlineKeyboardMarkup {
    const inline_keyboard = this.rows.filter((row) => row.length > 0);
    return { inline_keyboard };
  }
}

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
   * Advances the builder to start a new keyboard row.
   *
   * @returns This {@link ReplyKeyboard} instance for chaining.
   */
  public row(): this {
    if (this.rows.length === 0 || (this.rows[this.rows.length - 1] && this.rows[this.rows.length - 1]!.length > 0)) {
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
