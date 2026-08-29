/**
 * NestJS Multi-Bot Integration Example.
 *
 * Demonstrates running multiple distinct Telegram bots inside the same NestJS application
 * with completely isolated update routing, tokens, and handler services.
 *
 * Usage:
 * ADMIN_BOT_TOKEN="token_1" SHOP_BOT_TOKEN="token_2" npx tsx examples/nestjs-multiple-bots.ts
 */

import { TelegramModule, Update, Command } from "../src/nest/index.js";
import { Application, type CallbackContext, type Update as TelegramUpdate } from "../src/index.js";

const adminToken = process.env.ADMIN_BOT_TOKEN || "123456:ADMIN_TOKEN_MOCK";
const shopToken = process.env.SHOP_BOT_TOKEN || "654321:SHOP_TOKEN_MOCK";

// 1. Service for Admin Bot
@Update("adminBot")
class AdminBotUpdateService {
  @Command("panel")
  public async onPanel(update: TelegramUpdate, context: CallbackContext) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Welcome to Admin Control Panel.",
    });
  }
}

// 2. Service for Shop Bot
@Update("shopBot")
class ShopBotUpdateService {
  @Command("catalog")
  public async onCatalog(update: TelegramUpdate, context: CallbackContext) {
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Welcome to Store Catalog. Items available: 5.",
    });
  }
}

// In NestJS AppModule, you configure:
// TelegramModule.forRoot({ botName: "adminBot", token: adminToken }),
// TelegramModule.forRoot({ botName: "shopBot", token: shopToken }),

const adminApp = Application.builder().token(adminToken).build();
const shopApp = Application.builder().token(shopToken).build();

const adminService = new AdminBotUpdateService();
const shopService = new ShopBotUpdateService();

// Handlers are automatically routed and isolated per bot instance
TelegramModule.bindHandlers(adminApp, [adminService, shopService], "adminBot");
TelegramModule.bindHandlers(shopApp, [adminService, shopService], "shopBot");

console.log("Both Admin Bot and Shop Bot successfully configured with isolated handler routing!");
