/**
 * Update and message filtering system with logical combinators.
 *
 * @packageDocumentation
 */

import type { Update } from "../kernel/update.js";
import type { Message } from "../client/types.js";

export abstract class BaseFilter {
  abstract checkUpdate(update: Update): boolean | Promise<boolean>;

  and(other: BaseFilter): BaseFilter {
    return new AndFilter(this, other);
  }

  or(other: BaseFilter): BaseFilter {
    return new OrFilter(this, other);
  }

  not(): BaseFilter {
    return new NotFilter(this);
  }
}

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

class NotFilter extends BaseFilter {
  constructor(private f: BaseFilter) {
    super();
  }

  async checkUpdate(update: Update): Promise<boolean> {
    const res = await this.f.checkUpdate(update);
    return !res;
  }
}

export class MessageFilter extends BaseFilter {
  constructor(private predicate: (message: Message) => boolean | Promise<boolean>) {
    super();
  }

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

export class RegexFilter extends BaseFilter {
  constructor(public readonly pattern: RegExp) {
    super();
  }

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

export class CustomFilter extends BaseFilter {
  constructor(public readonly filterFn: (update: Update) => boolean | Promise<boolean>) {
    super();
  }

  async checkUpdate(update: Update): Promise<boolean> {
    return Boolean(await this.filterFn(update));
  }
}

const ChatTypePrivate = createChatTypeFilter("private");
const ChatTypeGroup = createChatTypeFilter("group");
const ChatTypeSupergroup = createChatTypeFilter("supergroup");
const ChatTypeChannel = createChatTypeFilter("channel");
const ChatTypeGroups = ChatTypeGroup.or(ChatTypeSupergroup);

export const ChatTypeFilters = {
  PRIVATE: ChatTypePrivate,
  GROUP: ChatTypeGroup,
  SUPERGROUP: ChatTypeSupergroup,
  CHANNEL: ChatTypeChannel,
  GROUPS: ChatTypeGroups,
};

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
const StatusUpdateAll = NEW_CHAT_MEMBERS.or(LEFT_CHAT_MEMBER).or(NEW_CHAT_TITLE).or(NEW_CHAT_PHOTO).or(DELETE_CHAT_PHOTO).or(GROUP_CHAT_CREATED).or(SUPERGROUP_CHAT_CREATED).or(CHANNEL_CHAT_CREATED).or(MIGRATE_TO_CHAT_ID).or(MIGRATE_FROM_CHAT_ID).or(PINNED_MESSAGE);

export const StatusUpdateFilters = {
  NEW_CHAT_MEMBERS,
  LEFT_CHAT_MEMBER,
  NEW_CHAT_TITLE,
  NEW_CHAT_PHOTO,
  DELETE_CHAT_PHOTO,
  GROUP_CHAT_CREATED,
  SUPERGROUP_CHAT_CREATED,
  CHANNEL_CHAT_CREATED,
  MIGRATE_TO_CHAT_ID,
  MIGRATE_FROM_CHAT_ID,
  PINNED_MESSAGE,
  ALL: StatusUpdateAll,
};

const MENTION = createEntityFilter("mention");
const HASHTAG = createEntityFilter("hashtag");
const BOT_COMMAND = createEntityFilter("bot_command");
const URL = createEntityFilter("url");
const EMAIL = createEntityFilter("email");
const PHONE_NUMBER = createEntityFilter("phone_number");
const CASHTAG = createEntityFilter("cashtag");

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
  ChatType: ChatTypeFilters,
  StatusUpdate: StatusUpdateFilters,
  Regex(pattern: RegExp | string): RegexFilter {
    return new RegexFilter(typeof pattern === "string" ? new RegExp(pattern) : pattern);
  },
  Custom(fn: (update: Update) => boolean | Promise<boolean>): CustomFilter {
    return new CustomFilter(fn);
  },
};
