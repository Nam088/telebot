# telebot 🤖

> Unified Monorepo for modern, **Zero-Dependency**, high-performance Telegram Bot Frameworks in **TypeScript / Node.js** and **Go (Golang)**.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)]()
[![Telegram Bot API](https://img.shields.io/badge/Bot%20API-10.3%20Complete-blue?logo=telegram)]()

---

## 📦 Packages

| Package | Language | Path | Description |
|---|---|---|---|
| [**`telebot-ts`**](./packages/node) | 🟢 TypeScript / Node.js 22+ | [`packages/node`](./packages/node) | Zero-dependency, type-safe Telegram Bot framework for Node.js. |
| [**`telebot-go`**](./packages/go) | 🐹 Golang 1.24+ | [`packages/go`](./packages/go) | High-throughput, zero-dependency native Telegram Bot framework for Go. |

---

## ⚔️ Why `telebot`? (Comparison Matrix)

How does `telebot` compare against other major Telegram bot frameworks across the Node.js and Go ecosystems?

| Feature / Metric | 🏆 **`telebot` (Monorepo)** | 🟡 **GrammY** (Node) | 🔴 **Telegraf** (Node) | 🔵 **tucnak/telebot** (Go) | ⚪ **go-telegram-bot-api** (Go) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Runtime External Dependencies** | **`0` (Zero)** | 10+ packages | 15+ packages | Has 3rd-party deps | Low |
| **All-in-One Batteries Included** | ✅ **Built-in core** | ❌ Fragmented into 8+ plugins | ❌ Missing scheduler/menu | ❌ Missing scheduler/menu | ❌ Raw wrapper only |
| **Interactive Nested Menu (Auto Back 🔙)** | ✅ **Built-in** | ⚠️ Extra plugin required | ❌ No | ❌ No | ❌ No |
| **Task Scheduler (RFC 5545 RRule)** | ✅ **Built-in** | ❌ No | ❌ No | ❌ No | ❌ No |
| **Multi-Step FSM Conversations** | ✅ **Built-in (FSM + Linear)** | ⚠️ Extra plugin required | ⚠️ Outdated (`Scenes`) | ⚠️ Basic | ❌ Manual boilerplate |
| **Telegram Bot API 10.3 Coverage** | ✅ **100% (Stars, Business, Gifts)** | ⚠️ Slower update cycle | ⚠️ Lagging behind | ⚠️ Missing API 10.3 | ⚠️ Missing new types |
| **Unified Cross-Language DX** | ✅ **Node.js & Go parity** | ❌ JS/TS only | ❌ JS/TS only | ❌ Go only | ❌ Go only |
| **Memory Footprint / Cold Start** | ⚡ **< 10ms / < 15MB RAM** | Moderate | Slow | Low | Low |

---

## 🌟 Key Highlights & Advantages

### 1. 🛡️ 100% Zero External Dependencies
- **Security & Reliability**: Eliminates supply-chain vulnerabilities entirely.
- **Node.js**: Runs natively on Node.js 22+ built-ins (`fetch`, `node:sqlite`, `node:http`, `node:crypto`).
- **Go**: Runs 100% on the Go standard library (`net/http`, `encoding/json`, `context`, `sync`, `time`).

### 2. 🧰 Batteries-Included Without Fragmentation
No need to install 10 different auxiliary packages to build a production bot. Everything ships out of the box:
- **Interactive UI Components**: Nested Submenus with automatic Back button navigation, Pagination bars, and fluent Keyboard builders.
- **Multi-Step Dialogues**: Finite-State Machine (`ConversationHandler`) and async/await step-by-step linear wizards.
- **RFC 5545 Recurrence Engine**: Calendar-based scheduling (`RunRRule`), interval timers (`RunRepeating`), and delayed tasks (`RunOnce`).
- **Session Persistence**: Thread-safe Memory storage, atomic JSON file storage, and SQLite storage.
- **Production Webhook Server**: Built-in HTTP server with `X-Telegram-Bot-Api-Secret-Token` validation and graceful shutdown.

### 3. 🧠 Unified Mental Model Across Languages
Learn once, build anywhere. The mental model, routing patterns, filters, keyboard builders, and conversation handlers are completely identical between **TypeScript** and **Go**.

### 4. 🤖 AI Coding Agent Optimized
- Every source file is strictly modularized (**< 500 lines** per file).
- Exhaustive **TypeDoc** and **GoDoc** annotations with `@param`, `@returns`, and `@example` snippets, enabling AI assistants (Cursor, Copilot, Gemini) to generate hallucination-free code.

---

## 🛠️ Monorepo Automation

This repository uses **npm workspaces** and a root **Makefile** to coordinate development across both language stacks:

```bash
# Run all tests (Node.js Vitest + Go test)
npm test
# or
make test

# Build all packages
npm run build
# or
make build

# Lint & Format
npm run lint
npm run format:check

# Run Go Documentation Server locally
npm run docs:go
```

---

## 📄 License

MIT © [Nguyễn Văn Nam](https://github.com/Nam088)
