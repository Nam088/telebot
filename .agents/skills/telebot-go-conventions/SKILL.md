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

The tree shows representative responsibilities, not an inventory: `pkg/bot/` holds ~32 files and `pkg/types/` ~50. `ls` the target package and extend an existing domain file before adding a new one (files stay < 500 lines).

---

## 4. How to Add a New Bot API Method in Go

1. **Step 1: Define Options/Models in `packages/go/pkg/types/`**:
   - Add the request options struct or model struct in the matching domain file (`messages.go`, `chats.go`, `chat_full_info.go`, `payments.go`, `stickers.go`, `topics.go`, `business.go`, `rich_blocks_received.go`, …). The directory holds ~50 files and outgrows any list — `ls pkg/types/` and extend an existing file before adding one.
   - Use explicit `json:"snake_case,omitempty"` tags on all fields.
   - **Fields come from `scripts/bot-api-oracle.json`, not from `packages/node`.** Node is a peer implementation that has been wrong repeatedly (its `Chat` declares 43 fields where the docs table lists 8, and go's declares exactly 8 — go is right here, node is not). Query the oracle offline:
     `node -e "const o=require('./scripts/bot-api-oracle.json');console.log(JSON.stringify(o.types['ChatFullInfo'].fields,null,1))"` → `{wire_name: {type, optional}}`.
   - Declare **every** field of that row, required *and optional*, **in the struct itself**. The fidelity audit resolves `extends` only for TypeScript, so an embedded struct contributes nothing to the comparison — go types stay flat and repeat their inherited docs fields. `npm run audit:fidelity` enforces this against the committed baseline.
   - `Integer` → `int64`. Return what the docs say: `getChat` returns **`ChatFullInfo`**, so prefer `GetChatFullInfo` (→ `*types.ChatFullInfo`, all 53 documented fields) for new call sites; the older `GetChat` decodes into the 8-field `*types.Chat` and therefore silently drops the rest of the response.
2. **Step 2: Implement Method on `*Bot` in `packages/go/pkg/bot/`**:
   - Add method signature taking `ctx context.Context` as the first parameter.
   - Use `b.Request(ctx, "methodName", payload, &result)`.
   - **A documented method argument counts as sendable only if it is enumerable**: the fidelity audit (`scripts/bot-api-params.mjs`) reads `json:"name"` tags on `types.XOptions`, keys in the `map[string]any` payload, or keys in an anonymous payload struct — every documented param of that method must appear in one of those shapes. An untyped payload makes the method *unmeasurable*, which the gate treats as a regression, not a shortcut.
3. **Step 3: Add Comprehensive GoDoc Comments**:
   - Provide summary, `Parameters:` list, `Returns:` list, and `Example:` snippet.
   - End the GoDoc block with `// Telegram API: https://core.telegram.org/bots/api#<slug>` for every documented method/type, where `<slug>` is the wire method name (from the `b.Request` literal) or type name, fully lowercased. The slug MUST exist in the oracle's anchor list — `node -e "const o=require('./scripts/bot-api-oracle.json');console.log(o.anchors.includes('sendmessage'))"` — never recalled from memory; fetch the live page only if you suspect the oracle is stale, then `npm run audit:docs`. Skip the line for framework extensions and non-API helpers.
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
3. `cd packages/go && go vet ./...` → no vet findings.
4. `npm run format:check` → Formatting check across all `.go` files.
5. `npm run audit:fidelity` → the docs field-fidelity ratchet (see AGENTS.md "Bot API docs oracle & fidelity gate"). Green means **no new drift** versus `scripts/bot-api-fidelity-baseline.json`, not "complete". Never run `npm run audit:baseline` to make a failure go away — fix the struct, and re-baseline only as its own deliberate commit when Telegram ships a new API version.

---

## 7. Version & Release Parity (node = go = python)

All three frameworks share ONE version (currently `1.5.0`). Go embeds no version: tags `packages/go/vX.Y.Z` are mirrored automatically by `.github/workflows/release-pipeline.yml` with the exact semantic-release version of the node release. Never create or push Go tags manually, and keep commit scopes Go-specific (`feat(go)`, `fix(go)`, ...) so git-cliff release notes stay correct. See AGENTS.md "Versioning & release parity".
