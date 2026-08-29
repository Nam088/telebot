package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestRun_MissingToken(t *testing.T) {
	t.Setenv("BOT_TOKEN", "")
	err := run(context.Background())
	if err == nil || !strings.Contains(err.Error(), "BOT_TOKEN") {
		t.Errorf("expected BOT_TOKEN error, got %v", err)
	}
}

func TestRun_CancelledContext(t *testing.T) {
	t.Setenv("BOT_TOKEN", "test-token")

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	err := run(ctx)
	if !errors.Is(err, context.Canceled) {
		t.Errorf("expected context.Canceled, got %v", err)
	}
}

// replyMock records every sendMessage text.
type replyMock struct {
	mu      sync.Mutex
	replies []string
}

func (m *replyMock) start(t *testing.T) {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/sendMessage") {
			var payload struct {
				Text string `json:"text"`
			}
			_ = json.NewDecoder(r.Body).Decode(&payload)
			m.mu.Lock()
			m.replies = append(m.replies, payload.Text)
			m.mu.Unlock()
		}
		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{Ok: true, Result: types.Message{MessageID: 1}})
	}))
	apiBaseURL = server.URL
	t.Cleanup(func() {
		server.Close()
		apiBaseURL = ""
	})
}

func (m *replyMock) texts() []string {
	m.mu.Lock()
	defer m.mu.Unlock()
	return append([]string(nil), m.replies...)
}

func conversationUpdate(id int64, text string) *types.Update {
	return &types.Update{
		UpdateID: id,
		Message: &types.Message{
			MessageID: id * 10,
			Text:      text,
			Chat:      &types.Chat{ID: 100, Type: "private"},
			From:      &types.User{ID: 200, FirstName: "Tester"},
		},
	}
}

func newConversationRouter() *routing.Router {
	router := routing.NewRouter(newBot("token"))
	buildConversation().Register(router)
	return router
}

func TestConversation_FullRegistrationFlow(t *testing.T) {
	mock := &replyMock{}
	mock.start(t)
	router := newConversationRouter()
	ctx := context.Background()

	steps := []string{"/register", "Alice Doe", "30"}
	for i, text := range steps {
		if err := router.ProcessUpdate(ctx, conversationUpdate(int64(i+1), text)); err != nil {
			t.Fatalf("step %q failed: %v", text, err)
		}
	}

	replies := mock.texts()
	if len(replies) != 3 {
		t.Fatalf("expected 3 replies, got %v", replies)
	}
	if !strings.Contains(replies[0], "full name") {
		t.Errorf("unexpected entry reply: %q", replies[0])
	}
	if !strings.Contains(replies[1], "Thanks Alice Doe") {
		t.Errorf("unexpected name reply: %q", replies[1])
	}
	if !strings.Contains(replies[2], "Age: 30") {
		t.Errorf("unexpected completion reply: %q", replies[2])
	}
}

func TestConversation_EntryIgnoresOtherCommands(t *testing.T) {
	mock := &replyMock{}
	mock.start(t)
	router := newConversationRouter()

	// A non-/register command enters the entry point and ends immediately.
	if err := router.ProcessUpdate(context.Background(), conversationUpdate(1, "/other")); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(mock.texts()) != 0 {
		t.Errorf("expected no replies for non-entry command, got %v", mock.texts())
	}
}

func TestConversation_FallbackCancel(t *testing.T) {
	mock := &replyMock{}
	mock.start(t)
	router := newConversationRouter()
	ctx := context.Background()

	if err := router.ProcessUpdate(ctx, conversationUpdate(1, "/register")); err != nil {
		t.Fatalf("entry failed: %v", err)
	}
	if err := router.ProcessUpdate(ctx, conversationUpdate(2, "/cancel")); err != nil {
		t.Fatalf("cancel failed: %v", err)
	}

	replies := mock.texts()
	if len(replies) != 2 || !strings.Contains(replies[1], "cancelled") {
		t.Fatalf("expected welcome + cancel replies, got %v", replies)
	}

	// After cancellation the conversation is inactive: plain text is ignored.
	if err := router.ProcessUpdate(ctx, conversationUpdate(3, "hello")); err != nil {
		t.Fatalf("post-cancel update failed: %v", err)
	}
	if len(mock.texts()) != 2 {
		t.Errorf("no further replies expected after cancel, got %v", mock.texts())
	}
}

func TestConversation_FallbackUnknownCommandRestarts(t *testing.T) {
	mock := &replyMock{}
	mock.start(t)
	router := newConversationRouter()
	ctx := context.Background()

	if err := router.ProcessUpdate(ctx, conversationUpdate(1, "/register")); err != nil {
		t.Fatalf("entry failed: %v", err)
	}
	// Unknown command inside the conversation hits the fallback and keeps the
	// user in StateName.
	if err := router.ProcessUpdate(ctx, conversationUpdate(2, "/whatever")); err != nil {
		t.Fatalf("fallback failed: %v", err)
	}
	// The state route still works afterwards.
	if err := router.ProcessUpdate(ctx, conversationUpdate(3, "Bob")); err != nil {
		t.Fatalf("state update failed: %v", err)
	}

	replies := mock.texts()
	if len(replies) != 2 {
		t.Fatalf("expected welcome + name replies, got %v", replies)
	}
	if !strings.Contains(replies[1], "Thanks Bob") {
		t.Errorf("expected name prompt after fallback restart, got %q", replies[1])
	}
}

func TestNewBot_DefaultBaseURL(t *testing.T) {
	apiBaseURL = ""
	if b := newBot("token"); b == nil || b.Token() != "token" {
		t.Error("newBot should preserve the token with the default base URL")
	}
}
