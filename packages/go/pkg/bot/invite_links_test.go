package bot_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/types"
)

func TestBot_CreateChatInviteLink(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/bottest_token/createChatInviteLink" {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
		var payload types.CreateChatInviteLinkOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 || payload.Name != "VIP" || payload.MemberLimit != 10 || !payload.CreatesJoinRequest {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[types.ChatInviteLink]{
			Ok: true,
			Result: types.ChatInviteLink{
				InviteLink:         "https://t.me/join/vip",
				CreatesJoinRequest: true,
				MemberLimit:        10,
			},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	link, err := b.CreateChatInviteLink(context.Background(), &types.CreateChatInviteLinkOptions{
		ChatID:             int64(1),
		Name:               "VIP",
		MemberLimit:        10,
		CreatesJoinRequest: true,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if link.InviteLink != "https://t.me/join/vip" {
		t.Errorf("unexpected invite link: %s", link.InviteLink)
	}
}

func TestBot_EditChatInviteLink(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.EditChatInviteLinkOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		if payload.ChatID != "@channel" || payload.InviteLink != "https://t.me/join/old" || payload.MemberLimit != 20 {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[types.ChatInviteLink]{
			Ok: true,
			Result: types.ChatInviteLink{
				InviteLink:  "https://t.me/join/old",
				MemberLimit: 20,
			},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	link, err := b.EditChatInviteLink(context.Background(), &types.EditChatInviteLinkOptions{
		ChatID:      "@channel",
		InviteLink:  "https://t.me/join/old",
		MemberLimit: 20,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if link.MemberLimit != 20 {
		t.Errorf("unexpected member limit: %d", link.MemberLimit)
	}
}

func TestBot_RevokeChatInviteLink(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.RevokeChatInviteLinkOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 || payload.InviteLink != "https://t.me/join/old" {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[types.ChatInviteLink]{
			Ok: true,
			Result: types.ChatInviteLink{
				InviteLink: "https://t.me/join/old",
				IsRevoked:  true,
			},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	link, err := b.RevokeChatInviteLink(context.Background(), &types.RevokeChatInviteLinkOptions{
		ChatID:     int64(1),
		InviteLink: "https://t.me/join/old",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !link.IsRevoked {
		t.Errorf("expected revoked link")
	}
}

func TestBot_CreateChatInviteLink_TelegramError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   403,
			Description: "Forbidden: bot is not an administrator",
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	_, err := b.CreateChatInviteLink(context.Background(), &types.CreateChatInviteLinkOptions{ChatID: int64(1)})
	if err == nil {
		t.Fatalf("expected TelegramError")
	}
	telegramErr, ok := err.(*types.TelegramError)
	if !ok {
		t.Fatalf("expected *types.TelegramError, got %T", err)
	}
	if telegramErr.ErrorCode != 403 {
		t.Errorf("unexpected error code: %d", telegramErr.ErrorCode)
	}
}
