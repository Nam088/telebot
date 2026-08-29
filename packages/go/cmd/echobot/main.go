package main

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/routing"
)

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatalf("Echo bot error: %v", err)
	}
}

// apiBaseURL optionally overrides the Telegram Bot API endpoint. It exists as
// a test hook so the bot can be pointed at a local mock server.
var apiBaseURL string

// newBot constructs the Bot client, honouring the apiBaseURL override.
func newBot(token string) *bot.Bot {
	if apiBaseURL != "" {
		return bot.NewBot(token, bot.WithBaseURL(apiBaseURL))
	}
	return bot.NewBot(token)
}

// run wires the echo bot and blocks on long polling until ctx is cancelled.
func run(ctx context.Context) error {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		return errors.New("BOT_TOKEN is not set")
	}

	b := newBot(token)
	router := buildRouter(b)

	log.Println("🤖 Echo bot is running...")
	return router.RunPolling(ctx)
}

// buildRouter registers the echo bot's update routes on a fresh Router.
func buildRouter(b *bot.Bot) *routing.Router {
	router := routing.NewRouter(b)

	router.Command("start", func(c *routing.Context) error {
		_, err := c.Reply("👋 Welcome to Echo Bot! Send me any text message.")
		return err
	})

	router.Text("", func(c *routing.Context) error {
		msg := c.Message()
		if msg != nil {
			_, err := c.Reply("Echo: " + msg.Text)
			return err
		}
		return nil
	})

	return router
}
