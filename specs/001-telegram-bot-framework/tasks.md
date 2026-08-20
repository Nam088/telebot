---

description: "Task list template for feature implementation"

---

# Tasks: Telegram Bot Framework for Node.js

**Input**: Design documents from `/specs/001-telegram-bot-framework/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md, AGENTS.md

**Tests**: NOT optional here — `AGENTS.md`'s Testing section requires a test written before each new handler/filter/Bot API/persistence method, so every story phase below includes its tests up front.

**Organization**: `spec.md` is written FR-by-FR (a framework spec), not as classic P1/P2/P3 product user stories. This plan maps FR groups onto priority-ordered "user stories" by what a developer can *do* once each phase ships — each one is an independently runnable, independently demoable increment (mapped to one or more of the 7 example bots):

| Story | Priority | What a developer can do after this ships | Demo |
|---|---|---|---|
| US1 | P1 (🎯 MVP) | Run a basic long-polling bot that replies to commands/text | `examples/echobot.ts` |
| US2 | P2 | Use inline keyboards, callback queries, polls, chat-member events, deep links — the full handler/filter/keyboard surface | `examples/inlinekeyboard.ts`, `pollbot.ts`, `chatmemberbot.ts`, `deeplinking.ts` |
| US3 | P3 | Build a stateful multi-step conversation whose data survives across updates (and, with a file/SQLite backend, restarts) | `examples/conversationbot.ts` |
| US4 | P4 | Schedule one-off and recurring jobs against the bot | `examples/timerbot.ts` |
| US5 | P5 | Run the bot in webhook mode in production, with full docs generated and every example verified against live Telegram | Success Criteria #5 |

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task in the same batch)
- **[Story]**: Which user story this task belongs to (US1-US5) — omitted for Setup/Foundational/Polish
- File paths are exact, per `plan.md`'s Project Structure

## Path Conventions

Single project (library), per `plan.md`: `src/telegram/`, `src/ext/`, `src/utils/`, top-level `examples/`, `tests/unit/`, `tests/integration/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization per `plan.md`'s Project Structure.

- [X] T001 Create the directory skeleton (`src/telegram/`, `src/ext/`, `src/utils/`, `examples/`, `tests/unit/telegram/`, `tests/unit/ext/`, `tests/integration/`) with placeholder `index.ts` barrel files per plan.md's Project Structure
- [X] T002 [P] Verify `package.json`/`tsconfig.json` still match `plan.md`'s Technical Context (ESM, Node 22+, `strict`+`noUncheckedIndexedAccess`, `vitest`/`typedoc` devDeps, `pino` as optional peer dep — already configured per AGENTS.md, this task is a confirmation, not a rewrite) in `package.json`, `tsconfig.json`
- [X] T003 [P] Configure coverage thresholds (80% lines on `src/telegram/`, `src/ext/`, per Success Criteria #6) in `vitest.config.ts`
- [X] T004 [P] Configure TypeDoc entry points and output directory (per NFR-4) in `typedoc.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure every user story below is built on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Define core Telegram Bot API types (`User`, `Chat`, `Message`, discriminated `Update`, `CallbackQuery`, `InlineQuery`, etc. — FR-1) and the `TelegramApiError` class (`error_code`, `description`, per contracts/bot-client.md) in `src/telegram/types.ts`
- [X] T006 Implement the `Bot` HTTP client core: constructor, generic request method, exponential backoff on 429/5xx honoring `retry_after` exactly, rejects with `TelegramApiError`, accepts a custom `fetch` for testing (research.md's Error handling entry; contracts/bot-client.md) in `src/telegram/bot.ts` (depends on T005)
- [X] T007 [P] Implement the `Update` wrapper with convenience getters in `src/telegram/update.ts` (depends on T005)
- [X] T008 [P] Implement multipart/form-data + fetch helpers (for `InputFile` uploads, FR-8) in `src/utils/http.ts`
- [X] T009 [P] Implement minimal internal validation helpers in `src/utils/validation.ts`
- [X] T010 [P] Implement the `BaseHandler` abstract class (`checkUpdate`/`handleUpdate`, per contracts/handlers.md) in `src/ext/handlers.ts` (depends on T005)
- [X] T011 [P] Implement `CallbackContext<UserData, ChatData, BotData>` (per data-model.md) in `src/ext/context.ts` (depends on T005)
- [X] T012 [P] Implement the `Persistence` interface and `MemoryPersistence` (per contracts/persistence.md) in `src/ext/persistence.ts` (depends on T005)
- [X] T013 Implement the `Application`/`ApplicationBuilder` skeleton — handler-group `Map`, dispatch loop (contracts/handlers.md's Dispatch contract), `addHandler`/`addErrorHandler` — in `src/ext/application.ts` (depends on T006, T010, T011, T012)
- [X] T014 Wire re-exports in `src/telegram/index.ts`, `src/ext/index.ts`, and `src/index.ts` (depends on T005-T013)

**Checkpoint**: Foundation ready — user stories below can now be built.

---

## Phase 3: User Story 1 - Basic polling bot (Priority: P1) 🎯 MVP

**Goal**: A developer can register a `CommandHandler`/`MessageHandler`, run `runPolling()`, and get a reply — the smallest end-to-end slice of the Primary Scenario.

**Independent Test**: `BOT_TOKEN=... npm run dev:echo`, message the bot from Telegram, see it echo back (quickstart.md step 5).

### Tests for User Story 1 ⚠️ write first, confirm they fail before implementing

- [X] T015 [P] [US1] Unit test for `Bot` client core — fake-`fetch` injection, retry/backoff, `TelegramApiError` rejection — in `tests/unit/telegram/bot.test.ts`
- [X] T016 [P] [US1] Unit test for `CommandHandler`/`MessageHandler` `checkUpdate`/`handleUpdate` in `tests/unit/ext/handlers.test.ts`
- [X] T017 [P] [US1] Unit test for `filters.TEXT`/`filters.COMMAND` and `.and()`/`.or()`/`.not()` combinators in `tests/unit/ext/filters.test.ts`
- [X] T018 [P] [US1] Integration test for `Application` handler-group dispatch order (first match in group wins, other groups still run) in `tests/integration/dispatch.test.ts`

### Implementation for User Story 1

- [X] T019 [P] [US1] Implement `CommandHandler`, `MessageHandler` in `src/ext/handlers.ts` (depends on T010)
- [X] T020 [P] [US1] Implement `filters.TEXT`, `filters.COMMAND`, `.and()`/`.or()`/`.not()` in `src/ext/filters.ts` (depends on T005)
- [X] T021 [US1] Implement `Bot.getMe`, `Bot.sendMessage`, `Bot.getUpdates` in `src/telegram/bot.ts` (depends on T006)
- [X] T022 [US1] Implement `Application.runPolling` (offset tracking, `allowed_updates`, `drop_pending_updates`) in `src/ext/application.ts` (depends on T013, T021)
- [X] T023 [US1] Write `examples/echobot.ts` (depends on T019, T020, T022)

**Checkpoint**: User Story 1 fully functional and independently testable — this is the MVP.

---

## Phase 4: User Story 2 - Full handler/filter/keyboard surface (Priority: P2)

**Goal**: A developer can use every remaining handler and filter from FR-4/FR-5 and send keyboards/media from FR-8 — matching PTB's interactive-bot feature set.

**Independent Test**: run `dev:keyboard`, `dev:poll`, `dev:chatmember`, `dev:deeplink`; tap an inline button, vote in a poll, join/leave a chat, open a deep link — each produces the expected handler call.

### Tests for User Story 2
- [X] T024 [P] [US2] Unit tests for `CallbackQueryHandler`, `InlineQueryHandler`, `ChosenInlineResultHandler`, `PollAnswerHandler`, `ChatMemberHandler`, `TypeHandler` in `tests/unit/ext/handlers.test.ts` *(Assignee: Agent / Subagent)*
- [X] T025 [P] [US2] Unit tests for the remaining filter constants, `ChatType`/`StatusUpdate` namespaces, and `Regex`/`Custom` factories (including `context.matches` population) in `tests/unit/ext/filters.test.ts` *(Assignee: Agent / Subagent)*
- [X] T026 [P] [US2] Unit tests for keyboards and `InputMedia*` builders in `tests/unit/ext/keyboards.test.ts` *(Assignee: Agent / Subagent)*

### Implementation for User Story 2
- [X] T027 [P] [US2] Implement `CallbackQueryHandler`, `InlineQueryHandler`, `ChosenInlineResultHandler`, `PollAnswerHandler`, `ChatMemberHandler`, `TypeHandler` in `src/ext/handlers.ts` (depends on T010) *(Assignee: Agent / Subagent)*
- [X] T028 [P] [US2] Implement the remaining filters, `filters.ChatType.*`, `filters.StatusUpdate.*`, `filters.Regex(...)`, `filters.Custom(...)` in `src/ext/filters.ts` (depends on T020) *(Assignee: Agent / Subagent)*
- [X] T029 [P] [US2] Implement `ReplyKeyboardMarkup`, `InlineKeyboardMarkup`, `ReplyKeyboardRemove`, `ForceReply`, `InputFile`, `InputMediaPhoto/Video/Animation/Audio/Document` in `src/ext/keyboards.ts` (depends on T008) *(Assignee: Agent / Subagent)*
- [X] T030 [US2] Implement the remaining Bot API methods (`send*` media methods, `answerCallbackQuery`, `editMessageText`, `answerInlineQuery`, chat-admin methods) in `src/telegram/bot.ts` (depends on T006, T008) *(Assignee: Agent / Subagent)*
- [X] T031 [P] [US2] Write `examples/inlinekeyboard.ts`, `examples/pollbot.ts`, `examples/chatmemberbot.ts`, `examples/deeplinking.ts` (depends on T027, T028, T029, T030) *(Assignee: Agent / Subagent)*


**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Stateful conversations & persistence (Priority: P3)

**Goal**: A developer can build a multi-step `ConversationHandler` bot whose `user_data`/`chat_data`/conversation state persist beyond `MemoryPersistence`'s process lifetime.

**Independent Test**: run `dev:conversation`, complete a multi-step flow; with `JsonFilePersistence` configured, restart the process and confirm the conversation resumes (spec.md Edge Cases).

### Tests for User Story 3

- [ ] T032 [P] [US3] Unit tests for `CallbackContext.user_data`/`chat_data`/`bot_data` population rules (including the "stays `undefined`, not `{}`, when no chat/user is resolvable" rule from data-model.md) in `tests/unit/ext/context.test.ts`
- [ ] T033 [P] [US3] Unit tests for `ConversationHandler` state transitions (`entry_points` → `states[current]` → `fallbacks`) in `tests/unit/ext/conversation.handler.test.ts`
- [ ] T034 [P] [US3] Shared persistence contract test suite (read-your-writes, missing-key defaults, `getJobs`/`setJobs` replace-not-merge — contracts/persistence.md) run against `MemoryPersistence`, `JsonFilePersistence`, `SqlitePersistence` in `tests/unit/ext/persistence.test.ts`
- [ ] T035 [US3] Integration test: conversation state survives a simulated process restart with `JsonFilePersistence` in `tests/integration/persistence-restart.test.ts`

### Implementation for User Story 3

- [ ] T036 [US3] Implement `ConversationHandler` per contracts/handlers.md's ConversationHandler contract in `src/ext/conversation.handler.ts` (depends on T010, T012)
- [ ] T037 [P] [US3] Implement `JsonFilePersistence` in `src/ext/persistence.ts` (depends on T012)
- [ ] T038 [P] [US3] Implement `SqlitePersistence` via `node:sqlite` in `src/ext/persistence.ts` (depends on T012)
- [ ] T039 [US3] Wire `Application` to load/save `user_data`/`chat_data`/`bot_data` through the configured `Persistence` on each dispatch in `src/ext/application.ts` (depends on T013, T036, T037, T038)
- [ ] T040 [US3] Write `examples/conversationbot.ts` (depends on T036, T039)

**Checkpoint**: User Stories 1, 2, AND 3 all work independently.

---

## Phase 6: User Story 4 - Job Queue (Priority: P4)

**Goal**: A developer can schedule one-off and recurring jobs (FR-7) against the bot, optionally surviving restart via `Persistence.getJobs`/`setJobs`.

**Independent Test**: run `dev:timer`, confirm a scheduled job fires at the expected time.

### Tests for User Story 4

- [ ] T041 [P] [US4] Unit tests for `JobQueue.runOnce`/`runRepeating` scheduling and `Job.remove()` in `tests/unit/ext/job.queue.test.ts`
- [ ] T042 [P] [US4] Unit test for `PersistedJob` round-tripping through `Persistence.getJobs`/`setJobs` (`callback` re-attached by `name` on reload, per data-model.md) in `tests/unit/ext/persistence.test.ts`

### Implementation for User Story 4

- [ ] T043 [US4] Implement `Job`, `JobQueue`, `PersistedJob` in `src/ext/job.queue.ts` (depends on T011)
- [ ] T044 [US4] Wire `job_queue`/`job` onto `Application`/`CallbackContext` in `src/ext/application.ts`, `src/ext/context.ts` (depends on T043, T013)
- [ ] T045 [US4] Persist and reload jobs via `Persistence.getJobs`/`setJobs` on `Application` start/stop in `src/ext/application.ts` (depends on T043, T012)
- [ ] T046 [US4] Write `examples/timerbot.ts` (depends on T043, T044, T045)

**Checkpoint**: User Stories 1-4 all work independently.

---

## Phase 7: User Story 5 - Webhook mode & production readiness (Priority: P5)

**Goal**: The bot can run in webhook mode in production, every public export is documented, and all 7 examples are verified against live Telegram (Success Criteria #5).

**Independent Test**: run `runWebhook()` behind a real HTTPS endpoint with a secret token configured; confirm Telegram-delivered updates dispatch correctly and an unauthenticated request is rejected.

### Tests for User Story 5

- [ ] T047 [P] [US5] Unit tests for `Application.runWebhook` (built-in HTTP server, secret-token header validation, guard against running polling and webhook at once — spec.md Edge Cases) in `tests/unit/ext/application.test.ts`
- [ ] T048 [P] [US5] Edge-case tests: invalid/revoked token → 401 surfaced as a typed error; `429` `retry_after` honored exactly; malformed/partial update payload doesn't throw during dispatch — in `tests/unit/telegram/bot.test.ts` and `tests/unit/ext/application.test.ts`

### Implementation for User Story 5

- [ ] T049 [US5] Implement `Application.runWebhook` (built-in `http`/`https` server, secret token validation via `node:crypto`, single-mode guard) in `src/ext/application.ts` (depends on T022)
- [ ] T050 [P] [US5] Add TSDoc/TypeDoc comments (`@param`, one `@returns`, `@example`, `@throws {@link TelegramApiError}`, `@defaultValue`, `@remarks`, `@deprecated` where relevant — NFR-4/AGENTS.md) to every public export across `src/telegram/` and `src/ext/` (depends on T005-T046)
- [ ] T051 [US5] Confirm all 7 bots in `examples/` run against a live test bot per `specs/001-telegram-bot-framework/quickstart.md` step 5 (depends on T023, T031, T040, T046, T049)
- [ ] T052 [US5] Run `npm run docs` and resolve any warnings in the generated TypeDoc output (depends on T050)
- [ ] T053 [US5] Write a PTB→Node migration guide referencing `AGENTS.md`'s Naming Conventions (NFR-4's "Clear migration guide from PTB") (depends on T005-T049)

**Checkpoint**: All 5 user stories independently functional — the full framework is usable end-to-end.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the Success Criteria that span every story.

- [ ] T054 [P] Verify >80% line coverage on `src/telegram/` and `src/ext/` via `npm run test:coverage` (Success Criteria #6)
- [ ] T055 [P] Verify `npm ls --prod` lists no required runtime dependencies declared in `package.json` (Success Criteria #4)
- [ ] T056 Time a reference-bot port from PTB per Success Criteria #2, following `specs/001-telegram-bot-framework/quickstart.md` step 6
- [ ] T057 Run the full validation guide in `specs/001-telegram-bot-framework/quickstart.md` end-to-end (steps 1-6)
- [ ] T058 Reconcile `package.json`'s `dev:*` script paths (currently `src/examples/`) with the top-level `examples/` directory this plan uses (AGENTS.md's noted scaffold drift) in `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS every user story.
- **User Story 1 (Phase 3)**: Depends on Foundational only. This is the MVP — ship it before starting Phase 4+.
- **User Story 2 (Phase 4)**: Depends on Foundational only; reuses `BaseHandler`/`filters.ts` scaffolding US1 built, but doesn't require US1's specific handlers to exist.
- **User Story 3 (Phase 5)**: Depends on Foundational only (specifically `Persistence`, `BaseHandler`).
- **User Story 4 (Phase 6)**: Depends on Foundational only (specifically `CallbackContext`, `Persistence`).
- **User Story 5 (Phase 7)**: Depends on US1's `runPolling`/dispatch groundwork (T022) for `runWebhook`, and on every prior story's implementation tasks for the documentation pass (T050) and the "all 7 examples" check (T051) — it is inherently the integration/hardening phase, not independent of the others the way US2-US4 are of each other.
- **Polish (Phase 8)**: Depends on all desired stories being complete.

### User Story Dependencies

- US1, US2, US3, US4 are mutually independent once Foundational is done — a team could staff all four in parallel.
- US5 depends on US1 (webhook reuses the dispatch loop) and, for its documentation/verification tasks specifically, on whichever of US2-US4 have shipped.

### Within Each User Story

- Tests are written first and must fail before implementation (AGENTS.md's TDD requirement).
- Types/interfaces before the classes that use them (e.g. T005 before T006).
- Bot client methods before the `Application` wiring that calls them.
- Story complete (checkpoint) before moving to the next priority, if working solo.

### Parallel Opportunities

- Setup: T002, T003, T004 in parallel (T001 first, since it creates the directories they may write into).
- Foundational: T005, T007, T008, T009, T010, T011, T012 in parallel once T005 lands (T006 and T013/T014 are the serialization points).
- Once Foundational completes, US1/US2/US3/US4 can proceed in parallel (different files: `handlers.ts` additions in US1 vs US2 do touch the same file — see note below).
- All tests marked `[P]` within a story phase can run in parallel.

**Same-file note**: `src/ext/handlers.ts` and `src/ext/filters.ts` accumulate additions across US1 and US2 (both stories add classes to the same file). Treat US1's handler/filter tasks (T019, T020) as landing before US2's (T027, T028) even though both are "independent" at the story level — this is a sequencing note for a single-file merge conflict, not a hard product dependency.

---

## Parallel Example: User Story 1

```bash
# Tests for User Story 1, launched together:
Task: "Unit test for Bot client core in tests/unit/telegram/bot.test.ts"
Task: "Unit test for CommandHandler/MessageHandler in tests/unit/ext/handlers.test.ts"
Task: "Unit test for filters.TEXT/COMMAND combinators in tests/unit/ext/filters.test.ts"

# Implementation, launched together once tests are red:
Task: "Implement CommandHandler, MessageHandler in src/ext/handlers.ts"
Task: "Implement filters.TEXT, filters.COMMAND, combinators in src/ext/filters.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run `examples/echobot.ts` against a live test bot (quickstart.md step 5).
5. This is a legitimate, shippable MVP of the framework — a developer can already port the simplest PTB bots.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → validate independently → MVP.
3. US2 → validate independently → richer interactions available.
4. US3 → validate independently → stateful bots available.
5. US4 → validate independently → scheduled jobs available.
6. US5 → validate → production-ready, fully documented, all examples verified live.
7. Polish → confirm every numbered Success Criterion in spec.md passes.

### Solo Developer Strategy

Given the single-file sequencing note above (`handlers.ts`/`filters.ts` shared across US1/US2), a solo implementer should follow priority order (US1 → US2 → US3 → US4 → US5) rather than interleaving, even though the stories are logically independent — this avoids merge friction within those two files.

---

## Notes

- `[P]` tasks touch different files and have no unfinished dependency in the same batch.
- `[Story]` labels trace each task back to the table at the top of this file.
- Every handler/filter/Bot API/persistence method gets its test written and failing before its implementation task (AGENTS.md).
- Commit after each task or logical group, referencing the FR it implements (AGENTS.md's Git & PR conventions).
- Stop at each checkpoint and validate that story independently before moving on.
- Avoid: vague tasks, unexplained same-file conflicts, and cross-story dependencies that would break a story's independence (US5 is the one deliberate exception, and it's called out above).
