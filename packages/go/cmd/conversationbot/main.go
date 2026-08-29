package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/filters"
	"github.com/Nam088/telebot/packages/go/pkg/routing"
)

const (
	StateName = 1
	StateAge  = 2
)

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatalf("Conversation bot error: %v", err)
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

// run wires the conversation bot and blocks on long polling until ctx ends.
func run(ctx context.Context) error {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		return errors.New("BOT_TOKEN is not set")
	}

	b := newBot(token)
	router := routing.NewRouter(b)
	buildConversation().Register(router)

	log.Println("🤖 Conversation bot is running...")
	return router.RunPolling(ctx)
}

// buildConversation constructs the user-registration FSM conversation handler.
func buildConversation() *routing.ConversationHandler {
	// Free-text states must not swallow commands, so command updates such as
	// /cancel still reach the fallback routes below.
	plainText := filters.And(filters.Text, filters.Not(filters.Command))

	return routing.NewConversationHandler("user_registration").
		AddEntryPoint(filters.Command, func(c *routing.Context) (int, error) {
			if c.Message().Text == "/register" {
				_, _ = c.Reply("👋 Welcome to registration! What is your full name?")
				return StateName, nil
			}
			return routing.ConversationEnd, nil
		}).
		AddState(StateName, plainText, func(c *routing.Context) (int, error) {
			name := c.Message().Text
			_, _ = c.Reply(fmt.Sprintf("Thanks %s! How old are you?", name))
			return StateAge, nil
		}).
		AddState(StateAge, plainText, func(c *routing.Context) (int, error) {
			age := c.Message().Text
			_, _ = c.Reply(fmt.Sprintf("🎉 Registration complete! Age: %s. Send /register to try again.", age))
			return routing.ConversationEnd, nil
		}).
		AddFallback(filters.Command, func(c *routing.Context) (int, error) {
			if c.Message().Text == "/cancel" {
				_, _ = c.Reply("❌ Registration cancelled.")
				return routing.ConversationEnd, nil
			}
			return StateName, nil
		})
}
