/**
 * Update wrapper with helper getters.
 *
 * @packageDocumentation
 */

import type {
  RawUpdate,
  User,
  Chat,
  Message,
  CallbackQuery,
  InlineQuery,
  ChosenInlineResult,
  ShippingQuery,
  PreCheckoutQuery,
  Poll,
  PollAnswer,
  ChatMemberUpdated,
  ChatJoinRequest,
  ChatBoostUpdated,
  ChatBoostRemoved,
  BusinessConnection,
  BusinessMessagesDeleted,
  MessageReactionUpdated,
  MessageReactionCountUpdated,
} from "./types.js";
import type { Bot } from "./bot.js";

/**
 * Wrapper class around raw Telegram {@link RawUpdate} objects providing convenience getters
 * (`effective_user`, `effective_chat`, `effective_message`, `effective_sender`).
 *
 * @remarks
 * Property names mirror `python-telegram-bot` (`update.effective_user`, `update.effective_chat`, etc.)
 * in `snake_case` format.
 *
 * @example
 * ```ts
 * import { Update } from "telegram-bot-node";
 *
 * const update = new Update(rawUpdate, bot);
 * console.log(`Received update #${update.update_id} from ${update.effective_user?.first_name}`);
 * ```
 */
export class Update implements RawUpdate {
  /**
   * The update's unique identifier. Update identifiers start from a certain positive number and increase sequentially.
   */
  public readonly update_id: number;

  /**
   * New incoming message of any kind — text, photo, sticker, etc.
   */
  public readonly message?: Message;

  /**
   * New version of a message that is known to the bot and was edited.
   */
  public readonly edited_message?: Message;

  /**
   * New incoming channel post of any kind — text, photo, sticker, etc.
   */
  public readonly channel_post?: Message;

  /**
   * New version of a channel post that is known to the bot and was edited.
   */
  public readonly edited_channel_post?: Message;

  /**
   * The bot was connected to or disconnected from a business account, or a user edited an existing connection with the bot.
   */
  public readonly business_connection?: BusinessConnection;

  /**
   * New message from a connected business account.
   */
  public readonly business_message?: Message;

  /**
   * New version of a message from a connected business account.
   */
  public readonly edited_business_message?: Message;

  /**
   * Messages were deleted from a connected business account.
   */
  public readonly deleted_business_messages?: BusinessMessagesDeleted;

  /**
   * A reaction to a message was changed by a user.
   */
  public readonly message_reaction?: MessageReactionUpdated;

  /**
   * Reactions to a message with anonymous reactions were changed.
   */
  public readonly message_reaction_count?: MessageReactionCountUpdated;

  /**
   * New incoming inline query.
   */
  public readonly inline_query?: InlineQuery;

  /**
   * The result of an inline query that was chosen by a user and sent to their chat partner.
   */
  public readonly chosen_inline_result?: ChosenInlineResult;

  /**
   * New incoming callback query.
   */
  public readonly callback_query?: CallbackQuery;

  /**
   * New incoming shipping query. Only for invoices with flexible price.
   */
  public readonly shipping_query?: ShippingQuery;

  /**
   * New incoming pre-checkout query. Contains full information about checkout.
   */
  public readonly pre_checkout_query?: PreCheckoutQuery;

  /**
   * New poll state. Bots receive only updates about stopped polls and polls, which are sent by the bot.
   */
  public readonly poll?: Poll;

  /**
   * A user changed their answer in a non-anonymous poll.
   */
  public readonly poll_answer?: PollAnswer;

  /**
   * The bot's chat member status was updated in a chat.
   */
  public readonly my_chat_member?: ChatMemberUpdated;

  /**
   * A chat member's status was updated in a chat.
   */
  public readonly chat_member?: ChatMemberUpdated;

  /**
   * A request to join the chat has been sent.
   */
  public readonly chat_join_request?: ChatJoinRequest;

  /**
   * A chat boost was added.
   */
  public readonly chat_boost?: ChatBoostUpdated;

  /**
   * A boost was removed from a chat.
   */
  public readonly removed_chat_boost?: ChatBoostRemoved;

  private _bot?: Bot;

  /**
   * Constructs an {@link Update} wrapper instance.
   *
   * @param raw - The raw update payload received from the Telegram API.
   * @param bot - Optional {@link Bot} instance associated with this update.
   *
   * @example
   * ```ts
   * const update = new Update(rawPayload);
   * ```
   */
  constructor(raw: RawUpdate, bot?: Bot) {
    this.update_id = raw.update_id;
    this.message = raw.message;
    this.edited_message = raw.edited_message;
    this.channel_post = raw.channel_post;
    this.edited_channel_post = raw.edited_channel_post;
    this.business_connection = raw.business_connection;
    this.business_message = raw.business_message;
    this.edited_business_message = raw.edited_business_message;
    this.deleted_business_messages = raw.deleted_business_messages;
    this.message_reaction = raw.message_reaction;
    this.message_reaction_count = raw.message_reaction_count;
    this.inline_query = raw.inline_query;
    this.chosen_inline_result = raw.chosen_inline_result;
    this.callback_query = raw.callback_query;
    this.shipping_query = raw.shipping_query;
    this.pre_checkout_query = raw.pre_checkout_query;
    this.poll = raw.poll;
    this.poll_answer = raw.poll_answer;
    this.my_chat_member = raw.my_chat_member;
    this.chat_member = raw.chat_member;
    this.chat_join_request = raw.chat_join_request;
    this.chat_boost = raw.chat_boost;
    this.removed_chat_boost = raw.removed_chat_boost;
    this._bot = bot;
  }

  /**
   * The user that sent the message or triggered the update, resolved across message, callback_query, inline_query, etc.
   *
   * @returns The resolved {@link User} object, or `undefined` if no user is associated with this update.
   */
  get effective_user(): User | undefined {
    if (this.message?.from) return this.message.from;
    if (this.edited_message?.from) return this.edited_message.from;
    if (this.callback_query?.from) return this.callback_query.from;
    if (this.inline_query?.from) return this.inline_query.from;
    if (this.chosen_inline_result?.from) return this.chosen_inline_result.from;
    if (this.shipping_query?.from) return this.shipping_query.from;
    if (this.pre_checkout_query?.from) return this.pre_checkout_query.from;
    if (this.poll_answer?.user) return this.poll_answer.user;
    if (this.my_chat_member?.from) return this.my_chat_member.from;
    if (this.chat_member?.from) return this.chat_member.from;
    if (this.chat_join_request?.from) return this.chat_join_request.from;
    if (this.message_reaction?.user) return this.message_reaction.user;
    if (this.business_connection?.user) return this.business_connection.user;
    if (this.business_message?.from) return this.business_message.from;
    if (this.edited_business_message?.from) return this.edited_business_message.from;
    return undefined;
  }

  /**
   * The chat that this update belongs to, resolved across message, channel_post, callback_query, chat_member, etc.
   *
   * @returns The resolved {@link Chat} object, or `undefined` if no chat is associated with this update.
   */
  get effective_chat(): Chat | undefined {
    if (this.message?.chat) return this.message.chat;
    if (this.edited_message?.chat) return this.edited_message.chat;
    if (this.channel_post?.chat) return this.channel_post.chat;
    if (this.edited_channel_post?.chat) return this.edited_channel_post.chat;
    if (this.callback_query?.message?.chat) return this.callback_query.message.chat;
    if (this.my_chat_member?.chat) return this.my_chat_member.chat;
    if (this.chat_member?.chat) return this.chat_member.chat;
    if (this.chat_join_request?.chat) return this.chat_join_request.chat;
    if (this.message_reaction?.chat) return this.message_reaction.chat;
    if (this.message_reaction_count?.chat) return this.message_reaction_count.chat;
    if (this.chat_boost?.chat) return this.chat_boost.chat;
    if (this.removed_chat_boost?.chat) return this.removed_chat_boost.chat;
    if (this.business_message?.chat) return this.business_message.chat;
    if (this.edited_business_message?.chat) return this.edited_business_message.chat;
    if (this.deleted_business_messages?.chat) return this.deleted_business_messages.chat;
    if (this.poll_answer?.voter_chat) return this.poll_answer.voter_chat;
    return undefined;
  }

  /**
   * The message contained in this update (either regular message, edited message, channel post, or callback query message).
   *
   * @returns The resolved {@link Message} object, or `undefined` if none present.
   */
  get effective_message(): Message | undefined {
    return (
      this.message ??
      this.edited_message ??
      this.channel_post ??
      this.edited_channel_post ??
      this.callback_query?.message ??
      this.business_message ??
      this.edited_business_message
    );
  }

  /**
   * The sender of the message (either a {@link User} or a {@link Chat} channel sender).
   *
   * @returns The resolved sender {@link User} or {@link Chat}, or `undefined`.
   */
  get effective_sender(): User | Chat | undefined {
    const msg = this.effective_message;
    if (msg) {
      if (msg.from) return msg.from;
      if (msg.sender_chat) return msg.sender_chat;
    }
    return this.effective_user;
  }
}

