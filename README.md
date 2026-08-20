# tele-bot

Zero-dependency, type-safe Telegram Bot framework for Node.js and TypeScript.

## Features

- 🚀 **Zero required runtime dependencies** (built entirely on Node.js 22+ standards: native `fetch`, `node:sqlite`, `node:http`)
- 🔒 **Type-Safe**: Full TypeScript coverage with strict types and autocomplete
- 🛠 **Modular Architecture**: Powerful handler grouping, rich filter combinators, keyboard builders, and conversation state management
- ⚡ **Ultra-fast & Lightweight**: Minimal cold start latency and small footprint

## Quickstart

```bash
npm install tele-bot
```

```ts
import { ApplicationBuilder, CommandHandler, MessageHandler, filters, type Update, type CallbackContext } from "tele-bot";

const app = new ApplicationBuilder()
  .token(process.env.BOT_TOKEN!)
  .build();

app.addHandler(new CommandHandler("start", async (update: Update, context: CallbackContext) => {
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: `Hello ${update.effective_user?.first_name ?? "there"}!`,
  });
}));

await app.runPolling();
```

## Documentation

For full API reference and documentation, see TypeDoc generated documentation in `docs/` or run:

```bash
npm run docs
```
