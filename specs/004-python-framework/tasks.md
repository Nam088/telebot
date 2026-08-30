---

description: "Task list for the Python implementation of the Telegram bot framework"
---

# Tasks: Python Implementation of the Telegram Bot Framework

**Input**: Design documents from `/specs/004-python-framework/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/public-api.md, quickstart.md

**Tests**: Included — TDD is mandatory per AGENTS.md ("write the test first, watch it fail, then implement") and spec FR-016/FR-017.

**Organization**: Tasks are grouped by user story (US1–US4 from spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Paths are relative to repository root; package code lives under `packages/python/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold `packages/python` per plan.md "Source Code" layout

- [x] T001 Create the package skeleton directories and empty `__init__.py` files per plan.md layout in packages/python/src/telebot_py/ (types, bot, kernel, routing, filters, scheduler, storage, plugins, components, utils) plus packages/python/src/telebot_py/py.typed and packages/python/tests/{unit,integration}/ mirroring
- [x] T002 Author packages/python/pyproject.toml — PEP 621 metadata, hatchling backend, src layout, distribution name `telebot-py`, `requires-python >= 3.10`, runtime dep `httpx`, optional `[dev]` extra (pytest, pytest-asyncio, pytest-cov, ruff, mypy, sphinx), and tool sections for ruff/mypy(strict, package scope)/pytest(asyncio_mode=auto, markers incl. `live`)/coverage(fail_under=80)
- [x] T003 [P] Add packages/python/LICENSE (same license text as packages/go/LICENSE), packages/python/cliff.toml (adapted from packages/go/cliff.toml), and packages/python/README.md skeleton in packages/python/
- [x] T004 [P] Add Python CI job matrix (3.10–3.13: ruff check, ruff format --check, mypy --strict, pytest --cov-fail-under=80) to .github/workflows/ci.yml and create .github/workflows/python-release.yml modeled on .github/workflows/go-release.yml (tag-driven PyPI publish, git-cliff changelog)
- [x] T005 Amend NFR-1 wording in specs/001-telegram-bot-framework/spec.md to scope the zero-dependency rule per package (node stays zero-dep; python allows httpx) and mirror the allowance in specs/001-telegram-bot-framework/technical-context.md per AGENTS.md "Keeping this file honest"
- [x] T006 Create packages/python/tests/conftest.py with the httpx MockTransport fake-Bot-API fixtures (canned ok/429-with-retry_after/5xx/4xx responses), the `live` marker auto-skip when TEST_BOT_TOKEN is unset, and shared update-factory helpers

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Telegram types, error taxonomy, and the HTTP/retry core every story builds on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Write failing unit tests for core Telegram types — snake_case attrs, frozen semantics, from_dict/to_dict round-trip, exactly-one payload rule on Update, tolerance of unknown fields — in packages/python/tests/unit/types/test_types.py
- [x] T008 [P] Write failing unit tests for the error taxonomy — TelegramApiError carries error_code/description/retry_after, InvalidTokenError is a TelegramApiError subclass, NetworkError for transport failures — in packages/python/tests/unit/bot/test_errors.py
- [x] T009 [P] Write failing unit tests for the retry policy — backoff sequence 1s/2s/4s/8s capped 30s on 5xx, 429 waits max(step, retry_after), 400/403 fail immediately without retry (quickstart V2) — in packages/python/tests/unit/bot/test_retry.py
- [x] T010 Implement core types with a shared serialization mixin in packages/python/src/telebot_py/types/ (user.py, chat.py, message.py, update.py, callback_query.py, base.py, __init__.py) making T007 pass
- [x] T011 Implement the error hierarchy in packages/python/src/telebot_py/bot/errors.py making T008 pass
- [x] T012 Implement the HTTP core — httpx.AsyncClient wrapper, injectable transport seam per contracts/public-api.md §3, retry/backoff policy, response envelope unwrap (ok/result/error_code/description) — in packages/python/src/telebot_py/bot/client.py and packages/python/src/telebot_py/bot/retry.py making T009 pass

**Checkpoint**: Foundation ready — types, errors, and transport core are green; user stories can begin

---

## Phase 3: User Story 1 - Python developer builds a bot with a familiar PTB-style API (Priority: P1) 🎯 MVP

**Goal**: A working echo bot — Application lifecycle, polling, handler dispatch with groups, filters, and core Bot methods — per spec.md User Story 1

**Independent Test**: Run packages/python/examples/echo_bot.py with TEST_BOT_TOKEN; `/start` and text messages get replies; offline suite for this story is green (quickstart L1, V1)

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US1] Write failing unit tests for filters — TEXT/PHOTO/ALL matchers, ChatType.PRIVATE/GROUP/SUPERGROUP/CHANNEL, Regex, User/Chat, algebra `&` `|` `~` plus `.and()/.or()/.not()` aliases, short-circuit — in packages/python/tests/unit/filters/test_filters.py
- [x] T014 [P] [US1] Write failing unit tests for handlers — CommandHandler (empty command raises ValueError per FR-014, command parsing, args), MessageHandler filter gating, CallbackQueryHandler pattern matching, group ordering and blocking semantics — in packages/python/tests/unit/routing/test_handlers.py
- [x] T015 [P] [US1] Write failing integration tests for the dispatch flow — update → ordered groups → CallbackContext population (user_data/chat_data/bot_data/matches/args), handler exception routed to error handlers while other groups keep running (quickstart V3), concurrent update processing — in packages/python/tests/integration/test_dispatch_flow.py
- [x] T016 [P] [US1] Write failing unit tests for core Bot methods via MockTransport — send_message returns Message, get_me returns User, get_updates parses Updates, Telegram error responses raise TelegramApiError with code/description, 401 on startup path raises InvalidTokenError — in packages/python/tests/unit/bot/test_bot_methods.py

### Implementation for User Story 1

- [x] T017 [P] [US1] Implement filters — MessageFilter base with `__and__/__or__/__invert__`, data_filter support, matchers, and the filters namespace constants — in packages/python/src/telebot_py/filters/ (base.py, matchers.py, __init__.py) making T013 pass
- [x] T018 [US1] Implement BaseHandler, CommandHandler, MessageHandler, CallbackQueryHandler in packages/python/src/telebot_py/routing/handlers/ (base.py, command.py, message.py, callback_query.py, __init__.py) making T014 pass (depends on T017)
- [x] T019 [US1] Implement CallbackContext in packages/python/src/telebot_py/kernel/context.py (depends on T010, T012)
- [x] T020 [US1] Implement Dispatcher — group-ordered dispatch, error handler routing, bounded concurrency — in packages/python/src/telebot_py/kernel/dispatcher.py making T015 pass (depends on T018, T019)
- [x] T021 [US1] Implement Application, ApplicationBuilder, and lifecycle state machine (STOPPED→INITIALIZING→RUNNING→STOPPING→STOPPED, builder validation errors at build()) in packages/python/src/telebot_py/kernel/ (app.py, builder.py, lifecycle.py, __init__.py) (depends on T020)
- [x] T022 [US1] Implement long polling — getUpdates loop, offset management, drop_pending_updates, allowed_updates, clean shutdown — in packages/python/src/telebot_py/kernel/polling.py and wire run_polling() in app.py (depends on T021)
- [x] T023 [US1] Implement the P1 Bot method surface split Go-style — messages.py (send_message, send_chat_action...), chats.py (get_chat...), edits.py, webhook.py (get/set/delete_webhook used by lifecycle) — in packages/python/src/telebot_py/bot/ making T016 pass (depends on T012)
- [x] T024 [US1] Add examples/echo_bot.py (live quickstart L1) and examples/ptb_reference_echo.py — a ~100-line PTB-shaped reference bot used later for the SC-001 porting proof — in packages/python/examples/ (depends on T022)

**Checkpoint**: User Story 1 fully functional — echo bot works live, US1 offline suite green; MVP is demoable

---

## Phase 4: User Story 2 - Multi-step conversations that survive restarts (Priority: P2)

**Goal**: ConversationHandler (standard/linear/async) with pluggable persistence so conversations survive bot restarts

**Independent Test**: Run packages/python/examples/conversation.py with SQLite persistence, walk the flow, restart mid-flow, continue from the persisted step (quickstart L2, V4)

### Tests for User Story 2 ⚠️

- [x] T025 [P] [US2] Write failing unit tests for the standard ConversationHandler — state transitions, entry_points/fallbacks, END, per_chat/per_user/per_message keys, timeout routing — in packages/python/tests/unit/routing/test_conversation.py
- [x] T026 [P] [US2] Write failing unit tests for LinearConversationHandler (ordered steps, fallback reset) and AsyncConversationHandler in packages/python/tests/unit/routing/test_linear_conversation.py and packages/python/tests/unit/routing/test_async_conversation.py
- [x] T027 [P] [US2] Write failing unit tests for persistence backends — BasePersistence contract conformance for Memory/JSON/SQLite (conversations, chat_data, user_data, bot_data, refresh/update pairs), JSON atomic write, SQLite worker-thread isolation and WAL — in packages/python/tests/unit/storage/test_persistence.py
- [x] T028 [P] [US2] Write failing integration test for restart-resume — conversation with SQLite persistence restored to the exact step after Application shutdown + re-initialize (quickstart V4, SC-005) — in packages/python/tests/integration/test_persistence_restart.py

### Implementation for User Story 2

- [x] T029 [US2] Implement standard ConversationHandler in packages/python/src/telebot_py/routing/conversation.py making T025 pass (depends on T018)
- [x] T030 [P] [US2] Implement LinearConversationHandler in packages/python/src/telebot_py/routing/linear_conversation.py making the T026 linear cases pass (depends on T029)
- [x] T031 [P] [US2] Implement AsyncConversationHandler in packages/python/src/telebot_py/routing/async_conversation/ (subfolder + __init__.py) making the T026 async cases pass (depends on T029)
- [x] T032 [US2] Implement BasePersistence contract, storage driver interface (parity with packages/node/src/storage/driver.ts), and MemoryPersistence in packages/python/src/telebot_py/storage/ (base.py, driver.py, memory.py, __init__.py) making the T027 memory cases pass
- [x] T033 [P] [US2] Implement JSONPersistence with atomic tmp+rename writes via asyncio.to_thread in packages/python/src/telebot_py/storage/json.py making the T027 JSON cases pass (depends on T032)
- [x] T034 [P] [US2] Implement SQLitePersistence (stdlib sqlite3, WAL, single worker thread access) in packages/python/src/telebot_py/storage/sqlite.py making the T027 SQLite cases pass (depends on T032)
- [x] T035 [US2] Wire persistence into the kernel — ApplicationBuilder.persistence(), data-dict load on initialize and flush on shutdown, conversation state restore for persistent ConversationHandlers — in packages/python/src/telebot_py/kernel/app.py and builder.py making T028 pass (depends on T032, T029)
- [x] T036 [US2] Add examples/conversation.py demonstrating all three conversation forms with SQLite persistence (quickstart L2) in packages/python/examples/ (depends on T035)

**Checkpoint**: User Stories 1 and 2 both work independently — conversations survive restarts

---

## Phase 5: User Story 3 - Scheduled jobs, plugins, and ready-made components (Priority: P3)

**Goal**: JobQueue with in-house RRule, plugin system with hooks + i18n, and menu/keyboard/pagination components

**Independent Test**: Run packages/python/examples/scheduler.py (job fires on RRule, cancel stops it) and examples/plugins_i18n.py (hook order, language switch) — quickstart L3, L4

### Tests for User Story 3 ⚠️

- [x] T037 [P] [US3] Write failing unit tests for RRule porting every case from packages/go/pkg/scheduler/rrule/rrule_test.go and rrule_extra_test.go (freq, interval, count, until, by_* rules) in packages/python/tests/unit/scheduler/test_rrule.py
- [x] T038 [P] [US3] Write failing unit tests for JobQueue — run_once/run_repeating/run_daily/run_custom firing, idempotent Job.cancel(), job data, runtime scheduling — in packages/python/tests/unit/scheduler/test_jobqueue.py
- [x] T039 [P] [US3] Write failing unit tests for the plugin system — registration ordering, response/error hook dispatch order, namespaced state, runtime removal, ordering-cycle typed error — and for I18nPlugin locale switching in packages/python/tests/unit/plugins/test_plugin_manager.py and packages/python/tests/unit/plugins/test_i18n.py
- [x] T040 [P] [US3] Write failing unit tests for components parity with packages/node/src/components — menu builder, keyboard builders, pagination, inline-query result helpers — in packages/python/tests/unit/components/test_components.py

### Implementation for User Story 3

- [x] T041 [US3] Implement in-house RRule (logic and field-for-field types ported from packages/go/pkg/scheduler/rrule/rrule.go and types.go) in packages/python/src/telebot_py/scheduler/rrule/ making T037 pass
- [x] T042 [US3] Implement Job and JobQueue (async timer loop bound to the event loop) in packages/python/src/telebot_py/scheduler/ (job.py, queue.py, __init__.py) making T038 pass (depends on T041)
- [x] T043 [US3] Wire JobQueue into the kernel — ApplicationBuilder.job_queue(), context.job_queue population, start/stop with lifecycle — in packages/python/src/telebot_py/kernel/app.py (depends on T042)
- [x] T044 [US3] Implement the plugin system — Plugin base, PluginManager with response/error hooks, ordering, namespaced state, removal — in packages/python/src/telebot_py/plugins/ (plugin.py, manager.py, __init__.py) and hook dispatch points in kernel/dispatcher.py, making T039 plugin cases pass (depends on T020)
- [x] T045 [P] [US3] Implement I18nPlugin (locales, per-user language) in packages/python/src/telebot_py/plugins/i18n.py making the T039 i18n cases pass (depends on T044)
- [x] T046 [US3] Implement components parity — menu/, keyboard/, pagination, inline_query helpers — in packages/python/src/telebot_py/components/ making T040 pass (depends on T010)
- [x] T047 [US3] Add examples/scheduler.py and examples/plugins_i18n.py (quickstart L3, L4) in packages/python/examples/ (depends on T043, T045)

**Checkpoint**: All three top-priority user stories independently functional

---

## Phase 6: User Story 4 - Production confidence: webhook mode, parity completion, docs, release (Priority: P4)

**Goal**: Webhook mode, remaining handler/method parity, malformed-input hardening, Sphinx docs, parity audit, PyPI-ready release

**Independent Test**: Deliver a POSTed update to examples/webhook.py and see the handler run; malformed payload returns 400 while the server keeps serving; docs build clean (quickstart L5, V5, V6)

### Tests for User Story 4 ⚠️

- [x] T048 [P] [US4] Write failing integration tests for webhook mode — POST update dispatch, secret_token verification, malformed/truncated/oversized bodies rejected with 400 while the server continues (quickstart V6), unknown paths 404 — in packages/python/tests/integration/test_webhook.py
- [x] T049 [P] [US4] Write failing integration tests for lifecycle hardening — concurrent polling+webhook rejected with typed error (quickstart V5), invalid token fail-fast on run_polling/run_webhook startup, process-level unhandled async errors logged without killing the run loop — in packages/python/tests/integration/test_lifecycle.py
- [x] T050 [P] [US4] Write failing unit tests for the extended handler set parity with packages/node/src/routing/handlers — ChatMemberHandler, ChatJoinRequestHandler, PreCheckoutQueryHandler, MessageReactionHandler, InlineQueryHandler, business handlers, TypeHandler — in packages/python/tests/unit/routing/test_handlers_extended.py
- [x] T051 [P] [US4] Write failing unit tests for the extended Bot method surface via MockTransport, grouped per Go file split (media, stickers, payments, games, inline, invite_links, reactions, profile, stories_gifts, topics, members, chat_management, files, bulk) — in packages/python/tests/unit/bot/test_methods_*.py mirroring the packages/go/pkg/bot/*_test.go cases

### Implementation for User Story 4

- [x] T052 [US4] Implement the webhook server on asyncio.start_server with minimal HTTP/1.1 parsing (research R4) and wire run_webhook() in packages/python/src/telebot_py/kernel/ (webhook.py, app.py) making T048 and the T049 double-run case pass
- [x] T053 [US4] Implement the extended handler set in packages/python/src/telebot_py/routing/handlers/ (chat_member.py, chat_request.py, payment.py, reaction.py, inline_query.py, business.py, type.py) making T050 pass (depends on T018)
- [x] T054 [P] [US4] Implement the extended Bot method surface split Go-style (media.py, stickers.py, payments.py, games.py, inline.py, invite_links.py, reactions.py, profile.py, stories_gifts.py, topics.py, members.py, chat_management.py, files.py, bulk.py) in packages/python/src/telebot_py/bot/ making T051 pass (depends on T012)
- [x] T055 [US4] Add the parity audit — a generated method × {node, go, python} table with a CI check enforcing zero gaps (SC-007, research R10) — in packages/python/scripts/parity_audit.py wired into .github/workflows/ci.yml (depends on T053, T054)
- [x] T056 [P] [US4] Add examples/webhook.py (quickstart L5) and examples/persistence.py demonstrating backend swap in packages/python/examples/ (depends on T052)
- [x] T057 [US4] Set up Sphinx docs with autodoc covering 100% of public API entries and build with warnings-as-errors in packages/python/docs/ (conf.py, index, per-module pages) per FR-018; wire a docs job modeled on .github/workflows/deploy-docs.yml
- [x] T058 [P] [US4] Verify PyPI name `telebot-py` availability (fallback `telebot-python` per research R1), finalize packages/python/cliff.toml changelog scope, and dry-run the .github/workflows/python-release.yml publish path with a test tag

**Checkpoint**: All four user stories independently functional; framework is feature-complete per FR-004..FR-014

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation against quickstart.md and success criteria, hardening, release readiness

- [x] T059 [P] Run the full offline validation matrix V1–V7 from specs/004-python-framework/quickstart.md and fix any gaps (coverage per module > 80%, zero network calls in default run)
- [ ] T060 [P] Run the live matrix L1–L6 with TEST_BOT_TOKEN (examples + `pytest -m live`) and fix failures; verify all live tests auto-skip cleanly when the token is absent (FR-017)
- [x] T061 Execute the SC-001 porting proof — run packages/python/examples/ptb_reference_echo.py against telebot_py changing ≤5 lines vs the vendored python-telegram-bot/ reference — and record the diff in the PR description
- [x] T062 Final quality gate — ruff check + ruff format --check, mypy --strict, pytest --cov --cov-fail-under=80 all green — and update packages/python/README.md with install/quickstart/API links
- [ ] T063 Publish checklist per specs/004-python-framework/quickstart.md §4 (python -m build, twine check, sphinx-build -W) and cut the first 0.1.0 tag once CI and audit (T055) are green

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — the MVP path
- **US2 (Phase 4)**: Depends on Foundational + US1's kernel/handlers (T018–T021)
- **US3 (Phase 5)**: Depends on Foundational + US1's kernel (T020–T021 for wiring)
- **US4 (Phase 6)**: Depends on US1 (kernel); parity handlers/methods can start once US1 handler/bot patterns exist
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Start after Foundational; no other story deps — MVP
- **US2 (P2)**: Builds on US1 routing/kernel; independently testable via restart test (V4)
- **US3 (P3)**: Builds on US1 kernel wiring; independently testable via scheduler/plugin examples (L3, L4)
- **US4 (P4)**: Builds on US1; independently testable via webhook/lifecycle tests (L5, V5, V6)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD per AGENTS.md)
- Types/filters before handlers; handlers before dispatcher; dispatcher before kernel wiring
- Story complete and checkpoint validated before moving to next priority

### Parallel Opportunities

- Phase 1: T003, T004 parallel with each other (T001, T002 sequential first)
- Phase 2: T007–T009 all parallel (test authoring); T010–T012 implementation follows
- US1: T013–T016 parallel test authoring; T017 filters parallel with kernel work starting T019
- US2: all four test tasks parallel; T030/T031 parallel after T029; T033/T034 parallel after T032
- US3: all four test tasks parallel; T045 after T044
- US4: T048–T051 parallel test authoring; T054 method groups parallelizable across developers
- Polish: T059/T060 parallel

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests together first (must fail):
Task: "Filters unit tests in packages/python/tests/unit/filters/test_filters.py"
Task: "Handlers unit tests in packages/python/tests/unit/routing/test_handlers.py"
Task: "Dispatch-flow integration tests in packages/python/tests/integration/test_dispatch_flow.py"
Task: "Core Bot method tests in packages/python/tests/unit/bot/test_bot_methods.py"

# Then implementation: filters (T017) can run in parallel with context (T019);
# handlers (T018) after filters; dispatcher (T020) after handlers+context;
# kernel (T021–T022) and Bot methods (T023) follow their respective deps.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T006)
2. Complete Phase 2: Foundational (T007–T012) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T013–T024)
4. **STOP and VALIDATE**: echo bot live test (L1) + offline suite green
5. MVP is demoable and publishable as 0.1.0

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → echo bot demo (MVP, tag 0.1.0)
3. US2 → conversations + persistence demo (tag 0.2.0)
4. US3 → scheduler + plugins demo (tag 0.3.0)
5. US4 → webhook + full parity + docs (tag 0.4.0)
6. Polish → SC-001 proof, parity audit green → 1.0.0 via python-release.yml

### Parallel Team Strategy

With multiple developers, after Foundational completes:

1. Developer A: US1 (kernel + routing core)
2. Developer B joins for US2 storage/persistence once US1 kernel lands
3. Developer C: US3 scheduler/plugins/components once US1 kernel lands
4. Developer D: US4 extended parity methods (T054 groups split per Go file split)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to spec.md user story for traceability
- Every behavior change lands with its failing test first (AGENTS.md TDD rule)
- Commit after each task or logical group; commit messages reference FRs (e.g. `feat(py): add retry policy (FR-012)`)
- Root spec NFR-1 amendment (T005) must land before any httpx import is committed
- Verify default `pytest` run stays fully offline before every PR
