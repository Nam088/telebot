/**
 * Telegram Inline Pagination Keyboard Builder.
 *
 * @packageDocumentation
 */

import type { InlineKeyboardButton, InlineKeyboardMarkup } from "../client/types.js";

/**
 * Customization options for pagination navigation control labels and formatting.
 */
export interface PaginationNavigationLabels {
  /**
   * Label text for the previous page button.
   * Can be a static string or a formatter function `(currentPage, totalPages) => string`.
   * @defaultValue `"Previous"`
   */
  prev?: string | ((currentPage: number, totalPages: number) => string);
  /**
   * Label text for the next page button.
   * Can be a static string or a formatter function `(currentPage, totalPages) => string`.
   * @defaultValue `"Next"`
   */
  next?: string | ((currentPage: number, totalPages: number) => string);
  /**
   * Label text for the middle page indicator button.
   * Can be a static string or a formatter function `(currentPage, totalPages) => string`.
   * @defaultValue `(curr, total) => `${curr} / ${total}``
   */
  pageIndicator?: string | ((currentPage: number, totalPages: number) => string);
  /**
   * Label text displayed when a navigation button is disabled (e.g. on first/last page).
   * @defaultValue `"-"`
   */
  disabled?: string;
  /**
   * Whether to completely hide disabled navigation buttons instead of showing an inactive placeholder.
   * @defaultValue `false`
   */
  hideDisabled?: boolean;
}

/**
 * Options for configuring {@link PaginationKeyboard}.
 *
 * @typeParam T - Type of the item data in the list.
 */
export interface PaginationOptions<T> {
  /** Total items list to paginate over. */
  items: T[];
  /** Current active page index (1-indexed, default: 1). */
  page?: number;
  /** Number of items displayed per page (default: 5). */
  pageSize?: number;
  /** Function returning an {@link InlineKeyboardButton} for each item. */
  itemButton: (item: T, index: number) => InlineKeyboardButton;
  /** Callback data generator for page navigation actions. */
  callbackData?: (action: "prev" | "next" | "noop", page: number) => string;
  /** Custom labels and formatting for navigation buttons. */
  navigation?: PaginationNavigationLabels;
}

/**
 * Fluent builder for creating paginated {@link InlineKeyboardMarkup} menus.
 *
 * @example
 * ```ts
 * const products = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];
 * const keyboard = new PaginationKeyboard({
 *   items: products,
 *   page: 1,
 *   pageSize: 3,
 *   itemButton: (product) => ({ text: product, callback_data: `buy:${product}` }),
 *   callbackData: (action, targetPage) => `page:${targetPage}`,
 *   navigation: {
 *     prev: "Previous",
 *     next: "Next",
 *     pageIndicator: (curr, total) => `Page ${curr} of ${total}`,
 *   },
 * });
 *
 * await bot.sendMessage({
 *   chat_id: 12345,
 *   text: "Store Catalog:",
 *   reply_markup: keyboard.build(),
 * });
 * ```
 */
export class PaginationKeyboard<T = unknown> {
  private readonly items: T[];
  private readonly page: number;
  private readonly pageSize: number;
  private readonly itemButton: (item: T, index: number) => InlineKeyboardButton;
  private readonly callbackData: (action: "prev" | "next" | "noop", page: number) => string;
  private readonly navigation: PaginationNavigationLabels;

  /**
   * Constructs a new {@link PaginationKeyboard} instance.
   *
   * @param options - Configuration options for items, page size, and button mapping.
   */
  constructor(options: PaginationOptions<T>) {
    this.items = options.items;
    this.pageSize = Math.max(1, options.pageSize ?? 5);
    this.page = Math.max(1, options.page ?? 1);
    this.itemButton = options.itemButton;
    this.callbackData =
      options.callbackData ?? ((action, targetPage) => `pagination:${action}:${targetPage}`);
    this.navigation = options.navigation ?? {};
  }

  /**
   * Calculates the total number of pages.
   */
  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.items.length / this.pageSize));
  }

  /**
   * Gets the active page clamped between 1 and totalPages.
   */
  public get currentPage(): number {
    return Math.min(this.page, this.totalPages);
  }

  private resolveLabel(
    label: string | ((curr: number, total: number) => string) | undefined,
    fallback: string | ((curr: number, total: number) => string),
    current: number,
    total: number,
  ): string {
    const target = label ?? fallback;
    return typeof target === "function" ? target(current, total) : target;
  }

  /**
   * Builds the final {@link InlineKeyboardMarkup} structure with item buttons and navigation row.
   *
   * @returns Constructed {@link InlineKeyboardMarkup}.
   */
  public build(): InlineKeyboardMarkup {
    const total = this.totalPages;
    const current = this.currentPage;

    const startIndex = (current - 1) * this.pageSize;
    const pageItems = this.items.slice(startIndex, startIndex + this.pageSize);

    const inline_keyboard: InlineKeyboardButton[][] = pageItems.map((item, idx) => [
      this.itemButton(item, startIndex + idx),
    ]);

    // Navigation control row
    if (total > 1) {
      const navRow: InlineKeyboardButton[] = [];
      const disabledPlaceholder = this.navigation.disabled ?? "-";
      const hideDisabled = this.navigation.hideDisabled ?? false;

      // 1. Previous button
      if (current > 1) {
        const prevText = this.resolveLabel(this.navigation.prev, "Previous", current, total);
        navRow.push({
          text: prevText,
          callback_data: this.callbackData("prev", current - 1),
        });
      } else if (!hideDisabled) {
        navRow.push({
          text: disabledPlaceholder,
          callback_data: this.callbackData("noop", current),
        });
      }

      // 2. Page indicator button
      const indicatorText = this.resolveLabel(
        this.navigation.pageIndicator,
        (curr, tot) => `${curr} / ${tot}`,
        current,
        total,
      );
      navRow.push({
        text: indicatorText,
        callback_data: this.callbackData("noop", current),
      });

      // 3. Next button
      if (current < total) {
        const nextText = this.resolveLabel(this.navigation.next, "Next", current, total);
        navRow.push({
          text: nextText,
          callback_data: this.callbackData("next", current + 1),
        });
      } else if (!hideDisabled) {
        navRow.push({
          text: disabledPlaceholder,
          callback_data: this.callbackData("noop", current),
        });
      }

      inline_keyboard.push(navRow);
    }

    return { inline_keyboard };
  }
}
