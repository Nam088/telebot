package menu_test

import (
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/components/menu"
	"github.com/Nam088/telebot-go/pkg/routing"
)

func TestMenu_BuildAndRegister(t *testing.T) {
	mainMenu := menu.New("main", "Main Menu Header").
		TextButton("Settings", "settings", func(c *routing.Context) error {
			return nil
		}).
		Row().
		TextButton("Help", "help", func(c *routing.Context) error {
			return nil
		})

	kb := mainMenu.BuildKeyboard()
	if len(kb.InlineKeyboard) != 2 {
		t.Fatalf("expected 2 rows in menu keyboard, got %d", len(kb.InlineKeyboard))
	}

	b := bot.NewBot("fake_token")
	router := routing.NewRouter(b)
	mainMenu.Register(router)
}
