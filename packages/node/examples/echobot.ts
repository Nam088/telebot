import {
  Application,
  CommandHandler,
  MessageHandler,
  filters,
  type Update,
  type CallbackContext,
} from "../src/index.js";

async function start(update: Update, context: CallbackContext) {
  const user = update.effective_user;
  const name = user ? user.first_name : "there";
  if (update.effective_chat) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: `Hi ${name}!`,
    });
  }
}

async function echo(update: Update, context: CallbackContext) {
  const message = update.effective_message;
  if (message && message.text && update.effective_chat) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: message.text,
    });
  }
}

async function main() {
  const token = process.env["BOT_TOKEN"] || process.env["TEST_BOT_TOKEN"];
  if (!token) {
    console.error("Error: BOT_TOKEN or TEST_BOT_TOKEN environment variable is required.");
    process.exit(1);
  }

  const app = Application.builder().token(token).build();

  app.addHandler(new CommandHandler("start", start));
  app.addHandler(new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), echo));

  console.log("Starting echo bot with polling...");
  await app.runPolling({ drop_pending_updates: true });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
