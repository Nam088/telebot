package rrule

import "time"

// Frequency defines the recurrence frequency.
type Frequency int

const (
	// Secondly indicates recurrence every second.
	Secondly Frequency = iota
	// Minutely indicates recurrence every minute.
	Minutely
	// Hourly indicates recurrence every hour.
	Hourly
	// Daily indicates recurrence every day.
	Daily
	// Weekly indicates recurrence every week.
	Weekly
	// Monthly indicates recurrence every month.
	Monthly
	// Yearly indicates recurrence every year.
	Yearly
)

// Options holds parameters for RFC 5545 recurrence rules.
type Options struct {
	Freq     Frequency
	Interval int
	Dtstart  time.Time
	Until    *time.Time
	Count    int
	ByHour   []int
	ByMinute []int
	BySecond []int
}
