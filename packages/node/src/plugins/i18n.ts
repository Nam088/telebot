/**
 * Built-in internationalization (i18n) plugin.
 *
 * Demonstrates the plugin extension surface: a factory returning a {@link Plugin} that wires a
 * middleware to attach per-update translation sessions, with per-user locale preference stored
 * in `context.user_data` (and therefore persisted automatically).
 *
 * @packageDocumentation
 */

import type { Plugin } from "../kernel/plugin.js";
import type { Application } from "../kernel/app.js";
import type { CallbackContext } from "../kernel/context.js";

/**
 * Configuration for the {@link i18n} plugin.
 *
 * @example
 * ```ts
 * const options: I18nOptions = {
 *   default_locale: "en",
 *   locales: {
 *     en: { hello: "Hello, {name}!" },
 *     vi: { hello: "Xin chào, {name}!" },
 *   },
 * };
 * ```
 */
export interface I18nOptions {
  /**
   * Locale used when the user's preferred locale has no translations.
   */
  default_locale: string;

  /**
   * Translation tables keyed by locale code, then by message key.
   */
  locales: Record<string, Record<string, string>>;

  /**
   * Key inside `context.user_data` where the chosen locale is stored.
   *
   * @defaultValue `"_telebot_locale"`
   */
  locale_key?: string;
}

/**
 * Per-update translation session attached to the {@link CallbackContext} by the i18n middleware.
 */
export interface I18nSession {
  /**
   * Locale code resolved for the current update.
   */
  readonly locale: string;

  /**
   * Translates a message key for the resolved locale, falling back to the default locale, then
   * to the key itself. `{placeholder}` tokens are replaced from `params`.
   *
   * @param key - Message key in the translation tables.
   * @param params - Optional placeholder values.
   * @returns The translated string.
   */
  t(key: string, params?: Record<string, string | number>): string;

  /**
   * Persists the user's locale preference for all future updates.
   *
   * @param locale - Locale code to use from now on.
   */
  setLocale(locale: string): void;
}

const sessions = new WeakMap<CallbackContext, I18nSession>();

/**
 * Retrieves the i18n session attached to a context by the {@link i18n} plugin.
 *
 * @param context - The callback context of the current update.
 * @returns The session, or `undefined` if the plugin is not installed.
 *
 * @example
 * ```ts
 * app.on("message", async (update, context) => {
 *   const t = i18nFor(context)?.t("hello", { name: "Nam" });
 *   await context.reply(t ?? "no i18n");
 * });
 * ```
 */
export function i18nFor(context: CallbackContext): I18nSession | undefined {
  return sessions.get(context);
}

/**
 * Creates the built-in internationalization {@link Plugin}.
 *
 * The middleware resolves a locale per update (stored preference, then Telegram
 * `language_code`, then `default_locale`) and attaches an {@link I18nSession} readable through
 * {@link i18nFor}.
 *
 * @param options - Translation tables and locale configuration.
 * @returns A {@link Plugin} to install with `app.usePlugin(...)`.
 *
 * @example
 * ```ts
 * import { plugins, i18nFor } from "telebot-ts";
 *
 * app.usePlugin(
 *   plugins.i18n({
 *     default_locale: "en",
 *     locales: { en: { hello: "Hello!" }, vi: { hello: "Xin chào!" } },
 *   }),
 * );
 * app.on("message", async (update, context) => {
 *   await context.reply(i18nFor(context)!.t("hello"));
 * });
 * ```
 */
export function i18n(options: I18nOptions): Plugin {
  const localeKey = options.locale_key ?? "_telebot_locale";
  const fallbackTable = options.locales[options.default_locale] ?? {};

  return {
    name: "telebot-plugin-i18n",
    install(app: Application) {
      app.use(async (context, next) => {
        const stored = context.user_data?.[localeKey];
        const preferred =
          typeof stored === "string"
            ? stored
            : (context.update?.effective_user?.language_code ?? options.default_locale);
        const locale =
          options.locales[preferred] !== undefined ? preferred : options.default_locale;
        const table = options.locales[locale] ?? fallbackTable;

        sessions.set(context, {
          locale,
          t(key, params) {
            let text = table[key] ?? fallbackTable[key] ?? key;
            if (params) {
              for (const [name, value] of Object.entries(params)) {
                text = text.split(`{${name}}`).join(String(value));
              }
            }
            return text;
          },
          setLocale(nextLocale) {
            const data = context.user_data;
            if (data) {
              data[localeKey] = nextLocale;
            }
          },
        });

        await next();
      });
    },
  };
}
