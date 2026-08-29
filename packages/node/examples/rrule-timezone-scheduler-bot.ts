/**
 * RFC 5545 RRule & Timezone Background Job Scheduler Example.
 *
 * Demonstrates:
 * 1. Setting up recurring jobs using RFC 5545 Recurrence Rules (RRule).
 * 2. Exact timezone conversion (e.g. Asia/Ho_Chi_Minh, America/New_York) without third-party dependencies.
 * 3. Handling weekday filters (e.g. Every Monday, Wednesday, Friday at 9:00 AM).
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/rrule-timezone-scheduler-bot.ts
 */

import { Application, CommandHandler, type Update, type CallbackContext } from "../src/index.js";

const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN";
const app = new Application(token);

// 1. Schedule a morning team announcement every Monday, Wednesday, Friday at 9:00 AM (Vietnam Time)
app.scheduler.runRRule(
  async (context: CallbackContext) => {
    console.log("Executing Vietnam Morning Standup notification...");
    // await context.bot.sendMessage({ chat_id: 123456, text: "Good morning team! Standup time." });
  },
  {
    rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
    timezone: "Asia/Ho_Chi_Minh",
    name: "vn_morning_standup",
  },
);

// 2. Schedule a monthly billing report on the 1st of every month at 00:00 (New York Time)
app.scheduler.runRRule(
  async (context: CallbackContext) => {
    console.log("Executing Monthly Billing Report in New York timezone...");
  },
  {
    rrule: "FREQ=MONTHLY;BYMONTHDAY=1;BYHOUR=0;BYMINUTE=0;BYSECOND=0",
    timezone: "America/New_York",
    name: "us_monthly_billing",
  },
);

app.addHandler(
  new CommandHandler("schedule", async (update: Update, context: CallbackContext) => {
    const activeJobs = context.job_queue?.jobs() ?? [];
    const jobNames = activeJobs
      .map((j) => `${j.name} (Next: ${new Date(j.next_t).toISOString()})`)
      .join("\n");

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Active Scheduled Jobs:\n${jobNames || "None"}`,
    });
  }),
);

console.log("RRule & Timezone Scheduler Bot initialized.");
