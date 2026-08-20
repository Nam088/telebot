# Phase 1 Data Model: Telegram Bot Framework for Node.js

Two entity families: **Telegram Bot API objects** (data received from/sent to Telegram, defined by Telegram's own schema) and **framework entities** (this project's own abstractions, built on top). Telegram objects are enumerated field-by-field in `technical-context.md`'s "Data Models" section; this file doesn't repeat that list and instead documents relationships, validation, and state transitions, plus full detail on the framework entities, which are this project's actual design surface.

## Telegram Bot API objects (reference: technical-context.md)

| Entity | Role | Key relationships |
|---|---|---|
| `User` | A Telegram user or bot account | Referenced by `Message.from`, `CallbackQuery.from`, `ChatMember.user` |
| `Chat` | A private chat, group, supergroup, or channel | Referenced by `Message.chat`; `Chat.id` is the primary key used across `user_data`/`chat_data` lookups |
| `Message` | A single message | `chat: Chat`, `from?: User`, optional `reply_to_message?: Message` (self-referential) |
| `Update` | The envelope Telegram delivers; exactly one of its optional fields (`message`, `callback_query`, `inline_query`, ...) is populated per update — a discriminated union in practice (NFR-2) | Wraps `Message` / `CallbackQuery` / etc. |
| `CallbackQuery` | An inline-keyboard button press | `from: User`, optional `message?: Message` |

**Validation rules** (from FR-1/NFR-2): every field Telegram marks optional in the Bot API is optional in the TypeScript type — no field is invented as required just because a common case always sets it. Discriminated dispatch on `Update` relies on checking which of its optional fields is present, not on a separate `type` tag Telegram doesn't send.

## Framework entities

### `Application`

| Field | Type | Notes |
|---|---|---|
| `bot` | `Bot` | The HTTP client this application dispatches through |
| `job_queue` | `JobQueue` | See below; snake_case per the Naming Conventions noun rule |
| `handlers` | `Map<number, BaseHandler[]>` | Key = handler group (priority order, ascending) |
| `errorHandlers` | `ErrorHandlerCallback[]` | Registered via `addErrorHandler` |
| `user_data` | `Map<number, Record<string, any>>` | Per-user scratch data (FR-6) |
| `chat_data` | `Map<number\|string, Record<string, any>>` | Per-chat scratch data |
| `bot_data` | `Record<string, any>` | Process-wide scratch data |
| `offset` | `number` | Long-polling cursor (`getUpdates` offset) |
| `isRunning` | `boolean` | True between `runPolling`/`runWebhook` start and stop |
| `webhookServer?` | `http.Server` | Present only in webhook mode |

**Relationships**: owns exactly one `Bot`, one `JobQueue`, and 0+ `BaseHandler` instances grouped by priority.

**State transitions**: `built → running → stopped`. `runPolling()`/`runWebhook()` move it from `built` to `running` (only one of the two may be active — see Edge Cases in spec.md); a graceful shutdown or an unrecoverable startup error (invalid token) moves it to `stopped`.

### `CallbackContext<UserData, ChatData, BotData>`

| Field | Type | Notes |
|---|---|---|
| `bot` | `Bot` | |
| `job_queue?` | `JobQueue` | |
| `job?` | `Job` | Present only inside a `JobQueue` callback |
| `args?` | `string[]` | Populated by `CommandHandler` (space-split text after the command) |
| `user_data?` | `UserData` | Generic — see NFR-2 |
| `chat_data?` | `ChatData` | Generic |
| `bot_data?` | `BotData` | Generic |
| `error?` | `Error` | Populated only inside an error-handler callback |
| `matches?` | `RegExpMatchArray[]` | Populated by `filters.Regex` matches |

**Validation rules**: `user_data`/`chat_data` are only populated when the triggering `Update` carries a `Message`/`CallbackQuery` with a resolvable user/chat id; for update types without one (e.g. `poll_answer` without a chat context), they stay `undefined` rather than defaulting to an empty object, so callers can distinguish "no context" from "empty context."

### `BaseHandler` (abstract) and its subclasses

`BaseHandler` declares `checkUpdate(update): boolean | Promise<boolean>` and `handleUpdate(update, context): Promise<any>`. Each FR-4 subclass (`CommandHandler`, `MessageHandler`, `CallbackQueryHandler`, `ConversationHandler`, `InlineQueryHandler`, `ChosenInlineResultHandler`, `PollAnswerHandler`, `ChatMemberHandler`, `TypeHandler`) implements `checkUpdate` as a predicate over the relevant `Update` field and `handleUpdate` as "call the registered callback."

**Relationships**: an `Application` holds handlers grouped by priority (`Map<number, BaseHandler[]>`); within a group, dispatch stops at the first handler whose `checkUpdate` returns true (see technical-context.md's Handler Dispatch Pattern).

**State transitions**: `ConversationHandler` is the one stateful handler — it tracks a per-conversation state key (`entry_points → states[current] → fallbacks`), persisted via `Persistence.getConversations()`/`updateConversation()` when a non-memory persistence backend is configured (Edge Cases: conversation state survives restart only with such a backend).

### `Persistence` interface

| Method | Purpose |
|---|---|
| `getUserData(userId)` / `setUserData(userId, data)` | Per-user scratch data |
| `getChatData(chatId)` / `setChatData(chatId, data)` | Per-chat scratch data |
| `getBotData()` / `setBotData(data)` | Process-wide scratch data |
| `getConversations()` / `updateConversation(key, state)` | `ConversationHandler` state |
| `getJobs()` / `setJobs(jobs: PersistedJob[])` | `JobQueue` state (added during the spec review to close the gap between FR-7's "persistent jobs" and this interface — see `technical-context.md`'s Open Questions log) |

Three implementations satisfy this interface: `MemoryPersistence`, `JsonFilePersistence`, `SqlitePersistence` (see research.md's Persistence strategy entry for the rationale).

### `Job`, `JobQueue`, `PersistedJob`

| Entity | Fields |
|---|---|
| `Job` | `callback`, `data?`, `name?`, `nextRun`, `interval?`, `removed`, `remove()` |
| `JobQueue` | `jobs: Set<Job>`, `running: boolean`, `timer?: NodeJS.Timeout` |
| `PersistedJob` | `name`, `nextRun`, `interval?`, `data?` — the serializable subset of `Job` written by `Persistence.setJobs()`; `callback` is not serialized and is re-attached by `name` when jobs are reloaded from persistence |

**Relationships**: `JobQueue` owns 0+ `Job`s; on shutdown/restart with a non-memory `Persistence`, `Job`s round-trip through `PersistedJob`.

## Cross-entity invariant

Every noun above that a bot author reads or writes directly (`user_data`, `chat_data`, `bot_data`, `job_queue`, and all Telegram object fields) keeps PTB's exact `snake_case` name, per the Naming Conventions research decision — this is the invariant the whole data model is built to preserve.
