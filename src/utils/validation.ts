/**
 * Internal validation helper functions.
 *
 * @internal
 * @packageDocumentation
 */

/**
 * Asserts that a value is a non-empty string.
 *
 * @param value - The value to check.
 * @param name - The name of the parameter/field being validated (for error reporting).
 * @throws When the value is not a string or contains only whitespace.
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
 * @throws When the value is not a number or is NaN.
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
 * @throws When the token is empty, or non-empty but does not match the `<bot_id>:<secret>`
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
