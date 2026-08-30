# AGENTS.md

Rules for any AI coding agent (Claude, Copilot, Cursor, Codex, or otherwise) working in this repository. These apply in addition to, and do not override, project-specific instructions the user gives in a session.

## What this project is

A zero-required-dependency, TypeScript-first Telegram Bot framework that mirrors `python-telegram-bot` (PTB)'s public API, so an existing PTB bot can be ported to Node.js with minimal code changes.

## Source of truth

Ranked — when two of these disagree, the higher one wins. Say so out loud instead of silently following the lower one.

- `scripts/bot-api-oracle.json` — **what the Bot API actually is.** Field tables for every documented method and type, machine-extracted from `core.telegram.org/bots/api` and committed (Bot API 10.3: 185 methods, 400 types, 1888 fields), so it is readable with no network. See "Bot API docs oracle & fidelity gate".
- `specs/001-telegram-bot-framework/spec.md` — functional/non-functional requirements, success criteria, naming conventions, out-of-scope items. Read this before implementing any feature.
- `specs/001-telegram-bot-framework/technical-context.md` — architecture, data models, API contracts, performance targets. This is the authoritative source for exact numbers/interfaces; spec.md only restates ceilings so the two files don't drift — if you change one, check the other.
- The sibling packages' source — **a peer implementation, not ground truth.** For a documented field or method signature, go to the oracle. `packages/node` has been the wrong one more than once: it exposed no `ChatFullInfo` for its first releases even though `getChat` returns that type, and its `Chat` still declares 43 fields against the 8 the docs table lists — while go's `Chat` declares exactly those 8. Which sibling is right is not predictable, so it is not a shortcut. Read a sibling for convention and shape ideas, then confirm against the oracle.
- `python-telegram-bot/` — upstream PTB source, vendored locally for reference. When porting a class, method, or filter, read the real implementation here (e.g. `python-telegram-bot/src/telegram/ext/`) instead of recalling PTB's API from memory. Training data can be stale or wrong about exact signatures/behavior; this vendored copy cannot be. It is gitignored, so it may simply be absent from a given checkout — if it is, fetch upstream rather than working from memory, and say which you used.

If a request conflicts with `spec.md`, flag the conflict and ask rather than silently picking one side.

## Naming conventions (see spec.md "Naming Conventions" for the full rule)

- **Verbs (methods you call)** → `camelCase`, converted from PTB's `snake_case`: `add_handler` → `addHandler`, `send_message` → `sendMessage`, `run_once` → `runOnce`. Python operator overloads (`&`, `|`, `~` on filters) become explicit `.and()`, `.or()`, `.not()` calls.
- **Nouns (data you read or write)** — object properties, options-object keys, Telegram Bot API fields — keep PTB's exact `snake_case` spelling: `context.user_data`, `context.chat_data`, `context.bot_data`, `context.job_queue`, `options.allowed_updates`, `options.drop_pending_updates`, `chat_id`, `message_id`, `first_name`.
- **Classes and filter constants** carry over unchanged: `CommandHandler`, `filters.TEXT`, `filters.ChatType.PRIVATE`.
- Rule of thumb: is it called with `()`? → camelCase. Is it a value read or an object-literal key? → keep PTB's snake_case.

## Dependency policy (NFR-1 in spec.md)

- No required dependencies in `"dependencies"`. Only Node.js built-ins: `fetch`, `http`, `https`, `fs`, `path`, `crypto`, `util`, `events`, `sqlite`.
- Exactly one allowed optional peer dependency: `pino`, for opt-in structured logging. The framework must work fully without it installed.
- Adding any other runtime dependency requires updating `spec.md` NFR-1 and Success Criteria #4 first — don't add a dependency and leave the spec claiming zero dependencies.
- `devDependencies` are unrestricted but should stay minimal: `typescript`, `tsx`, `vitest`, `typedoc`, `@types/node`.
- Minimum Node.js version is 22+ (raised specifically for the built-in `node:sqlite` module used by `SqlitePersistence`). Don't use syntax/APIs that require a newer version without updating the Assumptions section in spec.md.

## Documentation comments (NFR-4 in spec.md)

Doc comments must use the TSDoc/JSDoc tags [TypeDoc](https://typedoc.org) understands, so `npx typedoc` generates docs directly from source with no rewriting:
- One-line summary + `@param` per parameter + exactly one `@returns` (TypeDoc only recognizes one per comment).
- Explicit, precise TypeScript types for all arguments, returns, generics, and properties (avoid loose `any`).
- `@example` on every public entry point (`Application`, each `*Handler`, `filters.*`, `CallbackContext`).
- `@throws {@link ErrorType}` on anything that can reject/throw.
- `@defaultValue` on optional fields with a runtime default.
- `@remarks` for PTB-vs-Node behavior differences.
- `@deprecated` only for APIs kept as a migration bridge.
- Every documented Bot API method/type carries an official-docs link (`https://core.telegram.org/bots/api#<slug>`, `<slug>` = wire name/type name fully lowercased) — as TSDoc `@see`, GoDoc `// Telegram API:`, or a Sphinx `Telegram API:` line. Slugs are verified against the committed oracle's `anchors` list, never from memory; fetch the live page only when you suspect the oracle itself is stale. Framework extensions without a docs anchor get no link rather than a guessed one.

Before writing code against a library not already decided in `technical-context.md` (a new dependency, a new dev tool), resolve and query its docs via the `context7` MCP server first rather than relying on memory — this project's global instructions require it.

## Bot API docs oracle & fidelity gate

`scripts/` turns "does our type match Telegram's table?" into a machine question. Zero dependencies, Node built-ins only.

- `npm run audit:docs` → `bot-api-docs.mjs` parses `core.telegram.org/bots/api` and writes `scripts/bot-api-oracle.json`. Committed and trimmed of prose so it reads offline.
- `npm run audit:fidelity` → `bot-api-fidelity.mjs` extracts every declared type from all three packages and diffs each against the oracle: missing REQUIRED, missing optional, and concrete docs types not modelled at all. Its report also renders into the CI job summary.

Querying the oracle (`types`/`methods`/`anchors`):

```bash
node -e "const o=require('./scripts/bot-api-oracle.json');console.log(JSON.stringify(o.types['ChatFullInfo'].fields,null,1))"
node -e "const o=require('./scripts/bot-api-oracle.json');console.log(o.anchors.includes('chatfullinfo'))"
```

Each field is `{type, optional}`; `methods[wireName].params` has the same shape; `anchors` is every valid docs slug.

Gate rules that follow:

- **The fidelity gate is a ratchet, not a clean bill of health.** It compares against the committed `scripts/bot-api-fidelity-baseline.json` and exits 1 only on *new* drift, so a large known backlog can coexist with a green CI. `npm run audit:fidelity:strict` shows every gap, known or new; `npm run audit:fidelity:report` prints the per-type detail.
- **Never refresh the baseline to make red go away.** A failing ratchet means fix the type. `npm run audit:baseline` exists for the moment Telegram ships a new API version and must be its own commit so the deliberate acceptance of drift is visible in history.
- **A modelled type must carry its whole docs row**, required *and* optional. In go and python declare every field **in that type itself** — the audit resolves `extends` only for TypeScript, so an inherited field still reads as missing. Adding a half-complete type is worse than not adding it: it converts a silent backlog entry into a red gate.
- **The audit is one-directional: it reports missing fields, never extra ones.** Over-modelling is invisible to CI and stays a human call — node's `Chat` declares 43 fields against 8 documented, while go's declares exactly 8. Check the oracle row before copying a sibling's field list.
- Types with an empty docs table (`MessageOrigin`, `InputMedia`, `CallbackGame`) are abstract unions, not concrete types; their absence is not a gap. The audit only counts types whose row lists at least one field.

## TypeScript & module conventions

- `strict: true` and `noUncheckedIndexedAccess: true` (NFR-2) — both set in `tsconfig.json`.
- ESM only (`"type": "module"` in `package.json`) — set.
- Follow the file layout in spec.md's "Project Structure" section (`src/telegram/`, `src/ext/`, `src/utils/`, top-level `examples/`, `tests/unit/` + `tests/integration/`). Note `package.json`'s current `dev:*` scripts point at `src/examples/`, not the top-level `examples/` spec.md describes — reconcile this when scaffolding the real directories, don't leave both paths half-populated.
- Multi-word source filenames use `.` as the separator, not `_`: `conversation.handler.ts`, `job.queue.ts` (not `conversation_handler.ts`/`job_queue.ts`). This is a filename-only rule — it doesn't apply to identifiers inside the code, where the Naming Conventions noun rule above still keeps `job_queue` as a property name (`context.job_queue`).
- **Source File Length Ceiling (< 500 lines)**: Every file in `src/` must remain strictly under 500 lines. Complex domains must be split into dedicated subfolders (`messages/`, `chats/`, `topics/`, `business/`, `rrule/`, `menu/`, `keyboard/`, `async-conversation/`) exporting through an `index.ts`.
- **Zero Loose Bridge Files**: Never create or leave single-file bridge re-exports alongside domain directories; all modules must export and import through `index.js`.

## Testing

- `vitest`, target > 80% line coverage on `src/telegram/` and `src/ext/` (Success Criteria #6).
- Any new handler, filter, Bot API method, or persistence method needs a unit test before being considered done — write the test first (TDD), watch it fail, then implement.
- Test file layout mirrors `src/`: `src/ext/handlers.ts` → `tests/unit/ext/handlers.test.ts`. Cross-module flows (e.g. an update flowing through `Application` → handler group → `CallbackContext`) go in `tests/integration/`.
- Never let a unit test make a real HTTP call to Telegram. Use the "Custom HTTP Adapter" escape hatch (spec.md's Escape Hatches) to inject a fake `fetch` that returns canned Bot API responses — this is what makes `Bot` client methods deterministic to test.
- Tests that do need a live bot (the "Examples Run" success criterion, or true end-to-end checks) require a real token via a `TEST_BOT_TOKEN` env var and must be skipped automatically when it's unset — never make the default `vitest` run depend on network access or a real token.
- Cover the edge cases from spec.md's "Edge Cases" section explicitly (invalid token, concurrent polling+webhook, 429 `retry_after`, handler throw, restart with persisted conversation state, malformed update) — each one should map to at least one test, not just the happy path.

## Error handling & retry (spec.md's Error Handling Strategy + Edge Cases)

- Network errors on `Bot` HTTP calls: exponential backoff `1s, 2s, 4s, 8s`, capped at `30s`, only on `429`/`5xx`. Other status codes (4xx besides 429) are not retried — they mean the request itself is wrong.
- `429` specifically: read Telegram's `retry_after` field and wait at least that long, even if it's longer than the current backoff step would otherwise allow.
- Public methods reject with a typed error, not a bare `Error` or a silent `false`/`undefined` — e.g. a `TelegramApiError` carrying Telegram's `error_code` and `description` — so `@throws {@link TelegramApiError}` in the doc comment (NFR-4) is actually accurate, and callers can `instanceof`-check instead of parsing a message string.
- A handler throwing inside `handleUpdate` must not stop other handler groups from running; catch at the dispatch loop, route to `addErrorHandler` callbacks, and log — never let one bad handler take down `runPolling`/`runWebhook`.
- Unhandled promise rejections at the process level are logged and the process keeps running (a bot process staying up matters more than crash-fast semantics here).
- Fail fast (throw synchronously, don't silently coerce) on programmer errors — e.g. constructing a `CommandHandler` with an empty command string — since those are bugs in the bot code, not runtime conditions to recover from.

## Git & PR conventions

- One feature branch per FR/NFR or cohesive piece of work (e.g. `feat/fr4-handlers`, not one branch mixing handlers and persistence).
- Commit messages reference the requirement they implement, e.g. `feat(ext): add ConversationHandler (FR-4)`.
- Before opening a PR: `npm run build` (must typecheck clean under `strict`), `vitest` (must pass, coverage per Testing above), and — if the change touches an example bot's feature area — actually run that example against a test bot, not just unit tests, per NFR-4's "Example bots for each major feature."
- PR description states which FR/NFR/Success Criteria item(s) it satisfies, and calls out any spec.md/technical-context.md edit it required (per "Keeping this file honest" below).

## Versioning & release parity (node = go = python)

All three frameworks share ONE version number (currently `1.5.0`):

- **Node** — `packages/node/package.json`, published to npm as `telebot-ts` by semantic-release on pushes to `main`; tags are `vX.Y.Z`.
- **Go** — no embedded version; tags `packages/go/vX.Y.Z` are mirrored by `.github/workflows/release-pipeline.yml` with the same version as the node release (GitHub Releases only).
- **Python** — `packages/python/pyproject.toml` + `__version__` in `src/telebot_py/__init__.py`, published to PyPI as `telebot-py`; tags `packages/python/vX.Y.Z` are mirrored the same way and `python-release.yml` stamps the tag version into the package before building. PyPI publishing uses trusted publishing (OIDC): the release job must declare `environment: pypi`, matching the Environment name registered in the PyPI trusted publisher.

Rules: never bump one package without the others; never hand-push `packages/go/v*` or `packages/python/v*` tags ahead of the node release line; keep conventional-commit scopes per package (`feat(py)`, `fix(go)`, ...) so git-cliff release notes stay correct. Per-package details live in the `telebot-{node,go,python}-conventions` skills.

## How to actually build this project

The repo currently only has `spec.md` + `technical-context.md` — no `plan.md`/`tasks.md` yet. Don't start writing framework code straight from the spec; follow the speckit flow already set up for this repo:
1. `/speckit-plan` — turns spec.md + technical-context.md into an implementation plan.
2. `/speckit-tasks` — breaks the plan into a dependency-ordered `tasks.md`.
3. `/speckit-implement` — executes `tasks.md`, task by task.

The scaffold (`package.json`, `tsconfig.json`) already matches spec.md's decisions (ESM, `noUncheckedIndexedAccess`, `vitest`/`typedoc` devDependencies, `pino` as an optional peer dependency) — see TypeScript & module conventions above. If a future change to spec.md's NFR-1/NFR-2 makes that drift again, fix the scaffold before running step 1, not after.

## Keeping this file honest

This file describes decisions already made in `spec.md`/`technical-context.md`, not new ones. If you make a new cross-cutting decision (a new naming exception, a new allowed dependency, a new required doc tag), update `spec.md`/`technical-context.md` first, then reflect it here — don't let this file and the spec disagree.

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->
