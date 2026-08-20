/**
 * Dynamic NestJS Module for tele-bot framework.
 *
 * @packageDocumentation
 */

import { Application, ApplicationBuilder } from "../kernel/app.js";
import { CommandHandler, MessageHandler, CallbackQueryHandler } from "../routing/handlers.js";
import { filters } from "../filters/matchers.js";
import { TELEGRAM_APPLICATION, TELEGRAM_BOT_OPTIONS } from "./constants.js";
import { getHandlerMetadata, type HandlerMetadata } from "./decorators.js";

export interface TelegramModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => Promise<{ token: string }> | { token: string };
  inject?: any[];
}

export class TelegramModule {
  /**
   * Synchronous static module registration.
   */
  public static forRoot(options: { token: string }): any {
    const appProvider = {
      provide: TELEGRAM_APPLICATION,
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
    const optionsProvider = {
      provide: TELEGRAM_BOT_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const appProvider = {
      provide: TELEGRAM_APPLICATION,
      useFactory: (opts: { token: string }) => {
        return new ApplicationBuilder().token(opts.token).build();
      },
      inject: [TELEGRAM_BOT_OPTIONS],
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
   * and automatically attach them to the Application instance.
   */
  public static bindHandlers(appInstance: Application, providers: any[]): void {
    for (const provider of providers) {
      if (!provider || typeof provider !== "object") continue;
      const constructor = provider.constructor;
      const handlers: HandlerMetadata[] = getHandlerMetadata(constructor);

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
