package routing_test

import (
	"context"
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
)

func newUpdateRouter() *routing.Router {
	return routing.NewRouter(bot.NewBot("fake_token"))
}

// processOrFail runs an update through the router and fails the test on error.
func processOrFail(t *testing.T, router *routing.Router, update *types.Update) {
	t.Helper()
	if err := router.ProcessUpdate(context.Background(), update); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func inlineQueryUpdate(query string) *types.Update {
	return &types.Update{
		UpdateID: 1,
		InlineQuery: &types.InlineQuery{
			ID:    "iq-1",
			From:  &types.User{ID: 200, FirstName: "Inline"},
			Query: query,
		},
	}
}

func TestRouter_InlineQuery_Any(t *testing.T) {
	router := newUpdateRouter()

	var handled bool
	router.InlineQuery("", func(c *routing.Context) error {
		handled = true
		if c.Update().InlineQuery == nil {
			t.Error("expected inline query in context update")
		}
		return nil
	})

	processOrFail(t, router, inlineQueryUpdate("anything"))
	if !handled {
		t.Error("expected inline query to be handled with empty pattern")
	}
}

func TestRouter_InlineQuery_ExactPattern(t *testing.T) {
	router := newUpdateRouter()

	var calls int
	router.InlineQuery("weather", func(c *routing.Context) error {
		calls++
		return nil
	})

	processOrFail(t, router, inlineQueryUpdate("weather"))
	processOrFail(t, router, inlineQueryUpdate("news"))
	processOrFail(t, router, inlineQueryUpdate("weather forecast"))

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func TestRouter_InlineQuery_IgnoresOtherUpdates(t *testing.T) {
	router := newUpdateRouter()

	var handled bool
	router.InlineQuery("", func(c *routing.Context) error {
		handled = true
		return nil
	})

	processOrFail(t, router, &types.Update{
		UpdateID: 2,
		Message: &types.Message{
			MessageID: 10,
			Text:      "hello",
			Chat:      &types.Chat{ID: 100, Type: "private"},
		},
	})

	if handled {
		t.Error("inline query handler must not run for message updates")
	}
}

func TestRouter_Poll(t *testing.T) {
	router := newUpdateRouter()

	var handled bool
	router.Poll(func(c *routing.Context) error {
		handled = true
		if c.Update().Poll == nil || c.Update().Poll.ID != "poll-1" {
			t.Error("expected poll state update in context")
		}
		return nil
	})

	// Poll state change delivered as a top-level poll update.
	processOrFail(t, router, &types.Update{
		UpdateID: 3,
		Poll: &types.Poll{
			ID:              "poll-1",
			Question:        "Lunch?",
			Options:         []types.PollOption{{Text: "Pizza", VoterCount: 2}},
			TotalVoterCount: 2,
			Type:            "regular",
		},
	})
	if !handled {
		t.Error("expected poll state update to be handled")
	}

	// A message that merely contains a poll must not trigger Router.Poll.
	handled = false
	processOrFail(t, router, &types.Update{
		UpdateID: 4,
		Message: &types.Message{
			MessageID: 11,
			Chat:      &types.Chat{ID: 100, Type: "supergroup"},
			Poll:      &types.Poll{ID: "poll-2", Question: "Nested"},
		},
	})
	if handled {
		t.Error("poll message must not match the poll state route")
	}
}

func TestRouter_PollAnswer(t *testing.T) {
	router := newUpdateRouter()

	var voter int64
	router.PollAnswer(func(c *routing.Context) error {
		if user := c.User(); user != nil {
			voter = user.ID
		}
		return nil
	})

	processOrFail(t, router, &types.Update{
		UpdateID: 5,
		PollAnswer: &types.PollAnswer{
			PollID:    "poll-1",
			User:      &types.User{ID: 300, FirstName: "Voter"},
			OptionIDs: []int{0},
		},
	})

	if voter != 300 {
		t.Errorf("expected effective user from poll answer, got %d", voter)
	}
}

func TestRouter_PollAnswer_IgnoresOtherUpdates(t *testing.T) {
	router := newUpdateRouter()

	var handled bool
	router.PollAnswer(func(c *routing.Context) error {
		handled = true
		return nil
	})

	processOrFail(t, router, &types.Update{
		UpdateID: 6,
		Poll:     &types.Poll{ID: "poll-1", Question: "State change only"},
	})
	if handled {
		t.Error("poll answer handler must not run for poll state updates")
	}
}

func TestRouter_ChatMember_Scopes(t *testing.T) {
	chatMemberUpdate := &types.Update{
		UpdateID: 7,
		ChatMember: &types.ChatMemberUpdated{
			Chat:          &types.Chat{ID: -100123, Type: "supergroup", Title: "Dev"},
			From:          &types.User{ID: 400, FirstName: "Admin"},
			Date:          1700000000,
			OldChatMember: types.ChatMember{Status: "member", User: types.User{ID: 500}},
			NewChatMember: types.ChatMember{Status: "left", User: types.User{ID: 500}},
		},
	}
	myChatMemberUpdate := &types.Update{
		UpdateID: 8,
		MyChatMember: &types.ChatMemberUpdated{
			Chat:          &types.Chat{ID: -100123, Type: "supergroup", Title: "Dev"},
			From:          &types.User{ID: 400, FirstName: "Admin"},
			Date:          1700000001,
			OldChatMember: types.ChatMember{Status: "member", User: types.User{ID: 999}},
			NewChatMember: types.ChatMember{Status: "administrator", User: types.User{ID: 999}},
		},
	}

	tests := []struct {
		name          string
		scope         routing.ChatMemberScope
		update        *types.Update
		expectHandled bool
	}{
		{"any matches chat_member", routing.AnyChatMember, chatMemberUpdate, true},
		{"any matches my_chat_member", routing.AnyChatMember, myChatMemberUpdate, true},
		{"chat member only matches chat_member", routing.ChatMemberOnly, chatMemberUpdate, true},
		{"chat member only ignores my_chat_member", routing.ChatMemberOnly, myChatMemberUpdate, false},
		{"my chat member only matches my_chat_member", routing.MyChatMemberOnly, myChatMemberUpdate, true},
		{"my chat member only ignores chat_member", routing.MyChatMemberOnly, chatMemberUpdate, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := newUpdateRouter()

			var handled bool
			router.ChatMember(tt.scope, func(c *routing.Context) error {
				handled = true
				return nil
			})

			processOrFail(t, router, tt.update)
			if handled != tt.expectHandled {
				t.Errorf("handled = %v, want %v", handled, tt.expectHandled)
			}
		})
	}
}

func TestRouter_ChatMember_ContextExtraction(t *testing.T) {
	router := newUpdateRouter()

	var chatID int64
	router.ChatMember(routing.ChatMemberOnly, func(c *routing.Context) error {
		if chat := c.Chat(); chat != nil {
			chatID = chat.ID
		}
		return nil
	})

	processOrFail(t, router, &types.Update{
		UpdateID: 9,
		ChatMember: &types.ChatMemberUpdated{
			Chat:          &types.Chat{ID: -100456, Type: "supergroup"},
			From:          &types.User{ID: 400},
			OldChatMember: types.ChatMember{Status: "left", User: types.User{ID: 500}},
			NewChatMember: types.ChatMember{Status: "member", User: types.User{ID: 500}},
		},
	})

	if chatID != -100456 {
		t.Errorf("expected effective chat from chat member update, got %d", chatID)
	}
}

func TestRouter_ChatJoinRequest(t *testing.T) {
	router := newUpdateRouter()

	var approved int64
	router.ChatJoinRequest(func(c *routing.Context) error {
		req := c.Update().ChatJoinRequest
		if req == nil {
			t.Fatal("expected chat join request in context update")
		}
		approved = req.From.ID
		return nil
	})

	processOrFail(t, router, &types.Update{
		UpdateID: 10,
		ChatJoinRequest: &types.ChatJoinRequest{
			Chat:       &types.Chat{ID: -100789, Type: "channel"},
			From:       &types.User{ID: 600, FirstName: "Requester"},
			UserChatID: 600,
			Date:       1700000002,
			Bio:        "let me in",
		},
	})

	if approved != 600 {
		t.Errorf("expected join request from user 600, got %d", approved)
	}
}

func TestRouter_ChatJoinRequest_IgnoresOtherUpdates(t *testing.T) {
	router := newUpdateRouter()

	var handled bool
	router.ChatJoinRequest(func(c *routing.Context) error {
		handled = true
		return nil
	})

	processOrFail(t, router, &types.Update{
		UpdateID: 11,
		CallbackQuery: &types.CallbackQuery{
			ID:   "cb-1",
			From: &types.User{ID: 200},
			Data: "approve",
		},
	})

	if handled {
		t.Error("chat join request handler must not run for callback queries")
	}
}

func TestRouter_UpdateRoutes_FirstMatchWins(t *testing.T) {
	router := newUpdateRouter()

	var called []string
	router.InlineQuery("", func(c *routing.Context) error {
		called = append(called, "inline")
		return nil
	})
	router.Poll(func(c *routing.Context) error {
		called = append(called, "poll")
		return nil
	})

	processOrFail(t, router, inlineQueryUpdate("mixed"))

	if len(called) != 1 || called[0] != "inline" {
		t.Errorf("expected only the first matching route to run, got %v", called)
	}
}

func TestRouter_UpdateRoutes_Middleware(t *testing.T) {
	router := newUpdateRouter()

	var order []string
	router.Use(func(next routing.HandlerFunc) routing.HandlerFunc {
		return func(c *routing.Context) error {
			order = append(order, "before")
			err := next(c)
			order = append(order, "after")
			return err
		}
	})

	router.ChatJoinRequest(func(c *routing.Context) error {
		order = append(order, "handler")
		return nil
	})

	processOrFail(t, router, &types.Update{
		UpdateID: 12,
		ChatJoinRequest: &types.ChatJoinRequest{
			Chat: &types.Chat{ID: -100789, Type: "channel"},
			From: &types.User{ID: 600},
			Date: 1700000003,
		},
	})

	want := []string{"before", "handler", "after"}
	if len(order) != len(want) {
		t.Fatalf("middleware chain not applied: %v", order)
	}
	for i := range want {
		if order[i] != want[i] {
			t.Fatalf("middleware order = %v, want %v", order, want)
		}
	}
}
