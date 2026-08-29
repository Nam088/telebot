package routing_test

import (
	"context"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestRouter_Command(t *testing.T) {
	b := bot.NewBot("fake_token")
	router := routing.NewRouter(b)

	var handled bool
	router.Command("start", func(c *routing.Context) error {
		handled = true
		return nil
	})

	update := &types.Update{
		UpdateID: 1,
		Message: &types.Message{
			Text: "/start",
			Chat: &types.Chat{ID: 100, Type: "private"},
			From: &types.User{ID: 200, FirstName: "Tester"},
		},
	}

	err := router.ProcessUpdate(context.Background(), update)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !handled {
		t.Errorf("expected /start command to be handled")
	}
}
