import { describe, it, expect } from "vitest";
import { BasePersistence } from "../../../src/storage/driver.js";

class SimpleKvDriver extends BasePersistence {
  public store = new Map<string, string>();

  protected async getRaw(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  protected async setRaw(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  protected async deleteRaw(key: string): Promise<void> {
    this.store.delete(key);
  }
}

describe("BasePersistence Abstract Driver Tests", () => {
  it("automatically serializes and deserializes user data", async () => {
    const driver = new SimpleKvDriver();
    expect(await driver.getUserData(123)).toEqual({});

    await driver.setUserData(123, { score: 100, name: "Alice" });
    expect(await driver.getUserData(123)).toEqual({ score: 100, name: "Alice" });

    await driver.deleteUserData(123);
    expect(await driver.getUserData(123)).toEqual({});
  });

  it("automatically serializes and deserializes chat and bot data", async () => {
    const driver = new SimpleKvDriver();
    await driver.setChatData("group_1", { welcome: true });
    expect(await driver.getChatData("group_1")).toEqual({ welcome: true });
    await driver.deleteChatData("group_1");
    expect(await driver.getChatData("group_1")).toEqual({});

    await driver.setBotData({ maintenance: false });
    expect(await driver.getBotData()).toEqual({ maintenance: false });
  });

  it("handles conversation updates and deletion", async () => {
    const driver = new SimpleKvDriver();
    await driver.updateConversation("10:20", "STEP_A");
    let convs = await driver.getConversations();
    expect(convs.get("10:20")).toBe("STEP_A");

    await driver.deleteConversation("10:20");
    convs = await driver.getConversations();
    expect(convs.has("10:20")).toBe(false);
  });
});
