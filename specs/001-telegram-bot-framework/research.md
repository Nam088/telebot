# Phase 0 Research: Telegram Bot Framework for Node.js

All items below were already resolved before this plan (see `spec.md`'s Assumptions/Library Decisions and `technical-context.md`'s "Open Questions" log, which records the 2026-08-20 spec review). No `NEEDS CLARIFICATION` markers remain in `spec.md`. This file consolidates the decisions and their rationale in the format `/speckit-plan` expects, so they don't need to be re-derived at implementation time.

## Runtime and module system

- **Decision**: Node.js 22+ (LTS), ESM-only (`"type": "module"`).
- **Rationale**: Node 22+ is required for the built-in `node:sqlite` module that `SqlitePersistence` needs; keeping one minimum version for the whole package avoids a split "core vs. SQLite" support matrix. ESM is required for tree-shaking (NFR-4/Secondary Scenario) and avoids the dual-package (CJS/ESM) hazard.
- **Alternatives considered**: Node 20+ with `SqlitePersistence` implemented against an external driver (e.g. `better-sqlite3`) — rejected because it would violate NFR-1 (zero required dependencies). CJS — rejected, no tree-shaking and worse alignment with how PTB-migrating developers already write modern JS.

## HTTP layer

- **Decision**: Native `fetch` (available Node 18+, used here under the Node 22+ floor) with a custom retry/backoff wrapper.
- **Rationale**: Zero required dependencies (NFR-1); `fetch` is standard and well-understood; a hand-rolled backoff layer is small enough not to justify an HTTP client dependency (`axios`, `undici`-as-a-dependency, `got`).
- **Alternatives considered**: `axios`/`undici` as a dependency — rejected, violates NFR-1. `node:http`/`node:https` directly — rejected as unnecessarily low-level when `fetch` already wraps them adequately for JSON + multipart use.

## Persistence strategy

- **Decision**: Pluggable `Persistence` interface with three built-ins: `MemoryPersistence` (default), `JsonFilePersistence` (via `node:fs`), `SqlitePersistence` (via `node:sqlite`).
- **Rationale**: Mirrors PTB's own persistence abstraction (FR-6); memory/file/SQLite covers the realistic deployment spectrum (dev, single-process, production) without pulling in an ORM or a database driver dependency.
- **Alternatives considered**: A single "just use Redis" story — rejected, adds a required external service and dependency, out of proportion for a framework whose NFR-1 promises zero required dependencies. `better-sqlite3` — rejected for the same NFR-1 reason once `node:sqlite` became available at the chosen Node floor.

## Naming convention (PTB fidelity vs. JS idiom)

- **Decision**: Split by part of speech — verbs (things called with `()`) convert PTB's `snake_case` to `camelCase` (`add_handler` → `addHandler`); nouns (properties/options-keys actually read or written) keep PTB's exact `snake_case` (`context.user_data`, `options.allowed_updates`); classes and filter constants carry over unchanged (`CommandHandler`, `filters.TEXT`).
- **Rationale**: A full camelCase conversion would break the literal "same property name" migration promise the Primary Scenario's acceptance tests rely on (`context.user_data` must stay `context.user_data`); a full snake_case carryover would read as non-idiomatic TypeScript for anything called as a method. The split gets both: idiomatic call sites, literal data access. Verified empirically — see `AGENTS.md`/the `telegram-bot-node-conventions` skill: an agent given no rule defaulted to `context.chatData`/`userData` (wrong), one given the rule produced `context.chat_data`/`user_data` (correct).
- **Alternatives considered**: Full camelCase everywhere (simplest for TS readers, but breaks migration fidelity for data access). Full snake_case everywhere (perfect fidelity, but unidiomatic and triggers linter/ESLint camelCase rules on every method call).

## Documentation tooling

- **Decision**: TSDoc/JSDoc comments processed by [TypeDoc](https://typedoc.org) (`npx typedoc`), tags: `@param`, one `@returns`, `@example`, `@throws {@link ErrorType}`, `@defaultValue`, `@remarks`, `@deprecated`.
- **Rationale**: TypeDoc reads doc comments directly from TypeScript source with no separate doc-model build step — a single command produces the docs site, matching NFR-1's "minimal tooling" spirit. Verified against TypeDoc's own documentation (not assumed from memory) for exact supported tag syntax.
- **Alternatives considered**: Microsoft's **API Extractor + api-documenter** — a legitimate alternative, but it targets a different problem (a JSON "doc model" for tracking public API surface/breaking changes across versions, e.g. for large SDKs like Azure's), requiring an `api-extractor.json` config and a two-tool pipeline (`api-extractor` → `.api.json` → `api-documenter markdown`). That's more process than a single npm package needs; TypeDoc's single-command flow fits better. `documentation.js` — less actively maintained, less TypeScript-native than TypeDoc.

## Testing strategy

- **Decision**: `vitest` for unit + integration tests, >80% line coverage target on `src/telegram/` and `src/ext/`. Unit tests inject a fake `fetch` (the "Custom HTTP Adapter" escape hatch) instead of calling Telegram; true end-to-end tests against a live bot gate on a `TEST_BOT_TOKEN` env var and are skipped by default.
- **Rationale**: `vitest` is ESM-native and fast, matching the ESM-only module decision above; fake-`fetch` injection makes `Bot` client tests deterministic and offline-runnable, which is required for CI to work without live Telegram credentials.
- **Alternatives considered**: `jest` — heavier ESM configuration story than `vitest`. Recording real HTTP responses as fixtures (VCR-style) — more moving parts than injecting a fake `fetch`, given the framework already exposes that seam as a public escape hatch.

## Error handling and retry

- **Decision**: Exponential backoff (`1s, 2s, 4s, 8s`, capped at `30s`) on `429`/`5xx` only; `429` additionally honors Telegram's `retry_after` field exactly; public methods reject with a typed `TelegramApiError` (carrying `error_code`/`description`) rather than a bare `Error`.
- **Rationale**: Matches Telegram Bot API's own rate-limit contract; a typed error lets callers `instanceof`-check instead of parsing message strings, and makes the `@throws {@link TelegramApiError}` doc tag (NFR-4) accurate rather than aspirational.
- **Alternatives considered**: Fixed-interval retry — rejected, doesn't back off under sustained rate limiting. Silently swallowing errors and returning a falsy value — rejected, hides failures from bot authors and makes `@throws` documentation meaningless.
