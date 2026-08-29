import {
  Application,
  CommandHandler,
  ChatMemberHandler,
  type Update,
  type CallbackContext,
} from "../src/index.js";

async function start(update: Update, context: CallbackContext) {
  if (update.effective_chat) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: "Hello! Add me to a group chat with admin permissions to monitor member joins, leaves, and bot status changes.",
    });
  }
}

async function handleChatMember(update: Update, context: CallbackContext) {
  const cm = update.chat_member;
  if (!cm || !update.effective_chat) return;

  const oldStatus = cm.old_chat_member.status;
  const newStatus = cm.new_chat_member.status;
  const user = cm.new_chat_member.user;

  if (oldStatus === "left" && newStatus === "member") {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: `Welcome to the group, ${user.first_name}! `,
    });
  } else if (newStatus === "left" || newStatus === "kicked") {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: `Goodbye, ${user.first_name}! `,
    });
  }
}

async function handleMyChatMember(update: Update, context: CallbackContext) {
  const mcm = update.my_chat_member;
  if (!mcm || !update.effective_chat) return;

  const newStatus = mcm.new_chat_member.status;
  console.log(
    `Bot's chat member status in chat ${update.effective_chat.id} changed to: ${newStatus}`,
  );

  if (newStatus === "administrator") {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: "Thank you for promoting me to administrator! ",
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
  app.addHandler(new ChatMemberHandler(handleChatMember, ChatMemberHandler.CHAT_MEMBER));
  app.addHandler(new ChatMemberHandler(handleMyChatMember, ChatMemberHandler.MY_CHAT_MEMBER));

  console.log("Starting chat member bot with polling...");
  await app.runPolling({
    drop_pending_updates: true,
    allowed_updates: ["message", "chat_member", "my_chat_member"],
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
