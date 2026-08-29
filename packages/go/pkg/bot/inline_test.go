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

func inlineServer(t *testing.T, wantMethod string, wantPayload map[string]any, result any) *httptest.Server {
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

func TestInline_AnswerInlineQuery(t *testing.T) {
	want := map[string]any{
		"inline_query_id": "q1",
		"results": []types.InlineQueryResult{
			{"type": "article", "id": "1", "title": "A"},
		},
		"cache_time":  60,
		"is_personal": true,
		"next_offset": "off",
	}
	srv := inlineServer(t, "answerInlineQuery", want, true)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	ok, err := b.AnswerInlineQuery(context.Background(), &types.AnswerInlineQueryOptions{
		InlineQueryID: "q1",
		Results: []types.InlineQueryResult{
			{"type": "article", "id": "1", "title": "A"},
		},
		CacheTime:  60,
		IsPersonal: true,
		NextOffset: "off",
	})
	if err != nil {
		t.Fatalf("AnswerInlineQuery error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestInline_AnswerWebAppQuery(t *testing.T) {
	want := map[string]any{
		"web_app_query_id": "w1",
		"result":           types.InlineQueryResult{"type": "article", "id": "2"},
	}
	srv := inlineServer(t, "answerWebAppQuery", want, types.SentWebAppMessage{InlineMessageID: "im1"})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	msg, err := b.AnswerWebAppQuery(context.Background(), &types.AnswerWebAppQueryOptions{
		WebAppQueryID: "w1",
		Result:        types.InlineQueryResult{"type": "article", "id": "2"},
	})
	if err != nil {
		t.Fatalf("AnswerWebAppQuery error: %v", err)
	}
	if msg.InlineMessageID != "im1" {
		t.Errorf("expected im1, got %s", msg.InlineMessageID)
	}
}

func TestInline_SavePreparedInlineMessage(t *testing.T) {
	want := map[string]any{
		"user_id":             float64(123),
		"result":              types.InlineQueryResult{"type": "article", "id": "3"},
		"allow_user_chats":    true,
		"allow_channel_chats": true,
	}
	srv := inlineServer(t, "savePreparedInlineMessage", want, types.PreparedInlineMessage{
		ID:             "prep1",
		ExpirationDate: 123456789,
	})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	msg, err := b.SavePreparedInlineMessage(context.Background(), &types.SavePreparedInlineMessageOptions{
		UserID:            123,
		Result:            types.InlineQueryResult{"type": "article", "id": "3"},
		AllowUserChats:    true,
		AllowChannelChats: true,
	})
	if err != nil {
		t.Fatalf("SavePreparedInlineMessage error: %v", err)
	}
	if msg.ID != "prep1" {
		t.Errorf("expected prep1, got %s", msg.ID)
	}
}

func TestInline_Error(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   400,
			Description: "Bad Request: invalid result",
		})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	_, err := b.AnswerInlineQuery(context.Background(), &types.AnswerInlineQueryOptions{
		InlineQueryID: "q1",
		Results:       []types.InlineQueryResult{},
	})
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
