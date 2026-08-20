/**
 * Update handlers for dispatching commands and messages.
 *
 * @packageDocumentation
 */

import type { Update } from "../kernel/update.js";
import { CallbackContext } from "../kernel/context.js";
import { filters as filtersModule, BaseFilter, RegexFilter } from "../filters/matchers.js";
import type { RawUpdate } from "../client/types.js";

export type HandlerCallback<
  C extends CallbackContext = CallbackContext,
  R = unknown
> = (update: Update, context: C) => Promise<R> | R;

export abstract class BaseHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> {
  protected callback: HandlerCallback<C, R>;

  constructor(callback: HandlerCallback<C, R>) {
    this.callback = callback;
  }

  abstract checkUpdate(update: Update): boolean | Promise<boolean>;

  async handleUpdate(update: Update, context: C): Promise<R> {
    return this.callback(update, context);
  }
}

export class CommandHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  public readonly commands: Set<string>;
  public readonly filters?: BaseFilter;

  constructor(
    command: string | string[],
    callback: HandlerCallback<C, R>,
    filters?: BaseFilter
  ) {
    super(callback);
    const commandList = Array.isArray(command) ? command : [command];
    if (commandList.length === 0 || commandList.some((c) => !c || c.trim() === "")) {
      throw new Error("CommandHandler requires at least one non-empty command string.");
    }
    this.commands = new Set(commandList.map((c) => c.toLowerCase()));
    this.filters = filters;
  }

  async checkUpdate(update: Update): Promise<boolean> {
    const msg = update.effective_message;
    if (!msg || !msg.text) return false;

    if (!msg.entities || msg.entities.length === 0) return false;
    const firstEntity = msg.entities[0];
    if (!firstEntity || firstEntity.type !== "bot_command" || firstEntity.offset !== 0) {
      return false;
    }

    const commandText = msg.text.slice(1, firstEntity.length);
    const [commandName] = commandText.split("@");
    if (!commandName || !this.commands.has(commandName.toLowerCase())) {
      return false;
    }

    if (this.filters) {
      const match = await this.filters.checkUpdate(update);
      if (!match) return false;
    }

    return true;
  }

  override async handleUpdate(update: Update, context: C): Promise<R> {
    const msg = update.effective_message;
    if (msg?.text) {
      const parts = msg.text.trim().split(/\s+/);
      context.args = parts.slice(1);
    }
    return super.handleUpdate(update, context);
  }
}

export class MessageHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  public readonly filters: BaseFilter;

  constructor(filters: BaseFilter | null | undefined, callback: HandlerCallback<C, R>) {
    super(callback);
    this.filters = filters ?? filtersModule.ALL;
  }

  async checkUpdate(update: Update): Promise<boolean> {
    const msg = update.effective_message;
    if (!msg) return false;
    return Boolean(await this.filters.checkUpdate(update));
  }

  override async handleUpdate(update: Update, context: C): Promise<R> {
    if (this.filters instanceof RegexFilter) {
      const msg = update.effective_message;
      const text = msg?.text ?? msg?.caption;
      if (text) {
        const matches = text.match(this.filters.pattern);
        if (matches) {
          context.matches = [matches];
        }
      }
    }
    return super.handleUpdate(update, context);
  }
}

export class CallbackQueryHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  public readonly pattern?: RegExp | string | ((data: string) => boolean);

  constructor(
    callbackOrPattern: HandlerCallback<C, R> | RegExp | string | ((data: string) => boolean) | null | undefined,
    callbackOrPattern2?: HandlerCallback<C, R> | RegExp | string | ((data: string) => boolean) | null | undefined
  ) {
    let cb: HandlerCallback<C, R>;
    let pat: RegExp | string | ((data: string) => boolean) | undefined;

    if (typeof callbackOrPattern === "function" && typeof callbackOrPattern2 === "function") {
      if (callbackOrPattern.length >= 2 || callbackOrPattern2.length === 1) {
        cb = callbackOrPattern as HandlerCallback<C, R>;
        pat = callbackOrPattern2 as (data: string) => boolean;
      } else {
        cb = callbackOrPattern2 as HandlerCallback<C, R>;
        pat = callbackOrPattern as (data: string) => boolean;
      }
    } else if (typeof callbackOrPattern === "function" && callbackOrPattern2 === undefined) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
    } else if (typeof callbackOrPattern === "function" && callbackOrPattern2 !== undefined) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
      pat = callbackOrPattern2 as RegExp | string | ((data: string) => boolean);
    } else {
      cb = callbackOrPattern2 as HandlerCallback<C, R>;
      pat = callbackOrPattern as RegExp | string | ((data: string) => boolean);
    }

    super(cb);
    this.pattern = pat;
  }

  async checkUpdate(update: Update): Promise<boolean> {
    const query = update.callback_query;
    if (!query) return false;

    if (!this.pattern) return true;
    const data = query.data ?? "";

    if (typeof this.pattern === "string") {
      return data === this.pattern;
    }
    if (this.pattern instanceof RegExp) {
      return this.pattern.test(data);
    }
    if (typeof this.pattern === "function") {
      return Boolean(this.pattern(data));
    }
    return false;
  }

  override async handleUpdate(update: Update, context: C): Promise<R> {
    const query = update.callback_query;
    if (query?.data && this.pattern instanceof RegExp) {
      const matches = query.data.match(this.pattern);
      if (matches) {
        context.matches = [matches];
      }
    }
    return super.handleUpdate(update, context);
  }
}

export class InlineQueryHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  public readonly pattern?: RegExp | string | ((query: string) => boolean);

  constructor(
    callbackOrPattern: HandlerCallback<C, R> | RegExp | string | ((query: string) => boolean) | null | undefined,
    callbackOrPattern2?: HandlerCallback<C, R> | RegExp | string | ((query: string) => boolean) | null | undefined
  ) {
    let cb: HandlerCallback<C, R>;
    let pat: RegExp | string | ((query: string) => boolean) | undefined;

    if (typeof callbackOrPattern === "function" && callbackOrPattern.length >= 1 && callbackOrPattern2 === undefined) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
    } else if (typeof callbackOrPattern === "function" && typeof callbackOrPattern2 !== "function") {
      cb = callbackOrPattern as HandlerCallback<C, R>;
      pat = (callbackOrPattern2 as RegExp | string | ((query: string) => boolean)) ?? undefined;
    } else {
      cb = callbackOrPattern2 as HandlerCallback<C, R>;
      pat = (callbackOrPattern as RegExp | string | ((query: string) => boolean)) ?? undefined;
    }

    super(cb);
    this.pattern = pat;
  }

  async checkUpdate(update: Update): Promise<boolean> {
    const query = update.inline_query;
    if (!query) return false;

    if (!this.pattern) return true;
    const text = query.query;

    if (typeof this.pattern === "string") {
      return text === this.pattern;
    }
    if (this.pattern instanceof RegExp) {
      return this.pattern.test(text);
    }
    if (typeof this.pattern === "function") {
      return Boolean(this.pattern(text));
    }
    return false;
  }

  override async handleUpdate(update: Update, context: C): Promise<R> {
    const query = update.inline_query;
    if (query && this.pattern instanceof RegExp) {
      const matches = query.query.match(this.pattern);
      if (matches) {
        context.matches = [matches];
      }
    }
    return super.handleUpdate(update, context);
  }
}

export class ChosenInlineResultHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  public readonly pattern?: RegExp | string | ((resultId: string) => boolean);

  constructor(
    callbackOrPattern: HandlerCallback<C, R> | RegExp | string | ((resultId: string) => boolean) | null | undefined,
    callbackOrPattern2?: HandlerCallback<C, R> | RegExp | string | ((resultId: string) => boolean) | null | undefined
  ) {
    let cb: HandlerCallback<C, R>;
    let pat: RegExp | string | ((resultId: string) => boolean) | undefined;

    if (typeof callbackOrPattern === "function" && callbackOrPattern.length >= 1 && callbackOrPattern2 === undefined) {
      cb = callbackOrPattern as HandlerCallback<C, R>;
    } else if (typeof callbackOrPattern === "function" && typeof callbackOrPattern2 !== "function") {
      cb = callbackOrPattern as HandlerCallback<C, R>;
      pat = (callbackOrPattern2 as RegExp | string | ((resultId: string) => boolean)) ?? undefined;
    } else {
      cb = callbackOrPattern2 as HandlerCallback<C, R>;
      pat = (callbackOrPattern as RegExp | string | ((resultId: string) => boolean)) ?? undefined;
    }

    super(cb);
    this.pattern = pat;
  }

  async checkUpdate(update: Update): Promise<boolean> {
    const chosen = update.chosen_inline_result;
    if (!chosen) return false;

    if (!this.pattern) return true;
    const target = chosen.query || chosen.result_id;

    if (typeof this.pattern === "string") {
      return chosen.result_id === this.pattern || chosen.query === this.pattern;
    }
    if (this.pattern instanceof RegExp) {
      return this.pattern.test(target);
    }
    if (typeof this.pattern === "function") {
      return Boolean(this.pattern(target));
    }
    return false;
  }

  override async handleUpdate(update: Update, context: C): Promise<R> {
    const chosen = update.chosen_inline_result;
    if (chosen && this.pattern instanceof RegExp) {
      const target = chosen.query || chosen.result_id;
      const matches = target.match(this.pattern);
      if (matches) {
        context.matches = [matches];
      }
    }
    return super.handleUpdate(update, context);
  }
}

export class PollAnswerHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.poll_answer);
  }
}

export class ChatMemberHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  public static readonly CHAT_MEMBER = 1;
  public static readonly MY_CHAT_MEMBER = 2;
  public static readonly ANY = 3;

  public readonly chatMemberTypes: number;

  constructor(
    callback: HandlerCallback<C, R>,
    chatMemberTypes: number = ChatMemberHandler.ANY
  ) {
    super(callback);
    this.chatMemberTypes = chatMemberTypes;
  }

  async checkUpdate(update: Update): Promise<boolean> {
    if (this.chatMemberTypes === ChatMemberHandler.CHAT_MEMBER) {
      return Boolean(update.chat_member);
    }
    if (this.chatMemberTypes === ChatMemberHandler.MY_CHAT_MEMBER) {
      return Boolean(update.my_chat_member);
    }
    return Boolean(update.chat_member || update.my_chat_member);
  }
}

export class TypeHandler<
  T = unknown,
  C extends CallbackContext = CallbackContext,
  R = unknown
> extends BaseHandler<C, R> {
  constructor(
    public readonly typePredicate: (update: Update | RawUpdate) => boolean | Promise<boolean>,
    callback: HandlerCallback<C, R>
  ) {
    super(callback);
  }

  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(await this.typePredicate(update));
  }
}
