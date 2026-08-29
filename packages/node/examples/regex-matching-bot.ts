/**
 * Regular Expression Pattern Matching Bot Example.
 *
 * Demonstrates:
 * 1. Matching text messages with `filters.Regex(/pattern/)` and reading capture groups from `context.matches`
 * 2. Matching inline keyboard button clicks with `CallbackQueryHandler(/pattern/)`
 * 3. Matching inline queries with `InlineQueryHandler(/pattern/)`
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/regex-matching-bot.ts
 */

import {
  Application,
  MessageHandler,
  CallbackQueryHandler,
  InlineQueryHandler,
  filters,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN";
const app = new Application(token);

// 1. Message Regex matching with capture groups (e.g. "order:12345" or "item:abc-99")
app.addHandler(
  new MessageHandler(
    filters.Regex(/^order:(\d+)$/i),
    async (update: Update, context: CallbackContext) => {
      // Capture groups are automatically populated in context.matches
      const match = context.matches?.[0];
      const orderId = match?.[1];

      await context.bot.sendMessage({
        chat_id: update.effective_chat!.id,
        text: `Regex matched text: Order ID captured is #${orderId}`,
      });
    },
  ),
);

// 2. CallbackQuery Regex matching (e.g. button callback_data "select_product_42")
app.addHandler(
  new CallbackQueryHandler(async (update: Update, context: CallbackContext) => {
    const match = context.matches?.[0];
    const productId = match?.[1];

    await context.bot.answerCallbackQuery({
      callback_query_id: update.callback_query!.id,
      text: `Button clicked for Product #${productId}!`,
    });
  }, /^select_product_(\d+)$/),
);

// 3. InlineQuery Regex matching (e.g. typing "@bot find:shoes")
app.addHandler(
  new InlineQueryHandler(async (update: Update, context: CallbackContext) => {
    const match = context.matches?.[0];
    const keyword = match?.[1];

    await context.bot.answerInlineQuery({
      inline_query_id: update.inline_query!.id,
      results: [
        {
          type: "article",
          id: "1",
          title: `Search results for: ${keyword}`,
          input_message_content: {
            message_text: `Found items matching "${keyword}".`,
          },
        },
      ],
    });
  }, /^find:(.+)$/i),
);

console.log("Regex Matching Bot is ready.");
