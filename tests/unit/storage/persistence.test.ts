import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { Persistence } from "../../../src/storage/driver.js";
import { MemoryPersistence } from "../../../src/storage/memory.js";
import { JsonFilePersistence } from "../../../src/storage/json.js";
import { SqlitePersistence } from "../../../src/storage/sqlite.js";

interface TestFactory {
  name: string;
  create: () => Promise<{ persistence: Persistence; cleanup?: () => Promise<void> | void }>;
}

const factories: TestFactory[] = [
  {
    name: "MemoryPersistence",
    create: async () => ({
      persistence: new MemoryPersistence(),
    }),
  },
  {
    name: "JsonFilePersistence",
    create: async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tele-bot-json-test-"));
      const filePath = path.join(tempDir, "state.json");
      const persistence = new JsonFilePersistence({ filePath });
      return {
        persistence,
        cleanup: () => {
          fs.rmSync(tempDir, { recursive: true, force: true });
        },
      };
    },
  },
  {
    name: "SqlitePersistence",
    create: async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tele-bot-sqlite-test-"));
      const dbPath = path.join(tempDir, "state.db");
      const persistence = new SqlitePersistence({ dbPath });
      return {
        persistence,
        cleanup: () => {
          fs.rmSync(tempDir, { recursive: true, force: true });
        },
      };
    },
  },
];

describe.each(factories)("$name Contract Tests", ({ create }) => {
  let persistence: Persistence;
  let cleanup: (() => Promise<void> | void) | undefined;

  beforeEach(async () => {
    const res = await create();
    persistence = res.persistence;
    cleanup = res.cleanup;
  });

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
  });

  it("handles user_data read-your-writes and missing key default", async () => {
    const missing = await persistence.getUserData(999);
    expect(missing).toEqual({});

    await persistence.setUserData(999, { name: "Alice", age: 30 });
    const saved = await persistence.getUserData(999);
    expect(saved).toEqual({ name: "Alice", age: 30 });

    // Update with new values
    await persistence.setUserData(999, { name: "Alice", age: 31, city: "London" });
    const updated = await persistence.getUserData(999);
    expect(updated).toEqual({ name: "Alice", age: 31, city: "London" });
  });

  it("handles chat_data read-your-writes and missing key default", async () => {
    const missing = await persistence.getChatData(-100123456789);
    expect(missing).toEqual({});

    await persistence.setChatData(-100123456789, { topic: "TypeScript", members: 5 });
    const saved = await persistence.getChatData(-100123456789);
    expect(saved).toEqual({ topic: "TypeScript", members: 5 });

    // Support string chat ID as well
    await persistence.setChatData("@my_channel", { channel: true });
    expect(await persistence.getChatData("@my_channel")).toEqual({ channel: true });
  });

  it("handles bot_data read-your-writes and default", async () => {
    const initial = await persistence.getBotData();
    expect(initial).toEqual({});

    await persistence.setBotData({ total_commands: 42, active: true });
    const saved = await persistence.getBotData();
    expect(saved).toEqual({ total_commands: 42, active: true });
  });

  it("handles conversation state updates and retrieval", async () => {
    const initial = await persistence.getConversations();
    expect(initial.size).toBe(0);

    await persistence.updateConversation("100:200", 1);
    await persistence.updateConversation("100:201", "STATE_NAME");

    const convs = await persistence.getConversations();
    expect(convs.size).toBe(2);
    expect(convs.get("100:200")).toBe(1);
    expect(convs.get("100:201")).toBe("STATE_NAME");

    // Overwrite state
    await persistence.updateConversation("100:200", 2);
    const updated = await persistence.getConversations();
    expect(updated.get("100:200")).toBe(2);
  });

  it("handles persisted jobs with replace-not-merge behavior", async () => {
    expect(await persistence.getJobs()).toEqual([]);

    const jobs = [
      { name: "reminder_1", nextRun: 1700000000000, interval: 60000, data: { msg: "hi" } },
      { name: "backup_task", nextRun: 1700000360000 },
    ];

    await persistence.setJobs(jobs);
    const fetched = await persistence.getJobs();
    expect(fetched).toEqual(jobs);

    // Replace entirely
    const newJobs = [{ name: "new_job", nextRun: 1700001000000 }];
    await persistence.setJobs(newJobs);
    expect(await persistence.getJobs()).toEqual(newJobs);
  });

  it("supports optional flush without error", async () => {
    if (persistence.flush) {
      await expect(persistence.flush()).resolves.toBeUndefined();
    }
  });
});
