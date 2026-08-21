/**
 * Telegram HTML5 Gaming Platform Bot Example.
 *
 * Demonstrates Telegram Gaming Platform Bot API methods:
 * 1. `sendGame`: Sends an interactive HTML5 Game card with play button
 * 2. `answerCallbackQuery` with `url`: Opens the HTML5 Game web app URL when the user taps Play
 * 3. `setGameScore`: Updates the player's high score on the Telegram leaderboard
 * 4. `getGameHighScores`: Fetches and displays the top player leaderboard
 *
 * Setup in BotFather:
 * 1. Open @BotFather -> send /newgame -> enter game title and short name (e.g. "cyber_runner")
 * 2. Set game description and upload 640x360 game preview image
 *
 * Usage:
 * BOT_TOKEN="your_token_here" GAME_SHORT_NAME="cyber_runner" npx tsx examples/html5-game-platform-bot.ts
 */

import {
  Application,
  CommandHandler,
  CallbackQueryHandler,
  InlineKeyboard,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN environment variable is required.");
  process.exit(1);
}

const gameShortName = process.env.GAME_SHORT_NAME || "cyber_runner";
const gameServerUrl = process.env.GAME_URL || "https://tbot.xyz/lumber/"; // Example playable HTML5 game

const app = Application.builder().token(token).build();

// /start - Welcome and instructions
app.addHandler(
  new CommandHandler("start", async (update: Update, context: CallbackContext) => {
    const user = update.effective_user?.first_name ?? "Gamer";
    const keyboard = new InlineKeyboard()
      .text("Launch HTML5 Game", "action_send_game")
      .row()
      .text("View Leaderboard", "action_view_scores");

    await context.bot.sendMessage({
      chat_id: update.effective_chat!.id,
      text:
        `Welcome to the HTML5 Gaming Arcade, ${user}!\n\n` +
        `Commands:\n` +
        `/game - Send the HTML5 game launcher card\n` +
        `/scores - View current global high scores\n` +
        `/setscore <points> - Submit a game score to Telegram leaderboard`,
      reply_markup: keyboard,
    });
  })
);

// /game command - Sends the HTML5 Game card to the chat
app.addHandler(
  new CommandHandler("game", async (update: Update, context: CallbackContext) => {
    const chatId = update.effective_chat!.id;

    try {
      await context.bot.sendGame({
        chat_id: chatId,
        game_short_name: gameShortName,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Play Cyber Runner", callback_game: {} },
              { text: "Scores", callback_data: "action_view_scores" },
            ],
          ],
        },
      });
    } catch (err: unknown) {
      await context.bot.sendMessage({
        chat_id: chatId,
        text: `Error sending game card: ${err instanceof Error ? err.message : String(err)}\n\nMake sure "${gameShortName}" is registered via @BotFather /newgame.`,
      });
    }
  })
);

// /scores command - Queries Telegram's built-in game high scores leaderboard
app.addHandler(
  new CommandHandler("scores", async (update: Update, context: CallbackContext) => {
    const chatId = update.effective_chat!.id;
    const userId = update.effective_user?.id;

    if (!userId) return;

    try {
      const highScores = await context.bot.getGameHighScores(userId, {
        chat_id: chatId,
      });

      if (!highScores || highScores.length === 0) {
        await context.bot.sendMessage({
          chat_id: chatId,
          text: "No high scores recorded yet. Tap Play on /game to set a new record!",
        });
        return;
      }

      let leaderboardText = "Telegram Game High Scores:\n\n";
      highScores.forEach((entry) => {
        const playerName = entry.user.first_name || entry.user.username || `User ${entry.user.id}`;
        leaderboardText += `#${entry.position}: ${playerName} - ${entry.score} pts\n`;
      });

      await context.bot.sendMessage({
        chat_id: chatId,
        text: leaderboardText,
      });
    } catch (err: unknown) {
      await context.bot.sendMessage({
        chat_id: chatId,
        text: `Could not retrieve high scores: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  })
);

// /setscore [points] - Simulates HTML5 Game server submitting verified player score
app.addHandler(
  new CommandHandler("setscore", async (update: Update, context: CallbackContext) => {
    const chatId = update.effective_chat!.id;
    const userId = update.effective_user?.id;
    const scoreStr = context.args?.[0];
    const score = parseInt(scoreStr ?? "", 10);

    if (!userId || isNaN(score) || score < 0) {
      await context.bot.sendMessage({
        chat_id: chatId,
        text: "Usage: /setscore <positive_number> (e.g. /setscore 1500)",
      });
      return;
    }

    try {
      await context.bot.setGameScore(userId, score, {
        chat_id: chatId,
        force: true,
      });

      await context.bot.sendMessage({
        chat_id: chatId,
        text: `Score of ${score} points successfully recorded for ${update.effective_user?.first_name}! Check /scores.`,
      });
    } catch (err: unknown) {
      await context.bot.sendMessage({
        chat_id: chatId,
        text: `Error updating score: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  })
);

// Callback query handler - Handles "Play" button taps and "Scores" button
app.addHandler(
  new CallbackQueryHandler(async (update: Update, context: CallbackContext) => {
    const query = update.callback_query;
    if (!query) return;

    const gameQuery = query.game_short_name;
    const data = query.data;

    // When the user taps the Game's Play button (which sends game_short_name)
    if (gameQuery || query.data === "action_send_game") {
      if (gameQuery) {
        // Open the HTML5 Game URL in Telegram WebApp/Browser overlay
        // In production, you attach ?userId=${query.from.id}&chatId=${query.message?.chat.id} to authenticate
        const playerGameUrl = `${gameServerUrl}?userId=${query.from.id}&userName=${encodeURIComponent(query.from.first_name)}`;

        await context.bot.answerCallbackQuery({
          callback_query_id: query.id,
          url: playerGameUrl,
        });
        return;
      }
    }

    if (data === "action_view_scores") {
      await context.bot.answerCallbackQuery({
        callback_query_id: query.id,
        text: "Check /scores to see current leaderboard!",
      });
    }
  })
);

console.log("Telegram HTML5 Gaming Platform Bot is running...");
await app.runPolling({ drop_pending_updates: true });
