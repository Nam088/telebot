package bot

import (
	"context"
	"fmt"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// RetryPolicy configures exponential-backoff retry behavior for Bot API requests.
type RetryPolicy struct {
	// MaxRetries is the number of retries after the initial attempt.
	MaxRetries int
	// BaseDelay is the first backoff delay; each further delay doubles.
	BaseDelay time.Duration
	// MaxDelay is the upper bound for any single backoff delay.
	MaxDelay time.Duration
}

// DefaultRetryPolicy returns the default retry configuration.
func DefaultRetryPolicy() *RetryPolicy {
	return &RetryPolicy{
		MaxRetries: 3,
		BaseDelay:  1 * time.Second,
		MaxDelay:   30 * time.Second,
	}
}

// IsRetryableStatus reports whether an HTTP status code should be retried.
func (p *RetryPolicy) IsRetryableStatus(statusCode int) bool {
	return statusCode == 429 || (statusCode >= 500 && statusCode <= 599)
}

// DelayFor computes the backoff delay to wait before retry number attempt.
func (p *RetryPolicy) DelayFor(attempt int, retryAfter time.Duration) time.Duration {
	step := p.BaseDelay * time.Duration(1<<uint(attempt-1))
	if step > p.MaxDelay {
		step = p.MaxDelay
	}
	if retryAfter > step {
		return retryAfter
	}
	return step
}

// doRequestWithRetry wraps doRequest with retry logic for 429/5xx responses.
func (b *Bot) doRequestWithRetry(ctx context.Context, method string, payload any, result any) (rawResult []byte, err error) {
	policy := b.retryPolicy
	if policy == nil {
		policy = DefaultRetryPolicy()
	}

	// If retry is disabled, just do single request
	if policy.MaxRetries <= 0 {
		return b.doRequest(ctx, method, payload, result)
	}

	var lastErr error
	for attempt := 0; attempt <= policy.MaxRetries; attempt++ {
		// Check context before each attempt
		if ctx.Err() != nil {
			return nil, ctx.Err()
		}

		if attempt > 0 {
			// Compute delay
			var retryAfter time.Duration
			if te, ok := lastErr.(*types.TelegramError); ok && te.Parameters != nil {
				if te.Parameters.RetryAfter > 0 {
					retryAfter = time.Duration(te.Parameters.RetryAfter) * time.Second
				}
			}
			delay := policy.DelayFor(attempt, retryAfter)

			// Wait or context cancellation
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(delay):
			}
		}

		rawResult, err = b.doRequest(ctx, method, payload, result)
		if err == nil {
			return rawResult, nil
		}

		lastErr = err

		// Check if error is retryable
		if te, ok := err.(*types.TelegramError); ok {
			if !policy.IsRetryableStatus(te.ErrorCode) {
				// Non-retryable error, return immediately
				return nil, err
			}
			// Retryable Telegram error, continue loop
			continue
		}

		// Network/transport errors - check if context is still valid
		if ctx.Err() != nil {
			return nil, ctx.Err()
		}
		// Retry network errors
	}

	return nil, fmt.Errorf("max retries (%d) exceeded: %w", policy.MaxRetries, lastErr)
}
