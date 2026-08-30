# Data Model: Python Implementation of the Telegram Bot Framework

**Feature**: `specs/004-python-framework` | **Date**: 2026-08-30

Entities below are the framework's runtime data model. Field names are Python attribute names (snake_case Telegram fields per FR-001). "Sibling ref" points to the canonical implementation for behavioral parity.

## 1. Telegram types (`types/`)

Immutable value objects (frozen dataclasses) mirroring Bot API objects. Representative set — full surface follows the parity inventory (research R10).

| Entity | Key attributes | Validation rules |
|---|---|---|
| `User` | `id`, `is_bot`, `first_name`, `last_name?`, `username?`, `language_code?` | `id` int; `first_name` required |
| `Chat` | `id`, `type` (`private`/`group`/`supergroup`/`channel`), `title?`, `username?`, `first_name?` | `type` restricted enum |
| `Message` | `message_id`, `date`, `chat`, `from_user?`, `text?`, `reply_to_message?`, media fields... | `message_id` + `date` + `chat` required |
| `Update` | `update_id`, exactly-one-of: `message`, `edited_message`, `callback_query`, `chat_member`, `my_chat_member`, `inline_query`, `pre_checkout_query`, business variants... | **exactly one** payload field set; unknown payloads tolerated (malformed-update edge case) |
| `CallbackQuery` | `id`, `from_user`, `message?`, `data?`, `chat_instance` | `id` + `from_user` required |

State transitions: none — value objects. Deserialization never raises on unknown extra fields; missing required fields raise a typed `TypeError`-derived parsing error that the webhook/polling layer catches and logs (does not crash).

## 2. Kernel

| Entity | Key attributes | Notes |
|---|---|---|
| `Application` | `bot`, `update_queue`, `dispatcher`, `job_queue?`, `persistence?`, `plugin_manager`, `error_handlers`, state machine | Lifecycle states: `STOPPED → INITIALIZING → RUNNING → STOPPING → STOPPED`; `run_polling()`/`run_webhook()` drive transitions; starting a second run mode while RUNNING raises |
| `ApplicationBuilder` | token, base_url, transport override, persistence, job_queue flag, post-init/shutdown hooks | Validates combination errors at `build()` (empty token → raise, FR-014) |
| `Dispatcher` | `application`, handler groups `dict[int, list[Handler]]`, error handlers, concurrency bound | Groups ordered by key; within a group, registration order |
| `CallbackContext` | `bot`, `update`, `chat?`, `user?`, `user_data`, `chat_data`, `bot_data`, `matches?`, `args?` (CommandHandler), `job_queue`, per-conversation state accessors | Created per dispatch; mutable data dicts shared with persistence |

State transitions (Application): `initialize()` → `start()` → `stop()` → `shutdown()`; idempotent guards per state; concurrent polling+webhook rejected with typed error.

## 3. Routing

| Entity | Key attributes | Validation |
|---|---|---|
| `BaseHandler` | `callback` (async callable), optional `block` flag | callback required |
| `CommandHandler` | `commands: list[str]`, `filters?` | empty command list/empty string → raise at construction (FR-014) |
| `MessageHandler` | `filters`, callback | filters required |
| `CallbackQueryHandler` | `pattern?` (str/regex), callback | |
| + siblings: `ChatMemberHandler`, `ChatJoinRequestHandler`, `PreCheckoutQueryHandler`, `MessageReactionHandler`, `InlineQueryHandler`, business handlers | per `packages/node/src/routing/handlers/*` | |
| `ConversationHandler` | `entry_points`, `states: dict[state, list[Handler]]`, `fallbacks`, `timeouts?`, `persistence_key`, `per_chat/per_user/per_message` | unknown state keys raise; timeout job scheduled when configured |
| `LinearConversationHandler` | ordered `steps`, `fallbacks` | order enforced |
| `AsyncConversationHandler` | async entry/state resolution | |

Conversation state machine: `NO_CONVERSATION → state_i → ... → END` (+ `TIMEOUT`, fallback resets). Persisted per `(chat_id, user_id, key)` via persistence backend.

## 4. Filters

| Entity | Key attributes | Notes |
|---|---|---|
| `MessageFilter` base | `__call__(message) -> bool`, optional `data_filter` | composable via `&`, `|`, `~` producing composite filter objects |
| `filters` namespace | `TEXT`, `PHOTO`, `DOCUMENT`, `ALL`, `UpdateType.*`, `ChatType.PRIVATE/GROUP/SUPERGROUP/CHANNEL`, `Regex`, `User(...)`, `Chat(...)` | parity with PTB + siblings |

## 5. Scheduler

| Entity | Key attributes | Notes |
|---|---|---|
| `Job` | `callback`, `data?`, `name`, schedule (one-shot/repeating/interval/RRule), `next_t`, cancelled flag | cancel idempotent |
| `JobQueue` | job collection, async timer loop bound to the event loop | `run_once`, `run_repeating`, `run_daily`, `run_custom(rrule)` — RRule semantics per `packages/go/pkg/scheduler/rrule` (FR-008, research R6) |

RRule value object: `freq`, `interval`, `count?`, `until?`, `by_*` rules — field-for-field parity with Go's `types.go`.

## 6. Persistence

| Entity | Key attributes | Notes |
|---|---|---|
| `BasePersistence` | async methods: get/refresh/update for conversation state, `chat_data`, `user_data`, `bot_data` | contract class; all I/O off the event loop (research R5) |
| `MemoryPersistence` | dicts | default when none configured |
| `JSONPersistence` | `file_path` | atomic write (tmp + rename) |
| `SQLitePersistence` | `db_path`, worker-thread connection | WAL mode; serialized access |
| Persistence driver | pluggable storage-driver interface | parity with `packages/node/src/storage/driver.ts` |

## 7. Plugins

| Entity | Key attributes | Notes |
|---|---|---|
| `Plugin` | `name`, `version?`, hook registrations, namespaced state | ordered registration; removable at runtime |
| `PluginManager` | registry, hook dispatch (response + error hooks), ordering resolver | cycles in ordering → typed error |
| `I18nPlugin` | locales dict, per-user language | built-in plugin |

## Cross-cutting validation & error entities

| Entity | Purpose |
|---|---|
| `TelegramApiError` | carries `error_code`, `description`, request method, `retry_after?` — raised for all non-ok Bot API responses |
| `NetworkError` | transport-level failures |
| `InvalidTokenError` | 401 at startup |
| `RuntimeError`-family typed errors | lifecycle misuse (double-run, dispatch before init) |

Every error type is `instanceof`-checkable (FR-012); no bare `Exception` surfaces from public APIs.
