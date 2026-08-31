package bot_test

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// emptyObjectServer asserts a Bot API method that node calls with a lone
// Record<string, unknown> options argument still sends a JSON object body when
// the Go caller passes no fields (node serialises `{}`, not "no body"), and
// serves result back to the client.
func emptyObjectServer(t *testing.T, wantMethod string, result any) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/"+wantMethod) {
			t.Errorf("expected path to end with /%s, got %s", wantMethod, r.URL.Path)
		}
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("read body: %v", err)
		}
		var got map[string]any
		if jsonErr := json.Unmarshal(body, &got); jsonErr != nil {
			t.Errorf("expected a JSON object request body, got %q (%v)", body, jsonErr)
		}
		if len(got) != 0 {
			t.Errorf("expected an empty object payload, got %s", body)
		}
		if ct := r.Header.Get("Content-Type"); ct != "application/json" {
			t.Errorf("expected Content-Type application/json, got %s", ct)
		}
		_ = json.NewEncoder(w).Encode(types.Response[any]{Ok: true, Result: result})
	}))
}

// TestStoriesExtra_EditStory covers editStory ported from
// packages/node/src/client/methods/business/stories-boosts.ts: the required
// business_connection_id/story_id/content triple plus node's spread options,
// and the typed Story decode.
func TestStoriesExtra_EditStory(t *testing.T) {
	srv := profileServer(t, "editStory", map[string]any{
		"business_connection_id": "bc1",
		"story_id":               int64(42),
		"content":                map[string]any{"type": "video", "video": "BAACAgADAgAC8gU0Ax", "duration": 9.5, "is_animation": true},
		"caption":                "Updated",
		"parse_mode":             "HTML",
	}, types.Story{Chat: types.Chat{ID: -1001234567890}, ID: 42})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	story, err := b.EditStory(context.Background(), "bc1", 42, &types.InputStoryContentVideo{
		Type:        "video",
		Video:       "BAACAgADAgAC8gU0Ax",
		Duration:    9.5,
		IsAnimation: true,
	}, map[string]any{"caption": "Updated", "parse_mode": "HTML"})
	if err != nil {
		t.Fatalf("EditStory error: %v", err)
	}
	if story.ID != 42 || story.Chat.ID != -1001234567890 {
		t.Errorf("unexpected story: %+v", story)
	}
}

// TestStoriesExtra_EditStoryPassesTypedAreas asserts a typed StoryArea slice
// survives the options spread and reaches the wire with snake_case keys.
func TestStoriesExtra_EditStoryPassesTypedAreas(t *testing.T) {
	srv := profileServer(t, "editStory", map[string]any{
		"business_connection_id": "bc1",
		"story_id":               int64(7),
		"areas": []map[string]any{
			{
				"position": map[string]any{
					"x_percentage":             25.5,
					"y_percentage":             60,
					"width_percentage":         20,
					"height_percentage":        10,
					"rotation_angle":           0,
					"corner_radius_percentage": 15,
				},
				"type": map[string]any{"type": "link", "url": "https://example.com"},
			},
		},
	}, types.Story{Chat: types.Chat{ID: 1}, ID: 7})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.EditStory(context.Background(), "bc1", 7, &types.InputStoryContentPhoto{
		Type:  "photo",
		Photo: "AGACQADTAAQCAAFY",
	}, map[string]any{
		"areas": []types.StoryArea{
			{
				Position: types.StoryAreaPosition{
					XPercentage:            25.5,
					YPercentage:            60,
					WidthPercentage:        20,
					HeightPercentage:       10,
					RotationAngle:          0,
					CornerRadiusPercentage: 15,
				},
				Type: types.StoryAreaTypeLink{Type: "link", URL: "https://example.com"},
			},
		},
	}); err != nil {
		t.Fatalf("EditStory error: %v", err)
	}
}

// TestStoriesExtra_EditStoryOmitsOptionalFields asserts node's optional
// caption/parse_mode/areas keys are absent when no options are passed, leaving
// the required triple on the wire.
func TestStoriesExtra_EditStoryOmitsOptionalFields(t *testing.T) {
	srv := omittingServer(t, "editStory", []string{"caption", "parse_mode", "areas"},
		map[string]any{
			"business_connection_id": "bc1",
			"story_id":               int64(3),
			"content":                map[string]any{"type": "photo", "photo": "f1"},
		}, types.Story{Chat: types.Chat{ID: 1}, ID: 3})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.EditStory(context.Background(), "bc1", 3, map[string]any{"type": "photo", "photo": "f1"}, nil); err != nil {
		t.Fatalf("EditStory error: %v", err)
	}
}

// TestStoriesExtra_DeleteStory covers deleteStory's chat_id-style payload and
// boolean result.
func TestStoriesExtra_DeleteStory(t *testing.T) {
	srv := profileServer(t, "deleteStory", map[string]any{
		"business_connection_id": "bc1",
		"story_id":               int64(42),
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.DeleteStory(context.Background(), "bc1", 42)
	if err != nil || !ok {
		t.Fatalf("DeleteStory = (%v, %v)", ok, err)
	}
}

// TestStoriesExtra_RepostStory covers repostStory with its docs params:
// business_connection_id, from_chat_id, from_story_id, active_period and the
// optional post_to_chat_page flag.
func TestStoriesExtra_RepostStory(t *testing.T) {
	srv := profileServer(t, "repostStory", map[string]any{
		"business_connection_id": "bc1",
		"from_chat_id":           int64(-1001234567890),
		"from_story_id":          float64(42),
		"active_period":          float64(86400),
		"post_to_chat_page":      true,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	result, err := b.RepostStory(context.Background(), &types.RepostStoryOptions{
		BusinessConnectionID: "bc1",
		FromChatID:           int64(-1001234567890),
		FromStoryID:          42,
		ActivePeriod:         86400,
		PostToChatPage:       true,
	})
	if err != nil {
		t.Fatalf("RepostStory error: %v", err)
	}
	if result != true {
		t.Errorf("expected bare true result, got %#v", result)
	}
}

// TestStoriesExtra_RepostStoryObjectResult asserts an object-shaped result also
// decodes, which a bool-typed return could not.
func TestStoriesExtra_RepostStoryObjectResult(t *testing.T) {
	srv := profileServer(t, "repostStory", map[string]any{
		"business_connection_id": "bc1",
		"from_chat_id":           "@channel",
		"from_story_id":          float64(1),
		"active_period":          float64(3600),
	}, map[string]any{"chat": map[string]any{"id": float64(1), "type": "private"}, "id": float64(9)})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	result, err := b.RepostStory(context.Background(), &types.RepostStoryOptions{
		BusinessConnectionID: "bc1",
		FromChatID:           "@channel",
		FromStoryID:          1,
		ActivePeriod:         3600,
	})
	if err != nil {
		t.Fatalf("RepostStory error: %v", err)
	}
	story, ok := result.(map[string]any)
	if !ok {
		t.Fatalf("expected map result, got %#v", result)
	}
	if story["id"] != float64(9) {
		t.Errorf("unexpected story id: %v", story["id"])
	}
}

// TestSuggestedPosts_BooleanMethods covers approveSuggestedPost and
// declineSuggestedPost ported from
// packages/node/src/client/methods/business/gifts.ts.
func TestSuggestedPosts_BooleanMethods(t *testing.T) {
	tests := []struct {
		name    string
		wire    string
		payload map[string]any
		invoke  func(b *bot.Bot) (bool, error)
	}{
		{
			name:    "ApproveSuggestedPost",
			wire:    "approveSuggestedPost",
			payload: map[string]any{"chat_id": int64(-1001234567890), "message_id": int64(42)},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.ApproveSuggestedPost(context.Background(), int64(-1001234567890), 42)
			},
		},
		{
			name:    "DeclineSuggestedPost",
			wire:    "declineSuggestedPost",
			payload: map[string]any{"chat_id": "@channel", "message_id": int64(42)},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.DeclineSuggestedPost(context.Background(), "@channel", 42)
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

// TestStoriesExtra_TelegramError asserts the story methods reject with a typed
// error carrying Telegram's error_code.
func TestStoriesExtra_TelegramError(t *testing.T) {
	srv := telegramErrorServer(403, "Forbidden: story not found")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if story, err := b.EditStory(context.Background(), "bc1", 1, nil, nil); story != nil {
		t.Errorf("expected nil story on error, got %+v", story)
	} else {
		requireTelegramError(t, err, 403)
	}
	if ok, err := b.DeleteStory(context.Background(), "bc1", 1); ok {
		t.Errorf("expected false on error")
	} else {
		requireTelegramError(t, err, 403)
	}
	if _, err := b.RepostStory(context.Background(), &types.RepostStoryOptions{BusinessConnectionID: "bc1", FromChatID: int64(1), FromStoryID: 1, ActivePeriod: 3600}); err == nil {
		t.Errorf("expected repostStory to reject")
	}
	if _, err := b.ApproveSuggestedPost(context.Background(), int64(1), 1); err == nil {
		t.Errorf("expected approveSuggestedPost to reject")
	}
}
