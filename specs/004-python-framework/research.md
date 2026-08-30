# Research: Python Implementation of the Telegram Bot Framework

**Feature**: `specs/004-python-framework` | **Date**: 2026-08-30

All NEEDS CLARIFICATION items are resolved; decisions below were informed by the repo's own implementations (`packages/node`, `packages/go`) and Python ecosystem standards.

---

## R1. Package naming (distribution + import)

**Decision**: PyPI distribution `telebot-py`; import name `telebot_py`.

**Rationale**:
- Brand consistency with the TypeScript distribution `telebot-ts` (v1.4.0) and Go module `github.com/Nam088/telebot`.
- The bare import name `telebot` is already occupied in the ecosystem: pyTelegramBotAPI installs under that alias. Shadowing it would confuse users who have both installed and poison search results.
- PEP 8: module names are short, lowercase, underscored — `telebot_py` fits; hyphens are invalid in import names anyway.
- PyPI name `telebot-py` must be verified as unclaimed before the first release (task in the release phase; fallback: `telebot-python`).

**Alternatives considered**: `telebot` (collision risk, above); `telegram-bot-framework` (verbose, no brand tie); fork-style `python-telebot` (implies relation to upstream PTB, which we mirror but don't fork).

---

## R2. HTTP transport: httpx and the injectable seam

**Decision**: Single `httpx.AsyncClient` owned by the `Bot` client; the client exposes a transport injection point accepting any `httpx.AsyncBaseTransport` (or full client).

**Rationale**:
- `httpx.MockTransport` lets unit tests return canned Bot API JSON with zero network — this is the exact requirement of the framework's "Custom HTTP Adapter" escape hatch and FR-016.
- httpx provides granular timeouts (connect/read/write/pool), connection pooling for long-lived polling bots, and multipart file uploads for media methods — all needed by a Bot API client.
- Injection at the transport level (rather than wrapping the whole client) keeps retry/backoff, error mapping, and serialization in framework code, so mocks test everything except the wire.

**Alternatives considered**: `aiohttp` (heavier, weaker typing, no built-in mock transport); `requests` + `asyncio.to_thread` (fake async, thread overhead); hand-rolled asyncio HTTP (rejected in plan.md Complexity Tracking).

---

## R3. Retry & error model parity

**Decision**: Mirror the sibling implementations exactly — exponential backoff `1s, 2s, 4s, 8s` capped at `30s`, retry only on HTTP 429/5xx; 429 waits `max(backoff_step, retry_after)`; other 4xx raise immediately. All Telegram error responses raise `TelegramApiError(error_code, description, method, parameters)`; transport-level failures raise `NetworkError`. Invalid token detected on first `getMe`-class call at startup raises `InvalidTokenError` (subclass of `TelegramApiError`) synchronously with respect to `run_polling()`/`run_webhook()` startup.

**Rationale**: FR-012 and AGENTS.md error-handling strategy; cross-language behavioral parity is a stated goal. `retry_after` and `parameters.retry_after` fields are read from the response body as in `packages/node/src/client/retry.ts`.

**Alternatives considered**: tenacity library for retries (adds dependency; the policy is too specific — Telegram `retry_after` semantics — to fit a generic decorator cleanly).

---

## R4. Webhook mode without extra dependencies

**Decision**: Implement the webhook HTTP endpoint on `asyncio.start_server` with a minimal HTTP/1.1 request parser (request line + headers + fixed-length body) — no ASGI server dependency.

**Rationale**:
- The webhook surface is tiny: one POST route, JSON body, 200 response. A full ASGI stack (uvicorn/starlette) would be the framework's heaviest dependency for the least code path.
- Precedent: `packages/node` serves webhooks with Node's built-in `http` module.
- TLS termination is explicitly the operator's responsibility (spec Assumptions); the server binds plain HTTP, optionally localhost-only behind a reverse proxy.
- The minimal parser is validated against chunked/oversized/malformed bodies with explicit 400 handling (edge case in spec).

**Alternatives considered**: `aiohttp` server (second runtime dep, rejected); requiring uvicorn as optional extra (kept as possible future extra, not v1).

---

## R5. Concurrency model & blocking I/O

**Decision**: Async-only public API. All `Bot` methods, handlers, hooks, and lifecycle callbacks are coroutines. Dispatcher processes updates concurrently via tasks with a configurable bound (mirrors PTB's `concurrent_updates`), ordered per group within an update. Blocking work (JSON file persistence, SQLite) is isolated: SQLite uses a dedicated connection owned by a single worker thread accessed via `asyncio.to_thread`-wrapped calls (or a serialized executor); JSON persistence uses `asyncio.to_thread` for file I/O.

**Rationale**: FR/assumption "async-first"; stdlib `sqlite3` is synchronous and connections are not thread-safe — a single worker thread serializes access safely without adding an async sqlite dependency. Event-loop purity keeps dispatch latency under the 5ms target.

**Alternatives considered**: `aiosqlite` (extra dep, rejected); opening a connection per call (contention and WAL lock churn under load).

---

## R6. RRule parity

**Decision**: Port the Go in-house RRule (`packages/go/pkg/scheduler/rrule/rrule.go` + `types.go`, ~100 lines of logic) rather than depend on `python-dateutil`. Supported features must match the Go implementation's test suite case-for-case (those tests become the Python test fixtures).

**Rationale**: Confirmed in repo: Go implements RRule in-house; spec Assumptions lock this in. Keeps runtime deps at one. The Go test file (`rrule_test.go`, `rrule_extra_test.go`) defines the exact feature surface — reuse it as the oracle.

**Alternatives considered**: `python-dateutil` (rejected — second dep + behavioral divergence risk); dateutil now, replace later (churn without benefit; the required surface is small per the Go code size).

---

## R7. Types layer: dataclasses vs TypedDict vs attrs/pydantic

**Decision**: Frozen `dataclasses` (with `__slots__`) for all Bot API types; `from_dict`/`to_dict` helpers generated by a small shared mixin (hand-written, no codegen step at install time); snake_case attributes exactly matching Telegram field names.

**Rationale**:
- FR-001 requires snake_case data attributes; frozen dataclasses give immutability parity with PTB's frozen types and Go's value types.
- No dependency (rules out attrs/pydantic); richer than TypedDict (behavior: nesting, validation hooks, `to_dict` for API payloads).
- Validation of required fields happens in `__post_init__` and at deserialize boundaries; unknown fields are preserved or ignored per Telegram's forward-compatibility guidance (malformed-update edge case).

**Alternatives considered**: `pydantic` (runtime dep + validation semantics differ from siblings); `TypedDict` (no behavior, weak runtime validation); `msgspec` (extra dep).

---

## R8. Naming-parity mapping

**Decision**:
- Methods → snake_case mirroring PTB/Telegram: `add_handler`, `send_message`, `run_polling`, `run_webhook`, `add_error_handler`, `run_once`/`run_repeating`/`run_daily` (JobQueue).
- Data attributes → snake_case Telegram fields: `context.user_data`, `chat_data`, `bot_data`, `context.job_queue`, `chat_id`, `message_id`, `first_name`.
- Classes/constants carried over unchanged: `CommandHandler`, `MessageHandler`, `CallbackQueryHandler`, `ConversationHandler`, `Application`, `ApplicationBuilder`, `JobQueue`, `filters.TEXT`, `filters.ChatType.PRIVATE`.
- Node's `.and()/.or()/.not()` filter combinators become native operators `&` `|` `~` (FR-002); the named methods are also kept as aliases for cross-language code-porting guides.

**Rationale**: FR-001/FR-003; PTB's vendored source in `python-telegram-bot/` is the canonical spelling reference (AGENTS.md source-of-truth rule).

---

## R9. Packaging, tooling, CI

**Decision**:
- `pyproject.toml` (PEP 621) with `hatchling` build backend; src layout; `py.typed` shipped; metadata mirrors the Go cliff.toml changelog workflow (`cliff.toml` copied/adapted from `packages/go`).
- Quality gates in CI (new Python job matrix in `.github/workflows/ci.yml`, versions 3.10–3.13): `ruff check` + `ruff format --check`, `mypy --strict` on `src/`, `pytest --cov` with >80% threshold failing below, offline-only default run.
- Docs: Sphinx + autodoc (`docs/`), built in a workflow modeled on `deploy-docs.yml`.
- Release: PyPI publish workflow modeled on `go-release.yml` (tag-driven, git-cliff changelog, trusted publishing).
- `TEST_BOT_TOKEN` env gates live tests (pytest marker `live`), auto-skipped when unset (FR-017).

**Rationale**: FR-015..FR-019; consistency with existing repo tooling (CI workflows listed above already exist for node/go).

**Alternatives considered**: setuptools backend (fine but hatchling has cleaner src-layout + version-from-tag defaults); poetry (lockfile opinion + extra tooling, not used elsewhere in repo); tox (CI matrix covers interpreter versions; tox adds little here).

---

## R10. Parity scope baseline

**Decision**: The method/handler/type surface is defined by the siblings, inventoried from: `packages/go/pkg/bot/*.go` file split (messages, chats, chat_management, members, edits, files, media, stickers, payments, games, inline, invite_links, reactions, profile, stories_gifts, topics, webhook, bulk) and `packages/node/src/client/methods/*`, handler list from `packages/node/src/routing/handlers/*` (base, command, message, callback-query, chat-member, chat-request, payment, reaction, inline-query, business, type). A machine-checked parity table (method × {node, go, python}) will be generated during implementation and enforced in CI as the SC-007 audit artifact.

**Rationale**: FR-003, SC-007; prevents drift between the three implementations as new Bot API versions land (see `check-telegram-api-updates.yml`).

---

## Open items deferred (not blocking plan)

- Exact PyPI name availability check (`telebot-py`) — done at first release, fallback `telebot-python`.
- Whether examples live only in `packages/python/examples/` or are also mirrored in a top-level docs site — follow existing repo convention at build time.
