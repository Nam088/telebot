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

// omittingServer is profileServer plus a negative assertion: absent is a list
// of payload keys that must NOT be serialized. profileServer only checks that
// expected keys are present, so optional-parameter omission needs this.
func omittingServer(t *testing.T, wantMethod string, absent []string, wantPayload map[string]any, result any) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/"+wantMethod) {
			t.Errorf("expected path to end with /%s, got %s", wantMethod, r.URL.Path)
		}
		var got map[string]any
		if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
			t.Fatalf("decode body: %v", err)
		}
		for _, k := range absent {
			if _, present := got[k]; present {
				t.Errorf("payload field %q should be omitted, got %v", k, got[k])
			}
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
		_ = json.NewEncoder(w).Encode(types.Response[any]{Ok: true, Result: result})
	}))
}

// TestTopics_ForumTopicBooleanMethods covers the ten forum topic methods ported
// from packages/node/src/client/methods/topics/topics.ts that return True on
// success. Each case asserts the camelCase wire method name in the request
// path, the snake_case payload keys, and that a `true` result decodes.
func TestTopics_ForumTopicBooleanMethods(t *testing.T) {
	tests := []struct {
		name    string
		wire    string
		payload map[string]any
		invoke  func(b *bot.Bot) (bool, error)
	}{
		{
			name: "EditForumTopic",
			wire: "editForumTopic",
			payload: map[string]any{
				"chat_id":              -1001234567890,
				"message_thread_id":    42,
				"name":                 "Updated Announcements",
				"icon_custom_emoji_id": "5368323575420792074",
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.EditForumTopic(context.Background(), &types.EditForumTopicOptions{
					ChatID:            int64(-1001234567890),
					MessageThreadID:   42,
					Name:              "Updated Announcements",
					IconCustomEmojiID: "5368323575420792074",
				})
			},
		},
		{
			name: "ReopenForumTopic",
			wire: "reopenForumTopic",
			payload: map[string]any{
				"chat_id":           -1001234567890,
				"message_thread_id": 42,
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.ReopenForumTopic(context.Background(), int64(-1001234567890), 42)
			},
		},
		{
			name: "DeleteForumTopic",
			wire: "deleteForumTopic",
			payload: map[string]any{
				"chat_id":           -1001234567890,
				"message_thread_id": 42,
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.DeleteForumTopic(context.Background(), int64(-1001234567890), 42)
			},
		},
		{
			name: "UnpinAllForumTopicMessages",
			wire: "unpinAllForumTopicMessages",
			payload: map[string]any{
				"chat_id":           -1001234567890,
				"message_thread_id": 42,
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.UnpinAllForumTopicMessages(context.Background(), int64(-1001234567890), 42)
			},
		},
		{
			name: "EditGeneralForumTopic",
			wire: "editGeneralForumTopic",
			payload: map[string]any{
				"chat_id": -1001234567890,
				"name":    "General Chat",
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.EditGeneralForumTopic(context.Background(), int64(-1001234567890), "General Chat")
			},
		},
		{
			name:    "CloseGeneralForumTopic",
			wire:    "closeGeneralForumTopic",
			payload: map[string]any{"chat_id": -1001234567890},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.CloseGeneralForumTopic(context.Background(), int64(-1001234567890))
			},
		},
		{
			name:    "ReopenGeneralForumTopic",
			wire:    "reopenGeneralForumTopic",
			payload: map[string]any{"chat_id": -1001234567890},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.ReopenGeneralForumTopic(context.Background(), int64(-1001234567890))
			},
		},
		{
			name:    "HideGeneralForumTopic",
			wire:    "hideGeneralForumTopic",
			payload: map[string]any{"chat_id": -1001234567890},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.HideGeneralForumTopic(context.Background(), int64(-1001234567890))
			},
		},
		{
			name:    "UnhideGeneralForumTopic",
			wire:    "unhideGeneralForumTopic",
			payload: map[string]any{"chat_id": -1001234567890},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.UnhideGeneralForumTopic(context.Background(), int64(-1001234567890))
			},
		},
		{
			name:    "UnpinAllGeneralForumTopicMessages",
			wire:    "unpinAllGeneralForumTopicMessages",
			payload: map[string]any{"chat_id": -1001234567890},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.UnpinAllGeneralForumTopicMessages(context.Background(), int64(-1001234567890))
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			srv := profileServer(t, tc.wire, tc.payload, true)
			defer srv.Close()

			b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
			ok, err := tc.invoke(b)
			if err != nil {
				t.Fatalf("%s error: %v", tc.name, err)
			}
			if !ok {
				t.Errorf("%s: expected true result", tc.name)
			}
		})
	}
}

// TestTopics_EditForumTopicOmitsOptionalFields checks that the optional name
// and icon_custom_emoji_id are left out of the wire payload when unset.
func TestTopics_EditForumTopicOmitsOptionalFields(t *testing.T) {
	srv := omittingServer(t, "editForumTopic", []string{"name", "icon_custom_emoji_id"}, map[string]any{
		"chat_id":           -1001234567890,
		"message_thread_id": 42,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.EditForumTopic(context.Background(), &types.EditForumTopicOptions{
		ChatID:          int64(-1001234567890),
		MessageThreadID: 42,
	})
	if err != nil {
		t.Fatalf("EditForumTopic error: %v", err)
	}
	if !ok {
		t.Errorf("expected true result")
	}
}

// TestTopics_ForumTopicTelegramError checks that a Telegram ok:false response
// surfaces as a typed *types.TelegramError for topic methods.
func TestTopics_ForumTopicTelegramError(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: topic is not open")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.ReopenForumTopic(context.Background(), int64(-1001234567890), 42)
	if ok {
		t.Errorf("expected false on error")
	}
	requireTelegramError(t, err, 400)
}
