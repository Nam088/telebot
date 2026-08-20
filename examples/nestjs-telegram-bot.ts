/**
 * NestJS Telegram Bot Integration Example.
 *
 * Demonstrates using `tele-bot/nest` to build Telegram Bots within a NestJS application
 * using standard `@Update()`, `@Command()`, `@Hears()`, and `@Action()` decorators
 * with ZERO runtime dependencies (no `@nestjs/core` required in package dependencies).
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/nestjs-telegram-bot.ts
 */

import {
  TelegramModule,
  Update,
  Command,
  Hears,
  Action,
} from "../src/nest/index.js";
import { Application, type CallbackContext, type Update as TelegramUpdate } from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

// Define a NestJS Service or Controller provider with Decorators
@Update()
class BotUpdateService {
  @Command("start")
  public async onStart(update: TelegramUpdate, context: CallbackContext) {
    const user = update.effective_user?.first_name ?? "Friend";
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Hello ${user}! This bot is running inside NestJS with zero external dependencies.`,
    });
  }

  @Hears(/^hello/)
  public async onHello(update: TelegramUpdate, context: CallbackContext) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Greetings from NestJS TelegramModule!",
    });
  }

  @Action("btn_confirm")
  public async onConfirm(update: TelegramUpdate, context: CallbackContext) {
    await context.bot.answerCallbackQuery({
      callback_query_id: update.callback_query!.id,
      text: "Confirmed via NestJS Action handler!",
    });
  }
}

// In a real NestJS app, you import TelegramModule.forRoot({ token: process.env.BOT_TOKEN })
// Here we simulate the NestJS lifecycle binding:
const app = new Application().token(token).build();
const serviceInstance = new BotUpdateService();

// Bind discovered NestJS providers to the tele-bot engine
TelegramModule.bindHandlers(app, [serviceInstance]);

console.log("NestJS Telegram Bot is running in polling mode...");
await app.runPolling({ drop_pending_updates: true });
