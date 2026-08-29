// Command keyboardbot demonstrates reply keyboards (the keyboard that
// replaces the user's on-screen keyboard) and inline keyboards (buttons
// attached to a message) using the components/keyboard builders.
//
// Usage:
//
//	BOT_TOKEN=... go run ./cmd/keyboardbot
//
// Then open the bot chat and send /start.
package main

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/components/keyboard"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
)

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatalf("Keyboard bot error: %v", err)
	}
}

// apiBaseURL optionally overrides the Telegram Bot API endpoint. It exists as
// a test hook so the bot can be pointed at a local mock server.
var apiBaseURL string

func newBot(token string) *bot.Bot {
	if apiBaseURL != "" {
		return bot.NewBot(token, bot.WithBaseURL(apiBaseURL))
	}
	return bot.NewBot(token)
}

func run(ctx context.Context) error {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		return errors.New("BOT_TOKEN is not set")
	}

	b := newBot(token)
	router := buildRouter(b)

	log.Println("🤖 Keyboard bot is running... Send /start to the bot.")
	return router.RunPolling(ctx)
}

// replyKeyboardRemove mirrors Telegram's ReplyKeyboardRemove object; the
// library's types package does not model it yet.
type replyKeyboardRemove struct {
	RemoveKeyboard bool `json:"remove_keyboard"`
}

func buildRouter(b *bot.Bot) *routing.Router {
	router := routing.NewRouter(b)

	// Full-size reply keyboard shown on /start.
	router.Command("start", func(c *routing.Context) error {
		kb := keyboard.NewReplyKeyboard(
			keyboard.WithResizeKeyboard(),
			keyboard.WithInputFieldPlaceholder("Pick an option..."),
		).
			AddButton("🕐 Time").
			AddButton("🎲 Roll").
			AddRow().
			AddButton("📍 Location").
			AddButton("❌ Hide").
			Build()

		_, err := c.Reply("Here is your reply keyboard 👇", func(o *types.SendMessageOptions) {
			o.ReplyMarkup = kb
		})
		return err
	})

	// One-time keyboard: disappears as soon as the user presses a button.
	router.Command("once", func(c *routing.Context) error {
		kb := keyboard.NewReplyKeyboard(
			keyboard.WithResizeKeyboard(),
			keyboard.WithOneTimeKeyboard(),
		).
			AddButton("Option A").AddButton("Option B").
			Build()

		_, err := c.Reply("Pick one (this keyboard hides after use):", func(o *types.SendMessageOptions) {
			o.ReplyMarkup = kb
		})
		return err
	})

	// Inline keyboard attached to a message, with callback handling below.
	router.Command("menu", func(c *routing.Context) error {
		kb := keyboard.NewInlineKeyboard().
			Data("✅ Approve", "menu:approve").
			Data("❌ Reject", "menu:reject").
			Row().
			URL("🌐 telegram.org", "https://telegram.org").
			Build()

		_, err := c.Reply("Inline menu 👇", func(o *types.SendMessageOptions) {
			o.ReplyMarkup = kb
		})
		return err
	})

	// Reply-keyboard button presses arrive as ordinary text messages.
	router.Text("🕐 Time", func(c *routing.Context) error {
		_, err := c.Reply("It is now " + time.Now().Format("15:04:05"))
		return err
	})
	router.Text("🎲 Roll", func(c *routing.Context) error {
		_, err := c.Bot().SendDice(c.Ctx(), &types.SendDiceOptions{ChatID: c.Chat().ID})
		return err
	})
	router.Text("📍 Location", func(c *routing.Context) error {
		_, err := c.Bot().SendLocation(c.Ctx(), &types.SendLocationOptions{
			ChatID: c.Chat().ID, Latitude: 21.0285, Longitude: 105.8542,
		})
		return err
	})
	router.Text("❌ Hide", func(c *routing.Context) error {
		_, err := c.Reply("Keyboard hidden.", func(o *types.SendMessageOptions) {
			o.ReplyMarkup = replyKeyboardRemove{RemoveKeyboard: true}
		})
		return err
	})
	router.Text("Option A", func(c *routing.Context) error { _, err := c.Reply("You chose A ✅"); return err })
	router.Text("Option B", func(c *routing.Context) error { _, err := c.Reply("You chose B ✅"); return err })

	// Inline-button presses arrive as callback queries.
	router.CallbackQuery("menu:approve", func(c *routing.Context) error {
		if _, err := c.AnswerCallbackQuery("Approved!", false); err != nil {
			return err
		}
		_, err := c.Reply("👍 The request was approved.")
		return err
	})
	router.CallbackQuery("menu:reject", func(c *routing.Context) error {
		if _, err := c.AnswerCallbackQuery("Rejected!", true); err != nil {
			return err
		}
		_, err := c.Reply("👎 The request was rejected.")
		return err
	})

	return router
}
