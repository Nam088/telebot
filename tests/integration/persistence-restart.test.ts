import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { ApplicationBuilder } from "../../src/kernel/app.js";
import { CommandHandler, MessageHandler } from "../../src/routing/handlers.js";
import { ConversationHandler } from "../../src/routing/conversation.js";
import { JsonFilePersistence } from "../../src/storage/json.js";
import { SqlitePersistence } from "../../src/storage/sqlite.js";
import { filters } from "../../src/filters/matchers.js";
import type { RawUpdate } from "../../src/client/types.js";

describe("Persistence & Process Restart Integration", () => {
  let tempDir: string;
  const token = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tele-bot-restart-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function createMessageUpdate(text: string, chatId = 100, userId = 200): RawUpdate {
    return {
      update_id: Date.now(),
      message: {
        message_id: 1,
        date: 1600000000,
        text,
        chat: { id: chatId, type: "private" },
        from: { id: userId, is_bot: false, first_name: "TestUser" },
        ...(text.startsWith("/")
          ? {
              entities: [
                {
                  offset: 0,
                  length: text.split(" ")[0]!.length,
                  type: "bot_command",
                },
              ],
            }
          : {}),
      },
    };
  }

  it("survives process restart with JsonFilePersistence and resumes conversation state", async () => {
    const filePath = path.join(tempDir, "state.json");
    const STATE_NAME = 1;
    const STATE_AGE = 2;

    // --- Process 1: Bot starts, user enters conversation and provides name ---
    {
      const persistence1 = new JsonFilePersistence({ filePath });
      const app1 = new ApplicationBuilder()
        .token(token)
        .persistence(persistence1)
        .build();

      const convHandler1 = new ConversationHandler({
        name: "test_conv",
        persistent: true,
        entry_points: [
          new CommandHandler("start", async (_u, context) => {
            context.user_data!.started = true;
            return STATE_NAME;
          }),
        ],
        states: {
          [STATE_NAME]: [
            new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (u, context) => {
              context.user_data!.name = u.effective_message?.text;
              return STATE_AGE;
            }),
          ],
          [STATE_AGE]: [
            new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (u, context) => {
              context.user_data!.age = u.effective_message?.text;
              return ConversationHandler.END;
            }),
          ],
        },
        fallbacks: [],
      });

      app1.addHandler(convHandler1);

      // 1. Send /start
      await app1.processUpdate(createMessageUpdate("/start"));

      // 2. Send Name
      await app1.processUpdate(createMessageUpdate("John Doe"));

      // In Process 1, user_data.name is saved and state is STATE_AGE (2)
      const userState = await persistence1.getUserData(200);
      expect(userState).toEqual({ started: true, name: "John Doe" });
    }

    // --- Process 2: Simulating new process with fresh instances pointing to same file ---
    {
      const persistence2 = new JsonFilePersistence({ filePath });
      const app2 = new ApplicationBuilder()
        .token(token)
        .persistence(persistence2)
        .build();

      let finishedUserData: any = null;

      const convHandler2 = new ConversationHandler({
        name: "test_conv",
        persistent: true,
        entry_points: [
          new CommandHandler("start", async () => STATE_NAME),
        ],
        states: {
          [STATE_NAME]: [
            new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async () => STATE_AGE),
          ],
          [STATE_AGE]: [
            new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), async (u, context) => {
              context.user_data!.age = u.effective_message?.text;
              finishedUserData = { ...context.user_data };
              return ConversationHandler.END;
            }),
          ],
        },
        fallbacks: [],
      });

      app2.addHandler(convHandler2);

      // 3. User sends Age in new process — should match STATE_AGE (resumed!)
      await app2.processUpdate(createMessageUpdate("28"));

      expect(finishedUserData).toEqual({
        started: true,
        name: "John Doe",
        age: "28",
      });
    }
  });

  it("survives process restart with SqlitePersistence", async () => {
    const dbPath = path.join(tempDir, "state.db");
    const STATE_STEP = 1;

    // --- Process 1 ---
    {
      const persistence1 = new SqlitePersistence({ dbPath });
      const app1 = new ApplicationBuilder()
        .token(token)
        .persistence(persistence1)
        .build();

      const convHandler1 = new ConversationHandler({
        name: "sql_conv",
        persistent: true,
        entry_points: [
          new CommandHandler("order", async (_u, context) => {
            context.user_data!.item = "Pizza";
            return STATE_STEP;
          }),
        ],
        states: {
          [STATE_STEP]: [
            new MessageHandler(filters.TEXT, async (_u, context) => {
              context.user_data!.confirmed = true;
              return ConversationHandler.END;
            }),
          ],
        },
        fallbacks: [],
      });

      app1.addHandler(convHandler1);
      await app1.processUpdate(createMessageUpdate("/order"));
    }

    // --- Process 2 ---
    {
      const persistence2 = new SqlitePersistence({ dbPath });
      const app2 = new ApplicationBuilder()
        .token(token)
        .persistence(persistence2)
        .build();

      let resultState: any = null;

      const convHandler2 = new ConversationHandler({
        name: "sql_conv",
        persistent: true,
        entry_points: [
          new CommandHandler("order", async () => STATE_STEP),
        ],
        states: {
          [STATE_STEP]: [
            new MessageHandler(filters.TEXT, async (_u, context) => {
              context.user_data!.confirmed = true;
              resultState = { ...context.user_data };
              return ConversationHandler.END;
            }),
          ],
        },
        fallbacks: [],
      });

      app2.addHandler(convHandler2);
      await app2.processUpdate(createMessageUpdate("Confirm"));

      expect(resultState).toEqual({
        item: "Pizza",
        confirmed: true,
      });
    }
  });
});
