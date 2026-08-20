/**
 * SQLite Persistent State Bot Example.
 *
 * Demonstrates persisting user session counters, notes, and preferences
 * permanently across bot process restarts using native `node:sqlite`.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/sqlite-persistence-bot.ts
 */

import {
  Application,
  CommandHandler,
  MessageHandler,
  filters,
  SqlitePersistence,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

// Initialize native SQLite persistence driver
const persistence = new SqlitePersistence({
  dbPath: "./bot_state.sqlite",
});

const app = new Application(token, { persistence });

// /start command - Show persisted stats
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const user = update.effective_user?.first_name ?? "User";
    const count = (context.user_data["count"] as number) ?? 0;

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Hello ${user}!\n\nYour message count stored in SQLite: ${count}\n\nTry sending messages or /reset to see persistence survive process restarts.`,
    });
  })
);

// /reset command
app.addHandler(
  new CommandHandler("reset", async (update: Update, context: CallbackContext) => {
    context.user_data["count"] = 0;
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Your counter has been reset to 0 in SQLite database.",
    });
  })
);

// Message counter - increments on every text message
app.addHandler(
  new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update, context) => {
    const currentCount = ((context.user_data["count"] as number) || 0) + 1;
    context.user_data["count"] = currentCount;

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Message #${currentCount} recorded into persistent SQLite database.`,
    });
  })
);

console.log("SQLite Persistence Bot is running...");
await app.runPolling({ drop_pending_updates: true });
