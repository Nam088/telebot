import { describe, it, expect, vi } from "vitest";
import { Menu } from "../../../src/components/menu.js";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";
import { CallbackContext } from "../../../src/kernel/context.js";
import { Update } from "../../../src/kernel/update.js";

describe("Interactive Nested Menu System", () => {
  describe("Menu Builder & Markup Generation", () => {
    it("throws error when constructed with empty id", () => {
      expect(() => new Menu("")).toThrow(TypeError);
      expect(() => new Menu("   ")).toThrow(TypeError);
    });

    it("constructs rows and buttons correctly with synchronous build()", () => {
      const menu = new Menu("root")
        .text("Button 1", () => {})
        .text("Button 2", () => {})
        .row()
        .url("Documentation", "https://example.com");

      const markup = menu.build();
      expect(markup.inline_keyboard).toHaveLength(2);
      expect(markup.inline_keyboard[0]).toHaveLength(2);
      expect(markup.inline_keyboard[0]?.[0]?.text).toBe("Button 1");
      expect(markup.inline_keyboard[0]?.[0]?.callback_data).toBe("m:root:b:0:0");
      expect(markup.inline_keyboard[0]?.[1]?.text).toBe("Button 2");
      expect(markup.inline_keyboard[0]?.[1]?.callback_data).toBe("m:root:b:0:1");
      expect(markup.inline_keyboard[1]?.[0]?.text).toBe("Documentation");
      expect(markup.inline_keyboard[1]?.[0]?.url).toBe("https://example.com");
    });

    it("evaluates dynamic synchronous and asynchronous labels", async () => {
      const bot = new Bot("123:TOKEN");
      const ctx = new CallbackContext({
        bot,
        user_data: { role: "Admin" },
      });

      const menu = new Menu("profile")
        .text(
          (c) => `User Role: ${c.user_data?.role ?? "Guest"}`,
          () => {},
        )
        .row()
        .text(
          async (c) => Promise.resolve(`Async: ${c.user_data?.role}`),
          () => {},
        );

      const syncMarkup = menu.build(ctx);
      expect(syncMarkup.inline_keyboard[0]?.[0]?.text).toBe("User Role: Admin");

      const asyncMarkup = await menu.render(ctx);
      expect(asyncMarkup.inline_keyboard[1]?.[0]?.text).toBe("Async: Admin");
    });

    it("links submenus and sets default clean 'Back' label without emoji", () => {
      const parent = new Menu("main");
      const child = new Menu("settings");
      child.back(); // Default label should be "Back"

      parent.submenu("Settings", child);

      expect(child.parent).toBe(parent);
      const parentMarkup = parent.build();
      expect(parentMarkup.inline_keyboard[0]?.[0]?.text).toBe("Settings");
      expect(parentMarkup.inline_keyboard[0]?.[0]?.callback_data).toBe("m:main:s:settings:0:0");

      const childMarkup = child.build();
      expect(childMarkup.inline_keyboard[0]?.[0]?.text).toBe("Back");
      expect(childMarkup.inline_keyboard[0]?.[0]?.callback_data).toBe("m:settings:k:0:0");
    });

    it("finds menus anywhere in the hierarchy", () => {
      const root = new Menu("root");
      const sub1 = new Menu("sub1");
      const sub2 = new Menu("sub2");

      root.submenu("Sub 1", sub1);
      sub1.submenu("Sub 2", sub2);

      expect(root.findMenu("root")).toBe(root);
      expect(root.findMenu("sub1")).toBe(sub1);
      expect(root.findMenu("sub2")).toBe(sub2);
      expect(sub2.findMenu("root")).toBe(root);
      expect(root.findMenu("unknown")).toBeUndefined();
    });
  });

  describe("Middleware & Event Routing", () => {
    it("routes button clicks to handler and answers callback query", async () => {
      const bot = new Bot("123:TOKEN");
      const answerCallbackSpy = vi.spyOn(bot, "answerCallbackQuery").mockResolvedValue(true);

      const handlerSpy = vi.fn();
      const menu = new Menu("control").text("Click", handlerSpy);

      const next = vi.fn();
      const middleware = menu.middleware();

      const rawUpdate = {
        update_id: 1,
        callback_query: {
          id: "cq_123",
          chat_instance: "ci",
          from: { id: 1, is_bot: false, first_name: "Test" },
          data: "m:control:b:0:0",
          message: {
            message_id: 42,
            date: 1000,
            chat: { id: 100, type: "private" },
          },
        },
      };

      const ctx = new CallbackContext({
        bot,
        update: new Update(rawUpdate as any),
      });

      await middleware(ctx, next);

      expect(handlerSpy).toHaveBeenCalledTimes(1);
      expect(handlerSpy).toHaveBeenCalledWith(ctx);
      expect(answerCallbackSpy).toHaveBeenCalledWith({ callback_query_id: "cq_123" });
      expect(next).not.toHaveBeenCalled();
    });

    it("navigates to submenu, triggers onNavigate hook, and edits message reply markup", async () => {
      const bot = new Bot("123:TOKEN");
      vi.spyOn(bot, "answerCallbackQuery").mockResolvedValue(true);
      const editMarkupSpy = vi.spyOn(bot, "editMessageReplyMarkup").mockResolvedValue(true as any);

      const onNavigateSpy = vi.fn();
      const rootMenu = new Menu("root");
      const childMenu = new Menu("child").text("Child Button", () => {});

      rootMenu.submenu("Open Child", childMenu, onNavigateSpy);

      const rawUpdate = {
        update_id: 2,
        callback_query: {
          id: "cq_456",
          chat_instance: "ci",
          from: { id: 1, is_bot: false, first_name: "Test" },
          data: "m:root:s:child:0:0",
          message: {
            message_id: 55,
            date: 1000,
            chat: { id: 200, type: "private" },
          },
        },
      };

      const ctx = new CallbackContext({
        bot,
        update: new Update(rawUpdate as any),
      });

      const next = vi.fn();
      await rootMenu.middleware()(ctx, next);

      expect(onNavigateSpy).toHaveBeenCalledTimes(1);
      expect(editMarkupSpy).toHaveBeenCalledWith({
        chat_id: 200,
        message_id: 55,
        reply_markup: childMenu.build(),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("navigates back to parent menu when back button is pressed", async () => {
      const bot = new Bot("123:TOKEN");
      vi.spyOn(bot, "answerCallbackQuery").mockResolvedValue(true);
      const editMarkupSpy = vi.spyOn(bot, "editMessageReplyMarkup").mockResolvedValue(true as any);

      const onBackSpy = vi.fn();
      const parent = new Menu("parent").text("Parent Option", () => {});
      const child = new Menu("child").back("Back to parent", onBackSpy);
      parent.submenu("To Child", child);

      const rawUpdate = {
        update_id: 3,
        callback_query: {
          id: "cq_789",
          chat_instance: "ci",
          from: { id: 1, is_bot: false, first_name: "Test" },
          data: "m:child:k:0:0",
          message: {
            message_id: 77,
            date: 1000,
            chat: { id: 300, type: "private" },
          },
        },
      };

      const ctx = new CallbackContext({
        bot,
        update: new Update(rawUpdate as any),
      });

      const next = vi.fn();
      await parent.middleware()(ctx, next);

      expect(onBackSpy).toHaveBeenCalledTimes(1);
      expect(editMarkupSpy).toHaveBeenCalledWith({
        chat_id: 300,
        message_id: 77,
        reply_markup: parent.build(),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("passes through non-matching updates to next()", async () => {
      const bot = new Bot("123:TOKEN");
      const menu = new Menu("menu1").text("Btn", () => {});

      const rawUpdate = {
        update_id: 4,
        callback_query: {
          id: "cq_other",
          chat_instance: "ci",
          from: { id: 1, is_bot: false, first_name: "Test" },
          data: "other_button_action",
        },
      };

      const ctx = new CallbackContext({
        bot,
        update: new Update(rawUpdate as any),
      });

      const next = vi.fn();
      await menu.middleware()(ctx, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("integrates directly with app.use(menu)", async () => {
      const bot = new Bot("123:TOKEN");
      vi.spyOn(bot, "answerCallbackQuery").mockResolvedValue(true);
      const handlerSpy = vi.fn();

      const app = new Application(bot);
      const menu = new Menu("test_app").text("Action", handlerSpy);

      app.use(menu);

      await app.processUpdate({
        update_id: 5,
        callback_query: {
          id: "cq_app",
          chat_instance: "ci",
          from: { id: 1, is_bot: false, first_name: "Test" },
          data: "m:test_app:b:0:0",
        },
      });

      expect(handlerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
