package rrule_test

import (
	"testing"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/scheduler/rrule"
)

func TestRRule_Daily(t *testing.T) {
	start := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)
	rule := rrule.New(rrule.Options{
		Freq:     rrule.Daily,
		Interval: 2,
		Dtstart:  start,
	})

	after := time.Date(2026, 1, 2, 0, 0, 0, 0, time.UTC)
	next := rule.After(after, false)
	if next == nil {
		t.Fatalf("expected occurrence, got nil")
	}

	expected := time.Date(2026, 1, 3, 12, 0, 0, 0, time.UTC)
	if !next.Equal(expected) {
		t.Errorf("expected %v, got %v", expected, next)
	}
}
