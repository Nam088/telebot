package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/scheduler"
	"github.com/Nam088/telebot-go/pkg/types"
)

func main() {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		log.Println("BOT_TOKEN is not set. Using dummy client demonstration.")
		token = "123456:dummy-token"
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	b := bot.NewBot(token)
	router := routing.NewRouter(b)
	queue := scheduler.NewJobQueue(ctx, b)

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
					{Text: "🌟 GitHub", URL: "https://github.com/Nam088/telebot-ts"},
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

	// Background recurring task
	queue.RunRepeating("health_check", 1*time.Minute, func(jobCtx context.Context, b *bot.Bot) error {
		log.Println("[HealthCheck] Bot is running smoothly.")
		return nil
	})

	fmt.Println("🚀 telebot-go framework initialized successfully!")
}
