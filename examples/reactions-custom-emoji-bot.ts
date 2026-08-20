/**
 * Telegram Message Reactions & Custom Emojis Bot Example.
 *
 * Demonstrates reacting to user messages with standard emojis, paid stars,
 * reading user reaction updates in real-time, and custom emoji reactions.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/reactions-custom-emoji-bot.ts
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

const app = new Application().token(token).build();

// /start command
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Send me any message! I will react to your message with a thumbs-up or fire emoji.",
    });
  })
);

// React to every user message
app.addHandler(
  new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update, context) => {
    const chatId = update.effective_chat!.id;
    const messageId = update.effective_message!.message_id;

    // React with thumbs-up emoji
    await context.bot.setMessageReaction({
      chat_id: chatId,
      message_id: messageId,
      reaction: [
        {
          type: "emoji",
          emoji: "👍",
        },
        {
          type: "emoji",
          emoji: "🔥",
        },
      ],
    });

    await context.bot.sendMessage({
      chat_id: chatId,
      text: "Reacted to your message!",
    });
  })
);

console.log("Reactions Bot is running...");
await app.runPolling({
  drop_pending_updates: true,
  allowed_updates: ["message", "message_reaction", "message_reaction_count"],
});
