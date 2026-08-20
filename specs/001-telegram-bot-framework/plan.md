# Implementation Plan: Telegram Bot Framework for Node.js

**Branch**: `001-telegram-bot-framework` | **Date**: 2026-08-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-telegram-bot-framework/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build a zero-required-dependency, TypeScript-first Telegram Bot framework that mirrors `python-telegram-bot` (PTB)'s public API (`Application`, `*Handler`, `filters.*`, `CallbackContext`, `Persistence`, `JobQueue`), so an existing PTB bot can be ported to Node.js with minimal, largely mechanical code changes. Technical approach: a layered architecture (`src/telegram/` for Bot API types + HTTP client, `src/ext/` for the PTB-parity framework, `src/utils/` for internals), built only on Node.js 22+ built-ins (native `fetch`, `node:sqlite`, etc.), with a documented naming split (PTB verbs → camelCase methods, PTB nouns → snake_case properties/keys) so the ported code reads as idiomatic TypeScript without losing 1:1 migration fidelity. Full rationale in [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.5+ (strict mode), targeting Node.js 22+ (LTS)

**Primary Dependencies**: None required at runtime — only Node.js built-ins (`fetch`, `node:http`, `node:https`, `node:fs`, `node:path`, `node:crypto`, `node:events`, `node:util`, `node:sqlite`). One optional peer dependency, `pino`, for opt-in structured logging. Dev-only: `typescript`, `tsx`, `vitest`, `typedoc`, `@types/node`.

**Storage**: Pluggable `Persistence` interface with three built-ins — `MemoryPersistence` (default, resets on restart), `JsonFilePersistence` (via `node:fs`), `SqlitePersistence` (via the `node:sqlite` built-in module).

**Testing**: `vitest` (unit + integration), target >80% line coverage on `src/telegram/` and `src/ext/`. Unit tests never make real HTTP calls (fake `fetch` injection); live-bot tests gate on a `TEST_BOT_TOKEN` env var and skip by default.

**Target Platform**: Node.js 22+ server/long-running process — either long-polling (`runPolling`) or an HTTP server for webhooks (`runWebhook`); no browser target.

**Project Type**: Single TypeScript library (npm package) with a bundled `examples/` directory of runnable bots — not a web app or mobile app, so the "single project" structure below applies, not the web/mobile options.

**Performance Goals**: Cold start <200ms; handler dispatch <1ms/update; polling throughput >1000 updates/sec; webhook throughput >5000 updates/sec (canonical numbers in technical-context.md's Performance Targets table).

**Constraints**: Zero required runtime dependencies (NFR-1); memory <50MB idle at 1000 chats, <100MB active at 10k updates/min; ESM-only (`"type": "module"`); `strict: true` + `noUncheckedIndexedAccess: true`; 95% of PTB 20.x public API surface covered (Success Criteria #1).

**Scale/Scope**: 8 functional requirement areas (FR-1..FR-8: Telegram types, Bot HTTP client, Application/update processing, Handler system, Filter system, Context & Persistence, Job Queue, Keyboards & Media), 4 non-functional requirement areas (NFR-1..NFR-4), ~9 source modules across `src/telegram/`, `src/ext/`, `src/utils/`, and 7 example bots.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template (no principles have been ratified for this project yet — run `/speckit-constitution` separately if/when the team wants to formalize one). There are therefore no constitution-derived gates to evaluate here. This repo's `AGENTS.md` already encodes the project-specific engineering rules that would otherwise live in a constitution (naming conventions, dependency policy, doc-comment requirements, testing, error handling, git/PR conventions); nothing in spec.md or technical-context.md conflicts with it.

**Result: PASS (no ratified constitution to violate).**

*Re-checked after Phase 1 design (data-model.md, contracts/, quickstart.md): still PASS — nothing in the generated design artifacts introduces a governance concern, since there is still no ratified constitution to check against.*

## Project Structure

### Documentation (this feature)

```text
specs/001-telegram-bot-framework/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
├── technical-context.md # Pre-existing architecture/data-model/perf reference (see AGENTS.md)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── index.ts                    # Main exports
├── telegram/                   # Layer 1: Telegram API types & HTTP client
│   ├── index.ts
│   ├── types.ts                # User, Chat, Message, Update, CallbackQuery, ...
│   ├── bot.ts                  # Bot HTTP client (fetch wrapper, retry/backoff)
│   └── update.ts                # Update wrapper with convenience getters
├── ext/                         # Layer 2: framework extensions (PTB parity)
│   ├── index.ts
│   ├── application.ts          # Application, ApplicationBuilder, runPolling/runWebhook
│   ├── context.ts              # CallbackContext, ContextTypes
│   ├── handlers.ts             # CommandHandler, MessageHandler, ConversationHandler, ...
│   ├── filters.ts              # Filter system (TEXT, COMMAND, ChatType, combinators)
│   ├── conversation.handler.ts
│   ├── job.queue.ts            # JobQueue, Job, PersistedJob
│   ├── persistence.ts          # Persistence interface + Memory/JsonFile/Sqlite impls
│   └── keyboards.ts            # ReplyKeyboardMarkup, InlineKeyboardMarkup, InputMedia*
└── utils/                       # Layer 3: internal helpers
    ├── http.ts                 # multipart/form-data, fetch helpers
    └── validation.ts           # minimal internal validation

examples/                        # 7 runnable bots, one per major feature (NFR-4)
tests/
├── unit/                        # mirrors src/ (e.g. tests/unit/ext/handlers.test.ts)
└── integration/                 # cross-module flows (Application → handler → context)
```

**Structure Decision**: Single project (library), matching spec.md's own "Project Structure" section — no web/mobile split, since this ships as one npm package. `package.json`'s current `dev:*` scripts reference `src/examples/`; this plan uses spec.md's top-level `examples/` instead — reconcile that one path when scaffolding (see AGENTS.md's TypeScript & module conventions note).

## Complexity Tracking

Not applicable — the Constitution Check above found no ratified constitution and therefore no gate to violate.
