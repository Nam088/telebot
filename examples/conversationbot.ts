/**
 * Stateful multi-step conversation bot example.
 *
 * Demonstrates ConversationHandler (FSM), state transitions, and persistent storage.
 */

import {
  ApplicationBuilder,
  CommandHandler,
  MessageHandler,
  ConversationHandler,
  filters,
  JsonFilePersistence,
  type Update,
  type CallbackContext,
} from "../src/index.js";

// Define conversation states
const GENDER = 1;
const PHOTO = 2;
const LOCATION = 3;
const BIO = 4;

interface UserState {
  gender?: string;
  photo?: string;
  location?: { latitude: number; longitude: number };
  bio?: string;
}

async function start(update: Update, context: CallbackContext<UserState>): Promise<number> {
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: "Hi! My name is Professor Bot. I will hold a conversation with you.\n\nAre you a Boy or a Girl?",
  });
  return GENDER;
}

async function gender(update: Update, context: CallbackContext<UserState>): Promise<number> {
  const userText = update.effective_message?.text ?? "";
  if (context.user_data) {
    context.user_data.gender = userText;
  }

  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: `I see! Please send me a photo of yourself, so I know what you look like, or send /skip if you don't want to.`,
  });
  return PHOTO;
}

async function photo(update: Update, context: CallbackContext<UserState>): Promise<number> {
  const photos = update.effective_message?.photo;
  if (photos && photos.length > 0 && context.user_data) {
    context.user_data.photo = photos[photos.length - 1]?.file_id;
  }

  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: "Gorgeous! Now, send me your location, or /skip if you don't want to.",
  });
  return LOCATION;
}

async function skipPhoto(update: Update, context: CallbackContext<UserState>): Promise<number> {
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: "I bet you look great! Now, send me your location, or /skip if you don't want to.",
  });
  return LOCATION;
}

async function location(update: Update, context: CallbackContext<UserState>): Promise<number> {
  const loc = update.effective_message?.location;
  if (loc && context.user_data) {
    context.user_data.location = { latitude: loc.latitude, longitude: loc.longitude };
  }

  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: "Almost done! Tell me a little bit about yourself in a short bio.",
  });
  return BIO;
}

async function skipLocation(update: Update, context: CallbackContext<UserState>): Promise<number> {
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: "No problem. Tell me a little bit about yourself in a short bio.",
  });
  return BIO;
}

async function bio(update: Update, context: CallbackContext<UserState>): Promise<number> {
  const bioText = update.effective_message?.text ?? "";
  if (context.user_data) {
    context.user_data.bio = bioText;
  }

  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: `Thank you! I hope we can talk again some day.\n\nSummary:\nGender: ${context.user_data?.gender}\nBio: ${context.user_data?.bio}`,
  });
  return ConversationHandler.END;
}

async function cancel(update: Update, context: CallbackContext<UserState>): Promise<number> {
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: "Bye! I hope we can talk again some day.",
  });
  return ConversationHandler.END;
}

async function main() {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.error("Please set BOT_TOKEN environment variable.");
    process.exit(1);
  }

  // Use persistent JSON storage to survive restarts
  const persistence = new JsonFilePersistence({ filePath: "./data/conversation_state.json" });

  const app = new ApplicationBuilder()
    .token(token)
    .persistence(persistence)
    .build();

  const convHandler = new ConversationHandler<CallbackContext<UserState>>({
    entry_points: [new CommandHandler("start", start)],
    states: {
      [GENDER]: [new MessageHandler(filters.Regex(/^(Boy|Girl|Other)$/i), gender)],
      [PHOTO]: [
        new MessageHandler(filters.PHOTO, photo),
        new CommandHandler("skip", skipPhoto),
      ],
      [LOCATION]: [
        new MessageHandler(filters.LOCATION, location),
        new CommandHandler("skip", skipLocation),
      ],
      [BIO]: [new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), bio)],
    },
    fallbacks: [new CommandHandler("cancel", cancel)],
  });

  app.addHandler(convHandler);

  console.log("Starting conversation bot...");
  await app.runPolling({ drop_pending_updates: true });
}

main().catch(console.error);
