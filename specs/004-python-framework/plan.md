# Implementation Plan: Python Implementation of the Telegram Bot Framework

**Branch**: `004-python-framework` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-python-framework/spec.md`

## Summary

Add `packages/python` — a native, async-first Python implementation of the Telegram bot framework, the third language implementation alongside `packages/node` (`telebot-ts`) and `packages/go`. It mirrors the python-telegram-bot public API in native snake_case, with native `&`/`|`/`~` filter operators, and reaches full module parity with the siblings: Bot client over `httpx` (the single allowed runtime dependency), application kernel (builder/dispatcher/context/polling/webhook/lifecycle), handlers + ConversationHandler (standard/linear/async), composable filters, JobQueue with in-house RRule, persistence (memory/JSON/SQLite via stdlib), plugin system with i18n, and components (menu/keyboard). Quality gates: mypy --strict, ruff, pytest + pytest-asyncio with >80% coverage and zero real HTTP (httpx MockTransport), Sphinx docs from docstrings, examples per major feature, PyPI release.

## Technical Context

**Language/Version**: Python 3.10+ (develop and CI on 3.10, 3.11, 3.12, 3.13)

**Primary Dependencies**: `httpx` (runtime, sole required dependency — user-approved relaxation, scoped to this package). Dev-only: `pytest`, `pytest-asyncio`, `pytest-cov`, `ruff`, `mypy`, `sphinx`.

**Storage**: In-memory dict, JSON files, SQLite via stdlib `sqlite3` (persistence backends behind one driver contract)

**Testing**: `pytest` + `pytest-asyncio` + `pytest-cov`; httpx `MockTransport` injectable via the Bot client's transport seam (the framework's Custom HTTP Adapter escape hatch); live-bot tests gated by `TEST_BOT_TOKEN` env and auto-skipped when unset

**Target Platform**: Any platform with CPython 3.10+ (Linux/macOS/Windows); library consumed by bot processes

**Project Type**: Library (Python package), part of this monorepo at `packages/python`

**Performance Goals**: Handle 50+ updates/sec dispatch on a single event loop (comparable to the sibling implementations); long-poll latency dominated by Telegram's long-poll timeout, framework overhead negligible (<5ms dispatch per update)

**Constraints**: Async-only public API; no blocking calls inside the event loop (file/SQLite I/O via `asyncio.to_thread` or connection-per-operation isolation); retries exactly 1s/2s/4s/8s cap 30s on 429/5xx, honoring `retry_after`; default test suite fully offline

**Scale/Scope**: Full Bot API surface parity with siblings (messages, media, chats, topics, stickers, payments, inline, reactions, stories/gifts, business per `packages/go/pkg/bot` file split), ~12 handler types, 3 conversation forms, RRule scheduler, 3 persistence backends, plugin system + i18n, components (menu/keyboard/pagination/inline-query)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` contains only the unfilled template (no ratified principles). **Gate passes vacuously.** Note: if a constitution is ratified later, this plan's notable tensions to revisit are (a) the single runtime dependency `httpx` vs any future zero-dependency principle, and (b) in-house RRule vs a reuse principle.

AGENTS.md engineering rules adopted as de-facto gates:

| Rule | Status |
|------|--------|
| TDD: test first, watch fail, then implement | ✅ Planned per phase |
| Source files focused; complex domains in subfolders with `__init__.py` re-export | ✅ Planned layout below |
| Typed errors (`TelegramApiError` with `error_code`/`description`), never bare exceptions | ✅ FR-012 |
| Doc comments/docs generated from source (Sphinx + autodoc ↔ TypeDoc parity) | ✅ FR-018 |
| Coverage > 80%, no real HTTP in default test run | ✅ FR-016/FR-017 |
| Root spec NFR-1 zero-dep stays scoped to `packages/node`; Python allowance documented in spec Assumptions | ✅ Recorded; root spec.md wording edit listed in tasks phase |

## Project Structure

### Documentation (this feature)

```text
specs/004-python-framework/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (public API contract)
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
packages/python/
├── pyproject.toml               # PEP 621 metadata, build backend, tool config (ruff/mypy/pytest)
├── README.md
├── LICENSE                      # Same license as sibling packages
├── cliff.toml                   # git-cliff changelog config, mirroring packages/go
├── src/
│   └── telebot_py/
│       ├── __init__.py          # Public re-exports (Application, filters, ...)
│       ├── py.typed
│       ├── types/               # Bot API data types (snake_case, frozen dataclasses)
│       ├── bot/                 # Bot client: methods (split like Go: messages/chats/media/...), retry, transport seam
│       │   ├── client.py
│       │   ├── retry.py
│       │   ├── errors.py        # TelegramApiError, NetworkError, InvalidTokenError...
│       │   ├── messages.py / chats.py / media.py / edits.py / webhook.py / ...
│       │   └── __init__.py
│       ├── kernel/              # Application, ApplicationBuilder, Dispatcher, CallbackContext, polling, webhook server, lifecycle
│       ├── routing/             # handlers/ (base, command, message, callback_query, chat_member, payment, reaction, inline_query, business...)
│       │   ├── conversation.py        # standard ConversationHandler
│       │   ├── linear_conversation.py # linear form
│       │   └── async_conversation/    # async form subfolder
│       ├── filters/             # MessageFilter base, matchers, filters namespace (TEXT, ChatType.PRIVATE, ...)
│       ├── scheduler/           # JobQueue, Job
│       │   └── rrule/           # in-house RRule (parity with packages/go/pkg/scheduler/rrule)
│       ├── storage/             # BasePersistence, driver contract, memory.py, json.py, sqlite.py
│       ├── plugins/             # plugin manager, hooks, i18n
│       ├── components/          # menu/, keyboard/, pagination, inline_query
│       └── utils/
├── tests/
│   ├── unit/                    # mirrors src/ layout
│   ├── integration/             # cross-module flows (Application → groups → context), offline via MockTransport
│   └── conftest.py              # fake-transport fixtures, token-gated markers
├── examples/                    # echo_bot, conversation, scheduler, plugins_i18n, webhook, persistence
└── docs/                        # Sphinx conf + autodoc setup
```

**Structure Decision**: src layout under `packages/python` mirroring the module taxonomy of `packages/node/src` and `packages/go/pkg`; distribution name `telebot-py` (consistent with `telebot-ts`), import name `telebot_py` (see research.md — `telebot` collides with pyTelegramBotAPI's import alias). CI: add a Python job matrix to the existing `.github/workflows/ci.yml` plus a release workflow modeled on `go-release.yml`.

## Complexity Tracking

No constitution violations to justify. Two deliberate deviations from the root spec's defaults, both pre-approved and recorded in spec.md Assumptions:

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `httpx` as required runtime dependency | Python stdlib has no async HTTP client; async-first is core to the design | A hand-rolled asyncio HTTP/1.1 client duplicates httpx's edge-case handling (timeouts, pooling, redirects) for no user benefit; user approved |
| In-house RRule instead of `python-dateutil` | Keeps runtime deps at exactly one; parity with the Go implementation which also implements RRule in-house | `python-dateutil` would add a second dependency and diverge from the Go package's tested behavior |
