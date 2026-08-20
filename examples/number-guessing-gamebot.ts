/**
 * Number Guessing Game Bot Example.
 *
 * Demonstrates interactive stateful gameplay using Linear Conversations,
 * session attempts tracking, score calculation, and persistent high scores.
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/number-guessing-gamebot.ts
 */

import {
  Application,
  CommandHandler,
  LinearConversation,
  InlineKeyboard,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const app = new Application().token(token).build();

// In-memory high scores record
const highScores = new Map<number, { name: string; score: number; gamesWon: number }>();

// /start command
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const user = update.effective_user?.first_name ?? "Player";
    const keyboard = new InlineKeyboard()
      .text("Play Guessing Game", "play_game")
      .row()
      .text("View Leaderboard", "view_leaderboard");

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text: `Welcome to Number Guessing Game, ${user}!\n\nCommands:\n/play - Start a new guessing challenge (1-100)\n/leaderboard - View top players\n/stats - Check your personal game stats`,
      reply_markup: keyboard,
    });
  })
);

// /leaderboard command
app.addHandler(
  new CommandHandler("leaderboard", async (update: Update, context: CallbackContext) => {
    const sorted = Array.from(highScores.values()).sort((a, b) => b.score - a.score);

    if (sorted.length === 0) {
      await context.bot.sendMessage({
        chat_id: update.effective_chat!.id,
        text: "No games recorded yet. Be the first to play with /play!",
      });
      return;
    }

    let text = "Game Leaderboard:\n\n";
    sorted.slice(0, 10).forEach((entry, index) => {
      text += `${index + 1}. ${entry.name}: ${entry.score} points (${entry.gamesWon} wins)\n`;
    });

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text,
    });
  })
);

// Interactive Game Session using LinearConversation
const gameConversation = new LinearConversation(async (control, context) => {
  const secret = Math.floor(Math.random() * 100) + 1;
  const maxAttempts = 7;
  let attempts = 0;
  const userId = context.update.effective_user?.id ?? 0;
  const userName = context.update.effective_user?.first_name ?? "Player";

  await control.reply(
    `Game Started! I have picked a secret number between 1 and 100.\nYou have ${maxAttempts} attempts. Send your first guess (or type /cancel to quit):`
  );

  while (attempts < maxAttempts) {
    const guessUpdate = await control.wait();
    const messageText = guessUpdate.effective_message?.text?.trim() ?? "";

    if (messageText === "/cancel") {
      await control.reply(`Game canceled. The secret number was ${secret}.`);
      return;
    }

    const guess = parseInt(messageText, 10);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      await control.reply("Please enter a valid integer between 1 and 100:");
      continue;
    }

    attempts++;

    if (guess === secret) {
      const pointsEarned = (maxAttempts - attempts + 1) * 10;
      const currentStats = highScores.get(userId) ?? { name: userName, score: 0, gamesWon: 0 };
      currentStats.score += pointsEarned;
      currentStats.gamesWon += 1;
      currentStats.name = userName;
      highScores.set(userId, currentStats);

      await control.reply(
        `Correct! You found the secret number ${secret} in ${attempts} attempts!\n` +
        `Points earned: +${pointsEarned} points.\n` +
        `Your total score: ${currentStats.score} points.\n\n` +
        `Type /play to start another round or /leaderboard to check standings.`
      );
      return;
    }

    const remaining = maxAttempts - attempts;
    if (remaining === 0) {
      await control.reply(
        `Game Over! You have used all ${maxAttempts} attempts.\nThe secret number was ${secret}.\n\nType /play to try again!`
      );
      return;
    }

    const hint = guess < secret ? "Too LOW! Try a higher number." : "Too HIGH! Try a lower number.";
    await control.reply(`${hint}\nAttempts remaining: ${remaining}. Your next guess:`);
  }
});

// Attach game handler to /play command
app.addHandler(gameConversation.createHandler("/play"));

console.log("Number Guessing Game Bot is running...");
await app.runPolling({ drop_pending_updates: true });
