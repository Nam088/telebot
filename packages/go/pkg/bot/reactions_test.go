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

func reactionServer(t *testing.T, wantPayload map[string]any) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/setMessageReaction") {
			t.Errorf("expected path to end with /setMessageReaction, got %s", r.URL.Path)
		}
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
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
}

func TestReactions_SetMessageReaction(t *testing.T) {
	srv := reactionServer(t, map[string]any{
		"chat_id":    float64(1),
		"message_id": float64(7),
		"reaction": []any{
			map[string]any{"type": "emoji", "emoji": "👍"},
		},
		"is_big": true,
	})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.SetMessageReaction(context.Background(), &types.SetMessageReactionOptions{
		ChatID:    int64(1),
		MessageID: 7,
		Reaction: []types.ReactionType{
			types.ReactionTypeEmoji{Type: "emoji", Emoji: "👍"},
		},
		IsBig: true,
	})
	if err != nil {
		t.Fatalf("SetMessageReaction error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestReactions_SetMessageReaction_CustomEmoji(t *testing.T) {
	srv := reactionServer(t, map[string]any{
		"chat_id":    "@channel",
		"message_id": float64(7),
		"reaction": []any{
			map[string]any{"type": "custom_emoji", "custom_emoji_id": "5368324170671202286"},
		},
	})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.SetMessageReaction(context.Background(), &types.SetMessageReactionOptions{
		ChatID:    "@channel",
		MessageID: 7,
		Reaction: []types.ReactionType{
			types.ReactionTypeCustomEmoji{Type: "custom_emoji", CustomEmojiID: "5368324170671202286"},
		},
	})
	if err != nil {
		t.Fatalf("SetMessageReaction error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestReactions_SetMessageReaction_OmittedFields(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var got map[string]json.RawMessage
		if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
			t.Fatalf("decode body: %v", err)
		}
		if raw, exists := got["reaction"]; exists {
			t.Errorf("expected reaction to be omitted, got %s", raw)
		}
		if raw, exists := got["is_big"]; exists {
			t.Errorf("expected is_big to be omitted, got %s", raw)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.SetMessageReaction(context.Background(), &types.SetMessageReactionOptions{
		ChatID:    int64(1),
		MessageID: 7,
	})
	if err != nil {
		t.Fatalf("SetMessageReaction error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestReactions_DeleteMessageReaction(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/deleteMessageReaction") {
			t.Errorf("expected path to end with /deleteMessageReaction, got %s", r.URL.Path)
		}
		var got map[string]json.RawMessage
		if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
			t.Fatalf("decode body: %v", err)
		}
		if string(got["chat_id"]) != `1` {
			t.Errorf("unexpected chat_id: %s", got["chat_id"])
		}
		if string(got["message_id"]) != `7` {
			t.Errorf("unexpected message_id: %s", got["message_id"])
		}
		if string(got["user_id"]) != `42` {
			t.Errorf("unexpected user_id: %s", got["user_id"])
		}
		// reaction/is_big belong to setMessageReaction, not the real endpoint.
		if raw, exists := got["reaction"]; exists {
			t.Errorf("expected reaction to be absent, got %s", raw)
		}
		if raw, exists := got["is_big"]; exists {
			t.Errorf("expected is_big to be absent, got %s", raw)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.DeleteMessageReaction(context.Background(), &types.DeleteMessageReactionOptions{
		ChatID:    int64(1),
		MessageID: 7,
		UserID:    42,
	})
	if err != nil {
		t.Fatalf("DeleteMessageReaction error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestReactions_DeleteAllMessageReactions(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/deleteAllMessageReactions") {
			t.Errorf("expected path to end with /deleteAllMessageReactions, got %s", r.URL.Path)
		}
		var got map[string]json.RawMessage
		if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
			t.Fatalf("decode body: %v", err)
		}
		if string(got["chat_id"]) != `"@channel"` {
			t.Errorf("unexpected chat_id: %s", got["chat_id"])
		}
		if string(got["user_id"]) != `42` {
			t.Errorf("unexpected user_id: %s", got["user_id"])
		}
		// deleteAllMessageReactions has no message_id per the Bot API.
		if raw, exists := got["message_id"]; exists {
			t.Errorf("expected message_id to be absent, got %s", raw)
		}
		if raw, exists := got["reaction"]; exists {
			t.Errorf("expected reaction to be absent, got %s", raw)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.DeleteAllMessageReactions(context.Background(), &types.DeleteAllMessageReactionsOptions{
		ChatID: "@channel",
		UserID: 42,
	})
	if err != nil {
		t.Fatalf("DeleteAllMessageReactions error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestReactions_TelegramError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   400,
			Description: "Bad Request: message to react not found",
		})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ctx := context.Background()

	calls := map[string]func() error{
		"SetMessageReaction": func() error {
			_, err := b.SetMessageReaction(ctx, &types.SetMessageReactionOptions{ChatID: int64(1), MessageID: 2})
			return err
		},
		"DeleteMessageReaction": func() error {
			_, err := b.DeleteMessageReaction(ctx, &types.DeleteMessageReactionOptions{ChatID: int64(1), MessageID: 2})
			return err
		},
		"DeleteAllMessageReactions": func() error {
			_, err := b.DeleteAllMessageReactions(ctx, &types.DeleteAllMessageReactionsOptions{ChatID: int64(1)})
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
		if tgErr.ErrorCode != 400 {
			t.Errorf("%s: expected error code 400, got %d", name, tgErr.ErrorCode)
		}
	}
}
