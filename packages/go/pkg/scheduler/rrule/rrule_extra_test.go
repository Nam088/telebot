package rrule_test

import (
	"testing"
	"time"

	"github.com/Nam088/telebot-go/pkg/scheduler/rrule"
)

func TestRRule_New_DefaultDtstart(t *testing.T) {
	start := time.Now()
	rule := rrule.New(rrule.Options{Freq: rrule.Daily})

	next := rule.After(start.Add(-2*time.Second), false)
	if next == nil {
		t.Fatal("expected an occurrence when Dtstart defaults to now")
	}
	if next.Before(start.Add(-time.Second)) || next.After(time.Now().Add(2*time.Second)) {
		t.Errorf("default Dtstart should be close to now, got %v", next)
	}
}

func TestRRule_New_IntervalNormalizedToOne(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	rule := rrule.New(rrule.Options{Freq: rrule.Hourly, Interval: 0, Dtstart: start})

	next := rule.After(start, false)
	if next == nil {
		t.Fatal("expected occurrence; interval 0 must be normalized to 1")
	}
	want := start.Add(time.Hour)
	if !next.Equal(want) {
		t.Errorf("expected %v, got %v", want, next)
	}
}

func TestRRule_After_AllFrequencies(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name     string
		freq     rrule.Frequency
		interval int
		after    time.Time
		want     time.Time
	}{
		{"secondly", rrule.Secondly, 3, start.Add(4 * time.Second), start.Add(6 * time.Second)},
		{"minutely", rrule.Minutely, 5, start.Add(6 * time.Minute), start.Add(10 * time.Minute)},
		{"hourly", rrule.Hourly, 2, start.Add(3 * time.Hour), start.Add(4 * time.Hour)},
		{"daily", rrule.Daily, 1, start.Add(12 * time.Hour), start.AddDate(0, 0, 1)},
		{"weekly", rrule.Weekly, 1, start.AddDate(0, 0, 8), start.AddDate(0, 0, 14)},
		{"monthly", rrule.Monthly, 1, time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC), time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC)},
		{"yearly", rrule.Yearly, 1, time.Date(2027, 3, 1, 0, 0, 0, 0, time.UTC), time.Date(2028, 1, 1, 0, 0, 0, 0, time.UTC)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rule := rrule.New(rrule.Options{Freq: tt.freq, Interval: tt.interval, Dtstart: start})
			next := rule.After(tt.after, false)
			if next == nil {
				t.Fatalf("expected occurrence after %v", tt.after)
			}
			if !next.Equal(tt.want) {
				t.Errorf("after %v: expected %v, got %v", tt.after, tt.want, next)
			}
		})
	}
}

func TestRRule_After_Inclusive(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	rule := rrule.New(rrule.Options{Freq: rrule.Daily, Dtstart: start})

	next := rule.After(start, true)
	if next == nil || !next.Equal(start) {
		t.Fatalf("inclusive After should return dtstart itself, got %v", next)
	}

	exclusive := rule.After(start, false)
	if exclusive == nil || !exclusive.Equal(start.AddDate(0, 0, 1)) {
		t.Fatalf("exclusive After should skip dtstart, got %v", exclusive)
	}
}

func TestRRule_After_CountExhausted(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	rule := rrule.New(rrule.Options{Freq: rrule.Daily, Dtstart: start, Count: 2})

	if next := rule.After(start.AddDate(0, 0, 10), false); next != nil {
		t.Errorf("expected nil once Count is exhausted, got %v", next)
	}
}

func TestRRule_After_UntilBoundary(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	until := start.AddDate(0, 0, 2)
	rule := rrule.New(rrule.Options{Freq: rrule.Daily, Dtstart: start, Until: &until})

	// The occurrence exactly at Until is still valid.
	next := rule.After(start.AddDate(0, 0, 1), false)
	if next == nil || !next.Equal(until) {
		t.Fatalf("expected occurrence at Until boundary, got %v", next)
	}

	// Anything beyond Until yields nil.
	if later := rule.After(until, false); later != nil {
		t.Errorf("expected nil after Until, got %v", later)
	}
}

func TestRRule_After_UnknownFrequencyHitsSafetyCap(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	rule := rrule.New(rrule.Options{Freq: rrule.Frequency(99), Dtstart: start})

	if next := rule.After(start.Add(time.Second), false); next != nil {
		t.Errorf("expected nil from safety cap for unknown frequency, got %v", next)
	}
}

func TestRRule_Between_Inclusive(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	rule := rrule.New(rrule.Options{Freq: rrule.Daily, Dtstart: start})

	got := rule.Between(start, start.AddDate(0, 0, 3), true)
	if len(got) != 4 {
		t.Fatalf("expected 4 occurrences (inclusive), got %d: %v", len(got), got)
	}
	for i, occ := range got {
		want := start.AddDate(0, 0, i)
		if !occ.Equal(want) {
			t.Errorf("occurrence %d: expected %v, got %v", i, want, occ)
		}
	}
}

func TestRRule_Between_Exclusive(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	rule := rrule.New(rrule.Options{Freq: rrule.Daily, Dtstart: start})

	got := rule.Between(start, start.AddDate(0, 0, 2), false)
	if len(got) != 2 {
		t.Fatalf("expected 2 occurrences (exclusive start), got %d: %v", len(got), got)
	}
	if !got[0].Equal(start.AddDate(0, 0, 1)) {
		t.Errorf("first occurrence should be %v, got %v", start.AddDate(0, 0, 1), got[0])
	}
}

func TestRRule_Between_NoOccurrences(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	until := start.AddDate(0, 0, 1)
	rule := rrule.New(rrule.Options{Freq: rrule.Daily, Dtstart: start, Until: &until})

	got := rule.Between(start.AddDate(1, 0, 0), start.AddDate(2, 0, 0), true)
	if len(got) != 0 {
		t.Errorf("expected no occurrences, got %v", got)
	}
}
