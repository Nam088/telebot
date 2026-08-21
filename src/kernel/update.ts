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
  PurchasedPaidMedia,
} from "../client/types.js";
import type { Bot } from "../client/bot.js";

/**
 * Wrapper for Telegram Update objects with convenience getters.
 *
 * Encapsulates the raw update delivered by Telegram and exposes lazy resolution
 * getters for the active user, chat, message, and sender.
 *
 * @example
 * ```ts
 * const user = update.effective_user;
 * const chat = update.effective_chat;
 * ```
 */
export class Update implements RawUpdate {
  public readonly update_id: number;
  public readonly message?: Message;
  public readonly edited_message?: Message;
  public readonly channel_post?: Message;
  public readonly edited_channel_post?: Message;
  public readonly business_connection?: BusinessConnection;
  public readonly business_message?: Message;
  public readonly edited_business_message?: Message;
  public readonly deleted_business_messages?: BusinessMessagesDeleted;
  public readonly message_reaction?: MessageReactionUpdated;
  public readonly message_reaction_count?: MessageReactionCountUpdated;
  public readonly inline_query?: InlineQuery;
  public readonly chosen_inline_result?: ChosenInlineResult;
  public readonly callback_query?: CallbackQuery;
  public readonly shipping_query?: ShippingQuery;
  public readonly pre_checkout_query?: PreCheckoutQuery;
  public readonly poll?: Poll;
  public readonly poll_answer?: PollAnswer;
  public readonly my_chat_member?: ChatMemberUpdated;
  public readonly chat_member?: ChatMemberUpdated;
  public readonly chat_join_request?: ChatJoinRequest;
  public readonly chat_boost?: ChatBoostUpdated;
  public readonly removed_chat_boost?: ChatBoostRemoved;
  public readonly purchased_paid_media?: PurchasedPaidMedia;

  private _bot?: Bot;

  /**
   * Constructs an {@link Update} wrapper instance.
   *
   * @param raw - The raw update payload received from the Telegram API.
   * @param bot - Optional {@link Bot} instance associated with this update.
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
    this.purchased_paid_media = raw.purchased_paid_media;
    this._bot = bot;
  }

  /**
   * The user that sent the message or triggered the update, resolved across update types.
   */
  get effectiveUser(): User | undefined {
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
    if (this.purchased_paid_media?.from) return this.purchased_paid_media.from;
    return undefined;
  }

  /**
   * Compatibility alias for {@link Update.effectiveUser}.
   */
  get effective_user(): User | undefined {
    return this.effectiveUser;
  }

  /**
   * The chat that this update belongs to.
   */
  get effectiveChat(): Chat | undefined {
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
   * Compatibility alias for {@link Update.effectiveChat}.
   */
  get effective_chat(): Chat | undefined {
    return this.effectiveChat;
  }

  /**
   * The message contained in this update.
   */
  get effectiveMessage(): Message | undefined {
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
   * Compatibility alias for {@link Update.effectiveMessage}.
   */
  get effective_message(): Message | undefined {
    return this.effectiveMessage;
  }

  /**
   * The sender of the message (either a {@link User} or a {@link Chat} channel sender).
   */
  get effectiveSender(): User | Chat | undefined {
    const msg = this.effectiveMessage;
    if (msg) {
      if (msg.from) return msg.from;
      if (msg.sender_chat) return msg.sender_chat;
    }
    return this.effectiveUser;
  }

  /**
   * Compatibility alias for {@link Update.effectiveSender}.
   */
  get effective_sender(): User | Chat | undefined {
    return this.effectiveSender;
  }
}
