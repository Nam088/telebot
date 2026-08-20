import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import { BaseFilter } from "../../filters/base.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Handler for Telegram bot commands (e.g. `/start`, `/help`).
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 * @example
 * ```ts
 * const startHandler = new CommandHandler("start", async (update, context) => {
 *   await context.bot.sendMessage({ chat_id: update.effective_chat!.id, text: "Hello!" });
 * });
 * ```
 */
export class CommandHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Normalized set of command names that trigger this handler (without `/` or `@botname`).
   */
  public readonly commands: Set<string>;
  /**
   * Optional secondary filter to apply before triggering.
   */
  public readonly filters?: BaseFilter;

  /**
   * Creates a new {@link CommandHandler}.
   *
   * @param command - A single command string (e.g. `"start"`) or an array of aliases.
   * @param callback - Function invoked when the command matches.
   * @param filters - Optional additional filter criteria.
   * @throws When command is empty or contains only whitespace.
   */
  constructor(command: string | string[], callback: HandlerCallback<C, R>, filters?: BaseFilter) {
    super(callback);
    const commandList = Array.isArray(command) ? command : [command];
    if (commandList.length === 0 || commandList.some((c) => !c || c.trim() === "")) {
      throw new Error("CommandHandler requires at least one non-empty command string.");
    }

    this.commands = new Set(commandList.map((c) => c.toLowerCase()));
    this.filters = filters;
  }

  /**
   * Checks whether the update contains a matching bot command.
   *
   * @param update - The update to test.
   * @returns `true` if command matches, `false` otherwise.
   */
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

  /**
   * Parses positional command arguments into `context.args` and executes callback.
   *
   * @param update - The incoming update.
   * @param context - Callback context instance.
   * @returns Result from callback execution.
   */
  override async handleUpdate(update: Update, context: C): Promise<R> {
    const msg = update.effective_message;
    if (msg?.text) {
      const parts = msg.text.trim().split(/\s+/);
      context.args = parts.slice(1);
    }

    return super.handleUpdate(update, context);
  }
}
