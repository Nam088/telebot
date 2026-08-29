/**
 * Inline Keyboard Styles Comparison Example.
 *
 * Demonstrates:
 * 1. Classic matrix style (2D Array of button objects)
 * 2. Modern Fluent Builder style (GrammY / Telegraf chaining)
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/comparison-inline-keyboards.ts
 */

import {
  Application,
  CommandHandler,
  InlineKeyboard,
  InlineKeyboardButton,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN";
const app = new Application(token);

// 1. Classic Matrix Style (Nested Arrays of Button Objects)
app.addHandler(
  new CommandHandler("classic_keyboard", async (update: Update, context: CallbackContext) => {
    const reply_markup = {
      inline_keyboard: [
        [
          { text: "Button 1", callback_data: "btn_1" },
          { text: "Button 2", callback_data: "btn_2" },
        ],
        [
          { text: "Official Docs", url: "https://example.com" },
          { text: "Search Inline", switch_inline_query_current_chat: "query" },
        ],
      ],
    };

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Keyboard created using Classic 2D Matrix Array style:",
      reply_markup,
    });
  }),
);

// 2. Modern Fluent Builder Style (GrammY / Chaining style)
app.addHandler(
  new CommandHandler("fluent_keyboard", async (update: Update, context: CallbackContext) => {
    const keyboard = new InlineKeyboard()
      .text("Button 1", "btn_1")
      .text("Button 2", "btn_2")
      .row()
      .url("Official Docs", "https://example.com")
      .switchInlineQueryCurrentChat("Search Inline", "query");

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Keyboard created using Modern Fluent Builder style:",
      reply_markup: keyboard,
    });
  }),
);

console.log("Inline Keyboards comparison example initialized.");
