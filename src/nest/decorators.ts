/**
 * NestJS Method & Class Decorators for Telegram Bot Handlers.
 *
 * @packageDocumentation
 */

import { DEFAULT_BOT_NAME, getBotToken } from "./constants.js";

export interface HandlerMetadata {
  type: "command" | "message" | "callback_query" | "inline_query" | "hears" | "action";
  pattern?: string | RegExp | ((data: string) => boolean);
  methodName: string;
  botName?: string;
}

const HANDLER_META_KEY = Symbol.for("tele_bot:nest_handlers");
const BOT_NAME_KEY = Symbol.for("tele_bot:nest_bot_name");

export function getHandlerMetadata(target: any): HandlerMetadata[] {
  if (!target) return [];
  const proto = typeof target === "function" ? target.prototype : target;
  return proto ? proto[HANDLER_META_KEY] || [] : [];
}

export function getBotNameMetadata(target: any): string {
  if (!target) return DEFAULT_BOT_NAME;
  const proto = typeof target === "function" ? target.prototype : target;
  return proto ? proto[BOT_NAME_KEY] || DEFAULT_BOT_NAME : DEFAULT_BOT_NAME;
}

/**
 * Decorator to mark a class as a Telegram Update listener provider.
 * Supports optional `botName` for multi-bot NestJS applications.
 *
 * @param botName - Optional identifier for multi-bot setups (e.g. `"adminBot"`, `"shopBot"`).
 */
export function Update(botName?: string): ClassDecorator {
  return (target: any) => {
    const name = botName || DEFAULT_BOT_NAME;
    target.prototype[BOT_NAME_KEY] = name;
  };
}

/**
 * Inject specific Bot or Application instance token in a NestJS constructor.
 *
 * @param botName - Identifier for multi-bot setup.
 */
export function InjectBot(botName?: string): ParameterDecorator {
  return (_target: any, _propertyKey: string | symbol | undefined, _parameterIndex: number) => {
    // Custom parameter decorator marker
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
