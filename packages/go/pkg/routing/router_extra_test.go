package routing_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// pollingServer returns a first batch of updates once, then empty batches.
// It exposes accessors for the number of polls served and the latest offset.
func pollingServer(t *testing.T, first []types.Update) (*httptest.Server, func() int64, func() int) {
	t.Helper()
	var mu sync.Mutex
	var polls int
	var lastOffset int64
	served := false

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Offset int64 `json:"offset"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)

		mu.Lock()
		polls++
		lastOffset = req.Offset
		serve := !served
		served = true
		mu.Unlock()

		result := []types.Update{}
		if serve {
			result = first
		} else {
			// Simulate a long poll holding briefly so the loop doesn't busy-spin.
			time.Sleep(5 * time.Millisecond)
		}

		resp := types.Response[[]types.Update]{Ok: true, Result: result}
		_ = json.NewEncoder(w).Encode(resp)
	}))

	getLastOffset := func() int64 {
		mu.Lock()
		defer mu.Unlock()
		return lastOffset
	}
	getPolls := func() int {
		mu.Lock()
		defer mu.Unlock()
		return polls
	}
	return server, getLastOffset, getPolls
}

func TestRouter_RunPolling_DispatchesAndAdvancesOffset(t *testing.T) {
	updates := []types.Update{*messageUpdate(5, "/start")}

	server, lastOffset, polls := pollingServer(t, updates)
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	router := routing.NewRouter(b)

	var handled atomic.Int64
	router.Command("start", func(c *routing.Context) error {
		handled.Store(c.Update().UpdateID)
		return nil
	})

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- router.RunPolling(ctx) }()

	// Wait for the update to be dispatched.
	deadline := time.Now().Add(2 * time.Second)
	for handled.Load() != 5 && time.Now().Before(deadline) {
		time.Sleep(5 * time.Millisecond)
	}
	if handled.Load() != 5 {
		t.Fatalf("expected update 5 to be handled, got %d", handled.Load())
	}

	// Wait until at least a second poll has advanced the offset to 6.
	deadline = time.Now().Add(2 * time.Second)
	for {
		if (polls() >= 2 && lastOffset() == 6) || time.Now().After(deadline) {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}
	if last := lastOffset(); last != 6 {
		t.Errorf("expected offset to advance to 6, got %d", last)
	}

	cancel()
	select {
	case err := <-done:
		if !errors.Is(err, context.Canceled) {
			t.Errorf("expected context.Canceled, got %v", err)
		}
	case <-time.After(3 * time.Second):
		t.Fatal("RunPolling did not return after cancel")
	}
}

func TestRouter_RunPolling_RetriesAfterError(t *testing.T) {
	var calls atomic.Int64
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		n := calls.Add(1)
		if n == 1 {
			// First call: malformed body forces a decode error and retry.
			_, _ = w.Write([]byte("not json"))
			return
		}
		resp := types.Response[[]types.Update]{Ok: true, Result: []types.Update{*messageUpdate(9, "hi")}}
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	router := routing.NewRouter(b)

	var handled atomic.Int64
	router.Text("", func(c *routing.Context) error {
		handled.Store(c.Update().UpdateID)
		return nil
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	done := make(chan error, 1)
	go func() { done <- router.RunPolling(ctx) }()

	// The first poll fails and sleeps ~1s; the second must succeed.
	deadline := time.Now().Add(3 * time.Second)
	for handled.Load() != 9 && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
	}
	if handled.Load() != 9 {
		t.Fatalf("expected polling to retry and handle update 9, got %d", handled.Load())
	}

	cancel()
	select {
	case <-done:
	case <-time.After(3 * time.Second):
		t.Fatal("RunPolling did not return after cancel")
	}
}

func TestRouter_RunPolling_ReturnsImmediatelyOnCancelledContext(t *testing.T) {
	b := bot.NewBot("token")
	router := routing.NewRouter(b)

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // already cancelled

	err := router.RunPolling(ctx)
	if !errors.Is(err, context.Canceled) {
		t.Errorf("expected context.Canceled, got %v", err)
	}
}

func TestRouter_Command_BotMentionAndCase(t *testing.T) {
	tests := []struct {
		name     string
		register string
		text     string
		want     bool
	}{
		{"plain match", "help", "/help", true},
		{"leading slash in registration", "help", "/help", true},
		{"bot mention suffix", "help", "/help@MyBot", true},
		{"case insensitive", "help", "/HELP", true},
		{"with args", "help", "/help something", true},
		{"different command", "help", "/start", false},
		{"mention for another bot", "help", "/help@OtherBot", true}, // only prefix before @ is compared
		{"non-command text", "help", "help me", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			router := newUpdateRouter()
			var hit bool
			router.Command(tt.register, func(c *routing.Context) error {
				hit = true
				return nil
			})
			processOrFail(t, router, messageUpdate(1, tt.text))
			if hit != tt.want {
				t.Errorf("text %q vs command %q: hit=%v want %v", tt.text, tt.register, hit, tt.want)
			}
		})
	}
}

func TestRouter_Command_IgnoresEmptyAndWhitespace(t *testing.T) {
	router := newUpdateRouter()
	var hits int
	router.Command("go", func(c *routing.Context) error {
		hits++
		return nil
	})

	// Empty text is rejected before Fields.
	processOrFail(t, router, messageUpdate(1, ""))
	// Whitespace-only text yields zero fields.
	processOrFail(t, router, messageUpdate(2, "   "))
	// An update with no message at all.
	processOrFail(t, router, &types.Update{UpdateID: 3, Poll: &types.Poll{ID: "p", Question: "q"}})

	if hits != 0 {
		t.Errorf("expected no command matches for empty/whitespace/nil message, got %d", hits)
	}
}
