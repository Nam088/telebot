# Specification: Telegram Bot Framework for Node.js

## Feature Overview
Build a zero-dependency, TypeScript-first Telegram Bot framework that replicates python-telegram-bot's API surface, enabling 1:1 migration of Python bot code to Node.js.

## Naming Conventions

To keep the PTB-to-Node port as close to a literal translation as possible while still reading as idiomatic TypeScript, names are split into two groups:

- **Verbs (methods you call)** — converted from PTB's `snake_case` to `camelCase`, since that is the idiomatic JS/TS calling convention: `add_handler` → `addHandler`, `send_message` → `sendMessage`, `run_once` → `runOnce`, `get_updates` → `getUpdates`. This also covers Python operator overloads that have no JS equivalent: `&`, `|`, `~` on filters become explicit `.and()`, `.or()`, `.not()` calls.
- **Nouns (data you read or write)** — object properties, options-object keys, and Telegram Bot API fields keep PTB's exact `snake_case` spelling, because these are what a developer actually needs to match 1:1 while porting: `context.user_data`, `context.chat_data`, `context.bot_data`, `context.job_queue`, `options.allowed_updates`, `options.drop_pending_updates`, and all Telegram object fields (`chat_id`, `message_id`, `first_name`, ...).
- **Classes and filter constants** are already PascalCase/UPPER_CASE in PTB and carry over unchanged (`CommandHandler`, `filters.TEXT`, `filters.ChatType.PRIVATE`).

Every FR and code example below follows this split; when in doubt, ask "is this called with `()`?" — if yes, camelCase; if it's a value being read or a key in an object literal, keep PTB's snake_case.

## User Scenarios

### Primary Scenario: Python-to-Node Migration
A developer has an existing Python bot using `python-telegram-bot` (PTB) and wants to migrate to Node.js with minimal code changes.

**Acceptance Scenarios:**
1. **Given** a PTB bot using `Application`, `CommandHandler`, `MessageHandler`, `ConversationHandler`, `CallbackQueryHandler`, **when** the developer imports the equivalent classes from this framework, **then** the class and constructor names match PTB exactly (no renaming required).
2. **Given** a PTB handler registered as `application.add_handler(CommandHandler("start", callback))`, **when** the developer ports this line to `application.addHandler(new CommandHandler("start", callback))`, **then** the handler matches and dispatches the same way as in PTB.
3. **Given** a PTB filter expression such as `filters.TEXT & ~filters.COMMAND`, **when** the developer rewrites it as `filters.TEXT.and(filters.COMMAND.not())`, **then** the filter evaluates the same set of updates as the PTB original.
4. **Given** a callback that reads `context.user_data`, `context.chat_data`, `context.args` in PTB, **when** the same callback signature is used in this framework, **then** the same data is available under the same property names.

### Secondary Scenario: New Bot Development
A developer building a new bot in TypeScript, with no prior PTB experience, wants full type safety, modern async/await patterns, zero required external dependencies, and tree-shakeable ES modules.

**Acceptance Scenarios:**
1. **Given** a new TypeScript project with `strict: true`, **when** the developer imports any public class or function from this framework, **then** full type information (including generics for `CallbackContext<UserData, ChatData, BotData>`) is available with no `any` leaks.
2. **Given** a fresh `npm install`, **when** the developer runs `npm ls --prod`, **then** no required production dependencies are listed.
3. **Given** a bundler that supports tree-shaking, **when** the developer imports only `Application` and `CommandHandler`, **then** unused handler/filter/persistence code is excluded from the final bundle.

## Edge Cases

- **Invalid or revoked bot token**: `getMe()` (called during `ApplicationBuilder().build()` or the first `runPolling()`) fails with a 401 from Telegram; the framework surfaces a clear, typed error instead of retrying indefinitely.
- **Network loss during long polling**: `runPolling()` retries with exponential backoff (see Error Handling Strategy) instead of crashing the process or silently stopping.
- **Concurrent polling and webhook**: calling `runWebhook()` while `runPolling()` is already active (or vice versa) raises an explicit error, since Telegram only allows one update-delivery mode at a time.
- **Rate limiting (429)**: Telegram's `retry_after` value is honored exactly; the framework never retries sooner than that value even if its own backoff schedule would otherwise allow it.
- **Handler throws inside a handler group**: an unhandled exception in one handler does not prevent other handler groups from running, and is routed to registered error handlers (FR-3).
- **Conversation state on process restart**: for `ConversationHandler` combined with a non-memory `Persistence` implementation, in-flight conversation state survives a process restart; with `MemoryPersistence` (default), state is expected to reset.
- **Malformed or partial update payloads**: an update missing expected optional fields does not throw during dispatch; handlers receive `undefined` for absent fields, consistent with the TypeScript types marking those fields optional.

## Functional Requirements

### FR-1: Core Telegram Types
- Define TypeScript interfaces for all Telegram Bot API objects (User, Chat, Message, Update, CallbackQuery, InlineQuery, etc.)
- Match PTB's naming conventions exactly (`Update`, `Message`, `User`, `Chat`, `CallbackQuery`)
- Support all update types per Bot API 8.0+

### FR-2: Bot Client (HTTP Layer)
- Wrapper around Telegram Bot API HTTP calls
- Use native `fetch` (Node 18+) - no axios/undici dependency
- Support all Bot API methods: `getMe`, `sendMessage`, `editMessageText`, `answerCallbackQuery`, `setWebhook`, `getUpdates`, etc.
- Automatic retry with exponential backoff on 429/5xx
- Request/response typing with Zod-like validation (optional, internal)

### FR-3: Application & Update Processing
- `ApplicationBuilder().token(token).build()` pattern
- Long polling: `runPolling(options?)` with configurable timeout, allowed_updates, drop_pending_updates
- Webhook: `runWebhook(options)` with built-in HTTP server, secret token validation
- Handler groups with priority ordering (group 0, 1, 2...)
- Error handlers: `addErrorHandler(callback)`

### FR-4: Handler System
Base handler classes matching PTB:
- `CommandHandler(command, callback, filter?)` - matches `/command[@bot]`
- `MessageHandler(filter, callback)` - matches messages via filter
- `CallbackQueryHandler(callback, pattern?)` - matches callback queries
- `ConversationHandler(entry_points, states, fallbacks, ...)` - stateful conversations
- `InlineQueryHandler(callback)` - inline queries
- `ChosenInlineResultHandler(callback)` - chosen inline results
- `PollAnswerHandler(callback)` - poll answers
- `ChatMemberHandler(callback, types?)` - chat member updates
- `TypeHandler(type, callback)` - raw update type matching

### FR-5: Filter System
Composable filter classes with fluent API:
- Basic: `filters.TEXT`, `filters.COMMAND`, `filters.PHOTO`, `filters.VIDEO`, `filters.DOCUMENT`, `filters.AUDIO`, `filters.VOICE`, `filters.STICKER`, `filters.LOCATION`, `filters.CONTACT`, `filters.POLL`, `filters.DICE`, `filters.GAME`, `filters.VENUE`, `filters.ANIMATION`, `filters.VIDEO_NOTE`, `filters.FORWARDED`, `filters.REPLY`, `filters.MENTION`, `filters.HASHTAG`, `filters.BOT_COMMAND`, `filters.URL`, `filters.EMAIL`, `filters.PHONE_NUMBER`, `filters.CASHTAG`
- Chat: `filters.ChatType.PRIVATE`, `filters.ChatType.GROUP`, `filters.ChatType.SUPERGROUP`, `filters.ChatType.CHANNEL`
- Status: `filters.StatusUpdate.NEW_CHAT_MEMBERS`, `filters.StatusUpdate.LEFT_CHAT_MEMBER`, `filters.StatusUpdate.NEW_CHAT_TITLE`, `filters.StatusUpdate.NEW_CHAT_PHOTO`, `filters.StatusUpdate.DELETE_CHAT_PHOTO`, `filters.StatusUpdate.GROUP_CHAT_CREATED`, `filters.StatusUpdate.SUPERGROUP_CHAT_CREATED`, `filters.StatusUpdate.CHANNEL_CHAT_CREATED`, `filters.StatusUpdate.MIGRATE_TO_CHAT_ID`, `filters.StatusUpdate.MIGRATE_FROM_CHAT_ID`, `filters.StatusUpdate.PINNED_MESSAGE`
- Combinators: `.and()`, `.or()`, `.not()`
- Regex: `filters.Regex(pattern)`, `filters.Regex(pattern, flags)`
- Custom: `filters.Custom(fn)`

### FR-6: Context & Persistence
- `CallbackContext` with: `bot`, `job_queue`, `user_data`, `chat_data`, `bot_data`, `args`, `matches`, `error`
- Persistence interface: `Persistence` with `getUserData()`, `setUserData()`, `getChatData()`, `setChatData()`, `getBotData()`, `setBotData()`, `getConversations()`, `updateConversation()`, `getJobs()`, `setJobs()` (job state persistence, required by FR-7's "persistent jobs")
- Built-in implementations: `MemoryPersistence` (default, resets on restart), `JsonFilePersistence` (flat-file, via `node:fs`), `SqlitePersistence` (via the `node:sqlite` built-in module — see NFR-1 for the resulting minimum Node.js version)

### FR-7: Job Queue
- `JobQueue` with `runOnce(callback, when, data?, name?)`, `runRepeating(callback, interval, first?, data?, name?)`
- `Job` with `callback`, `data`, `name`, `nextRun`, `remove()`
- Persistent jobs via persistence layer

### FR-8: Keyboards & Media
- ReplyKeyboardMarkup, InlineKeyboardMarkup, ReplyKeyboardRemove, ForceReply
- InputFile handling for multipart/form-data uploads
- InputMediaPhoto, InputMediaVideo, InputMediaAnimation, InputMediaAudio, InputMediaDocument

## Non-Functional Requirements

### NFR-1: Zero Required Dependencies
- This rule is scoped per implementation package: `packages/node` (TypeScript) must remain zero-required-dependency as detailed below; `packages/python` is allowed exactly one required runtime dependency (`httpx`, for the async HTTP transport — Python's stdlib has no async HTTP client; see `specs/004-python-framework`); `packages/go` maintains its own module's dependency policy (currently zero external dependencies)
- Only Node.js built-in modules (`fetch`, `http`, `https`, `fs`, `path`, `crypto`, `util`, `events`, `sqlite`)
- No required external npm packages in `dependencies`
- One optional peer dependency is allowed for opt-in, non-core features (`pino`, for structured logging — see Library Decisions); the framework must work fully without it installed, and it is excluded from Success Criteria #4's dependency check
- Dev dependencies only: `typescript`, `tsx`, `@types/node`, `vitest`, `typedoc` (doc generation, per NFR-4)

### NFR-2: Type Safety
- Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`)
- Full generic support for `CallbackContext<UserData, ChatData, BotData>`
- Discriminated unions for Update types

### NFR-3: Performance
The Performance Targets table in `technical-context.md` is the single source of truth for exact numbers (this section only restates the ceiling so the two files can't drift):
- Handler dispatch latency < 1ms per update
- Cold start < 200ms
- Memory: < 50MB idle (1000 chats), < 100MB active (10k updates/min)
- Throughput: > 1000 updates/sec (polling), > 5000 updates/sec (webhook)

### NFR-4: Developer Experience
- Identical API to PTB where possible (see Naming Conventions)
- Documentation comments follow the TSDoc/JSDoc tag set supported by [TypeDoc](https://typedoc.org), so `npx typedoc` generates the public docs site straight from source, no extra tooling:
  - Every exported class, function, and public method has a one-line summary, `@param` per parameter, and exactly one `@returns` (TypeDoc only recognizes one `@returns` per comment)
  - `@example` with at least one usage snippet on every public entry point (`Application`, each `*Handler`, `filters.*`, `CallbackContext`)
  - `@throws {@link ErrorType}` on any method that can reject/throw (e.g. `Bot.sendMessage` on a 429/4xx from Telegram)
  - `@defaultValue` on optional options fields that have a runtime default (e.g. `ApplicationOptions.concurrentUpdates`)
  - `@remarks` for PTB-vs-Node behavior differences that don't fit the one-line summary
  - `@deprecated` reserved for any API kept only as a migration bridge
- Example bots for each major feature
- Clear migration guide from PTB

## Project Structure

```
tele-bot/
├── src/
│   ├── index.ts                    # Main unified exports
│   ├── client/                     # Telegram Bot API 8.0+ client & transport
│   │   ├── index.ts
│   │   ├── types.ts                # Strict API type definitions & errors
│   │   ├── constants.ts            # Enums and constants (ParseMode, ChatType, etc.)
│   │   └── bot.ts                  # Bot HTTP client with auto-backoff
│   ├── kernel/                     # Core runtime engine
│   │   ├── index.ts
│   │   ├── app.ts                  # Application & ApplicationBuilder runtime
│   │   ├── context.ts              # CallbackContext execution context
│   │   └── update.ts               # Lazy-resolved Update wrapper
│   ├── routing/                    # Handler & routing engine
│   │   ├── index.ts
│   │   ├── handlers.ts             # CommandHandler, MessageHandler, CallbackQueryHandler...
│   │   └── conversation.ts         # Stateful ConversationHandler (FSM)
│   ├── filters/                    # Composable filter system
│   │   ├── index.ts
│   │   └── matchers.ts             # Matcher rules (.and, .or, .not)
│   ├── storage/                    # Pluggable persistence drivers
│   │   ├── index.ts
│   │   ├── driver.ts               # Persistence interface
│   │   ├── memory.ts               # MemoryPersistence
│   │   ├── json.ts                 # JsonFilePersistence
│   │   └── sqlite.ts               # SqlitePersistence (node:sqlite)
│   ├── scheduler/                  # Job queue & background tasks
│   │   ├── index.ts
│   │   └── queue.ts                # JobQueue & Job
│   ├── components/                 # UI & interactive builders
│   │   ├── index.ts
│   │   └── keyboard.ts             # InlineKeyboard & ReplyKeyboard builders
│   └── utils/                      # Low-level helpers
│       ├── http.ts                 # Multipart/form-data builder
│       └── validation.ts           # Runtime assertion guards
├── examples/                       # Runnable bot examples
│   ├── echobot.ts
│   ├── inlinekeyboard.ts
│   ├── conversationbot.ts
│   ├── pollbot.ts
│   ├── chatmemberbot.ts
│   └── deeplinking.ts
├── tests/                          # Vitest test suite mirroring src/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
└── README.md
```

## Library Decisions

| Need | Choice | Rationale |
|------|--------|-----------|
| HTTP Client | Native `fetch` | Node 18+, zero deps, standard |
| Validation | Internal minimal schema | Avoid Zod bundle size; only validate critical paths |
| Persistence | Pluggable interface + 3 built-ins | Memory (default), JSON file (simple), SQLite via `node:sqlite` (production) — requires Node.js 22+ |
| Logging | `console` + optional `pino` peer dep | Zero *required* deps; structured logging is opt-in via peer dep, not counted against NFR-1/Success Criteria #4 |
| Testing | `vitest` | Fast, ESM-native, TypeScript support |
| Build | `tsc` + `tsx` for dev | Standard, no bundler needed for library |
| Docs | `typedoc` | Generates the public docs site straight from TSDoc/JSDoc comments (see NFR-4); no separate doc-writing step |

## Handling Inefficiencies During Development

### Detection Triggers
- TypeScript compilation > 5s for incremental builds
- Runtime memory growth > 10MB/hour under load
- Handler dispatch latency > 1ms per update
- Bundle size > 500KB (minified)

### Remediation Process
1. **Profile first**: Use `--trace-ops` or `node --inspect` to identify bottleneck
2. **Isolate**: Create minimal reproduction in `tests/perf/`
3. **Decide**: 
   - If algorithmic: optimize data structures (Map → array, reduce allocations)
   - If architectural: consider splitting packages (core vs extensions)
   - If fundamental: accept trade-off, document limitation
4. **Validate**: Benchmark before/after with same test case
5. **Document**: Add ADR in `docs/adr/` for significant changes

### Escape Hatches
- **Internal APIs**: Prefix with `_` (e.g., `_processUpdate`) for advanced users to override
- **Custom HTTP Adapter**: Allow injecting `fetch` implementation for testing/proxy
- **Handler Middleware**: Add `middleware` array in Application for cross-cutting concerns

## Success Criteria

1. **API Parity**: At least 95% of PTB 20.x's public classes, methods, and filter constants (extracted from PTB's `__all__` exports) have a same-named counterpart exported from this framework.
2. **Migration Effort**: A defined reference bot (handlers + filters + conversation state + job queue, ~150-200 lines, equivalent to `examples/conversationbot.ts`) can be ported from Python to this framework in under 2 hours by a developer already familiar with PTB.
3. **Type Coverage**: 100% of publicly exported symbols have explicit TypeScript types (no implicit `any`); `tsc --strict` passes with zero errors.
4. **Zero Required Dependencies**: `npm ls --prod` lists no required runtime dependencies. The optional `pino` peer dependency (NFR-1) is excluded from this check.
5. **Examples Run**: All 7 example bots in `examples/` complete their documented happy-path scenario against a live Telegram test bot with no errors.
6. **Test Coverage**: `vitest --coverage` reports > 80% line coverage on `src/telegram/` and `src/ext/`.

## Assumptions

- Target Node.js version: 22+ (LTS) — raised from an earlier 20+ assumption specifically to get the built-in `node:sqlite` module needed by `SqlitePersistence` (FR-6); keeping one minimum version for the whole package avoids a split "core vs. SQLite" support matrix.
- TypeScript 5.5+
- Telegram Bot API 8.0 (July 2024)
- Developers familiar with PTB patterns
- No need for Deno/Bun compatibility initially

## Out of Scope (v1)

- MTProto client (userbot functionality)
- Passport/WebApp handlers (can add later)
- Game API handlers
- Custom webhook integrations (Express/Fastify adapters)
- Decorator-based handler registration
- Plugin system