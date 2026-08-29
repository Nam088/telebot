// Command mediabot demonstrates the media Bot API methods: dice, location,
// venue, contact, albums (sendMediaGroup), stickers, reactions, and
// MarkdownV2 formatting via pkg/utils.
//
// Usage:
//
//	BOT_TOKEN=... go run ./cmd/mediabot
//
// Commands: /dice /location /venue /contact /album /sticker /styled, and
// reply to any of your own messages with /react to add a 👍 reaction.
package main

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
	"github.com/Nam088/telebot-go/pkg/utils"
)

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatalf("Media bot error: %v", err)
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

	log.Println("📸 Media bot is running... Send /dice, /album, /styled, ...")
	return router.RunPolling(ctx)
}

func buildRouter(b *bot.Bot) *routing.Router {
	router := routing.NewRouter(b)

	router.Command("start", func(c *routing.Context) error {
		_, err := c.Reply("Media demos:\n/dice /location /venue /contact /album /sticker /styled /react")
		return err
	})

	router.Command("dice", func(c *routing.Context) error {
		_, err := b.SendDice(c.Ctx(), &types.SendDiceOptions{ChatID: c.Chat().ID})
		return err
	})

	router.Command("location", func(c *routing.Context) error {
		_, err := b.SendLocation(c.Ctx(), &types.SendLocationOptions{
			ChatID: c.Chat().ID, Latitude: 21.0285, Longitude: 105.8542,
		})
		return err
	})

	router.Command("venue", func(c *routing.Context) error {
		_, err := b.SendVenue(c.Ctx(), &types.SendVenueOptions{
			ChatID: c.Chat().ID, Latitude: 21.0285, Longitude: 105.8542,
			Title: "Hoan Kiem Lake", Address: "Hanoi, Vietnam",
		})
		return err
	})

	router.Command("contact", func(c *routing.Context) error {
		_, err := b.SendContact(c.Ctx(), &types.SendContactOptions{
			ChatID: c.Chat().ID, PhoneNumber: "+84123456789", FirstName: "Demo", LastName: "Bot",
		})
		return err
	})

	router.Command("album", func(c *routing.Context) error {
		logo := "https://telegram.org/img/t_logo.png"
		_, err := b.SendMediaGroup(c.Ctx(), &types.SendMediaGroupOptions{
			ChatID: c.Chat().ID,
			Media: []types.InputMedia{
				&types.InputMediaPhoto{Type: "photo", Media: logo, Caption: "Photo 1"},
				&types.InputMediaPhoto{Type: "photo", Media: logo, Caption: "Photo 2"},
			},
		})
		return err
	})

	router.Command("sticker", func(c *routing.Context) error {
		// Prefer a regular sticker from the forum topic icon set; those are
		// emoji stickers which cannot be sent, so fall back to a PNG URL.
		var sticker any = "https://telegram.org/img/t_logo.png"
		if icons, err := b.GetForumTopicIconStickers(c.Ctx()); err == nil {
			for _, s := range icons {
				if s.Type == "regular" {
					sticker = s.FileID
					break
				}
			}
		}
		_, err := b.SendSticker(c.Ctx(), &types.SendStickerOptions{ChatID: c.Chat().ID, Sticker: sticker})
		return err
	})

	router.Command("styled", func(c *routing.Context) error {
		m := utils.ModeMarkdownV2
		text := utils.Bold("telebot-go", m) + " formatting demo\n" +
			utils.Italic("italic", m) + " " + utils.Underline("underline", m) + " " + utils.Strike("strike", m) + "\n" +
			utils.Spoiler("spoiler (tap me)", m) + "\n" +
			utils.Code("fmt.Println(\"hello\")", "go", m) + "\n" +
			utils.Blockquote("quoted text", m) + "\n" +
			utils.Link("telegram.org", "https://telegram.org", m)
		_, err := c.Reply(text, func(o *types.SendMessageOptions) {
			o.ParseMode = string(m)
		})
		return err
	})

	// /react as a reply adds a 👍 reaction to the replied-to message.
	router.Command("react", func(c *routing.Context) error {
		msg := c.Message()
		if msg == nil || msg.ReplyToMessage == nil {
			_, err := c.Reply("Reply to a message with /react to add a reaction.")
			return err
		}
		_, err := b.SetMessageReaction(c.Ctx(), &types.SetMessageReactionOptions{
			ChatID:    c.Chat().ID,
			MessageID: msg.ReplyToMessage.MessageID,
			Reaction:  []types.ReactionType{types.ReactionTypeEmoji{Type: "emoji", Emoji: "👍"}},
		})
		return err
	})

	return router
}
