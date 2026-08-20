# Changelog

All notable changes to `telebot-ts` will be documented in this file.

# [1.0.0](https://github.com/Nam088/telebot-ts/releases/tag/v1.0.0) (2026-08-20)


### Bug Fixes

* **routing:** recursively extract regex capture groups in composite and nested filters ([efb5689](https://github.com/Nam088/telebot-ts/commit/efb5689230f2af20f74b2a9858c0caf34a0c9456))
* **scheduler:** fix 6 critical RRule & Scheduler persistence issues ([11e4727](https://github.com/Nam088/telebot-ts/commit/11e47279d4ea9428ac9cc033d16ef74b4fc60ca5))
* **scheduler:** resolve pre-start job scheduling, Node 24.8-day timer overflow, drift compensation, and centralized error handling ([8b8d550](https://github.com/Nam088/telebot-ts/commit/8b8d55053eba88207148f297a3bbe5efda63cbef))


### Features

* **api:** complete 100% full parity with Telegram Bot API 10.0, 10.1 & 10.2 ([a4bd17c](https://github.com/Nam088/telebot-ts/commit/a4bd17cfd1816c721f61b95cb351ab80775d6271))
* **api:** enable 100% native snake_case method and property access across all modules ([476a5ca](https://github.com/Nam088/telebot-ts/commit/476a5ca7df87e5b669a20c311b384daeb8bff6bb))
* **core:** ApplicationBuilder, long polling, webhook with secret token validation ([7cd63da](https://github.com/Nam088/telebot-ts/commit/7cd63da7b7a7d8e6349313e93f91d9171f4ad063))
* **ext:** handlers, filters, keyboards — CommandHandler, MessageHandler, CallbackQueryHandler, InlineQueryHandler, ConversationHandler, LinearConversation ([f2df555](https://github.com/Nam088/telebot-ts/commit/f2df555ee1df0080456402824a6f0b59fcb9b74c))
* **logger:** pluggable custom loggers (Pino, Winston, Roarr) via logger.setLogger() ([5c48b46](https://github.com/Nam088/telebot-ts/commit/5c48b4691e671e1037f5f8f43d7732be81792394))
* **nest:** zero-dependency NestJS integration with @Update, @Command, @Hears, @Action decorators and multi-bot support ([8335fc6](https://github.com/Nam088/telebot-ts/commit/8335fc686c4c5fdfb040aa779e170254f2b08d7f))
* **parity:** 182 public Bot API methods — Payments, Telegram Stars, Stories, Business, Games, Passport, Gifts, Boosts, Forum Topics ([d257c19](https://github.com/Nam088/telebot-ts/commit/d257c19e56706a7d6f0c1e6f0f5f35cbba286b0d))
* **routing:** LinearConversation engine for sequential async/await conversation flows ([4986bc9](https://github.com/Nam088/telebot-ts/commit/4986bc98c5f152cb85a87ffa8ae856b2103d65ce))
* **scheduler:** zero-dependency RFC 5545 RRule engine with full IANA timezone support, BYSETPOS, BYWEEKNO, BYYEARDAY, COUNT, UNTIL ([8b67ccd](https://github.com/Nam088/telebot-ts/commit/8b67ccd3f53d17deb53a8e0cfbf5817890eb1798))
* **storage:** MemoryPersistence, JsonFilePersistence, SqlitePersistence (native node:sqlite WAL mode) with auto-load/save ([8fd64d7](https://github.com/Nam088/telebot-ts/commit/8fd64d76d8ec0ba125fc8d47b9f55994a1489abf))
* **utils:** zero-dependency structured Logger with level filtering and ANSI formatting ([03a8345](https://github.com/Nam088/telebot-ts/commit/03a8345636185f19f4bf7a9fbefa0efc00b55462))


### Performance Improvements

* **scheduler:** optimize getJobsByName and getJobsByChatId from O(N) to O(1) via multi-index Maps ([bb97097](https://github.com/Nam088/telebot-ts/commit/bb9709720db7a0b036831870c6f18f02b5074b4e))
* **scheduler:** optimize RRule.after next-date computation with hierarchical adaptive time stepping ([fa85c4f](https://github.com/Nam088/telebot-ts/commit/fa85c4f51472e593cb39f4cbcb6fed65b2f15f3c))
* **storage:** enable SQLite WAL mode and crash-resilient atomic file writes in JsonFilePersistence ([61453f2](https://github.com/Nam088/telebot-ts/commit/61453f27e4494b872553c465cc8a4bdea86ecbdf))
