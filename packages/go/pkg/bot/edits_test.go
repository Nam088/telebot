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

func editServer(t *testing.T, wantMethod string, wantPayload map[string]any, result any) *httptest.Server {
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

func TestEdits_EditMessageCaption(t *testing.T) {
	srv := editServer(t, "editMessageCaption", map[string]any{
		"chat_id":    float64(1),
		"message_id": float64(7),
		"caption":    "new caption",
		"parse_mode": "HTML",
	}, types.Message{MessageID: 7, Caption: "new caption"})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	msg, err := b.EditMessageCaption(context.Background(), &types.EditMessageCaptionOptions{
		ChatID:    int64(1),
		MessageID: 7,
		Caption:   "new caption",
		ParseMode: "HTML",
	})
	if err != nil {
		t.Fatalf("EditMessageCaption error: %v", err)
	}
	if msg.MessageID != 7 || msg.Caption != "new caption" {
		t.Errorf("unexpected message: %+v", msg)
	}
}

func TestEdits_EditMessageMedia(t *testing.T) {
	srv := editServer(t, "editMessageMedia", map[string]any{
		"chat_id":    float64(1),
		"message_id": float64(7),
		"media": map[string]any{
			"type":  "photo",
			"media": "https://example.com/new.jpg",
		},
	}, types.Message{MessageID: 7})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	msg, err := b.EditMessageMedia(context.Background(), &types.EditMessageMediaOptions{
		ChatID:    int64(1),
		MessageID: 7,
		Media:     types.InputMediaPhoto{Type: "photo", Media: "https://example.com/new.jpg"},
	})
	if err != nil {
		t.Fatalf("EditMessageMedia error: %v", err)
	}
	if msg.MessageID != 7 {
		t.Errorf("unexpected message: %+v", msg)
	}
}

func TestEdits_EditMessageLiveLocation(t *testing.T) {
	srv := editServer(t, "editMessageLiveLocation", map[string]any{
		"chat_id":    float64(1),
		"message_id": float64(7),
		"latitude":   37.5,
		"longitude":  -122.5,
		"heading":    float64(90),
	}, types.Message{MessageID: 7})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	msg, err := b.EditMessageLiveLocation(context.Background(), &types.EditMessageLiveLocationOptions{
		ChatID:    int64(1),
		MessageID: 7,
		Latitude:  37.5,
		Longitude: -122.5,
		Heading:   90,
	})
	if err != nil {
		t.Fatalf("EditMessageLiveLocation error: %v", err)
	}
	if msg.MessageID != 7 {
		t.Errorf("unexpected message: %+v", msg)
	}
}

func TestEdits_StopMessageLiveLocation(t *testing.T) {
	srv := editServer(t, "stopMessageLiveLocation", map[string]any{
		"chat_id":    "@channel",
		"message_id": float64(7),
	}, types.Message{MessageID: 7})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	msg, err := b.StopMessageLiveLocation(context.Background(), &types.StopMessageLiveLocationOptions{
		ChatID:    "@channel",
		MessageID: 7,
	})
	if err != nil {
		t.Fatalf("StopMessageLiveLocation error: %v", err)
	}
	if msg.MessageID != 7 {
		t.Errorf("unexpected message: %+v", msg)
	}
}

func TestEdits_StopPoll(t *testing.T) {
	srv := editServer(t, "stopPoll", map[string]any{
		"chat_id":    float64(1),
		"message_id": float64(7),
	}, types.Poll{
		ID:              "poll_1",
		Question:        "Favorite color?",
		TotalVoterCount: 3,
		IsClosed:        true,
	})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	poll, err := b.StopPoll(context.Background(), &types.StopPollOptions{
		ChatID:    int64(1),
		MessageID: 7,
	})
	if err != nil {
		t.Fatalf("StopPoll error: %v", err)
	}
	if poll.ID != "poll_1" || poll.TotalVoterCount != 3 || !poll.IsClosed {
		t.Errorf("unexpected poll: %+v", poll)
	}
}

func TestEdits_TelegramError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   400,
			Description: "Bad Request: message to edit not found",
		})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ctx := context.Background()

	calls := map[string]func() error{
		"EditMessageCaption": func() error {
			_, err := b.EditMessageCaption(ctx, &types.EditMessageCaptionOptions{ChatID: int64(1), MessageID: 2})
			return err
		},
		"EditMessageMedia": func() error {
			_, err := b.EditMessageMedia(ctx, &types.EditMessageMediaOptions{ChatID: int64(1), MessageID: 2})
			return err
		},
		"EditMessageLiveLocation": func() error {
			_, err := b.EditMessageLiveLocation(ctx, &types.EditMessageLiveLocationOptions{ChatID: int64(1), MessageID: 2})
			return err
		},
		"StopMessageLiveLocation": func() error {
			_, err := b.StopMessageLiveLocation(ctx, &types.StopMessageLiveLocationOptions{ChatID: int64(1), MessageID: 2})
			return err
		},
		"StopPoll": func() error {
			_, err := b.StopPoll(ctx, &types.StopPollOptions{ChatID: int64(1), MessageID: 2})
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
