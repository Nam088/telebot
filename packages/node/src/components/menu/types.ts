/**
 * Menu component types and button representations.
 *
 * @packageDocumentation
 */

import type { CallbackContext } from "../../kernel/context.js";
import type { Menu } from "./menu.js";

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
export type MenuButtonItem =
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
