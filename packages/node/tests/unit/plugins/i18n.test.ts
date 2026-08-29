import { describe, it, expect } from "vitest";
import { Application } from "../../../src/kernel/app.js";
import { i18n, i18nFor } from "../../../src/plugins/i18n.js";
import type { CallbackContext } from "../../../src/kernel/context.js";

function okFetch(result: unknown = true) {
  return (async () =>
    new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
}

function textUpdate(languageCode?: string, userId = 7) {
  return {
    update_id: 1,
    message: {
      message_id: 1,
      date: 0,
      chat: { id: userId, type: "private" },
      from: { id: userId, is_bot: false, first_name: "Tester", language_code: languageCode },
      text: "hello",
    },
  };
}

const options = {
  default_locale: "en",
  locales: {
    en: { hello: "Hello, {name}!", bye: "Bye!" },
    vi: { hello: "Xin chào, {name}!" },
  },
};

describe("i18n plugin", () => {
  it("resolves locale from the Telegram language_code", async () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    app.usePlugin(i18n(options));

    let captured: ReturnType<typeof i18nFor>;
    app.on("message", async (update, context) => {
      captured = i18nFor(context);
    });

    await app.processUpdate(textUpdate("vi"));

    expect(captured!.locale).toBe("vi");
    expect(captured!.t("hello", { name: "Nam" })).toBe("Xin chào, Nam!");
  });

  it("falls back to the default locale for unknown languages and missing keys", async () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    app.usePlugin(i18n(options));

    let captured: ReturnType<typeof i18nFor>;
    app.on("message", async (update, context) => {
      captured = i18nFor(context);
    });

    await app.processUpdate(textUpdate("fr"));

    expect(captured!.locale).toBe("en");
    expect(captured!.t("bye")).toBe("Bye!");
    expect(captured!.t("missing.key")).toBe("missing.key");
  });

  it("persists the locale chosen via setLocale into user_data", async () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    app.usePlugin(i18n(options));

    const seen: string[] = [];
    app.on("message", async (update, context) => {
      const session = i18nFor(context)!;
      seen.push(session.t("hello", { name: "Nam" }));
      if (session.locale !== "vi") {
        session.setLocale("vi");
      }
    });

    await app.processUpdate(textUpdate("en"));
    await app.processUpdate(textUpdate("en"));

    expect(seen).toEqual(["Hello, Nam!", "Xin chào, Nam!"]);

    const userData = await app.persistence.getUserData(7);
    expect(userData["_telebot_locale"]).toBe("vi");
  });

  it("returns undefined from i18nFor when the plugin is not installed", async () => {
    const app = new Application("123:abc", { fetch: okFetch() });
    let result: unknown = "sentinel";
    app.on("message", async (update, context: CallbackContext) => {
      result = i18nFor(context);
    });

    await app.processUpdate(textUpdate("en"));

    expect(result).toBeUndefined();
  });
});
