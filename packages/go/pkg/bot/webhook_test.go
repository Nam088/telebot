package bot_test

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestWebhookHandler_RejectsNonPost(t *testing.T) {
	handler := bot.NewBot("t").WebhookHandler("", nil)

	req := httptest.NewRequest(http.MethodGet, "/webhook", nil)
	rec := httptest.NewRecorder()
	handler(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected 405, got %d", rec.Code)
	}
}

func TestWebhookHandler_RejectsWrongSecret(t *testing.T) {
	handler := bot.NewBot("t").WebhookHandler("secret123", nil)

	req := httptest.NewRequest(http.MethodPost, "/webhook", strings.NewReader("{}"))
	req.Header.Set("X-Telegram-Bot-Api-Secret-Token", "wrong")
	rec := httptest.NewRecorder()
	handler(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", rec.Code)
	}
}

func TestWebhookHandler_RejectsInvalidJSON(t *testing.T) {
	handler := bot.NewBot("t").WebhookHandler("", nil)

	req := httptest.NewRequest(http.MethodPost, "/webhook", strings.NewReader("{invalid"))
	rec := httptest.NewRecorder()
	handler(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for malformed update, got %d", rec.Code)
	}
}

func TestWebhookHandler_DeliversUpdate(t *testing.T) {
	received := make(chan *types.Update, 1)
	handler := bot.NewBot("t").WebhookHandler("secret123", func(u *types.Update) {
		received <- u
	})

	body := `{"update_id": 77, "message": {"message_id": 5, "text": "hi"}}`
	req := httptest.NewRequest(http.MethodPost, "/webhook", strings.NewReader(body))
	req.Header.Set("X-Telegram-Bot-Api-Secret-Token", "secret123")
	rec := httptest.NewRecorder()
	handler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if rec.Body.String() != "OK" {
		t.Errorf("expected body OK, got %q", rec.Body.String())
	}

	select {
	case u := <-received:
		if u.UpdateID != 77 || u.Message == nil || u.Message.Text != "hi" {
			t.Errorf("unexpected update delivered: %+v", u)
		}
	case <-time.After(time.Second):
		t.Fatal("update handler was not invoked")
	}
}

func TestWebhookHandler_NoSecretRequired(t *testing.T) {
	received := make(chan struct{}, 1)
	handler := bot.NewBot("t").WebhookHandler("", func(u *types.Update) {
		received <- struct{}{}
	})

	req := httptest.NewRequest(http.MethodPost, "/webhook", strings.NewReader(`{"update_id":1}`))
	rec := httptest.NewRecorder()
	handler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200 without secret check, got %d", rec.Code)
	}
	select {
	case <-received:
	case <-time.After(time.Second):
		t.Fatal("handler not invoked")
	}
}

func TestWebhookHandler_NilUpdateHandler(t *testing.T) {
	handler := bot.NewBot("t").WebhookHandler("", nil)

	req := httptest.NewRequest(http.MethodPost, "/webhook", strings.NewReader(`{"update_id":2}`))
	rec := httptest.NewRecorder()
	handler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200 even with nil handler, got %d", rec.Code)
	}
}

func TestBot_SetWebhook(t *testing.T) {
	var payload map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewDecoder(r.Body).Decode(&payload)
		fmt.Fprint(w, `{"ok":true,"result":true}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ok, err := b.SetWebhook(context.Background(), "https://example.com/hook", "s3cret", 40)
	if err != nil {
		t.Fatalf("SetWebhook failed: %v", err)
	}
	if !ok {
		t.Error("expected ok=true")
	}
	if payload["url"] != "https://example.com/hook" {
		t.Errorf("url not forwarded: %v", payload["url"])
	}
	if payload["secret_token"] != "s3cret" {
		t.Errorf("secret_token not forwarded: %v", payload["secret_token"])
	}
	if payload["max_connections"] != float64(40) {
		t.Errorf("max_connections not forwarded: %v", payload["max_connections"])
	}
}

func TestBot_SetWebhook_OmitsOptionalFields(t *testing.T) {
	var payload map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewDecoder(r.Body).Decode(&payload)
		fmt.Fprint(w, `{"ok":true,"result":true}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	if _, err := b.SetWebhook(context.Background(), "https://example.com/hook", "", 0); err != nil {
		t.Fatalf("SetWebhook failed: %v", err)
	}
	if _, present := payload["secret_token"]; present {
		t.Error("secret_token should be omitted when empty")
	}
	if _, present := payload["max_connections"]; present {
		t.Error("max_connections should be omitted when zero")
	}
}

func TestBot_DeleteWebhook(t *testing.T) {
	var payload map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewDecoder(r.Body).Decode(&payload)
		fmt.Fprint(w, `{"ok":true,"result":true}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ok, err := b.DeleteWebhook(context.Background(), true)
	if err != nil {
		t.Fatalf("DeleteWebhook failed: %v", err)
	}
	if !ok {
		t.Error("expected ok=true")
	}
	if payload["drop_pending_updates"] != true {
		t.Errorf("drop_pending_updates not forwarded: %v", payload["drop_pending_updates"])
	}
}

func TestBot_GetWebhookInfo(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"ok":true,"result":{"url":"https://example.com/hook","has_custom_certificate":false,"pending_update_count":3}}`)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	info, err := b.GetWebhookInfo(context.Background())
	if err != nil {
		t.Fatalf("GetWebhookInfo failed: %v", err)
	}
	if info.URL != "https://example.com/hook" || info.PendingUpdateCount != 3 {
		t.Errorf("unexpected webhook info: %+v", info)
	}
}

// freeAddr reserves a loopback port and returns it for immediate reuse.
func freeAddr(t *testing.T) string {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to reserve port: %v", err)
	}
	addr := ln.Addr().String()
	_ = ln.Close()
	return addr
}

func TestBot_RunWebhook_GracefulShutdown(t *testing.T) {
	addr := freeAddr(t)
	b := bot.NewBot("token")

	received := make(chan *types.Update, 1)
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() {
		done <- b.RunWebhook(ctx, addr, "/webhook", "hooksecret", func(u *types.Update) {
			received <- u
		})
	}()

	// Wait for the server to accept connections, then deliver an update.
	url := "http://" + addr + "/webhook"
	var resp *http.Response
	var err error
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		req, _ := http.NewRequest(http.MethodPost, url, strings.NewReader(`{"update_id":9}`))
		req.Header.Set("X-Telegram-Bot-Api-Secret-Token", "hooksecret")
		resp, err = http.DefaultClient.Do(req)
		if err == nil {
			break
		}
		time.Sleep(10 * time.Millisecond)
	}
	if err != nil {
		t.Fatalf("webhook server never became reachable: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 from live webhook, got %d", resp.StatusCode)
	}
	_ = resp.Body.Close()

	select {
	case u := <-received:
		if u.UpdateID != 9 {
			t.Errorf("expected update 9, got %+v", u)
		}
	case <-time.After(time.Second):
		t.Fatal("update not delivered by live webhook")
	}

	cancel()
	select {
	case err := <-done:
		if err != nil {
			t.Errorf("graceful shutdown should return nil, got %v", err)
		}
	case <-time.After(3 * time.Second):
		t.Fatal("RunWebhook did not shut down after context cancel")
	}
}

func TestBot_RunWebhook_ListenError(t *testing.T) {
	// Occupy the port so ListenAndServe fails immediately.
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to occupy port: %v", err)
	}
	defer ln.Close()

	b := bot.NewBot("token")
	err = b.RunWebhook(context.Background(), ln.Addr().String(), "/webhook", "", nil)
	if err == nil {
		t.Fatal("expected listen error when the address is in use")
	}
}
