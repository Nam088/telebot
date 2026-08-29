/**
 * Express Webhook Bot Example.
 *
 * Demonstrates integrating telebot-ts with an Express server using `createExpressWebhook` / `webhookCallback`.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" WEBHOOK_SECRET="your_secret" npx tsx examples/express-webhook-bot.ts
 */

import { Application, CommandHandler, createExpressWebhook } from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const secretToken = process.env.WEBHOOK_SECRET || "super_secret_token_123";

// Create Application instance
const app = Application.builder().token(token).build();

// Register handlers
app.addHandler(
  new CommandHandler("start", async (update, context) => {
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Hello from Express Webhook Bot! 🚀",
    });
  }),
);

app.addHandler(
  new CommandHandler("ping", async (update, context) => {
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Pong! 🏓",
    });
  }),
);

// Create the webhook middleware handler
const webhookHandler = createExpressWebhook(app, {
  secret_token: secretToken,
});

console.log("Express Webhook Handler created successfully with secret token protection.");
console.log("To mount in Express:");
console.log("  app.use(express.json());");
console.log("  app.post('/webhook', webhookHandler);");
