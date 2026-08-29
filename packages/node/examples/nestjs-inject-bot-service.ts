/**
 * NestJS Bot Dependency Injection in Custom Services Example.
 *
 * Demonstrates injecting Telegram Bot instances directly into standard
 * NestJS business services (e.g. OrderService, NotificationService)
 * using `@Inject(getBotToken("adminBot"))` or `@InjectBot("adminBot")`.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/nestjs-inject-bot-service.ts
 */

import { TelegramModule, getBotToken, Update, Command } from "../src/nest/index.js";
import {
  Application,
  Application,
  type CallbackContext,
  type Update as TelegramUpdate,
} from "../src/index.js";

const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN_NOTIFICATIONS";

// 1. Business Service with Injected Telegram Bot Instance
class NotificationService {
  constructor(private readonly app: Application) {}

  public async notifyUser(chatId: number | string, message: string) {
    // You can call all Bot API methods directly via this.app.bot
    await this.app.bot.sendMessage({
      chat_id: chatId,
      text: ` System Alert: ${message}`,
    });
  }

  public async sendDailyReport(chatId: number | string, reportData: string) {
    await this.app.bot.sendMessage({
      chat_id: chatId,
      text: ` Daily Business Report:\n${reportData}`,
    });
  }
}

// 2. Controller / Update Service listening to incoming user commands
@Update()
class BotUpdateController {
  constructor(private readonly notificationService: NotificationService) {}

  @Command("alert")
  public async onAlertCommand(update: TelegramUpdate, _context: CallbackContext) {
    const chatId = update.effective_chat!.id;
    // Call business logic service
    await this.notificationService.notifyUser(
      chatId,
      "Your order #9928 has been processed successfully!",
    );
  }
}

// --- NestJS Lifecycle Simulation ---
const appInstance = Application.builder().token(token).build();

// In NestJS, providers are resolved via DI container:
// NotificationService receives Application instance via @Inject(getBotToken())
const notificationService = new NotificationService(appInstance);
const botController = new BotUpdateController(notificationService);

// Bind controller handlers
TelegramModule.bindHandlers(appInstance, [botController]);

console.log("NestJS Bot Service Dependency Injection example successfully initialized!");
console.log("Token for DI lookup in NestJS:", getBotToken()); // "TELEGRAM_APPLICATION"
console.log("Token for Named Bot DI lookup:", getBotToken("adminBot")); // "TELEGRAM_BOT_ADMINBOT"
