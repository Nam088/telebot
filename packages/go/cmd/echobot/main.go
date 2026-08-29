package main

import (
	"context"
	"log"
	"os"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/routing"
)

func main() {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		log.Fatal("BOT_TOKEN is not set")
	}

	b := bot.NewBot(token)
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

	log.Println("🤖 Echo bot is running...")
	if err := router.RunPolling(context.Background()); err != nil {
		log.Fatalf("Polling error: %v", err)
	}
}
