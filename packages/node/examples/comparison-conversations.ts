/**
 * Conversation Styles Comparison Example.
 *
 * Demonstrates:
 * 1. Classic Finite State Machine (FSM) style with entry_points, states, and fallbacks
 * 2. Modern Linear Sequential style (GrammY async/await conversation style with wait/ask)
 *
 * Usage:
 * BOT_TOKEN="your_token_here" npx tsx examples/comparison-conversations.ts
 */

import {
  Application,
  CommandHandler,
  MessageHandler,
  ConversationHandler,
  LinearConversation,
  filters,
  type Update,
  type CallbackContext,
} from "../src/index.js";

const token = process.env.BOT_TOKEN || "123456:MOCK_TOKEN";
const app = new Application(token);

// ============================================================================
// STYLE 1: Classic Finite State Machine (FSM) Style
// ============================================================================

const STATE_NAME = 1;
const STATE_AGE = 2;

async function fsmStart(update: Update, context: CallbackContext) {
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: "FSM Style: What is your name?",
  });
  return STATE_NAME;
}

async function fsmName(update: Update, context: CallbackContext) {
  context.user_data["name"] = update.effective_message?.text;
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: `Nice to meet you, ${context.user_data["name"]}! How old are you?`,
  });
  return STATE_AGE;
}

async function fsmAge(update: Update, context: CallbackContext) {
  const age = update.effective_message?.text;
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: `Summary (FSM): Name: ${context.user_data["name"]}, Age: ${age}. Done!`,
  });
  return ConversationHandler.END;
}

async function fsmCancel(update: Update, context: CallbackContext) {
  await context.bot.sendMessage({
    chat_id: update.effective_chat!.id,
    text: "Conversation canceled.",
  });
  return ConversationHandler.END;
}

const fsmHandler = new ConversationHandler({
  entry_points: [new CommandHandler("fsm_survey", fsmStart)],
  states: {
    [STATE_NAME]: [new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), fsmName)],
    [STATE_AGE]: [new MessageHandler(filters.TEXT.and(filters.COMMAND.not()), fsmAge)],
  },
  fallbacks: [new CommandHandler("cancel", fsmCancel)],
});

app.addHandler(fsmHandler);

// ============================================================================
// STYLE 2: Modern Linear Async Style (GrammY Conversations style)
// ============================================================================

const linearSurvey = new LinearConversation(async (control, context) => {
  // Step 1: Ask user name sequentially
  const name = await control.ask("Linear Style: What is your name?");

  // Step 2: Ask user age sequentially
  const age = await control.ask(`Nice to meet you, ${name}! How old are you?`);

  // Step 3: Complete flow
  await control.reply(`Summary (Linear): Name: ${name}, Age: ${age}. Done!`);
});

app.addHandler(linearSurvey.createHandler("/linear_survey"));

console.log("Conversations comparison example initialized.");
