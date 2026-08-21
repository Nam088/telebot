/**
 * Live Interactive Telegram Group Test Bot.
 *
 * Demonstrates in a live group:
 * 1. Interactive Nested Menu System (`/menu`) with submenus & in-place updates
 * 2. Linear Async/Await Conversation (`/feedback`) using `conversation.ask()`
 * 3. Interactive Pagination Keyboard (`/catalog`)
 * 4. Safe Text Formatting (MarkdownV2 & HTML)
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/live-group-test-bot.ts
 */

import {
  Application,
  Menu,
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

// ==========================================
// 1. Interactive Nested Menu System (/menu)
// ==========================================

let notificationsEnabled = true;

const settingsMenu = new Menu("settings-menu")
  .text(
    (ctx) => `Notifications: ${notificationsEnabled ? "ON" : "OFF"}`,
    async (ctx) => {
      notificationsEnabled = !notificationsEnabled;
      await ctx.answerCallbackQuery({
        text: `Notifications are now ${notificationsEnabled ? "ENABLED" : "DISABLED"}!`,
      });
      // Re-render menu in-place
      await ctx.editMessageReplyMarkup({
        reply_markup: settingsMenu.build(),
      });
    },
  )
  .row()
  .text("Privacy Policy", async (ctx) => {
    await ctx.answerCallbackQuery({
      text: "telebot-ts is 100% private with zero external tracking.",
      show_alert: true,
    });
  })
  .row()
  .back("Back to Main Menu");

const mainMenu = new Menu("main-menu")
  .text("System Status", async (ctx) => {
    await ctx.answerCallbackQuery({
      text: "All Systems Operational — Node.js 22+ & TypeScript",
      show_alert: true,
    });
  })
  .row()
  .submenu("Settings", settingsMenu)
  .row()
  .url("GitHub Repository", "https://github.com");

// Register nested menu middleware
app.use(mainMenu);

app.command("menu", async (update, context) => {
  await context.replyWithHTML(
    `${bold("Interactive Control Panel")}\n\nSelect an option below to navigate submenus in-place:`,
    { reply_markup: mainMenu.build() },
  );
});

// ==========================================
// 2. Linear Async/Await Conversation (/feedback)
// ==========================================

app.conversation("feedback", async (conversation, context) => {
  const nameMsg = await conversation.ask(
    `${bold("Khảo sát trải nghiệm")}\n\n1/2. Bạn có thể cho biết tên của bạn là gì?`,
    { parse_mode: "HTML" },
  );

  const ratingMsg = await conversation.ask(
    `Cảm ơn ${nameMsg.text ?? "bạn"}!\n\n2/2. Bạn đánh giá framework telebot-ts mấy điểm (thang 1 - 10)?`,
  );

  await context.replyWithHTML(
    `${bold("Khảo sát hoàn tất!")}\n\n` +
    `• Người gửi: ${code(nameMsg.text ?? "Ẩn danh")}\n` +
    `• Đánh giá: ${code(ratingMsg.text ?? "10")}/10\n\n` +
    `Cảm ơn bạn đã trải nghiệm tính năng Linear Async Conversation!`,
  );
});

app.command("feedback", async (update, context) => {
  await context.conversation.enter("feedback");
});

// ==========================================
// 3. Interactive Pagination Keyboard (/catalog)
// ==========================================

const FEATURES = [
  "Batch Message Forwarding & Copying (Bot API 7.x)",
  "Prepared Inline Messages (Bot API 8.0)",
  "Third-Party Verification Badges (Bot API 8.2)",
  "Telegram Star Gifts & Collectibles (Bot API 8.2)",
  "Interactive Nested Menus with Submenus & In-place Updates",
  "Linear Async/Await Conversations (conversation.ask)",
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

app.command("catalog", async (update, context) => {
  const { text, reply_markup } = buildCatalog(1);
  await context.replyWithHTML(text, { reply_markup });
});

// Pagination callback handler
app.callbackQuery(/^(pagination:|feat:)/, async (update, context) => {
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
    await context.answerCallbackQuery({ text: "Nút chỉ số trang" });
  } else if (data.startsWith("feat:")) {
    const featIdx = parseInt(data.split(":")[1] ?? "0", 10);
    const featName = FEATURES[featIdx] ?? "Feature";
    await context.answerCallbackQuery({
      text: `Tính năng: ${featName}`,
      show_alert: true,
    });
  }
});

// ==========================================
// 4. General Commands & Help
// ==========================================

app.command("start", async (update, context) => {
  const name = update.effective_user?.first_name ?? "User";
  const welcome = `${bold(`Xin chào ${name}!`)}\n\n` +
    `Bot ${code("telebot-ts")} đã cập nhật đầy đủ các tính năng mới nhất.\n\n` +
    `• /menu: Thử nghiệm Menu đa tầng (Submenus & In-place navigation)\n` +
    `• /feedback: Thử nghiệm Linear Async Conversation (Hội thoại tuần tự)\n` +
    `• /catalog: Xem danh mục tính năng kèm phân trang\n` +
    `• /help: Xem hướng dẫn lệnh\n\n` +
    `Bảo mật: ${spoiler("100% Zero runtime dependencies")}`;

  await context.replyWithHTML(welcome);
});

app.command("help", async (update, context) => {
  await context.replyWithHTML(
    `${bold("📖 Danh Sách Lệnh Thử Nghiệm:")}\n\n` +
    `• /menu: Menu điều khiển lồng nhau tương tác trực tiếp\n` +
    `• /feedback: Khảo sát tuần tự bằng Async/Await\n` +
    `• /catalog: Danh mục tính năng kèm phân trang`,
  );
});

// Synchronize bot commands on startup
async function startBot() {
  await app.bot.setMyCommands({
    commands: [
      { command: "start", description: "Start the bot & show feature menu" },
      { command: "menu", description: "Interactive nested control menu" },
      { command: "feedback", description: "Try linear async conversation" },
      { command: "catalog", description: "View paginated features catalog" },
      { command: "help", description: "Display help information" },
    ],
  });

  console.log("Starting Live Interactive Test Bot with all 3 features...");
  await app.runPolling();
}

startBot().catch(console.error);
