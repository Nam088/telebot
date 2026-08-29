package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/Nam088/telebot-go/pkg/types"
)

func TestRun_MissingToken(t *testing.T) {
	t.Setenv("BOT_TOKEN", "")
	err := run(context.Background())
	if err == nil || !strings.Contains(err.Error(), "BOT_TOKEN") {
		t.Errorf("expected BOT_TOKEN error, got %v", err)
	}
}

// telegramMock serves getUpdates (one batch then empty) and sendMessage.
type telegramMock struct {
	mu      sync.Mutex
	updates []types.Update
	served  bool
	replies []string
}

func (m *telegramMock) handler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.HasSuffix(r.URL.Path, "/getUpdates"):
			m.mu.Lock()
			serve := !m.served
			m.served = true
			batch := m.updates
			m.mu.Unlock()

			result := []types.Update{}
			if serve {
				result = batch
			} else {
				time.Sleep(5 * time.Millisecond)
			}
			resp := types.Response[[]types.Update]{Ok: true, Result: result}
			_ = json.NewEncoder(w).Encode(resp)

		case strings.HasSuffix(r.URL.Path, "/sendMessage"):
			var payload struct {
				Text string `json:"text"`
			}
			_ = json.NewDecoder(r.Body).Decode(&payload)
			m.mu.Lock()
			m.replies = append(m.replies, payload.Text)
			m.mu.Unlock()

			resp := types.Response[types.Message]{Ok: true, Result: types.Message{MessageID: 1, Text: payload.Text}}
			_ = json.NewEncoder(w).Encode(resp)

		default:
			resp := types.Response[bool]{Ok: true, Result: true}
			_ = json.NewEncoder(w).Encode(resp)
		}
	}
}

func textUpdate(id int64, text string) types.Update {
	return types.Update{
		UpdateID: id,
		Message: &types.Message{
			MessageID: id * 10,
			Text:      text,
			Chat:      &types.Chat{ID: 100, Type: "private"},
			From:      &types.User{ID: 200, FirstName: "Tester"},
		},
	}
}

// startMock installs a mock Telegram API and points apiBaseURL at it.
func startMock(t *testing.T, mock *telegramMock) *httptest.Server {
	t.Helper()
	server := httptest.NewServer(mock.handler())
	apiBaseURL = server.URL
	t.Cleanup(func() {
		server.Close()
		apiBaseURL = ""
	})
	return server
}

func TestRun_PollingDispatch(t *testing.T) {
	mock := &telegramMock{
		updates: []types.Update{
			textUpdate(1, "/start"),
			textUpdate(2, "hello world"),
		},
	}
	startMock(t, mock)

	t.Setenv("BOT_TOKEN", "test-token")

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- run(ctx) }()

	// Wait until both replies have been recorded.
	deadline := time.Now().Add(2 * time.Second)
	for {
		mock.mu.Lock()
		n := len(mock.replies)
		mock.mu.Unlock()
		if n >= 2 || time.Now().After(deadline) {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}

	mock.mu.Lock()
	replies := append([]string(nil), mock.replies...)
	mock.mu.Unlock()

	if len(replies) < 2 {
		t.Fatalf("expected 2 replies, got %v", replies)
	}
	// Updates are dispatched concurrently, so assert membership, not order.
	var sawWelcome, sawEcho bool
	for _, r := range replies {
		if strings.Contains(r, "Welcome to Echo Bot") {
			sawWelcome = true
		}
		if r == "Echo: hello world" {
			sawEcho = true
		}
	}
	if !sawWelcome {
		t.Errorf("expected /start welcome reply in %v", replies)
	}
	if !sawEcho {
		t.Errorf("expected echo reply in %v", replies)
	}

	cancel()
	select {
	case <-done:
	case <-time.After(3 * time.Second):
		t.Fatal("run did not return after cancel")
	}
}

func TestBuildRouter_EchoHandler(t *testing.T) {
	mock := &telegramMock{}
	startMock(t, mock)

	router := buildRouter(newBot("token"))

	u := textUpdate(1, "ping")
	if err := router.ProcessUpdate(context.Background(), &u); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}

	mock.mu.Lock()
	defer mock.mu.Unlock()
	if len(mock.replies) != 1 || mock.replies[0] != "Echo: ping" {
		t.Errorf("expected single echo reply, got %v", mock.replies)
	}
}

func TestNewBot_DefaultBaseURL(t *testing.T) {
	// With no override, newBot should use the default Telegram endpoint.
	apiBaseURL = ""
	b := newBot("token")
	if b == nil {
		t.Fatal("newBot returned nil")
	}
	if b.Token() != "token" {
		t.Errorf("expected token preserved, got %q", b.Token())
	}
}
