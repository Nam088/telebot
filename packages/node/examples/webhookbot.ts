/**
 * Production-ready Webhook Bot example.
 *
 * Demonstrates running the built-in HTTP webhook server with secret token authentication.
 */

import {
  Application,
  CommandHandler,
  MessageHandler,
  filters,
  type Update,
  type CallbackContext,
} from "../src/index.js";

async function start(update: Update, context: CallbackContext): Promise<void> {
  const user = update.effective_user;
  const name = user ? user.first_name : "friend";
  if (update.effective_chat) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: `Hello ${name}! This bot is running in high-performance Webhook mode!`,
    });
  }
}

async function echo(update: Update, context: CallbackContext): Promise<void> {
  const message = update.effective_message;
  if (message?.text && update.effective_chat) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: `Webhook Echo: ${message.text}`,
    });
  }
}

async function main() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.error("Please set BOT_TOKEN environment variable.");
    process.exit(1);
  }

  const app = Application.builder().token(token).build();

  app.addHandler(new CommandHandler("start", start));
  app.addHandler(new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), echo));

  const port = Number(process.env.PORT) || 8443;
  const secretToken = process.env.WEBHOOK_SECRET || "my-custom-secret-token";

  console.log(`Starting webhook server on port ${port}...`);
  await app.runWebhook({
    port,
    path: "/telegram-webhook",
    secret_token: secretToken,
  });
}

main().catch(console.error);
