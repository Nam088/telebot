package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestRun_MissingToken(t *testing.T) {
	t.Setenv("BOT_TOKEN", "")
	err := run(context.Background())
	if err == nil || !strings.Contains(err.Error(), "BOT_TOKEN") {
		t.Errorf("expected BOT_TOKEN error, got %v", err)
	}
}

// useFreeListenAddr points listenAddr at a free loopback port for the test.
func useFreeListenAddr(t *testing.T) string {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to reserve port: %v", err)
	}
	addr := ln.Addr().String()
	_ = ln.Close()

	old := listenAddr
	listenAddr = addr
	t.Cleanup(func() { listenAddr = old })
	return addr
}

func TestRun_GracefulShutdown(t *testing.T) {
	t.Setenv("BOT_TOKEN", "test-token")
	t.Setenv("WEBHOOK_URL", "")
	useFreeListenAddr(t)

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // already cancelled: server must shut down immediately

	if err := run(ctx); err != nil {
		t.Errorf("expected nil after graceful shutdown, got %v", err)
	}
}

func TestRun_RegistersWebhookURL(t *testing.T) {
	var mu sync.Mutex
	var webhookURLSeen string

	api := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/setWebhook") {
			var payload struct {
				URL string `json:"url"`
			}
			_ = json.NewDecoder(r.Body).Decode(&payload)
			mu.Lock()
			webhookURLSeen = payload.URL
			mu.Unlock()
		}
		fmt.Fprint(w, `{"ok":true,"result":true}`)
	}))
	defer api.Close()

	t.Setenv("BOT_TOKEN", "test-token")
	t.Setenv("WEBHOOK_URL", "https://example.com/webhook")
	t.Setenv("WEBHOOK_SECRET", "")
	apiBaseURL = api.URL
	t.Cleanup(func() { apiBaseURL = "" })
	useFreeListenAddr(t)

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- run(ctx) }()

	// Wait until the registration request reaches the mock API.
	deadline := time.Now().Add(2 * time.Second)
	for {
		mu.Lock()
		seen := webhookURLSeen
		mu.Unlock()
		if seen != "" || time.Now().After(deadline) {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}

	cancel()
	select {
	case err := <-done:
		if err != nil {
			t.Errorf("expected nil after graceful shutdown, got %v", err)
		}
	case <-time.After(3 * time.Second):
		t.Fatal("run did not return after cancel")
	}

	mu.Lock()
	seen := webhookURLSeen
	mu.Unlock()
	if seen != "https://example.com/webhook" {
		t.Errorf("expected setWebhook to be called with the configured URL, got %q", seen)
	}
}

func TestRun_SetWebhookFailure(t *testing.T) {
	api := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"ok":false,"error_code":400,"description":"bad webhook url"}`)
	}))
	defer api.Close()

	t.Setenv("BOT_TOKEN", "test-token")
	t.Setenv("WEBHOOK_URL", "https://example.com/webhook")
	apiBaseURL = api.URL
	t.Cleanup(func() { apiBaseURL = "" })
	useFreeListenAddr(t)

	err := run(context.Background())
	if err == nil || !strings.Contains(err.Error(), "failed to set webhook") {
		t.Errorf("expected wrapped setWebhook error, got %v", err)
	}
}

func TestRun_WebhookDeliversUpdates(t *testing.T) {
	var mu sync.Mutex
	var replies []string

	api := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/sendMessage") {
			var payload struct {
				Text string `json:"text"`
			}
			_ = json.NewDecoder(r.Body).Decode(&payload)
			mu.Lock()
			replies = append(replies, payload.Text)
			mu.Unlock()
		}
		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{Ok: true, Result: types.Message{MessageID: 1}})
	}))
	defer api.Close()

	t.Setenv("BOT_TOKEN", "test-token")
	t.Setenv("WEBHOOK_URL", "")
	t.Setenv("WEBHOOK_SECRET", "hook-secret")
	apiBaseURL = api.URL
	t.Cleanup(func() { apiBaseURL = "" })
	addr := useFreeListenAddr(t)

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- run(ctx) }()

	// Deliver a /start command update to the live webhook endpoint.
	url := "http://" + addr + "/webhook"
	body := `{"update_id":1,"message":{"message_id":2,"text":"/start",` +
		`"chat":{"id":100,"type":"private"},"from":{"id":200,"first_name":"Tester"}}}`

	var lastErr error
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		req, _ := http.NewRequest(http.MethodPost, url, strings.NewReader(body))
		req.Header.Set("X-Telegram-Bot-Api-Secret-Token", "hook-secret")
		resp, err := http.DefaultClient.Do(req)
		if err == nil {
			_ = resp.Body.Close()
			if resp.StatusCode != http.StatusOK {
				t.Fatalf("webhook returned %d", resp.StatusCode)
			}
			lastErr = nil
			break
		}
		lastErr = err
		time.Sleep(10 * time.Millisecond)
	}
	if lastErr != nil {
		t.Fatalf("webhook never became reachable: %v", lastErr)
	}

	// The /start handler must reply through the (mock) Bot API.
	deadline = time.Now().Add(2 * time.Second)
	for {
		mu.Lock()
		n := len(replies)
		mu.Unlock()
		if n >= 1 || time.Now().After(deadline) {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}
	mu.Lock()
	got := append([]string(nil), replies...)
	mu.Unlock()
	if len(got) != 1 || !strings.Contains(got[0], "Go Webhook") {
		t.Errorf("expected the /start webhook reply, got %v", got)
	}

	cancel()
	select {
	case err := <-done:
		if err != nil {
			t.Errorf("expected clean shutdown, got %v", err)
		}
	case <-time.After(3 * time.Second):
		t.Fatal("run did not return after cancel")
	}
}

func TestBuildRouter_StartCommand(t *testing.T) {
	var mu sync.Mutex
	var replies []string
	api := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload struct {
			Text string `json:"text"`
		}
		_ = json.NewDecoder(r.Body).Decode(&payload)
		mu.Lock()
		replies = append(replies, payload.Text)
		mu.Unlock()
		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{Ok: true, Result: types.Message{MessageID: 1}})
	}))
	defer api.Close()
	apiBaseURL = api.URL
	t.Cleanup(func() { apiBaseURL = "" })

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

	mu.Lock()
	defer mu.Unlock()
	if len(replies) != 1 || !strings.Contains(replies[0], "Go Webhook") {
		t.Errorf("expected start reply, got %v", replies)
	}
}

func TestNewBot_DefaultBaseURL(t *testing.T) {
	apiBaseURL = ""
	if b := newBot("token"); b == nil || b.Token() != "token" {
		t.Error("newBot should preserve the token with the default base URL")
	}
}
