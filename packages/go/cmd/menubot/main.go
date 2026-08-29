package main

import (
	"context"
	"log"
	"os"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/components/menu"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
)

func main() {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		log.Fatal("BOT_TOKEN is not set")
	}

	b := bot.NewBot(token)
	router := routing.NewRouter(b)

	// Create nested interactive menus
	mainMenu := menu.New("main", "🎛️ Main Control Panel\nPlease select an option:")
	settingsMenu := menu.New("settings", "⚙️ Bot Settings\nConfigure your preferences:")

	settingsMenu.TextButton("🔔 Toggle Alerts", "alerts", func(c *routing.Context) error {
		_, err := c.AnswerCallbackQuery("🔔 Alerts toggled!", true)
		return err
	})

	mainMenu.Submenu("⚙️ Settings", settingsMenu)
	mainMenu.TextButton("ℹ️ About", "about", func(c *routing.Context) error {
		_, err := c.AnswerCallbackQuery("telebot-go Framework v1.0", true)
		return err
	})

	mainMenu.Register(router)

	router.Command("menu", func(c *routing.Context) error {
		_, err := c.Reply(mainMenu.Text, func(o *types.SendMessageOptions) {
			o.ReplyMarkup = mainMenu.BuildKeyboard()
		})
		return err
	})

	log.Println("🤖 Menu bot is running...")
	if err := router.RunPolling(context.Background()); err != nil {
		log.Fatalf("Polling error: %v", err)
	}
}
