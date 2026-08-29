package main

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/components/menu"
	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatalf("Menu bot error: %v", err)
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

// run wires the menu bot and blocks on long polling until ctx ends.
func run(ctx context.Context) error {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		return errors.New("BOT_TOKEN is not set")
	}

	b := newBot(token)
	router := routing.NewRouter(b)

	mainMenu := buildMenu()
	mainMenu.Register(router)

	router.Command("menu", func(c *routing.Context) error {
		_, err := c.Reply(mainMenu.Text, func(o *types.SendMessageOptions) {
			o.ReplyMarkup = mainMenu.BuildKeyboard()
		})
		return err
	})

	log.Println("🤖 Menu bot is running...")
	return router.RunPolling(ctx)
}

// buildMenu constructs the nested main/settings menu tree.
func buildMenu() *menu.Menu {
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

	return mainMenu
}
