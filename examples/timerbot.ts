/**
 * Timer & background job scheduler bot example.
 *
 * Demonstrates JobQueue, runOnce, runRepeating, and persistent job scheduling.
 */

import {
  Application,
  CommandHandler,
  type Update,
  type CallbackContext,
  type Job,
} from "../src/index.js";

async function start(update: Update, context: CallbackContext): Promise<void> {
  const text =
    "Hi! Use /set <seconds> to set a timer\n" +
    "Use /unset to cancel the active timer.";
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text,
  });
}

async function alarm(context: CallbackContext): Promise<void> {
  const job = context.job;
  if (!job || !job.chat_id) return;

  await context.bot.sendMessage({
    chat_id: job.chat_id,
    text: `Beep! Your timer for ${job.data} seconds has finished!`,
  });
}

async function setTimer(update: Update, context: CallbackContext): Promise<void> {
  const chatId = update.effective_chat!.id;
  const args = context.args ?? [];

  if (args.length === 0 || isNaN(Number(args[0]))) {
    await context.bot.sendMessage({
      chat_id: chatId,
      text: "Usage: /set <seconds>",
    });
    return;
  }

  const seconds = parseFloat(args[0]!);
  if (seconds <= 0) {
    await context.bot.sendMessage({
      chat_id: chatId,
      text: "Sorry, we can not go back to the future!",
    });
    return;
  }

  const jobName = `timer_${chatId}`;
  // Remove existing timer if running
  const existing = context.job_queue?.getJobsByName(jobName) ?? [];
  for (const job of existing) {
    job.scheduleRemoval();
  }

  context.job_queue?.runOnce(alarm, seconds, seconds, jobName, chatId);

  await context.bot.sendMessage({
    chat_id: chatId,
    text: `Timer successfully set for ${seconds} seconds!`,
  });
}

async function unset(update: Update, context: CallbackContext): Promise<void> {
  const chatId = update.effective_chat!.id;
  const jobName = `timer_${chatId}`;

  const existing = context.job_queue?.getJobsByName(jobName) ?? [];
  if (existing.length === 0) {
    await context.bot.sendMessage({
      chat_id: chatId,
      text: "You have no active timer.",
    });
    return;
  }

  for (const job of existing) {
    job.scheduleRemoval();
  }

  await context.bot.sendMessage({
    chat_id: chatId,
    text: "Timer successfully cancelled!",
  });
}

async function main() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.error("Please set BOT_TOKEN environment variable.");
    process.exit(1);
  }

  const app = new Application().token(token).build();

  app.addHandler(new CommandHandler("start", start));
  app.addHandler(new CommandHandler("help", start));
  app.addHandler(new CommandHandler("set", setTimer));
  app.addHandler(new CommandHandler("unset", unset));

  console.log("Starting timer bot...");
  await app.runPolling({ drop_pending_updates: true });
}

main().catch(console.error);
