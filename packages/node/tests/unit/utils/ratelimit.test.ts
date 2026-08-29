import { describe, it, expect, vi } from "vitest";
import { rateLimit } from "../../../src/utils/ratelimit.js";
import { Application } from "../../../src/kernel/app.js";
import { Bot } from "../../../src/client/bot.js";
import { MessageHandler } from "../../../src/routing/handlers.js";
import { filters } from "../../../src/filters/matchers.js";

describe("Rate Limiter Middleware Tests", () => {
  const bot = new Bot("TEST_TOKEN");

  it("allows updates within rate limit and drops updates exceeding limit", async () => {
    const app = new Application(bot);
    let handledCount = 0;
    let limitExceededCount = 0;

    app.use(
      rateLimit({
        windowMs: 500,
        limit: 2,
        onLimitExceeded: () => {
          limitExceededCount++;
        },
      }),
    );

    app.addHandler(
      new MessageHandler(filters.TEXT, () => {
        handledCount++;
      }),
    );

    const makeUpdate = (id: number) => ({
      update_id: id,
      message: {
        message_id: id,
        date: 123456,
        chat: { id: 100, type: "private" as const },
        from: { id: 200, is_bot: false, first_name: "Alice" },
        text: `Message ${id}`,
      },
    });

    // Request 1: OK
    await app.processUpdate(makeUpdate(1));
    // Request 2: OK
    await app.processUpdate(makeUpdate(2));
    // Request 3: Exceeds limit (dropped)
    await app.processUpdate(makeUpdate(3));

    expect(handledCount).toBe(2);
    expect(limitExceededCount).toBe(1);

    // Wait for window to reset (600ms > 500ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Request 4: OK again
    await app.processUpdate(makeUpdate(4));
    expect(handledCount).toBe(3);
  });
});
