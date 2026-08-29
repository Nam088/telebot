package utils

import (
	"context"
	"sync"
	"testing"
	"time"
)

// newClockLimiter builds a Limiter whose clock is controlled manually. The
// returned closure advances the fake clock by the given duration.
func newClockLimiter(start time.Time, rate float64, burst int) (*Limiter, func(d time.Duration)) {
	now := start
	l := NewLimiter(rate, burst)
	l.now = func() time.Time { return now }
	l.last = now
	return l, func(d time.Duration) { now = now.Add(d) }
}

func TestNewLimiterPanics(t *testing.T) {
	mustPanic(t, func() { NewLimiter(0, 1) })
	mustPanic(t, func() { NewLimiter(-1, 1) })
	mustPanic(t, func() { NewLimiter(1, 0) })
	mustPanic(t, func() { NewLimiter(1, -5) })
}

func mustPanic(t *testing.T, f func()) {
	t.Helper()
	defer func() {
		if recover() == nil {
			t.Error("expected panic, got none")
		}
	}()
	f()
}

func TestAllowConsumesBurst(t *testing.T) {
	l, _ := newClockLimiter(time.Unix(0, 0), 1, 2)
	if !l.Allow() {
		t.Fatal("first Allow() = false, want true")
	}
	if !l.Allow() {
		t.Fatal("second Allow() = false, want true")
	}
	if l.Allow() {
		t.Fatal("third Allow() = true, want false (burst exhausted)")
	}
}

func TestAllowRefillsOverTime(t *testing.T) {
	l, advance := newClockLimiter(time.Unix(0, 0), 1, 2)
	l.AllowN(2)
	if l.Allow() {
		t.Fatal("Allow() = true on empty bucket, want false")
	}

	advance(1 * time.Second) // +1 token
	if !l.Allow() {
		t.Fatal("Allow() after 1s refill = false, want true")
	}
	if l.Allow() {
		t.Fatal("second Allow() after 1s refill = true, want false")
	}
}

func TestTokensCappedAtBurst(t *testing.T) {
	l, advance := newClockLimiter(time.Unix(0, 0), 1, 2)
	advance(1 * time.Hour)
	if got := l.Tokens(); got != 2 {
		t.Fatalf("Tokens() = %v, want 2 (capped at burst)", got)
	}
	// Second call at the same instant exercises the zero-elapsed branch.
	if got := l.Tokens(); got != 2 {
		t.Fatalf("Tokens() = %v, want 2", got)
	}
}

func TestFractionalRefill(t *testing.T) {
	l, advance := newClockLimiter(time.Unix(0, 0), 2, 2) // 2 tokens/sec
	l.AllowN(2)

	advance(250 * time.Millisecond) // +0.5 token, not enough for 1
	if l.Allow() {
		t.Fatal("Allow() with 0.5 tokens = true, want false")
	}
	advance(250 * time.Millisecond) // +0.5 token = 1.0 total
	if !l.Allow() {
		t.Fatal("Allow() with 1.0 tokens = false, want true")
	}
}

func TestAllowN(t *testing.T) {
	l, _ := newClockLimiter(time.Unix(0, 0), 1, 3)

	if !l.AllowN(0) {
		t.Error("AllowN(0) = false, want true")
	}
	if l.AllowN(-1) {
		t.Error("AllowN(-1) = true, want false")
	}
	if l.AllowN(4) {
		t.Error("AllowN(4) with burst 3 = true, want false")
	}
	if !l.AllowN(3) {
		t.Error("AllowN(3) with full burst 3 = false, want true")
	}
	if l.AllowN(1) {
		t.Error("AllowN(1) on empty bucket = true, want false")
	}
}

func TestReset(t *testing.T) {
	l, advance := newClockLimiter(time.Unix(0, 0), 1, 5)
	l.AllowN(5)
	if l.Allow() {
		t.Fatal("Allow() on empty bucket = true, want false")
	}
	l.Reset()
	if got := l.Tokens(); got != 5 {
		t.Fatalf("Tokens() after Reset = %v, want 5", got)
	}
	advance(time.Second) // refill must not exceed burst after reset
	if got := l.Tokens(); got != 5 {
		t.Fatalf("Tokens() = %v, want 5", got)
	}
}

func TestWaitReservesAndBlocks(t *testing.T) {
	// Fake clock stays frozen, so the bucket can only gain tokens via Wait's
	// real-time sleep, making the deficit and debt deterministic.
	l, _ := newClockLimiter(time.Unix(0, 0), 1000, 1) // 1 token per millisecond refill
	if !l.Allow() {
		t.Fatal("Allow() = false, want true")
	}

	start := time.Now()
	if err := l.Wait(context.Background()); err != nil {
		t.Fatalf("Wait() = %v, want nil", err)
	}
	if elapsed := time.Since(start); elapsed < 500*time.Microsecond {
		t.Fatalf("Wait() returned after %v, expected ~1ms of blocking", elapsed)
	}

	// The reservation drove the bucket into debt, so an immediate request for
	// 2 tokens must fail.
	if l.AllowN(2) {
		t.Fatal("AllowN(2) right after Wait() = true, want false (token debt)")
	}
}

func TestWaitReturnsImmediatelyWhenAvailable(t *testing.T) {
	l := NewLimiter(1, 1)
	if err := l.Wait(context.Background()); err != nil {
		t.Fatalf("Wait() = %v, want nil", err)
	}
}

func TestWaitNValidation(t *testing.T) {
	l := NewLimiter(1, 1)

	if err := l.WaitN(context.Background(), 0); err != nil {
		t.Errorf("WaitN(0) = %v, want nil", err)
	}
	if err := l.WaitN(context.Background(), -1); err == nil {
		t.Error("WaitN(-1) = nil, want error")
	}
	if err := l.WaitN(context.Background(), 2); err == nil {
		t.Error("WaitN(2) with burst 1 = nil, want error")
	}
}

func TestWaitContextCanceled(t *testing.T) {
	l := NewLimiter(0.5, 1) // 1 token per 2 seconds
	if !l.Allow() {
		t.Fatal("Allow() = false, want true")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
	defer cancel()

	start := time.Now()
	err := l.Wait(ctx)
	if err != context.DeadlineExceeded {
		t.Fatalf("Wait(canceled ctx) = %v, want context.DeadlineExceeded", err)
	}
	if elapsed := time.Since(start); elapsed > time.Second {
		t.Fatalf("Wait returned after %v, expected prompt cancellation", elapsed)
	}
}

func TestConcurrentAllow(t *testing.T) {
	l := NewLimiter(0.0001, 100) // refill negligible during the test

	const goroutines = 200
	var wg sync.WaitGroup
	successes := make(chan bool, goroutines)
	for i := 0; i < goroutines; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			successes <- l.Allow()
		}()
	}
	wg.Wait()
	close(successes)

	granted := 0
	for ok := range successes {
		if ok {
			granted++
		}
	}
	if granted != 100 {
		t.Fatalf("granted %d concurrent tokens, want exactly 100 (burst)", granted)
	}
}
