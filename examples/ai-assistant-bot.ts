/**
 * AI Streaming and Rich Formatting Bot Example.
 *
 * Demonstrates streaming response simulation, markdown formatting,
 * and Telegram Bot API rich messaging features.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/ai-assistant-bot.ts
 */

import {
  Application,
  CommandHandler,
  MessageHandler,
  filters,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = Application.builder().token(token).build();

// /start command
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const user = update.effective_user?.first_name ?? "User";
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Hello ${user}! Send me any prompt or question, and I will stream a response like an AI assistant.`,
    });
  })
);

// Stream text message response
app.addHandler(
  new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update, context) => {
    const chatId = update.effective_chat!.id;
    const prompt = update.effective_message!.text ?? "";

    // Step 1: Send typing chat action
    await context.bot.sendChatAction({
      chat_id: chatId,
      action: "typing",
    });

    // Step 2: Send initial placeholder message
    const msg = await context.bot.sendMessage({
      chat_id: chatId,
      text: "Thinking...",
    });

    // Step 3: Simulate incremental token streaming
    const answer = `Analysis for "${prompt}":\n\n1. TypeScript provides end-to-end type safety.\n2. Node.js 22 built-ins eliminate third-party dependencies.\n3. Native SQLite ensures ultra-fast local state persistence.`;
    const words = answer.split(" ");
    let currentText = "";

    for (let i = 0; i < words.length; i += 3) {
      currentText += words.slice(i, i + 3).join(" ") + " ";
      await context.bot.editMessageText({
        chat_id: chatId,
        message_id: msg.message_id,
        text: currentText.trim(),
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  })
);

console.log("AI Assistant Bot is running in polling mode...");
await app.runPolling({ drop_pending_updates: true });
