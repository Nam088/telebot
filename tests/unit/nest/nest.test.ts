import { describe, it, expect } from "vitest";
import { TelegramModule, Update, Command, Hears, Action } from "../../../src/nest/index.js";
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

  it("binds decorated handlers from services onto Application instance", () => {
    const app = new Application(new Bot("TEST_TOKEN"));
    const service = new SampleUpdateService();

    TelegramModule.bindHandlers(app, [service]);

    const handlers = (app as any).handlers.get(0);
    expect(handlers).toBeDefined();
    expect(handlers.length).toBeGreaterThanOrEqual(3);
  });
});
