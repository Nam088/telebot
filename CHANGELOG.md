# Changelog

All notable changes to `telebot-ts` will be documented in this file.

# [1.3.0](https://github.com/Nam088/telebot/compare/v1.2.1...v1.3.0) (2026-08-29)


### Bug Fixes

* **ci:** exclude .go files from Prettier, use gofmt for Go formatting ([be04ca9](https://github.com/Nam088/telebot/commit/be04ca94dbda9949b3cfae4dae950f52720a22ef))


### Features

* **go:** complete full migration of Bot API methods, FSM conversation, RRule scheduler, interactive menu, and JSON storage ([a46f4d3](https://github.com/Nam088/telebot/commit/a46f4d35c8b53d3fd132918e18797306e5cfdf79))
* **go:** complete Node parity — 160+ Bot API methods, filters, utils, components, and example bots ([846dd62](https://github.com/Nam088/telebot/commit/846dd629115bd38c078ae3c953bf79a6bdd7f287))
* **go:** initialize zero-dependency high-performance Go module (telebot-go) ([5328154](https://github.com/Nam088/telebot/commit/53281540a2813a6fc474a1f8926f5899e6773a46)), closes [hi#performance](https://github.com/hi/issues/performance)

## [1.2.1](https://github.com/Nam088/telebot-ts/compare/v1.2.0...v1.2.1) (2026-08-29)

# [1.2.0](https://github.com/Nam088/telebot-ts/compare/v1.1.3...v1.2.0) (2026-08-29)


### Bug Fixes

* **ci:** use safe HTML formatting for telegram notifications ([44800fe](https://github.com/Nam088/telebot-ts/commit/44800fe6fdb40da7836e198650d8f53ead10b93f))


### Features

* **api:** Telegram Bot API 10.3 support ([#4](https://github.com/Nam088/telebot-ts/issues/4)) ([9263841](https://github.com/Nam088/telebot-ts/commit/9263841826c6d79454bf5e0b2d27f6a374956866)), closes [#3](https://github.com/Nam088/telebot-ts/issues/3)

## [1.1.3](https://github.com/Nam088/telebot-ts/compare/v1.1.2...v1.1.3) (2026-08-29)


### Bug Fixes

* **scheduler:** fix RRule startMs anchor calculation when dtstart is omitted ([825aea8](https://github.com/Nam088/telebot-ts/commit/825aea866f9b5498104d3c246d69936d0f7bd6d6))

## [1.1.2](https://github.com/Nam088/telebot-ts/compare/v1.1.1...v1.1.2) (2026-08-21)


### Bug Fixes

* **types:** eliminate unused type imports and ensure 0 lint warnings ([0eabc8d](https://github.com/Nam088/telebot-ts/commit/0eabc8dd548925db0099a23bc923311d871f5a28))

## [1.1.1](https://github.com/Nam088/telebot-ts/compare/v1.1.0...v1.1.1) (2026-08-21)


### Bug Fixes

* **release:** release patch v1.1.1 with clean npm metadata, full Telegram 8.x parity, and nested menus ([d58e094](https://github.com/Nam088/telebot-ts/commit/d58e094f935c5c1cd637d90fa4b8568ea8bce069))

# [1.1.0](https://github.com/Nam088/telebot-ts/compare/v1.0.0...v1.1.0) (2026-08-21)


### Bug Fixes

* **ci:** use success lifecycle hook for post-release notes update ([ecb8b62](https://github.com/Nam088/telebot-ts/commit/ecb8b6242536bbe31671653e2c61533f188509ec))
* **menu:** enhance dynamic label evaluation and attach ctx.menu.update helper ([1014f78](https://github.com/Nam088/telebot-ts/commit/1014f78cc49e47ab99557ea1781f54a53f65f446))


### Features

* **client:** implement Telegram 8.x methods, text formatting utilities, and customizable pagination keyboard ([06fb68f](https://github.com/Nam088/telebot-ts/commit/06fb68f516b3cb85c3189027695b8710d7fdd6e7))
* **components:** add fluent type-safe InlineQueryResultBuilder and search bot example ([6a5f6b6](https://github.com/Nam088/telebot-ts/commit/6a5f6b61168713dd845044551b99cc6ae7f3576e))
* **core:** add WebApp HMAC validation, Telegram 8.x handlers, NestJS decorators, and linear conversation timeout ([7809dc6](https://github.com/Nam088/telebot-ts/commit/7809dc690e6ab2772a2e27a15a992d512543173a))
* **core:** implement AutoRetry flood control engine, interactive nested Menu system, and linear AsyncConversation ([cf721e2](https://github.com/Nam088/telebot-ts/commit/cf721e200556a8fcae2fa1cff20dc9a21f561db6))
* **ecosystem:** add framework webhook adapters, app middleware pipeline, rate limiting, and ReplyKeyboard v8 builder methods ([3915180](https://github.com/Nam088/telebot-ts/commit/391518028efa26bb7d1d7121330d5918fecc05c5))
* **examples:** add live interactive group test bot ([8442a72](https://github.com/Nam088/telebot-ts/commit/8442a7263a0a68b56d02928908f2e01ef1f1cfe6))
* **examples:** update live group test bot with Menu, AsyncConversation, and Pagination ([d67ad07](https://github.com/Nam088/telebot-ts/commit/d67ad07d8ee227d74d60e1aac4d0be9c157a12da))
* **kernel:** add intuitive Express-style shorthands (command, hears, callbackQuery, on) and rich reply helpers ([75493ee](https://github.com/Nam088/telebot-ts/commit/75493eeb7be25e2b9af1e7486b8b1b7f40f9d6da))
* **utils:** add generic session middleware with MemorySessionStorage and extensible SessionStorage adapter ([0a12a53](https://github.com/Nam088/telebot-ts/commit/0a12a53138c8e66fa8795a500935fc2e1187ccc7))


### Performance Improvements

* **polling:** make update dispatch non-blocking and parallelize menu callback responses ([ae8de25](https://github.com/Nam088/telebot-ts/commit/ae8de25974b922e33ffcb8153fdcf84db2c44f0a))

# [1.1.0](https://github.com/Nam088/telebot-ts/compare/v1.0.0...v1.1.0) (2026-08-21)


### Bug Fixes

* **ci:** use success lifecycle hook for post-release notes update ([ecb8b62](https://github.com/Nam088/telebot-ts/commit/ecb8b6242536bbe31671653e2c61533f188509ec))
* **menu:** enhance dynamic label evaluation and attach ctx.menu.update helper ([1014f78](https://github.com/Nam088/telebot-ts/commit/1014f78cc49e47ab99557ea1781f54a53f65f446))


### Features

* **client:** implement Telegram 8.x methods, text formatting utilities, and customizable pagination keyboard ([06fb68f](https://github.com/Nam088/telebot-ts/commit/06fb68f516b3cb85c3189027695b8710d7fdd6e7))
* **components:** add fluent type-safe InlineQueryResultBuilder and search bot example ([6a5f6b6](https://github.com/Nam088/telebot-ts/commit/6a5f6b61168713dd845044551b99cc6ae7f3576e))
* **core:** add WebApp HMAC validation, Telegram 8.x handlers, NestJS decorators, and linear conversation timeout ([7809dc6](https://github.com/Nam088/telebot-ts/commit/7809dc690e6ab2772a2e27a15a992d512543173a))
* **core:** implement AutoRetry flood control engine, interactive nested Menu system, and linear AsyncConversation ([cf721e2](https://github.com/Nam088/telebot-ts/commit/cf721e200556a8fcae2fa1cff20dc9a21f561db6))
* **ecosystem:** add framework webhook adapters, app middleware pipeline, rate limiting, and ReplyKeyboard v8 builder methods ([3915180](https://github.com/Nam088/telebot-ts/commit/391518028efa26bb7d1d7121330d5918fecc05c5))
* **examples:** add live interactive group test bot ([8442a72](https://github.com/Nam088/telebot-ts/commit/8442a7263a0a68b56d02928908f2e01ef1f1cfe6))
* **examples:** update live group test bot with Menu, AsyncConversation, and Pagination ([d67ad07](https://github.com/Nam088/telebot-ts/commit/d67ad07d8ee227d74d60e1aac4d0be9c157a12da))
* **kernel:** add intuitive Express-style shorthands (command, hears, callbackQuery, on) and rich reply helpers ([75493ee](https://github.com/Nam088/telebot-ts/commit/75493eeb7be25e2b9af1e7486b8b1b7f40f9d6da))
* **utils:** add generic session middleware with MemorySessionStorage and extensible SessionStorage adapter ([0a12a53](https://github.com/Nam088/telebot-ts/commit/0a12a53138c8e66fa8795a500935fc2e1187ccc7))


### Performance Improvements

* **polling:** make update dispatch non-blocking and parallelize menu callback responses ([ae8de25](https://github.com/Nam088/telebot-ts/commit/ae8de25974b922e33ffcb8153fdcf84db2c44f0a))

# 1.0.0 (2026-08-20)


### Bug Fixes

* **ci:** remove dist release assets upload to prevent ReleaseAsset already_exists conflict ([8ce0f63](https://github.com/Nam088/telebot-ts/commit/8ce0f632026a5241a711909e5254f4736afa3cfc))
* **ci:** switch semantic-release preset to angular to fix conventional-changelog-writer version conflict ([8706abb](https://github.com/Nam088/telebot-ts/commit/8706abbe802f406e950311e7fb1cd0386897b42b))
* **deps:** upgrade tsup, vitest@3.2, @semantic-release/npm to patch dev dependency vulnerabilities ([c78ec78](https://github.com/Nam088/telebot-ts/commit/c78ec7886cee3ad5e905b4264670af6670283775))
* **routing:** recursively extract regex capture groups in composite and nested filters ([e14d366](https://github.com/Nam088/telebot-ts/commit/e14d3664b8b9b435654c8af563198ead6b655d1e))
* **scheduler:** fix 6 critical RRule & Scheduler persistence issues ([690292f](https://github.com/Nam088/telebot-ts/commit/690292f2b3c88fd8d1845004f5cb420527cd91b0))
* **scheduler:** resolve pre-start job scheduling, Node 24.8-day timer overflow, drift compensation, and centralized error handling ([0af6cb2](https://github.com/Nam088/telebot-ts/commit/0af6cb2e0db8cf7703feeb77eff22a259f169d81))


### Features

* add advanced Bot API methods (copyMessage, forwardMessage, myCommands, forumTopics) and context.reply shortcuts ([d65eb33](https://github.com/Nam088/telebot-ts/commit/d65eb33207c268a81a65f11cb5d259735f3eb698))
* **api:** complete 100% full parity with Telegram Bot API 10.0, 10.1 & 10.2 Changelog additions and tests ([7b164e5](https://github.com/Nam088/telebot-ts/commit/7b164e5e565213da38259fdf38744c89e8ddc647))
* **api:** enable 100% native snake_case method and property access across all modules ([476a5ca](https://github.com/Nam088/telebot-ts/commit/476a5ca7df87e5b669a20c311b384daeb8bff6bb))
* **ci:** add custom release notes plugin that auto-prepends installation section for npm, yarn, pnpm, bun ([5d48e35](https://github.com/Nam088/telebot-ts/commit/5d48e352349cf564ce50402195112e6b82227094))
* **core:** complete Setup, Foundational, US1 MVP with constants, rules and templates ([7cd63da](https://github.com/Nam088/telebot-ts/commit/7cd63da7b7a7d8e6349313e93f91d9171f4ad063))
* **core:** trigger initial automated semantic release via OIDC ([0531ea2](https://github.com/Nam088/telebot-ts/commit/0531ea2add050eba27c0a04eb76f461483173edb))
* **examples:** add live webhook demo with InlineQueryHandler, latency tracking, and rich HTML formatting ([e7b3708](https://github.com/Nam088/telebot-ts/commit/e7b37081589135b0a8d53837a24fe289ba9c9513))
* **ext:** implement Phase 4 User Story 2 (T024-T031) with handlers, filters, keyboards, and bot methods ([f2df555](https://github.com/Nam088/telebot-ts/commit/f2df555ee1df0080456402824a6f0b59fcb9b74c))
* **logger:** allow pluggable custom loggers (ILogger interface for Pino, Winston, Roarr) via logger.setLogger() or LoggerOptions ([b15eb03](https://github.com/Nam088/telebot-ts/commit/b15eb03096ea8139614fa4ca74841f624c2b43c8))
* **nest:** add Multi-Bot support with named bot instances and isolated handler routing ([0aaabeb](https://github.com/Nam088/telebot-ts/commit/0aaabeb42c5acec04613341d20a638db31fe71c7))
* **nest:** add zero-dependency NestJS wrapper module with @Update, @Command, @Hears, and @Action decorators ([6c1f1dd](https://github.com/Nam088/telebot-ts/commit/6c1f1ddc0bac88608506bc6c0cbc5eff85d65b53))
* **parity:** achieve 100% full upstream method parity (182 public Bot API methods) with 0 missing methods ([d257c19](https://github.com/Nam088/telebot-ts/commit/d257c19e56706a7d6f0c1e6f0f5f35cbba286b0d))
* **parity:** complete Phase 1 migration (batch messages, reactions, live locations, polls) with 100% tests green ([bd90b6a](https://github.com/Nam088/telebot-ts/commit/bd90b6aaee24cd8a0211847d3015be847fd6d6d0))
* **parity:** complete Phase 3 & 4 (payments, telegram stars, profile, commands, and general forum topics) with 153/153 tests passing ([af23a77](https://github.com/Nam088/telebot-ts/commit/af23a772994010e41b9712f87da93a2b974405fb))
* **parity:** complete Phase 5 (stories, business, games, passport, gifts, and boosts) with 100% test pass rate and 0 TypeDoc warnings ([ba000c5](https://github.com/Nam088/telebot-ts/commit/ba000c57548cbee61d0eb69f23a6150c5665a2c1))
* **routing:** add LinearConversation engine for modern sequential async/await conversation flows (wait/ask/exit) ([4986bc9](https://github.com/Nam088/telebot-ts/commit/4986bc98c5f152cb85a87ffa8ae856b2103d65ce))
* **scheduler:** achieve 100% standard rrule.js RFC 5545 API compliance with RRule constants, Weekday class, and nth() selector ([082896e](https://github.com/Nam088/telebot-ts/commit/082896e10469c3faee9b602abd80c9bd6fa380f1))
* **scheduler:** add zero-dependency RFC 5545 RRule recurrence engine with full IANA Timezone support and runRRule method ([4b0ba6c](https://github.com/Nam088/telebot-ts/commit/4b0ba6c802ad668aeb9c0e23d88d7dfc1f55452d))
* **scheduler:** implement Phase 6 User Story 4 (T041-T046) with JobQueue, Job, timers, and persistence integration ([f91f6e3](https://github.com/Nam088/telebot-ts/commit/f91f6e3d7130614ff02a0dbc5e6487b2b029f5bb))
* **scheduler:** support complete RFC 5545 options (negative bymonthday, count, byyearday, nth qualifiers) with exhaustive test suite ([aa7a9b3](https://github.com/Nam088/telebot-ts/commit/aa7a9b359c4a663ae815b28567bb17c10938c952))
* **storage:** add delete methods (deleteUserData, deleteChatData, deleteConversation) and BasePersistence abstract class ([24223e9](https://github.com/Nam088/telebot-ts/commit/24223e9bde0d594f9b58a289acb5c70a4626f179))
* **storage:** implement Phase 5 User Story 3 (T032-T040) with ConversationHandler, JsonFilePersistence, and native SqlitePersistence ([8fd64d7](https://github.com/Nam088/telebot-ts/commit/8fd64d76d8ec0ba125fc8d47b9f55994a1489abf))
* **utils:** implement zero-dependency structured Logger with level filtering and ANSI formatting ([36212b2](https://github.com/Nam088/telebot-ts/commit/36212b20c414af7545604c79d0b475e3a0952786))
* **webhook:** implement Phase 7 & 8 (T047-T058) with runWebhook, secret token validation, zero runtime dependencies, and 100% test pass ([634a733](https://github.com/Nam088/telebot-ts/commit/634a7333fe458c66109aa8967d136861509b37ae))


### Performance Improvements

* **scheduler:** optimize getJobsByName and getJobsByChatId lookups from O(N) linear scans to O(1) multi-index Maps ([a4d1044](https://github.com/Nam088/telebot-ts/commit/a4d104437609050720cbc591b15e3ce5ad0f5814))
* **scheduler:** optimize RRule.after next-date computation with hierarchical adaptive time stepping ([cd0772a](https://github.com/Nam088/telebot-ts/commit/cd0772ac7b8ce284c2cbe871ceb6a313010c15ff))
* **storage:** enable SQLite WAL mode and implement crash-resilient atomic file writes in JsonFilePersistence ([559e721](https://github.com/Nam088/telebot-ts/commit/559e721446f5c56b8d4d3d81542712732139f511))

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
