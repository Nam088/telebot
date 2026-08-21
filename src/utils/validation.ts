/**
 * Internal validation helper functions.
 *
 * @internal
 * @packageDocumentation
 */

import * as crypto from "node:crypto";

/**
 * Parsed Telegram Mini App `initData` payload.
 */
export interface TelegramWebAppData {
  /**
   * Unique identifier for the Web App session.
   */
  query_id?: string;
  /**
   * Information about the current user.
   */
  user?: {
    id: number;
    is_bot?: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    allows_write_to_pm?: boolean;
    photo_url?: string;
    [key: string]: unknown;
  };
  /**
   * Information about the user or bot who opened the Web App in direct chat.
   */
  receiver?: {
    id: number;
    is_bot?: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    [key: string]: unknown;
  };
  /**
   * Information about the chat from which the Web App was opened.
   */
  chat?: {
    id: number;
    type: string;
    title: string;
    username?: string;
    photo_url?: string;
    [key: string]: unknown;
  };
  /**
   * Type of the chat from which the Web App was opened.
   */
  chat_type?: string;
  /**
   * Global identifier for the chat instance.
   */
  chat_instance?: string;
  /**
   * Start parameter passed in the deep link.
   */
  start_param?: string;
  /**
   * Time in seconds after which a message can be sent via `answerWebAppQuery`.
   */
  can_send_after?: number;
  /**
   * Unix timestamp of when the Web App data was generated.
   */
  auth_date: number;
  /**
   * Signature hash for data integrity verification.
   */
  hash: string;
  /**
   * Raw key-value string dictionary from URLSearchParams.
   */
  raw: Record<string, string>;
}

/**
 * Options for validating Telegram Mini App `initData`.
 */
export interface ValidateWebAppDataOptions {
  /**
   * Maximum allowed age of the authentication data in seconds.
   * If provided and `auth_date` is older than `now - maxAgeSeconds`, validation returns false.
   * @defaultValue 86400 (24 hours)
   */
  maxAgeSeconds?: number;
}

/**
 * Asserts that a value is a non-empty string.
 *
 * @param value - The value to check.
 * @param name - The name of the parameter/field being validated (for error reporting).
 * @throws TypeError When the value is not a string or contains only whitespace.
 *
 * @example
 * ```ts
 * assertNonEmptyString(token, "token");
 * ```
 */
export function assertNonEmptyString(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}

/**
 * Asserts that a value is a valid finite number.
 *
 * @param value - The value to check.
 * @param name - The name of the parameter/field being validated (for error reporting).
 * @throws TypeError When the value is not a number or is NaN.
 *
 * @example
 * ```ts
 * assertNumber(chatId, "chatId");
 * ```
 */
export function assertNumber(value: unknown, name: string): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a valid number`);
  }
}

/**
 * Validates bot token format.
 *
 * @param token - Token string to validate.
 * @throws TypeError When the token is empty, or non-empty but does not match the `<bot_id>:<secret>`
 * format (e.g. `"123456:ABC-DEF..."`). The literal `"TEST_TOKEN"` is always accepted for
 * use in tests and examples.
 */
export function validateToken(token: string): void {
  assertNonEmptyString(token, "token");
  if (token === "TEST_TOKEN") return;
  if (!/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
    throw new TypeError(
      `token must match the Telegram bot token format "<bot_id>:<secret>" (e.g. "123456:ABC-DEF...")`,
    );
  }
}

/**
 * Validates Telegram Mini App `initData` signature using HMAC-SHA256 according to official Telegram specifications.
 *
 * @param initData - Raw URL-encoded query string received from `Telegram.WebApp.initData`.
 * @param botToken - The bot token used to verify data authenticity.
 * @param options - Optional validation settings such as `maxAgeSeconds`.
 * @returns `true` if the signature and expiration timestamp are valid; `false` otherwise.
 *
 * @example
 * ```ts
 * const isValid = validateWebAppData(req.headers["x-telegram-init-data"], botToken);
 * if (!isValid) {
 *   return res.status(401).send("Unauthorized");
 * }
 * ```
 */
export function validateWebAppData(
  initData: string,
  botToken: string,
  options: ValidateWebAppDataOptions = {},
): boolean {
  if (!initData || !botToken) return false;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;

  const authDateStr = params.get("auth_date");
  if (!authDateStr) return false;

  const authDate = parseInt(authDateStr, 10);
  if (Number.isNaN(authDate)) return false;

  const maxAgeSeconds = options.maxAgeSeconds ?? 86400;
  if (maxAgeSeconds > 0) {
    const now = Math.floor(Date.now() / 1000);
    // Disallow timestamps from too far in the future (skew > 5 mins) or too old
    if (authDate > now + 300 || now - authDate > maxAgeSeconds) {
      return false;
    }
  }

  // Sort parameter pairs alphabetically (excluding "hash")
  const entries: string[] = [];
  params.forEach((val, key) => {
    if (key !== "hash") {
      entries.push(`${key}=${val}`);
    }
  });
  entries.sort();
  const dataCheckString = entries.join("\n");

  // secret_key = HMAC_SHA256("WebAppData", bot_token)
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (calculatedHash.length !== hash.length) return false;

  return crypto.timingSafeEqual(Buffer.from(calculatedHash, "hex"), Buffer.from(hash, "hex"));
}

/**
 * Parses raw Telegram Mini App `initData` string into a structured {@link TelegramWebAppData} object.
 *
 * @param initData - Raw query string from `Telegram.WebApp.initData`.
 * @returns Parsed structured data object.
 *
 * @example
 * ```ts
 * const data = parseWebAppData(initDataString);
 * console.log(`User ID: ${data.user?.id}, Name: ${data.user?.first_name}`);
 * ```
 */
export function parseWebAppData(initData: string): TelegramWebAppData {
  const params = new URLSearchParams(initData);
  const raw: Record<string, string> = {};

  params.forEach((val, key) => {
    raw[key] = val;
  });

  const parseJsonField = <T>(key: string): T | undefined => {
    const val = params.get(key);
    if (!val) return undefined;
    try {
      return JSON.parse(val) as T;
    } catch {
      return undefined;
    }
  };

  const authDateStr = params.get("auth_date") || "0";
  const authDate = parseInt(authDateStr, 10) || 0;
  const canSendAfterStr = params.get("can_send_after");
  const canSendAfter = canSendAfterStr ? parseInt(canSendAfterStr, 10) : undefined;

  return {
    query_id: params.get("query_id") || undefined,
    user: parseJsonField(params.get("user") ? "user" : ""),
    receiver: parseJsonField(params.get("receiver") ? "receiver" : ""),
    chat: parseJsonField(params.get("chat") ? "chat" : ""),
    chat_type: params.get("chat_type") || undefined,
    chat_instance: params.get("chat_instance") || undefined,
    start_param: params.get("start_param") || undefined,
    can_send_after: Number.isNaN(canSendAfter) ? undefined : canSendAfter,
    auth_date: authDate,
    hash: params.get("hash") || "",
    raw,
  };
}

