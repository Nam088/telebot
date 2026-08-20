/**
 * Telegram Stars & Digital Goods Payment Bot Example.
 *
 * Demonstrates Telegram Stars invoices, pre-checkout queries,
 * refunds, and star balance checking.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/stars-payment-bot.ts
 */

import {
  Application,
  CommandHandler,
  InlineKeyboard,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = new Application().token(token).build();

// /start command - Show store catalog
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const keyboard = new InlineKeyboard()
      .text("Buy VIP Badge (50 Stars)", "buy_vip")
      .row()
      .text("Buy Premium Sticker Pack (25 Stars)", "buy_stickers")
      .row()
      .text("Check Star Balance", "check_balance");

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Welcome to the Digital Stars Shop! Select an item below to purchase with Telegram Stars:",
      reply_markup: keyboard,
    });
  })
);

// /buy command - Send Stars invoice
app.addHandler(
  new CommandHandler("buy", async (update: Update, context: CallbackContext) => {
    await context.bot.sendInvoice({
      chat_id: update.effective_chat!.id,
      title: "VIP Community Pass",
      description: "Get 30 days of VIP benefits and private channel access.",
      payload: "vip_pass_30_days",
      currency: "XTR", // Telegram Stars currency code
      prices: [
        { label: "VIP Pass", amount: 50 }, // 50 Telegram Stars
      ],
    });
  })
);

// /balance command - Query bot's Star balance
app.addHandler(
  new CommandHandler("balance", async (update: Update, context: CallbackContext) => {
    try {
      const balance = await context.bot.getMyStarBalance();
      await context.bot.sendMessage({
        chat_id: update.effective_chat!.id,
        text: `Current Bot Telegram Stars Balance: ${balance.amount} Stars.`,
      });
    } catch (err: unknown) {
      await context.bot.sendMessage({
        chat_id: update.effective_chat!.id,
        text: `Could not retrieve balance: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  })
);

console.log("Telegram Stars Payment Bot is running...");
await app.runPolling({ drop_pending_updates: true });
