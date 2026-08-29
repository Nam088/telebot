package menu_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/components/menu"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
)

func TestMenu_BuildAndRegister(t *testing.T) {
	mainMenu := menu.New("main", "Main Menu Header").
		TextButton("Settings", "settings", func(c *routing.Context) error {
			return nil
		}).
		Row().
		TextButton("Help", "help", func(c *routing.Context) error {
			return nil
		})

	kb := mainMenu.BuildKeyboard()
	if len(kb.InlineKeyboard) != 2 {
		t.Fatalf("expected 2 rows in menu keyboard, got %d", len(kb.InlineKeyboard))
	}

	b := bot.NewBot("fake_token")
	router := routing.NewRouter(b)
	mainMenu.Register(router)
}

func TestMenu_Submenu_BackButton(t *testing.T) {
	mainMenu := menu.New("main", "Main Menu Header")
	settings := menu.New("settings", "Settings")
	mainMenu.Submenu("Settings", settings)

	kb := mainMenu.BuildKeyboard()
	if len(kb.InlineKeyboard) != 1 {
		t.Fatalf("expected 1 row with the submenu button, got %d", len(kb.InlineKeyboard))
	}
	nav := kb.InlineKeyboard[0][0]
	if nav.Text != "Settings" || nav.CallbackData != "m:nav:settings" {
		t.Errorf("unexpected submenu navigation button: %+v", nav)
	}

	subKB := settings.BuildKeyboard()
	if len(subKB.InlineKeyboard) != 1 {
		t.Fatalf("expected submenu keyboard to gain a back row, got %d rows", len(subKB.InlineKeyboard))
	}
	back := subKB.InlineKeyboard[0][0]
	if back.CallbackData != "m:nav:main" {
		t.Errorf("expected back button data %q, got %q", "m:nav:main", back.CallbackData)
	}
}

// menuServer fakes the Telegram Bot API endpoints used by the submenu handler.
func menuServer(t *testing.T, failMethod string) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if failMethod != "" && strings.HasSuffix(r.URL.Path, "/"+failMethod) {
			_, _ = w.Write([]byte(`{"ok":false,"error_code":400,"description":"boom"}`))
			return
		}
		switch {
		case strings.HasSuffix(r.URL.Path, "/answerCallbackQuery"):
			_, _ = w.Write([]byte(`{"ok":true,"result":true}`))
		case strings.HasSuffix(r.URL.Path, "/editMessageText"):
			_, _ = w.Write([]byte(`{"ok":true,"result":{"message_id":7,"date":1,"chat":{"id":100,"type":"private"}}}`))
		default:
			t.Errorf("unexpected API call: %s", r.URL.Path)
			_, _ = w.Write([]byte(`{"ok":false,"error_code":400,"description":"unexpected method"}`))
		}
	}))
}

func navigationUpdate(data string, withMessage bool) *types.Update {
	update := &types.Update{
		UpdateID: 1,
		CallbackQuery: &types.CallbackQuery{
			ID:           "cbq1",
			From:         &types.User{ID: 200, FirstName: "Tester"},
			ChatInstance: "ci",
			Data:         data,
		},
	}
	if withMessage {
		update.CallbackQuery.Message = &types.Message{
			MessageID: 7,
			Date:      1,
			Chat:      &types.Chat{ID: 100, Type: "private"},
		}
	}
	return update
}

func TestMenu_Submenu_NavigationHandler(t *testing.T) {
	srv := menuServer(t, "")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	router := routing.NewRouter(b)

	mainMenu := menu.New("main", "Main Menu Header")
	settings := menu.New("settings", "Settings")
	mainMenu.Submenu("Settings", settings)
	mainMenu.Register(router)

	err := router.ProcessUpdate(context.Background(), navigationUpdate("m:nav:settings", true))
	if err != nil {
		t.Fatalf("expected submenu navigation to succeed, got %v", err)
	}
}

func TestMenu_Submenu_NavigationHandlerAPIError(t *testing.T) {
	srv := menuServer(t, "answerCallbackQuery")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	router := routing.NewRouter(b)

	mainMenu := menu.New("main", "Main Menu Header")
	settings := menu.New("settings", "Settings")
	mainMenu.Submenu("Settings", settings)
	mainMenu.Register(router)

	err := router.ProcessUpdate(context.Background(), navigationUpdate("m:nav:settings", true))
	if err == nil {
		t.Fatal("expected handler error when answerCallbackQuery fails")
	}
}

func TestMenu_Submenu_NavigationHandlerWithoutMessage(t *testing.T) {
	srv := menuServer(t, "")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	router := routing.NewRouter(b)

	mainMenu := menu.New("main", "Main Menu Header")
	settings := menu.New("settings", "Settings")
	mainMenu.Submenu("Settings", settings)
	mainMenu.Register(router)

	err := router.ProcessUpdate(context.Background(), navigationUpdate("m:nav:settings", false))
	if err != nil {
		t.Fatalf("expected handler to tolerate a missing message, got %v", err)
	}
}
