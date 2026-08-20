import { describe, it, expect } from "vitest";
import { MemoryPersistence } from "../../../src/ext/persistence.js";

describe("MemoryPersistence", () => {
  it("manages user_data correctly", async () => {
    const storage = new MemoryPersistence();
    const initial = await storage.getUserData(123);
    expect(initial).toEqual({});

    await storage.setUserData(123, { score: 10 });
    const updated = await storage.getUserData(123);
    expect(updated).toEqual({ score: 10 });
  });

  it("manages chat_data correctly", async () => {
    const storage = new MemoryPersistence();
    const initial = await storage.getChatData("chat_123");
    expect(initial).toEqual({});

    await storage.setChatData("chat_123", { topic: "AI" });
    const updated = await storage.getChatData("chat_123");
    expect(updated).toEqual({ topic: "AI" });
  });

  it("manages bot_data correctly", async () => {
    const storage = new MemoryPersistence();
    expect(await storage.getBotData()).toEqual({});

    await storage.setBotData({ total_users: 100 });
    expect(await storage.getBotData()).toEqual({ total_users: 100 });
  });

  it("manages conversations correctly", async () => {
    const storage = new MemoryPersistence();
    expect((await storage.getConversations()).size).toBe(0);

    await storage.updateConversation("conv_1", 2);
    const convs = await storage.getConversations();
    expect(convs.get("conv_1")).toBe(2);
  });

  it("manages persisted jobs correctly", async () => {
    const storage = new MemoryPersistence();
    expect(await storage.getJobs()).toEqual([]);

    await storage.setJobs([{ name: "job1", nextRun: 12345 }]);
    expect(await storage.getJobs()).toEqual([{ name: "job1", nextRun: 12345 }]);
  });
});
