/**
 * Telegram Forum Topics & General Topic Bot Example.
 *
 * Demonstrates creating forum topics, sending messages into specific
 * thread IDs, closing, and reopening topics.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/forum-topics-bot.ts
 */

import {
  ApplicationBuilder,
  CommandHandler,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = new ApplicationBuilder().token(token).build();

// /newtopic [name] - Creates a new forum topic in the supergroup
app.addHandler(
  new CommandHandler("newtopic", async (update: Update, context: CallbackContext) => {
    const chatId = update.effective_chat!.id;
    const topicName = context.args?.join(" ") || "General Discussion";

    try {
      const topic = await context.bot.createForumTopic({
        chat_id: chatId,
        name: topicName,
      });

      await context.bot.sendMessage({
        chat_id: chatId,
        message_thread_id: topic.message_thread_id,
        text: `Topic "${topic.name}" created successfully! Welcome to this thread.`,
      });
    } catch (err: unknown) {
      await context.bot.sendMessage({
        chat_id: chatId,
        text: `Failed to create topic: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  })
);

// /closetopic - Closes current topic thread
app.addHandler(
  new CommandHandler("closetopic", async (update: Update, context: CallbackContext) => {
    const chatId = update.effective_chat!.id;
    const threadId = update.effective_message?.message_thread_id;

    if (!threadId) {
      await context.bot.sendMessage({
        chat_id: chatId,
        text: "This command must be sent inside a forum topic thread.",
      });
      return;
    }

    await context.bot.closeForumTopic(chatId, threadId);
    await context.bot.sendMessage({
      chat_id: chatId,
      message_thread_id: threadId,
      text: "This topic has been closed.",
    });
  })
);

console.log("Forum Topics Bot is running...");
await app.runPolling({ drop_pending_updates: true });
