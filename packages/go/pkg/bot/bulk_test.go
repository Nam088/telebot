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

func TestBot_ForwardMessages(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/forwardMessages") {
			t.Errorf("expected forwardMessages endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["chat_id"] != float64(123) {
			t.Errorf("expected chat_id 123, got %v", payload["chat_id"])
		}
		if payload["from_chat_id"] != "@source" {
			t.Errorf("expected from_chat_id @source, got %v", payload["from_chat_id"])
		}
		ids, ok := payload["message_ids"].([]any)
		if !ok || len(ids) != 3 || ids[0] != float64(11) || ids[1] != float64(12) || ids[2] != float64(13) {
			t.Errorf("expected message_ids [11 12 13], got %v", payload["message_ids"])
		}
		if payload["disable_notification"] != true {
			t.Errorf("expected disable_notification true, got %v", payload["disable_notification"])
		}
		if payload["protect_content"] != true {
			t.Errorf("expected protect_content true, got %v", payload["protect_content"])
		}
		if _, present := payload["message_thread_id"]; present {
			t.Errorf("expected message_thread_id to be omitted when zero, got %v", payload["message_thread_id"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[[]types.MessageId]{
			Ok:     true,
			Result: []types.MessageId{{MessageID: 101}, {MessageID: 102}, {MessageID: 103}},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ids, err := b.ForwardMessages(context.Background(), &types.ForwardMessagesOptions{
		ChatID:              int64(123),
		FromChatID:          "@source",
		MessageIDs:          []int64{11, 12, 13},
		DisableNotification: true,
		ProtectContent:      true,
	})
	if err != nil {
		t.Fatalf("ForwardMessages failed: %v", err)
	}
	if len(ids) != 3 || ids[0].MessageID != 101 || ids[2].MessageID != 103 {
		t.Errorf("unexpected message ids: %v", ids)
	}
}

func TestBot_ForwardMessages_RetryAfter(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   429,
			Description: "Too Many Requests: retry after 7",
			Parameters:  &types.Parameters{RetryAfter: 7},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	_, err := b.ForwardMessages(context.Background(), &types.ForwardMessagesOptions{
		ChatID:     int64(123),
		FromChatID: int64(456),
		MessageIDs: []int64{1},
	})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	te, ok := err.(*types.TelegramError)
	if !ok {
		t.Fatalf("expected *types.TelegramError, got %T", err)
	}
	if te.ErrorCode != 429 {
		t.Errorf("expected error code 429, got %d", te.ErrorCode)
	}
	if te.Parameters == nil || te.Parameters.RetryAfter != 7 {
		t.Errorf("expected retry_after 7, got %v", te.Parameters)
	}
}

func TestBot_ForwardMessages_NetworkError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	serverURL := server.URL
	server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(serverURL))
	_, err := b.ForwardMessages(context.Background(), &types.ForwardMessagesOptions{
		ChatID:     int64(123),
		FromChatID: int64(456),
		MessageIDs: []int64{1},
	})
	if err == nil {
		t.Fatal("expected network error, got nil")
	}
	if _, ok := err.(*types.TelegramError); ok {
		t.Errorf("expected transport error, got TelegramError: %v", err)
	}
}

func TestBot_CopyMessages(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/copyMessages") {
			t.Errorf("expected copyMessages endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["chat_id"] != "@target" {
			t.Errorf("expected chat_id @target, got %v", payload["chat_id"])
		}
		if payload["from_chat_id"] != float64(456) {
			t.Errorf("expected from_chat_id 456, got %v", payload["from_chat_id"])
		}
		ids, ok := payload["message_ids"].([]any)
		if !ok || len(ids) != 2 || ids[0] != float64(1) || ids[1] != float64(2) {
			t.Errorf("expected message_ids [1 2], got %v", payload["message_ids"])
		}
		if payload["remove_caption"] != true {
			t.Errorf("expected remove_caption true, got %v", payload["remove_caption"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[[]types.MessageId]{
			Ok:     true,
			Result: []types.MessageId{{MessageID: 201}, {MessageID: 202}},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ids, err := b.CopyMessages(context.Background(), &types.CopyMessagesOptions{
		ChatID:        "@target",
		FromChatID:    int64(456),
		MessageIDs:    []int64{1, 2},
		RemoveCaption: true,
	})
	if err != nil {
		t.Fatalf("CopyMessages failed: %v", err)
	}
	if len(ids) != 2 || ids[0].MessageID != 201 || ids[1].MessageID != 202 {
		t.Errorf("unexpected message ids: %v", ids)
	}
}

func TestBot_CopyMessages_TelegramError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   400,
			Description: "Bad Request: message to copy not found",
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	_, err := b.CopyMessages(context.Background(), &types.CopyMessagesOptions{
		ChatID:     int64(123),
		FromChatID: int64(456),
		MessageIDs: []int64{999},
	})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	te, ok := err.(*types.TelegramError)
	if !ok {
		t.Fatalf("expected *types.TelegramError, got %T", err)
	}
	if te.ErrorCode != 400 {
		t.Errorf("expected error code 400, got %d", te.ErrorCode)
	}
	if !strings.Contains(te.Description, "message to copy not found") {
		t.Errorf("unexpected description: %s", te.Description)
	}
	if te.Parameters != nil {
		t.Errorf("expected nil parameters, got %v", te.Parameters)
	}
}

func TestBot_DeleteMessages(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/deleteMessages") {
			t.Errorf("expected deleteMessages endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["chat_id"] != float64(789) {
			t.Errorf("expected chat_id 789, got %v", payload["chat_id"])
		}
		ids, ok := payload["message_ids"].([]any)
		if !ok || len(ids) != 2 || ids[0] != float64(5) || ids[1] != float64(6) {
			t.Errorf("expected message_ids [5 6], got %v", payload["message_ids"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.DeleteMessages(context.Background(), &types.DeleteMessagesOptions{
		ChatID:     int64(789),
		MessageIDs: []int64{5, 6},
	})
	if err != nil {
		t.Fatalf("DeleteMessages failed: %v", err)
	}
	if !ok {
		t.Errorf("expected true result")
	}
}

func TestBot_DeleteMessages_MalformedResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("{not-json"))
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	_, err := b.DeleteMessages(context.Background(), &types.DeleteMessagesOptions{
		ChatID:     int64(789),
		MessageIDs: []int64{5},
	})
	if err == nil {
		t.Fatal("expected decode error, got nil")
	}
	if _, ok := err.(*types.TelegramError); ok {
		t.Errorf("expected decode error, got TelegramError: %v", err)
	}
}

func TestBot_DeleteMessages_ResultUnmarshalError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// An object result cannot be decoded into the bool that
		// DeleteMessages expects, exercising the result-unmarshal branch.
		_ = json.NewEncoder(w).Encode(types.Response[map[string]any]{
			Ok:     true,
			Result: map[string]any{"unexpected": true},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	_, err := b.DeleteMessages(context.Background(), &types.DeleteMessagesOptions{
		ChatID:     int64(789),
		MessageIDs: []int64{5},
	})
	if err == nil {
		t.Fatal("expected unmarshal error, got nil")
	}
	if _, ok := err.(*types.TelegramError); ok {
		t.Errorf("expected unmarshal error, got TelegramError: %v", err)
	}
}

func TestBot_Request_PayloadMarshalError(t *testing.T) {
	b := bot.NewBot("test_token")
	// Channels cannot be marshaled to JSON, so Request must fail before
	// any HTTP call is made.
	err := b.Request(context.Background(), "deleteMessages", map[string]any{"bad": make(chan int)}, nil)
	if err == nil {
		t.Fatal("expected marshal error, got nil")
	}
}
