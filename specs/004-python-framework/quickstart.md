# Quickstart & Validation Guide

**Feature**: `specs/004-python-framework` | **Date**: 2026-08-30

Runnable scenarios proving the framework works end-to-end. Prerequisites for all: Python ≥ 3.10, repo root at `telegram-bot-node/`. See [contracts/public-api.md](contracts/public-api.md) for the API surface and [data-model.md](data-model.md) for entities.

## 0. Developer setup

```bash
cd packages/python
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"        # editable install + dev tools
```

Quality gates (must all pass before any PR):

```bash
ruff check src tests && ruff format --check src tests
mypy --strict src
pytest --cov=telebot_py --cov-fail-under=80     # offline, no token needed
```

## 1. Offline validation (no bot token) — runs in CI

| # | Scenario | Command | Expected |
|---|---|---|---|
| V1 | Full unit+integration suite | `pytest` | 100% pass, zero network calls (MockTransport), coverage > 80% |
| V2 | Retry policy | `pytest tests/unit/bot/test_retry.py -k "rate_limit"` | 429 waits `retry_after`; backoff sequence 1,2,4,8 cap 30; 400 fails immediately |
| V3 | Handler error isolation | `pytest tests/integration/test_dispatch_errors.py` | raising handler → error handler called, other groups still run |
| V4 | Restart with persisted conversation | `pytest tests/integration/test_persistence_restart.py` | conversation resumes from persisted step (SC-005) |
| V5 | Concurrent polling+webhook rejection | `pytest tests/integration/test_lifecycle.py -k double_run` | typed error raised |
| V6 | Malformed update | `pytest tests/integration/test_webhook_malformed.py` | logged + skipped, server keeps serving |
| V7 | RRule parity vs Go fixtures | `pytest tests/unit/scheduler/test_rrule.py` | all Go test cases reproduced |

## 2. Live validation (requires a test bot)

Prereq: a bot token in `TEST_BOT_TOKEN` (from @BotFather). Without it, everything below auto-skips — that is expected behavior, not failure.

```bash
export TEST_BOT_TOKEN=123456:ABC...
```

| # | Scenario | Command | Expected |
|---|---|---|---|
| L1 | Echo bot (US1/P1) | `python examples/echo_bot.py` then send `/start` and text to the bot | greeting reply; text echoed; Ctrl+C shuts down cleanly |
| L2 | Conversation (US2/P2) | `python examples/conversation.py` | walk name→age→confirm; Ctrl+C mid-flow; restart; continue from same step |
| L3 | Scheduler (US3/P3) | `python examples/scheduler.py` | reminder fires on schedule; cancel stops it |
| L4 | Plugins + i18n | `python examples/plugins_i18n.py` | hook order observed; `/lang vi` switches reply language |
| L5 | Webhook (US4/P4) | expose local port (e.g. reverse proxy/ngrok), `python examples/webhook.py` | POSTed updates processed; bad payload returns 400, bot keeps running |
| L6 | Live integration suite | `TEST_BOT_TOKEN=... pytest -m live` | real API round-trips pass |

## 3. Porting proof (SC-001)

Take `examples/ptb_reference_echo.py` (a ~100-line PTB-style bot written against upstream python-telegram-bot, vendored reference in `python-telegram-bot/`) and run it against `telebot_py` changing **≤ 5 lines** (imports only). Both must behave identically against the same test bot.

## 4. Release validation (Phase 6)

```bash
python -m build && twine check dist/*      # packaging sanity
sphinx-build docs docs/_build -W           # docs build, warnings as errors
```

Then tag-driven PyPI publish (workflow modeled on `.github/workflows/go-release.yml`); verify `pip install telebot-py` + L1 from a clean venv.

## Completion = V1–V7 pass offline AND L1–L6 pass with token AND SC-007 parity audit shows zero missing modules.
