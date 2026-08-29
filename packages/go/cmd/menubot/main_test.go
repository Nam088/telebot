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

	if err := run(ctx); !errors.Is(err, context.Canceled) {
		t.Errorf("expected context.Canceled, got %v", err)
	}
}

// apiMock records sendMessage, answerCallbackQuery and editMessageText calls.
type apiMock struct {
	mu       sync.Mutex
	sent     []string // sendMessage texts
	answered []string // answerCallbackQuery texts
	edited   []string // editMessageText texts
}

func (m *apiMock) start(t *testing.T) {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload struct {
			Text string `json:"text"`
		}
		_ = json.NewDecoder(r.Body).Decode(&payload)

		m.mu.Lock()
		switch {
		case strings.HasSuffix(r.URL.Path, "/sendMessage"):
			m.sent = append(m.sent, payload.Text)
		case strings.HasSuffix(r.URL.Path, "/answerCallbackQuery"):
			m.answered = append(m.answered, payload.Text)
		case strings.HasSuffix(r.URL.Path, "/editMessageText"):
			m.edited = append(m.edited, payload.Text)
		}
		m.mu.Unlock()

		if strings.HasSuffix(r.URL.Path, "/answerCallbackQuery") {
			_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
			return
		}
		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{Ok: true, Result: types.Message{MessageID: 1, Text: payload.Text}})
	}))
	apiBaseURL = server.URL
	t.Cleanup(func() {
		server.Close()
		apiBaseURL = ""
	})
}

func menuRouter() *routing.Router {
	router := routing.NewRouter(newBot("token"))
	mainMenu := buildMenu()
	mainMenu.Register(router)
	router.Command("menu", func(c *routing.Context) error {
		_, err := c.Reply(mainMenu.Text, func(o *types.SendMessageOptions) {
			o.ReplyMarkup = mainMenu.BuildKeyboard()
		})
		return err
	})
	return router
}

func menuMessageUpdate(id int64, text string) *types.Update {
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

func menuCallbackUpdate(id int64, data string) *types.Update {
	return &types.Update{
		UpdateID: id,
		CallbackQuery: &types.CallbackQuery{
			ID:   "cb-1",
			From: &types.User{ID: 200, FirstName: "Tester"},
			Message: &types.Message{
				MessageID: 5,
				Text:      "menu",
				Chat:      &types.Chat{ID: 100, Type: "private"},
			},
			Data: data,
		},
	}
}

func TestMenu_CommandSendsMenu(t *testing.T) {
	mock := &apiMock{}
	mock.start(t)
	router := menuRouter()

	if err := router.ProcessUpdate(context.Background(), menuMessageUpdate(1, "/menu")); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}

	mock.mu.Lock()
	defer mock.mu.Unlock()
	if len(mock.sent) != 1 || !strings.Contains(mock.sent[0], "Main Control Panel") {
		t.Errorf("expected the menu text to be sent, got %v", mock.sent)
	}
}

func TestMenu_AboutButton(t *testing.T) {
	mock := &apiMock{}
	mock.start(t)
	router := menuRouter()

	if err := router.ProcessUpdate(context.Background(), menuCallbackUpdate(1, "m:main:about")); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}

	mock.mu.Lock()
	defer mock.mu.Unlock()
	if len(mock.answered) != 1 || !strings.Contains(mock.answered[0], "v1.0") {
		t.Errorf("expected about callback answer, got %v", mock.answered)
	}
}

func TestMenu_SettingsAlertsButton(t *testing.T) {
	mock := &apiMock{}
	mock.start(t)
	router := menuRouter()

	if err := router.ProcessUpdate(context.Background(), menuCallbackUpdate(1, "m:settings:alerts")); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}

	mock.mu.Lock()
	defer mock.mu.Unlock()
	if len(mock.answered) != 1 || !strings.Contains(mock.answered[0], "Alerts toggled") {
		t.Errorf("expected alerts callback answer, got %v", mock.answered)
	}
}

func TestMenu_SubmenuNavigation(t *testing.T) {
	mock := &apiMock{}
	mock.start(t)
	router := menuRouter()

	if err := router.ProcessUpdate(context.Background(), menuCallbackUpdate(1, "m:nav:settings")); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}

	mock.mu.Lock()
	defer mock.mu.Unlock()
	if len(mock.edited) != 1 || !strings.Contains(mock.edited[0], "Bot Settings") {
		t.Errorf("expected message edited to settings menu, got %v", mock.edited)
	}
}

func TestBuildMenu_Structure(t *testing.T) {
	m := buildMenu()
	if m == nil {
		t.Fatal("buildMenu returned nil")
	}
	kb := m.BuildKeyboard()
	if kb == nil || len(kb.InlineKeyboard) == 0 {
		t.Fatal("expected a non-empty keyboard")
	}
}

func TestNewBot_DefaultBaseURL(t *testing.T) {
	apiBaseURL = ""
	if b := newBot("token"); b == nil || b.Token() != "token" {
		t.Error("newBot should preserve the token with the default base URL")
	}
}
