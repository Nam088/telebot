package bot

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestRetryPolicy_IsRetryableStatus(t *testing.T) {
	p := DefaultRetryPolicy()

	tests := []struct {
		name       string
		statusCode int
		want       bool
	}{
		{"429 rate limit", 429, true},
		{"500 internal error", 500, true},
		{"502 bad gateway", 502, true},
		{"503 service unavailable", 503, true},
		{"504 gateway timeout", 504, true},
		{"400 bad request", 400, false},
		{"401 unauthorized", 401, false},
		{"403 forbidden", 403, false},
		{"404 not found", 404, false},
		{"501 not implemented", 501, false},
		{"200 ok", 200, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := p.IsRetryableStatus(tt.statusCode); got != tt.want {
				t.Errorf("IsRetryableStatus(%d) = %v, want %v", tt.statusCode, got, tt.want)
			}
		})
	}
}

func TestRetryPolicy_DelayFor(t *testing.T) {
	p := &RetryPolicy{
		MaxRetries: 3,
		BaseDelay:  1 * time.Second,
		MaxDelay:   30 * time.Second,
	}

	tests := []struct {
		name       string
		attempt    int
		retryAfter time.Duration
		want       time.Duration
	}{
		{"attempt 1 no retry_after", 1, 0, 1 * time.Second},
		{"attempt 2 no retry_after", 2, 0, 2 * time.Second},
		{"attempt 3 no retry_after", 3, 0, 4 * time.Second},
		{"attempt 4 no retry_after", 4, 0, 8 * time.Second},
		{"attempt 5 no retry_after", 5, 0, 16 * time.Second},
		{"attempt 6 capped at max", 6, 0, 30 * time.Second},
		{"attempt 1 with retry_after 5s", 1, 5 * time.Second, 5 * time.Second},
		{"attempt 2 with retry_after 1s", 2, 1 * time.Second, 2 * time.Second},
		{"attempt 3 with retry_after 10s", 3, 10 * time.Second, 10 * time.Second},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := p.DelayFor(tt.attempt, tt.retryAfter); got != tt.want {
				t.Errorf("DelayFor(%d, %v) = %v, want %v", tt.attempt, tt.retryAfter, got, tt.want)
			}
		})
	}
}

func TestDefaultRetryPolicy(t *testing.T) {
	p := DefaultRetryPolicy()

	if p.MaxRetries != 3 {
		t.Errorf("MaxRetries = %d, want 3", p.MaxRetries)
	}
	if p.BaseDelay != 1*time.Second {
		t.Errorf("BaseDelay = %v, want 1s", p.BaseDelay)
	}
	if p.MaxDelay != 30*time.Second {
		t.Errorf("MaxDelay = %v, want 30s", p.MaxDelay)
	}
}

func TestBot_doRequestWithRetry_Success(t *testing.T) {
	b := NewBot("test-token")

	// Verify retryPolicy is initialized with defaults
	if b.retryPolicy == nil {
		t.Error("retryPolicy should be initialized by NewBot")
	}
	if b.retryPolicy.MaxRetries != 3 {
		t.Errorf("retryPolicy.MaxRetries = %d, want 3", b.retryPolicy.MaxRetries)
	}
}

func TestBot_doRequestWithRetry_DisabledRetry(t *testing.T) {
	b := NewBot("test-token", WithMaxRetries(0))

	// When MaxRetries is 0, should skip retry loop
	if b.retryPolicy.MaxRetries != 0 {
		t.Errorf("MaxRetries = %d, want 0", b.retryPolicy.MaxRetries)
	}
}

func TestBot_doRequestWithRetry_ContextCancellation(t *testing.T) {
	b := NewBot("test-token")
	ctx, cancel := context.WithCancel(context.Background())
	cancel() // Cancel immediately

	// Should return context error immediately
	_, err := b.doRequestWithRetry(ctx, "getMe", nil, nil)
	if err == nil {
		t.Error("expected error from cancelled context")
	}
	if !errors.Is(err, context.Canceled) {
		t.Errorf("expected context.Canceled, got %v", err)
	}
}

func TestWithRetryPolicy(t *testing.T) {
	custom := &RetryPolicy{
		MaxRetries: 5,
		BaseDelay:  2 * time.Second,
		MaxDelay:   60 * time.Second,
	}

	b := NewBot("test-token", WithRetryPolicy(custom))

	if b.retryPolicy != custom {
		t.Error("WithRetryPolicy should set custom policy")
	}
	if b.retryPolicy.MaxRetries != 5 {
		t.Errorf("MaxRetries = %d, want 5", b.retryPolicy.MaxRetries)
	}
}

func TestWithMaxRetries(t *testing.T) {
	b := NewBot("test-token", WithMaxRetries(5))

	if b.retryPolicy.MaxRetries != 5 {
		t.Errorf("MaxRetries = %d, want 5", b.retryPolicy.MaxRetries)
	}
}
