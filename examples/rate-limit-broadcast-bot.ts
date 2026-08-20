/**
 * Safe High-Volume Broadcast Bot Example with Rate-Limiting.
 *
 * Demonstrates broadcasting announcements to thousands of subscribers
 * safely without exceeding Telegram's 30 messages/second broadcast limits
 * while handling HTTP 429 backoff gracefully.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/rate-limit-broadcast-bot.ts
 */

import {
  Application,
  CommandHandler,
  TelegramApiError,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = new Application().token(token).build();

// In-memory subscriber list
const subscribers = new Set<number>();

// /subscribe command
app.addHandler(
  new CommandHandler("subscribe", async (update: Update, context: CallbackContext) => {
    const chatId = update.effective_chat!.id;
    subscribers.add(chatId);
    await context.bot.sendMessage({
      chat_id: chatId,
      text: "You are now subscribed to broadcast alerts! Send /broadcast <message> to test.",
    });
  })
);

// /broadcast [text] command
app.addHandler(
  new CommandHandler("broadcast", async (update: Update, context: CallbackContext) => {
    const adminChatId = update.effective_chat!.id;
    const message = context.args?.join(" ");

    if (!message) {
      await context.bot.sendMessage({
        chat_id: adminChatId,
        text: "Usage: /broadcast <your announcement message>",
      });
      return;
    }

    const targetList = Array.from(subscribers);
    if (targetList.length === 0) {
      await context.bot.sendMessage({
        chat_id: adminChatId,
        text: "No subscribers found. Send /subscribe first.",
      });
      return;
    }

    await context.bot.sendMessage({
      chat_id: adminChatId,
      text: `Starting broadcast to ${targetList.length} subscribers...`,
    });

    let successCount = 0;
    let failedCount = 0;

    for (const chatId of targetList) {
      try {
        await context.bot.sendMessage({
          chat_id: chatId,
          text: ` Announcement:\n\n${message}`,
        });
        successCount++;
      } catch (err: unknown) {
        failedCount++;
        if (err instanceof TelegramApiError && err.code === 403) {
          // Bot was blocked by the user - unsubscribe them
          subscribers.delete(chatId);
        }
      }

      // Throttle 35ms between sends (approx. 28 requests/sec safe rate ceiling)
      await new Promise((resolve) => setTimeout(resolve, 35));
    }

    await context.bot.sendMessage({
      chat_id: adminChatId,
      text: `Broadcast completed!\nDelivered: ${successCount}\nFailed/Blocked: ${failedCount}`,
    });
  })
);

console.log("Safe Broadcast Bot is running...");
await app.runPolling({ drop_pending_updates: true });
