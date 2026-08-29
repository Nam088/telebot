package scheduler

import (
	"context"
	"sync"
	"time"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/scheduler/rrule"
)

// JobFunc defines the callback function executed when a scheduled job triggers.
type JobFunc func(ctx context.Context, b *bot.Bot) error

// Job represents an active scheduled background task.
type Job struct {
	ID       string
	Interval time.Duration
	RunOnce  bool
	RRule    *rrule.RRule
	fn       JobFunc
	cancel   context.CancelFunc
}

// JobQueue manages background asynchronous tasks and recurring jobs using native Goroutines.
type JobQueue struct {
	bot  *bot.Bot
	jobs map[string]*Job
	mu   sync.RWMutex
	ctx  context.Context
}

// NewJobQueue creates a new JobQueue tied to the root context and Bot client.
//
// Parameters:
//   - ctx: Root context. Cancelling this context terminates all active scheduled jobs.
//   - b: Bot client instance passed to job callbacks.
func NewJobQueue(ctx context.Context, b *bot.Bot) *JobQueue {
	return &JobQueue{
		bot:  b,
		jobs: make(map[string]*Job),
		ctx:  ctx,
	}
}

// RunOnce schedules a task to run once after the specified delay duration.
//
// Parameters:
//   - id: Unique task identifier.
//   - delay: Time duration to wait before executing.
//   - fn: Job callback function.
//
// Example:
//
//	queue.RunOnce("reminder_123", 10*time.Minute, func(ctx context.Context, b *bot.Bot) error {
//	    _, err := b.SendMessage(ctx, &types.SendMessageOptions{ChatID: 123, Text: "Time is up!"})
//	    return err
//	})
func (q *JobQueue) RunOnce(id string, delay time.Duration, fn JobFunc) {
	q.mu.Lock()
	defer q.mu.Unlock()

	jobCtx, cancel := context.WithCancel(q.ctx)
	job := &Job{
		ID:      id,
		RunOnce: true,
		fn:      fn,
		cancel:  cancel,
	}
	q.jobs[id] = job

	go func() {
		select {
		case <-time.After(delay):
			_ = fn(jobCtx, q.bot)
		case <-jobCtx.Done():
			return
		}

		q.mu.Lock()
		delete(q.jobs, id)
		q.mu.Unlock()
	}()
}

// RunRepeating schedules a task to run periodically at the specified interval.
//
// Parameters:
//   - id: Unique task identifier.
//   - interval: Time duration between successive executions.
//   - fn: Job callback function.
func (q *JobQueue) RunRepeating(id string, interval time.Duration, fn JobFunc) {
	q.mu.Lock()
	defer q.mu.Unlock()

	jobCtx, cancel := context.WithCancel(q.ctx)
	job := &Job{
		ID:       id,
		Interval: interval,
		RunOnce:  false,
		fn:       fn,
		cancel:   cancel,
	}
	q.jobs[id] = job

	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				_ = fn(jobCtx, q.bot)
			case <-jobCtx.Done():
				return
			}
		}
	}()
}

// RunRRule schedules a task based on an RFC 5545 recurrence rule.
//
// Parameters:
//   - id: Unique task identifier.
//   - rule: Configured RFC 5545 RRule instance.
//   - fn: Job callback function.
func (q *JobQueue) RunRRule(id string, rule *rrule.RRule, fn JobFunc) {
	q.mu.Lock()
	defer q.mu.Unlock()

	jobCtx, cancel := context.WithCancel(q.ctx)
	job := &Job{
		ID:     id,
		RRule:  rule,
		fn:     fn,
		cancel: cancel,
	}
	q.jobs[id] = job

	go func() {
		for {
			now := time.Now()
			next := rule.After(now, false)
			if next == nil {
				return
			}

			delay := next.Sub(now)
			if delay <= 0 {
				delay = 10 * time.Millisecond
			}

			select {
			case <-time.After(delay):
				_ = fn(jobCtx, q.bot)
			case <-jobCtx.Done():
				return
			}
		}
	}()
}

// Cancel removes and stops an active scheduled job by ID.
//
// Parameters:
//   - id: Unique task identifier to cancel.
//
// Returns:
//   - bool: True if the job was found and cancelled, false if not found.
func (q *JobQueue) Cancel(id string) bool {
	q.mu.Lock()
	defer q.mu.Unlock()

	job, exists := q.jobs[id]
	if !exists {
		return false
	}

	job.cancel()
	delete(q.jobs, id)
	return true
}
