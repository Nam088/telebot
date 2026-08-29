package types_test

import (
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
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

func TestEffectiveHelpers_InlineQuery(t *testing.T) {
	u := &types.Update{
		UpdateID: 101,
		InlineQuery: &types.InlineQuery{
			ID:    "iq-1",
			From:  &types.User{ID: 111, FirstName: "Inliner"},
			Query: "search",
		},
	}

	if user := u.EffectiveUser(); user == nil || user.ID != 111 {
		t.Fatalf("unexpected effective user: %+v", user)
	}
	if chat := u.EffectiveChat(); chat != nil {
		t.Fatalf("inline query updates carry no chat, got %+v", chat)
	}
}

func TestEffectiveHelpers_PollAnswer(t *testing.T) {
	u := &types.Update{
		UpdateID: 102,
		PollAnswer: &types.PollAnswer{
			PollID:    "poll-1",
			User:      &types.User{ID: 222, FirstName: "Voter"},
			OptionIDs: []int{1},
		},
	}

	if user := u.EffectiveUser(); user == nil || user.ID != 222 {
		t.Fatalf("unexpected effective user: %+v", user)
	}
	if chat := u.EffectiveChat(); chat != nil {
		t.Fatalf("anonymous-free poll answers carry no chat, got %+v", chat)
	}

	// Anonymous votes resolve the voter chat instead.
	u.PollAnswer.User = nil
	u.PollAnswer.VoterChat = &types.Chat{ID: -100999, Type: "channel"}
	if chat := u.EffectiveChat(); chat == nil || chat.ID != -100999 {
		t.Fatalf("unexpected effective chat: %+v", chat)
	}
}

func TestEffectiveHelpers_ChatMemberUpdates(t *testing.T) {
	memberUpdate := &types.ChatMemberUpdated{
		Chat:          &types.Chat{ID: -100123, Type: "supergroup"},
		From:          &types.User{ID: 333, FirstName: "Admin"},
		OldChatMember: types.ChatMember{Status: "member", User: types.User{ID: 444}},
		NewChatMember: types.ChatMember{Status: "left", User: types.User{ID: 444}},
	}

	for _, u := range []*types.Update{
		{UpdateID: 103, ChatMember: memberUpdate},
		{UpdateID: 104, MyChatMember: memberUpdate},
	} {
		if user := u.EffectiveUser(); user == nil || user.ID != 333 {
			t.Fatalf("unexpected effective user: %+v", user)
		}
		if chat := u.EffectiveChat(); chat == nil || chat.ID != -100123 {
			t.Fatalf("unexpected effective chat: %+v", chat)
		}
	}
}

func TestEffectiveHelpers_ChatJoinRequest(t *testing.T) {
	u := &types.Update{
		UpdateID: 105,
		ChatJoinRequest: &types.ChatJoinRequest{
			Chat:       &types.Chat{ID: -100789, Type: "channel"},
			From:       &types.User{ID: 555, FirstName: "Requester"},
			UserChatID: 555,
		},
	}

	if user := u.EffectiveUser(); user == nil || user.ID != 555 {
		t.Fatalf("unexpected effective user: %+v", user)
	}
	if chat := u.EffectiveChat(); chat == nil || chat.ID != -100789 {
		t.Fatalf("unexpected effective chat: %+v", chat)
	}
}
