import type { Update } from "../kernel/update.js";

/**
 * Abstract base class for update and message filters supporting Boolean logic chaining.
 *
 * All filters inherit `.and()`, `.or()`, and `.not()` methods to combine conditions.
 *
 * @example
 * ```ts
 * const filter = filters.TEXT.and(filters.ChatType.PRIVATE).not();
 * ```
 */
export abstract class BaseFilter {
  abstract checkUpdate(update: Update): boolean | Promise<boolean>;
  /**
   * Combines this filter with another using logical AND (`&&`).
   *
   * @param other - The other filter to combine with.
   * @returns A new combined {@link BaseFilter}.
   * @example
   * ```ts
   * const textInPrivate = filters.TEXT.and(filters.ChatType.PRIVATE);
   * ```
   */
  and(other: BaseFilter): BaseFilter {
    return new AndFilter(this, other);
  }

  /**
   * Combines this filter with another using logical OR (`||`).
   *
   * @param other - The other filter to combine with.
   * @returns A new combined {@link BaseFilter}.
   * @example
   * ```ts
   * const photoOrDoc = filters.PHOTO.or(filters.DOCUMENT);
   * ```
   */
  or(other: BaseFilter): BaseFilter {
    return new OrFilter(this, other);
  }

  /**
   * Inverts this filter using logical NOT (`!`).
   *
   * @returns A new inverted {@link BaseFilter}.
   * @example
   * ```ts
   * const notCommand = filters.COMMAND.not();
   * ```
   */
  not(): BaseFilter {
    return new NotFilter(this);
  }
}

/**
 * Filter that evaluates logical AND across two child filters.
 *
 * @internal
 */
class AndFilter extends BaseFilter {
  /**
   * Constructs a new {@link AndFilter}.
   *
   * @param f1 - First filter operand.
   * @param f2 - Second filter operand.
   */
  constructor(
    private f1: BaseFilter,
    private f2: BaseFilter,
  ) {
    super();
  }

  /**
   * Evaluates both child filters sequentially.
   *
   * @param update - Incoming update.
   * @returns `true` if both filters match.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const res1 = await this.f1.checkUpdate(update);
    if (!res1) return false;
    return Boolean(await this.f2.checkUpdate(update));
  }
}

/**
 * Filter that evaluates logical OR across two child filters.
 *
 * @internal
 */
class OrFilter extends BaseFilter {
  /**
   * Constructs a new {@link OrFilter}.
   *
   * @param f1 - First filter operand.
   * @param f2 - Second filter operand.
   */
  constructor(
    private f1: BaseFilter,
    private f2: BaseFilter,
  ) {
    super();
  }

  /**
   * Evaluates either child filter.
   *
   * @param update - Incoming update.
   * @returns `true` if at least one filter matches.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const res1 = await this.f1.checkUpdate(update);
    if (res1) return true;
    return Boolean(await this.f2.checkUpdate(update));
  }
}

/**
 * Filter that evaluates logical NOT on a child filter.
 *
 * @internal
 */
class NotFilter extends BaseFilter {
  /**
   * Constructs a new {@link NotFilter}.
   *
   * @param f - Child filter to invert.
   */
  constructor(private f: BaseFilter) {
    super();
  }

  /**
   * Evaluates the inverted result of the child filter.
   *
   * @param update - Incoming update.
   * @returns `true` if child filter returns `false`.
   */
  async checkUpdate(update: Update): Promise<boolean> {
    const res = await this.f.checkUpdate(update);
    return !res;
  }
}
