package routing_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// messageUpdate builds a text message update from a user in a private chat.
func messageUpdate(id int64, text string) *types.Update {
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

// callbackUpdate builds a callback query update.
func callbackUpdate(id int64, data string) *types.Update {
	return &types.Update{
		UpdateID: id,
		CallbackQuery: &types.CallbackQuery{
			ID:   "cb-1",
			From: &types.User{ID: 200, FirstName: "Tester"},
			Message: &types.Message{
				MessageID: 5,
				Chat:      &types.Chat{ID: 100, Type: "private"},
			},
			Data: data,
		},
	}
}

func TestContext_Accessors(t *testing.T) {
	b := bot.NewBot("fake_token")
	update := messageUpdate(1, "hello")
	c := routing.NewContext(context.Background(), b, update)

	if c.Bot() != b {
		t.Error("Bot() should return the injected bot")
	}
	if c.Update() != update {
		t.Error("Update() should return the injected update")
	}
	if c.Ctx() == nil {
		t.Error("Ctx() should be non-nil")
	}
	if msg := c.Message(); msg == nil || msg.Text != "hello" {
		t.Errorf("Message() should expose the message, got %+v", msg)
	}
	if user := c.User(); user == nil || user.ID != 200 {
		t.Errorf("User() should expose the sender, got %+v", user)
	}
	if chat := c.Chat(); chat == nil || chat.ID != 100 {
		t.Errorf("Chat() should expose the chat, got %+v", chat)
	}
	if c.CallbackQuery() != nil {
		t.Error("CallbackQuery() should be nil for a message update")
	}
}

func TestContext_Ctx_NilFallsBackToBackground(t *testing.T) {
	c := routing.NewContext(nil, bot.NewBot("t"), messageUpdate(1, "x"))
	if c.Ctx() == nil {
		t.Fatal("Ctx() must never return nil")
	}
	if c.Ctx().Err() != nil {
		t.Error("fallback context should not be cancelled")
	}
}

func TestContext_Reply(t *testing.T) {
	var gotText string
	var gotChat any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload map[string]any
		_ = json.NewDecoder(r.Body).Decode(&payload)
		gotText, _ = payload["text"].(string)
		gotChat = payload["chat_id"]

		resp := types.Response[types.Message]{Ok: true, Result: types.Message{MessageID: 42, Text: gotText}}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	c := routing.NewContext(context.Background(), b, messageUpdate(1, "hi"))

	msg, err := c.Reply("pong")
	if err != nil {
		t.Fatalf("Reply failed: %v", err)
	}
	if msg.MessageID != 42 {
		t.Errorf("expected reply message id 42, got %d", msg.MessageID)
	}
	if gotText != "pong" {
		t.Errorf("expected text 'pong' sent, got %q", gotText)
	}
	if gotChat != float64(100) {
		t.Errorf("expected chat_id 100, got %v", gotChat)
	}
}

func TestContext_Reply_WithOption(t *testing.T) {
	var gotParseMode string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload map[string]any
		_ = json.NewDecoder(r.Body).Decode(&payload)
		gotParseMode, _ = payload["parse_mode"].(string)

		resp := types.Response[types.Message]{Ok: true, Result: types.Message{MessageID: 1}}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	c := routing.NewContext(context.Background(), b, messageUpdate(1, "hi"))

	_, err := c.Reply("<b>bold</b>", func(o *types.SendMessageOptions) {
		o.ParseMode = "HTML"
	})
	if err != nil {
		t.Fatalf("Reply failed: %v", err)
	}
	if gotParseMode != "HTML" {
		t.Errorf("expected parse_mode HTML, got %q", gotParseMode)
	}
}

func TestContext_Reply_NoChat(t *testing.T) {
	b := bot.NewBot("token")
	// An update with no derivable chat (a bare poll).
	update := &types.Update{UpdateID: 1, Poll: &types.Poll{ID: "p", Question: "q"}}
	c := routing.NewContext(context.Background(), b, update)

	if _, err := c.Reply("hi"); err == nil {
		t.Error("expected error when replying without an effective chat")
	}
}

func TestContext_AnswerCallbackQuery(t *testing.T) {
	var gotID string
	var gotAlert bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload map[string]any
		_ = json.NewDecoder(r.Body).Decode(&payload)
		gotID, _ = payload["callback_query_id"].(string)
		gotAlert, _ = payload["show_alert"].(bool)

		resp := types.Response[bool]{Ok: true, Result: true}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	c := routing.NewContext(context.Background(), b, callbackUpdate(1, "press"))

	ok, err := c.AnswerCallbackQuery("done", true)
	if err != nil {
		t.Fatalf("AnswerCallbackQuery failed: %v", err)
	}
	if !ok {
		t.Error("expected ok=true")
	}
	if gotID != "cb-1" {
		t.Errorf("expected callback_query_id cb-1, got %q", gotID)
	}
	if !gotAlert {
		t.Error("expected show_alert=true to be forwarded")
	}
}

func TestContext_AnswerCallbackQuery_NoCallback(t *testing.T) {
	b := bot.NewBot("token")
	c := routing.NewContext(context.Background(), b, messageUpdate(1, "hi"))

	if _, err := c.AnswerCallbackQuery("x", false); err == nil {
		t.Error("expected error when no callback query is present")
	}
}

func TestRouter_Text(t *testing.T) {
	router := newUpdateRouter()

	var matched []string
	router.Text("hello", func(c *routing.Context) error {
		matched = append(matched, c.Message().Text)
		return nil
	})

	processOrFail(t, router, messageUpdate(1, "say hello world"))
	processOrFail(t, router, messageUpdate(2, "goodbye"))

	if len(matched) != 1 || matched[0] != "say hello world" {
		t.Errorf("expected only the 'hello' message to match, got %v", matched)
	}
}

func TestRouter_Text_EmptyPatternMatchesAny(t *testing.T) {
	router := newUpdateRouter()

	var count int
	router.Text("", func(c *routing.Context) error {
		count++
		return nil
	})

	processOrFail(t, router, messageUpdate(1, "anything"))
	processOrFail(t, router, messageUpdate(2, "else"))

	if count != 2 {
		t.Errorf("expected empty pattern to match all text messages, got %d", count)
	}
}

func TestRouter_Text_IgnoresNonText(t *testing.T) {
	router := newUpdateRouter()

	var handled bool
	router.Text("", func(c *routing.Context) error {
		handled = true
		return nil
	})

	// A callback query has no top-level text message with Text set.
	processOrFail(t, router, callbackUpdate(1, "data"))
	if handled {
		t.Error("text route must not match callback queries")
	}
}

func TestRouter_CallbackQuery(t *testing.T) {
	router := newUpdateRouter()

	var matched []string
	router.CallbackQuery("yes", func(c *routing.Context) error {
		matched = append(matched, c.CallbackQuery().Data)
		return nil
	})

	processOrFail(t, router, callbackUpdate(1, "yes"))
	processOrFail(t, router, callbackUpdate(2, "no"))

	if len(matched) != 1 || matched[0] != "yes" {
		t.Errorf("expected only 'yes' callback to match, got %v", matched)
	}
}

func TestRouter_CallbackQuery_EmptyMatchesAll(t *testing.T) {
	router := newUpdateRouter()

	var count int
	router.CallbackQuery("", func(c *routing.Context) error {
		count++
		return nil
	})

	processOrFail(t, router, callbackUpdate(1, "a"))
	processOrFail(t, router, callbackUpdate(2, "b"))
	// Non-callback updates must not match.
	processOrFail(t, router, messageUpdate(3, "text"))

	if count != 2 {
		t.Errorf("expected 2 callbacks matched, got %d", count)
	}
}
