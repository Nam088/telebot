/**
 * Zero-dependency structured logger with custom logger adapter interface (Pino, Winston, Roarr, etc.).
 *
 * @packageDocumentation
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

/**
 * Standard interface for external custom loggers.
 */
export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  /** Optional custom logger implementation (e.g. Pino, Winston, Roarr, Bunyan) */
  customLogger?: ILogger;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

/**
 * High-performance, lightweight structured logger.
 */
export class Logger implements ILogger {
  public level: LogLevel;
  public prefix: string;
  private customLogger?: ILogger;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? (process.env.LOG_LEVEL as LogLevel) ?? "info";
    this.prefix = options.prefix ?? "[tele-bot]";
    this.customLogger = options.customLogger;
  }

  /**
   * Registers or replaces the active custom logger adapter globally or per instance.
   *
   * @param custom - Any object implementing {@link ILogger} (Pino, Winston, custom class).
   */
  public setLogger(custom: ILogger): void {
    this.customLogger = custom;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatTime(): string {
    return new Date().toISOString();
  }

  public debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog("debug")) return;
    if (this.customLogger) {
      this.customLogger.debug(message, ...args);
    } else {
      console.debug(`${this.formatTime()} \x1b[36mDEBUG\x1b[0m ${this.prefix}: ${message}`, ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog("info")) return;
    if (this.customLogger) {
      this.customLogger.info(message, ...args);
    } else {
      console.info(`${this.formatTime()} \x1b[32mINFO\x1b[0m  ${this.prefix}: ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog("warn")) return;
    if (this.customLogger) {
      this.customLogger.warn(message, ...args);
    } else {
      console.warn(`${this.formatTime()} \x1b[33mWARN\x1b[0m  ${this.prefix}: ${message}`, ...args);
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (!this.shouldLog("error")) return;
    if (this.customLogger) {
      this.customLogger.error(message, ...args);
    } else {
      console.error(`${this.formatTime()} \x1b[31mERROR\x1b[0m ${this.prefix}: ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
