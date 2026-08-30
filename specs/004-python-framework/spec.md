# Feature Specification: Python Implementation of the Telegram Bot Framework

**Feature Branch**: `004-python-framework`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "Python implementation of the Telegram bot framework in packages/python — third language implementation alongside packages/node (TypeScript) and packages/go (Go). Async-first (asyncio), mirrors python-telegram-bot API in native snake_case, full module parity: bot client (with httpx as allowed runtime dependency), kernel (Application/Builder/Dispatcher/CallbackContext/polling/webhook/lifecycle), routing (handlers + ConversationHandler standard/linear/async), filters with native &|~ operators, scheduler (JobQueue + RRule), storage/persistence (Memory/JSON/SQLite via stdlib sqlite3), plugins + i18n, components, utils. Requirements: Python >= 3.10, pyproject.toml src layout, py.typed, mypy --strict, ruff, pytest + pytest-asyncio with >80% coverage and no real HTTP calls (MockTransport), Sphinx docs, TelegramApiError with exponential backoff 1s/2s/4s/8s cap 30s on 429/5xx honoring retry_after, examples for each major feature, PyPI release."

## Context

This repository already ships the same Telegram bot framework in two languages — TypeScript (`packages/node`) and Go (`packages/go`) — both mirroring python-telegram-bot (PTB)'s public API plus the framework's own extensions (plugin system, RRule scheduler, linear/async conversations, persistence drivers). This feature adds a **third, native Python implementation** (`packages/python`) so Python bot developers get the identical framework experience — same module layout, same behaviors, same extended features — in the language where PTB's API originates. Because Python natively provides operator overloading and snake_case, this implementation is the closest match to the upstream PTB API and serves as the canonical reference for API parity across all three languages.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Python developer builds a bot with a familiar PTB-style API (Priority: P1)

A Python bot author who knows python-telegram-bot writes an echo bot: build an `Application` with a bot token, register a `CommandHandler` for `/start` and a `MessageHandler` with a text filter, then run long polling. Updates flow through handler groups, the handler replies via `context.bot.send_message()`, and the bot runs until stopped. The code looks essentially identical to the PTB equivalent.

**Why this priority**: This is the framework's core promise and the minimum viable slice — without a working bot client, application lifecycle, handler dispatch, and filters, nothing else has a foundation. Every other story depends on this one, and it alone already delivers a usable bot framework.

**Independent Test**: Can be fully tested by running the `echo_bot` example against a real test bot token (or a mocked transport offline): send `/start` and a text message, verify the bot replies correctly, and verify an invalid token produces a clear typed error rather than a crash or silent failure.

**Acceptance Scenarios**:

1. **Given** a valid bot token and a registered command handler, **When** a user sends `/start`, **Then** the handler executes and the bot sends the configured reply.
2. **Given** a text filter composed from two filters with `&`, **When** an update matching only one filter arrives, **Then** the handler is not invoked; when an update matches both, it is invoked.
3. **Given** an invalid bot token, **When** the application starts polling, **Then** it fails fast with a typed error identifying the authentication problem.
4. **Given** a handler that raises an exception while processing an update, **When** the error is raised, **Then** registered error handlers are notified and other handler groups continue processing subsequent updates.

---

### User Story 2 - Multi-step conversations that survive restarts (Priority: P2)

A bot author builds a multi-step flow (e.g., collecting name → age → confirmation) with `ConversationHandler`, choosing between the standard state-machine form, a linear step-by-step form, or a fully async-conversation form. Conversation state is persisted through a pluggable persistence backend (in-memory, JSON file, or SQLite), so a bot restart resumes conversations exactly where they left off.

**Why this priority**: Conversations with durable state are the framework's headline differentiator over bare bot clients and the most requested capability for real-world bots; they depend on the P1 foundation but deliver independent, demonstrable value.

**Independent Test**: Run the conversation example, start a conversation, stop and restart the bot mid-flow with SQLite persistence enabled, then continue the conversation and verify state was restored from disk.

**Acceptance Scenarios**:

1. **Given** a conversation in progress with SQLite persistence, **When** the bot process restarts, **Then** the same user can continue the conversation from the exact step they left off.
2. **Given** a linear conversation handler with ordered steps, **When** the user sends inputs in order, **Then** each step advances exactly once; **When** an input matches a fallback entry point, the conversation resets.
3. **Given** no persistence backend configured, **When** the bot restarts, **Then** conversation state defaults to in-memory and conversations start fresh (documented behavior, no crash).

---

### User Story 3 - Scheduled jobs, plugins, and ready-made components (Priority: P3)

A bot author schedules recurring and one-shot jobs (reminders, daily digests) via `JobQueue` with full RRule support, extends behavior through the plugin system (lifecycle hooks, namespaced state, ordering, removal), uses the built-in i18n plugin for translations, and composes inline menus and keyboards from the components module.

**Why this priority**: These capabilities complete feature parity with the TypeScript and Go implementations and are essential for non-trivial bots, but each builds on P1/P2 foundations and individually delivers less standalone value than the core bot loop or conversations.

**Independent Test**: Run the scheduler example and verify a job fires on its RRule schedule and can be cancelled; run the plugin example and verify response/error hooks fire in declared order and a plugin can be removed at runtime; run the i18n example and verify replies switch language per user.

**Acceptance Scenarios**:

1. **Given** a job scheduled with an RRule, **When** the schedule fires, **Then** the job callback runs with bot access; when the job is dropped, it never fires again.
2. **Given** two plugins registering the same hook with explicit ordering, **When** an update is processed, **Then** hooks run in declared order, and removing one plugin stops only its hooks.
3. **Given** the i18n plugin configured with two locales, **When** a user switches language, **Then** subsequent framework messages appear in the new language.

---

### User Story 4 - Production confidence: webhook mode, retries, docs, examples (Priority: P4)

An operator deploys a bot in webhook mode behind HTTPS, knows that transient Telegram outages and rate limits are handled automatically (exponential backoff, `retry_after` honored), and relies on generated API documentation plus a runnable example for every major feature to onboard quickly.

**Why this priority**: Production-readiness features matter for adoption but assume the framework already works (P1–P3); they harden and document what exists rather than adding new capability.

**Independent Test**: Start the webhook example against a local server and deliver a sample update via HTTP POST, verifying the handler runs; simulate a 429 response with `retry_after` via the mocked transport and verify the client waits at least that long before retrying.

**Acceptance Scenarios**:

1. **Given** the application running in webhook mode, **When** an update is POSTed to the webhook endpoint, **Then** the corresponding handler executes and the update is acknowledged.
2. **Given** both polling and webhook are started concurrently for the same bot, **Then** the framework rejects the second mode with a clear typed error rather than double-processing updates.
3. **Given** Telegram responds with 429 and `retry_after: 5`, **When** the client retries, **Then** it waits at least 5 seconds; on 5xx it backs off 1s, 2s, 4s, 8s capped at 30s; on other 4xx it fails immediately without retry.
4. **Given** a malformed update payload delivered to the webhook, **Then** the application logs/reports it and continues serving subsequent valid updates.

---

### Edge Cases

- Invalid or malformed bot token at startup → fail fast with a typed authentication error.
- Concurrent polling + webhook on the same application → explicit rejection, never silent double-processing.
- HTTP 429 with `retry_after` → wait at least `retry_after` even if longer than the current backoff step.
- A handler raising inside update processing → error routed to error handlers; other groups and the run loop keep running.
- Bot restart mid-conversation with persisted state → conversation resumes from persisted step.
- Malformed update JSON (truncated body, unknown fields) → skipped with a logged diagnostic, process continues.
- Process-level unhandled async errors → logged, bot keeps running.
- Programmer errors (e.g., registering a handler with an empty command string) → raise synchronously at registration time, not silently at runtime.

## Requirements *(mandatory)*

### Functional Requirements

**API & naming**

- **FR-001**: The framework MUST expose a public API mirroring python-telegram-bot's naming exactly: snake_case methods (`add_handler`, `send_message`, `run_polling`), snake_case data attributes (`context.user_data`, `context.chat_data`, `context.bot_data`, `context.job_queue`, `chat_id`, `message_id`, `first_name`), and unchanged class/filter constant names (`CommandHandler`, `filters.TEXT`, `filters.ChatType.PRIVATE`).
- **FR-002**: Filters MUST compose with native Python operators `&` (and), `|` (or), `~` (not).
- **FR-003**: The public API surface MUST be equivalent in capability to the TypeScript and Go implementations for every module listed in FR-004–FR-014; where behavior intentionally differs from PTB, it MUST be documented.

**Modules (parity with packages/node and packages/go)**

- **FR-004**: A Bot client MUST implement the Telegram Bot API methods supported by the sibling implementations, with a pluggable HTTP transport that can be replaced in tests.
- **FR-005**: An Application kernel MUST provide an application builder, update dispatcher, callback context, long-polling mode, webhook mode, and a lifecycle covering initialization, start, stop, and shutdown.
- **FR-006**: Handlers MUST include the handler set supported by the sibling implementations (command, message-with-filter, callback query, and other registered handler types) with group-based dispatch where lower-numbered groups run first and a handled update can block subsequent groups per PTB semantics.
- **FR-007**: A `ConversationHandler` MUST support the standard state-machine form, a linear step-by-step form, and an async-conversation form, each with entry points, per-state handlers, fallbacks, and timeouts where the sibling implementations support them.
- **FR-008**: A job scheduler MUST support one-shot, repeating, and interval jobs with full RRule feature parity with the sibling implementations, and jobs MUST be schedulable and cancellable at runtime.
- **FR-009**: Persistence MUST provide a base persistence contract plus in-memory, JSON-file, and SQLite backends with interchangeable drivers, storing conversation state, chat/user data, and bot data.
- **FR-010**: A plugin system MUST support registration with ordering, response and error hooks, namespaced plugin state, and runtime removal, plus the built-in i18n plugin.
- **FR-011**: Components MUST provide the menu and keyboard building capabilities present in the sibling implementations.

**Reliability**

- **FR-012**: Bot API calls MUST retry only on HTTP 429 and 5xx with exponential backoff (1s, 2s, 4s, 8s, capped at 30s); 429 responses MUST wait at least Telegram's `retry_after`; other 4xx responses MUST fail immediately without retry. All API failures MUST surface as a typed error carrying Telegram's `error_code` and `description`.
- **FR-013**: A handler raising during update processing MUST NOT stop other handler groups or the run loop; errors MUST be routed to registered error handlers and logged.
- **FR-014**: Programmer errors (empty command strings, invalid builder combinations) MUST raise synchronously at construction/registration time.

**Quality & delivery**

- **FR-015**: The package MUST support Python 3.10 and newer and be distributed as a typed package (complete type information shipped with the distribution).
- **FR-016**: Unit tests MUST achieve more than 80% line coverage of the framework source and MUST NOT perform real HTTP calls to Telegram; network behavior MUST be exercised through the pluggable transport with canned responses.
- **FR-017**: Tests requiring a live bot MUST be gated behind an opt-in environment variable and skipped automatically when absent; the default test run MUST pass offline.
- **FR-018**: API documentation MUST be generated from source docstrings, and one runnable example MUST exist for each major feature (echo bot, conversations, scheduler, plugins/i18n, webhook, persistence).
- **FR-019**: The package MUST be publishable to PyPI with an automated changelog consistent with the sibling packages' release practice.

### Key Entities

- **Application**: top-level runtime binding a Bot client, Dispatcher, optional JobQueue, persistence, and plugins; owns the run lifecycle (polling or webhook).
- **Bot**: Telegram API client performing HTTP calls with retry semantics and a pluggable transport.
- **Update / Telegram types**: inbound update and all Bot API data types, attributes in Telegram's snake_case field names.
- **Handler**: unit of update routing (filter criteria + callback), organized in ordered groups.
- **CallbackContext**: per-update carrier of `bot`, matched data, `user_data`, `chat_data`, `bot_data`, `job_queue`, and conversation state.
- **Conversation state**: persisted per-user/per-chat step plus arbitrary data, owned by a persistence backend.
- **Job / JobQueue**: scheduled work items driven by RRule/interval/one-shot schedules.
- **Persistence backend**: interchangeable storage driver (memory/JSON/SQLite) behind a common contract.
- **Plugin**: registered extension with hooks, namespaced state, ordering, and removable lifecycle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer familiar with python-telegram-bot ports an existing ~100-line PTB echo bot to this framework with no more than 5 lines changed and no behavioral surprises.
- **SC-002**: A new user gets a working echo bot running from installation in under 10 minutes following only the documented quickstart.
- **SC-003**: Automated test coverage of framework source exceeds 80% of lines, with 100% of the default test run passing without network access or credentials.
- **SC-004**: Every edge case listed above maps to at least one automated test, and the full suite reproduces each expected behavior.
- **SC-005**: After a forced process restart, an in-progress conversation resumes from the persisted step in 100% of automated restart tests.
- **SC-006**: Under simulated rate limiting (429) and server errors (5xx), no update-sending code path crashes; retries occur exactly per policy and honor `retry_after`, verified by tests with a mocked transport.
- **SC-007**: Feature parity audit against the TypeScript and Go implementations finds zero missing public modules for the listed feature set at v1.0 release.
- **SC-008**: Generated documentation covers 100% of public API entries, and every documented example runs successfully against a live test bot.

## Assumptions

- Python 3.10+ is the minimum supported version; older interpreters are out of scope.
- The implementation is built **from scratch in this repository** (matching how the TypeScript and Go implementations were built), using the vendored `python-telegram-bot/` source as the API reference rather than taking PTB as a runtime dependency.
- The user-approved dependency relaxation applies to this package only: `httpx` is the single required runtime dependency for HTTP transport; the zero-dependency rule of the root spec continues to apply to `packages/node`. Persistence uses Python's built-in SQLite module. The root `spec.md` NFR wording is scoped to each package so the Python package's dependency allowance is documented explicitly.
- RRule support is implemented in-house (matching the Go implementation) rather than taking `python-dateutil` as a runtime dependency. Performance libraries (`uvloop`, `orjson`) are explicitly out of scope for core and may only be offered later as opt-in extras.
- Async-first design: the public API is asynchronous; a synchronous facade is out of scope for v1.
- Versioning starts at 0.x during development, reaching 1.0 at the parity milestone (SC-007); versions are not required to track the sibling packages numerically.
- CI runs on recent interpreter versions (3.10 through the current stable) with lint, strict type checking, tests, and coverage gates before merge; publishing to PyPI is automated on release.
- The package import name and PyPI distribution name will be chosen during planning to avoid collisions with existing PyPI packages; this does not affect requirements above.
- Webhook mode requires the operator to supply TLS termination / a reachable HTTPS endpoint; certificate provisioning itself is out of scope.
