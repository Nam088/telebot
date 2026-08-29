import {
  Application,
  CommandHandler,
  PollAnswerHandler,
  type Update,
  type CallbackContext,
} from "../src/index.js";

async function start(update: Update, context: CallbackContext) {
  if (update.effective_chat) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat.id,
      text: "Welcome to PollBot! Use /poll to create a regular poll or /quiz for a quiz poll.",
    });
  }
}

async function sendPoll(update: Update, context: CallbackContext) {
  if (update.effective_chat) {
    await context.bot.sendPoll({
      chat_id: update.effective_chat.id,
      question: "What is your favorite TypeScript framework?",
      options: ["Node.js", "Deno", "Bun", "Other"],
      is_anonymous: false,
    });
  }
}

async function sendQuiz(update: Update, context: CallbackContext) {
  if (update.effective_chat) {
    await context.bot.sendPoll({
      chat_id: update.effective_chat.id,
      question: "What is the result of 2 + 2 * 2?",
      options: ["6", "8", "4", "10"],
      type: "quiz",
      correct_option_id: 0,
      explanation: "Multiplication precedes addition: 2 + (2 * 2) = 6.",
      is_anonymous: false,
    });
  }
}

async function handlePollAnswer(update: Update, _context: CallbackContext) {
  const answer = update.poll_answer;
  if (!answer) return;

  const user = answer.user;
  const userName = user ? user.first_name : "Anonymous";
  console.log(
    `Poll vote received: User ${userName} (ID: ${user?.id}) voted for options: ${answer.option_ids.join(", ")}`,
  );
}

async function main() {
  const token = process.env["BOT_TOKEN"] || process.env["TEST_BOT_TOKEN"];
  if (!token) {
    console.error("Error: BOT_TOKEN or TEST_BOT_TOKEN environment variable is required.");
    process.exit(1);
  }

  const app = Application.builder().token(token).build();

  app.addHandler(new CommandHandler("start", start));
  app.addHandler(new CommandHandler("poll", sendPoll));
  app.addHandler(new CommandHandler("quiz", sendQuiz));
  app.addHandler(new PollAnswerHandler(handlePollAnswer));

  console.log("Starting poll bot with polling...");
  await app.runPolling({
    drop_pending_updates: true,
    allowed_updates: ["message", "poll", "poll_answer"],
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
