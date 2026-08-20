# tele-bot

> A modern, zero-dependency, type-safe Telegram Bot framework for Node.js and TypeScript.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Coverage](https://img.shields.io/badge/Coverage-92.3%25-brightgreen.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)]()

---

## ⚡ Highlights

- 🚀 **Zero Required Runtime Dependencies**: Built strictly on modern Node.js 22+ built-ins (`globalThis.fetch`, `node:sqlite`, `node:http`, `node:crypto`).
- 🔒 **End-to-End Type Safety**: 100% TypeScript coverage under strict mode (`strict: true`, `noUncheckedIndexedAccess: true`).
- 🧩 **Domain-Driven Micro-Kernel Architecture**: Subpath exports for tree-shaking (`tele-bot/client`, `tele-bot/kernel`, `tele-bot/routing`, `tele-bot/filters`, `tele-bot/storage`, `tele-bot/scheduler`, `tele-bot/ui`).
- 💬 **Stateful Dialogs & FSM**: Supports both traditional FSM (`ConversationHandler`) and modern sequential async dialogs (`LinearConversation`).
- ⏰ **Native Task Scheduling**: Built-in background job scheduler (`runOnce`, `runRepeating`, `runDaily`) with restart state recovery.
- 💾 **Plug-and-Play Storage**: In-memory, atomic JSON file store, and high-performance native SQLite driver (`node:sqlite`).
- 🌐 **Dual Deployment Modes**: Seamlessly switch between Long Polling and production HTTP Webhook Server with `secret_token` verification.

---

## 📦 Installation

```bash
npm install tele-bot
```

*Requires Node.js version 22.0.0 or higher.*

---

## 🚀 Quick Start

### 1. Echo Bot (Long Polling)

```typescript
import {
  ApplicationBuilder,
  CommandHandler,
  MessageHandler,
  filters,
  type Update,
  type CallbackContext,
} from "tele-bot";

const app = new ApplicationBuilder()
  .token(process.env.BOT_TOKEN!)
  .build();

// Handle /start command
app.addHandler(new CommandHandler("start", async (update: Update, context: CallbackContext) => {
  const name = update.effective_user?.first_name ?? "friend";
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: `Hello ${name}! Welcome to tele-bot.`,
  });
}));

// Echo non-command text messages
app.addHandler(new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update, context) => {
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: update.effective_message!.text!,
  });
}));

// Start polling
await app.runPolling({ drop_pending_updates: true });
```

---

## 📚 Core Features & Architecture

### 1. Modern Linear Conversations (`LinearConversation`)

Write intuitive multi-step conversation scripts sequentially in a single `async/await` function without managing messy state machines:

```typescript
import { ApplicationBuilder, LinearConversation } from "tele-bot";

const survey = new LinearConversation(async (conversation, context) => {
  // Step 1: Ask user name and wait for their answer
  const name = await conversation.ask("What is your name?");

  // Step 2: Ask age and validate naturally with a loop
  let age: number | undefined;
  while (!age) {
    const answer = await conversation.ask(`Nice to meet you, ${name}! How old are you?`);
    const parsed = parseInt(answer, 10);
    if (!isNaN(parsed) && parsed > 0) {
      age = parsed;
    } else {
      await context.bot.sendMessage({
        chat_id: context.update!.effective_chat!.id,
        text: "Please enter a valid positive number!",
      });
    }
  }

  // Step 3: Complete conversation
  await context.bot.sendMessage({
    chat_id: context.update!.effective_chat!.id,
    text: `Thank you! Your profile has been saved: ${name}, ${age} years old.`,
  });
}, {
  entry_command: "survey",
});

app.addHandler(survey);
```

---

### 2. State Persistence (JSON & Native SQLite)

Persist `user_data`, `chat_data`, `bot_data`, and active conversations across bot restarts:

```typescript
import { ApplicationBuilder, SqlitePersistence } from "tele-bot";

// Native SQLite storage using Node.js 22+ built-in `node:sqlite`
const persistence = new SqlitePersistence({
  dbPath: "./data/bot_state.sqlite",
});

const app = new ApplicationBuilder()
  .token(process.env.BOT_TOKEN!)
  .persistence(persistence)
  .build();
```

---

### 3. Background Task Scheduler (`JobQueue`)

Schedule delayed timers, intervals, and daily recurring jobs:

```typescript
import { ApplicationBuilder, CommandHandler } from "tele-bot";

const app = new ApplicationBuilder().token(process.env.BOT_TOKEN!).build();

// Schedule a reminder after 60 seconds
app.addHandler(new CommandHandler("remind", async (update, context) => {
  const chatId = update.effective_chat!.id;

  context.job_queue?.runOnce(async (jobCtx) => {
    await jobCtx.bot.sendMessage({
      chat_id: chatId,
      text: "⏰ Ding! Your 60-second reminder is up!",
    });
  }, 60);

  await context.bot.sendMessage({
    chat_id: chatId,
    text: "Reminder set for 60 seconds from now.",
  });
}));
```

---

### 4. Interactive Keyboards & UI Builders

Easily create inline button grids and custom reply keyboards:

```typescript
import { InlineKeyboard } from "tele-bot";

const keyboard = new InlineKeyboard()
  .text("👍 Like", "like_click")
  .text("👎 Dislike", "dislike_click")
  .row()
  .url("🌐 Official Website", "https://telegram.org");

await bot.sendMessage({
  chat_id: 123456,
  text: "How do you rate this framework?",
  reply_markup: keyboard,
});
```

---

### 5. Production Webhook Server

Run behind reverse proxies (Nginx, Cloudflare, AWS ALB) with cryptographic secret token validation:

```typescript
const app = new ApplicationBuilder()
  .token(process.env.BOT_TOKEN!)
  .build();

// Register your handlers...

await app.runWebhook({
  listen: "0.0.0.0",
  port: 8443,
  path: "/telegram-webhook",
  secret_token: process.env.WEBHOOK_SECRET,
});
```

---

## 🧪 Testing & Verification

```bash
# Run full unit & integration test suite
npm test

# Run tests with code coverage report (>92% line coverage)
npm run test:coverage

# Generate TypeDoc API documentation
npm run docs
```

---

## 🏛️ Design Conventions

- **Verbs / Methods you call (`()`)** ➔ `camelCase`: `bot.sendMessage()`, `app.runPolling()`, `app.addHandler()`, `jobQueue.runOnce()`.
- **Nouns / Properties / Telegram Schema** ➔ `snake_case`: `context.user_data`, `context.chat_data`, `context.job_queue`, `update.effective_user`, `chat_id`, `message_id`.

---

## 📄 License

MIT © 2026 tele-bot contributors

