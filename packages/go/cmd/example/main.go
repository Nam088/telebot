package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/scheduler"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatalf("Example bot error: %v", err)
	}
}

// apiBaseURL optionally overrides the Telegram Bot API endpoint for tests.
var apiBaseURL string

func newBot(token string) *bot.Bot {
	if apiBaseURL != "" {
		return bot.NewBot(token, bot.WithBaseURL(apiBaseURL))
	}
	return bot.NewBot(token)
}

// run wires the demonstration bot: middleware, command and callback handlers,
// and a recurring health-check job. It returns once setup completes.
func run(ctx context.Context) error {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		log.Println("BOT_TOKEN is not set. Using dummy client demonstration.")
		token = "123456:dummy-token"
	}

	b := newBot(token)
	router := buildRouter(b)
	queue := scheduler.NewJobQueue(ctx, b)

	// Background recurring task
	queue.RunRepeating("health_check", 1*time.Minute, func(jobCtx context.Context, b *bot.Bot) error {
		log.Println("[HealthCheck] Bot is running smoothly.")
		return nil
	})

	_ = router
	fmt.Println("🚀 telebot-go framework initialized successfully!")
	return nil
}

// buildRouter registers the demonstration middleware, command and callback
// handlers on a fresh Router.
func buildRouter(b *bot.Bot) *routing.Router {
	router := routing.NewRouter(b)

	// Middleware: Logging
	router.Use(func(next routing.HandlerFunc) routing.HandlerFunc {
		return func(c *routing.Context) error {
			start := time.Now()
			user := c.User()
			userName := "anonymous"
			if user != nil {
				userName = user.FirstName
			}
			log.Printf("[Update %d] from %s", c.Update().UpdateID, userName)
			err := next(c)
			log.Printf("[Update %d] completed in %v", c.Update().UpdateID, time.Since(start))
			return err
		}
	})

	// Command: /start
	router.Command("start", func(c *routing.Context) error {
		keyboard := &types.InlineKeyboardMarkup{
			InlineKeyboard: [][]types.InlineKeyboardButton{
				{
					{Text: "🌟 GitHub", URL: "https://github.com/Nam088/telebot"},
					{Text: "🔔 Click Me", CallbackData: "btn:click"},
				},
			},
		}

		_, err := c.Reply("👋 Hello from telebot-go! High performance native Telegram bot in Go.", func(o *types.SendMessageOptions) {
			o.ReplyMarkup = keyboard
		})
		return err
	})

	// Callback query
	router.CallbackQuery("btn:click", func(c *routing.Context) error {
		_, err := c.AnswerCallbackQuery("🎉 Button clicked via Golang!", true)
		return err
	})

	return router
}
