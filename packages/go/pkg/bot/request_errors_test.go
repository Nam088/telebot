package bot_test

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestBot_TokenAndOptions(t *testing.T) {
	b := bot.NewBot("my_token",
		bot.WithHTTPClient(&http.Client{}),
		bot.WithMaxRetries(5),
		bot.WithBaseURL("http://localhost:1"),
	)
	if b.Token() != "my_token" {
		t.Errorf("Token() = %q, want my_token", b.Token())
	}
}

func TestBot_GetMe_InvalidToken(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		fmt.Fprint(w, `{"ok":false,"error_code":401,"description":"Unauthorized"}`)
	}))
	defer server.Close()

	b := bot.NewBot("invalid_token", bot.WithBaseURL(server.URL))
	_, err := b.GetMe(context.Background())
	if err == nil {
		t.Fatal("expected error for invalid token")
	}

	var tgErr *types.TelegramError
	if !errors.As(err, &tgErr) {
		t.Fatalf("expected *types.TelegramError, got %T: %v", err, err)
	}
	if tgErr.ErrorCode != 401 || tgErr.Description != "Unauthorized" {
		t.Errorf("unexpected telegram error: %+v", tgErr)
	}
}

func TestBot_SendMessage_TooManyRequestsCarriesRetryAfter(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTooManyRequests)
		fmt.Fprint(w, `{"ok":false,"error_code":429,"description":"Too Many Requests","parameters":{"retry_after":5}}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	_, err := b.SendMessage(context.Background(), &types.SendMessageOptions{ChatID: 1, Text: "hi"})
	if err == nil {
		t.Fatal("expected 429 error")
	}

	var tgErr *types.TelegramError
	if !errors.As(err, &tgErr) {
		t.Fatalf("expected *types.TelegramError, got %T", err)
	}
	if tgErr.ErrorCode != 429 {
		t.Errorf("expected error code 429, got %d", tgErr.ErrorCode)
	}
	if tgErr.Parameters == nil || tgErr.Parameters.RetryAfter != 5 {
		t.Errorf("expected retry_after=5 to be surfaced, got %+v", tgErr.Parameters)
	}
}

func TestBot_Request_MalformedResponseBody(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `this is not json`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	_, err := b.GetMe(context.Background())
	if err == nil {
		t.Fatal("expected decode error for malformed response")
	}
}

func TestBot_GetUpdates_MalformedUpdate(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// update_id must be a number; a string makes the update malformed.
		fmt.Fprint(w, `{"ok":true,"result":[{"update_id":"not-a-number"}]}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	_, err := b.GetUpdates(context.Background(), &types.GetUpdatesOptions{})
	if err == nil {
		t.Fatal("expected error for malformed update payload")
	}
}

func TestBot_Request_UnmarshalablePayload(t *testing.T) {
	b := bot.NewBot("token", bot.WithBaseURL("http://127.0.0.1:1"))
	// Channels cannot be marshalled to JSON.
	err := b.Request(context.Background(), "anyMethod", map[string]any{"bad": make(chan int)}, nil)
	if err == nil {
		t.Fatal("expected marshal error for un-marshalable payload")
	}
}

func TestBot_Request_InvalidBaseURL(t *testing.T) {
	b := bot.NewBot("token", bot.WithBaseURL("://invalid"))
	err := b.Request(context.Background(), "getMe", nil, nil)
	if err == nil {
		t.Fatal("expected request construction error for invalid base URL")
	}
}

func TestBot_Request_ConnectionFailure(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	url := server.URL
	server.Close() // immediately unreachable

	b := bot.NewBot("token", bot.WithBaseURL(url))
	_, err := b.GetMe(context.Background())
	if err == nil {
		t.Fatal("expected transport error against closed server")
	}
}

func TestBot_Request_CancelledContext(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"ok":true,"result":{}}`)
	}))
	defer server.Close()

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	if _, err := b.GetMe(ctx); err == nil {
		t.Fatal("expected error for cancelled context")
	}
}

func TestBot_Request_OkWithoutResult(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"ok":true}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	// No result field and a nil target must not error.
	if err := b.Request(context.Background(), "logOut", nil, nil); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
}

func TestBot_GetUpdates_Success(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"ok":true,"result":[{"update_id":1,"message":{"message_id":2,"text":"hello"}}]}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	updates, err := b.GetUpdates(context.Background(), &types.GetUpdatesOptions{Offset: 1, Timeout: 30})
	if err != nil {
		t.Fatalf("GetUpdates failed: %v", err)
	}
	if len(updates) != 1 || updates[0].UpdateID != 1 || updates[0].Message.Text != "hello" {
		t.Errorf("unexpected updates: %+v", updates)
	}
}

func TestBot_GetUpdates_Error(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"ok":false,"error_code":400,"description":"Bad Request"}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	if _, err := b.GetUpdates(context.Background(), nil); err == nil {
		t.Fatal("expected error")
	}
}

func TestBot_AnswerCallbackQuery(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"ok":true,"result":true}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ok, err := b.AnswerCallbackQuery(context.Background(), &types.AnswerCallbackQueryOptions{CallbackQueryID: "cb"})
	if err != nil || !ok {
		t.Fatalf("AnswerCallbackQuery = (%v, %v), want (true, nil)", ok, err)
	}
}

func TestBot_DeleteMessage(t *testing.T) {
	var payload map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewDecoder(r.Body).Decode(&payload)
		fmt.Fprint(w, `{"ok":true,"result":true}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ok, err := b.DeleteMessage(context.Background(), int64(100), int64(7))
	if err != nil || !ok {
		t.Fatalf("DeleteMessage = (%v, %v), want (true, nil)", ok, err)
	}
	if payload["chat_id"] != float64(100) || payload["message_id"] != float64(7) {
		t.Errorf("unexpected payload: %v", payload)
	}
}

func TestBot_SendMessage_Error(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"ok":false,"error_code":403,"description":"bot was blocked by the user"}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	_, err := b.SendMessage(context.Background(), &types.SendMessageOptions{ChatID: 1, Text: "x"})
	var tgErr *types.TelegramError
	if !errors.As(err, &tgErr) || tgErr.ErrorCode != 403 {
		t.Fatalf("expected 403 TelegramError, got %v", err)
	}
}
