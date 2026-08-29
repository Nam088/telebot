/**
 * Plugin contract and extension surface for telebot-ts.
 *
 * A plugin receives the fully configured {@link Application} in `install` and may use any of the
 * stable extension points: `usePlugin`, `use` (middleware), `addHandler` / `addErrorHandler`,
 * `onInit` / `onShutdown` lifecycle hooks, {@link Bot.transformRequest},
 * {@link Bot.transformResponse} / {@link Bot.onApiError}, and {@link Application.pluginState}.
 * Plugins can declare `dependsOn` ordering and are removable via {@link Application.removePlugin}.
 * These form the public plugin API — everything else is internal and may change without notice.
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
   * Names of plugins that must be installed before this one.
   *
   * If a dependency is not installed yet, installation is deferred until it is (plugins are
   * flushed automatically on every `usePlugin` call). Dependencies still missing when the
   * application starts cause `runPolling` / `runWebhook` to throw.
   */
  readonly dependsOn?: readonly string[];

  /**
   * Relative installation order among plugins whose dependencies are simultaneously satisfied:
   * lower values install first. Installation order determines middleware execution order.
   *
   * @defaultValue `0`
   */
  readonly priority?: number;

  /**
   * Synchronously wires the plugin into the application.
   *
   * @param app - The {@link Application} the plugin is being installed into.
   */
  install(app: Application): void;

  /**
   * Optional teardown invoked by {@link Application.removePlugin} before the plugin's
   * middleware, handlers, and hooks are deregistered. Use it to cancel timers or release
   * resources the plugin owns outside of `onShutdown` hooks.
   *
   * @param app - The {@link Application} the plugin is being removed from.
   */
  readonly uninstall?: (app: Application) => void;
}
