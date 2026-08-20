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


