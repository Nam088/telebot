/**
 * Zero-dependency structured logger with optional Pino integration.
 *
 * @packageDocumentation
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
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
export class Logger {
  public level: LogLevel;
  public prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? (process.env.LOG_LEVEL as LogLevel) ?? "info";
    this.prefix = options.prefix ?? "[tele-bot]";
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatTime(): string {
    return new Date().toISOString();
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog("debug")) {
      console.debug(`${this.formatTime()} \x1b[36mDEBUG\x1b[0m ${this.prefix}: ${message}`, ...args);
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.shouldLog("info")) {
      console.info(`${this.formatTime()} \x1b[32mINFO\x1b[0m  ${this.prefix}: ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog("warn")) {
      console.warn(`${this.formatTime()} \x1b[33mWARN\x1b[0m  ${this.prefix}: ${message}`, ...args);
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (this.shouldLog("error")) {
      console.error(`${this.formatTime()} \x1b[31mERROR\x1b[0m ${this.prefix}: ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
