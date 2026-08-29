package rrule

import (
	"time"
)

// RRule calculates recurring timestamps based on RFC 5545 recurrence options.
type RRule struct {
	opts Options
}

// New creates a new RRule engine instance.
func New(opts Options) *RRule {
	if opts.Interval < 1 {
		opts.Interval = 1
	}
	if opts.Dtstart.IsZero() {
		opts.Dtstart = time.Now()
	}
	return &RRule{opts: opts}
}

// After finds the next occurrence strictly after or inclusive of the given time.
func (r *RRule) After(after time.Time, inclusive bool) *time.Time {
	curr := r.opts.Dtstart
	count := 0

	for {
		if r.opts.Count > 0 && count >= r.opts.Count {
			return nil
		}
		if r.opts.Until != nil && curr.After(*r.opts.Until) {
			return nil
		}

		if (inclusive && !curr.Before(after)) || (!inclusive && curr.After(after)) {
			res := curr
			return &res
		}

		switch r.opts.Freq {
		case Secondly:
			curr = curr.Add(time.Duration(r.opts.Interval) * time.Second)
		case Minutely:
			curr = curr.Add(time.Duration(r.opts.Interval) * time.Minute)
		case Hourly:
			curr = curr.Add(time.Duration(r.opts.Interval) * time.Hour)
		case Daily:
			curr = curr.AddDate(0, 0, r.opts.Interval)
		case Weekly:
			curr = curr.AddDate(0, 0, 7*r.opts.Interval)
		case Monthly:
			curr = curr.AddDate(0, r.opts.Interval, 0)
		case Yearly:
			curr = curr.AddDate(r.opts.Interval, 0, 0)
		}
		count++

		// Safety cap
		if count > 10000 {
			return nil
		}
	}
}

// Between returns occurrences between two times.
func (r *RRule) Between(after, before time.Time, inclusive bool) []time.Time {
	var occurrences []time.Time
	curr := after

	for {
		next := r.After(curr, inclusive)
		if next == nil || next.After(before) {
			break
		}
		occurrences = append(occurrences, *next)
		curr = *next
		inclusive = false
	}
	return occurrences
}
