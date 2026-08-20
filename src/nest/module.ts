/**
 * Dynamic NestJS Module for tele-bot framework with Multi-Bot support.
 *
 * @packageDocumentation
 */

import { Application, ApplicationBuilder } from "../kernel/app.js";
import { CommandHandler, MessageHandler, CallbackQueryHandler } from "../routing/handlers.js";
import { filters } from "../filters/matchers.js";
import { DEFAULT_BOT_NAME, getBotToken, TELEGRAM_BOT_OPTIONS } from "./constants.js";
import { getHandlerMetadata, getBotNameMetadata, type HandlerMetadata } from "./decorators.js";

export interface TelegramModuleOptions {
  token: string;
  botName?: string;
}

export interface TelegramModuleAsyncOptions {
  botName?: string;
  imports?: any[];
  useFactory: (...args: any[]) => Promise<{ token: string }> | { token: string };
  inject?: any[];
}

export class TelegramModule {
  /**
   * Synchronous module registration for single or multiple named bots.
   */
  public static forRoot(options: TelegramModuleOptions): any {
    const botTokenKey = getBotToken(options.botName);

    const appProvider = {
      provide: botTokenKey,
      useFactory: () => {
        return new ApplicationBuilder().token(options.token).build();
      },
    };

    return {
      module: TelegramModule,
      providers: [appProvider],
      exports: [appProvider],
    };
  }

  /**
   * Asynchronous dynamic module registration with dependency injection support.
   */
  public static forRootAsync(options: TelegramModuleAsyncOptions): any {
    const botTokenKey = getBotToken(options.botName);
    const optionsKey = `${TELEGRAM_BOT_OPTIONS}_${options.botName || DEFAULT_BOT_NAME}`;

    const optionsProvider = {
      provide: optionsKey,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const appProvider = {
      provide: botTokenKey,
      useFactory: (opts: { token: string }) => {
        return new ApplicationBuilder().token(opts.token).build();
      },
      inject: [optionsKey],
    };

    return {
      module: TelegramModule,
      imports: options.imports || [],
      providers: [optionsProvider, appProvider],
      exports: [appProvider],
    };
  }

  /**
   * Helper utility to discover decorated handlers in a NestJS application context
   * and automatically attach them to the appropriate named Application instance.
   *
   * @param appInstance - The {@link Application} instance to attach handlers to.
   * @param providers - Array of NestJS service/controller instances.
   * @param botName - Optional target bot name filter for multi-bot setups.
   */
  public static bindHandlers(
    appInstance: Application,
    providers: any[],
    botName: string = DEFAULT_BOT_NAME,
  ): void {
    for (const provider of providers) {
      if (!provider || typeof provider !== "object") continue;
      const targetBotName = getBotNameMetadata(provider);

      // In multi-bot mode, only bind services intended for this botName
      if (targetBotName !== botName) {
        continue;
      }

      const handlers: HandlerMetadata[] = getHandlerMetadata(provider);

      for (const h of handlers) {
        const handlerFn = provider[h.methodName].bind(provider);

        if (h.type === "command" && typeof h.pattern === "string") {
          appInstance.addHandler(new CommandHandler(h.pattern, handlerFn));
        } else if (
          h.type === "hears" &&
          (typeof h.pattern === "string" || h.pattern instanceof RegExp)
        ) {
          const regex = h.pattern instanceof RegExp ? h.pattern : new RegExp(h.pattern);
          appInstance.addHandler(
            new MessageHandler(filters.TEXT.and(filters.Regex(regex)), handlerFn),
          );
        } else if (h.type === "action") {
          appInstance.addHandler(new CallbackQueryHandler(handlerFn, h.pattern));
        }
      }
    }
  }
}
