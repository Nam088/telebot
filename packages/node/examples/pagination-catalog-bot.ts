/**
 * Telegram Interactive Paginated Product Catalog & Formatting Bot Example.
 *
 * Demonstrates:
 * 1. Building paginated inline keyboard menus with `PaginationKeyboard`
 * 2. Safely formatting rich MarkdownV2 and HTML with `escapeHtml`, `bold`, `link`, `spoiler`, `code`
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/pagination-catalog-bot.ts
 */

import {
  Application,
  CommandHandler,
  CallbackQueryHandler,
  PaginationKeyboard,
  bold,
  code,
  link,
  spoiler,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

// Sample store inventory
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

const PRODUCTS: Product[] = [
  { id: "p1", name: "Premium Membership (1 Month)", price: 50, description: "Full VIP access" },
  { id: "p2", name: "Premium Membership (3 Months)", price: 130, description: "Save 15%" },
  {
    id: "p3",
    name: "Premium Membership (1 Year)",
    price: 450,
    description: "Best value, save 25%",
  },
  { id: "p4", name: "100 Telegram Stars Pack", price: 100, description: "Digital in-app currency" },
  { id: "p5", name: "500 Telegram Stars Pack", price: 500, description: "Popular stars bundle" },
  {
    id: "p6",
    name: "Custom Bot Verification Badge",
    price: 1000,
    description: "Official checkmark",
  },
  { id: "p7", name: "Priority Support Ticket", price: 30, description: "24/7 dedicated support" },
];

const app = Application.builder().token(token).build();

function renderCatalogPage(page: number) {
  const pagination = new PaginationKeyboard({
    items: PRODUCTS,
    page,
    pageSize: 3,
    itemButton: (product) => ({
      text: `${product.name} — ⭐ ${product.price}`,
      callback_data: `view:${product.id}`,
    }),
    callbackData: (action, targetPage) => `page:${targetPage}`,
  });

  const text =
    `${bold("🛍️ Digital Store Catalog")}\n\n` +
    `Explore our premium digital items and services below:\n` +
    `Page ${code(`${pagination.currentPage} of ${pagination.totalPages}`)}`;

  return { text, reply_markup: pagination.build() };
}

// /start command
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const { text, reply_markup } = renderCatalogPage(1);
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text,
      parse_mode: "HTML",
      reply_markup,
    });
  }),
);

// Pagination navigation callback
app.addHandler(
  new CallbackQueryHandler(async (update: Update, context: CallbackContext) => {
    const data = update.callback_query?.data;
    if (!data) return;

    if (data.startsWith("page:")) {
      const pageNum = parseInt(data.split(":")[1] ?? "1", 10);
      const { text, reply_markup } = renderCatalogPage(pageNum);

      await context.bot.editMessageText({
        chat_id: update.effective_chat!.id,
        message_id: update.effective_message!.message_id,
        text,
        parse_mode: "HTML",
        reply_markup,
      });

      await context.bot.answerCallbackQuery({
        callback_query_id: update.callback_query.id,
      });
    } else if (data.startsWith("view:")) {
      const prodId = data.split(":")[1];
      const product = PRODUCTS.find((p) => p.id === prodId);
      if (product) {
        await context.bot.answerCallbackQuery({
          callback_query_id: update.callback_query.id,
          text: `Selected: ${product.name} (⭐ ${product.price})\n${product.description}`,
          show_alert: true,
        });
      }
    }
  }),
);

console.log("Pagination Catalog Bot ready.");
