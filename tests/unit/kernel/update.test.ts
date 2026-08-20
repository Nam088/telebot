import { describe, it, expect } from "vitest";
import { Update } from "../../../src/kernel/update.js";

describe("Update wrapper", () => {
  it("resolves effective_user and effective_chat from message", () => {
    const update = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private", title: "Test" },
        from: { id: 456, is_bot: false, first_name: "Alice" },
        text: "Hi",
      },
    });

    expect(update.effective_user?.id).toBe(456);
    expect(update.effective_chat?.id).toBe(123);
    expect(update.effective_message?.text).toBe("Hi");
    expect(update.effective_sender?.id).toBe(456);
  });

  it("resolves effective_user and effective_chat from callback_query", () => {
    const update = new Update({
      update_id: 2,
      callback_query: {
        id: "cb1",
        from: { id: 789, is_bot: false, first_name: "Bob" },
        chat_instance: "inst1",
        message: {
          message_id: 2,
          date: 123456,
          chat: { id: 999, type: "group" },
        },
      },
    });

    expect(update.effective_user?.id).toBe(789);
    expect(update.effective_chat?.id).toBe(999);
  });
});
