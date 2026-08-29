/**
 * Live Webhook Production Server Example.
 *
 * Demonstrates receiving Telegram updates via native Node.js HTTP Webhook
 * with secret_token verification.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/live-webhook.ts
 */

import {
  Bot,
  Application,
  CommandHandler,
  MessageHandler,
  InlineQueryHandler,
  filters,
} from "../src/index.js";

const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN_WEBHOOK";
const bot = new Bot(token);
const app = new Application(bot);

const PORT = 3000;
const SECRET_TOKEN = "tele_bot_secret_token_123456";

// 1. Command /start & /webhook
app.addHandler(
  new CommandHandler(["start", "webhook"], async (update, ctx) => {
    console.log("[Webhook Triggered] /start or /webhook received.");
    await ctx.reply(
      "<b>Welcome to Webhook Server!</b>\n\nBot is receiving updates via <b>Webhook Mode</b> (Zero Dependencies).\n\nTry sending <code>/ping</code> or use inline query <code>@bot_username query</code>.",
      { parse_mode: "HTML" },
    );
  }),
);

// 2. Command /ping
app.addHandler(
  new CommandHandler("ping", async (update, ctx) => {
    const startTime = Date.now();
    const updateTime = update.effective_message?.date
      ? update.effective_message.date * 1000
      : startTime;
    const diff = Math.max(0, startTime - updateTime);

    console.log(`[Webhook Triggered] /ping received. Latency: ${diff}ms`);
    await ctx.reply(
      `<b>Pong!</b>\n\nLatency: ~${diff}ms\nEngine: telebot-ts (Node.js native)\nMode: Webhook (Secret Token verified)`,
      { parse_mode: "HTML" },
    );
  }),
);

// 3. Inline Query Handler
app.addHandler(
  new InlineQueryHandler(async (update, ctx) => {
    const query = update.inline_query?.query || "";
    const queryId = update.inline_query!.id;
    console.log(`[Inline Query Received]: "${query}"`);

    const results = [
      {
        type: "article",
        id: "1",
        title: `Search: "${query || "telebot-ts framework"}"`,
        description: "Send search card to chat",
        input_message_content: {
          message_text: `<b>Search Result:</b>\n\nKeyword: <code>${query || "telebot-ts"}</code>\nEngine: telebot-ts Native TypeScript`,
          parse_mode: "HTML",
        },
      },
      {
        type: "article",
        id: "2",
        title: "Documentation",
        description: "Zero-dependency TypeScript Telegram Bot Engine",
        input_message_content: {
          message_text:
            "<b>telebot-ts Documentation:</b>\n\n- Zero Runtime Dependencies\n- Native Node.js 22+ (SQLite, Fetch)\n- Strict Type Safety",
          parse_mode: "HTML",
        },
      },
    ];

    await ctx.bot.answerInlineQuery({
      inline_query_id: queryId,
      results: results as any,
      cache_time: 0,
    });
  }),
);

// 4. Fallback text handler
app.addHandler(
  new MessageHandler(filters.TEXT, async (update, ctx) => {
    const text = update.effective_message?.text;
    console.log(`[Webhook Received Message]: "${text}"`);
    await ctx.reply(`Webhook Bot received: <i>"${text}"</i>`, {
      parse_mode: "HTML",
    });
  }),
);

// Start server
console.log(`Starting local Webhook server on port ${PORT}...`);
await app.runWebhook({
  port: PORT,
  path: "/telegram-webhook",
  secret_token: SECRET_TOKEN,
});

console.log(`Webhook server is listening on http://localhost:${PORT}/telegram-webhook`);
