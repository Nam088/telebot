// Command inlinebot demonstrates Telegram inline queries: when a user
// mentions the bot in any chat ("@nvn_app_bot query"), the bot answers with
// Article and Photo results built by the components/inlinequery builders.
//
// Inline mode must be enabled for the bot via @BotFather (/setinline).
//
// Usage:
//
//	BOT_TOKEN=... go run ./cmd/inlinebot
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/components/inlinequery"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
	"github.com/Nam088/telebot-go/pkg/utils"
)

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatalf("Inline bot error: %v", err)
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

	log.Println("🔎 Inline bot is running... Mention the bot in any chat to search.")
	return router.RunPolling(ctx)
}

func buildRouter(b *bot.Bot) *routing.Router {
	router := routing.NewRouter(b)

	router.Command("start", func(c *routing.Context) error {
		me, err := b.GetMe(c.Ctx())
		if err != nil {
			return err
		}
		_, err = c.Reply("Mention me in any chat (e.g. @" + me.Username + " hello) to get inline results.")
		return err
	})

	// Empty pattern matches every inline query.
	router.InlineQuery("", func(c *routing.Context) error {
		q := c.Update().InlineQuery
		if q == nil {
			return nil
		}

		query := strings.TrimSpace(q.Query)
		if query == "" {
			query = "telebot-go"
		}

		article := inlinequery.NewArticle("article-1", "Echo: "+query).
			Description("Sends your query back as a text message").
			Text(utils.EscapeMarkdownV2(fmt.Sprintf("You searched for: %q", query)), "MarkdownV2", false).
			Build()

		photo := inlinequery.NewPhoto("photo-1", "https://telegram.org/img/t_logo.png").
			Title("Telegram logo").
			Description("Result built with the Photo builder").
			Caption("Query was: " + query).
			Build()

		_, err := b.AnswerInlineQuery(c.Ctx(), &types.AnswerInlineQueryOptions{
			InlineQueryID: q.ID,
			Results:       []types.InlineQueryResult{article, photo},
			CacheTime:     60,
			IsPersonal:    true,
		})
		return err
	})

	return router
}
