/**
 * Telegram Inline Query Search Bot Example.
 *
 * Demonstrates:
 * 1. Handling `@mybot search_query` with `InlineQueryHandler`
 * 2. Using `InlineQueryResultBuilder` to construct type-safe results (articles, photos)
 * 3. Answering inline queries with results and caching
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/inline-query-search-bot.ts
 */

import {
  Application,
  InlineQueryHandler,
  InlineQueryResultBuilder,
  InlineKeyboard,
  bold,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = Application.builder().token(token).build();

// Sample knowledge base
const KNOWLEDGE_BASE = [
  { id: "1", title: "TypeScript Official Docs", url: "https://www.typescriptlang.org", desc: "Handbook and reference" },
  { id: "2", title: "Telegram Bot API", url: "https://core.telegram.org/bots/api", desc: "Official Telegram Bot specification" },
  { id: "3", title: "telebot-ts GitHub", url: "https://github.com", desc: "Native zero-dependency Telegram Bot framework" },
];

app.addHandler(
  new InlineQueryHandler(async (update: Update, context: CallbackContext) => {
    const inlineQuery = update.inline_query;
    if (!inlineQuery) return;

    const query = inlineQuery.query.trim().toLowerCase();

    // Filter items matching user search query
    const filtered = KNOWLEDGE_BASE.filter(
      (item) => item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query),
    );

    const results = filtered.map((item) => {
      const keyboard = new InlineKeyboard().url("Open Link", item.url);

      return InlineQueryResultBuilder.article(`kb-${item.id}`, item.title, {
        description: item.desc,
        reply_markup: keyboard,
      }).text(
        `${bold(item.title)}\n${item.desc}\n\nLink: ${item.url}`,
        { parse_mode: "HTML" },
      );
    });

    await context.bot.answerInlineQuery({
      inline_query_id: inlineQuery.id,
      results,
      cache_time: 300,
    });
  }),
);

console.log("Inline Query Search Bot ready.");
