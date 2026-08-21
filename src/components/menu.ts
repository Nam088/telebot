/**
 * Interactive nested inline menu system with dynamic navigation and callback routing.
 *
 * @packageDocumentation
 */

import type { InlineKeyboardMarkup, InlineKeyboardButton } from "../client/types.js";
import type { CallbackContext, MenuContextControl } from "../kernel/context.js";
import type { MiddlewareFn } from "../kernel/dispatcher.js";

/**
 * Dynamic label evaluator function for menu buttons.
 */
export type MenuLabel = string | ((ctx: CallbackContext) => string | Promise<string>);

/**
 * Click handler callback invoked when a menu button is pressed.
 */
export type MenuButtonHandler = (ctx: CallbackContext) => Promise<void> | void;

/**
 * Navigation hook callback invoked during menu transitions.
 */
export type MenuNavigationHandler = (ctx: CallbackContext) => Promise<void> | void;

/**
 * Internal representation of a menu button item.
 */
type MenuButtonItem =
  | {
      type: "text";
      label: MenuLabel;
      handler: MenuButtonHandler;
    }
  | {
      type: "submenu";
      label: MenuLabel;
      targetMenu: Menu;
      onNavigate?: MenuNavigationHandler;
    }
  | {
      type: "back";
      label: MenuLabel;
      onNavigate?: MenuNavigationHandler;
    }
  | {
      type: "url";
      label: MenuLabel;
      url: string;
    };

/**
 * Interactive, composable inline keyboard menu component.
 *
 * Supports multi-level nested menus, dynamic labels, button click handlers,
 * in-place message navigation, and automatic middleware routing.
 *
 * @example
 * ```ts
 * const mainMenu = new Menu("main")
 *   .text("Profile", async (ctx) => {
 *     await ctx.reply("Opening profile...");
 *   })
 *   .row();
 *
 * const settingsMenu = new Menu("settings")
 *   .text("Toggle Dark Mode", async (ctx) => {
 *     await ctx.answerCallbackQuery({ text: "Dark mode toggled!" });
 *   })
 *   .row()
 *   .back();
 *
 * mainMenu.submenu("Settings", settingsMenu);
 *
 * app.use(mainMenu);
 * ```
 */
export class Menu {
  /**
   * Unique string identifier for this menu.
   */
  public readonly id: string;

  /**
   * Reference to the parent {@link Menu} if this instance is a submenu.
   */
  public parent?: Menu;

  /**
   * Internal 2D grid of button rows.
   */
  private readonly rows: MenuButtonItem[][] = [[]];

  /**
   * Registered child submenus indexed by their menu ID.
   */
  private readonly submenus = new Map<string, Menu>();

  /**
   * Constructs a new {@link Menu} instance.
   *
   * @param id - Unique string identifier for the menu.
   */
  constructor(id: string) {
    if (!id || id.trim().length === 0) {
      throw new TypeError("Menu id must be a non-empty string.");
    }
    this.id = id.trim();
  }

  /**
   * Appends an interactive callback button with a click handler to the current row.
   *
   * @param label - Static string label or dynamic label function.
   * @param handler - Callback function executed when the button is clicked.
   * @returns This {@link Menu} instance for chaining.
   *
   * @example
   * ```ts
   * menu.text("Click Me", async (ctx) => {
   *   await ctx.reply("Button clicked!");
   * });
   * ```
   */
  public text(label: MenuLabel, handler: MenuButtonHandler): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({
        type: "text",
        label,
        handler,
      });
    }
    return this;
  }

  /**
   * Advances the menu builder to start a new row of buttons.
   *
   * @returns This {@link Menu} instance for chaining.
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
   * Appends a navigation button leading to a child {@link Menu}.
   *
   * @param label - Static string label or dynamic label function.
   * @param targetMenu - The destination submenu to open.
   * @param onNavigate - Optional callback hook executed before switching menus.
   * @returns This {@link Menu} instance for chaining.
   *
   * @example
   * ```ts
   * menu.submenu("Preferences", preferencesMenu);
   * ```
   */
  public submenu(label: MenuLabel, targetMenu: Menu, onNavigate?: MenuNavigationHandler): this {
    targetMenu.parent = this;
    this.submenus.set(targetMenu.id, targetMenu);

    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({
        type: "submenu",
        label,
        targetMenu,
        onNavigate,
      });
    }
    return this;
  }

  /**
   * Appends a back button that returns to the parent menu.
   *
   * @param label - Button label text (default: `"Back"`).
   * @param onNavigate - Optional callback hook executed before navigating back.
   * @returns This {@link Menu} instance for chaining.
   *
   * @example
   * ```ts
   * subMenu.back("Go Back");
   * ```
   */
  public back(label: MenuLabel = "Back", onNavigate?: MenuNavigationHandler): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({
        type: "back",
        label,
        onNavigate,
      });
    }
    return this;
  }

  /**
   * Appends an external URL button to the current row.
   *
   * @param label - Static string label or dynamic label function.
   * @param url - HTTP or tg:// URL opened when the button is clicked.
   * @returns This {@link Menu} instance for chaining.
   */
  public url(label: MenuLabel, url: string): this {
    const currentRow = this.rows[this.rows.length - 1];
    if (currentRow) {
      currentRow.push({
        type: "url",
        label,
        url,
      });
    }
    return this;
  }

  /**
   * Synchronously builds the {@link InlineKeyboardMarkup} for this menu.
   *
   * @param ctx - Optional {@link CallbackContext} for dynamic label resolution.
   * @returns Constructed inline keyboard markup.
   *
   * @example
   * ```ts
   * await ctx.reply("Choose an option:", {
   *   reply_markup: menu.build(ctx),
   * });
   * ```
   */
  public build(ctx?: CallbackContext): InlineKeyboardMarkup {
    const inline_keyboard: InlineKeyboardButton[][] = [];

    for (let r = 0; r < this.rows.length; r++) {
      const row = this.rows[r];
      if (!row || row.length === 0) continue;

      const keyboardRow: InlineKeyboardButton[] = [];
      for (let c = 0; c < row.length; c++) {
        const item = row[c]!;
        let text: string;
        if (typeof item.label === "function") {
          try {
            const res = item.label(ctx as CallbackContext);
            text = typeof res === "string" ? res : "";
          } catch {
            text = "";
          }
        } else {
          text = item.label;
        }

        switch (item.type) {
          case "text":
            keyboardRow.push({
              text,
              callback_data: `m:${this.id}:b:${r}:${c}`,
            });
            break;
          case "submenu":
            keyboardRow.push({
              text,
              callback_data: `m:${this.id}:s:${item.targetMenu.id}:${r}:${c}`,
            });
            break;
          case "back":
            keyboardRow.push({
              text,
              callback_data: `m:${this.id}:k:${r}:${c}`,
            });
            break;
          case "url":
            keyboardRow.push({
              text,
              url: item.url,
            });
            break;
        }
      }

      if (keyboardRow.length > 0) {
        inline_keyboard.push(keyboardRow);
      }
    }

    return { inline_keyboard };
  }

  /**
   * Asynchronously renders the {@link InlineKeyboardMarkup}, resolving any async dynamic labels.
   *
   * @param ctx - Optional {@link CallbackContext} for dynamic label evaluation.
   * @returns Resolves with the constructed {@link InlineKeyboardMarkup}.
   */
  public async render(ctx?: CallbackContext): Promise<InlineKeyboardMarkup> {
    const inline_keyboard: InlineKeyboardButton[][] = [];

    for (let r = 0; r < this.rows.length; r++) {
      const row = this.rows[r];
      if (!row || row.length === 0) continue;

      const keyboardRow: InlineKeyboardButton[] = [];
      for (let c = 0; c < row.length; c++) {
        const item = row[c]!;
        let text: string;
        if (typeof item.label === "function") {
          try {
            const res = await item.label(ctx as CallbackContext);
            text = typeof res === "string" ? res : "";
          } catch {
            text = "";
          }
        } else {
          text = item.label;
        }

        switch (item.type) {
          case "text":
            keyboardRow.push({
              text,
              callback_data: `m:${this.id}:b:${r}:${c}`,
            });
            break;
          case "submenu":
            keyboardRow.push({
              text,
              callback_data: `m:${this.id}:s:${item.targetMenu.id}:${r}:${c}`,
            });
            break;
          case "back":
            keyboardRow.push({
              text,
              callback_data: `m:${this.id}:k:${r}:${c}`,
            });
            break;
          case "url":
            keyboardRow.push({
              text,
              url: item.url,
            });
            break;
        }
      }

      if (keyboardRow.length > 0) {
        inline_keyboard.push(keyboardRow);
      }
    }

    return { inline_keyboard };
  }

  /**
   * Finds a menu instance by its identifier anywhere in this menu's hierarchy.
   *
   * @param menuId - Identifier of the menu to locate.
   * @param visited - Internal set of visited menus to avoid cycles.
   * @returns The matching {@link Menu} instance or `undefined`.
   */
  public findMenu(menuId: string, visited: Set<Menu> = new Set()): Menu | undefined {
    if (visited.has(this)) return undefined;
    visited.add(this);

    if (this.id === menuId) return this;

    for (const sub of this.submenus.values()) {
      const found = sub.findMenu(menuId, visited);
      if (found) return found;
    }

    if (this.parent) {
      return this.parent.findMenu(menuId, visited);
    }

    return undefined;
  }

  /**
   * Creates a {@link MiddlewareFn} that automatically intercepts matching callback queries,
   * dispatches button handlers, and performs in-place menu navigation.
   *
   * @returns A middleware function for use with `app.use()`.
   */
  public middleware(): MiddlewareFn {
    return async (ctx: CallbackContext, next: () => Promise<void>): Promise<void> => {
      const data = ctx.update?.callback_query?.data;
      if (!data || !data.startsWith("m:")) {
        return next();
      }

      const parts = data.split(":");
      const targetMenuId = parts[1];
      const action = parts[2];

      if (!targetMenuId || !action) {
        return next();
      }

      const menu = this.findMenu(targetMenuId);
      if (!menu) {
        return next();
      }

      const rowIndex = Number(parts[parts.length - 2]);
      const colIndex = Number(parts[parts.length - 1]);
      const buttonItem = menu.rows[rowIndex]?.[colIndex];

      if (!buttonItem) {
        return next();
      }

      const chatId = ctx.update?.effective_chat?.id;
      const messageId = ctx.update?.effective_message?.message_id;

      const menuControl: MenuContextControl = {
        update: async (): Promise<void> => {
          if (chatId && messageId) {
            const updatedMarkup = await menu.render(ctx);
            try {
              await ctx.bot.editMessageReplyMarkup({
                chat_id: chatId,
                message_id: messageId,
                reply_markup: updatedMarkup,
              });
            } catch {
              // Ignore unchanged markup error
            }
          }
        },
        nav: async (targetMenu: unknown): Promise<void> => {
          if (chatId && messageId && targetMenu instanceof Menu) {
            const nextMarkup = await targetMenu.render(ctx);
            try {
              await ctx.bot.editMessageReplyMarkup({
                chat_id: chatId,
                message_id: messageId,
                reply_markup: nextMarkup,
              });
            } catch {
              // Ignore
            }
          }
        },
        back: async (): Promise<void> => {
          if (menu.parent && chatId && messageId) {
            const parentMarkup = await menu.parent.render(ctx);
            try {
              await ctx.bot.editMessageReplyMarkup({
                chat_id: chatId,
                message_id: messageId,
                reply_markup: parentMarkup,
              });
            } catch {
              // Ignore
            }
          }
        },
      };

      ctx.menu = menuControl;

      let isCallbackAnswered = false;
      const originalAnswer = ctx.answerCallbackQuery.bind(ctx);
      ctx.answerCallbackQuery = async (options) => {
        isCallbackAnswered = true;
        return originalAnswer(options);
      };

      if (buttonItem.type === "text" && action === "b") {
        await buttonItem.handler(ctx);
        if (!isCallbackAnswered) {
          try {
            await ctx.answerCallbackQuery();
          } catch {
            // Ignore
          }
        }
        return;
      }

      if (buttonItem.type === "submenu" && action === "s") {
        if (buttonItem.onNavigate) {
          await buttonItem.onNavigate(ctx);
        }

        if (chatId && messageId) {
          const nextMarkup = await buttonItem.targetMenu.render(ctx);
          try {
            await ctx.bot.editMessageReplyMarkup({
              chat_id: chatId,
              message_id: messageId,
              reply_markup: nextMarkup,
            });
          } catch {
            // Ignore
          }
        }

        if (!isCallbackAnswered) {
          try {
            await ctx.answerCallbackQuery();
          } catch {
            // Ignore
          }
        }
        return;
      }

      if (buttonItem.type === "back" && action === "k") {
        if (menu.parent) {
          if (buttonItem.onNavigate) {
            await buttonItem.onNavigate(ctx);
          }

          if (chatId && messageId) {
            const parentMarkup = await menu.parent.render(ctx);
            try {
              await ctx.bot.editMessageReplyMarkup({
                chat_id: chatId,
                message_id: messageId,
                reply_markup: parentMarkup,
              });
            } catch {
              // Ignore
            }
          }

          if (!isCallbackAnswered) {
            try {
              await ctx.answerCallbackQuery();
            } catch {
              // Ignore
            }
          }
        }
        return;
      }

      return next();
    };
  }
}
