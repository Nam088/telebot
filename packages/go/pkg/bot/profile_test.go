package bot_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func profileServer(t *testing.T, wantMethod string, wantPayload map[string]any, result any) *httptest.Server {
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
		resp := types.Response[any]{Ok: true, Result: result}
		_ = json.NewEncoder(w).Encode(resp)
	}))
}

// jsonEqual compares two values by their JSON representation.
// Both values are round-tripped through encoding/json into plain
// Go values (maps, slices, strings, float64s, bools), so struct field
// order and map key order do not affect the comparison.
func jsonEqual(a, b any) bool {
	aj, err := json.Marshal(a)
	if err != nil {
		return false
	}
	bj, err := json.Marshal(b)
	if err != nil {
		return false
	}
	var av, bv any
	if err := json.Unmarshal(aj, &av); err != nil {
		return false
	}
	if err := json.Unmarshal(bj, &bv); err != nil {
		return false
	}
	return reflect.DeepEqual(av, bv)
}

func TestProfile_LogOut_Close(t *testing.T) {
	t.Run("logOut", func(t *testing.T) {
		srv := profileServer(t, "logOut", nil, true)
		defer srv.Close()
		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		ok, err := b.LogOut(context.Background())
		if err != nil {
			t.Fatalf("LogOut error: %v", err)
		}
		if !ok {
			t.Error("expected true")
		}
	})
	t.Run("close", func(t *testing.T) {
		srv := profileServer(t, "close", nil, true)
		defer srv.Close()
		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		ok, err := b.Close(context.Background())
		if err != nil {
			t.Fatalf("Close error: %v", err)
		}
		if !ok {
			t.Error("expected true")
		}
	})
}

func TestProfile_Name(t *testing.T) {
	srv := profileServer(t, "setMyName", map[string]any{"name": "Bot", "language_code": "en"}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.SetMyName(context.Background(), &types.SetMyNameOptions{Name: "Bot", LanguageCode: "en"})
	if err != nil {
		t.Fatalf("SetMyName error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestProfile_GetMyName(t *testing.T) {
	srv := profileServer(t, "getMyName", map[string]any{"language_code": "en"}, types.BotName{Name: "Bot"})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	name, err := b.GetMyName(context.Background(), &types.GetMyNameOptions{LanguageCode: "en"})
	if err != nil {
		t.Fatalf("GetMyName error: %v", err)
	}
	if name.Name != "Bot" {
		t.Errorf("expected Bot, got %s", name.Name)
	}
}

func TestProfile_Description(t *testing.T) {
	srv := profileServer(t, "setMyDescription", map[string]any{"description": "desc", "language_code": "en"}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.SetMyDescription(context.Background(), &types.SetMyDescriptionOptions{Description: "desc", LanguageCode: "en"})
	if err != nil {
		t.Fatalf("SetMyDescription error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestProfile_GetMyDescription(t *testing.T) {
	srv := profileServer(t, "getMyDescription", map[string]any{"language_code": "en"}, types.BotDescription{Description: "desc"})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	desc, err := b.GetMyDescription(context.Background(), &types.GetMyDescriptionOptions{LanguageCode: "en"})
	if err != nil {
		t.Fatalf("GetMyDescription error: %v", err)
	}
	if desc.Description != "desc" {
		t.Errorf("expected desc, got %s", desc.Description)
	}
}

func TestProfile_ShortDescription(t *testing.T) {
	srv := profileServer(t, "setMyShortDescription", map[string]any{"short_description": "short", "language_code": "en"}, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.SetMyShortDescription(context.Background(), &types.SetMyShortDescriptionOptions{ShortDescription: "short", LanguageCode: "en"})
	if err != nil {
		t.Fatalf("SetMyShortDescription error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestProfile_GetMyShortDescription(t *testing.T) {
	srv := profileServer(t, "getMyShortDescription", map[string]any{"language_code": "en"}, types.BotShortDescription{ShortDescription: "short"})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	desc, err := b.GetMyShortDescription(context.Background(), &types.GetMyShortDescriptionOptions{LanguageCode: "en"})
	if err != nil {
		t.Fatalf("GetMyShortDescription error: %v", err)
	}
	if desc.ShortDescription != "short" {
		t.Errorf("expected short, got %s", desc.ShortDescription)
	}
}

func TestProfile_Commands(t *testing.T) {
	scope := types.BotCommandScopeChat{Type: "chat", ChatID: int64(123)}
	wantPayload := map[string]any{
		"commands": []types.BotCommand{
			{Command: "start", Description: "Start the bot"},
		},
		"scope":         scope,
		"language_code": "en",
	}

	t.Run("setMyCommands", func(t *testing.T) {
		srv := profileServer(t, "setMyCommands", wantPayload, true)
		defer srv.Close()
		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		ok, err := b.SetMyCommands(context.Background(), &types.SetMyCommandsOptions{
			Commands: []types.BotCommand{
				{Command: "start", Description: "Start the bot"},
			},
			Scope:        scope,
			LanguageCode: "en",
		})
		if err != nil {
			t.Fatalf("SetMyCommands error: %v", err)
		}
		if !ok {
			t.Error("expected true")
		}
	})

	t.Run("getMyCommands", func(t *testing.T) {
		want := map[string]any{
			"scope":         scope,
			"language_code": "en",
		}
		srv := profileServer(t, "getMyCommands", want, []types.BotCommand{{Command: "start", Description: "Start the bot"}})
		defer srv.Close()
		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		commands, err := b.GetMyCommands(context.Background(), &types.GetMyCommandsOptions{Scope: scope, LanguageCode: "en"})
		if err != nil {
			t.Fatalf("GetMyCommands error: %v", err)
		}
		if len(commands) != 1 || commands[0].Command != "start" {
			t.Errorf("unexpected commands: %+v", commands)
		}
	})

	t.Run("deleteMyCommands", func(t *testing.T) {
		want := map[string]any{
			"scope":         scope,
			"language_code": "en",
		}
		srv := profileServer(t, "deleteMyCommands", want, true)
		defer srv.Close()
		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		ok, err := b.DeleteMyCommands(context.Background(), &types.DeleteMyCommandsOptions{Scope: scope, LanguageCode: "en"})
		if err != nil {
			t.Fatalf("DeleteMyCommands error: %v", err)
		}
		if !ok {
			t.Error("expected true")
		}
	})
}

func TestProfile_Error(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   400,
			Description: "Bad Request: invalid",
		})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	_, err := b.SetMyName(context.Background(), &types.SetMyNameOptions{Name: "x"})
	if err == nil {
		t.Fatal("expected error")
	}
	var tgErr *types.TelegramError
	if !errors.As(err, &tgErr) {
		t.Fatalf("expected TelegramError, got %T", err)
	}
	if tgErr.ErrorCode != 400 {
		t.Errorf("expected error code 400, got %d", tgErr.ErrorCode)
	}
}
