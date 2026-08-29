package scheduler_test

import (
	"context"
	"sync/atomic"
	"testing"
	"time"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/scheduler"
	"github.com/Nam088/telebot-go/pkg/scheduler/rrule"
)

func newTestQueue(ctx context.Context) *scheduler.JobQueue {
	return scheduler.NewJobQueue(ctx, bot.NewBot("fake_token"))
}

// waitFor polls cond until it returns true or the deadline elapses.
func waitFor(t *testing.T, timeout time.Duration, msg string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if cond() {
			return
		}
		time.Sleep(2 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for: %s", msg)
}

func TestJobQueue_RunOnce_RemovesItselfAfterExecution(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	q := newTestQueue(ctx)

	done := make(chan struct{})
	q.RunOnce("once_self_cleanup", 5*time.Millisecond, func(ctx context.Context, b *bot.Bot) error {
		close(done)
		return nil
	})

	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("run-once job did not execute")
	}

	// After execution the job is removed from the queue, so Cancel misses it.
	waitFor(t, time.Second, "job removal after execution", func() bool {
		return !q.Cancel("once_self_cleanup")
	})
}

func TestJobQueue_RunOnce_CancelBeforeExecution(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	q := newTestQueue(ctx)

	var executed atomic.Bool
	q.RunOnce("once_cancelled", time.Hour, func(ctx context.Context, b *bot.Bot) error {
		executed.Store(true)
		return nil
	})

	if !q.Cancel("once_cancelled") {
		t.Fatal("expected Cancel to report the job existed")
	}
	if q.Cancel("once_cancelled") {
		t.Fatal("second Cancel should report the job as gone")
	}

	time.Sleep(10 * time.Millisecond)
	if executed.Load() {
		t.Error("cancelled job must not execute")
	}
}

func TestJobQueue_Cancel_UnknownID(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if newTestQueue(ctx).Cancel("does_not_exist") {
		t.Error("Cancel of an unknown job must return false")
	}
}

func TestJobQueue_RunRepeating(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	q := newTestQueue(ctx)

	var count atomic.Int64
	q.RunRepeating("repeat", 5*time.Millisecond, func(ctx context.Context, b *bot.Bot) error {
		count.Add(1)
		return nil
	})

	waitFor(t, time.Second, "at least 3 executions", func() bool {
		return count.Load() >= 3
	})

	if !q.Cancel("repeat") {
		t.Fatal("expected Cancel to stop the repeating job")
	}

	atCancel := count.Load()
	time.Sleep(30 * time.Millisecond)
	if got := count.Load(); got != atCancel {
		t.Errorf("job kept running after cancel: %d -> %d", atCancel, got)
	}
}

func TestJobQueue_RunRepeating_StopsOnRootContextCancel(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	q := newTestQueue(ctx)

	var executed atomic.Bool
	q.RunRepeating("repeat_root_cancel", 5*time.Millisecond, func(ctx context.Context, b *bot.Bot) error {
		executed.Store(true)
		return nil
	})

	cancel() // terminate all jobs through the root context
	time.Sleep(30 * time.Millisecond)

	if executed.Load() {
		t.Error("job must not execute after the root context is cancelled")
	}
}

func TestJobQueue_RunRRule(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	q := newTestQueue(ctx)

	var count atomic.Int64
	rule := rrule.New(rrule.Options{
		Freq:    rrule.Secondly,
		Dtstart: time.Now().Add(20 * time.Millisecond),
		Count:   1,
	})

	q.RunRRule("rrule_job", rule, func(ctx context.Context, b *bot.Bot) error {
		count.Add(1)
		return nil
	})

	waitFor(t, 2*time.Second, "rrule job execution", func() bool {
		return count.Load() == 1
	})

	// Count is exhausted, so the scheduler loop exits and no further runs occur.
	time.Sleep(50 * time.Millisecond)
	if got := count.Load(); got != 1 {
		t.Errorf("expected exactly 1 execution for exhausted rrule, got %d", got)
	}
}

func TestJobQueue_RunRRule_ExhaustedRuleExitsImmediately(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	q := newTestQueue(ctx)

	past := time.Now().Add(-time.Hour)
	rule := rrule.New(rrule.Options{
		Freq:    rrule.Daily,
		Dtstart: past,
		Until:   &past,
	})

	var executed atomic.Bool
	q.RunRRule("rrule_done", rule, func(ctx context.Context, b *bot.Bot) error {
		executed.Store(true)
		return nil
	})

	time.Sleep(20 * time.Millisecond)
	if executed.Load() {
		t.Error("rule with no future occurrences must never execute")
	}
}

func TestJobQueue_RunRRule_StopsOnCancel(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	q := newTestQueue(ctx)

	rule := rrule.New(rrule.Options{
		Freq:     rrule.Secondly,
		Interval: 10,
		Dtstart:  time.Now(),
	})

	var executed atomic.Bool
	q.RunRRule("rrule_cancel", rule, func(ctx context.Context, b *bot.Bot) error {
		executed.Store(true)
		return nil
	})

	if !q.Cancel("rrule_cancel") {
		t.Fatal("expected Cancel to find the rrule job")
	}
	time.Sleep(20 * time.Millisecond)
	if executed.Load() {
		t.Error("cancelled rrule job must not execute")
	}
}
