/**
 * This object represents a service message about a new forum topic created in the chat.
 *
 * @see {@link https://core.telegram.org/bots/api#forumtopiccreated Telegram Bot API: ForumTopicCreated}
 */
export interface ForumTopicCreated {
  /** Name of the topic. */
  name: string;
  /** Color of the topic icon in RGB format. */
  icon_color: number;
  /** Unique identifier of the custom emoji shown as the topic icon. */
  icon_custom_emoji_id?: string;
  /** True, if the name of the topic wasn't specified explicitly by its creator and likely needs to be changed by the bot. */
  is_name_implicit?: boolean;
}

/**
 * This object represents a service message about an edited forum topic.
 *
 * @see {@link https://core.telegram.org/bots/api#forumtopicedited Telegram Bot API: ForumTopicEdited}
 */
export interface ForumTopicEdited {
  /** New name of the topic, if it was edited. */
  name?: string;
  /** New identifier of the custom emoji shown as the topic icon, if it was edited; an empty string if the icon was removed. */
  icon_custom_emoji_id?: string;
}

/**
 * This object represents a service message about a forum topic closed in the chat.
 *
 * @remarks
 * Currently holds no information.
 *
 * @see {@link https://core.telegram.org/bots/api#forumtopicclosed Telegram Bot API: ForumTopicClosed}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ForumTopicClosed {}

/**
 * This object represents a service message about a forum topic reopened in the chat.
 *
 * @remarks
 * Currently holds no information.
 *
 * @see {@link https://core.telegram.org/bots/api#forumtopicreopened Telegram Bot API: ForumTopicReopened}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ForumTopicReopened {}

/**
 * This object represents a service message about General forum topic hidden in the chat.
 *
 * @remarks
 * Currently holds no information.
 *
 * @see {@link https://core.telegram.org/bots/api#generalforumtopichidden Telegram Bot API: GeneralForumTopicHidden}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GeneralForumTopicHidden {}

/**
 * This object represents a service message about General forum topic unhidden in the chat.
 *
 * @remarks
 * Currently holds no information.
 *
 * @see {@link https://core.telegram.org/bots/api#generalforumtopicunhidden Telegram Bot API: GeneralForumTopicUnhidden}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GeneralForumTopicUnhidden {}
