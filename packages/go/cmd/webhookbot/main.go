package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
)

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatalf("Webhook bot error: %v", err)
	}
}

// apiBaseURL optionally overrides the Telegram Bot API endpoint for tests.
var apiBaseURL string

// listenAddr is the address the webhook HTTP server binds to.
var listenAddr = ":8080"

func newBot(token string) *bot.Bot {
	if apiBaseURL != "" {
		return bot.NewBot(token, bot.WithBaseURL(apiBaseURL))
	}
	return bot.NewBot(token)
}

// run configures the webhook (optionally registering it with Telegram) and
// serves incoming updates until ctx is cancelled.
func run(ctx context.Context) error {
	token := os.Getenv("BOT_TOKEN")
	secretToken := os.Getenv("WEBHOOK_SECRET")
	webhookURL := os.Getenv("WEBHOOK_URL")

	if token == "" {
		return errors.New("BOT_TOKEN is required")
	}

	b := newBot(token)
	router := buildRouter(b)

	if webhookURL != "" {
		log.Printf("Configuring webhook URL: %s", webhookURL)
		if _, err := b.SetWebhook(ctx, webhookURL, secretToken, 50); err != nil {
			return fmt.Errorf("failed to set webhook: %w", err)
		}
	}

	log.Printf("🚀 Webhook server listening on %s/webhook", listenAddr)
	return b.RunWebhook(ctx, listenAddr, "/webhook", secretToken, func(u *types.Update) {
		_ = router.ProcessUpdate(ctx, u)
	})
}

// buildRouter registers the webhook bot's update routes on a fresh Router.
func buildRouter(b *bot.Bot) *routing.Router {
	router := routing.NewRouter(b)

	router.Command("start", func(c *routing.Context) error {
		_, err := c.Reply("🚀 Received update via high-performance Go Webhook!")
		return err
	})

	return router
}
