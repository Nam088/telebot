import { describe, it, expect } from "vitest";
import { TelegramModule, Update, Command, Hears, Action, InjectBot, getParamTokenMetadata } from "../../../src/nest/index.js";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";

@Update()
class SampleUpdateService {
  public startCalled = false;
  public helloCalled = false;
  public btnCalled = false;

  @Command("start")
  public onStart() {
    this.startCalled = true;
  }

  @Hears(/^hello/)
  public onHello() {
    this.helloCalled = true;
  }

  @Action("btn_click")
  public onAction() {
    this.btnCalled = true;
  }
}

describe("NestJS Integration Module (tele-bot/nest)", () => {
  it("provides synchronous and async module definition", () => {
    const syncMod = TelegramModule.forRoot({ token: "MOCK_TOKEN" });
    expect(syncMod.module).toBe(TelegramModule);
    expect(syncMod.providers).toHaveLength(1);

    const asyncMod = TelegramModule.forRootAsync({
      useFactory: () => ({ token: "ASYNC_TOKEN" }),
    });
    expect(asyncMod.module).toBe(TelegramModule);
    expect(asyncMod.providers).toHaveLength(2);
  });

  it("supports multiple named bots and isolates their handlers", () => {
    @Update("adminBot")
    class AdminBotService {
      @Command("admin_panel")
      public onAdmin() {}
    }

    @Update("shopBot")
    class ShopBotService {
      @Command("buy")
      public onBuy() {}
    }

    const adminApp = new Application(new Bot("TEST_TOKEN"));
    const shopApp = new Application(new Bot("TEST_TOKEN"));

    const adminService = new AdminBotService();
    const shopService = new ShopBotService();

    TelegramModule.bindHandlers(adminApp, [adminService, shopService], "adminBot");
    TelegramModule.bindHandlers(shopApp, [adminService, shopService], "shopBot");

    const adminHandlers = (adminApp as any).handlers.get(0);
    const shopHandlers = (shopApp as any).handlers.get(0);

    expect(adminHandlers).toHaveLength(1);
    expect(shopHandlers).toHaveLength(1);
  });

  it("decorates parameters with @InjectBot and retrieves injection token metadata", () => {
    class BotConsumer {
      constructor(
        @InjectBot("customBot") public bot: Bot,
        @InjectBot() public defaultBot: Bot,
      ) {}
    }

    const tokens = getParamTokenMetadata(BotConsumer);
    expect(tokens[0]).toBe("TELEGRAM_BOT_CUSTOMBOT");
    expect(tokens[1]).toBe("TELEGRAM_APPLICATION");
  });
});
