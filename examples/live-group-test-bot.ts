/**
 * Live Interactive Telegram Group Test Bot.
 *
 * Demonstrates:
 * 1. Listening to commands `/start`, `/catalog`, `/help` in the test group
 * 2. Interactive pagination handling for catalog
 * 3. Text formatting & safety escaping
 * 4. Responding to callback queries
 *
 * Usage:
 * npx tsx examples/live-group-test-bot.ts
 */

import {
  Application,
  PaginationKeyboard,
  bold,
  link,
  spoiler,
  code,
} from "../src/index.js";

const token = process.env.BOT_TOKEN || process.env.TEST_BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN or TEST_BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = new Application(token);


const FEATURES = [
  "Batch Message Forwarding (Bot API 7.x)",
  "Prepared Inline Messages (Bot API 8.0)",
  "Third-Party Verification Badges (Bot API 8.2)",
  "Telegram Star Gifts & Collectibles (Bot API 8.2)",
  "Zero-Dependency Webhook Adapters (Next.js, Fastify, Express)",
  "Sliding Window Rate Limiter Middleware",
  "Memory & Persistent Session Storage",
  "Type-Safe Inline Query Result Builder",
];

function buildCatalog(page: number) {
  const pagination = new PaginationKeyboard({
    items: FEATURES,
    page,
    pageSize: 3,
    itemButton: (feat, idx) => ({
      text: `${idx + 1}. ${feat}`,
      callback_data: `feat:${idx}`,
    }),
    navigation: {
      prev: "Previous",
      next: "Next",
      pageIndicator: (curr, total) => `Page ${curr} / ${total}`,
      disabled: "-",
    },
  });

  const text = `${bold("📋 telebot-ts — Features Catalog")}\n\n` +
    `Page ${code(`${pagination.currentPage} / ${pagination.totalPages}`)}:\n` +
    `Select a feature below to view details:`;

  return { text, reply_markup: pagination.build() };
}

// 1. /start command
app.command("start", async (update, context) => {
  const name = update.effective_user?.first_name ?? "User";
  const welcome = `${bold(`Xin chào ${name}!`)}\n\n` +
    `Bot ${code("telebot-ts")} đang chạy trực tiếp trên nhóm test.\n\n` +
    `• Framework: ${link("telebot-ts", "https://github.com")}\n` +
    `• Bảo mật: ${spoiler("100% Zero runtime dependencies")}\n` +
    `• Gõ /catalog để xem danh mục tính năng phân trang.\n` +
    `• Gõ /help để xem hướng dẫn.`;

  await context.replyWithHTML(welcome);
});

// 2. /catalog command
app.command("catalog", async (update, context) => {
  const { text, reply_markup } = buildCatalog(1);
  await context.replyWithHTML(text, { reply_markup });
});

// 3. /help command
app.command("help", async (update, context) => {
  await context.replyWithHTML(
    `${bold("📖 Hướng Dẫn Sử Dụng:")}\n\n` +
    `• /start: Lời chào và thông tin bot\n` +
    `• /catalog: Xem danh mục tính năng (kèm nút bấm phân trang)\n` +
    `• Bấm các nút [Previous], [Next] trên menu để kiểm tra phân trang tự động.`,
  );
});

// 4. Pagination navigation and item clicks
app.callbackQuery(true, async (update, context) => {
  const data = update.callback_query?.data;
  if (!data) return;

  if (data.startsWith("pagination:next:") || data.startsWith("pagination:prev:")) {
    const pageStr = data.split(":")[2] ?? "1";
    const targetPage = parseInt(pageStr, 10);
    const { text, reply_markup } = buildCatalog(targetPage);

    await context.editMessageText(text, {
      parse_mode: "HTML",
      reply_markup,
    });
    await context.answerCallbackQuery();
  } else if (data === "pagination:noop:") {
    await context.answerCallbackQuery({ text: "Nút thông tin số trang" });
  } else if (data.startsWith("feat:")) {
    const featIdx = parseInt(data.split(":")[1] ?? "0", 10);
    const featName = FEATURES[featIdx] ?? "Feature";
    await context.answerCallbackQuery({
      text: `Tính năng: ${featName}`,
      show_alert: true,
    });
  }
});

console.log("Starting Live Interactive Test Bot polling...");
app.runPolling().catch(console.error);
