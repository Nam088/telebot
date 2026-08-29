package types_test

import (
	"testing"

	"github.com/Nam088/telebot-go/pkg/types"
)

func TestEffectiveHelpers(t *testing.T) {
	u := &types.Update{
		UpdateID: 100,
		Message: &types.Message{
			MessageID: 42,
			From: &types.User{
				ID:        12345,
				FirstName: "Alice",
			},
			Chat: &types.Chat{
				ID:   67890,
				Type: "private",
			},
			Text: "/start",
		},
	}

	user := u.EffectiveUser()
	if user == nil || user.FirstName != "Alice" {
		t.Fatalf("unexpected effective user: %+v", user)
	}

	chat := u.EffectiveChat()
	if chat == nil || chat.ID != 67890 {
		t.Fatalf("unexpected effective chat: %+v", chat)
	}

	msg := u.EffectiveMessage()
	if msg == nil || msg.MessageID != 42 {
		t.Fatalf("unexpected effective message: %+v", msg)
	}
}
