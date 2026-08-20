/**
 * NestJS Method & Class Decorators for Telegram Bot Handlers.
 *
 * @packageDocumentation
 */

import { TELEGRAM_UPDATE_HANDLER } from "./constants.js";

export interface HandlerMetadata {
  type: "command" | "message" | "callback_query" | "inline_query" | "hears" | "action";
  pattern?: string | RegExp | ((data: string) => boolean);
  methodName: string;
}

const HANDLER_META_KEY = Symbol.for("tele_bot:nest_handlers");

export function getHandlerMetadata(target: any): HandlerMetadata[] {
  if (!target) return [];
  const proto = typeof target === "function" ? target.prototype : target;
  return proto ? proto[HANDLER_META_KEY] || [] : [];
}

/**
 * Decorator to mark a class as a Telegram Update listener provider.
 */
export function Update(): ClassDecorator {
  return (_target: any) => {
    // Marked as Telegram Update service
  };
}

function createHandlerDecorator(
  type: HandlerMetadata["type"],
  pattern?: string | RegExp | ((data: string) => boolean),
): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const proto = target;
    if (!proto[HANDLER_META_KEY]) {
      proto[HANDLER_META_KEY] = [];
    }
    proto[HANDLER_META_KEY].push({
      type,
      pattern,
      methodName: String(propertyKey),
    });
  };
}

/**
 * Listens to a specific Telegram slash command (e.g. `/start`, `/help`).
 *
 * @param command - Command name without leading slash.
 */
export function Command(command: string): MethodDecorator {
  return createHandlerDecorator("command", command);
}

/**
 * Listens to text messages matching a string or regex pattern.
 *
 * @param pattern - String or RegExp to match message text against.
 */
export function Hears(pattern: string | RegExp): MethodDecorator {
  return createHandlerDecorator("hears", pattern);
}

/**
 * Listens to inline button callback queries matching a pattern.
 *
 * @param pattern - Callback data pattern or predicate function.
 */
export function Action(pattern?: string | RegExp | ((data: string) => boolean)): MethodDecorator {
  return createHandlerDecorator("action", pattern);
}
