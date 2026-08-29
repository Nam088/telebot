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

func storyServer(t *testing.T, wantMethod string, wantPayload map[string]any, result any) *httptest.Server {
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

func TestStories_PostStory(t *testing.T) {
	srv := storyServer(t, "postStory", map[string]any{
		"business_connection_id": "bc1",
		"content":                map[string]any{"type": "photo", "photo": "https://example.com/pic.jpg"},
		"active_period":          86400,
		"caption":                "Hello",
		"privacy":                "contacts",
	}, types.Story{Chat: types.Chat{ID: 1}, ID: 5})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	story, err := b.PostStory(context.Background(), "bc1",
		map[string]any{"type": "photo", "photo": "https://example.com/pic.jpg"},
		86400, "Hello", "contacts")
	if err != nil {
		t.Fatalf("PostStory error: %v", err)
	}
	if story.ID != 5 || story.Chat.ID != 1 {
		t.Errorf("unexpected story: %+v", story)
	}
}

func TestStories_PostStory_OmitsOptionalFields(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/postStory") {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
		var got map[string]any
		if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
			t.Fatalf("decode body: %v", err)
		}
		if _, present := got["caption"]; present {
			t.Error("caption should be omitted when empty")
		}
		if _, present := got["privacy"]; present {
			t.Error("privacy should be omitted when empty")
		}
		if got["business_connection_id"] != "bc1" {
			t.Errorf("unexpected business_connection_id: %v", got["business_connection_id"])
		}
		if got["active_period"] != float64(3600) {
			t.Errorf("unexpected active_period: %v", got["active_period"])
		}
		_ = json.NewEncoder(w).Encode(types.Response[any]{Ok: true, Result: types.Story{Chat: types.Chat{ID: 1}, ID: 7}})
	}))
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	story, err := b.PostStory(context.Background(), "bc1",
		map[string]any{"type": "photo", "photo": "https://example.com/pic.jpg"},
		3600, "", "")
	if err != nil {
		t.Fatalf("PostStory error: %v", err)
	}
	if story.ID != 7 {
		t.Errorf("unexpected story id: %d", story.ID)
	}
}

func TestStories_PostStory_TelegramError(t *testing.T) {
	srv := telegramErrorServer(403, "Forbidden: business connection not found")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	story, err := b.PostStory(context.Background(), "bc1", map[string]any{"type": "photo"}, 3600, "", "")
	if story != nil {
		t.Errorf("expected nil story, got %+v", story)
	}
	requireTelegramError(t, err, 403)
}
