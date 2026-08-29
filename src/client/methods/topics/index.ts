import { ForumTopicMethods } from "./topics.js";

export * from "./profile.js";
export * from "./topics.js";

/**
 * Mixin providing forum topics, profile management, and menu button operations.
 */
export abstract class TopicAndProfileMethods extends ForumTopicMethods {}
