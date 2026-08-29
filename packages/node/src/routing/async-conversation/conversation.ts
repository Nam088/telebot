/**
 * Linear Async/Await Conversation System.
 *
 * @packageDocumentation
 */

import type { Update } from "../../kernel/update.js";
import type { CallbackContext } from "../../kernel/context.js";
import type { Message, CallbackQuery } from "../../client/types.js";
import {
  ConversationTimeoutError,
  ConversationExitSignal,
  type UpdatePredicate,
  type WaitOptions,
  type WaitForMessageOptions,
  type WaitForCallbackQueryOptions,
} from "./types.js";
import type { AsyncConversationManager } from "./manager.js";

/**
 * Async conversation controller interface passed to conversation handler callbacks.
 */
export class AsyncConversation {
  public readonly name: string;
  public readonly context: CallbackContext;
  public readonly userId?: number;
  public readonly chatId?: number | string;

  private readonly manager: AsyncConversationManager;
  private readonly sessionKey: string;

  constructor(
    name: string,
    context: CallbackContext,
    sessionKey: string,
    manager: AsyncConversationManager,
    userId?: number,
    chatId?: number | string,
  ) {
    this.name = name;
    this.context = context;
    this.sessionKey = sessionKey;
    this.manager = manager;
    this.userId = userId;
    this.chatId = chatId;
  }

  public wait(filter?: UpdatePredicate, options: WaitOptions = {}): Promise<Update> {
    return new Promise<Update>((resolve, reject) => {
      let timer: NodeJS.Timeout | undefined;

      if (options.timeoutMs !== undefined && options.timeoutMs > 0) {
        timer = setTimeout(() => {
          this.manager.clearPendingWait(this.sessionKey);
          reject(new ConversationTimeoutError());
        }, options.timeoutMs);
      }

      this.manager.registerPendingWait(this.sessionKey, {
        predicate: filter,
        resolve: (update: Update) => {
          if (timer) clearTimeout(timer);
          resolve(update);
        },
        reject: (error: Error) => {
          if (timer) clearTimeout(timer);
          reject(error);
        },
      });
    });
  }

  public async waitForMessage(options: WaitForMessageOptions = {}): Promise<Message> {
    const update = await this.wait(async (u: Update) => {
      if (!u.effective_message) return false;
      if (options.filter) {
        return Boolean(await options.filter.checkUpdate(u));
      }
      return true;
    }, options);
    return update.effective_message as Message;
  }

  public async waitForCallbackQuery(
    options: WaitForCallbackQueryOptions = {},
  ): Promise<CallbackQuery> {
    const update = await this.wait((u: Update) => {
      if (!u.callback_query) return false;
      if (options.pattern !== undefined) {
        const data = u.callback_query.data ?? "";
        if (typeof options.pattern === "string") {
          return data === options.pattern;
        }
        return options.pattern.test(data);
      }
      return true;
    }, options);
    return update.callback_query as CallbackQuery;
  }

  public async ask(text: string, options: WaitForMessageOptions = {}): Promise<string> {
    const chatId = this.chatId ?? this.userId ?? this.context.update?.effective_chat?.id;
    if (chatId !== undefined) {
      await this.context.bot.sendMessage({
        chat_id: chatId,
        text,
      });
    } else {
      await this.context.reply(text);
    }
    const message = await this.waitForMessage(options);
    return message.text ?? "";
  }

  public exit(): never {
    throw new ConversationExitSignal();
  }
}
