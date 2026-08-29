# telebot-ts

> A modern, zero-dependency, high-performance, and type-safe Telegram Bot framework for Node.js and TypeScript.

[![npm version](https://img.shields.io/npm/v/telebot-ts.svg)](https://www.npmjs.com/package/telebot-ts)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Coverage](https://img.shields.io/badge/Coverage-95.39%25-brightgreen.svg)](<>)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)](<>)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

`telebot-ts` is built from the ground up for modern Node.js environments (v22+). It offers complete coverage of the Telegram Bot API with zero required external runtime dependencies, leveraging native platform features such as `globalThis.fetch`, `node:sqlite`, and `node:http`.

### Highlights

- **Zero Required Runtime Dependencies**: Runs entirely on native Node.js built-ins.
- **Full API Parity**: Comprehensive coverage of all Bot API methods, including Telegram Stars, Paid Media, Webhooks, Stories, Business Accounts, and Star Gifts.
- **End-to-End Type Safety**: 100% strict TypeScript types and IntelliSense autocompletion across all payloads and parameters.
- **Domain-Driven Architecture**: Subpath exports for optimal tree-shaking (`telebot-ts/client`, `telebot-ts/kernel`, `telebot-ts/routing`, `telebot-ts/filters`, `telebot-ts/storage`, `telebot-ts/scheduler`, `telebot-ts/ui`).
- **Flexible State Management**: Supports sequential wizard flows (`LinearConversation`), finite state machines (`ConversationHandler`), and persistent storage drivers (Memory, JSON file, SQLite).
- **Production-Ready Webhooks**: Built-in HTTP webhook server with automatic secret token verification and custom server integration.
- **Reliable Networking**: Automatic exponential backoff for rate limits (`429 Too Many Requests`) and server errors (`5xx`).

---

## Requirements

- Node.js version **22.0.0** or higher
- TypeScript **5.0+** (optional, recommended for type safety)

---

## Installation

```bash
npm install telebot-ts
```

---

## Quick Start

### 1. Echo Bot (Long Polling)

```typescript
import {
  ApplicationBuilder,
  CommandHandler,
  MessageHandler,
  filters,
  type Update,
  type CallbackContext,
} from "telebot-ts";

const app = new ApplicationBuilder().token(process.env.BOT_TOKEN!).build();

// Handle /start command
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const name = update.effective_user?.first_name ?? "friend";
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Hello ${name}! Welcome to telebot-ts.`,
    });
  }),
);

// Echo text messages
app.addHandler(
  new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (update, context) => {
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: update.effective_message!.text!,
    });
  }),
);

// Start polling
await app.runPolling({ drop_pending_updates: true });
```

---

## Architecture & Subpath Exports

`telebot-ts` is structured as modular subpaths, allowing you to import only what you need:

```typescript
import { Application, ApplicationBuilder } from "telebot-ts"; // Core framework
import { Bot, TelegramApiError } from "telebot-ts/client"; // Low-level Bot API client
import { CommandHandler, MessageHandler } from "telebot-ts/routing"; // Update handlers
import { filters } from "telebot-ts/filters"; // Update and message filters
import { SqlitePersistence, JsonFilePersistence } from "telebot-ts/storage"; // State storage
import { JobQueue } from "telebot-ts/scheduler"; // Background job runner
import { InlineKeyboard, ReplyKeyboard } from "telebot-ts/ui"; // Keyboard layout builders
import { logger } from "telebot-ts/utils"; // Structured logging
```

---

## Core Capabilities

### 1. Sequential Linear Conversations

Write step-by-step interactive dialogs sequentially in an `async/await` handler without managing complex state transitions:

```typescript
import { LinearConversation } from "telebot-ts";

const onboarding = new LinearConversation(async (control) => {
  await control.reply("What is your username?");
  const usernameUpdate = await control.wait();
  const username = usernameUpdate.effective_message?.text ?? "Guest";

  await control.reply(`Welcome, ${username}! What is your preferred contact email?`);
  const emailUpdate = await control.wait();
  const email = emailUpdate.effective_message?.text ?? "Not provided";

  await control.reply(`Registration complete for ${username} (${email}).`);
});

app.addHandler(onboarding.createHandler("/register"));
```

---

### 2. Finite State Machine (`ConversationHandler`)

For branching workflows with explicit states, fallbacks, and persistence across restarts:

```typescript
import { ConversationHandler, CommandHandler, MessageHandler, filters } from "telebot-ts";

const STATE_NAME = 1;
const STATE_PHOTO = 2;

const profileHandler = new ConversationHandler({
  entry_points: [
    new CommandHandler("profile", async (update, context) => {
      await context.bot.sendMessage({
        chat_id: update.effective_chat!.id,
        text: "Please send your profile name:",
      });
      return STATE_NAME;
    }),
  ],
  states: {
    [STATE_NAME]: [
      new MessageHandler(filters.TEXT, async (update, context) => {
        context.user_data.name = update.effective_message!.text;
        await context.bot.sendMessage({
          chat_id: update.effective_chat!.id,
          text: "Now please upload your profile picture (or /skip):",
        });
        return STATE_PHOTO;
      }),
    ],
    [STATE_PHOTO]: [
      new MessageHandler(filters.PHOTO, async (update, context) => {
        await context.bot.sendMessage({
          chat_id: update.effective_chat!.id,
          text: `Profile setup complete for ${context.user_data.name}!`,
        });
        return ConversationHandler.END;
      }),
      new CommandHandler("skip", async (update, context) => {
        await context.bot.sendMessage({
          chat_id: update.effective_chat!.id,
          text: `Profile saved without photo.`,
        });
        return ConversationHandler.END;
      }),
    ],
  },
  fallbacks: [
    new CommandHandler("cancel", async (update, context) => {
      await context.bot.sendMessage({
        chat_id: update.effective_chat!.id,
        text: "Profile setup canceled.",
      });
      return ConversationHandler.END;
    }),
  ],
});

app.addHandler(profileHandler);
```

---

### 3. State Persistence (Memory, JSON, SQLite)

Preserve user session data, conversation progress, and bot metadata across application restarts:

```typescript
import { ApplicationBuilder, SqlitePersistence } from "telebot-ts";

// Native SQLite storage powered by Node.js built-in node:sqlite
const persistence = new SqlitePersistence({
  dbPath: "./data/bot_state.sqlite",
});

const app = new ApplicationBuilder().token(process.env.BOT_TOKEN!).persistence(persistence).build();
```

---

### 4. Background Job Scheduling (`JobQueue`)

Schedule delayed timers, recurring interval jobs, or scheduled daily tasks:

```typescript
app.addHandler(
  new CommandHandler("remind", async (update, context) => {
    const chatId = update.effective_chat!.id;

    // Run a one-shot task in 60 seconds
    context.job_queue?.runOnce(async (jobContext) => {
      await jobContext.bot.sendMessage({
        chat_id: chatId,
        text: "Your 60-second reminder is due.",
      });
    }, 60);

    await context.bot.sendMessage({
      chat_id: chatId,
      text: "Reminder scheduled for 60 seconds from now.",
    });
  }),
);
```

---

### 5. Fluent Keyboard Builders

Construct clean inline and reply keyboards with a chainable builder API:

```typescript
import { InlineKeyboard, ReplyKeyboard } from "telebot-ts";

// Inline Keyboard markup
const inlineMenu = new InlineKeyboard()
  .text("Confirm", "action_confirm")
  .text("Cancel", "action_cancel")
  .row()
  .url("Documentation", "https://core.telegram.org/bots/api");

// Reply Keyboard markup
const replyMenu = new ReplyKeyboard()
  .text("Profile")
  .text("Settings")
  .row()
  .requestContact("Share Contact")
  .requestLocation("Share Location")
  .resized()
  .oneTime();

await bot.sendMessage({
  chat_id: 123456,
  text: "Choose an option:",
  reply_markup: inlineMenu,
});
```

---

### 6. Production Webhook Server

Deploy on any cloud provider or serverless container behind reverse proxies (Nginx, Cloudflare, AWS ALB) with cryptographic secret token validation:

```typescript
const app = new ApplicationBuilder().token(process.env.BOT_TOKEN!).build();

// Start native HTTP webhook listener
await app.runWebhook({
  listen: "0.0.0.0",
  port: 8443,
  path: "/telegram-webhook",
  secret_token: process.env.WEBHOOK_SECRET,
  allowed_updates: ["message", "callback_query", "inline_query"],
});
```

---

### 7. File Uploads & Buffers

Send files seamlessly using File IDs, remote URLs, or in-memory binary buffers:

```typescript
import { InputFile } from "telebot-ts";
import * as fs from "node:fs/promises";

// Upload buffer directly
const buffer = await fs.readFile("./report.pdf");
await bot.sendDocument({
  chat_id: 123456,
  document: new InputFile(buffer, "Monthly_Report.pdf"),
  caption: "Generated report attached.",
});
```

---

### 8. Pluggable Structured Logging

Integrated zero-dependency structured logger with support for external logging libraries (Pino, Winston):

```typescript
import { logger } from "telebot-ts";

// Adjust logging verbosity
logger.setLevel("debug");

// Integrate with custom Pino logger
// import pino from "pino";
// const customLogger = pino();
// logger.setLogger(customLogger);
```

---

### 9. Plugin System & Extension Points

Third-party features ship as self-contained plugins. A plugin is a named object whose synchronous `install()` receives the `Application` and registers itself through the extension points below:

| Extension point      | API                                                            | Use it for                                                                        |
| -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Plugin registration  | `app.usePlugin(plugin)`                                        | Entry point; installs once (duplicate names throw), honors `dependsOn`/`priority` |
| Middleware           | `app.use(fn)`                                                  | Wrap every update (auth, metrics, attaching sessions)                             |
| Handlers             | `app.addHandler()` / `app.addErrorHandler()`                   | React to updates or handler failures                                              |
| Lifecycle hooks      | `app.onInit(hook)` / `app.onShutdown(hook)`                    | Async setup/teardown around `runPolling` / `runWebhook` / `stop`                  |
| Request transforms   | `bot.transformRequest(fn, tag?)`                               | Mutate every outgoing API payload (defaults, audit logging)                       |
| Response/error hooks | `bot.transformResponse(fn, tag?)` / `bot.onApiError(fn, tag?)` | Observe or rewrite results; alert on API failures                                 |
| Namespaced state     | `app.pluginState(name)`                                        | Private per-plugin state that never collides with bot data                        |
| Removal              | `app.removePlugin(name)`                                       | Full deregistration (`uninstall` hook + everything the plugin registered)         |

**Installing a plugin:**

```typescript
import { Application, plugins, i18nFor } from "telebot-ts";

const app = new Application(token);

app.usePlugin(
  plugins.i18n({
    default_locale: "en",
    locales: {
      en: { hello: "Hello, {name}!" },
      vi: { hello: "Xin chào, {name}!" },
    },
  }),
);

app.on("message", async (update, context) => {
  await context.reply(i18nFor(context)!.t("hello", { name: "Nam" }));
});
```

**Writing your own plugin:**

```typescript
import type { Plugin, Application } from "telebot-ts";

export function rateLimitReporter(): Plugin {
  return {
    name: "my-plugin-rate-limit-reporter",
    // Install only after "telebot-plugin-i18n"; lower priority installs first
    // among simultaneously ready plugins.
    dependsOn: ["telebot-plugin-i18n"],
    priority: 0,
    install(app: Application) {
      // 1. Lifecycle: async setup runs before polling/webhook starts.
      app.onInit(async () => {
        /* open connections, load state */
      });
      app.onShutdown(async () => {
        /* flush and close */
      });

      // 2. Middleware: runs around every dispatched update.
      app.use(async (context, next) => {
        const start = performance.now();
        await next();
        console.log(`update handled in ${performance.now() - start}ms`);
      });

      // 3. Request transforms: mutate payloads before they hit the API.
      //    The tag lets app.removePlugin() detach these hooks cleanly.
      app.bot.transformRequest((method, payload) => {
        if (method === "sendMessage") payload.protect_content = true;
      }, "my-plugin-rate-limit-reporter");

      // 4. Namespaced state: private key space, no collisions with bot data.
      app.pluginState<{ calls?: number }>("my-plugin-rate-limit-reporter").calls = 0;
    },
    uninstall(app: Application) {
      // Runs before app.removePlugin() deregisters middleware/hooks/handlers.
      void app;
    },
  };
}

app.usePlugin(rateLimitReporter());
// Later, fully detach it:
// app.removePlugin("my-plugin-rate-limit-reporter");
```

Rules for plugin authors: `install()` must be synchronous (defer async work to `onInit` hooks), plugin names must be globally unique, hook failures are isolated — one throwing hook never blocks other plugins or the bot itself — and plugins whose `dependsOn` dependencies never arrive make `runPolling`/`runWebhook` throw at startup.

---

## Development & Testing

```bash
# Compile TypeScript to ESM and declaration files
npm run build

# Run TypeCheck without emitting files
npm run typecheck

# Run test suite
npm test

# Run tests with code coverage analysis
npm run test:coverage

# Lint source code and tests
npm run lint

# Format codebase with Prettier
npm run format

# Generate TypeDoc API documentation
npm run docs
```

---

## Conventions

- **Methods (functions you invoke)**: `camelCase` (e.g. `bot.sendMessage()`, `app.runPolling()`, `app.addHandler()`).
- **Data properties (payload fields & context state)**: `snake_case` (e.g. `context.user_data`, `context.chat_data`, `update.effective_user`, `chat_id`, `message_id`).

---

## License

MIT License (c) 2026 telebot-ts contributors.
