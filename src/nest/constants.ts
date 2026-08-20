/**
 * Injection tokens and metadata keys for NestJS integration.
 *
 * @packageDocumentation
 */

export const DEFAULT_BOT_NAME = "DEFAULT_BOT_NAME";

export const getBotToken = (botName?: string): string => {
  return botName && botName !== DEFAULT_BOT_NAME
    ? `TELEGRAM_BOT_${botName.toUpperCase()}`
    : "TELEGRAM_APPLICATION";
};

export const TELEGRAM_BOT_TOKEN = "TELEGRAM_BOT_TOKEN";
export const TELEGRAM_BOT_OPTIONS = "TELEGRAM_BOT_OPTIONS";
export const TELEGRAM_APPLICATION = "TELEGRAM_APPLICATION";
export const TELEGRAM_UPDATE_HANDLER = "TELEGRAM_UPDATE_HANDLER";
