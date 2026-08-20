/**
 * Media Album & File Upload Bot Example.
 *
 * Demonstrates uploading photos, audio, documents, voice notes,
 * and grouping multiple media files into a cohesive Telegram Media Group (Album).
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/media-upload-album-bot.ts
 */

import {
  Application,
  CommandHandler,
  InputFile,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = new Application().token(token).build();

// /start command
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text:
        "Media Bot commands:\n" +
        "/photo - Send a single photo with markdown caption\n" +
        "/album - Send a grouped album of 3 photos with caption\n" +
        "/buffer - Send a dynamically generated text file from an in-memory Buffer",
    });
  })
);

// /photo command
app.addHandler(
  new CommandHandler("photo", async (update: Update, context: CallbackContext) => {
    const chatId = update.effective_chat!.id;
    await context.bot.sendPhoto({
      chat_id: chatId,
      photo: "https://picsum.photos/800/600",
      caption: "High resolution scenery photo from remote URL.",
    });
  })
);

// /album command - Sends multiple media grouped together
app.addHandler(
  new CommandHandler("album", async (update: Update, context: CallbackContext) => {
    const chatId = update.effective_chat!.id;

    await context.bot.sendMediaGroup({
      chat_id: chatId,
      media: [
        {
          type: "photo",
          media: "https://picsum.photos/800/600?random=1",
          caption: "Photo 1 of 3 in the grouped album",
        },
        {
          type: "photo",
          media: "https://picsum.photos/800/600?random=2",
        },
        {
          type: "photo",
          media: "https://picsum.photos/800/600?random=3",
        },
      ],
    });
  })
);

// /buffer command - Sends file created entirely in memory
app.addHandler(
  new CommandHandler("buffer", async (update: Update, context: CallbackContext) => {
    const chatId = update.effective_chat!.id;
    const content = `Report Generated at: ${new Date().toISOString()}\nStatus: System Healthy\nZero Dependencies: True\n`;
    const buffer = Buffer.from(content, "utf-8");

    const file = new InputFile(buffer, "system-health-report.txt", "text/plain");

    await context.bot.sendDocument({
      chat_id: chatId,
      document: file,
      caption: "In-memory dynamic report generated via InputFile.",
    });
  })
);

console.log("Media Upload & Album Bot is running...");
await app.runPolling({ drop_pending_updates: true });
