package scheduler

import (
	"context"
	"sync"
	"time"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/scheduler/rrule"
)

// JobFunc is the function executed when a scheduled job triggers.
type JobFunc func(ctx context.Context, b *bot.Bot) error

// Job represents an active scheduled background job.
type Job struct {
	ID       string
	Interval time.Duration
	RunOnce  bool
	RRule    *rrule.RRule
	fn       JobFunc
	cancel   context.CancelFunc
}

// JobQueue manages background tasks and recurring jobs using Goroutines.
type JobQueue struct {
	bot  *bot.Bot
	jobs map[string]*Job
	mu   sync.RWMutex
	ctx  context.Context
}

// NewJobQueue creates a new JobQueue.
func NewJobQueue(ctx context.Context, b *bot.Bot) *JobQueue {
	return &JobQueue{
		bot:  b,
		jobs: make(map[string]*Job),
		ctx:  ctx,
	}
}

// RunOnce schedules a task to run once after the specified delay.
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

// Cancel removes and stops a scheduled job by ID.
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
