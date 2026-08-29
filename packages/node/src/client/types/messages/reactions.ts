import type { User, Chat } from "../common/index.js";

/**
 * Describes a reaction that uses a regular emoji.
 */
export interface ReactionTypeEmoji {
  /** Type of the reaction, always 'emoji'. */
  type: "emoji";
  /** Reaction emoji. */
  emoji: string;
}

/**
 * Describes a reaction that uses a custom emoji.
 */
export interface ReactionTypeCustomEmoji {
  /** Type of the reaction, always 'custom_emoji'. */
  type: "custom_emoji";
  /** Custom emoji identifier. */
  custom_emoji_id: string;
}

/**
 * Describes a paid reaction.
 */
export interface ReactionTypePaid {
  /** Type of the reaction, always 'paid'. */
  type: "paid";
}

/**
 * Union of reaction types that can be set on a message.
 */
export type ReactionType = ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid;

/**
 * Represents a reaction type and its total count on a message.
 */
export interface ReactionCount {
  /** Type of the reaction. */
  type: ReactionType;
  /** Number of times the reaction was added. */
  total_count: number;
}

/**
 * Represents a change of a reaction on a message performed by a user.
 */
export interface MessageReactionUpdated {
  /** The chat containing the message the user reacted to. */
  chat: Chat;
  /** Unique identifier of the message inside the chat. */
  message_id: number;
  /** The user that changed the reaction, if the user isn't anonymous. */
  user?: User;
  /** The chat on behalf of which the reaction was changed, if the user is anonymous. */
  actor_chat?: Chat;
  /** Date of the change in Unix time. */
  date: number;
  /** Previous list of reaction types that were set by the user for this message. */
  old_reaction: ReactionType[];
  /** New list of reaction types that have been set by the user for this message. */
  new_reaction: ReactionType[];
}

/**
 * Represents reaction changes on a message with anonymous reactions.
 */
export interface MessageReactionCountUpdated {
  /** The chat containing the message. */
  chat: Chat;
  /** Unique message identifier inside the chat. */
  message_id: number;
  /** Date of the change in Unix time. */
  date: number;
  /** List of reactions that are present on the message. */
  reactions: ReactionCount[];
}
