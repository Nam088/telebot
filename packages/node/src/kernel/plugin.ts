/**
 * Plugin contract and extension surface for telebot-ts.
 *
 * A plugin receives the fully configured {@link Application} in `install` and may use any of the
 * six stable extension points: `usePlugin`, `use` (middleware), `addHandler` / `addErrorHandler`,
 * `onInit` / `onShutdown` lifecycle hooks, and {@link Bot.transformRequest}. These form the
 * public plugin API — everything else is internal and may change without notice.
 *
 * @packageDocumentation
 */

import type { Application } from "./app.js";

/**
 * A telebot-ts plugin: a named, self-contained bundle of bot behavior.
 *
 * `install` runs synchronously while the application is being configured — wire up middleware,
 * handlers, and lifecycle hooks there. Reserve asynchronous setup (opening connections, loading
 * data) for `onInit` hooks, which run right before the bot starts serving updates.
 *
 * @example
 * ```ts
 * import type { Plugin } from "telebot-ts";
 *
 * export function analytics(endpoint: string): Plugin {
 *   return {
 *     name: "analytics",
 *     install(app) {
 *       app.use(async (context, next) => {
 *         track(endpoint, context.update.update_id);
 *         await next();
 *       });
 *       app.onShutdown(() => flushQueue());
 *     },
 *   };
 * }
 * ```
 */
export interface Plugin {
  /**
   * Unique identifier of the plugin. Installing two plugins with the same name throws, so pick a
   * namespaced name (e.g. `"telebot-plugin-i18n"`).
   */
  readonly name: string;

  /**
   * Synchronously wires the plugin into the application.
   *
   * @param app - The {@link Application} the plugin is being installed into.
   */
  install(app: Application): void;
}
