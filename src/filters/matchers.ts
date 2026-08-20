/**
 * Update and message filtering system with logical combinators.
 *
 * @packageDocumentation
 */

import type { Update } from "../kernel/update.js";
import type { Message } from "../client/types.js";

/**
 * Abstract base class for update and message filters supporting Boolean logic chaining.
 *
 * All filters inherit `.and()`, `.or()`, and `.not()` methods to combine conditions.
 *
 * @example
 * ```ts
 * const filter = filters.TEXT.and(filters.ChatType.PRIVATE).not();
 * ```
 */
export abstract class BaseFilter {
  /**
   * Evaluates the filter condition against an incoming {@link Update}.
   *
   * @param update - The incoming Telegram update.
   * @returns `true` if the condition is satisfied, or a Promise resolving to `true`.
   */
  abstract checkUpdate(update: Update): boolean | Promise<boolean>;

  /**
   * Combines this filter with another using logical AND (`&&`).
   *
   * @param other - The other filter to combine with.
   * @returns A new combined {@link BaseFilter}.
   *
   * @example
   * ```ts
   * const textInPrivate = filters.TEXT.and(filters.ChatType.PRIVATE);
   * ```
   */
  and(other: BaseFilter): BaseFilter {
    return new AndFilter(this, other);
  }

  /**
   * Combines this filter with another using logical OR (`||`).
   *
   * @param other - The other filter to combine with.
   * @returns A new combined {@link BaseFilter}.
   *
   * @example
   * ```ts
   * const photoOrDoc = filters.PHOTO.or(filters.DOCUMENT);
   * ```
   */
  or(other: BaseFilter): BaseFilter {
    return new OrFilter(this, other);
  }

  /**
   * Inverts this filter using logical NOT (`!`).
   *
   * @returns A new inverted {@link BaseFilter}.
   *
   * @example
   * ```ts
   * const notCommand = filters.COMMAND.not();
   * ```
   */
  not(): BaseFilter {
    return new NotFilter(this);
  }
}

/**
 * Filter that evaluates logical AND across two child filters.
 *
 * @internal
 */
class AndFilter extends BaseFilter {
  /**
   * Constructs a new {@link AndFilter}.
   *
   * @param f1 - First filter operand.
   * @param f2 - Second filter operand.
   */
  constructor(
    private f1: BaseFilter,
    private f2: BaseFilter,
  ) {
    super();
  }

  /**
   * Evaluates both child filters sequentially.
   *
   * @param update - Incoming update.
   * @returns `true` if both filters match.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const res1 = await this.f1.checkUpdate(update);
    if (!res1) return false;
    return Boolean(await this.f2.checkUpdate(update));
  }
}

/**
 * Filter that evaluates logical OR across two child filters.
 *
 * @internal
 */
class OrFilter extends BaseFilter {
  /**
   * Constructs a new {@link OrFilter}.
   *
   * @param f1 - First filter operand.
   * @param f2 - Second filter operand.
   */
  constructor(
    private f1: BaseFilter,
    private f2: BaseFilter,
  ) {
    super();
  }

  /**
   * Evaluates either child filter.
   *
   * @param update - Incoming update.
   * @returns `true` if at least one filter matches.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const res1 = await this.f1.checkUpdate(update);
    if (res1) return true;
    return Boolean(await this.f2.checkUpdate(update));
  }
}

/**
 * Filter that evaluates logical NOT on a child filter.
 *
 * @internal
 */
class NotFilter extends BaseFilter {
  /**
   * Constructs a new {@link NotFilter}.
   *
   * @param f - Child filter to invert.
   */
  constructor(private f: BaseFilter) {
    super();
  }

  /**
   * Evaluates the inverted result of the child filter.
   *
   * @param update - Incoming update.
   * @returns `true` if child filter returns `false`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const res = await this.f.checkUpdate(update);
    return !res;
  }
}

/**
 * Filter that evaluates incoming messages using a custom predicate function.
 *
 * @example
 * ```ts
 * const customFilter = new MessageFilter((msg) => msg.text?.startsWith("!") ?? false);
 * ```
 */
export class MessageFilter extends BaseFilter {
  /**
   * Constructs a new {@link MessageFilter}.
   *
   * @param predicate - Function that evaluates a {@link Message} and returns boolean.
   */
  constructor(private predicate: (message: Message) => boolean | Promise<boolean>) {
    super();
  }

  /**
   * Evaluates the predicate on `update.effective_message`.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if the message satisfies the predicate.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const message = update.effective_message;
    if (!message) return false;
    return Boolean(await this.predicate(message));
  }
}

function createMediaFilter(key: keyof Message): BaseFilter {
  return new MessageFilter((msg) => Boolean(msg[key]));
}

function createChatTypeFilter(type: string): BaseFilter {
  return new MessageFilter((msg) => msg.chat.type === type);
}

function createEntityFilter(entityType: string): BaseFilter {
  return new MessageFilter((msg) => {
    if (!msg.entities || msg.entities.length === 0) return false;
    return msg.entities.some((e) => e.type === entityType);
  });
}

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

const PHOTO = createMediaFilter("photo");
const DOCUMENT = createMediaFilter("document");
const AUDIO = createMediaFilter("audio");
const VIDEO = createMediaFilter("video");
const VOICE = createMediaFilter("voice");
const VIDEO_NOTE = createMediaFilter("video_note");
const ANIMATION = createMediaFilter("animation");
const CONTACT = createMediaFilter("contact");
const LOCATION = createMediaFilter("location");
const VENUE = createMediaFilter("venue");
const POLL = createMediaFilter("poll");
const DICE = createMediaFilter("dice");
const STICKER = createMediaFilter("sticker");
const GAME = createMediaFilter("game");
const FORWARDED = new MessageFilter((msg) => Boolean(msg.forward_origin));
const REPLY = new MessageFilter((msg) => Boolean(msg.reply_to_message));
const CAPTION = new MessageFilter((msg) => typeof msg.caption === "string");
const ATTACHMENT = PHOTO.or(DOCUMENT).or(AUDIO).or(VIDEO).or(VOICE).or(ANIMATION);

/**
 * Filter that matches message text or caption against a regular expression pattern.
 *
 * Populates `context.matches` when handled in a {@link MessageHandler}.
 *
 * @example
 * ```ts
 * const regexFilter = new RegexFilter(/^order_(\d+)$/i);
 * ```
 */
export class RegexFilter extends BaseFilter {
  /**
   * The compiled regular expression pattern to match against.
   */
  public readonly pattern: RegExp;

  /**
   * Constructs a new {@link RegexFilter}.
   *
   * @param pattern - Regular expression to test against message text or caption.
   */
  constructor(pattern: RegExp) {
    super();
    this.pattern = pattern;
  }

  /**
   * Checks whether the message text or caption matches the pattern.
   *
   * @param update - Incoming Telegram update.
   * @returns `true` if text or caption matches.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const msg = update.effective_message;
    if (!msg) return false;
    const text = msg.text ?? msg.caption;
    if (typeof text !== "string") return false;

    const matches = text.match(this.pattern);
    if (!matches) return false;
    return true;
  }
}

/**
 * Filter that executes an arbitrary predicate against the full {@link Update} object.
 *
 * @example
 * ```ts
 * const customFilter = new CustomFilter((update) => update.effective_user?.id === 123456);
 * ```
 */
export class CustomFilter extends BaseFilter {
  /**
   * The custom predicate function.
   */
  public readonly filterFn: (update: Update) => boolean | Promise<boolean>;

  /**
   * Constructs a new {@link CustomFilter}.
   *
   * @param filterFn - Predicate receiving an {@link Update} and returning boolean.
   */
  constructor(filterFn: (update: Update) => boolean | Promise<boolean>) {
    super();
    this.filterFn = filterFn;
  }

  /**
   * Evaluates the custom predicate against the incoming update.
   *
   * @param update - Incoming Telegram update.
   * @returns Result of the predicate function.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(await this.filterFn(update));
  }
}

const ChatTypePrivate = createChatTypeFilter("private");
const ChatTypeGroup = createChatTypeFilter("group");
const ChatTypeSupergroup = createChatTypeFilter("supergroup");
const ChatTypeChannel = createChatTypeFilter("channel");
const ChatTypeGroups = ChatTypeGroup.or(ChatTypeSupergroup);

/**
 * Filters grouped by Telegram chat types (private, group, supergroup, channel).
 */
export const ChatTypeFilters = {
  /** Matches messages in private direct chats */
  PRIVATE: ChatTypePrivate,
  /** Matches messages in standard basic groups */
  GROUP: ChatTypeGroup,
  /** Matches messages in supergroups */
  SUPERGROUP: ChatTypeSupergroup,
  /** Matches messages in broadcast channels */
  CHANNEL: ChatTypeChannel,
  /** Matches messages in either basic groups or supergroups */
  GROUPS: ChatTypeGroups,
};

const NEW_CHAT_MEMBERS = new MessageFilter((msg) =>
  Boolean(msg.new_chat_members && msg.new_chat_members.length > 0),
);
const LEFT_CHAT_MEMBER = new MessageFilter((msg) => Boolean(msg.left_chat_member));
const NEW_CHAT_TITLE = new MessageFilter((msg) => Boolean(msg.new_chat_title));
const NEW_CHAT_PHOTO = new MessageFilter((msg) =>
  Boolean(msg.new_chat_photo && msg.new_chat_photo.length > 0),
);
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

/**
 * Filters for chat service messages and status updates (member joins, title changes, migrations).
 */
export const StatusUpdateFilters = {
  /** Matches messages where new members joined or were added */
  NEW_CHAT_MEMBERS,
  /** Matches messages where a member left or was removed */
  LEFT_CHAT_MEMBER,
  /** Matches messages where chat title was changed */
  NEW_CHAT_TITLE,
  /** Matches messages where chat photo was changed */
  NEW_CHAT_PHOTO,
  /** Matches messages where chat photo was deleted */
  DELETE_CHAT_PHOTO,
  /** Matches messages indicating a group chat was created */
  GROUP_CHAT_CREATED,
  /** Matches messages indicating a supergroup was created */
  SUPERGROUP_CHAT_CREATED,
  /** Matches messages indicating a channel was created */
  CHANNEL_CHAT_CREATED,
  /** Matches migration service messages with target chat ID */
  MIGRATE_TO_CHAT_ID,
  /** Matches migration service messages with source chat ID */
  MIGRATE_FROM_CHAT_ID,
  /** Matches pinned message notifications */
  PINNED_MESSAGE,
  /** Matches any chat status update */
  ALL: StatusUpdateAll,
};

const MENTION = createEntityFilter("mention");
const HASHTAG = createEntityFilter("hashtag");
const BOT_COMMAND = createEntityFilter("bot_command");
const URL = createEntityFilter("url");
const EMAIL = createEntityFilter("email");
const PHONE_NUMBER = createEntityFilter("phone_number");
const CASHTAG = createEntityFilter("cashtag");

/**
 * Predefined update and message filter collection for message routing.
 *
 * @example
 * ```ts
 * import { filters, MessageHandler } from "telegram-bot-node";
 *
 * // Matches non-command text messages in private chats
 * const privateText = new MessageHandler(
 *   filters.TEXT.and(filters.ChatType.PRIVATE),
 *   async (update, context) => { ... }
 * );
 * ```
 */
export const filters = {
  /** Matches all messages unconditionally */
  ALL,
  /** Matches plain text messages excluding bot commands */
  TEXT,
  /** Matches messages starting with a bot command */
  COMMAND,
  /** Matches photo messages */
  PHOTO,
  /** Matches document / file messages */
  DOCUMENT,
  /** Matches audio music files */
  AUDIO,
  /** Matches video files */
  VIDEO,
  /** Matches voice audio notes */
  VOICE,
  /** Matches round video notes */
  VIDEO_NOTE,
  /** Matches animated GIF files */
  ANIMATION,
  /** Matches phone contact cards */
  CONTACT,
  /** Matches geographic locations */
  LOCATION,
  /** Matches venue locations */
  VENUE,
  /** Matches poll messages */
  POLL,
  /** Matches animated dice rolls */
  DICE,
  /** Matches sticker messages */
  STICKER,
  /** Matches game messages */
  GAME,
  /** Matches forwarded messages */
  FORWARDED,
  /** Matches reply messages */
  REPLY,
  /** Matches messages with a caption */
  CAPTION,
  /** Matches any media attachment (photo, document, audio, video, voice, animation) */
  ATTACHMENT,
  /** Matches messages containing `@username` mentions */
  MENTION,
  /** Matches messages containing #hashtags */
  HASHTAG,
  /** Matches messages containing bot command entities */
  BOT_COMMAND,
  /** Matches messages containing HTTP/HTTPS web links */
  URL,
  /** Matches messages containing email addresses */
  EMAIL,
  /** Matches messages containing phone numbers */
  PHONE_NUMBER,
  /** Matches messages containing $CASHTAG symbols */
  CASHTAG,
  /** Chat type filter sub-namespace */
  ChatType: ChatTypeFilters,
  /** Chat status update filter sub-namespace */
  StatusUpdate: StatusUpdateFilters,
  /**
   * Creates a filter matching text or caption against a regular expression.
   *
   * @param pattern - Regular expression or pattern string.
   * @returns A new {@link RegexFilter}.
   *
   * @example
   * ```ts
   * const orderFilter = filters.Regex(/^order_(\d+)$/i);
   * ```
   */
  Regex(pattern: RegExp | string): RegexFilter {
    return new RegexFilter(typeof pattern === "string" ? new RegExp(pattern) : pattern);
  },
  /**
   * Creates a custom filter using an arbitrary update predicate.
   *
   * @param fn - Predicate function returning boolean or Promise of boolean.
   * @returns A new {@link CustomFilter}.
   *
   * @example
   * ```ts
   * const adminOnly = filters.Custom((update) => update.effective_user?.id === 12345);
   * ```
   */
  Custom(fn: (update: Update) => boolean | Promise<boolean>): CustomFilter {
    return new CustomFilter(fn);
  },
};
