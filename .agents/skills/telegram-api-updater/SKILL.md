---
name: telegram-api-updater
description: Check open Telegram Bot API update issues on GitHub, read official Bot API documentation, and execute the end-to-end implementation workflow for all three frameworks — TypeScript (packages/node), Golang (packages/go), and Python (packages/python) — (TDD, domain types, methods, unit tests, TypeDoc/GoDoc/Sphinx docstrings, and issue checklist resolution); follow telebot-node-conventions, telebot-go-conventions, and telebot-python-conventions respectively. Use whenever implementing newly released Telegram Bot API features or resolving API update issues.
---

# Telegram Bot API Issue Resolver & Monorepo Updater Skill

This skill provides an authoritative, end-to-end guide for an AI Agent to autonomously scan open Telegram API update issues, inspect official Telegram Bot API specs, implement types and methods across **`packages/node/` (TypeScript)**, **`packages/go/` (Golang)**, and **`packages/python/` (Python — see the telebot-python-conventions skill for its mixin/TDD conventions)**, verify Monorepo quality gates, and update GitHub Issues.

---

## 🔄 End-to-End Workflow Overview

```
1. Scan GitHub Issues  ──▶ 2. Checkout Feature Branch ──▶ 3. Read Bot API Docs
          │                                                       │
          ▼                                                       ▼
8. Commit, Push & PR   ◀── 7. Quality Gate Pass       ◀── 4, 5, 6. TDD (Node + Go)
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

Before writing any type or method, **NEVER hallucinate or guess parameter names or types**. Fetch ground truth directly:

1. **Read Changelog & Official Specs:**
   - Fetch section anchors from `https://core.telegram.org/bots/api#<type-or-method>` using tool `read_url_content` or Context7 MCP.
2. **Analyze Exact Fields:**
   - Field names (must remain in `snake_case`, e.g. `is_compact`, `can_send_welcome_messages`).
   - Required vs optional parameters.
   - Expected return types (e.g. `Promise<Message>`, `(*types.Message, error)`).

---

## Phase 4: Monorepo Target File Locations

| API Domain / Item Type | Node.js Location (`packages/node/`) | Golang Location (`packages/go/`) |
|---|---|---|
| **Messages / Media** | `src/client/methods/messages/`<br>`src/client/types/messages/` | `pkg/bot/messages.go`, `media.go`<br>`pkg/types/messages.go`, `send_media.go` |
| **Chat Management** | `src/client/methods/chats/`<br>`src/client/types/chats/` | `pkg/bot/chats.go`, `chat_management.go`<br>`pkg/types/chats.go`, `chat_opts.go` |
| **Stickers / Emojis** | `src/client/methods/stickers.ts`<br>`src/client/types/stickers/` | `pkg/bot/stickers.go`<br>`pkg/types/stickers.go`, `sticker_opts.go` |
| **Payments / Stars** | `src/client/methods/payments.ts`<br>`src/client/types/payments/` | `pkg/bot/payments.go`<br>`pkg/types/payments.go`, `payment_opts.go` |
| **Topics / Profile** | `src/client/methods/topics/`<br>`src/client/types/topics/` | `pkg/bot/topics.go`, `profile.go`<br>`pkg/types/topics.go`, `profile_opts.go` |
| **Business / Stories** | `src/client/methods/business/`<br>`src/client/types/business/` | `pkg/bot/stories_gifts.go`<br>`pkg/types/business.go` |
| **Routing / Updates** | `src/routing/handlers/` | `pkg/routing/updates.go` |
| **Filters** | `src/filters/matchers.ts` | `pkg/filters/matchers.go` |

---

## Phase 5: Test-Driven Development (TDD) for Both Languages

### 1. TypeScript Implementation (`packages/node/`)
- Write failing test in `packages/node/tests/unit/client/methods/`.
- Implement types in `packages/node/src/client/types/<domain>/` and method in `packages/node/src/client/methods/<domain>/`.
- Include exhaustive TypeDoc comments with `@param`, `@returns`, `@example`, `@throws`.

### 2. Golang Implementation (`packages/go/`)
- Write failing test in `packages/go/pkg/bot/*_test.go`.
- Implement struct in `packages/go/pkg/types/` and method on `*Bot` in `packages/go/pkg/bot/`.
- Include exhaustive GoDoc comments with Parameters, Returns, Example, and Error handling.

---

## Phase 6: Brand Protection & Strict Constraints

1. **Zero External Runtime Dependencies**:
   - Node: Built-ins only (`fetch`, `http`, `crypto`, `sqlite`, etc.).
   - Go: Standard library only (`net/http`, `encoding/json`, `context`, `sync`, `time`).
2. **File Length Ceiling**:
   - Every file in both `packages/node/src/` and `packages/go/pkg/` must remain strictly **< 500 lines**.
3. **Brand Protection**:
   - **NEVER** mention Python or migration in public documentation, comments, README, or types.

---

## Phase 7: Mandatory Monorepo Quality Gate Checks

Run and ensure all quality checks pass with **0 errors and 0 warnings**:

```bash
# 1. Format Check & Lint
npm run format:check
npm run lint

# 2. TypeCheck (Node.js)
npm run typecheck

# 3. Code Build (Node.js + Go)
npm run build

# 4. Unit & Integration Tests (Both Node.js and Go)
npm test

# 5. Coverage (>90% for Node.js)
npm run test:coverage

# 6. TypeDoc Documentation (Node.js)
npm run docs
```

---

## Phase 8: Commit, Push Branch & Create Pull Request

1. **Commit Changes following Conventional Commits:**
   ```bash
   git add .
   git commit -m "feat(api): implement Telegram Bot API <version> support for Node and Go (closes #<issue_number>)"
   ```

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
   - [x] Node.js Test Suite (100% pass)
   - [x] Golang Test Suite (100% pass)
   - [x] TypeScript & Go Builds (0 errors)
   - [x] TypeDoc & GoDoc Documentation (0 errors, 0 warnings)" \
     --base main \
     --head feat/api-<version>-support
   ```

4. **Update Issue with PR reference comment:**
   ```bash
   gh issue comment <issue_number> --body "Created PR for review: #<pr_number>. This issue will be closed automatically once the PR is merged." --repo Nam088/telebot
   ```
