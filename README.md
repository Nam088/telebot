# telebot 🤖

> Monorepo for modern, zero-dependency, high-performance Telegram Bot Frameworks in **TypeScript / Node.js** and **Go (Golang)**.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)]()

---

## 📦 Packages

| Package | Language | Path | Description |
|---|---|---|---|
| [**`telebot-ts`**](./packages/node) | 🟢 TypeScript / Node.js 22+ | [`packages/node`](./packages/node) | Zero-dependency, type-safe Telegram Bot framework for Node.js. |
| [**`telebot-go`**](./packages/go) | 🐹 Golang 1.24+ | [`packages/go`](./packages/go) | High-throughput, zero-dependency native Telegram Bot framework for Go. |

---

## 🛠️ Monorepo Automation

This repository uses **npm workspaces** and a root **Makefile** to coordinate testing and building across both language stacks:

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
```

---

## 📄 License

MIT © [Nguyễn Văn Nam](https://github.com/Nam088)
