import { Bot, Application, CommandHandler, MessageHandler, InlineQueryHandler, filters } from "../src/index.js";

const token = "6148725172:AAGcJYZkH7B5OudQwALgm4QhyEmyQuoT7G8";
const bot = new Bot(token);
const app = new Application(bot);

const PORT = 3000;
const SECRET_TOKEN = "tele_bot_secret_token_123456";

// 1. Command /start & /webhook
app.addHandler(
  new CommandHandler(["start", "webhook"], async (update, ctx) => {
    console.log("⚡ [Webhook Triggered] /start or /webhook received!");
    await ctx.reply("🎉 <b>Xin chào từ Webhook Server!</b>\n\nBot đang nhận updates qua <b>Webhook Mode</b> (Zero Dependencies)!\n\n👉 Thử gõ <code>/ping</code>, hoặc gõ inline <code>@dev_bot_nvn_bot [từ_khóa]</code> ở bất kỳ đâu!", {
      parse_mode: "HTML"
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

// 3. INLINE QUERY HANDLER (Gõ @dev_bot_nvn_bot <từ khóa> ở bất kỳ đâu)
app.addHandler(
  new InlineQueryHandler(async (update, ctx) => {
    const query = update.inline_query?.query || "";
    const queryId = update.inline_query!.id;
    console.log(`🔍 [Inline Query Received]: user typed "@dev_bot_nvn_bot ${query}"`);

    const results = [
      {
        type: "article",
        id: "1",
        title: `🚀 Tra cứu: "${query || "tele-bot framework"}"`,
        description: "Gửi thẻ kết quả tìm kiếm vào cuộc trò chuyện",
        input_message_content: {
          message_text: `🔎 <b>Kết quả tra cứu nhanh:</b>\n\n<b>Từ khóa:</b> <code>${query || "tele-bot"}</code>\n⚡ <b>Engine:</b> tele-bot Native TypeScript\n⭐ <b>Trạng thái:</b> 100% Full Parity Bot API 8.0+`,
          parse_mode: "HTML",
        },
      },
      {
        type: "article",
        id: "2",
        title: "📄 Tài liệu Hướng dẫn tele-bot",
        description: "Zero-dependency TypeScript Telegram Bot Engine",
        input_message_content: {
          message_text: "📘 <b>tele-bot Docs:</b>\n\n- Zero Runtime Dependencies\n- Native Node.js 22+ (SQLite, Fetch)\n- Full Type-Safe & Autocomplete",
          parse_mode: "HTML",
        },
      },
      {
        type: "article",
        id: "3",
        title: "🎲 Ném xúc xắc may mắn",
        description: "Gửi tin nhắn xúc xắc tương tác",
        input_message_content: {
          message_text: "🎲 Chúc bạn một ngày làm việc may mắn và code siêu mượt cùng <b>tele-bot</b>!",
          parse_mode: "HTML",
        },
      }
    ];

    await ctx.bot.answerInlineQuery({
      inline_query_id: queryId,
      results: results as any,
      cache_time: 0,
    });
    console.log(" -> answerInlineQuery sent successfully!");
  })
);

// 4. Fallback text handler
app.addHandler(
  new MessageHandler(filters.TEXT, async (update, ctx) => {
    const text = update.effective_message?.text;
    console.log(`⚡ [Webhook Received Message]: "${text}"`);
    await ctx.reply(`🤖 Webhook Bot đã nhận tin nhắn: <i>"${text}"</i>`, {
      parse_mode: "HTML"
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
