package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/filters"
	"github.com/Nam088/telebot-go/pkg/routing"
)

const (
	StateName = 1
	StateAge  = 2
)

func main() {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		log.Fatal("BOT_TOKEN is not set")
	}

	b := bot.NewBot(token)
	router := routing.NewRouter(b)

	conv := routing.NewConversationHandler("user_registration").
		AddEntryPoint(filters.Command, func(c *routing.Context) (int, error) {
			if c.Message().Text == "/register" {
				c.Reply("👋 Welcome to registration! What is your full name?")
				return StateName, nil
			}
			return routing.ConversationEnd, nil
		}).
		AddState(StateName, filters.Text, func(c *routing.Context) (int, error) {
			name := c.Message().Text
			c.Reply(fmt.Sprintf("Thanks %s! How old are you?", name))
			return StateAge, nil
		}).
		AddState(StateAge, filters.Text, func(c *routing.Context) (int, error) {
			age := c.Message().Text
			c.Reply(fmt.Sprintf("🎉 Registration complete! Age: %s. Send /register to try again.", age))
			return routing.ConversationEnd, nil
		}).
		AddFallback(filters.Command, func(c *routing.Context) (int, error) {
			if c.Message().Text == "/cancel" {
				c.Reply("❌ Registration cancelled.")
				return routing.ConversationEnd, nil
			}
			return StateName, nil
		})

	conv.Register(router)

	log.Println("🤖 Conversation bot is running...")
	if err := router.RunPolling(context.Background()); err != nil {
		log.Fatalf("Polling error: %v", err)
	}
}
