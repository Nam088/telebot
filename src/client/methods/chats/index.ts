import { ChatManagementMethods } from "./management.js";

export * from "./members.js";
export * from "./management.js";

/**
 * Mixin providing chat moderation, permissions, and administrator operations.
 */
export abstract class ChatMethods extends ChatManagementMethods {}
