# Changelog

All notable changes to `telebot-ts` will be documented in this file.

## [1.0.1](https://github.com/Nam088/telebot-ts/compare/v1.0.0...v1.0.1) (2026-08-20)


### Bug Fixes

* **ci:** remove dist release assets upload to prevent ReleaseAsset already_exists conflict ([bbe1163](https://github.com/Nam088/telebot-ts/commit/bbe1163480ec2b3d3078a2293247f02d44e7e298))

# 1.0.0 (2026-08-20)


### Bug Fixes

* **ci:** switch semantic-release preset to angular to fix conventional-changelog-writer version conflict ([7ee20f4](https://github.com/Nam088/telebot-ts/commit/7ee20f403c44b5f69bafbfd9a1bd40df1808d828))
* **routing:** recursively extract regex capture groups in composite and nested filters ([efb5689](https://github.com/Nam088/telebot-ts/commit/efb5689230f2af20f74b2a9858c0caf34a0c9456))
* **scheduler:** fix 6 critical RRule & Scheduler persistence issues ([11e4727](https://github.com/Nam088/telebot-ts/commit/11e47279d4ea9428ac9cc033d16ef74b4fc60ca5))
* **scheduler:** resolve pre-start job scheduling, Node 24.8-day timer overflow, drift compensation, and centralized error handling ([8b8d550](https://github.com/Nam088/telebot-ts/commit/8b8d55053eba88207148f297a3bbe5efda63cbef))


### Features

* add advanced Bot API methods (copyMessage, forwardMessage, myCommands, forumTopics) and context.reply shortcuts ([d65eb33](https://github.com/Nam088/telebot-ts/commit/d65eb33207c268a81a65f11cb5d259735f3eb698))
* **api:** complete 100% full parity with Telegram Bot API 10.0, 10.1 & 10.2 Changelog additions and tests ([a4bd17c](https://github.com/Nam088/telebot-ts/commit/a4bd17cfd1816c721f61b95cb351ab80775d6271))
* **api:** enable 100% native snake_case method and property access across all modules ([476a5ca](https://github.com/Nam088/telebot-ts/commit/476a5ca7df87e5b669a20c311b384daeb8bff6bb))
* **core:** complete Setup, Foundational, US1 MVP with constants, rules and templates ([7cd63da](https://github.com/Nam088/telebot-ts/commit/7cd63da7b7a7d8e6349313e93f91d9171f4ad063))
* **core:** trigger initial automated semantic release via OIDC ([f925968](https://github.com/Nam088/telebot-ts/commit/f92596897bbb662b41c827fadd61f67850e1155f))
* **examples:** add live webhook demo with InlineQueryHandler, latency tracking, and rich HTML formatting ([df41e20](https://github.com/Nam088/telebot-ts/commit/df41e206d67efd7af2f7f147dc78c4eeb4a43e34))
* **ext:** implement Phase 4 User Story 2 (T024-T031) with handlers, filters, keyboards, and bot methods ([f2df555](https://github.com/Nam088/telebot-ts/commit/f2df555ee1df0080456402824a6f0b59fcb9b74c))
* **logger:** allow pluggable custom loggers (ILogger interface for Pino, Winston, Roarr) via logger.setLogger() or LoggerOptions ([5c48b46](https://github.com/Nam088/telebot-ts/commit/5c48b4691e671e1037f5f8f43d7732be81792394))
* **nest:** add Multi-Bot support with named bot instances and isolated handler routing ([468e154](https://github.com/Nam088/telebot-ts/commit/468e154f4a4b38698bd903c8ad3c87c16098ed5a))
* **nest:** add zero-dependency NestJS wrapper module with @Update, @Command, @Hears, and @Action decorators ([8335fc6](https://github.com/Nam088/telebot-ts/commit/8335fc686c4c5fdfb040aa779e170254f2b08d7f))
* **parity:** achieve 100% full upstream method parity (182 public Bot API methods) with 0 missing methods ([d257c19](https://github.com/Nam088/telebot-ts/commit/d257c19e56706a7d6f0c1e6f0f5f35cbba286b0d))
* **parity:** complete Phase 1 migration (batch messages, reactions, live locations, polls) with 100% tests green ([bd90b6a](https://github.com/Nam088/telebot-ts/commit/bd90b6aaee24cd8a0211847d3015be847fd6d6d0))
* **parity:** complete Phase 3 & 4 (payments, telegram stars, profile, commands, and general forum topics) with 153/153 tests passing ([af23a77](https://github.com/Nam088/telebot-ts/commit/af23a772994010e41b9712f87da93a2b974405fb))
* **parity:** complete Phase 5 (stories, business, games, passport, gifts, and boosts) with 100% test pass rate and 0 TypeDoc warnings ([ba000c5](https://github.com/Nam088/telebot-ts/commit/ba000c57548cbee61d0eb69f23a6150c5665a2c1))
* **routing:** add LinearConversation engine for modern sequential async/await conversation flows (wait/ask/exit) ([4986bc9](https://github.com/Nam088/telebot-ts/commit/4986bc98c5f152cb85a87ffa8ae856b2103d65ce))
* **scheduler:** achieve 100% standard rrule.js RFC 5545 API compliance with RRule constants, Weekday class, and nth() selector ([88e9e04](https://github.com/Nam088/telebot-ts/commit/88e9e04c8c657f6c396f907410de49892ade7a63))
* **scheduler:** add zero-dependency RFC 5545 RRule recurrence engine with full IANA Timezone support and runRRule method ([8b67ccd](https://github.com/Nam088/telebot-ts/commit/8b67ccd3f53d17deb53a8e0cfbf5817890eb1798))
* **scheduler:** implement Phase 6 User Story 4 (T041-T046) with JobQueue, Job, timers, and persistence integration ([f91f6e3](https://github.com/Nam088/telebot-ts/commit/f91f6e3d7130614ff02a0dbc5e6487b2b029f5bb))
* **scheduler:** support complete RFC 5545 options (negative bymonthday, count, byyearday, nth qualifiers) with exhaustive test suite ([1cc7b45](https://github.com/Nam088/telebot-ts/commit/1cc7b45d6f33fd6d1d1f73da91543f88a5bb415b))
* **storage:** add delete methods (deleteUserData, deleteChatData, deleteConversation) and BasePersistence abstract class ([7785729](https://github.com/Nam088/telebot-ts/commit/7785729a693bb5c9d96b8665d6f0bf4e96a9d1f5))
* **storage:** implement Phase 5 User Story 3 (T032-T040) with ConversationHandler, JsonFilePersistence, and native SqlitePersistence ([8fd64d7](https://github.com/Nam088/telebot-ts/commit/8fd64d76d8ec0ba125fc8d47b9f55994a1489abf))
* **utils:** implement zero-dependency structured Logger with level filtering and ANSI formatting ([03a8345](https://github.com/Nam088/telebot-ts/commit/03a8345636185f19f4bf7a9fbefa0efc00b55462))
* **webhook:** implement Phase 7 & 8 (T047-T058) with runWebhook, secret token validation, zero runtime dependencies, and 100% test pass ([634a733](https://github.com/Nam088/telebot-ts/commit/634a7333fe458c66109aa8967d136861509b37ae))


### Performance Improvements

* **scheduler:** optimize getJobsByName and getJobsByChatId lookups from O(N) linear scans to O(1) multi-index Maps ([bb97097](https://github.com/Nam088/telebot-ts/commit/bb9709720db7a0b036831870c6f18f02b5074b4e))
* **scheduler:** optimize RRule.after next-date computation with hierarchical adaptive time stepping ([fa85c4f](https://github.com/Nam088/telebot-ts/commit/fa85c4f51472e593cb39f4cbcb6fed65b2f15f3c))
* **storage:** enable SQLite WAL mode and implement crash-resilient atomic file writes in JsonFilePersistence ([61453f2](https://github.com/Nam088/telebot-ts/commit/61453f27e4494b872553c465cc8a4bdea86ecbdf))
