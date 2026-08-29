/**
 * Telegram Mini App WebApp Authentication & Bot Example.
 *
 * Demonstrates launching a Mini App with `InlineKeyboard.webApp()` and validating
 * `Telegram.WebApp.initData` securely using native HMAC-SHA-256 (`validateWebAppData`).
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/mini-app-webapp-auth-bot.ts
 */

import {
  Application,
  CommandHandler,
  InlineKeyboard,
  validateWebAppData,
  parseWebAppData,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = Application.builder().token(token).build();

// /start command: Send an inline keyboard with a Web App button
app.addHandler(
  new CommandHandler("start", async (update, context) => {
    const keyboard = new InlineKeyboard()
      .webApp("Open Mini App 🛍️", "https://your-mini-app-domain.com")
      .row()
      .url("Documentation 📚", "https://core.telegram.org/bots/webapps");

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Welcome to our Telegram Mini App store! Click below to launch:",
      reply_markup: keyboard.build(),
    });
  }),
);

// Backend API validation simulation:
export function handleMiniAppAuth(rawInitData: string) {
  const isValid = validateWebAppData(rawInitData, token!, {
    maxAgeSeconds: 86400, // 24 hours
  });

  if (!isValid) {
    throw new Error("Invalid or expired Mini App signature!");
  }

  const parsedData = parseWebAppData(rawInitData);
  console.log("Authenticated Mini App User:", parsedData.user?.first_name, parsedData.user?.id);
  return parsedData;
}

console.log("Mini App WebApp bot configured.");
