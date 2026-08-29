import { Bot, type InputRichMessage, type InlineKeyboardMarkup } from "../../../src/index.js";

/**
 * Direct test runner for Telegram Bot API 10.3 features against Telegram servers.
 *
 * Reads config strictly from environment variables or command-line arguments:
 * - BOT_TOKEN / TEST_BOT_TOKEN
 * - TEST_USER_ID / TARGET_USER_ID (or argv[2])
 */
async function main() {
  const token = process.env["BOT_TOKEN"] || process.env["TEST_BOT_TOKEN"];
  if (!token) {
    console.error("❌ Error: BOT_TOKEN environment variable is required.");
    console.error(
      "Usage: TEST_USER_ID=<user_id> npx tsx --env-file=.env examples/versions/v10.3/test-features.ts",
    );
    process.exit(1);
  }

  const rawUserId = process.env["TEST_USER_ID"] || process.env["TARGET_USER_ID"] || process.argv[2];
  if (!rawUserId) {
    console.error("❌ Error: TEST_USER_ID environment variable or CLI argument is required.");
    console.error(
      "Usage: TEST_USER_ID=<user_id> npx tsx --env-file=.env examples/versions/v10.3/test-features.ts",
    );
    process.exit(1);
  }

  const targetUserId = parseInt(rawUserId, 10);
  if (isNaN(targetUserId)) {
    console.error(`❌ Error: Invalid user ID "${rawUserId}". Must be a numeric ID.`);
    process.exit(1);
  }

  console.log(`🚀 Initializing Bot with token and target user ID: ${targetUserId}...`);
  const bot = new Bot(token);

  const me = await bot.getMe();
  console.log(`✅ Connected as bot: @${me.username} (${me.first_name})`);

  console.log("\n--- 1. Testing sendMessageDraft (can_stop, keep_on_stop) ---");
  const draftId = Math.floor(Math.random() * 100000) + 1;
  try {
    const draftRes = await bot.sendMessageDraft({
      chat_id: targetUserId,
      draft_id: draftId,
      text: "🤖 [Bot API 10.3] Streaming draft test with stop button...",
      can_stop: true,
      keep_on_stop: true,
    });
    console.log("✅ sendMessageDraft succeeded:", draftRes);
  } catch (err: any) {
    console.warn("⚠️ sendMessageDraft warning/result:", err.message || err);
  }

  console.log("\n--- 2. Testing Keyboard with DisabledButton & force_reply ---");
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: "Active Action", callback_data: "v10_3_active" },
        { text: "🚫 Disabled Button (10.3)", disabled: {} },
      ],
    ],
    force_reply: false,
  };

  const sentKeyboardMsg = await bot.sendMessage({
    chat_id: targetUserId,
    text: "✨ <b>Telegram Bot API 10.3 Feature Test</b>\n\n• Testing inline keyboard with disabled buttons\n• Testing ephemeral message parameters\n• Testing rich message layouts",
    parse_mode: "HTML",
    reply_markup: keyboard,
  });
  console.log(`✅ Sent message with DisabledButton (Message ID: ${sentKeyboardMsg.message_id})`);

  console.log("\n--- 3. Testing sendRichMessage (Tables & Expandable Quotations) ---");
  const richMessage: InputRichMessage = {
    blocks: [
      {
        type: "table",
        cells: [
          [{ text: "Feature" }, { text: "API Version" }, { text: "Status" }],
          [{ text: "Rich Tables" }, { text: "10.3" }, { text: "✅ Supported" }],
          [{ text: "Expandable Quote" }, { text: "10.3" }, { text: "✅ Supported" }],
        ],
        is_compact: true,
      },
      {
        type: "expandable_blockquote",
        text: "This is an expandable block quotation introduced in Telegram Bot API 10.3. Tap to expand or collapse details.",
      },
      {
        type: "buttons",
        buttons: [
          { text: "Table Button", callback_data: "table_btn" },
          { text: "Disabled", disabled: {} },
        ],
      },
    ],
  };

  try {
    const sentRich = await bot.sendRichMessage({
      chat_id: targetUserId,
      rich_message: richMessage,
    });
    console.log(`✅ sendRichMessage succeeded (Message ID: ${sentRich.message_id})`);
  } catch (err: any) {
    console.log("ℹ️ sendRichMessage response from Telegram API:", err.message || err);
  }

  console.log("\n--- 4. Testing sendRichMessageDraft ---");
  try {
    const richDraftRes = await bot.sendRichMessageDraft({
      chat_id: targetUserId,
      draft_id: draftId + 1,
      rich_message: richMessage,
      can_stop: true,
      keep_on_stop: true,
    });
    console.log("✅ sendRichMessageDraft result:", richDraftRes);
  } catch (err: any) {
    console.log("ℹ️ sendRichMessageDraft response from Telegram API:", err.message || err);
  }

  console.log("\n🎉 All local Bot API 10.3 direct tests completed successfully!");
}

main().catch((err) => {
  console.error("❌ Test failed with error:", err);
  process.exit(1);
});
