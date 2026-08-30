// Command pollbot demonstrates Telegram polls: sending regular and quiz
// polls, stopping them, and reacting to poll updates and votes through the
// Router.Poll / Router.PollAnswer dispatch helpers.
//
// Usage:
//
//	BOT_TOKEN=... go run ./cmd/pollbot
//
// Commands: /poll (regular), /quiz (quiz with explanation), /stop (close the
// last poll in this chat).
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func main() {
	if err := run(context.Background()); err != nil {
		log.Fatalf("Poll bot error: %v", err)
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

	log.Println("🗳 Poll bot is running... Send /poll or /quiz.")
	return router.RunPolling(ctx)
}

// lastPolls remembers the newest poll message per chat so /stop can close it.
var lastPolls struct {
	sync.Mutex
	byChat map[int64]int64
}

func rememberPoll(chatID, messageID int64) {
	lastPolls.Lock()
	defer lastPolls.Unlock()
	if lastPolls.byChat == nil {
		lastPolls.byChat = make(map[int64]int64)
	}
	lastPolls.byChat[chatID] = messageID
}

func buildRouter(b *bot.Bot) *routing.Router {
	router := routing.NewRouter(b)

	router.Command("start", func(c *routing.Context) error {
		_, err := c.Reply("/poll — regular poll\n/quiz — quiz poll\n/stop — close the last poll")
		return err
	})

	router.Command("poll", func(c *routing.Context) error {
		msg, err := b.SendPoll(c.Ctx(), &types.SendPollOptions{
			ChatID:      c.Chat().ID,
			Question:    "Which Go feature do you use most?",
			Options:     []string{"Goroutines", "Channels", "Interfaces", "Generics"},
			IsAnonymous: false,
		})
		if err != nil {
			return err
		}
		rememberPoll(c.Chat().ID, msg.MessageID)
		return nil
	})

	router.Command("quiz", func(c *routing.Context) error {
		msg, err := b.SendPoll(c.Ctx(), &types.SendPollOptions{
			ChatID:           c.Chat().ID,
			Question:         "What does the Go scheduler use to run goroutines?",
			Options:          []string{"One OS thread per goroutine", "M:N scheduling on OS threads", "A single global event loop"},
			Type:             "quiz",
			CorrectOptionIDs: []int{1},
			Explanation:      "Go uses M:N scheduling: many goroutines are multiplexed onto a smaller number of OS threads.",
		})
		if err != nil {
			return err
		}
		rememberPoll(c.Chat().ID, msg.MessageID)
		return nil
	})

	router.Command("stop", func(c *routing.Context) error {
		lastPolls.Lock()
		messageID, ok := lastPolls.byChat[c.Chat().ID]
		lastPolls.Unlock()
		if !ok {
			_, err := c.Reply("No poll sent in this chat yet.")
			return err
		}
		if _, err := b.StopPoll(c.Ctx(), &types.StopPollOptions{ChatID: c.Chat().ID, MessageID: messageID}); err != nil {
			return err
		}
		_, err := c.Reply("Poll closed ✅")
		return err
	})

	// Top-level poll state updates (e.g. when somebody closes a poll elsewhere).
	router.Poll(func(c *routing.Context) error {
		p := c.Update().Poll
		if p == nil {
			return nil
		}
		log.Printf("poll update: %q closed=%v voters=%d", p.Question, p.IsClosed, p.TotalVoterCount)
		return nil
	})

	// Vote notifications (anonymous polls deliver no user).
	router.PollAnswer(func(c *routing.Context) error {
		a := c.Update().PollAnswer
		if a == nil {
			return nil
		}
		who := "someone anonymous"
		if a.User != nil {
			who = a.User.FirstName
		}
		log.Printf("poll answer: %s voted options %v", who, a.OptionIDs)
		if c.Chat() != nil {
			_, err := c.Reply(fmt.Sprintf("%s voted for option %v 👀", who, a.OptionIDs))
			return err
		}
		return nil
	})

	return router
}
