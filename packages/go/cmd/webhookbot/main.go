package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
)

func main() {
	token := os.Getenv("BOT_TOKEN")
	secretToken := os.Getenv("WEBHOOK_SECRET")
	webhookURL := os.Getenv("WEBHOOK_URL")

	if token == "" {
		log.Fatal("BOT_TOKEN is required")
	}

	b := bot.NewBot(token)
	router := routing.NewRouter(b)

	router.Command("start", func(c *routing.Context) error {
		_, err := c.Reply("🚀 Received update via high-performance Go Webhook!")
		return err
	})

	if webhookURL != "" {
		log.Printf("Configuring webhook URL: %s", webhookURL)
		if _, err := b.SetWebhook(context.Background(), webhookURL, secretToken, 50); err != nil {
			log.Fatalf("Failed to set webhook: %v", err)
		}
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	log.Println("🚀 Webhook server listening on :8080/webhook")
	err := b.RunWebhook(ctx, ":8080", "/webhook", secretToken, func(u *types.Update) {
		_ = router.ProcessUpdate(ctx, u)
	})
	if err != nil {
		log.Fatalf("Webhook server error: %v", err)
	}
}
