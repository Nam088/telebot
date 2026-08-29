import { MessageEditMethods } from "./edit.js";

export * from "./send-media.js";
export * from "./send-basic.js";
export * from "./edit.js";

/**
 * Mixin providing message, media sending, editing, and reaction operations.
 */
export abstract class MessageMethods extends MessageEditMethods {}
