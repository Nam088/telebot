package utils

import (
	"context"
	"fmt"
	"math"
	"sync"
	"time"
)

// Limiter is a thread-safe token bucket rate limiter. Tokens are refilled
// continuously at Rate tokens per second, up to the burst capacity. A new
// limiter starts full.
//
// The zero value is not usable; construct one with NewLimiter.
type Limiter struct {
	mu     sync.Mutex
	rate   float64 // tokens added per second
	burst  float64 // bucket capacity
	tokens float64 // currently available tokens (may be negative after Wait)
	last   time.Time
	now    func() time.Time
}

// NewLimiter constructs a token bucket limiter that refills at rate tokens
// per second and holds at most burst tokens. It panics if rate is not
// strictly positive or burst is less than 1, since those are programmer
// errors rather than runtime conditions.
func NewLimiter(rate float64, burst int) *Limiter {
	if rate <= 0 {
		panic("utils: rate limiter rate must be > 0")
	}
	if burst < 1 {
		panic("utils: rate limiter burst must be >= 1")
	}
	now := time.Now()
	return &Limiter{
		rate:   rate,
		burst:  float64(burst),
		tokens: float64(burst),
		last:   now,
		now:    time.Now,
	}
}

// Allow reports whether a single token can be consumed immediately, and
// consumes it if so.
func (l *Limiter) Allow() bool {
	return l.AllowN(1)
}

// AllowN reports whether n tokens can be consumed immediately, and consumes
// them if so. It returns false for negative n or n greater than the burst
// capacity (which can never be accumulated); n == 0 always succeeds.
func (l *Limiter) AllowN(n int) bool {
	if n < 0 {
		return false
	}
	if n == 0 {
		return true
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	l.refillLocked()
	if float64(n) > l.tokens {
		return false
	}
	l.tokens -= float64(n)
	return true
}

// Wait blocks until a single token is available or ctx is done, returning
// ctx.Err() in the latter case.
func (l *Limiter) Wait(ctx context.Context) error {
	return l.WaitN(ctx, 1)
}

// WaitN blocks until n tokens can be consumed or ctx is done. Tokens are
// reserved up front, so concurrent callers are served in order and the
// bucket may temporarily go negative to pay back the debt with future
// refills. It returns an error for negative n or n greater than the burst
// capacity (which can never be satisfied), and ctx.Err() if ctx is done
// first. WaitN(ctx, 0) returns nil immediately.
func (l *Limiter) WaitN(ctx context.Context, n int) error {
	if n < 0 {
		return fmt.Errorf("utils: negative token request %d", n)
	}
	if n == 0 {
		return nil
	}

	l.mu.Lock()
	if float64(n) > l.burst {
		l.mu.Unlock()
		return fmt.Errorf("utils: requested %d tokens exceeds burst capacity", n)
	}
	l.refillLocked()
	deficit := float64(n) - l.tokens
	l.tokens -= float64(n) // pre-consume; refills pay back any debt
	l.mu.Unlock()

	if deficit <= 0 {
		return nil
	}
	wait := time.Duration(math.Ceil(deficit / l.rate * float64(time.Second)))

	timer := time.NewTimer(wait)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}

// Tokens returns the number of tokens currently available. The value is a
// snapshot and may be stale immediately in the face of concurrent use.
func (l *Limiter) Tokens() float64 {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.refillLocked()
	return l.tokens
}

// Reset refills the bucket to its full burst capacity.
func (l *Limiter) Reset() {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.tokens = l.burst
	l.last = l.now()
}

// refillLocked tops up tokens for the time elapsed since the last update.
// Callers must hold l.mu.
func (l *Limiter) refillLocked() {
	now := l.now()
	elapsed := now.Sub(l.last)
	if elapsed <= 0 {
		return
	}
	l.tokens = min(l.burst, l.tokens+l.rate*elapsed.Seconds())
	l.last = now
}
