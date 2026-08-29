/**
 * Keyboard markups and builder utilities for inline and reply keyboards.
 *
 * @packageDocumentation
 */

import type {
  InlineKeyboardButton as RawInlineKeyboardButton,
  InlineKeyboardMarkup as RawInlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  ForceReply,
  KeyboardButton,
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
  InputMedia,
  CallbackGame,
  LoginUrl,
  SwitchInlineQueryChosenChat,
  CopyTextButton,
  DisabledButton,
  WebAppInfo,
} from "../client/types.js";

import type { InputFile } from "../utils/http.js";

export type {
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  ForceReply,
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
 * Options for constructing an {@link InlineKeyboardButton}: every {@link InlineKeyboardButton}
 * field besides `text`, which is passed as the constructor's first argument instead.
 */
export type InlineKeyboardButtonOptions = Omit<RawInlineKeyboardButton, "text">;

/**
 * A single button on an {@link InlineKeyboardMarkup}.
 *
 * @remarks
 * A class-based alternative to the {@link InlineKeyboard} fluent builder, for developers who
 * prefer constructing keyboards as nested rows of `InlineKeyboardButton` instances passed to
 * `InlineKeyboardMarkup`. Both styles produce the same {@link InlineKeyboardMarkup} shape (a plain
 * object literal shaped like {@link InlineKeyboardButton} works too) and can be freely mixed.
 *
 * @example
 * ```ts
 * const keyboard = new InlineKeyboardMarkup([
 *   [
 *     new InlineKeyboardButton("Option 1", { callback_data: "opt_1" }),
 *     new InlineKeyboardButton("Option 2", { callback_data: "opt_2" }),
 *   ],
 *   [new InlineKeyboardButton("Website", { url: "https://example.com" })],
 * ]);
 * ```
 */
export class InlineKeyboardButton implements RawInlineKeyboardButton {
  /** Label text on the button. */
  public readonly text: string;
  /** HTTP or tg:// URL to be opened when the button is pressed. */
  declare public readonly url?: string;
  /** Data to be sent in a callback query to the bot when the button is pressed (1-64 bytes). */
  declare public readonly callback_data?: string;
  /** Description of the Web App that will be launched when the user presses the button. */
  declare public readonly web_app?: WebAppInfo;
  /** An HTTPS URL used to automatically authorize the user. */
  declare public readonly login_url?: LoginUrl;
  /** If set, pressing the button prompts the user to insert the specified inline query. */
  declare public readonly switch_inline_query?: string;
  /** If set, pressing the button inserts the specified inline query in the current chat. */
  declare public readonly switch_inline_query_current_chat?: string;
  /** If set, pressing the button prompts the user to select a chat of the specified type. */
  declare public readonly switch_inline_query_chosen_chat?: SwitchInlineQueryChosenChat;
  /** Description of the button that copies the specified text to the clipboard. */
  declare public readonly copy_text?: CopyTextButton;
  /** Description of the game that will be launched when the user presses the button. */
  declare public readonly callback_game?: CallbackGame;
  /** `true` to send a Pay button; must be the first button of the first row. */
  declare public readonly pay?: boolean;
  /** Style of the button. */
  declare public readonly style?: "danger" | "success" | "primary" | string;
  /** Unique identifier of the custom emoji shown before the text. */
  declare public readonly icon_custom_emoji_id?: string;
  /** If set, then the button is disabled and does nothing (Bot API 10.3+). */
  declare public readonly disabled?: DisabledButton;


  /**
   * Constructs a new {@link InlineKeyboardButton}.
   *
   * @param text - Label text on the button.
   * @param options - Every other {@link InlineKeyboardButton} field, e.g. `callback_data` or `url`.
   */
  constructor(text: string, options: InlineKeyboardButtonOptions = {}) {
    this.text = text;
    Object.assign(this, options);
  }
}

/**
 * Represents an inline keyboard that appears right next to the message it belongs to.
 *
 * @remarks
 * A class-based alternative to the {@link InlineKeyboard} fluent builder, for developers who
 * prefer class-based `InlineKeyboardMarkup(rows)` construction. Both styles
 * produce the same shape and can be freely mixed.
 *
 * @example
 * ```ts
 * const markup = new InlineKeyboardMarkup([
 *   [
 *     new InlineKeyboardButton("Yes", { callback_data: "yes" }),
 *     new InlineKeyboardButton("No", { callback_data: "no" }),
 *   ],
 * ]);
 * await bot.sendMessage({ chat_id: 12345, text: "Confirm?", reply_markup: markup });
 * ```
 */
export class InlineKeyboardMarkup implements RawInlineKeyboardMarkup {
  /** Array of button rows, each an array of {@link InlineKeyboardButton}. */
  public readonly inline_keyboard: RawInlineKeyboardButton[][];

  /**
   * Constructs a new {@link InlineKeyboardMarkup}.
   *
   * @param inline_keyboard - Rows of buttons, as {@link InlineKeyboardButton} instances or
   * plain objects shaped like one.
   */
  constructor(inline_keyboard: RawInlineKeyboardButton[][]) {
    this.inline_keyboard = inline_keyboard;
  }
}

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
    if (
      this.rows.length === 0 ||
      (this.rows[this.rows.length - 1] && this.rows[this.rows.length - 1]!.length > 0)
    ) {
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
