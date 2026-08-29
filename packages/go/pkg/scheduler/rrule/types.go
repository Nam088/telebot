package rrule

import "time"

// Frequency defines the recurrence frequency.
type Frequency int

const (
	Secondly Frequency = iota
	Minutely
	Hourly
	Daily
	Weekly
	Monthly
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
