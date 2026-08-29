---
name: telegram-bot-node-conventions
description: Authoritative guide for adding new Bot API methods, Handlers, Filters, Scheduler RRule features, Storage Persistence drivers, or TypeDoc docstrings to the telebot-ts framework. Use whenever creating, modifying, or reviewing code in the repository.
---

# Telegram Bot Node Conventions & Feature Development Workflow

## 1. Overview
`telebot-ts` is a zero-required-dependency, TypeScript-first Telegram Bot framework for Node.js.
When adding new methods, features, handlers, or drivers, agents must strictly follow the architectural patterns, naming conventions, zero-dependency policy, TDD workflow, file modularization (< 500 lines), and TypeDoc documentation standards described below.

---

## 2. Naming Conventions & File Organization

| Kind | Rule | Example |
|---|---|---|
| **Method you call (`x()`)** | `camelCase` | `sendMessage`, `addHandler`, `runRRule`, `deleteUserData` |
| **Property / Storage key / API option** | `snake_case` | `context.user_data`, `context.chat_data`, `options.allowed_updates`, `chat_id`, `message_id` |
| **Class / Filter constant** | `PascalCase` / `UPPER_SNAKE_CASE` | `CommandHandler`, `RRule`, `filters.TEXT`, `filters.ChatType.PRIVATE` |
| **Filter Boolean combinators** | Explicit method calls | `.and()`, `.or()`, `.not()` |
| **Filenames & Folders** | Multi-word files use `.` or `-` | `conversation.ts`, `send-options.ts`, `send-media.ts` |
| **File Length Constraint** | Strictly `< 500` lines per file | Decompose files > 500 lines into dedicated folder modules |
| **Module Exports** | Re-export through `index.ts` | No loose single-file bridge re-exports |

---

## 3. How to Add a New Bot API Method (Domain Submodule Pattern)

The `Bot` client uses modular domain submodules under `src/client/methods/`:

1. **Step 1: Define Types in `src/client/types/<domain>/`**
   - Add payload interfaces (e.g. `SendXOptions`) and model interfaces in the appropriate domain folder (`messages/`, `chats/`, `stickers/`, `payments/`, `topics/`, `business/`, `rich/`, `common/`).
   - Export through `src/client/types/<domain>/index.ts` and `src/client/types/index.ts`.
2. **Step 2: Implement in appropriate domain submodule under `src/client/methods/<domain>/`**
   - `messages/`: Message sending (`send-basic.ts`, `send-media.ts`), editing and reactions (`edit.ts`).
   - `chats/`: Moderation (`members.ts`), metadata and settings (`management.ts`).
   - `topics/`: Bot identity/commands (`profile.ts`), forum topics (`topics.ts`).
   - `business/`: Queries (`queries.ts`), games (`games-passport.ts`), stories (`stories-boosts.ts`), gifts (`gifts.ts`), ephemeral (`ephemeral.ts`).
   - `stickers.ts`: Sticker sets, custom emojis, uploads.
   - `payments.ts`: Invoices, Telegram Stars, payments, subscriptions.
3. **Step 3: Add complete TSDoc**
   - One-line summary.
   - `@param options - ...`
   - `@returns The Telegram response object wrapped in Promise.`
   - `@throws {@link TelegramApiError} When Telegram API returns an error code.`
   - `@example` Runnable TypeScript snippet.
4. **Step 4: Add Unit Tests in `tests/unit/client/methods/`**
   - Mock fetch response using mock adapter to test payload serialization and error handling.

---

## 4. How to Add a New Storage Persistence Driver

All storage drivers must implement the `Persistence` interface or inherit from `BasePersistence` in `src/storage/`:

1. **Step 1: Inherit from `BasePersistence` (`src/storage/driver.ts`)**
   - Implement the 3 raw primitives:
     - `getRaw(key: string): Promise<Record<string, unknown> | null>`
     - `setRaw(key: string, data: Record<string, unknown>): Promise<void>`
     - `deleteRaw(key: string): Promise<void>`
2. **Step 2: Export in `src/storage/index.ts` and `src/index.ts`**
3. **Step 3: Create tests in `tests/unit/storage/`**
   - Test user data, chat data, bot data, conversation states, and deletion methods (`deleteUserData`, `deleteChatData`, `deleteConversation`).
4. **Step 4: Create runnable example in `examples/`**

---

## 5. How to Add a New Handler or Filter

1. **New Handler (`src/routing/handlers/` or `src/routing/handlers.ts`)**:
   - Inherit from `BaseHandler<C, R>`.
   - Implement `checkUpdate(update: Update): Promise<boolean>`.
   - Implement `handleUpdate(update: Update, context: C): Promise<R>`.
2. **New Filter (`src/filters/matchers.ts`)**:
   - Inherit from `BaseFilter`.
   - Implement `checkUpdate(update: Update): boolean | Promise<boolean>`.
   - Support `.and()`, `.or()`, `.not()`.

---

## 6. How to Add / Extend Scheduler Features (`src/scheduler/`)

1. **JobQueue & Job Lifecycle (`src/scheduler/queue.ts`, `src/scheduler/job.ts`)**:
   - Always handle timer chunking (>24.8 days limit in `setTimeout`).
   - Reschedule jobs on `JobQueue.start()` if jobs were added prior to start or restored from persistence.
   - Maintain $O(1)$ multi-index maps (`_jobsByName`, `_jobsByChatId`).
2. **RFC 5545 RRule Engine (`src/scheduler/rrule/`)**:
   - Modularized into `types.ts`, `parser.ts`, `helpers.ts`, `rrule.ts`, `index.ts`.
   - Full compatibility with `rrule.js` options (`freq`, `interval`, `dtstart`, `until`, `count`, `tzid`, `byweekday`, `bymonthday`, `byhour`, `byminute`, `bysecond`, `byyearday`, `byweekno`, `bysetpos`).

---

## 7. Git Branching & PR Workflow
- **Never Push Directly to `main`**: Always check out a dedicated branch (`feat/...` or `refactor/...`).
- Push commits to the remote branch and open/update Pull Requests on GitHub.

---

## 8. Mandatory Quality Gates & Verification Checklist

Before considering any feature, bug fix, or refactor complete, execute:
1. `npm run format && npm run format:check` → Formatting check.
2. `npm run lint` → ESLint static analysis (0 errors, 0 warnings).
3. `npm run typecheck` → TypeScript compilation (0 errors).
4. `npm run build` → ESM + DTS build (0 errors).
5. `npm test` → 100% test suites pass.
6. `npm run test:coverage` → Ensure line coverage stays **>90%**.
7. `npm run docs` (or `npx typedoc`) → Documentation generated with **0 errors and 0 warnings**.
