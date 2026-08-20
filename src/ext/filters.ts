/**
 * Update and message filtering system with logical combinators.
 *
 * @packageDocumentation
 */

import type { Update } from "../telegram/update.js";
import type { Message } from "../telegram/types.js";
import type { MessageEntityType } from "../telegram/constants.js";


/**
 * Base Filter class providing logical combinator methods (`and`, `or`, `not`).
 *
 * @remarks
 * In `python-telegram-bot`, bitwise operators `&`, `|`, `~` are used. In TypeScript,
 * use explicit `.and()`, `.or()`, `.not()` method chaining instead.
 *
 * @example
 * ```ts
 * const customFilter = filters.TEXT.and(filters.COMMAND.not());
 * ```
 */
export abstract class BaseFilter {
  /**
   * Evaluates whether the incoming {@link Update} satisfies the filter condition.
   *
   * @param update - Incoming Telegram update object.
   * @returns `true` or a Promise resolving to `true` if update matches filter.
   */
  abstract checkUpdate(update: Update): boolean | Promise<boolean>;

  /**
   * Combines this filter with another using a logical AND (`&&`) condition.
   *
   * @param other - The other {@link BaseFilter} to combine with.
   * @returns A composite filter that matches if both filters match.
   *
   * @example
   * ```ts
   * const combined = filterA.and(filterB);
   * ```
   */
  and(other: BaseFilter): BaseFilter {
    return new AndFilter(this, other);
  }

  /**
   * Combines this filter with another using a logical OR (`||`) condition.
   *
   * @param other - The other {@link BaseFilter} to combine with.
   * @returns A composite filter that matches if either filter matches.
   *
   * @example
   * ```ts
   * const combined = filterA.or(filterB);
   * ```
   */
  or(other: BaseFilter): BaseFilter {
    return new OrFilter(this, other);
  }

  /**
   * Inverts this filter using a logical NOT (`!`) condition.
   *
   * @returns An inverted filter that matches when this filter does not match.
   *
   * @example
   * ```ts
   * const inverted = filterA.not();
   * ```
   */
  not(): BaseFilter {
    return new NotFilter(this);
  }
}

/**
 * Internal AND filter implementation.
 */
class AndFilter extends BaseFilter {
  constructor(private f1: BaseFilter, private f2: BaseFilter) {
    super();
  }

  async checkUpdate(update: Update): Promise<boolean> {
    const res1 = await this.f1.checkUpdate(update);
    if (!res1) return false;
    return Boolean(await this.f2.checkUpdate(update));
  }
}

/**
 * Internal OR filter implementation.
 */
class OrFilter extends BaseFilter {
  constructor(private f1: BaseFilter, private f2: BaseFilter) {
    super();
  }

  async checkUpdate(update: Update): Promise<boolean> {
    const res1 = await this.f1.checkUpdate(update);
    if (res1) return true;
    return Boolean(await this.f2.checkUpdate(update));
  }
}

/**
 * Internal NOT filter implementation.
 */
class NotFilter extends BaseFilter {
  constructor(private f: BaseFilter) {
    super();
  }

  async checkUpdate(update: Update): Promise<boolean> {
    const res = await this.f.checkUpdate(update);
    return !res;
  }
}

/**
 * Filter that executes a predicate on the update's {@link Update.effective_message}.
 *
 * @example
 * ```ts
 * const photoFilter = new MessageFilter((msg) => Boolean(msg.photo));
 * ```
 */
export class MessageFilter extends BaseFilter {
  /**
   * Creates a new {@link MessageFilter} instance with a predicate.
   *
   * @param predicate - Function testing a {@link Message} returning a boolean or Promise.
   */
  constructor(private predicate: (message: Message) => boolean | Promise<boolean>) {
    super();
  }

  /**
   * Checks if the update contains an effective message matching the predicate.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if message matches predicate, `false` otherwise.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const message = update.effective_message;
    if (!message) return false;
    return Boolean(await this.predicate(message));
  }
}

/**
 * Filter that executes a custom predicate on the whole {@link Update}.
 */
export class UpdateFilter extends BaseFilter {
  /**
   * Constructs an {@link UpdateFilter} with a predicate function.
   *
   * @param predicate - Predicate taking an {@link Update} and returning boolean or Promise of boolean.
   */
  constructor(private predicate: (update: Update) => boolean | Promise<boolean>) {
    super();
  }

  /**
   * Checks if the update satisfies the custom predicate.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if predicate returns true.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(await this.predicate(update));
  }
}

/**
 * Filter that tests message text or caption against a regular expression pattern.
 * When matched, stores capture groups for retrieval in handler context.
 */
export class RegexFilter extends BaseFilter {
  /**
   * Compiled regular expression instance.
   */
  public readonly regex: RegExp;

  /**
   * Constructs a new {@link RegexFilter}.
   *
   * @param pattern - A RegExp instance or regex pattern string.
   * @param flags - Optional regex flags when passing pattern as string.
   */
  constructor(pattern: RegExp | string, flags?: string) {

    super();
    this.regex = typeof pattern === "string" ? new RegExp(pattern, flags) : pattern;
  }

  /**
   * Checks if message text or caption matches the regular expression.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if regex matches message text or caption.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const msg = update.effective_message;
    if (!msg) return false;

    const targetText = msg.text ?? msg.caption;
    if (typeof targetText !== "string") return false;

    const match = targetText.match(this.regex);
    if (!match) return false;

    const rawUpdate = update as unknown as Record<string, unknown>;
    const matches = (rawUpdate["_regex_matches"] as RegExpMatchArray[]) || [];
    matches.push(match);
    rawUpdate["_regex_matches"] = matches;

    return true;
  }
}

/**
 * Helper to match message entities of a given type.
 *
 * @param type - Message entity type to look for.
 */
function createEntityFilter(type: MessageEntityType): BaseFilter {
  return new MessageFilter((msg) => {
    const entities = msg.entities ?? msg.caption_entities;
    if (!entities || entities.length === 0) return false;
    return entities.some((e) => e.type === type);
  });
}

// Basic filters
const TEXT = new MessageFilter((msg) => {
  if (typeof msg.text !== "string") return false;
  if (msg.entities && msg.entities.length > 0) {
    const first = msg.entities[0];
    if (first && first.type === "bot_command" && first.offset === 0) {
      return false;
    }
  }
  return true;
});

const COMMAND = new MessageFilter((msg) => {
  if (typeof msg.text !== "string") return false;
  if (msg.entities && msg.entities.length > 0) {
    const first = msg.entities[0];
    if (first && first.type === "bot_command" && first.offset === 0) {
      return true;
    }
  }
  return false;
});

const ALL = new MessageFilter(() => true);

const PHOTO = new MessageFilter((msg) => Boolean(msg.photo && msg.photo.length > 0));
const DOCUMENT = new MessageFilter((msg) => Boolean(msg.document));
const AUDIO = new MessageFilter((msg) => Boolean(msg.audio));
const VIDEO = new MessageFilter((msg) => Boolean(msg.video));
const VOICE = new MessageFilter((msg) => Boolean(msg.voice));
const VIDEO_NOTE = new MessageFilter((msg) => Boolean(msg.video_note));
const ANIMATION = new MessageFilter((msg) => Boolean(msg.animation));
const CONTACT = new MessageFilter((msg) => Boolean(msg.contact));
const LOCATION = new MessageFilter((msg) => Boolean(msg.location));
const VENUE = new MessageFilter((msg) => Boolean(msg.venue));
const POLL = new MessageFilter((msg) => Boolean(msg.poll));
const DICE = new MessageFilter((msg) => Boolean(msg.dice));
const STICKER = new MessageFilter((msg) => Boolean(msg.sticker));
const GAME = new MessageFilter((msg) => Boolean(msg.game));
const FORWARDED = new MessageFilter((msg) => Boolean(msg.forward_origin || (msg as unknown as Record<string, unknown>)["forward_date"]));
const REPLY = new MessageFilter((msg) => Boolean(msg.reply_to_message));
const CAPTION = new MessageFilter((msg) => typeof msg.caption === "string" && msg.caption.length > 0);

const ATTACHMENT = PHOTO.or(DOCUMENT)
  .or(AUDIO)
  .or(VIDEO)
  .or(VOICE)
  .or(VIDEO_NOTE)
  .or(ANIMATION)
  .or(STICKER)
  .or(CONTACT)
  .or(LOCATION)
  .or(VENUE)
  .or(POLL)
  .or(DICE);

// ChatType filters
const ChatTypePrivate = new MessageFilter((msg) => msg.chat.type === "private");
const ChatTypeGroup = new MessageFilter((msg) => msg.chat.type === "group");
const ChatTypeSupergroup = new MessageFilter((msg) => msg.chat.type === "supergroup");
const ChatTypeChannel = new MessageFilter((msg) => msg.chat.type === "channel");
const ChatTypeGroups = ChatTypeGroup.or(ChatTypeSupergroup);

const ChatType = {
  /** Matches private chats. */
  PRIVATE: ChatTypePrivate,
  /** Matches normal group chats. */
  GROUP: ChatTypeGroup,
  /** Matches supergroup chats. */
  SUPERGROUP: ChatTypeSupergroup,
  /** Matches channel chats. */
  CHANNEL: ChatTypeChannel,
  /** Matches group and supergroup chats. */
  GROUPS: ChatTypeGroups,
};

// StatusUpdate filters
const NEW_CHAT_MEMBERS = new MessageFilter((msg) => Boolean(msg.new_chat_members && msg.new_chat_members.length > 0));
const LEFT_CHAT_MEMBER = new MessageFilter((msg) => Boolean(msg.left_chat_member));
const NEW_CHAT_TITLE = new MessageFilter((msg) => Boolean(msg.new_chat_title));
const NEW_CHAT_PHOTO = new MessageFilter((msg) => Boolean(msg.new_chat_photo && msg.new_chat_photo.length > 0));
const DELETE_CHAT_PHOTO = new MessageFilter((msg) => Boolean(msg.delete_chat_photo));
const GROUP_CHAT_CREATED = new MessageFilter((msg) => Boolean(msg.group_chat_created));
const SUPERGROUP_CHAT_CREATED = new MessageFilter((msg) => Boolean(msg.supergroup_chat_created));
const CHANNEL_CHAT_CREATED = new MessageFilter((msg) => Boolean(msg.channel_chat_created));
const MIGRATE_TO_CHAT_ID = new MessageFilter((msg) => Boolean(msg.migrate_to_chat_id));
const MIGRATE_FROM_CHAT_ID = new MessageFilter((msg) => Boolean(msg.migrate_from_chat_id));
const PINNED_MESSAGE = new MessageFilter((msg) => Boolean(msg.pinned_message));

const StatusUpdateAll = NEW_CHAT_MEMBERS.or(LEFT_CHAT_MEMBER)
  .or(NEW_CHAT_TITLE)
  .or(NEW_CHAT_PHOTO)
  .or(DELETE_CHAT_PHOTO)
  .or(GROUP_CHAT_CREATED)
  .or(SUPERGROUP_CHAT_CREATED)
  .or(CHANNEL_CHAT_CREATED)
  .or(MIGRATE_TO_CHAT_ID)
  .or(MIGRATE_FROM_CHAT_ID)
  .or(PINNED_MESSAGE);

const StatusUpdate = {
  /** Matches messages when new members join. */
  NEW_CHAT_MEMBERS,
  /** Matches messages when a member leaves. */
  LEFT_CHAT_MEMBER,
  /** Matches chat title change service messages. */
  NEW_CHAT_TITLE,
  /** Matches chat photo change service messages. */
  NEW_CHAT_PHOTO,
  /** Matches chat photo deletion service messages. */
  DELETE_CHAT_PHOTO,
  /** Matches group chat creation service messages. */
  GROUP_CHAT_CREATED,
  /** Matches supergroup chat creation service messages. */
  SUPERGROUP_CHAT_CREATED,
  /** Matches channel chat creation service messages. */
  CHANNEL_CHAT_CREATED,
  /** Matches chat migration to supergroup messages. */
  MIGRATE_TO_CHAT_ID,
  /** Matches chat migration from group messages. */
  MIGRATE_FROM_CHAT_ID,
  /** Matches pinned message service messages. */
  PINNED_MESSAGE,
  /** Matches any chat status update service message. */
  ALL: StatusUpdateAll,
};

// Entity filters
const MENTION = createEntityFilter("mention");
const HASHTAG = createEntityFilter("hashtag");
const BOT_COMMAND = createEntityFilter("bot_command");
const URL = createEntityFilter("url");
const EMAIL = createEntityFilter("email");
const PHONE_NUMBER = createEntityFilter("phone_number");
const CASHTAG = createEntityFilter("cashtag");

/**
 * Built-in filter collection mirroring `python-telegram-bot`'s `telegram.ext.filters`.
 *
 * @example
 * ```ts
 * import { filters, MessageHandler } from "telegram-bot-node";
 *
 * // Handles all regular text messages
 * app.addHandler(new MessageHandler(filters.TEXT, echoCallback));
 *
 * // Handles text messages in private chats
 * app.addHandler(new MessageHandler(filters.TEXT.and(filters.ChatType.PRIVATE), privateCallback));
 * ```
 */
export const filters = {
  ALL,
  TEXT,
  COMMAND,
  PHOTO,
  DOCUMENT,
  AUDIO,
  VIDEO,
  VOICE,
  VIDEO_NOTE,
  ANIMATION,
  CONTACT,
  LOCATION,
  VENUE,
  POLL,
  DICE,
  STICKER,
  GAME,
  FORWARDED,
  REPLY,
  CAPTION,
  ATTACHMENT,
  MENTION,
  HASHTAG,
  BOT_COMMAND,
  URL,
  EMAIL,
  PHONE_NUMBER,
  CASHTAG,
  ChatType,
  StatusUpdate,
  /**
   * Factory creating a {@link RegexFilter} matching text or caption against a regular expression.
   *
   * @param pattern - RegExp or pattern string.
   * @param flags - Optional regex flags string.
   * @returns A new {@link RegexFilter}.
   */
  Regex: (pattern: RegExp | string, flags?: string): RegexFilter => new RegexFilter(pattern, flags),
  /**
   * Factory creating an {@link UpdateFilter} with a custom predicate function.
   *
   * @param predicate - Custom function evaluating an {@link Update}.
   * @returns A new {@link UpdateFilter}.
   */
  Custom: (predicate: (update: Update) => boolean | Promise<boolean>): UpdateFilter =>
    new UpdateFilter(predicate),
};
