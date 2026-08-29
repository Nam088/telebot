package bot

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestOnResponseHook(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true,"result":{"id":42}}`))
	}))
	defer server.Close()

	b := NewBot("123:abc", WithBaseURL(server.URL))

	var gotMethod string
	var gotResult json.RawMessage
	off := b.OnResponse(func(method string, result json.RawMessage) {
		gotMethod = method
		gotResult = result
	})

	if _, err := b.GetMe(context.Background()); err != nil {
		t.Fatalf("GetMe failed: %v", err)
	}
	if gotMethod != "getMe" {
		t.Fatalf("expected hook method getMe, got %q", gotMethod)
	}
	if string(gotResult) != `{"id":42}` {
		t.Fatalf("unexpected raw result: %s", gotResult)
	}

	off()
	gotMethod = ""
	if _, err := b.GetMe(context.Background()); err != nil {
		t.Fatalf("GetMe failed after unregister: %v", err)
	}
	if gotMethod != "" {
		t.Fatal("hook still invoked after unregister")
	}
}

func TestOnErrorHook(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"ok":false,"error_code":400,"description":"Bad Request: chat not found"}`))
	}))
	defer server.Close()

	b := NewBot("123:abc", WithBaseURL(server.URL))

	var gotMethod string
	var gotErr error
	off := b.OnError(func(method string, err error) {
		gotMethod = method
		gotErr = err
	})
	defer off()

	_, err := b.SendMessage(context.Background(), &types.SendMessageOptions{ChatID: 1, Text: "hi"})
	if err == nil {
		t.Fatal("expected SendMessage to fail")
	}
	if gotMethod != "sendMessage" {
		t.Fatalf("expected hook method sendMessage, got %q", gotMethod)
	}
	var tgErr *types.TelegramError
	if !errors.As(gotErr, &tgErr) {
		t.Fatalf("expected TelegramError in hook, got %T", gotErr)
	}
	if tgErr.Description != "Bad Request: chat not found" {
		t.Fatalf("unexpected description: %q", tgErr.Description)
	}
}

func TestResponseHookNotInvokedOnError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"ok":false,"error_code":400,"description":"nope"}`))
	}))
	defer server.Close()

	b := NewBot("123:abc", WithBaseURL(server.URL))

	called := false
	off := b.OnResponse(func(string, json.RawMessage) { called = true })
	defer off()

	if _, err := b.GetMe(context.Background()); err == nil {
		t.Fatal("expected GetMe to fail")
	}
	if called {
		t.Fatal("response hook must not run on failed requests")
	}
}
