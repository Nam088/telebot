package bot_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestBot_GetMe(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := types.Response[types.User]{
			Ok: true,
			Result: types.User{
				ID:        123456,
				IsBot:     true,
				FirstName: "TestBot",
				Username:  "test_bot",
			},
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	user, err := b.GetMe(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if user.Username != "test_bot" {
		t.Errorf("expected test_bot, got %s", user.Username)
	}
}
