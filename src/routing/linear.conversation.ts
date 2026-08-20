/**
 * Modern Linear Async Conversation Engine.
 *
 * Enables writing multi-step conversations using standard sequential `async/await` flows
 * with `await conversation.wait()` or `await conversation.ask()`.
 *
 * @packageDocumentation
 */

import { BaseHandler } from "./handlers.js";
import { Update } from "../kernel/update.js";
import { CallbackContext } from "../kernel/context.js";
import type { BaseFilter } from "../filters/base.js";

/**
 * Controller interface passed as the first argument to modern linear conversation functions.
 */
export interface ConversationControl {
  /**
   * Pauses execution until the next update from this user/chat arrives.
   *
   * @param filter - Optional filter that the incoming update must satisfy.
   * @returns The incoming {@link Update} that satisfied the condition.
   *
   * @example
   * ```ts
   * const update = await conversation.wait();
   * console.log("Received response:", update.effective_message?.text);
   * ```
   */
  wait(filter?: BaseFilter): Promise<Update>;

  /**
   * Sends a prompt message to the user and pauses until their response arrives.
   *
   * @param text - The prompt message to send.
   * @param filter - Optional filter that the response must satisfy.
   * @returns The text of the user's response message.
   *
   * @example
   * ```ts
   * const name = await conversation.ask("What is your name?");
   * ```
   */
  ask(text: string, filter?: BaseFilter): Promise<string>;

  /**
   * Permanently exits the active conversation flow immediately.
   */
  exit(): never;
}

/**
 * Modern Linear Conversation Handler.
 *
 * Allows writing complex interactive dialogs in a single, readable sequential async function.
 *
 * @example
 * ```ts
 * const survey = new LinearConversation(async (conversation, context) => {
 *   const name = await conversation.ask("What is your name?");
 *   const age = await conversation.ask(`Nice to meet you, ${name}! How old are you?`);
 *   await context.bot.sendMessage({
 *     chat_id: context.update!.effective_chat!.id,
 *     text: `Profile saved: ${name}, ${age} years old!`,
 *   });
 * }, {
 *   entry_command: "survey",
 * });
 *
 * app.addHandler(survey);
 * ```
 */
export class LinearConversation<C extends CallbackContext = CallbackContext> extends BaseHandler<
  C,
  void
> {
  private readonly fn: (conversation: ConversationControl, context: C) => Promise<void>;
  private readonly entryCommand?: string;
  private readonly entryFilter?: BaseFilter;
  private readonly activeFlows = new Map<
    string,
    {
      resume: (update: Update) => void;
      filter?: BaseFilter;
    }
  >();

  /**
   * Creates a new {@link LinearConversation} handler.
   *
   * @param fn - The sequential async generator/function defining the dialog script.
   * @param options - Configuration options for triggering and scoping the conversation.
   */
  constructor(
    fn: (conversation: ConversationControl, context: C) => Promise<void>,
    options: {
      entry_command?: string;
      entry_filter?: BaseFilter;
      per_chat?: boolean;
      per_user?: boolean;
    } = {},
  ) {
    super(async () => {});
    this.fn = fn;
    this.entryCommand = options.entry_command;
    this.entryFilter = options.entry_filter;
  }

  private getKey(update: Update): string {
    const chatId = update.effective_chat?.id ?? "global";
    const userId = update.effective_user?.id ?? "global";
    return `${chatId}:${userId}`;
  }

  /**
   * Checks whether the incoming update matches an active conversation step or entry trigger.
   *
   * @param update - The incoming Telegram update.
   * @returns `true` if this conversation should process the update, `false` otherwise.
   */
  override async checkUpdate(update: Update): Promise<boolean> {
    const key = this.getKey(update);

    // 1. Check if there is an active waiting step
    if (this.activeFlows.has(key)) {
      const active = this.activeFlows.get(key)!;
      if (!active.filter || (await active.filter.checkUpdate(update))) {
        return true;
      }
      return false;
    }

    // 2. Check entry command
    if (this.entryCommand && update.effective_message?.text) {
      const text = update.effective_message.text.trim();
      if (text === `/${this.entryCommand}` || text.startsWith(`/${this.entryCommand} `)) {
        return true;
      }
    }

    // 3. Check entry filter
    if (this.entryFilter && (await this.entryFilter.checkUpdate(update))) {
      return true;
    }

    return false;
  }

  /**
   * Executes or resumes the linear conversation step.
   *
   * @param update - The incoming Telegram update.
   * @param context - Callback context instance.
   * @returns Resolves when step execution finishes.
   */
  override async handleUpdate(update: Update, context: C): Promise<void> {
    const key = this.getKey(update);

    // If waiting for response in an active conversation, resume it
    if (this.activeFlows.has(key)) {
      const active = this.activeFlows.get(key)!;
      this.activeFlows.delete(key);
      active.resume(update);
      return;
    }

    // Otherwise, start a new linear conversation execution in background
    const conversationControl: ConversationControl = {
      wait: (filter?: BaseFilter) => {
        return new Promise<Update>((resolve) => {
          this.activeFlows.set(key, {
            resume: resolve,
            filter,
          });
        });
      },
      ask: async (promptText: string, filter?: BaseFilter) => {
        if (update.effective_chat) {
          await context.bot.sendMessage({
            chat_id: update.effective_chat.id,
            text: promptText,
          });
        }
        const responseUpdate = await conversationControl.wait(filter);
        return responseUpdate.effective_message?.text ?? "";
      },
      exit: () => {
        this.activeFlows.delete(key);
        throw new Error("__CONVERSATION_EXIT__");
      },
    };

    // Run the linear conversation flow asynchronously without blocking handler dispatch
    (async () => {
      try {
        await this.fn(conversationControl, context);
      } catch (err: unknown) {
        this.activeFlows.delete(key);
        const message = err instanceof Error ? err.message : undefined;
        if (message !== "__CONVERSATION_EXIT__") {
          console.error("Error in LinearConversation:", err);
        }
      }
    })();
  }
}
