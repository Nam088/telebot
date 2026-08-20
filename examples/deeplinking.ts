import {
  Application,
  CommandHandler,
  type Update,
  type CallbackContext,
} from "../src/index.js";

async function start(update: Update, context: CallbackContext) {
  if (!update.effective_chat) return;

  const payload = context.args?.[0];

  if (payload) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: `Welcome! You accessed this bot via a deep link with payload: "${payload}"`,
    });
  } else {
    const me = await context.bot.getMe();
    const botUsername = me.username ?? "your_bot";
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text:
        `Welcome! You started the bot without parameters.\n\n` +
        `Try deep linking with parameters like:\n` +
        `https://t.me/${botUsername}?start=referral_12345\n` +
        `https://t.me/${botUsername}?start=coupon_DISCOUNT`,
    });
  }
}

async function main() {
  const token = process.env["BOT_TOKEN"] || process.env["TEST_BOT_TOKEN"];
  if (!token) {
    console.error("Error: BOT_TOKEN or TEST_BOT_TOKEN environment variable is required.");
    process.exit(1);
  }

  const app = new Application().token(token).build();

  app.addHandler(new CommandHandler("start", start));

  console.log("Starting deep linking bot with polling...");
  await app.runPolling({ drop_pending_updates: true });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
