/**
 * Official telebot-ts plugins, versioned and released together with the core.
 *
 * @packageDocumentation
 */

import { i18n } from "./i18n.js";

export * from "./i18n.js";

/**
 * Registry of built-in plugins, installable via `app.usePlugin(plugins.<name>(...))`.
 */
export const plugins = {
  i18n,
};
