package scheduler_test

import (
	"context"
	"sync/atomic"
	"testing"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/scheduler"
)

func TestJobQueue_RunOnce(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	b := bot.NewBot("fake_token")
	q := scheduler.NewJobQueue(ctx, b)

	var executed atomic.Bool
	q.RunOnce("test_once", 10*time.Millisecond, func(jobCtx context.Context, b *bot.Bot) error {
		executed.Store(true)
		return nil
	})

	time.Sleep(30 * time.Millisecond)

	if !executed.Load() {
		t.Errorf("expected job to execute once")
	}
}
