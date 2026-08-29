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

func TestBot_SendMessage_And_Webhook(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := types.Response[types.Message]{
			Ok: true,
			Result: types.Message{
				MessageID: 100,
				Text:      "Hello",
			},
		}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	b := bot.NewBot("fake_token", bot.WithBaseURL(server.URL))

	msg, err := b.SendMessage(context.Background(), &types.SendMessageOptions{
		ChatID: 123,
		Text:   "Hello",
	})
	if err != nil {
		t.Fatalf("SendMessage failed: %v", err)
	}
	if msg.MessageID != 100 {
		t.Errorf("expected msg id 100, got %d", msg.MessageID)
	}

	// Test Webhook handler
	var receivedUpdate *types.Update
	handler := b.WebhookHandler("secret123", func(u *types.Update) {
		receivedUpdate = u
	})

	req := httptest.NewRequest(http.MethodPost, "/webhook", nil)
	req.Header.Set("X-Telegram-Bot-Api-Secret-Token", "wrong_secret")
	rec := httptest.NewRecorder()
	handler(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized for wrong secret, got %d", rec.Code)
	}
	_ = receivedUpdate
}
