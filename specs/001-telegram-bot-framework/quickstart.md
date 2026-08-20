# Quickstart: Validating the Telegram Bot Framework

Run-through to prove the feature works end-to-end, mapped to spec.md's Success Criteria. Doesn't duplicate method signatures (see `contracts/`) or entity fields (see `data-model.md`).

## Prerequisites

- Node.js 22+ (`node -v`)
- A Telegram bot token from [@BotFather](https://t.me/BotFather), exported as `TEST_BOT_TOKEN`, for the live-bot steps only (steps 1-3 below need no token)

## 1. Install and typecheck

```bash
npm install
npm run build
```

**Expected**: `tsc` completes with zero errors under `strict: true` + `noUncheckedIndexedAccess: true` (Success Criteria #3).

## 2. Zero-dependency check

```bash
npm ls --prod
```

**Expected**: no required runtime dependencies listed (the optional `pino` peer dependency is excluded from this check — see NFR-1) (Success Criteria #4).

## 3. Unit + integration tests

```bash
npm test
npm run test:coverage
```

**Expected**: all tests pass with no network access (unit tests use a fake `fetch`, per AGENTS.md's Testing section); coverage >80% on `src/telegram/` and `src/ext/` (Success Criteria #6). Every edge case in spec.md's Edge Cases section has at least one corresponding test.

## 4. Generate docs

```bash
npm run docs
```

**Expected**: `typedoc` runs with no warnings about malformed tags; the generated site documents every public export with a summary, `@param`/`@returns`, and at least one `@example` (NFR-4).

## 5. Run an example bot against a live bot (needs `TEST_BOT_TOKEN`)

```bash
BOT_TOKEN="$TEST_BOT_TOKEN" npm run dev:echo
```

Send the bot a message from Telegram.

**Expected**: the bot echoes the message back within a few seconds, demonstrating `runPolling`, `CommandHandler`/`MessageHandler` dispatch, and the `Bot` HTTP client all work against the real Telegram Bot API. Repeat for the other 6 examples (`dev:keyboard`, `dev:conversation`, `dev:timer`, `dev:poll`, `dev:chatmember`, `dev:deeplink`) to satisfy Success Criteria #5 ("All 7 example bots work against live Telegram API").

## 6. Migration-fidelity spot check

Pick a small real PTB snippet (e.g. from `python-telegram-bot/examples/`), port it by hand following `AGENTS.md`'s Naming Conventions, and confirm:
- Every PTB method call became its camelCase equivalent (`add_handler` → `addHandler`).
- Every PTB data property/options key kept its exact snake_case spelling (`context.user_data`, `options.allowed_updates`).

This is the manual analogue of Success Criteria #2 ("<2 hours to port a medium-complexity PTB bot") — a quick version to run per-PR, not a substitute for the full reference-bot timing exercise.
