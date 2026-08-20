---
name: telegram-bot-node-conventions
description: Use when writing, reviewing, or porting code in the telegram-bot-node repo (the zero-dependency TypeScript port of python-telegram-bot/PTB) — adding or reviewing a Handler, Filter, Bot API method, Persistence method, CallbackContext property, or any other public export, and when writing its doc comments.
---

# Telegram Bot Node Conventions

## Overview
`telegram-bot-node` ports `python-telegram-bot` (PTB) to a zero-required-dependency TypeScript framework, so a PTB bot can be migrated with minimal code changes. Every new public symbol must follow this repo's PTB naming split, its dependency policy, and TypeDoc-recognized doc comments. Full rationale lives in this repo's `AGENTS.md` and `specs/001-telegram-bot-framework/{spec.md,technical-context.md}` — this is the quick-reference version, tested to actually change output (an agent without it writes `context.chatData`; one with it writes `context.chat_data`).

## Naming split

| Kind | Rule | Example |
|---|---|---|
| Method you call (`x()`) | camelCase, converted from PTB's snake_case | `add_handler` → `addHandler`, `send_message` → `sendMessage` |
| Property / options key you read or write | keep PTB's exact snake_case | `context.user_data`, `context.chat_data`, `options.allowed_updates`, `disable_notification` |
| Class / filter constant | unchanged from PTB | `CommandHandler`, `filters.TEXT`, `filters.ChatType.PRIVATE` |
| Python operator overload (`&`, `\|`, `~` on filters) | explicit method, no JS equivalent | `.and()`, `.or()`, `.not()` |

Quick test: is it called with `()`? → camelCase. Is it a value or object-literal key being read/written? → keep PTB's snake_case.

Before naming anything, check the real PTB source vendored in the repo at `python-telegram-bot/src/telegram/` — don't guess PTB's exact name from memory.

Filenames are a separate rule from identifiers: multi-word source files use `.` as the separator (`conversation.handler.ts`, `job.queue.ts`), never `_` — this doesn't affect the `job_queue` *property* name, which stays snake_case per the table above.

## Dependency policy

- Nothing in `"dependencies"` beyond Node.js built-ins (`fetch`, `http`, `https`, `fs`, `path`, `crypto`, `util`, `events`, `sqlite`).
- Exactly one allowed optional peer dependency: `pino` (opt-in structured logging); the framework must work fully without it.
- Adding any other runtime dependency requires updating `spec.md` NFR-1 and Success Criteria #4 first — don't add the dependency and leave the spec claiming zero dependencies.
- Minimum Node.js version: 22+ (needed for the built-in `node:sqlite` used by `SqlitePersistence`).

## Doc comments (required on every public export)

Use only tags [TypeDoc](https://typedoc.org) recognizes, so `npx typedoc` renders them correctly:
- One-line summary, `@param` per parameter, exactly one `@returns` (TypeDoc only honors one per comment).
- `@example` with a runnable snippet on every public entry point (`Application`, each `*Handler`, `filters.*`, `CallbackContext`).
- `@throws {@link ErrorType}` on anything that can reject/throw.
- `@defaultValue` on optional fields with a runtime default.
- `@remarks` for PTB-vs-Node behavior differences.
- `@deprecated` only for APIs kept as a migration bridge.

## Testing, error handling, git (full detail in `AGENTS.md`)

- Write the unit test first for any new handler/filter/Bot API/persistence method; mirror `src/` paths under `tests/unit/`; never hit real Telegram in a default test run (inject a fake `fetch` instead).
- Retry only on `429`/`5xx` with exponential backoff (`1s,2s,4s,8s`, cap `30s`); honor `429`'s `retry_after` exactly; public methods reject with a typed error (e.g. `TelegramApiError`), not a bare `Error`.
- One branch per FR/NFR; commit messages reference the requirement (`feat(ext): add ConversationHandler (FR-4)`); `npm run build && npm test` clean before opening a PR.
- This repo only has `spec.md`/`technical-context.md` so far — run `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` rather than coding straight from the spec.

## Common mistakes

- Writing `context.userData`/`chatData` instead of `context.user_data`/`chat_data` — breaks the "same property name" migration promise (confirmed to happen by default without this skill).
- camelCasing an options key that mirrors a Telegram/PTB field, e.g. `options.allowedUpdates` instead of `options.allowed_updates`.
- Adding a package to `dependencies` without updating NFR-1 in `spec.md`.
- A doc comment with prose but no `@param`/`@returns` — TypeDoc won't structure it, defeating the point of NFR-4.

## Reference

- Full rules + rationale: `AGENTS.md` (repo root)
- Requirements/success criteria: `specs/001-telegram-bot-framework/spec.md`
- Architecture/data models/perf targets: `specs/001-telegram-bot-framework/technical-context.md`
- Ground-truth PTB source: `python-telegram-bot/`
