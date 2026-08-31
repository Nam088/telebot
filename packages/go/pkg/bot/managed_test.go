package bot_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestManagedBot_GetAccessSettings covers getManagedBotAccessSettings, which
// keys on user_id (NOT bot_id) per
// https://core.telegram.org/bots/api#getmanagedbotaccesssettings and returns a
// BotAccessSettings object.
func TestManagedBot_GetAccessSettings(t *testing.T) {
	srv := profileServer(t, "getManagedBotAccessSettings",
		map[string]any{"user_id": float64(123456)},
		map[string]any{
			"is_access_restricted": true,
			"added_user_ids":       []any{float64(7), float64(8)},
		})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	settings, err := b.GetManagedBotAccessSettings(context.Background(), 123456)
	if err != nil {
		t.Fatalf("GetManagedBotAccessSettings error: %v", err)
	}
	if settings == nil {
		t.Fatal("expected non-nil settings")
	}
	if !settings.IsAccessRestricted {
		t.Errorf("expected IsAccessRestricted true")
	}
	if len(settings.AddedUserIDs) != 2 || settings.AddedUserIDs[0] != 7 || settings.AddedUserIDs[1] != 8 {
		t.Errorf("unexpected AddedUserIDs: %v", settings.AddedUserIDs)
	}
}

// TestManagedBot_SetAccessSettings covers setManagedBotAccessSettings: the
// method is keyed by user_id, is_access_restricted is REQUIRED and always
// serialized (even when false), and added_user_ids is optional.
func TestManagedBot_SetAccessSettings(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/setManagedBotAccessSettings") {
			t.Errorf("expected path to end with /setManagedBotAccessSettings, got %s", r.URL.Path)
		}
		var got map[string]json.RawMessage
		if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
			t.Fatalf("decode body: %v", err)
		}
		if string(got["user_id"]) != `123456` {
			t.Errorf("unexpected user_id: %s", got["user_id"])
		}
		// The required flag must be present even when false.
		if string(got["is_access_restricted"]) != `false` {
			t.Errorf("expected is_access_restricted false, got %s", got["is_access_restricted"])
		}
		if raw, exists := got["added_user_ids"]; exists {
			t.Errorf("expected added_user_ids omitted, got %s", raw)
		}
		if _, exists := got["bot_id"]; exists {
			t.Errorf("bot_id must never be sent, got %s", got["bot_id"])
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.SetManagedBotAccessSettings(context.Background(), &types.SetManagedBotAccessSettingsOptions{
		UserID:             123456,
		IsAccessRestricted: false,
	})
	if err != nil {
		t.Fatalf("SetManagedBotAccessSettings error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

// TestManagedBot_SetAccessSettings_WithAddedUsers asserts the optional
// added_user_ids list is serialized when set.
func TestManagedBot_SetAccessSettings_WithAddedUsers(t *testing.T) {
	srv := profileServer(t, "setManagedBotAccessSettings",
		map[string]any{
			"user_id":              float64(123456),
			"is_access_restricted": true,
			"added_user_ids":       []any{float64(7), float64(8)},
		}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.SetManagedBotAccessSettings(context.Background(), &types.SetManagedBotAccessSettingsOptions{
		UserID:             123456,
		IsAccessRestricted: true,
		AddedUserIDs:       []int64{7, 8},
	})
	if err != nil {
		t.Fatalf("SetManagedBotAccessSettings error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

// TestManagedBot_GetToken covers getManagedBotToken (keyed by user_id) which
// returns a BotToken object.
func TestManagedBot_GetToken(t *testing.T) {
	srv := profileServer(t, "getManagedBotToken",
		map[string]any{"user_id": float64(123456)},
		map[string]any{"token": "123456:ABC-DEF"})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	tok, err := b.GetManagedBotToken(context.Background(), 123456)
	if err != nil {
		t.Fatalf("GetManagedBotToken error: %v", err)
	}
	if tok == nil || tok.Token != "123456:ABC-DEF" {
		t.Fatalf("unexpected token: %+v", tok)
	}
}

// TestManagedBot_ReplaceToken covers replaceManagedBotToken (keyed by user_id),
// which regenerates and returns a fresh BotToken object.
func TestManagedBot_ReplaceToken(t *testing.T) {
	srv := profileServer(t, "replaceManagedBotToken",
		map[string]any{"user_id": float64(123456)},
		map[string]any{"token": "123456:XYZ-789"})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	tok, err := b.ReplaceManagedBotToken(context.Background(), 123456)
	if err != nil {
		t.Fatalf("ReplaceManagedBotToken error: %v", err)
	}
	if tok == nil || tok.Token != "123456:XYZ-789" {
		t.Fatalf("unexpected token: %+v", tok)
	}
}
