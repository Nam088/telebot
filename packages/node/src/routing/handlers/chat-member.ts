import type { Update } from "../../kernel/update.js";
import { CallbackContext } from "../../kernel/context.js";
import { BaseHandler, HandlerCallback } from "./base.js";

/**
 * Handler for chat membership changes (`chat_member` and `my_chat_member` updates).
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 * @example
 * ```ts
 * const memberHandler = new ChatMemberHandler(async (update, context) => {
 *   console.log("Chat member updated:", update.chat_member?.new_chat_member.status);
 * }, ChatMemberHandler.CHAT_MEMBER);
 * ```
 */
export class ChatMemberHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /** Target only member updates of other users (`chat_member`) */
  public static readonly CHAT_MEMBER = 1;
  /** Target only updates for the bot itself (`my_chat_member`) */
  public static readonly MY_CHAT_MEMBER = 2;
  /** Target any chat member update */
  public static readonly ANY = 3;
  /**
   * Filter mask specifying which chat member updates to handle.
   */
  public readonly chatMemberTypes: number;

  /**
   * Constructs a new {@link ChatMemberHandler}.
   *
   * @param callback - Function invoked when the update matches.
   * @param chatMemberTypes - Type filter mask (`CHAT_MEMBER`, `MY_CHAT_MEMBER`, or `ANY`).
   * @defaultValue `ChatMemberHandler.ANY`
   */
  constructor(callback: HandlerCallback<C, R>, chatMemberTypes: number = ChatMemberHandler.ANY) {
    super(callback);
    this.chatMemberTypes = chatMemberTypes;
  }

  /**
   * Checks whether the update matches the requested chat member types.
   *
   * @param update - The update to test.
   * @returns `true` if update matches.
   */
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

/**
 * Handler for user responses to non-anonymous Telegram polls (`poll_answer` updates).
 *
 * @typeParam C - Type of the callback context.
 * @typeParam R - Return value type.
 * @example
 * ```ts
 * const pollHandler = new PollAnswerHandler(async (update, context) => {
 *   console.log(`User ${update.poll_answer?.user?.id} voted ${update.poll_answer?.option_ids}`);
 * });
 * ```
 */
export class PollAnswerHandler<
  C extends CallbackContext = CallbackContext,
  R = unknown,
> extends BaseHandler<C, R> {
  /**
   * Checks whether the update contains a `poll_answer` update.
   *
   * @param update - The update to test.
   * @returns `true` if update has `poll_answer`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(update.poll_answer);
  }
}
