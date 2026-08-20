import { Bot, Application, CommandHandler, MessageHandler, filters } from "../src/index.js";

const token = "6148725172:AAGcJYZkH7B5OudQwALgm4QhyEmyQuoT7G8";
const bot = new Bot(token);
const app = new Application(bot);

const PORT = 3000;
const SECRET_TOKEN = "tele_bot_secret_token_123456";

// 1. Command /start & /webhook
app.addHandler(
  new CommandHandler(["start", "webhook"], async (update, ctx) => {
    console.log("⚡ [Webhook Triggered] /start or /webhook received!");
    await ctx.reply("🎉 *Xin chào từ Webhook Server!*\n\nBot đang nhận updates trực tiếp thông qua **Webhook Mode** (Zero Dependencies)!\n\nThử gõ `/ping`, gửi tin nhắn bất kỳ hoặc gửi sticker xem nhé!", {
      parse_mode: "Markdown"
    });
  })
);

// 2. Command /ping (Tính thời gian xử lý thực tế)
app.addHandler(
  new CommandHandler("ping", async (update, ctx) => {
    const startTime = Date.now();
    const updateTime = update.effective_message?.date ? update.effective_message.date * 1000 : startTime;
    const diff = Math.max(0, startTime - updateTime);
    
    console.log(`⚡ [Webhook Triggered] /ping received! Lag: ${diff}ms`);
    await ctx.reply(`🏓 <b>Pong!</b>\n\n⏱ <b>Độ trễ Telegram Webhook:</b> ~${diff}ms\n⚡ <b>Engine:</b> tele-bot (Node.js native)\n🔒 <b>Chế độ:</b> Webhook (Secret Token verified)`, {
      parse_mode: "HTML"
    });
  })
);

// 3. Fallback text handler
app.addHandler(
  new MessageHandler(filters.TEXT, async (update, ctx) => {
    const text = update.effective_message?.text;
    console.log(`⚡ [Webhook Received Message]: "${text}"`);
    await ctx.reply(`🤖 Webhook Bot đã nhận tin nhắn: _"${text}"_`, {
      parse_mode: "Markdown"
    });
  })
);

// Start server
console.log(`Starting local Webhook server on port ${PORT}...`);
await app.runWebhook({
  port: PORT,
  path: "/telegram-webhook",
  secret_token: SECRET_TOKEN,
});

console.log(`🚀 Webhook server is listening on http://localhost:${PORT}/telegram-webhook`);
