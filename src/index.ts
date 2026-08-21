/**
 * telebot-ts — Zero-dependency, type-safe Telegram Bot framework for Node.js and TypeScript.
 *
 * @packageDocumentation
 */

export * from "./client/index.js";
export * from "./kernel/index.js";
export * from "./routing/index.js";
export * from "./filters/index.js";
export * from "./storage/index.js";
export * from "./scheduler/index.js";
export * from "./components/index.js";
export * from "./utils/index.js";

// `components/keyboard.js` exports InlineKeyboardButton/InlineKeyboardMarkup as constructable
// classes (an alternative to the InlineKeyboard fluent builder), which are structurally compatible
// with, and take precedence over, the plain Bot API types of the same name re-exported from `client/index.js`.
export { InlineKeyboardButton, InlineKeyboardMarkup } from "./components/keyboard.js";
