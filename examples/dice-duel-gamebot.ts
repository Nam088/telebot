/**
 * Telegram Animated Dice & Casino Duel Game Bot Example.
 *
 * Demonstrates Telegram animated dice rolls (dice, darts, basketball, bowling, slots),
 * multiplayer bot vs player duel mechanics, and win/loss streak calculations.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/dice-duel-gamebot.ts
 */

import {
  Application,
  CommandHandler,
  InlineKeyboard,
  CallbackQueryHandler,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = new Application().token(token).build();

// In-memory records
const playerStats = new Map<number, { wins: number; losses: number; draws: number }>();

// /start command
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const keyboard = new InlineKeyboard()
      .text("Roll Dice (1-6)", "game_dice")
      .text("Dart Board (1-6)", "game_dart")
      .row()
      .text("Basketball Shootout", "game_basketball")
      .text("Slot Machine", "game_slot")
      .row()
      .text("View My Record", "view_stats");

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: "Welcome to Telegram Arcade Duels! Select a game to duel against the bot:",
      reply_markup: keyboard,
    });
  })
);

// Callback query handler for games
app.addHandler(
  new CallbackQueryHandler(async (update: Update, context: CallbackContext) => {
    const data = update.callback_query?.data;
    const chatId = update.effective_chat?.id;
    const userId = update.effective_user?.id ?? 0;
    const userName = update.effective_user?.first_name ?? "Player";

    if (!chatId || !data) return;

    if (data === "view_stats") {
      const stats = playerStats.get(userId) ?? { wins: 0, losses: 0, draws: 0 };
      await context.bot.sendMessage({
        chat_id: chatId,
        text: `Player: ${userName}\nWins: ${stats.wins}\nLosses: ${stats.losses}\nDraws: ${stats.draws}`,
      });
      return;
    }

    let emoji = "🎲";
    let gameTitle = "Classic Dice Duel";

    if (data === "game_dart") {
      emoji = "🎯";
      gameTitle = "Dart Board Shootout";
    } else if (data === "game_basketball") {
      emoji = "🏀";
      gameTitle = "Basketball Shootout";
    } else if (data === "game_slot") {
      emoji = "🎰";
      gameTitle = "Slot Machine Jackpot";
    }

    await context.bot.sendMessage({
      chat_id: chatId,
      text: `Starting ${gameTitle}!\n\nPlayer ${userName} rolls first:`,
    });

    // Player roll
    const playerRoll = await context.bot.sendDice({ chat_id: chatId, emoji });
    const playerVal = playerRoll.dice?.value ?? 0;

    await new Promise((resolve) => setTimeout(resolve, 2500));

    await context.bot.sendMessage({
      chat_id: chatId,
      text: `Bot rolls second:`,
    });

    // Bot roll
    const botRoll = await context.bot.sendDice({ chat_id: chatId, emoji });
    const botVal = botRoll.dice?.value ?? 0;

    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Determine result
    const stats = playerStats.get(userId) ?? { wins: 0, losses: 0, draws: 0 };
    let resultMessage = "";

    if (playerVal > botVal) {
      stats.wins++;
      resultMessage = `You WIN! (Your score: ${playerVal} vs Bot: ${botVal})`;
    } else if (playerVal < botVal) {
      stats.losses++;
      resultMessage = `Bot WINS! (Your score: ${playerVal} vs Bot: ${botVal})`;
    } else {
      stats.draws++;
      resultMessage = `It is a DRAW! (Both rolled ${playerVal})`;
    }

    playerStats.set(userId, stats);

    await context.bot.sendMessage({
      chat_id: chatId,
      text: `${resultMessage}\n\nTotal Record: ${stats.wins}W - ${stats.losses}L - ${stats.draws}D.\nPlay again by sending /start.`,
    });
  })
);

console.log("Arcade Dice Duel Game Bot is running...");
await app.runPolling({ drop_pending_updates: true });
