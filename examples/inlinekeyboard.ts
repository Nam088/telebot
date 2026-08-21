import {
  Application,
  CommandHandler,
  CallbackQueryHandler,
  InlineKeyboard,
  type Update,
  type CallbackContext,
} from "../src/index.js";

async function start(update: Update, context: CallbackContext) {
  const keyboard = new InlineKeyboard()
    .text("Option 1", "opt_1")
    .text("Option 2", "opt_2")
    .row()
    .url("Documentation", "https://core.telegram.org/bots/api");

  if (update.effective_chat) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: "Please choose an option from the inline keyboard below:",
      reply_markup: keyboard.build(),
    });
  }
}

async function buttonCallback(update: Update, context: CallbackContext) {
  const query = update.callback_query;
  if (!query) return;

  await context.bot.answerCallbackQuery({
    callback_query_id: query.id,
    text: `You selected: ${query.data}`,
  });

  if (query.message && update.effective_chat) {
    await context.bot.editMessageText({
      chat_id: update.effective_chat.id,
      message_id: query.message.message_id,
      text: `Selected option: ${query.data}`,
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
  app.addHandler(new CallbackQueryHandler(buttonCallback));

  console.log("Starting inline keyboard bot with polling...");
  await app.runPolling({ drop_pending_updates: true });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
