---
name: telebot-go-conventions
description: Authoritative guide for adding new Bot API methods, Handlers, Filters, Scheduler RRule features, Storage Persistence drivers, or GoDoc docstrings to the Golang framework in packages/go. Use whenever developing, modifying, or reviewing code in packages/go.
---

# Telebot Golang Framework Conventions

## 1. Overview
`telebot-go` (located in `packages/go/`) is a zero-external-dependency, high-throughput native Telegram Bot framework for Go 1.24+.
When developing, refactoring, or adding new features to `packages/go/`, agents must strictly adhere to idiomatic Go package design, flattened domain organization, Go standard library reliance, GoDoc comments, and unit test coverage.

---

## 2. Naming Conventions & Package Layout

| Kind | Rule | Example |
|---|---|---|
| **Exported Methods / Functions** | `PascalCase` | `SendMessage`, `GetMe`, `BanChatMember`, `RunOnce` |
| **Exported Structs & Types** | `PascalCase` | `Bot`, `Context`, `Router`, `InlineKeyboard`, `Message` |
| **Struct Fields (JSON Tags)** | `PascalCase` with explicit `json:"snake_case"` tag | `ChatID int64 ` `json:"chat_id"` |
| **Package Layout** | Flattened domain files in single package | `pkg/bot/*.go`, `pkg/types/*.go`, `pkg/routing/*.go` |
| **File Length Constraint** | Strictly `< 500` lines per file | Range: 30–250 lines |
| **Zero Runtime Dependencies** | 100% Go Standard Library | `net/http`, `encoding/json`, `context`, `sync`, `time`, `os` |

---

## 3. Package Architecture & Responsibilities

```
packages/go/pkg/
├── bot/             # HTTP Client, Bot API methods, Webhook Server
│   ├── bot.go       # Core Bot client, request serialization, retry
│   ├── messages.go  # Basic & media messaging methods
│   ├── chats.go     # Chat moderation & membership methods
│   ├── topics.go    # Forum topics & profile methods
│   ├── stickers.go  # Sticker set management
│   ├── payments.go  # Invoices & Telegram Stars
│   └── webhook.go   # Webhook HTTP server & handlers
├── types/           # Domain models and request options with JSON tags
├── routing/         # Router, Context, Middleware pipeline, and FSM
│   ├── router.go    # Route matching & update dispatch loop
│   ├── context.go   # Update context with Reply / Answer shortcuts
│   └── conversation.go # Finite-State Machine (ConversationHandler)
├── components/      # UI builders
│   ├── keyboard/    # Fluent InlineKeyboard and ReplyKeyboard
│   ├── menu/        # Nested interactive Menu system
│   └── pagination/  # Page navigation bar generator
├── scheduler/       # Task Scheduler & RFC 5545 recurrence
│   ├── scheduler.go # Goroutine-backed JobQueue
│   └── rrule/       # RFC 5545 RRule recurrence engine
├── storage/         # Session persistence (MemoryStorage, JSONStorage)
├── filters/         # Composable predicate filters (filters.And, filters.Or)
└── utils/           # Rich text formatting, rate limiters, validation
```

---

## 4. How to Add a New Bot API Method in Go

1. **Step 1: Define Options/Models in `packages/go/pkg/types/`**:
   - Add request options struct or model struct in the appropriate domain file (`messages.go`, `chats.go`, `payments.go`, `stickers.go`, `topics.go`, `business.go`).
   - Use explicit `json:"snake_case,omitempty"` tags on all fields.
2. **Step 2: Implement Method on `*Bot` in `packages/go/pkg/bot/`**:
   - Add method signature taking `ctx context.Context` as the first parameter.
   - Use `b.Request(ctx, "methodName", payload, &result)`.
3. **Step 3: Add Comprehensive GoDoc Comments**:
   - Provide summary, `Parameters:` list, `Returns:` list, and `Example:` snippet.
4. **Step 4: Add Unit Tests in `packages/go/pkg/bot/*_test.go`**:
   - Test with `httptest.NewServer` mock server to verify URL path, headers, and payload serialization.

---

## 5. How to Add Handlers, Filters & Middleware

1. **Register Handlers in `packages/go/pkg/routing/`**:
   - Use `router.Command(cmd, handler)`, `router.Text(pattern, handler)`, `router.CallbackQuery(data, handler)`, or `router.Handle(predicate, handler)`.
2. **Add Filters in `packages/go/pkg/filters/`**:
   - Define predicate functions `type Predicate func(u *types.Update) bool`.
   - Support composition via `filters.And`, `filters.Or`, `filters.Not`.
3. **Middlewares**:
   - Define `type MiddlewareFunc func(next HandlerFunc) HandlerFunc`.
   - Attach via `router.Use(middleware)`.

---

## 6. Mandatory Quality Gates for Go

Before considering any Go feature, bug fix, or refactor complete, execute:
1. `npm run test:go` (or `cd packages/go && go test -v -race ./...`) → 100% Go unit tests pass.
2. `npm run build:go` (or `cd packages/go && go build ./...`) → All Go packages compile cleanly.
3. `npm run format:check` → Formatting check across all `.go` files.
