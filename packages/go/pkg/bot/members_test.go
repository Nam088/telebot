package bot_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func memberServer(t *testing.T, wantMethod string, wantPayload map[string]any, result any) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/"+wantMethod) {
			t.Errorf("expected path to end with /%s, got %s", wantMethod, r.URL.Path)
		}
		if wantPayload != nil {
			var got map[string]any
			if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
				t.Fatalf("decode body: %v", err)
			}
			for k, v := range wantPayload {
				gv, ok := got[k]
				if !ok {
					t.Errorf("missing payload field %q", k)
					continue
				}
				if !jsonEqual(gv, v) {
					t.Errorf("payload field %q: got %v, want %v", k, gv, v)
				}
			}
		}
		_ = json.NewEncoder(w).Encode(types.Response[any]{Ok: true, Result: result})
	}))
}

func TestMembers_GetChatMember(t *testing.T) {
	srv := memberServer(t, "getChatMember", map[string]any{
		"chat_id": "@supergroup",
		"user_id": float64(42),
	}, types.ChatMember{
		Status: "administrator",
		User:   types.User{ID: 42, FirstName: "Alice"},
	})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	member, err := b.GetChatMember(context.Background(), "@supergroup", 42)
	if err != nil {
		t.Fatalf("GetChatMember error: %v", err)
	}
	if member.Status != "administrator" || member.User.ID != 42 {
		t.Errorf("unexpected member: %+v", member)
	}
}

func TestMembers_PromoteChatMember(t *testing.T) {
	srv := memberServer(t, "promoteChatMember", map[string]any{
		"chat_id":             float64(-1001234567890),
		"user_id":             float64(42),
		"can_delete_messages": true,
		"can_invite_users":    true,
	}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.PromoteChatMember(context.Background(), &types.PromoteChatMemberOptions{
		ChatID:            int64(-1001234567890),
		UserID:            42,
		CanDeleteMessages: true,
		CanInviteUsers:    true,
	})
	if err != nil {
		t.Fatalf("PromoteChatMember error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestMembers_RestrictChatMember(t *testing.T) {
	srv := memberServer(t, "restrictChatMember", map[string]any{
		"chat_id":                          float64(-1001234567890),
		"user_id":                          float64(42),
		"permissions":                      map[string]any{"can_send_polls": true},
		"use_independent_chat_permissions": true,
		"until_date":                       float64(1700000000),
	}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.RestrictChatMember(context.Background(), &types.RestrictChatMemberOptions{
		ChatID:                        int64(-1001234567890),
		UserID:                        42,
		Permissions:                   types.ChatPermissions{CanSendPolls: true},
		UseIndependentChatPermissions: true,
		UntilDate:                     1700000000,
	})
	if err != nil {
		t.Fatalf("RestrictChatMember error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestMembers_SetChatAdministratorCustomTitle(t *testing.T) {
	srv := memberServer(t, "setChatAdministratorCustomTitle", map[string]any{
		"chat_id":      "@supergroup",
		"user_id":      float64(42),
		"custom_title": "Moderator",
	}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.SetChatAdministratorCustomTitle(context.Background(), "@supergroup", 42, "Moderator")
	if err != nil {
		t.Fatalf("SetChatAdministratorCustomTitle error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestMembers_BanChatSenderChat(t *testing.T) {
	srv := memberServer(t, "banChatSenderChat", map[string]any{
		"chat_id":        float64(-1001234567890),
		"sender_chat_id": float64(-1009876543210),
	}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.BanChatSenderChat(context.Background(), int64(-1001234567890), -1009876543210)
	if err != nil {
		t.Fatalf("BanChatSenderChat error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestMembers_UnbanChatSenderChat(t *testing.T) {
	srv := memberServer(t, "unbanChatSenderChat", map[string]any{
		"chat_id":        float64(-1001234567890),
		"sender_chat_id": float64(-1009876543210),
	}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.UnbanChatSenderChat(context.Background(), int64(-1001234567890), -1009876543210)
	if err != nil {
		t.Fatalf("UnbanChatSenderChat error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestMembers_ApproveChatJoinRequest(t *testing.T) {
	srv := memberServer(t, "approveChatJoinRequest", map[string]any{
		"chat_id": "@my_channel",
		"user_id": float64(42),
	}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.ApproveChatJoinRequest(context.Background(), "@my_channel", 42)
	if err != nil {
		t.Fatalf("ApproveChatJoinRequest error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestMembers_DeclineChatJoinRequest(t *testing.T) {
	srv := memberServer(t, "declineChatJoinRequest", map[string]any{
		"chat_id": "@my_channel",
		"user_id": float64(42),
	}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.DeclineChatJoinRequest(context.Background(), "@my_channel", 42)
	if err != nil {
		t.Fatalf("DeclineChatJoinRequest error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestMembers_TelegramError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   403,
			Description: "Forbidden: bot is not a member of the chat",
		})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ctx := context.Background()

	calls := map[string]func() error{
		"GetChatMember": func() error {
			_, err := b.GetChatMember(ctx, int64(1), 2)
			return err
		},
		"PromoteChatMember": func() error {
			_, err := b.PromoteChatMember(ctx, &types.PromoteChatMemberOptions{ChatID: int64(1), UserID: 2})
			return err
		},
		"RestrictChatMember": func() error {
			_, err := b.RestrictChatMember(ctx, &types.RestrictChatMemberOptions{ChatID: int64(1), UserID: 2})
			return err
		},
		"SetChatAdministratorCustomTitle": func() error {
			_, err := b.SetChatAdministratorCustomTitle(ctx, int64(1), 2, "Mod")
			return err
		},
		"BanChatSenderChat": func() error {
			_, err := b.BanChatSenderChat(ctx, int64(1), 2)
			return err
		},
		"UnbanChatSenderChat": func() error {
			_, err := b.UnbanChatSenderChat(ctx, int64(1), 2)
			return err
		},
		"ApproveChatJoinRequest": func() error {
			_, err := b.ApproveChatJoinRequest(ctx, int64(1), 2)
			return err
		},
		"DeclineChatJoinRequest": func() error {
			_, err := b.DeclineChatJoinRequest(ctx, int64(1), 2)
			return err
		},
	}
	for name, call := range calls {
		err := call()
		if err == nil {
			t.Errorf("%s: expected error", name)
			continue
		}
		var tgErr *types.TelegramError
		if !errors.As(err, &tgErr) {
			t.Errorf("%s: expected *types.TelegramError, got %T", name, err)
			continue
		}
		if tgErr.ErrorCode != 403 {
			t.Errorf("%s: expected error code 403, got %d", name, tgErr.ErrorCode)
		}
	}
}
