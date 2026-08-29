# telebot-go 🐹

> Zero-dependency, high-throughput, and idiomatic Telegram Bot Framework for Go.

[![Go Version](https://img.shields.io/badge/Go-1.24+-00ADD8?style=flat&logo=go)](https://go.dev/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Architecture & Package Layout](#-architecture--package-layout)
- [Core Concepts & Guides](#-core-concepts--guides)
  - [1. Update Routing & Commands](#1-update-routing--commands)
  - [2. Middlewares](#2-middlewares)
  - [3. Keyboards & Interactive Menus](#3-keyboards--interactive-menus)
  - [4. Multi-Step Conversations (FSM)](#4-multi-step-conversations-fsm)
  - [5. Task Scheduler & RRule (RFC 5545)](#5-task-scheduler--rrule-rfc-5545)
  - [6. Session Storage & Persistence](#6-session-storage--persistence)
  - [7. Production Webhooks](#7-production-webhooks)
- [Example Bots](#-example-bots)
- [Testing & Quality Gates](#-testing--quality-gates)
- [Parity with the Node Implementation](#-parity-with-the-node-implementation)

---

## 🌟 Overview

`telebot-go` is built from the ground up to deliver **C-like speed and minimal memory footprint (< 15MB RAM)** for building Telegram bots in Go.

It strictly adheres to a **Zero External Runtime Dependencies** policy—built 100% on the Go standard library (`net/http`, `encoding/json`, `context`, `sync`, `time`).

---

## 🚀 Key Features

- **Zero External Runtime Dependencies**: Pure Go standard library.
- **Idiomatic Concurrency**: Native Goroutine worker dispatching for high-throughput update processing.
- **Broad Telegram Bot API Coverage**: 110+ client methods spanning messaging, media & bulk operations, edits, reactions, chat management & invite links, forum topics, bot profile, files, inline mode, stickers, payments (invoices & Telegram Stars), games, stories & gifts, and webhooks.
- **Composable Filters**: Logical predicates (`filters.Text`, `filters.Command`, `filters.Private`, `filters.And`, `filters.Or`, `filters.Not`).
- **Interactive UI Components**:
  - Fluent `InlineKeyboard` builder.
  - Interactive nested `Menu` system with automatic Back navigation.
  - Page-based `Pagination` button bar.
- **Conversation State Machine (FSM)**: `ConversationHandler` with `EntryPoints`, `States`, and `Fallbacks`.
- **Task Scheduler (RFC 5545 RRule)**: Delayed (`RunOnce`), periodic (`RunRepeating`), and calendar-recurrence (`RunRRule`) job queue.
- **Pluggable Persistence**: `MemoryStorage` and atomic `JSONStorage`.
- **Production Webhook Server**: Built-in HTTP server with `X-Telegram-Bot-Api-Secret-Token` validation and graceful shutdown.

---

## 📦 Installation

```bash
go get github.com/Nam088/telebot/packages/go
```

---

## ⚡ Quick Start

```go
package main

import (
	"context"
	"log"
	"os"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/routing"
)

func main() {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		log.Fatal("BOT_TOKEN environment variable is required")
	}

	b := bot.NewBot(token)
	router := routing.NewRouter(b)

	// Command handler for /start
	router.Command("start", func(c *routing.Context) error {
		_, err := c.Reply("👋 Hello from telebot-go!")
		return err
	})

	// Text echo handler
	router.Text("", func(c *routing.Context) error {
		msg := c.Message()
		if msg != nil {
			_, err := c.Reply("You said: " + msg.Text)
			return err
		}
		return nil
	})

	log.Println("🤖 Bot started polling...")
	if err := router.RunPolling(context.Background()); err != nil {
		log.Fatalf("Polling error: %v", err)
	}
}
```

---

## 🏛️ Architecture & Package Layout

```
packages/go/
├── cmd/
│   ├── example/            # General overview example
│   ├── echobot/            # Minimal echo bot
│   ├── keyboardbot/        # Reply & inline keyboard builders
│   ├── inlinebot/          # Inline query results (Article/Photo builders)
│   ├── pollbot/            # Polls, quizzes, and poll-answer routing
│   ├── mediabot/           # Media methods + MarkdownV2 formatting utils
│   ├── menubot/            # Interactive menu bot
│   ├── conversationbot/    # Multi-step survey bot (FSM)
│   ├── webhookbot/         # Production webhook server bot
│   └── apidemo/            # Live API smoke-test harness (PASS/FAIL report)
├── pkg/
│   ├── types/              # Telegram Bot API models and request options
│   │   ├── common.go       # User, Chat, Response, TelegramError, File
│   │   ├── messages.go     # Message media, Poll, Location, SendOptions
│   │   ├── chats.go        # ChatMember, Permissions, InviteLinks
│   │   ├── stickers.go     # Sticker, StickerSet
│   │   ├── payments.go     # Invoice, LabeledPrice, SuccessfulPayment
│   │   ├── topics.go       # ForumTopic, BotCommand, BotProfile
│   │   ├── business.go     # BusinessConnection, Story, Game
│   │   └── ...             # Domain option structs (edits, bulk, reactions, ...)
│   ├── bot/                # HTTP client & Webhook server
│   │   ├── bot.go          # Client core, request execution, retry
│   │   ├── messages.go     # Basic messaging methods
│   │   ├── media.go        # Media & send-media-group methods
│   │   ├── bulk.go         # Bulk forward/copy/delete methods
│   │   ├── edits.go        # Message editing methods
│   │   ├── reactions.go    # Message reaction methods
│   │   ├── chats.go        # Chat administration methods
│   │   ├── members.go      # Membership & moderation methods
│   │   ├── chat_management.go # Chat settings & invite-link methods
│   │   ├── invite_links.go # Invite link CRUD methods
│   │   ├── topics.go       # Forum topic methods
│   │   ├── profile.go      # Bot profile/description methods
│   │   ├── files.go        # File download methods
│   │   ├── inline.go       # Inline mode methods
│   │   ├── stickers.go     # Sticker set management
│   │   ├── payments.go     # Invoices & Telegram Stars
│   │   ├── games.go        # Game methods
│   │   ├── stories_gifts.go # Stories & gifts methods
│   │   └── webhook.go      # Webhook HTTP server & handlers
│   ├── components/         # UI Builders
│   │   ├── keyboard/       # InlineKeyboard & ReplyKeyboard fluent builders
│   │   ├── menu/           # Interactive nested Menu system
│   │   ├── pagination/     # Pagination navigation builder
│   │   └── inlinequery/    # Inline query result builders (Article, Photo)
│   ├── routing/            # Router, Context, Middlewares & FSM
│   │   ├── router.go       # Route registry and update dispatcher
│   │   ├── context.go      # CallbackContext with reply shortcuts
│   │   ├── conversation.go # FSM ConversationHandler
│   │   └── updates.go      # Update dispatch helpers
│   ├── filters/            # Predicate matchers (Text, Command, Private, etc.)
│   ├── scheduler/          # Background tasks and RFC 5545 recurrence
│   │   ├── scheduler.go    # JobQueue (RunOnce, RunRepeating, RunRRule)
│   │   └── rrule/          # RFC 5545 Recurrence Engine
│   ├── storage/            # Data & Session Persistence
│   │   ├── storage.go      # Persistence interface & MemoryStorage
│   │   └── json.go         # File-based JSON storage
│   └── utils/              # Formatting, rate limiting & validation helpers
│       ├── formatting.go   # MarkdownV2 / HTML escaping & helpers
│       ├── ratelimit.go    # Token-bucket rate limiter
│       └── validation.go   # Token & WebApp init-data validation
├── Makefile
└── go.mod
```

---

## 📚 Core Concepts & Guides

### 1. Update Routing & Commands

The `routing.Router` matches incoming updates against registered filters and routes:

```go
// Match exact command (/help or /help@bot_name)
router.Command("help", func(c *routing.Context) error {
    _, err := c.Reply("ℹ️ Send any message to echo it back.")
    return err
})

// Match callback queries from inline buttons
router.CallbackQuery("action:approve", func(c *routing.Context) error {
    _, err := c.AnswerCallbackQuery("✅ Approved!", true)
    return err
})

// Match custom filter predicate
router.Handle(filters.And(filters.Private, filters.Text), func(c *routing.Context) error {
    log.Printf("Received private text message: %s", c.Message().Text)
    return nil
})
```

---

### 2. Middlewares

Middlewares wrap handler execution for logging, authentication, or rate limiting:

```go
router.Use(func(next routing.HandlerFunc) routing.HandlerFunc {
    return func(c *routing.Context) error {
        start := time.Now()
        user := c.User()
        name := "unknown"
        if user != nil {
            name = user.FirstName
        }
        
        log.Printf("[Update %d] from %s", c.Update().UpdateID, name)
        err := next(c)
        log.Printf("[Update %d] completed in %v", c.Update().UpdateID, time.Since(start))
        return err
    }
})
```

---

### 3. Keyboards & Interactive Menus

#### Inline Keyboard Builder
```go
import "github.com/Nam088/telebot/packages/go/pkg/components/keyboard"

kb := keyboard.NewInlineKeyboard().
    Data("Option 1", "opt:1").
    Data("Option 2", "opt:2").
    Row().
    URL("Documentation", "https://github.com/Nam088/telebot").
    Build()

c.Reply("Please choose an option:", func(o *types.SendMessageOptions) {
    o.ReplyMarkup = kb
})
```

#### Interactive Nested Menu
```go
import "github.com/Nam088/telebot/packages/go/pkg/components/menu"

mainMenu := menu.New("main", "🎛️ Main Control Panel")
settingsMenu := menu.New("settings", "⚙️ Settings Menu")

settingsMenu.TextButton("🔔 Notifications", "toggle_notif", func(c *routing.Context) error {
    _, err := c.AnswerCallbackQuery("Toggled notifications", false)
    return err
})

mainMenu.Submenu("⚙️ Settings", settingsMenu)
mainMenu.TextButton("ℹ️ Info", "info", func(c *routing.Context) error {
    _, err := c.AnswerCallbackQuery("telebot-go v1.0", true)
    return err
})

// Attach all menu handlers to the router
mainMenu.Register(router)
```

---

### 4. Multi-Step Conversations (FSM)

Build multi-step dialogues using `routing.ConversationHandler`:

```go
const (
    StateAskName = 1
    StateAskAge  = 2
)

conv := routing.NewConversationHandler("survey").
    AddEntryPoint(filters.Command, func(c *routing.Context) (int, error) {
        if c.Message().Text == "/survey" {
            c.Reply("What is your name?")
            return StateAskName, nil
        }
        return routing.ConversationEnd, nil
    }).
    AddState(StateAskName, filters.Text, func(c *routing.Context) (int, error) {
        name := c.Message().Text
        c.Reply(fmt.Sprintf("Nice to meet you %s! How old are you?", name))
        return StateAskAge, nil
    }).
    AddState(StateAskAge, filters.Text, func(c *routing.Context) (int, error) {
        c.Reply("Thank you! Survey completed.")
        return routing.ConversationEnd, nil
    })

conv.Register(router)
```

---

### 5. Task Scheduler & RRule (RFC 5545)

Execute delayed or recurring jobs using goroutine timers:

```go
import (
    "github.com/Nam088/telebot/packages/go/pkg/scheduler"
    "github.com/Nam088/telebot/packages/go/pkg/scheduler/rrule"
)

queue := scheduler.NewJobQueue(context.Background(), b)

// Run once after 10 seconds
queue.RunOnce("reminder_1", 10*time.Second, func(ctx context.Context, b *bot.Bot) error {
    log.Println("⏰ 10 seconds elapsed!")
    return nil
})

// Run periodically every 5 minutes
queue.RunRepeating("metrics", 5*time.Minute, func(ctx context.Context, b *bot.Bot) error {
    log.Println("📊 Emitting metrics...")
    return nil
})

// Run based on RFC 5545 Recurrence Rule (e.g. Every 2 days at 09:00 UTC)
rule := rrule.New(rrule.Options{
    Freq:     rrule.Daily,
    Interval: 2,
    Dtstart:  time.Now(),
})
queue.RunRRule("daily_digest", rule, func(ctx context.Context, b *bot.Bot) error {
    log.Println("📰 Sending daily digest...")
    return nil
})
```

---

### 6. Session Storage & Persistence

```go
import "github.com/Nam088/telebot/packages/go/pkg/storage"

// Thread-safe in-memory storage
memStore := storage.NewMemoryStorage()

// File-based JSON persistence
jsonStore, err := storage.NewJSONStorage("./data/sessions.json")
if err != nil {
    log.Fatal(err)
}

// Store & retrieve user session data
ctx := context.Background()
_ = jsonStore.SetUserData(ctx, 123456, map[string]any{
    "preferred_lang": "vi",
    "visit_count":    42,
})

data, _ := jsonStore.GetUserData(ctx, 123456)
log.Printf("User visits: %v", data["visit_count"])
```

---

### 7. Production Webhooks

Deploy with HTTPS webhook and secret token authentication:

```go
func main() {
    b := bot.NewBot(os.Getenv("BOT_TOKEN"))
    router := routing.NewRouter(b)

    // Register routes...

    secretToken := os.Getenv("WEBHOOK_SECRET")
    webhookURL := "https://your-domain.com/webhook"

    // 1. Tell Telegram to send updates to your webhook
    _, err := b.SetWebhook(context.Background(), webhookURL, secretToken, 40)
    if err != nil {
        log.Fatalf("SetWebhook failed: %v", err)
    }

    // 2. Start HTTP webhook listener with graceful shutdown
    ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
    defer cancel()

    log.Println("🚀 Webhook listening on :8080/webhook")
    err = b.RunWebhook(ctx, ":8080", "/webhook", secretToken, func(u *types.Update) {
        _ = router.ProcessUpdate(ctx, u)
    })
    if err != nil {
        log.Fatalf("Webhook server error: %v", err)
    }
}
```

---

## 🤖 Example Bots

Every example lives in `cmd/<name>/`. Set the `BOT_TOKEN` environment variable, then run:

```bash
go run ./cmd/<name>
```

| Example | What it shows |
|---|---|
| `echobot` | Minimal router: `/start`, text echo |
| `example` | General overview: commands, keyboards, scheduler |
| `keyboardbot` | Reply keyboards (`NewReplyKeyboard`, one-time, placeholder) + inline keyboards + callbacks |
| `inlinebot` | Inline queries answered with `components/inlinequery` Article/Photo builders |
| `pollbot` | Regular & quiz polls, `stopPoll`, `Router.Poll` / `Router.PollAnswer` routing |
| `mediabot` | Dice, location, venue, contact, albums, stickers, reactions, `utils` MarkdownV2 helpers |
| `menubot` | Nested interactive menu with pagination |
| `conversationbot` | Multi-step FSM conversation with per-user state |
| `webhookbot` | Production-style webhook server with secret token |
| `apidemo` | Live smoke test of ~50 Bot API methods with a PASS/FAIL report (`CHAT_ID` env for chat-scoped methods) |

## 🧪 Testing & Quality Gates

Run all Go unit tests:

```bash
cd packages/go
make test
```

Or from the Monorepo root:

```bash
npm run test:go
```

---

## 🔀 Parity with the Node Implementation

`telebot-go` targets feature parity with the Node/TypeScript framework in this
monorepo (`packages/node`, published as `telebot-ts`). The table below compares
the two implementations:

| Feature Area                | telebot-ts (Node)                                                    | telebot-go (Go)                                                              |
| --------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Bot API client methods      | Full coverage                                                        | Broad coverage (110+ methods; see Key Features)                              |
| Long polling                | `Application.runPolling`                                             | `Router.RunPolling`                                                          |
| Webhook server              | Built-in HTTP server, secret-token validation                        | Built-in HTTP server, secret-token validation                                |
| Update routing              | `Application` + handler classes (`CommandHandler`, `MessageHandler`, ...) | `Router` with filter-based routes (`Command`, `Text`, `CallbackQuery`, `Handle`) |
| Middlewares                 | `Application` middleware pipeline                                    | `Router.Use`                                                                 |
| Filters                     | Full PTB-mirrored catalog (`filters.TEXT`, `filters.ChatType.*`, ...) | Core predicates + media/entity matchers with `And` / `Or` / `Not`            |
| FSM conversations           | `ConversationHandler`                                                | `ConversationHandler`                                                        |
| Linear (async) conversations | `LinearConversation`                                                  | Not ported — use FSM `ConversationHandler`                                   |
| Keyboards, Menus, Pagination | `InlineKeyboard`, `ReplyKeyboard`, `Menu`, `Pagination`              | `keyboard`, `menu`, `pagination` components                                  |
| Inline query builders       | Inline query result builders                                          | `inlinequery` component (`Article`, `Photo`)                                 |
| Job queue                   | `JobQueue` (`RunOnce`, `RunRepeating`, `RunRRule`)                   | `scheduler.JobQueue` (`RunOnce`, `RunRepeating`, `RunRRule`)                 |
| RFC 5545 RRule engine       | ✔                                                                    | ✔ (`scheduler/rrule`)                                                        |
| Session persistence         | Memory, JSON file, **SQLite** (`node:sqlite`)                        | Memory, JSON file                                                            |
| Structured logging          | Optional `pino` integration                                          | Standard library `log`                                                       |
| Retry / rate-limit handling | Exponential backoff honoring `retry_after`                           | Exponential backoff honoring `retry_after`                                   |

### Not applicable to Go

- **SQLite persistence**: the Node `SqlitePersistence` relies on the built-in
  `node:sqlite` module, which has no Go counterpart. Go bots persist state with
  the file-based `storage.JSONStorage` (or implement the `storage.Persistence`
  interface for a custom backend).
- **NestJS module**: the Node framework ships a NestJS integration
  (module + decorators), a JavaScript-ecosystem concept that does not apply to
  Go. Go bots wire components directly via `routing.Router`.

---

## 📄 License

MIT © [Nguyễn Văn Nam](https://github.com/Nam088)
