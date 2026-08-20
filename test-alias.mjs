import { ApplicationBuilder, CommandHandler, Bot, JobQueue, MemoryPersistence } from "./dist/index.js";

const bot = new Bot("TEST_TOKEN");
const app = new ApplicationBuilder().token("TEST_TOKEN").build();

// Test that both snake_case and camelCase methods exist and function
console.log("bot.send_message:", typeof bot.send_message);
console.log("app.add_handler:", typeof app.add_handler);
console.log("app.run_polling:", typeof app.run_polling);
console.log("app.run_webhook:", typeof app.run_webhook);
