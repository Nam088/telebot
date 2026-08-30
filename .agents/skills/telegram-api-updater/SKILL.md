---
name: telegram-api-updater
description: Check open Telegram Bot API update issues on GitHub, take field and return types from the committed docs oracle (scripts/bot-api-oracle.json) instead of from memory or a sibling package, and execute the end-to-end implementation workflow for all three frameworks — TypeScript (packages/node), Golang (packages/go), and Python (packages/python) — (TDD, domain types, methods, unit tests, TypeDoc/GoDoc/Sphinx docstrings, fidelity + parity + coverage gates, and issue checklist resolution); follow telebot-node-conventions, telebot-go-conventions, and telebot-python-conventions respectively. Use whenever implementing newly released Telegram Bot API features, making a type carry its full docs row, resolving API update issues, or when `npm run audit:fidelity` or the parity audit is red.
---

# Telegram Bot API Issue Resolver & Monorepo Updater Skill

This skill provides an authoritative, end-to-end guide for an AI Agent to autonomously scan open Telegram API update issues, inspect official Telegram Bot API specs, implement types and methods across **`packages/node/` (TypeScript)**, **`packages/go/` (Golang)**, and **`packages/python/` (Python — see the telebot-python-conventions skill for its mixin/TDD conventions)**, verify Monorepo quality gates, and update GitHub Issues.

---

## 🔄 End-to-End Workflow Overview

```
1. Scan GitHub Issues  ──▶ 2. Checkout Feature Branch ──▶ 3. Read Bot API Docs
          │                                                       │
          ▼                                                       ▼
8. Commit, Push & PR   ◀── 7. Quality Gate Pass       ◀── 4, 5, 6. TDD (Node + Go + Python)
   (Do NOT push main)
```

---

## Phase 1: Discover & Select Open API Update Issues

1. **List all open Telegram API update issues:**
   ```bash
   gh issue list --label telegram-api-update --state open --repo Nam088/telebot
   ```
2. **Read the selected issue details:**
   ```bash
   gh issue view <issue_number> --repo Nam088/telebot
   ```
3. Extract the:
   - Target Version (e.g. `Bot API 10.3` -> branch tag `10.3`)
   - Release Date (e.g. `August 24, 2026`)
   - Checklist of Action Items (grouped by category: *Rich Messages, Ephemeral Messages, Reply Markup, General*, etc.)

---

## Phase 2: Checkout Feature Branch

**NEVER work directly on or push to `main` branch.** Always create and switch to an isolated feature branch before making changes:

```bash
# Ensure local main is up to date
git checkout main
git pull origin main

# Create and checkout feature branch
git checkout -b feat/api-<version>-support
# Example: git checkout -b feat/api-10.4-support
```

---

## Phase 3: Inspect Official Telegram Bot API Documentation

Before writing any type or method, **NEVER hallucinate or guess parameter names or types**. Ground truth is committed and readable offline — `scripts/bot-api-oracle.json`, machine-extracted from `core.telegram.org/bots/api` and ranked above every package's source in AGENTS.md's "Source of truth":

```bash
# every field of a type -> {wire_name: {type, optional}}
node -e "const o=require('./scripts/bot-api-oracle.json');console.log(JSON.stringify(o.types['ChatFullInfo'].fields,null,1))"
# every parameter of a method, same shape
node -e "const o=require('./scripts/bot-api-oracle.json');console.log(JSON.stringify(o.methods['sendPhoto'].params,null,1))"
# is this docs anchor real? (use it before writing any docs link)
node -e "const o=require('./scripts/bot-api-oracle.json');console.log(o.anchors.includes('sendphoto'))"
```

1. **Analyze exact fields** from those rows: wire names stay `snake_case` (`is_compact`, `business_connection_id`), and `optional: false` / `true` is the required/optional split — do not infer it from a sibling's `?` or `omitempty`.
2. **A modelled type must carry its whole docs row**, required *and* optional. In go and python declare every field **in that type itself**: `npm run audit:fidelity` resolves `extends` only for TypeScript, so an inherited field still reads as missing. A half-built type is worse than an absent one — it turns a silent backlog entry into a red gate.
3. **Rows with no fields are abstract unions** (`MessageOrigin`, `InputMedia`, `CallbackGame`) — not types to model. The audit ignores them for the same reason.
4. **A sibling package is a peer, not ground truth.** `packages/node` has been wrong repeatedly (it shipped no `ChatFullInfo` for its first releases even though `getChat` returns it; its `Chat` declares 43 fields where the docs list 8, which go gets exactly right). Read siblings for shape and convention, then confirm against the oracle — and take each method's **return type** from the docs, not from what a sibling happens to declare.
5. **If the oracle itself looks behind the live page**, run `npm run audit:docs` and report the version delta; say which source you used.

---

## Phase 4: Monorepo Target File Locations

| API Domain / Item Type | Node.js (`packages/node/`) | Golang (`packages/go/`) | Python (`packages/python/src/telebot_py/`) |
|---|---|---|---|
| **Messages / Media** | `src/client/methods/messages/`<br>`src/client/types/messages/` | `pkg/bot/messages.go`, `media.go`<br>`pkg/types/messages.go`, `send_media.go` | `bot/messages.py`, `media.py`, `rich_messages.py`<br>`types/message.py`, `input_media.py` |
| **Chat Management** | `src/client/methods/chats/`<br>`src/client/types/chats/` | `pkg/bot/chats.go`, `chat_management.go`<br>`pkg/types/chats.go`, `chat_opts.go` | `bot/chats.py`, `chat_management.py`<br>`types/chat.py`, `chat_full_info.py` |
| **Stickers / Emojis** | `src/client/methods/stickers.ts`<br>`src/client/types/stickers/` | `pkg/bot/stickers.go`<br>`pkg/types/stickers.go`, `sticker_opts.go` | `bot/stickers.py`<br>`types/stickers.py` |
| **Payments / Stars** | `src/client/methods/payments.ts`<br>`src/client/types/payments/` | `pkg/bot/payments.go`<br>`pkg/types/payments.go`, `payment_opts.go` | `bot/payments.py`, `paid_media.py`<br>`types/payments.py`, `paid_media.py` |
| **Topics / Profile** | `src/client/methods/topics/`<br>`src/client/types/topics/` | `pkg/bot/topics.go`, `profile.go`<br>`pkg/types/topics.go`, `profile_opts.go` | `bot/topics.py`, `profile.py`<br>`types/topics.py` |
| **Business / Stories** | `src/client/methods/business/`<br>`src/client/types/business/` | `pkg/bot/stories_gifts.go`<br>`pkg/types/business.go` | `bot/stories_gifts.py`, `gifts.py`, `business_account.py`<br>`types/business.py`, `stories.py` |
| **Routing / Updates** | `src/routing/handlers/` | `pkg/routing/updates.go` | `routing/handlers/`<br>`types/update.py` |
| **Filters** | `src/filters/matchers.ts` | `pkg/filters/matchers.go` | `filters/` |

Python composes domain **mixins** onto `Bot` in `bot/client.py` and re-exports every public name through `types/__init__.py` — a type that is not re-exported is invisible to callers and to the parity audit. These directories hold far more files than this table can list; `ls` the target directory and extend an existing module before creating a new one.

---

## Phase 5: Test-Driven Development (TDD) for All Three Frameworks

### 1. TypeScript Implementation (`packages/node/`)
- Write failing test in `packages/node/tests/unit/client/methods/`.
- Implement types in `packages/node/src/client/types/<domain>/` and method in `packages/node/src/client/methods/<domain>/`.
- Include exhaustive TypeDoc comments with `@param`, `@returns`, `@example`, `@throws`.

### 2. Golang Implementation (`packages/go/`)
- Write failing test in `packages/go/pkg/bot/*_test.go`.
- Implement struct in `packages/go/pkg/types/` and method on `*Bot` in `packages/go/pkg/bot/`.
- Include exhaustive GoDoc comments with Parameters, Returns, Example, and Error handling.

### 3. Python Implementation (`packages/python/`)
- Write failing test in `packages/python/tests/unit/bot/test_methods_<domain>.py` using the `bot_transport` MockTransport fixtures from `tests/conftest.py`. NO real HTTP ever.
- Implement the dataclass in `src/telebot_py/types/` and the coroutine on the matching mixin in `src/telebot_py/bot/`, then re-export through both `__init__.py` files.
- Mirror the node/go **behavior**, not their naming: python is native `snake_case` (`send_message`, `chat_id`) and PTB-compatible by design.
- Sphinx docstring with `Args:`/`Returns:`/`Raises:` and a closing `Telegram API: https://core.telegram.org/bots/api#<slug>` line.

---

## Phase 6: Brand Protection & Strict Constraints

1. **Zero External Runtime Dependencies**:
   - Node: Built-ins only (`fetch`, `http`, `crypto`, `sqlite`, etc.); `pino` stays the single optional peer dep.
   - Go: Standard library only (`net/http`, `encoding/json`, `context`, `sync`, `time`).
   - Python: `httpx` is the only runtime dependency; anything else requires amending spec 004's Assumptions first.
2. **File Length Ceiling**:
   - Every file in `packages/node/src/`, `packages/go/pkg/`, and `packages/python/src/telebot_py/` must remain strictly **< 500 lines** — this is enforced per package and is easy to breach while porting a large domain.
3. **Brand Protection** — scoped to the **node package's user-facing surface** (`packages/node`'s README, docs site, and public type/method doc comments): do not advertise it as a Python port or a migration path there. This is not a gag on cross-package references inside `AGENTS.md`, these skills, the `scripts/` audits, or the go/python packages, which all document the three implementations side by side.

---

## Phase 7: Mandatory Monorepo Quality Gate Checks

Run from the repo root; every gate must pass with **0 errors and 0 warnings**:

```bash
# 1. Format & Lint (Node.js)
npm run format:check
npm run lint

# 2. TypeCheck + Build (Node.js + Go)
npm run typecheck
npm run build

# 3. Node.js + Go + scripts tests
npm test

# 4. Coverage (>90% Node.js)
npm run test:coverage

# 5. TypeDoc Documentation (Node.js)
npm run docs

# 6. Bot API field fidelity — the ratchet (see AGENTS.md)
npm run audit:fidelity
```

```bash
# 7. Python gates (from packages/python/, offline, no TEST_BOT_TOKEN)
source .venv/bin/activate
python -m pytest -q
ruff check . && ruff format --check .
mypy --strict src
python scripts/parity_audit.py   # SC-007 method/handler parity table
```

**Do not run `npm run audit:baseline` to turn a red fidelity gate green.** A failure means the type you just wrote is incomplete or something regressed; fix the type. Re-baselining is reserved for a new Telegram API version and must be its own commit. Run `npm run audit:fidelity:strict` to see every gap, known or new.

---

## Phase 8: Commit, Push Branch & Create Pull Request

1. **Commit Changes following Conventional Commits:**
   One commit per package, with the package's own scope — a single `feat(api)` commit spanning three packages breaks the per-package git-cliff release notes (see AGENTS.md "Versioning & release parity"):
   ```bash
   git add packages/node && git commit -m "feat(node): implement Bot API <version> <domain> (closes #<issue_number>)"
   git add packages/go    && git commit -m "feat(go): implement Bot API <version> <domain> (closes #<issue_number>)"
   git add packages/python && git commit -m "feat(py): implement Bot API <version> <domain> (closes #<issue_number>)"
   ```
   Stage named paths, never `git add .`, so unrelated local files cannot ride along.

2. **Push Feature Branch to Remote:**
   ```bash
   git push -u origin feat/api-<version>-support
   ```

3. **Create Pull Request using GitHub CLI (`gh pr create`):**
   ```bash
   gh pr create \
     --title "feat(api): Telegram Bot API <version> support" \
     --body "## 🚀 Telegram Bot API <version> Support

   Closes #<issue_number>

   ### 📋 Implemented Features
   - <Summary of implemented items for Node.js and Go>

   ### 🛡️ Quality Gates
   - [x] Node.js test suite + typecheck + build + docs (0 errors/warnings)
   - [x] Golang test suite (-race) + vet + gofmt
   - [x] Python pytest + ruff + mypy --strict + parity_audit
   - [x] `npm run audit:fidelity` — no drift versus the committed baseline
   - [x] Field/return types taken from `scripts/bot-api-oracle.json`, not from a sibling package

   State which FR/NFR/SC item(s) the change satisfies (AGENTS.md requires this), and call out any spec.md edit it required." \
     --base main \
     --head feat/api-<version>-support
   ```

4. **Update Issue with PR reference comment:**
   ```bash
   gh issue comment <issue_number> --body "Created PR for review: #<pr_number>. This issue will be closed automatically once the PR is merged." --repo Nam088/telebot
   ```
