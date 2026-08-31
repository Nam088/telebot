/**
 * Keyboard markups and builder utilities for inline and reply keyboards.
 *
 * @packageDocumentation
 */

import type {
  InlineKeyboardButton as RawInlineKeyboardButton,
  InlineKeyboardMarkup as RawInlineKeyboardMarkup,
  CallbackGame,
  LoginUrl,
  SwitchInlineQueryChosenChat,
  CopyTextButton,
  DisabledButton,
  WebAppInfo,
} from "../../client/types.js";

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
 *
 * @see {@link https://core.telegram.org/bots/api#inlinekeyboardbutton Telegram Bot API: InlineKeyboardButton}
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
 *
 * @see {@link https://core.telegram.org/bots/api#inlinekeyboardmarkup Telegram Bot API: InlineKeyboardMarkup}
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
