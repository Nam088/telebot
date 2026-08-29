import { describe, it, expect, vi } from "vitest";
import { Menu } from "../../../src/components/index.js";
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

    it("supports live in-place update with dynamic label toggle via ctx.menu.update()", async () => {
      const bot = new Bot("123:TOKEN");
      vi.spyOn(bot, "answerCallbackQuery").mockResolvedValue(true);
      const editMarkupSpy = vi.spyOn(bot, "editMessageReplyMarkup").mockResolvedValue(true as any);

      let isEnabled = false;
      const menu = new Menu("toggle_menu").text(
        () => `Status: ${isEnabled ? "ON" : "OFF"}`,
        async (ctx) => {
          isEnabled = !isEnabled;
          await ctx.menu?.update();
        },
      );

      const rawUpdate = {
        update_id: 10,
        callback_query: {
          id: "cq_toggle",
          chat_instance: "ci",
          from: { id: 1, is_bot: false, first_name: "Test" },
          data: "m:toggle_menu:b:0:0",
          message: {
            message_id: 88,
            date: 1000,
            chat: { id: 500, type: "private" },
          },
        },
      };

      const ctx = new CallbackContext({
        bot,
        update: new Update(rawUpdate as any),
      });

      const next = vi.fn();
      await menu.middleware()(ctx, next);

      expect(isEnabled).toBe(true);
      expect(editMarkupSpy).toHaveBeenCalledTimes(1);
      expect(editMarkupSpy).toHaveBeenCalledWith({
        chat_id: 500,
        message_id: 88,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Status: ON",
                callback_data: "m:toggle_menu:b:0:0",
              },
            ],
          ],
        },
      });
    });

    it("supports explicit programmatic navigation via ctx.menu.nav() and ctx.menu.back()", async () => {
      const bot = new Bot("123:TOKEN");
      vi.spyOn(bot, "answerCallbackQuery").mockResolvedValue(true);
      const editMarkupSpy = vi.spyOn(bot, "editMessageReplyMarkup").mockResolvedValue(true as any);

      const root = new Menu("root_nav");
      const target = new Menu("target_nav").text("Target Action", () => {});
      root.submenu("To Target", target);

      // 1. Programmatic nav
      const navMenu = new Menu("nav_trigger").text("Jump", async (ctx) => {
        await ctx.menu?.nav(target);
      });
      root.submenu("Nav Trigger", navMenu);

      const rawUpdate = {
        update_id: 11,
        callback_query: {
          id: "cq_nav",
          chat_instance: "ci",
          from: { id: 1, is_bot: false, first_name: "Test" },
          data: "m:nav_trigger:b:0:0",
          message: {
            message_id: 99,
            date: 1000,
            chat: { id: 600, type: "private" },
          },
        },
      };

      const ctx = new CallbackContext({
        bot,
        update: new Update(rawUpdate as any),
      });

      await root.middleware()(ctx, vi.fn());

      expect(editMarkupSpy).toHaveBeenCalledWith({
        chat_id: 600,
        message_id: 99,
        reply_markup: target.build(),
      });
    });
  });
});
