/**
 * RFC 5545 RRule Scheduler with Structured Object Configuration Example.
 *
 * Demonstrates:
 * 1. Configuring complex recurrence rules using pure TypeScript objects instead of raw string syntax.
 * 2. Full type-safety with IDE autocomplete for `freq`, `byweekday`, `byhour`, `byminute`, `interval`, and `timezone`.
 * 3. Exact timezone conversions (e.g. Asia/Ho_Chi_Minh, Europe/London).
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/rrule-object-config-bot.ts
 */

import { Application, CommandHandler, type Update, type CallbackContext } from "../src/index.js";

const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN";
const app = new Application(token);

// 1. Structured Object Config: Daily at 9:30 AM (Vietnam Time)
app.scheduler.runRRule(
  async (context: CallbackContext) => {
    console.log("Morning Standup meeting scheduled via structured Object config.");
  },
  {
    // Pass clean TypeScript object instead of string:
    rrule: {
      freq: "DAILY",
      byhour: [9],
      byminute: [30],
      bysecond: [0],
    },
    timezone: "Asia/Ho_Chi_Minh",
    name: "vietnam_daily_standup",
  },
);

// 2. Structured Object Config: Every 2 weeks on Monday, Wednesday, Friday at 14:00 (London Time)
app.scheduler.runRRule(
  async (context: CallbackContext) => {
    console.log("Bi-weekly sync meeting in London timezone.");
  },
  {
    rrule: {
      freq: "WEEKLY",
      interval: 2,
      byweekday: ["MO", "WE", "FR"],
      byhour: [14],
      byminute: [0],
    },
    timezone: "Europe/London",
    name: "london_biweekly_sync",
  },
);

// 3. Structured Object Config: On the 1st and 15th of every month at 08:00
app.scheduler.runRRule(
  async (context: CallbackContext) => {
    console.log("Bi-monthly payroll and invoice reminder.");
  },
  {
    rrule: {
      freq: "MONTHLY",
      bymonthday: [1, 15],
      byhour: [8],
      byminute: [0],
    },
    timezone: "Asia/Ho_Chi_Minh",
    name: "payroll_reminder",
  },
);

app.addHandler(
  new CommandHandler("tasks", async (update: Update, context: CallbackContext) => {
    const jobs = context.job_queue?.jobs() ?? [];
    const summary = jobs
      .map((j) => `- ${j.name}: next run at ${new Date(j.next_t).toLocaleString()}`)
      .join("\n");

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Active Object-Configured Schedules:\n${summary || "No active jobs"}`,
    });
  }),
);

console.log("RRule Object Configuration Bot initialized.");
