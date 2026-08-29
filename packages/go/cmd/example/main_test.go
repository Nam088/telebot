package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/Nam088/telebot-go/pkg/types"
)

// apiMock records sendMessage and answerCallbackQuery calls.
type apiMock struct {
	mu       sync.Mutex
	sent     []string
	answered []string
}

func (m *apiMock) start(t *testing.T) {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.HasSuffix(r.URL.Path, "/sendMessage"):
			var payload struct {
				Text string `json:"text"`
			}
			_ = json.NewDecoder(r.Body).Decode(&payload)
			m.mu.Lock()
			m.sent = append(m.sent, payload.Text)
			m.mu.Unlock()
			_ = json.NewEncoder(w).Encode(types.Response[types.Message]{Ok: true, Result: types.Message{MessageID: 1}})
		case strings.HasSuffix(r.URL.Path, "/answerCallbackQuery"):
			var payload struct {
				Text string `json:"text"`
			}
			_ = json.NewDecoder(r.Body).Decode(&payload)
			m.mu.Lock()
			m.answered = append(m.answered, payload.Text)
			m.mu.Unlock()
			_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
		default:
			_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
		}
	}))
	apiBaseURL = server.URL
	t.Cleanup(func() {
		server.Close()
		apiBaseURL = ""
	})
}

func TestRun_WithAndWithoutToken(t *testing.T) {
	// Without BOT_TOKEN the demo falls back to a dummy token.
	t.Setenv("BOT_TOKEN", "")
	if err := run(context.Background()); err != nil {
		t.Errorf("run without token should succeed as a demo, got %v", err)
	}

	// With BOT_TOKEN set, the real token path is used.
	t.Setenv("BOT_TOKEN", "real-token")
	if err := run(context.Background()); err != nil {
		t.Errorf("run with token failed: %v", err)
	}
}

func TestBuildRouter_StartCommand(t *testing.T) {
	mock := &apiMock{}
	mock.start(t)

	router := buildRouter(newBot("token"))
	update := &types.Update{
		UpdateID: 1,
		Message: &types.Message{
			MessageID: 2,
			Text:      "/start",
			Chat:      &types.Chat{ID: 100, Type: "private"},
			From:      &types.User{ID: 200, FirstName: "Tester"},
		},
	}
	if err := router.ProcessUpdate(context.Background(), update); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}

	mock.mu.Lock()
	defer mock.mu.Unlock()
	if len(mock.sent) != 1 || !strings.Contains(mock.sent[0], "telebot-go") {
		t.Errorf("expected the start greeting to be sent, got %v", mock.sent)
	}
}

func TestBuildRouter_StartCommand_AnonymousUser(t *testing.T) {
	mock := &apiMock{}
	mock.start(t)

	router := buildRouter(newBot("token"))
	// A message without From exercises the middleware's anonymous branch.
	update := &types.Update{
		UpdateID: 1,
		Message: &types.Message{
			MessageID: 2,
			Text:      "/start",
			Chat:      &types.Chat{ID: 100, Type: "channel"},
		},
	}
	if err := router.ProcessUpdate(context.Background(), update); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}

	mock.mu.Lock()
	defer mock.mu.Unlock()
	if len(mock.sent) != 1 {
		t.Errorf("expected the start greeting for anonymous sender, got %v", mock.sent)
	}
}

func TestBuildRouter_CallbackButton(t *testing.T) {
	mock := &apiMock{}
	mock.start(t)

	router := buildRouter(newBot("token"))
	update := &types.Update{
		UpdateID: 2,
		CallbackQuery: &types.CallbackQuery{
			ID:   "cb-1",
			From: &types.User{ID: 200, FirstName: "Tester"},
			Data: "btn:click",
		},
	}
	if err := router.ProcessUpdate(context.Background(), update); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}

	mock.mu.Lock()
	defer mock.mu.Unlock()
	if len(mock.answered) != 1 || !strings.Contains(mock.answered[0], "Button clicked") {
		t.Errorf("expected the button callback answer, got %v", mock.answered)
	}
}

func TestNewBot_DefaultBaseURL(t *testing.T) {
	apiBaseURL = ""
	if b := newBot("token"); b == nil || b.Token() != "token" {
		t.Error("newBot should preserve the token with the default base URL")
	}
}
