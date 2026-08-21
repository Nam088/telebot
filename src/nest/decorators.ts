/**
 * NestJS Method & Class Decorators for Telegram Bot Handlers.
 *
 * @packageDocumentation
 */

import { DEFAULT_BOT_NAME, getBotToken } from "./constants.js";

export interface HandlerMetadata {
  type:
    | "command"
    | "message"
    | "callback_query"
    | "inline_query"
    | "hears"
    | "action"
    | "reaction"
    | "paid_media"
    | "pre_checkout"
    | "shipping"
    | "join_request"
    | "business_connection";
  pattern?: any;
  methodName: string;
  botName?: string;
}

const HANDLER_META_KEY = Symbol.for("tele_bot:nest_handlers");
const BOT_NAME_KEY = Symbol.for("tele_bot:nest_bot_name");
const PARAM_TOKEN_KEY = Symbol.for("tele_bot:nest_param_tokens");

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
 * Reads the injection tokens recorded by {@link InjectBot} on a constructor.
 *
 * @param target - The constructor function to inspect.
 * @returns A sparse array mapping constructor parameter index to its resolved injection token.
 */
export function getParamTokenMetadata(target: any): string[] {
  return (target && target[PARAM_TOKEN_KEY]) || [];
}

/**
 * Inject specific Bot or Application instance token in a NestJS constructor.
 *
 * @param botName - Identifier for multi-bot setup.
 */
export function InjectBot(botName?: string): ParameterDecorator {
  const token = getBotToken(botName);
  return (target: any, _propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const ctor = typeof target === "function" ? target : target.constructor;
    if (!ctor[PARAM_TOKEN_KEY]) {
      ctor[PARAM_TOKEN_KEY] = [];
    }
    ctor[PARAM_TOKEN_KEY][parameterIndex] = token;
  };
}

function createHandlerDecorator(
  type: HandlerMetadata["type"],
  pattern?: any,
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

/**
 * Listens to user message reaction changes.
 *
 * @param filter - Optional emoji string, array, custom emoji, or predicate.
 */
export function OnReaction(filter?: any): MethodDecorator {
  return createHandlerDecorator("reaction", filter);
}

/**
 * Listens to purchased paid media transactions using Telegram Stars.
 */
export function OnPaidMedia(): MethodDecorator {
  return createHandlerDecorator("paid_media");
}

/**
 * Listens to incoming pre-checkout payment queries.
 */
export function PreCheckout(): MethodDecorator {
  return createHandlerDecorator("pre_checkout");
}

/**
 * Listens to incoming shipping queries for flexible invoices.
 */
export function Shipping(): MethodDecorator {
  return createHandlerDecorator("shipping");
}

/**
 * Listens to user requests to join private chats or channels.
 */
export function OnJoinRequest(): MethodDecorator {
  return createHandlerDecorator("join_request");
}

/**
 * Listens to Telegram Business account connection changes.
 */
export function OnBusinessConnection(): MethodDecorator {
  return createHandlerDecorator("business_connection");
}

