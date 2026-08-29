import {
  Application,
  CommandHandler,
  CallbackQueryHandler,
  type Update,
  type CallbackContext,
  type InputRichMessage,
  type InlineKeyboardMarkup,
} from "../../../src/index.js";

/**
 * Interactive polling demo bot for Telegram Bot API 10.3 features.
 *
 * Reads config strictly from environment variables:
 * - BOT_TOKEN / TEST_BOT_TOKEN
 */
async function start(update: Update, context: CallbackContext) {
  const chatId = update.effective_chat?.id;
  if (!chatId) return;

  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: "📊 Send Rich Message", callback_data: "demo_rich" },
        { text: "⏳ Stream Draft with Stop", callback_data: "demo_draft" },
      ],
      [
        { text: "👻 Send Ephemeral Message", callback_data: "demo_ephemeral" },
        { text: "🚫 Disabled Button (10.3)", disabled: {} },
      ],
    ],
  };

  await context.bot.sendMessage({
    chat_id: chatId,
    text: "✨ <b>Telegram Bot API 10.3 Demo Bot</b>\n\nChoose an action below to test the new features:",
    parse_mode: "HTML",
    reply_markup: keyboard,
  });

}

async function handleRich(update: Update, context: CallbackContext) {
  const chatId = update.effective_chat?.id;
  if (!chatId) return;

  const richMsg: InputRichMessage = {
    blocks: [
      {
        type: "table",
        cells: [
          [{ text: "Feature" }, { text: "Status" }],
          [{ text: "Rich Tables" }, { text: "✅ Supported" }],
          [{ text: "Bot API 10.3" }, { text: "🚀 Live" }],
        ],
        is_compact: true,
      },
      {
        type: "expandable_blockquote",
        text: "This is an expandable block quotation introduced in Bot API 10.3. Users can tap to expand or collapse this section.",
      },
      {
        type: "buttons",
        buttons: [
          { text: "Active Button", callback_data: "demo_active" },
          { text: "Disabled Button", disabled: {} },
        ],
      },
    ],
  };


  await context.bot.sendRichMessage({
    chat_id: chatId,
    rich_message: richMsg,
  });

  if (update.callback_query) {
    await context.bot.answerCallbackQuery({
      callback_query_id: update.callback_query.id,
      text: "Rich Message sent!",
    });
  }
}

async function handleDraft(update: Update, context: CallbackContext) {
  const chatId = update.effective_chat?.id;
  if (!chatId) return;

  const draftId = Math.floor(Math.random() * 100000) + 1;

  await context.bot.sendMessageDraft({
    chat_id: chatId,
    draft_id: draftId,
    text: "🤖 AI Assistant is typing with stop button enabled...",
    can_stop: true,
    keep_on_stop: true,
  });

  if (update.callback_query) {
    await context.bot.answerCallbackQuery({
      callback_query_id: update.callback_query.id,
      text: "Message draft with stop button sent to chat!",
    });
  }
}

async function handleEphemeral(update: Update, context: CallbackContext) {
  const chatId = update.effective_chat?.id;
  const user = update.effective_user;
  if (!chatId || !user) return;

  await context.bot.sendMessage({
    chat_id: chatId,
    text: "🔒 This is an ephemeral message visible only to you!",
    ephemeral_message_parameters: {
      receiver_user_id: user.id,
      callback_query_id: update.callback_query?.id,
      replace_callback_query_message: false,
    },
  });

  if (update.callback_query) {
    await context.bot.answerCallbackQuery({
      callback_query_id: update.callback_query.id,
    });
  }
}

async function main() {
  const token = process.env["BOT_TOKEN"] || process.env["TEST_BOT_TOKEN"];
  if (!token) {
    console.error("❌ Error: BOT_TOKEN or TEST_BOT_TOKEN environment variable is required.");
    console.error("Usage: npx tsx --env-file=.env examples/versions/v10.3/demo.ts");
    process.exit(1);
  }

  const app = Application.builder().token(token).build();

  app.addHandler(new CommandHandler("start", start));
  app.addHandler(new CallbackQueryHandler(handleRich, "demo_rich"));
  app.addHandler(new CallbackQueryHandler(handleDraft, "demo_draft"));
  app.addHandler(new CallbackQueryHandler(handleEphemeral, "demo_ephemeral"));

  console.log("🚀 Starting Bot API 10.3 Demo Bot with polling...");
  await app.runPolling({ drop_pending_updates: true });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
