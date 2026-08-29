# telebot-go 🐹

Zero-dependency, high-performance, idiomatic Telegram Bot Framework for Go.

## 🚀 Features

- **Zero External Runtime Dependencies**: Built 100% on the Go standard library (`net/http`, `encoding/json`, `context`, `sync`).
- **Idiomatic Concurrency**: Native Goroutine worker dispatching for high-throughput update processing.
- **Middleware & Filtering**: Chainable middlewares and composable filter predicates (`filters.And`, `filters.Or`, `filters.Not`).
- **JobQueue Scheduler**: Goroutine-backed background task runner for delayed (`RunOnce`) and periodic (`RunRepeating`) jobs.
- **Pluggable Storage**: Session and context persistence interface (`MemoryStorage`, Redis, SQL).

## 📦 Quick Start

```go
package main

import (
	"context"
	"log"
	"os"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/routing"
)

func main() {
	b := bot.NewBot(os.Getenv("BOT_TOKEN"))
	router := routing.NewRouter(b)

	router.Command("start", func(c *routing.Context) error {
		_, err := c.Reply("👋 Hello from telebot-go!")
		return err
	})

	log.Println("🤖 Bot is running...")
	if err := router.RunPolling(context.Background()); err != nil {
		log.Fatal(err)
	}
}
```

## 🧪 Testing

```bash
make test
```
